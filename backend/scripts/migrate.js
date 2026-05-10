import { createHash } from 'crypto';
import { existsSync, readdirSync, readFileSync } from 'fs';
import { join, resolve } from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import 'dotenv/config';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

// ── helpers ────────────────────────────────────────────────────────────────
function logBanner(text) {
  const line = '─'.repeat(60);
  console.log(`\n${line}`);
  console.log(`  ${text}`);
  console.log(`${line}\n`);
}

function logStep(step, detail = '') {
  const ts = new Date().toISOString();
  console.log(`[${ts}] ▶ ${step}${detail ? ' | ' + detail : ''}`);
}

function logSuccess(msg) {
  console.log(`  ✅ ${msg}`);
}

function logWarn(msg) {
  console.log(`  ⚠️  ${msg}`);
}

function logError(msg) {
  console.log(`  ❌ ${msg}`);
}

function logInfo(msg) {
  console.log(`  ℹ️  ${msg}`);
}

function sha256(content) {
  return createHash('sha256').update(content).digest('hex');
}

function maskDbUrl(url) {
  if (!url) return '(not set)';
  try {
    const u = new URL(url);
    return `${u.protocol}//${u.username}:****@${u.host}${u.pathname}`;
  } catch {
    return url.replace(/:([^@]+)@/, ':****@');
  }
}

function placeholders(count) {
  return Array(count).fill('?').join(',');
}

// ── main ───────────────────────────────────────────────────────────────────
async function main() {
  logBanner('DATABASE MIGRATION CHECK');

  // 1. env check
  logStep('ENV CHECK');
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    logError('DATABASE_URL is not set in backend/.env');
    process.exit(1);
  }
  logSuccess(`DATABASE_URL = ${maskDbUrl(dbUrl)}`);

  // 2. connect (create database if needed)
  logStep('CONNECTING TO DATABASE');
  let connection;
  try {
    connection = await mysql.createConnection({ uri: dbUrl });
    const [rows] = await connection.execute('SELECT 1 as ok');
    if (rows[0].ok === 1) logSuccess('Database connection OK');
  } catch (err) {
    if (err.code === 'ER_BAD_DB_ERROR') {
      logInfo(`Database not found, creating...`);
      const dbUrlObj = new URL(dbUrl);
      const dbName = dbUrlObj.pathname.slice(1);
      dbUrlObj.pathname = '';
      const baseUrl = dbUrlObj.toString();

      const tempConn = await mysql.createConnection({ uri: baseUrl });
      await tempConn.execute(`CREATE DATABASE \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
      await tempConn.end();
      logSuccess(`Database '${dbName}' created`);

      connection = await mysql.createConnection({ uri: dbUrl });
      logSuccess('Database connection OK');
    } else {
      logError(`Database connection failed: ${err.message}`);
      process.exit(1);
    }
  }

  // 3. ensure _migrations table exists
  logStep('ENSURING _migrations TABLE');
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      filename VARCHAR(255) NOT NULL UNIQUE,
      checksum VARCHAR(64) NOT NULL,
      applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
  logSuccess('_migrations table ready');

  // 4. load local migration files
  const migrationsDir = resolve(__dirname, '../migrations');
  let localMigrations = [];
  if (existsSync(migrationsDir)) {
    const entries = readdirSync(migrationsDir, { withFileTypes: true });
    const sqlFiles = entries
      .filter(e => e.isFile() && e.name.endsWith('.sql'))
      .map(e => e.name)
      .sort();
    for (const filename of sqlFiles) {
      const sql = readFileSync(join(migrationsDir, filename), 'utf8');
      localMigrations.push({ filename, sql, checksum: sha256(sql) });
    }
    logSuccess(`Found ${localMigrations.length} local migration file(s)`);
  } else {
    logWarn(`No migrations directory at ${migrationsDir}`);
  }

  // 5. load applied migrations from DB
  logStep('LOADING APPLIED MIGRATIONS');
  const [appliedRows] = await connection.execute('SELECT filename, checksum FROM _migrations ORDER BY id ASC');
  const appliedMap = new Map(appliedRows.map(r => [r.filename, r.checksum]));
  logSuccess(`${appliedRows.length} migration(s) already applied`);

  // 6. verify checksums of already-applied migrations
  logStep('CHECKSUM VERIFICATION');
  let checksumOk = true;
  for (const [filename, dbChecksum] of appliedMap) {
    const local = localMigrations.find(m => m.filename === filename);
    if (!local) {
      logWarn(`Migration ${filename} is applied in DB but missing locally`);
      checksumOk = false;
    } else if (local.checksum !== dbChecksum) {
      logError(`CHECKSUM MISMATCH for ${filename}`);
      logInfo(`  DB:     ${dbChecksum}`);
      logInfo(`  Local:  ${local.checksum}`);
      checksumOk = false;
    } else {
      logSuccess(`${filename} checksum OK`);
    }
  }
  if (!checksumOk) {
    logError('Checksum verification failed. Aborting.');
    process.exit(1);
  }

  // 7. find pending migrations
  const appliedNames = new Set(appliedMap.keys());
  const pending = localMigrations.filter(m => !appliedNames.has(m.filename));

  if (pending.length === 0) {
    logSuccess('No pending migrations – database is in sync');
  } else {
    logBanner(`DEPLOYING ${pending.length} PENDING MIGRATION(S)`);
    for (const m of pending) {
      logStep('RUNNING', m.filename);
      logInfo(`Checksum: ${m.checksum}`);
      try {
        await connection.beginTransaction();
        for (const stmt of m.sql.split(';').map(s => s.trim()).filter(Boolean)) {
          logInfo(`  SQL: ${stmt.substring(0, 80)}${stmt.length > 80 ? '...' : ''}`);
          await connection.query(stmt);
        }
        await connection.execute(
          'INSERT INTO _migrations (filename, checksum) VALUES (?, ?)',
          [m.filename, m.checksum]
        );
        await connection.commit();
        logSuccess(`${m.filename} applied`);
      } catch (err) {
        await connection.rollback();
        logError(`${m.filename} failed: ${err.message}`);
        process.exit(1);
      }
    }
  }

  await connection.end();
  logBanner('MIGRATION CHECK COMPLETE');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

import mysql from 'mysql2/promise';
import { createHash } from 'crypto';
import { readFileSync } from 'fs';
import 'dotenv/config';

const conn = await mysql.createConnection({ uri: process.env.DATABASE_URL });
const sql = readFileSync('migrations/001_initial_schema.sql', 'utf8');
const checksum = createHash('sha256').update(sql).digest('hex');
await conn.execute('INSERT INTO _migrations (filename, checksum) VALUES (?, ?)', ['001_initial_schema.sql', checksum]);
console.log('Migration marked as applied');
await conn.end();

import mysql from 'mysql2/promise';

let pool;

export function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      uri: process.env.DATABASE_URL,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
    });
  }
  return pool;
}

export async function query(sql, params) {
  const [rows] = await getPool().execute(sql, params);
  return rows;
}

export async function getOne(sql, params) {
  const rows = await query(sql, params);
  return rows[0] || null;
}

export async function getMany(sql, params) {
  return query(sql, params);
}

export async function run(sql, params) {
  const [result] = await getPool().execute(sql, params);
  return result;
}

export async function insert(sql, params) {
  const result = await run(sql, params);
  return result.insertId;
}

export function placeholders(count) {
  return Array(count).fill('?').join(',');
}

export async function transaction(callback) {
  const connection = await getPool().getConnection();
  await connection.beginTransaction();
  try {
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

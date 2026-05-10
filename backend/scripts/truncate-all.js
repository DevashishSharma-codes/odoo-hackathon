import mysql from 'mysql2/promise';
import 'dotenv/config';

const conn = await mysql.createConnection({ uri: process.env.DATABASE_URL });

// Disable foreign key checks, truncate all tables, re-enable
const tables = [
  'admin_logs',
  'notes',
  'packing_items',
  'stop_activities',
  'budgets',
  'stops',
  'shared_trips',
  'saved_destinations',
  'trips',
  'activities',
  'cities',
  'users',
];

await conn.execute('SET FOREIGN_KEY_CHECKS = 0');
for (const table of tables) {
  try {
    await conn.execute(`TRUNCATE TABLE ${table}`);
    console.log(`✅ Truncated ${table}`);
  } catch (err) {
    if (err.code === 'ER_NO_SUCH_TABLE') {
      console.log(`⚠️  Table ${table} does not exist`);
    } else {
      throw err;
    }
  }
}
await conn.execute('SET FOREIGN_KEY_CHECKS = 1');

console.log('\n✅ All tables truncated');
await conn.end();

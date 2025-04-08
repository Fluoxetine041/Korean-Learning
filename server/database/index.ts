import { Pool } from 'pg';
import { serverSupabaseServiceRole } from '#supabase/server';

// Database connection pool
const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  database: process.env.POSTGRES_DB || 'english_learning_app',
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
});

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err.stack);
  } else {
    console.log('Database connected successfully');
  }
});

// Helper function for executing queries
export async function query(text: string, params?: any[]) {
  try {
    const start = Date.now();
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (err) {
    console.error('Error executing query', err);
    throw err;
  }
}

// Helper for getting a single row
export async function getOne(text: string, params?: any[]) {
  const res = await query(text, params);
  return res.rows[0];
}

// Helper for getting multiple rows
export async function getMany(text: string, params?: any[]) {
  const res = await query(text, params);
  return res.rows;
}

export default {
  query,
  getOne,
  getMany,
  pool,
}; 
const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/ersa_mantenimiento';

const pool = new Pool({
  connectionString,
  ssl: process.env.NODE_ENV === 'production' || connectionString.includes('supabase')
    ? { rejectUnauthorized: false }
    : false
});

pool.on('connect', () => {
  console.log('✅ Conectado a la base de datos PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ Error de conexión en el Pool de PostgreSQL:', err);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};

const { Pool } = require('pg');

const pool = new Pool({
  user: 'babyfoot_manager',
  host: 'localhost',
  database: 'babyfoot',
  password: 'password',
  port: 5432,
});

module.exports = pool;

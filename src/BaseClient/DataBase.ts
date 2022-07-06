/* eslint-disable no-console */
import pgPKG from 'pg';
import auth from './auth.json' assert { type: 'json' };

const { Pool } = pgPKG;

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'Clone_DB',
  password: auth.pSQLpw,
  port: 5432,
});

pool.query('SELECT NOW() as now;', (err) => {
  if (err) console.error("| Couldn't connect to DataBase", err.stack);
  else console.log('| Established connection to DataBase');
});

pool.connect((err) => {
  if (err) console.error('Error while logging into DataBase', err.stack);
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle pool client', err);
});

export default pool;

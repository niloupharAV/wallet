import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
    host: 'localhost',
    port: 5432,
    user: 'wallet_user',
    password: 'wallet_pass',
    database: 'wallet_db',
});
export let client;
export async function connectToDb(){
    client = await pool.connect();
}


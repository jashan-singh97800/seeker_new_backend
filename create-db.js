const mysql = require('mysql2/promise');
require('dotenv').config();

async function createDb() {
    const connection = await mysql.createConnection({
        host: process.env.DATABASE_HOST,
        user: process.env.DATABASE_USERNAME,
        password: process.env.DATABASE_PASSWORD,
    });

    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DATABASE_NAME}\`;`);
    console.log(`Database ${process.env.DATABASE_NAME} created or already exists.`);
    await connection.end();
}

createDb().catch(console.error);

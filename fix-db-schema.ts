import { Sequelize } from 'sequelize-typescript';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '.env') });

async function fixSchema() {
    const sequelize = new Sequelize({
        dialect: 'mysql',
        host: process.env.DATABASE_HOST,
        port: Number(process.env.DATABASE_PORT),
        username: process.env.DATABASE_USERNAME,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_NAME,
    });

    try {
        console.log('Connecting to database...');
        await sequelize.authenticate();
        console.log('Connected successfully.');

        console.log('Checking for resume_key column...');
        const [results] = await sequelize.query("SHOW COLUMNS FROM user_profiles LIKE 'resume_key'");

        if (results.length === 0) {
            console.log('resume_key column missing. Adding it...');
            await sequelize.query("ALTER TABLE user_profiles ADD COLUMN resume_key VARCHAR(255) AFTER resume_url");
            console.log('Column added successfully.');
        } else {
            console.log('resume_key column already exists.');
        }

        // Also check for resume_url just in case
        const [urlResults] = await sequelize.query("SHOW COLUMNS FROM user_profiles LIKE 'resume_url'");
        if (urlResults.length === 0) {
            console.log('resume_url column missing. Adding it...');
            await sequelize.query("ALTER TABLE user_profiles ADD COLUMN resume_url VARCHAR(500) AFTER expected_salary");
            console.log('Column added successfully.');
        }

    } catch (error) {
        console.error('Error fixing schema:', error);
    } finally {
        await sequelize.close();
    }
}

fixSchema();

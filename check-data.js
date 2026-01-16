
const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');
dotenv.config();

const sequelize = new Sequelize(
    process.env.DATABASE_NAME,
    process.env.DATABASE_USERNAME,
    process.env.DATABASE_PASSWORD,
    {
        host: process.env.DATABASE_HOST,
        port: process.env.DATABASE_PORT,
        dialect: 'mysql',
        logging: false
    }
);

async function checkData() {
    try {
        console.log('--- USERS ---');
        const [users] = await sequelize.query("SELECT id, email, role, createdAt FROM users ORDER BY id DESC LIMIT 5");
        console.table(users);

        console.log('\n--- JOBS ---');
        const [jobs] = await sequelize.query("SELECT id, title, company_id, status FROM jobs ORDER BY id DESC LIMIT 5");
        console.table(jobs);

        console.log('\n--- APPLICATIONS ---');
        const [applications] = await sequelize.query("SELECT id, user_id, job_id, status, createdAt FROM applications ORDER BY id DESC LIMIT 5");
        console.table(applications);

        await sequelize.close();
    } catch (error) {
        console.error('Error querying database:', error);
    }
}

checkData();

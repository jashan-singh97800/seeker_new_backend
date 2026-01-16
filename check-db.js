const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
    process.env.DATABASE_NAME,
    process.env.DATABASE_USERNAME,
    process.env.DATABASE_PASSWORD,
    {
        host: process.env.DATABASE_HOST,
        dialect: 'mysql',
        port: process.env.DATABASE_PORT,
        logging: false,
    }
);

async function checkData() {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');

        const [applications] = await sequelize.query('SELECT * FROM applications');
        console.log('Applications:', JSON.stringify(applications, null, 2));

        const [users] = await sequelize.query('SELECT * FROM users');
        console.log('Users:', JSON.stringify(users, null, 2));

        const [profiles] = await sequelize.query('SELECT * FROM user_profiles');
        console.log('Profiles:', JSON.stringify(profiles, null, 2));

        const [jobs] = await sequelize.query('SELECT * FROM jobs');
        console.log('Jobs:', JSON.stringify(jobs, null, 2));

    } catch (error) {
        console.error('Unable to connect to the database:', error);
    } finally {
        await sequelize.close();
    }
}

checkData();

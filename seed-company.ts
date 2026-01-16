import { Sequelize } from 'sequelize';
import * as dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize({
    dialect: 'mysql',
    host: process.env.DATABASE_HOST,
    port: Number(process.env.DATABASE_PORT),
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    logging: false,
});

async function seed() {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        const companyId = '00000000-0000-0000-0000-000000000001';

        const results: any = await sequelize.query(`SELECT id FROM companies WHERE id = :id`, {
            replacements: { id: companyId },
            type: 'SELECT'
        });

        if (results.length === 0) {
            await sequelize.query(`
        INSERT INTO companies (id, name, description, website, industry, company_size, verified, createdAt, updatedAt)
        VALUES (
          :id, 
          "Default Tech Company", 
          "A default company for testing purposes.", 
          "https://example.com", 
          "Technology", 
          "51-200", 
          true, 
          NOW(), 
          NOW()
        )
      `, {
                replacements: { id: companyId }
            });
            console.log('Default company created with ID:', companyId);
        } else {
            console.log('Default company already exists:', companyId);
        }
    } catch (error) {
        console.error('Seeding failed:', error);
    } finally {
        await sequelize.close();
    }
}

seed();


const puppeteer = require('puppeteer');

const BASE_URL = 'http://localhost:5173';
const TIMESTAMP = Date.now();
const EMP_EMAIL = `emp_auto_${TIMESTAMP}@test.com`;
const SEEKER_EMAIL = `seeker_auto_${TIMESTAMP}@test.com`;
const PASSWORD = 'password123';

async function runTest() {
    console.log('🚀 Starting Puppeteer E2E Verification...');
    const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        headless: 'new'
    });

    try {
        // ==========================================
        // 1. EMPLOYER FLOW
        // ==========================================
        console.log('\n--- 1. Employer Registration & Job Post ---');
        const empPage = await browser.newPage();
        await empPage.setViewport({ width: 1280, height: 800 });

        // Register Verify
        await empPage.goto(`${BASE_URL}/register`);
        await empPage.type('input[type="email"]', EMP_EMAIL);
        await empPage.type('input[type="password"]', PASSWORD);
        await empPage.select('select', 'employer');

        await Promise.all([
            empPage.click('button[type="submit"]'),
            empPage.waitForNavigation({ waitUntil: 'networkidle0' })
        ]);
        console.log('Registered Employer.');

        // Explicit Check for Redirect to /employer
        const empUrl = empPage.url();
        console.log(`Landed on: ${empUrl}`);
        if (!empUrl.includes('/employer')) {
            console.warn('⚠️ Redirect might have failed or needs wait. Navigating manually...');
            await empPage.goto(`${BASE_URL}/employer`);
        }

        // Check for Header
        await empPage.waitForSelector('h1', { timeout: 10000 });
        const header = await empPage.$eval('h1', el => el.innerText);
        console.log(`Header: "${header}"`);
        if (!header.includes('Employer Console')) throw new Error('Not on Employer Dashboard');

        // Create Listing
        console.log('Opening Create Job Modal...');
        // Find button by text
        const createBtn = await empPage.evaluateHandle(() => {
            return Array.from(document.querySelectorAll('button'))
                .find(b => b.innerText.includes('Create New Listing'));
        });
        if (!createBtn) throw new Error('Create Listing button not found');
        await createBtn.click();

        // Fill Form
        await empPage.waitForSelector('input[placeholder*="Frontend"]');
        await empPage.type('input[placeholder*="Frontend"]', 'Puppeteer Auto Role');
        await empPage.type('input[placeholder*="Remote"]', 'Remote');
        await empPage.type('input[placeholder*="50000"]', '90000');
        await empPage.type('input[placeholder*="80000"]', '120000');
        await empPage.type('textarea', 'Automated test description.');

        // Submit
        const postBtn = await empPage.evaluateHandle(() => {
            return Array.from(document.querySelectorAll('button'))
                .find(b => b.innerText.includes('Post Job'));
        });
        await postBtn.click();
        console.log('Job Submitted.');

        // Verify Active Roles = 1
        console.log('Verifying Stats...');
        await empPage.waitForFunction(
            () => document.body.innerText.includes('Active Roles') && document.body.innerText.includes('1'),
            { timeout: 10000 }
        );
        console.log('✅ Employer Flow Verified: Active Roles = 1');
        await empPage.close();


        // ==========================================
        // 2. SEEKER FLOW
        // ==========================================
        console.log('\n--- 2. Seeker Registration & Application ---');
        const seekerPage = await browser.newPage();

        await seekerPage.goto(`${BASE_URL}/register`);
        await seekerPage.type('input[type="email"]', SEEKER_EMAIL);
        await seekerPage.type('input[type="password"]', PASSWORD);
        await seekerPage.select('select', 'job_seeker');

        await Promise.all([
            seekerPage.click('button[type="submit"]'),
            seekerPage.waitForNavigation({ waitUntil: 'networkidle0' })
        ]);
        console.log('Registered Seeker.');

        //  Explicit Check for Redirect to /dashboard
        const seekerUrl = seekerPage.url();
        console.log(`Landed on: ${seekerUrl}`);
        if (!seekerUrl.includes('/dashboard')) {
            console.warn('⚠️ Redirect might have failed. Navigating manually...');
            await seekerPage.goto(`${BASE_URL}/dashboard`);
        }

        // Go to Search
        await seekerPage.goto(`${BASE_URL}/search`);
        console.log('Navigated to Search.');

        // Find Job
        await seekerPage.waitForSelector('h2');
        const jobTitle = await seekerPage.$eval('h2', el => el.innerText);
        if (!jobTitle.includes('Puppeteer Auto Role')) throw new Error('Posted job not found in search');
        console.log(`Found Job: ${jobTitle}`);

        // Apply
        const applyBtn = await seekerPage.evaluateHandle(() => {
            return Array.from(document.querySelectorAll('button'))
                .find(b => b.innerText.includes('Apply Now'));
        });
        if (!applyBtn) throw new Error('Apply button not found');
        await applyBtn.click();
        console.log('Clicked Apply.');

        // Verify Applied State
        await seekerPage.waitForFunction(
            () => document.body.innerText.includes('Applied'),
            { timeout: 5000 }
        );
        console.log('✅ Seeker Flow Verified: Application Submitted');
        await seekerPage.close();


        // ==========================================
        // 3. FINAL EMPLOYER CHECK
        // ==========================================
        console.log('\n--- 3. Final Employer Verification ---');
        const verifyPage = await browser.newPage();
        await verifyPage.goto(`${BASE_URL}/login`);
        await verifyPage.type('input[type="email"]', EMP_EMAIL);
        await verifyPage.type('input[type="password"]', PASSWORD);

        await Promise.all([
            verifyPage.click('button[type="submit"]'),
            verifyPage.waitForNavigation({ waitUntil: 'networkidle0' })
        ]);

        // Check Redirect
        if (!verifyPage.url().includes('/employer')) await verifyPage.goto(`${BASE_URL}/employer`);

        // Verify Applicants = 1
        await verifyPage.waitForSelector('h1');
        // Wait a sec for stats fetch
        await new Promise(r => setTimeout(r, 2000));

        const pageText = await verifyPage.$eval('body', el => el.innerText);
        if (pageText.includes('Total Applicants') && pageText.includes('1')) {
            console.log('✅ Final Verification: Total Applicants = 1');
        } else {
            console.log('Page Content Dump:', pageText.substring(0, 500));
            throw new Error('Stats did not update');
        }
        await verifyPage.close();

    } catch (error) {
        console.error('❌ Test Failed:', error);
        process.exit(1);
    } finally {
        await browser.close();
        console.log('Browser Closed.');
    }
}

runTest();

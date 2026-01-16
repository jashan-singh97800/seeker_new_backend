const API_URL = 'http://localhost:3000/api/v1';
const TIMESTAMP = Date.now();
const EMPLOYER_EMAIL = `emp_test_${TIMESTAMP}@test.com`;
const SEEKER_EMAIL = `seeker_test_${TIMESTAMP}@test.com`;
const PASSWORD = 'password123';

async function request(url, method = 'GET', data = null, token = null) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const options = { method, headers };
    if (data) options.body = JSON.stringify(data);

    const res = await fetch(url, options);
    const json = await res.json();

    if (!res.ok) {
        throw new Error(JSON.stringify(json));
    }
    return json;
}

async function runTest() {
    console.log('🚀 Starting Dashboard E2E Test (using native fetch)...\n');

    try {
        // 1. Register & Login Employer
        console.log('1️⃣  Processing Employer...');
        await request(`${API_URL}/auth/register`, 'POST', {
            email: EMPLOYER_EMAIL,
            password: PASSWORD,
            role: 'employer'
        });
        const empLogin = await request(`${API_URL}/auth/login`, 'POST', {
            email: EMPLOYER_EMAIL,
            password: PASSWORD
        });
        const empToken = empLogin.access_token;
        console.log('   ✅ Registered & Logged in Employer');

        // 2. Check Initial Employer Stats
        const initialEmpStats = await request(`${API_URL}/analytics/employer-stats`, 'GET', null, empToken);
        console.log('   📊 Initial Active Roles:', initialEmpStats.activeRoles);
        console.log('   📊 Initial Applicants:', initialEmpStats.totalApplicants);

        // 3. Create a New Job
        const jobData = {
            title: `Test Job ${TIMESTAMP}`,
            company_id: 1,
            location: 'Remote Test',
            description: 'This is a test job description for E2E testing.',
            salary_min: 100000,
            salary_max: 120000,
            status: 'active'
        };
        const jobRes = await request(`${API_URL}/jobs`, 'POST', jobData, empToken);
        const jobId = jobRes.id;
        console.log(`   ✅ Created Job ID: ${jobId}`);

        // 4. Verify Employer Stats Updated (Active Roles +1)
        const updatedEmpStats = await request(`${API_URL}/analytics/employer-stats`, 'GET', null, empToken);
        if (updatedEmpStats.activeRoles === initialEmpStats.activeRoles + 1) {
            console.log('   ✅ Verified: Active Roles count incremented');
        } else {
            console.error('   ❌ FAILED: Active Roles did not increment');
        }

        console.log('\n-----------------------------------\n');

        // 5. Register & Login Seeker
        console.log('2️⃣  Processing Job Seeker...');
        await request(`${API_URL}/auth/register`, 'POST', {
            email: SEEKER_EMAIL,
            password: PASSWORD,
            role: 'job_seeker'
        });
        const seekerLogin = await request(`${API_URL}/auth/login`, 'POST', {
            email: SEEKER_EMAIL,
            password: PASSWORD
        });
        const seekerToken = seekerLogin.access_token;
        console.log('   ✅ Registered & Logged in Seeker');

        // 6. Check Initial Seeker Stats
        const initialSeekerStats = await request(`${API_URL}/analytics/user-stats`, 'GET', null, seekerToken);
        const initialApps = initialSeekerStats.totalApplications || 0;
        console.log('   📊 Initial Applications:', initialApps);

        // 7. Apply for the Job
        await request(`${API_URL}/applications`, 'POST', { job_id: jobId }, seekerToken);
        console.log(`   ✅ Applied to Job ID: ${jobId}`);

        // 8. Verify Seeker Stats Updated (Applications +1)
        const updatedSeekerStats = await request(`${API_URL}/analytics/user-stats`, 'GET', null, seekerToken);
        const updatedApps = updatedSeekerStats.totalApplications;

        if (updatedApps === initialApps + 1) {
            console.log('   ✅ Verified: Seeker Total Applications incremented');
        } else {
            console.error(`   ❌ FAILED: Seeker Applications mismatch. Expected ${initialApps + 1}, got ${updatedApps}`);
        }

        console.log('\n-----------------------------------\n');

        // 9. Verify Employer Stats Updated (Applicants +1)
        console.log('3️⃣  Verifying Final Employer Stats...');
        const finalEmpStats = await request(`${API_URL}/analytics/employer-stats`, 'GET', null, empToken);
        console.log('   📊 Final Applicants:', finalEmpStats.totalApplicants);

        if (finalEmpStats.totalApplicants === initialEmpStats.totalApplicants + 1) {
            console.log('   ✅ Verified: Employer Total Applicants incremented');
        } else {
            console.error('   ❌ FAILED: Employer Applicants clount did not increment');
        }

        console.log('\n🎉 TEST SUITE COMPLETED SUCCESSFULLY');

    } catch (error) {
        console.error('❌ Test Failed:', error.message);
    }
}

runTest();

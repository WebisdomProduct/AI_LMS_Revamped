// No require needed for Node 18+ (User has Node 22)
// const fetch = require('node-fetch'); 

const API_URL = 'http://localhost:3000/api';

async function testAPI() {
    console.log('--- Starting API Verification ---');

    // 1. Test Login
    console.log('1. Testing Login...');
    try {
        const loginRes = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'teacher@demo.com', password: 'password' })
        });

        if (!loginRes.ok) {
            console.error('Login Failed:', await loginRes.text());
            return;
        }
        const loginData = await loginRes.json();
        console.log('   Login Success. User:', loginData.user.full_name);
    } catch (e) {
        console.error('   Login Error:', e.message);
        return;
    }

    // 2. Test Lesson Generation (AI Mock)
    console.log('\n2. Testing Lesson Generation...');
    try {
        const genRes = await fetch(`${API_URL}/ai/lesson-plan`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ grade: '10', subject: 'Science', topic: 'Test Gravity' })
        });
        const genData = await genRes.json();

        if (genData.content && genData.content.length > 0) {
            console.log('   Generation Success. Content length:', genData.content.length);
        } else {
            console.error('   Generation Failed. Response:', genData);
        }
    } catch (e) {
        console.error('   Generation Error:', e.message);
    }

    // 3. Test Create Lesson
    console.log('\n3. Testing Create Lesson...');
    let createData;
    try {
        const createRes = await fetch(`${API_URL}/lessons`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                teacher_id: 'teacher-demo-id',
                title: 'Test Verification Lesson',
                class_name: 'Grade 10',
                grade: '10',
                subject: 'Science',
                topic: 'Gravity Verification',
                content: '<h1>Gravity Verified</h1><p>Test Content</p>',
                status: 'draft'
            })
        });
        createData = await createRes.json();
        console.log('   Create Success. New ID:', createData.id);
    } catch (e) {
        console.error('   Create Error:', e.message);
        return;
    }

    // 4. Test Get Lesson (The Critical Fix)
    console.log(`\n4. Testing Get Lesson (ID: ${createData.id})...`);
    try {
        const getRes = await fetch(`${API_URL}/lessons/${createData.id}`);

        if (getRes.ok) {
            const getData = await getRes.json();
            console.log('   Get Lesson Success!');
            console.log('   Title:', getData.data.title);
            if (getData.data.title === 'Test Verification Lesson') {
                console.log('   Data Integrity: OK');
            } else {
                console.log('   Data Integrity: Mismatch');
            }
        } else {
            console.error('   Get Lesson FAILED:', await getRes.text());
        }
    } catch (e) {
        console.error('   Get Lesson Error:', e.message);
    }

    // 5. Test Delete Lesson
    console.log(`\n5. Testing Delete Lesson (ID: ${createData.id})...`);
    try {
        const delRes = await fetch(`${API_URL}/lessons/${createData.id}`, { method: 'DELETE' });
        if (delRes.ok) {
            console.log('   Delete Success.');
        } else {
            console.error('   Delete Failed:', await delRes.text());
        }
    } catch (e) {
        console.error('   Delete Error:', e.message);
    }

    console.log('\n--- API Verification Complete ---');
}

testAPI().catch(console.error);

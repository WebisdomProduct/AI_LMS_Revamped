// No require needed for Node 18+ (User has Node 22)

const API_URL = 'http://localhost:3000/api';

async function testAPI() {
    console.log('--- Starting Comprehensive Dashboard Verification ---');

    // 1. Dashboard Stats
    console.log('\n1. Testing Dashboard Stats...');
    try {
        const statsRes = await fetch(`${API_URL}/dashboard/stats`);
        const stats = await statsRes.json();
        console.log('   Stats:', JSON.stringify(stats));
        if (stats.totalStudents > 0 && stats.totalLessons >= 0) {
            console.log('   Stats OK');
        } else {
            console.error('   Stats Suspicious (Zero values?)');
        }
    } catch (e) {
        console.error('   Stats Error:', e.message);
    }

    // 2. Students List
    console.log('\n2. Testing Students List...');
    let studentId = '';
    try {
        const studentsRes = await fetch(`${API_URL}/students`);
        const students = await studentsRes.json();
        console.log(`   Fetched ${students.data.length} students.`);
        if (students.data.length > 0) {
            studentId = students.data[0].id;
            console.log(`   Selected Student ID for drill-down: ${studentId}`);
        } else {
            console.error('   No students found to test drill-down.');
        }
    } catch (e) {
        console.error('   Students Error:', e.message);
    }

    // 3. Student Details & Grades
    if (studentId) {
        console.log(`\n3. Testing Student Details (ID: ${studentId})...`);
        try {
            const detailRes = await fetch(`${API_URL}/students/${studentId}`);
            const detail = await detailRes.json();
            console.log('   Student Name:', detail.data.name);

            const gradesRes = await fetch(`${API_URL}/students/${studentId}/grades`);
            const grades = await gradesRes.json();
            console.log(`   Fetched ${grades.data.length} grades for student.`);
        } catch (e) {
            console.error('   Student Detail Error:', e.message);
        }
    }

    // 4. Assessments Cycle
    console.log('\n4. Testing Assessments Cycle...');
    let assessmentId = '';
    try {
        // Create
        const createRes = await fetch(`${API_URL}/assessments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                assessment: {
                    teacher_id: 'teacher-demo-id',
                    title: 'Verification Quiz',
                    subject: 'Science',
                    class_name: 'Grade 10',
                    grade: '10',
                    topic: 'Lab Safety',
                    type: 'Quiz'
                },
                questions: [
                    {
                        question_text: 'What do you wear in a lab?',
                        question_type: 'mcq',
                        options: ['Goggles', 'Sandals', 'Shorts'],
                        correct_answer: 'Goggles',
                        marks: 5
                    }
                ],
                rubric: [{ criteria: 'Safety', points: 5 }]
            })
        });
        const createData = await createRes.json();
        assessmentId = createData.id;
        console.log('   Created Assessment ID:', assessmentId);

        // Fetch List
        const listRes = await fetch(`${API_URL}/assessments`);
        const list = await listRes.json();
        const found = list.data.find(a => a.id === assessmentId);
        if (found) console.log('   Assessment found in list: OK');
        else console.error('   Assessment NOT found in list: FAIL');

        // Fetch Details
        const getRes = await fetch(`${API_URL}/assessments/${assessmentId}`);
        if (getRes.ok) console.log('   Fetch Assessment Details: OK');
        else console.error('   Fetch Assessment Details: FAIL');

        // Fetch Questions
        const qRes = await fetch(`${API_URL}/assessments/${assessmentId}/questions`);
        const qData = await qRes.json();
        console.log(`   Fetched ${qData.data.length} questions.`);

    } catch (e) {
        console.error('   Assessment Error:', e.message);
    }

    console.log('\n--- Verification Complete ---');
}

testAPI().catch(console.error);

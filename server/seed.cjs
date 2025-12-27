const db = require('./db.cjs');
const crypto = require('crypto');

const demoTeacher = {
    id: 'teacher-demo-id',
    email: 'demo@teacher.com',
    password: 'password123',
    full_name: 'Dr. Sarah Jenkins',
    role: 'teacher'
};

const demoStudentUser = {
    id: 'student-demo-user-id',
    email: 'student@gmail.com',
    password: 'student@123',
    full_name: 'Aryan Sharma',
    role: 'student'
};

const subjects = ['Mathematics', 'Science', 'English'];

function seed() {
    console.log('Seeding database...');
    db.serialize(() => {
        // Clear existing data
        db.run("DELETE FROM users");
        db.run("DELETE FROM students");
        db.run("DELETE FROM lessons");
        db.run("DELETE FROM assessments");
        db.run("DELETE FROM questions");
        db.run("DELETE FROM grades");
        db.run("DELETE FROM submissions");
        db.run("DELETE FROM events");

        // Insert Teacher
        db.run(`INSERT INTO users (id, email, password, full_name, role) VALUES (?, ?, ?, ?, ?)`,
            [demoTeacher.id, demoTeacher.email, demoTeacher.password, demoTeacher.full_name, demoTeacher.role]);

        // Insert Student User
        db.run(`INSERT INTO users (id, email, password, full_name, role) VALUES (?, ?, ?, ?, ?)`,
            [demoStudentUser.id, demoStudentUser.email, demoStudentUser.password, demoStudentUser.full_name, demoStudentUser.role]);

        // Insert Student Profile
        db.run(`INSERT INTO students (id, user_id, name, email, grade, class, role) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            ['student-1', demoStudentUser.id, demoStudentUser.full_name, demoStudentUser.email, 'Grade 5', 'Primary', 'student']);

        // Seed 60 Students
        const firstNames = ['James', 'Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'Ethan', 'Sophie', 'Lucas', 'Mia', 'Benjamin', 'Charlotte', 'Mason', 'Amelia', 'Alexander', 'Harper', 'Sebastian', 'Evelyn', 'Jack', 'Abigail'];
        const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'];

        // We start from i=1 because i=0 is Aryan (above)
        for (let i = 1; i < 60; i++) {
            const fName = firstNames[i % firstNames.length];
            const lName = lastNames[Math.floor(i / 3) % lastNames.length];
            const fullName = `${fName} ${lName}`;
            const studentUserId = `user-student-${i + 1}`;
            const studentId = `student-${i + 1}`;
            const email = `${fName.toLowerCase()}.${lName.toLowerCase()}${i}@school.edu`;

            db.run(`INSERT INTO users (id, email, password, full_name, role) VALUES (?, ?, ?, ?, ?)`,
                [studentUserId, email, 'password123', fullName, 'student']);

            db.run(`INSERT INTO students (id, user_id, name, email, grade, class, role) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [studentId, studentUserId, fullName, email, 'Grade 5', 'Primary', 'student']);

            // Mock Grades for these students
            // Just linking to the assessments we are about to create
            // We'll do this in a simplified way here or just let the app handle it?
            // Let's verify assessments first.
        }

        // Seed Lessons
        subjects.forEach(subject => {
            for (let i = 1; i <= 9; i++) {
                const id = crypto.randomUUID();
                db.run(`INSERT INTO lessons (id, teacher_id, title, class_name, grade, subject, topic, content, duration, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [id, demoTeacher.id, `${subject} Unit ${i}`, 'Primary', 'Grade 5', subject, `Topic ${i}`, `Content for ${subject}`, '45 mins', 'published', new Date().toISOString(), new Date().toISOString()]);
            }
        });

        // Seed Assessments
        const assessments = [
            { title: 'Fractions Discovery Quiz', subject: 'Mathematics' },
            { title: 'Solar System Mastery', subject: 'Science' },
            { title: 'Advanced Grammar Skills', subject: 'English' }
        ];

        assessments.forEach(a => {
            const assessmentId = crypto.randomUUID();
            db.run(`INSERT INTO assessments (id, teacher_id, title, subject, class_name, grade, topic, type, difficulty, questions_count, total_marks, passing_marks, time_limit, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [assessmentId, demoTeacher.id, a.title, a.subject, 'Primary', 'Grade 5', 'Introduction', 'mcq', 'medium', 5, 100, 40, 30, 'published', new Date().toISOString(), new Date().toISOString()]);

            // Seed grades for the first 15 students for this assessment
            for (let sId = 1; sId <= 15; sId++) {
                const studentId = `student-${sId}`;
                const score = 60 + Math.floor(Math.random() * 40);
                db.run(`INSERT INTO grades (id, assessment_id, student_id, total_score, max_score, percentage, grade_letter, graded_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                    [crypto.randomUUID(), assessmentId, studentId, score, 100, score, score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : 'D', new Date().toISOString()]);
            }
        });

        // Seed Events
        const eventColors = ['bg-primary/10 text-primary border-primary/20', 'bg-accent/10 text-accent border-accent/20', 'bg-warning/10 text-warning border-warning/20', 'bg-success/10 text-success border-success/20'];
        const categories = ['lecture', 'lab', 'seminar', 'review'];
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        for (let d = new Date(startOfMonth); d <= endOfMonth; d.setDate(d.getDate() + 1)) {
            const dayOfWeek = d.getDay();
            if (dayOfWeek === 0 || dayOfWeek === 6) continue;

            const dateStr = d.toISOString().split('T')[0];
            const dailyCount = 2 + Math.floor(Math.random() * 3);

            for (let i = 0; i < dailyCount; i++) {
                const hour = 8 + (i * 3);
                const subjIdx = (d.getDate() + i) % subjects.length;
                db.run(`INSERT INTO events (id, title, start, end, category, color) VALUES (?, ?, ?, ?, ?, ?)`,
                    [crypto.randomUUID(), `${subjects[subjIdx]} ${i + 1}`, `${dateStr}T${hour.toString().padStart(2, '0')}:00:00`, `${dateStr}T${(hour + 2).toString().padStart(2, '0')}:30:00`, categories[i % categories.length], eventColors[subjIdx % eventColors.length]]);
            }
        }

        console.log('Seeding completed.');
    });
}

seed();

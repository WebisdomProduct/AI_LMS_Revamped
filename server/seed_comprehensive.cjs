const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const crypto = require('crypto');

const dbPath = path.resolve(__dirname, 'lms.db');
const db = new sqlite3.Database(dbPath);

const TEACHER_ID = 'teacher-demo-id';
const SUBJECTS = ['Mathematics', 'Science', 'History', 'English', 'Physics', 'Chemistry'];
const CLASSES = ['9-A', '9-B', '10-A', '10-B', '11-Science', '12-Science'];
const NAMES = [
    "Emma", "Liam", "Olivia", "Noah", "Ava", "Oliver", "Isabella", "Elijah", "Sophia", "Lucas",
    "Mia", "Mason", "Charlotte", "Logan", "Amelia", "Alexander", "Harper", "Ethan", "Evelyn", "Jacob",
    "Abigail", "Michael", "Emily", "Daniel", "Elizabeth", "Henry", "Sofia", "Jackson", "Avery", "Sebastian",
    "Ella", "Aiden", "Scarlett", "Matthew", "Grace", "Samuel", "Chloe", "David", "Camila", "Joseph",
    "Penelope", "Carter", "Luna", "Owen", "Layla", "Wyatt", "Riley", "John", "Zoey", "Jack"
];

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function randomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString();
}

const now = new Date();
const threeMonthsAgo = new Date();
threeMonthsAgo.setMonth(now.getMonth() - 3);

db.serialize(() => {
    console.log("Clearing old data...");
    db.run("DELETE FROM users");
    db.run("DELETE FROM students");
    db.run("DELETE FROM lessons");
    db.run("DELETE FROM assessments");
    db.run("DELETE FROM questions");
    db.run("DELETE FROM rubrics");
    db.run("DELETE FROM submissions");
    db.run("DELETE FROM grades");
    db.run("DELETE FROM events");
    db.run("DELETE FROM chat_logs");

    console.log("Seeding Users...");
    // Teacher
    db.run("INSERT INTO users (id, email, password, full_name, role) VALUES (?, ?, ?, ?, ?)",
        [TEACHER_ID, 'teacher@demo.com', 'password', 'Demo Teacher', 'teacher']);

    // Students (50)
    const studentIds = [];
    NAMES.forEach((name, idx) => {
        const id = `student-${idx + 1}`;
        const className = CLASSES[idx % CLASSES.length]; // Distribute across classes
        const grade = className.split('-')[0];
        const email = `${name.toLowerCase()}${idx + 1}@school.com`;

        db.run("INSERT INTO users (id, email, password, full_name, role) VALUES (?, ?, ?, ?, ?)",
            [id, email, 'password', `${name} Doe`, 'student']);

        db.run("INSERT INTO students (id, user_id, name, email, grade, class, role) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [id, id, `${name} Doe`, email, grade, className, 'student']);

        studentIds.push({ id, grade, className });
    });

    console.log("Seeding Lessons...");
    // Create ~20 lessons
    for (let i = 0; i < 20; i++) {
        const id = crypto.randomUUID();
        const subject = randomItem(SUBJECTS);
        const className = randomItem(CLASSES);
        const grade = className.split('-')[0];
        const title = `${subject} Lesson ${i + 1}: ${randomItem(['Introduction', 'Advanced Concepts', 'Practical Application', 'Theory', 'Review'])}`;
        const status = randomItem(['draft', 'published', 'published', 'archived']);

        db.run(`INSERT INTO lessons (id, teacher_id, title, class_name, grade, subject, topic, content, status, created_at, updated_at, resources) VALUES 
            (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, TEACHER_ID, title, className, grade, subject, 'General Topic', `<h1>${title}</h1><p>Lesson content goes here...</p>`, status, randomDate(threeMonthsAgo, now), now.toISOString(), '[]']);
    }

    console.log("Seeding Assessments & Grades...");
    // Create ~10 Assessments
    for (let i = 0; i < 10; i++) {
        const assessId = crypto.randomUUID();
        const subject = randomItem(SUBJECTS);
        const className = randomItem(CLASSES);
        const grade = className.split('-')[0];
        const type = randomItem(['Quiz', 'Assignment', 'Exam']);
        const title = `${subject} ${type} ${i + 1}`;
        const createdAt = randomDate(threeMonthsAgo, now);

        db.run(`INSERT INTO assessments (id, teacher_id, title, subject, class_name, grade, topic, type, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [assessId, TEACHER_ID, title, subject, className, grade, 'Unit Test', type, createdAt]);

        // Add dummy questions
        db.run(`INSERT INTO questions (id, assessment_id, question_text, question_type, marks) VALUES (?, ?, ?, ?, ?)`,
            [crypto.randomUUID(), assessId, 'What is the answer?', 'short_answer', 10]);

        // Generate Submissions and Grades for students in this class
        const classStudents = studentIds.filter(s => s.className === className);

        classStudents.forEach(student => {
            // 80% chance a student submitted
            if (Math.random() > 0.2) {
                const subId = crypto.randomUUID();
                const score = randomInt(40, 100); // Random score 40-100
                const gradeLetter = score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : 'D';

                db.run(`INSERT INTO submissions (id, assessment_id, student_id, status, submitted_at) VALUES (?, ?, ?, ?, ?)`,
                    [subId, assessId, student.id, 'submitted', createdAt]);

                db.run(`INSERT INTO grades (id, assessment_id, student_id, total_score, percentage, grade_letter, graded_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [crypto.randomUUID(), assessId, student.id, score, score, gradeLetter, createdAt]);
            }
        });
    }

    console.log("Seeding Events...");
    // Current week schedule
    const eventTypes = ['lecture', 'meeting', 'school-event'];
    for (let i = 0; i < 10; i++) {
        const evtId = crypto.randomUUID();
        const date = new Date();
        date.setDate(date.getDate() + randomInt(-2, 5)); // Around today
        const start = new Date(date);
        start.setHours(randomInt(9, 14), 0, 0);
        const end = new Date(start);
        end.setHours(start.getHours() + 1);

        db.run(`INSERT INTO events (id, user_id, title, start, end, type, description) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [evtId, TEACHER_ID, `${randomItem(SUBJECTS)} Class`, start.toISOString(), end.toISOString(), 'lecture', 'Regular class']);
    }

    console.log("Database seeded successfully.");
});

db.close();

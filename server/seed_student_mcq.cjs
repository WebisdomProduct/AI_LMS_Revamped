const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const crypto = require('crypto');

const dbPath = path.resolve(__dirname, 'lms.db');
const db = new sqlite3.Database(dbPath);

console.log('Seeding MCQ Assessment...');

db.serialize(() => {
    // 1. Find the Teacher (Demo Teacher)
    const teacherId = 'teacher-demo-id';

    // 2. create Assessment
    const assessId = crypto.randomUUID();
    const now = new Date().toISOString();
    const oneWeekLater = new Date();
    oneWeekLater.setDate(oneWeekLater.getDate() + 7);

    db.run(`INSERT INTO assessments (
        id, teacher_id, title, subject, class_name, grade, 
        topic, type, difficulty, questions_count, total_marks, 
        passing_marks, time_limit, status, due_date, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
        assessId, teacherId, "Physics: Dynamics & Forces", "Physics",
        "Science-A", "Grade 5", "Forces", "mcq", "medium",
        3, 30, 12, 15, "published", oneWeekLater.toISOString(), now
    ], function (err) {
        if (err) return console.error("Error inserting assessment:", err);
        console.log(`Assessment created: ${assessId}`);

        // 3. Insert Questions
        const q1Id = crypto.randomUUID();
        const q2Id = crypto.randomUUID();
        const q3Id = crypto.randomUUID();

        const insertQ = `INSERT INTO questions (id, assessment_id, question_text, question_type, options, marks) VALUES (?, ?, ?, ?, ?, ?)`;

        db.serialize(() => {
            // Question 1
            db.run(insertQ, [
                q1Id, assessId,
                "What happens to an object's motion if the net force acting on it is zero?",
                "mcq",
                JSON.stringify([
                    { text: "It stops immediately", correct: false },
                    { text: "It accelerates", correct: false },
                    { text: "It maintains constant velocity", correct: true },
                    { text: "It changes direction", correct: false }
                ]),
                10
            ]);

            // Question 2
            db.run(insertQ, [
                q2Id, assessId,
                "Which unit is used to measure Force?",
                "mcq",
                JSON.stringify([
                    { text: "Joules", correct: false },
                    { text: "Newtons", correct: true },
                    { text: "Watts", correct: false },
                    { text: "Kilograms", correct: false }
                ]),
                10
            ]);

            // Question 3
            db.run(insertQ, [
                q3Id, assessId,
                "Friction always acts in which direction relative to motion?",
                "mcq",
                JSON.stringify([
                    { text: "Same direction", correct: false },
                    { text: "Perpendicular", correct: false },
                    { text: "Opposite direction", correct: true },
                    { text: "It depends on the surface", correct: false }
                ]),
                10
            ], function (err) {
                if (err) console.error("Error inserting questions:", err);
                else console.log("Questions seeded.");
                db.close();
            });
        });
    });
});

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.resolve(__dirname, 'lms.db');
const db = new sqlite3.Database(dbPath);

const run = async () => {
    console.log("--- Checking Database for Assignments ---");

    // 1. Get a student user
    db.get("SELECT * FROM students LIMIT 1", (err, student) => {
        if (err) return console.error("Error fetching student:", err);
        if (!student) return console.log("No students found.");
        console.log("Student:", student.name, student.id, student.user_id);

        // 2. Check published assessments
        db.all("SELECT * FROM assessments", (err, assessments) => {
            if (err) return console.error("Error fetching assessments:", err);
            console.log(`Found ${assessments.length} assessments.`);

            if (assessments.length > 0) {
                const ass = assessments[0];
                console.log("Sample Assessment:", ass.id, ass.title, ass.status);

                // 3. Check questions for this assessment
                db.all("SELECT * FROM questions WHERE assessment_id = ?", [ass.id], (err, questions) => {
                    if (err) return console.error("Error fetching questions:", err);
                    console.log(`Found ${questions.length} questions for assessment ${ass.id}.`);
                });
            }
        });
    });
};

run();

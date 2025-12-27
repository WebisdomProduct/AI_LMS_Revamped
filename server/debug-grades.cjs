const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.resolve(__dirname, 'lms.db');
const db = new sqlite3.Database(dbPath);

const queries = {
    grades: "SELECT * FROM grades",
    students: "SELECT * FROM students",
    joined: `
        SELECT s.name, AVG(g.percentage) as avg_score
        FROM students s
        LEFT JOIN grades g ON s.id = g.student_id
        GROUP BY s.id
    `
};

db.serialize(() => {
    db.all(queries.grades, (err, rows) => {
        console.log("--- All Grades ---");
        console.log(rows.slice(0, 5)); // First 5
    });
    db.all(queries.joined, (err, rows) => {
        console.log("\n--- Student Averages ---");
        console.log(rows.slice(0, 5));
    });
});

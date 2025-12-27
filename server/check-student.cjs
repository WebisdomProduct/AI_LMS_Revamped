const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'lms.db');
const db = new sqlite3.Database(dbPath);

db.get("SELECT email, password FROM users WHERE role = 'student' LIMIT 1", (err, row) => {
    if (err) {
        console.error(err);
    } else {
        console.log("Student Creds:", row);
    }
});

db.get("SELECT email, password FROM users WHERE email = 'student@gmail.com'", (err, row) => {
    if (row) {
        console.log("Demo Student Creds:", row);
    } else {
        console.log("Demo student not found.");
    }
});

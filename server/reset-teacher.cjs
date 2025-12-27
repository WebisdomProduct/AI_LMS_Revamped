const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'lms.db');
const db = new sqlite3.Database(dbPath);

const newEmail = 'demo@teacher.com';
const newPass = 'password123';

db.serialize(() => {
    db.run(`UPDATE users SET email = ?, password = ? WHERE role = 'teacher'`, [newEmail, newPass], function (err) {
        if (err) {
            console.error("Error updating:", err);
        } else {
            console.log(`Updated ${this.changes} teacher record(s) to ${newEmail} / ${newPass}`);
        }
    });

    db.all("SELECT email, password FROM users WHERE role = 'teacher'", (err, rows) => {
        console.log("Current Teacher Credentials:", rows);
    });
});

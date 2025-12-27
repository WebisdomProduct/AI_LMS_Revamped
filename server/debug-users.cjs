const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'lms.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    console.log("Checking users table...");
    db.all("SELECT id, email, password, role FROM users", (err, rows) => {
        if (err) {
            console.error("Error reading users:", err);
        } else {
            console.log("Found users:", rows.length);
            rows.forEach(row => {
                console.log(`User: ${row.email}, Role: ${row.role}, Password: ${row.password}`);
            });
        }
    });
});

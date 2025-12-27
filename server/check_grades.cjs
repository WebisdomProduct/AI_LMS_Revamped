const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'lms.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    console.log("--- Checking Grades Table ---");
    db.all("SELECT * FROM grades", (err, rows) => {
        if (err) {
            console.error(err);
        } else {
            console.log(`Found ${rows.length} grade records.`);
            rows.forEach(r => console.log(r));
        }
    });

    console.log("\n--- Checking Students Table ---");
    db.all("SELECT * FROM students", (err, rows) => {
        if (err) {
            console.error(err);
        } else {
            console.log(`Found ${rows.length} students.`);
            rows.forEach(r => console.log(`${r.id} - ${r.name} (User ID: ${r.user_id})`));
        }
    });

    console.log("\n--- Checking Users Table ---");
    db.all("SELECT * FROM users", (err, rows) => {
        if (err) {
            console.error(err);
        } else {
            rows.forEach(r => console.log(`${r.id} - ${r.full_name} (${r.role})`));
        }
    });
});

db.close();

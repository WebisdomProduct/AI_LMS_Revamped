const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'lms.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    console.log("Adding resources column to lessons table...");
    db.run("ALTER TABLE lessons ADD COLUMN resources TEXT", (err) => {
        if (err) {
            console.log("Column might already exist or error:", err.message);
        } else {
            console.log("Column added successfully.");
        }
    });
});

db.close();

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const os = require('os');

// Debug logging for Vercel
console.log("[DB] Initializing database module...");

// Determine database path
const sourceDbName = 'lms.db';
let dbPath = path.resolve(__dirname, sourceDbName);

console.log(`[DB] dirname: ${__dirname}`);
console.log(`[DB] Resolved source dbPath: ${dbPath}`);

// Vercel / Serverless Workaround:
if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
  const tmpDbPath = path.join(os.tmpdir(), sourceDbName);
  console.log(`[DB] Target tmp path: ${tmpDbPath}`);

  try {
    if (fs.existsSync(dbPath)) {
      console.log(`[DB] Source file found at ${dbPath}. Copying...`);
      fs.copyFileSync(dbPath, tmpDbPath);
      console.log(`[DB] Successfully copied to ${tmpDbPath}`);
      dbPath = tmpDbPath;
    } else {
      console.warn(`[DB] Source database NOT found at ${dbPath}. Searching alternatives...`);
      const alternativePaths = [
        path.join(process.cwd(), 'server', sourceDbName),
        path.join(process.cwd(), sourceDbName),
        path.join(__dirname, '..', 'server', sourceDbName)
      ];

      let found = false;
      for (const altPath of alternativePaths) {
        if (fs.existsSync(altPath)) {
          console.log(`[DB] Found at alternative: ${altPath}. Copying...`);
          fs.copyFileSync(altPath, tmpDbPath);
          dbPath = tmpDbPath;
          found = true;
          break;
        }
      }

      if (!found) {
        console.error(`[DB] CRITICAL: Could not find ${sourceDbName} anywhere! Creating empty DB at ${tmpDbPath}`);
        dbPath = tmpDbPath;
      }
    }
  } catch (e) {
    console.error("[DB] Failed to copy DB to /tmp:", e);
  }
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error(`Error opening database at ${dbPath}:`, err.message);
  } else {
    console.log(`Connected to the SQLite database at ${dbPath}`);
  }
});

initDb();

function initDb() {
  db.serialize(() => {
    // Users
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE,
      password TEXT,
      full_name TEXT,
      role TEXT
    )`);

    // Students (Profile)
    db.run(`CREATE TABLE IF NOT EXISTS students (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      name TEXT,
      email TEXT,
      grade TEXT,
      class TEXT,
      role TEXT,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )`);

    // Lessons
    db.run(`CREATE TABLE IF NOT EXISTS lessons (
      id TEXT PRIMARY KEY,
      teacher_id TEXT,
      title TEXT,
      class_name TEXT,
      grade TEXT,
      subject TEXT,
      topic TEXT,
      content TEXT,
      duration TEXT,
      status TEXT,
      created_at TEXT,
      updated_at TEXT,
      FOREIGN KEY(teacher_id) REFERENCES users(id)
    )`);

    // Assessments
    db.run(`CREATE TABLE IF NOT EXISTS assessments (
      id TEXT PRIMARY KEY,
      teacher_id TEXT,
      title TEXT,
      subject TEXT,
      class_name TEXT,
      grade TEXT,
      topic TEXT,
      type TEXT,
      difficulty TEXT,
      questions_count INTEGER,
      total_marks INTEGER,
      passing_marks INTEGER,
      time_limit INTEGER,
      time_limit INTEGER,
      status TEXT,
      due_date TEXT,
      created_at TEXT,
      updated_at TEXT,
      FOREIGN KEY(teacher_id) REFERENCES users(id)
    )`);

    // Add due_date column if it doesn't exist (migration)
    db.run(`ALTER TABLE assessments ADD COLUMN due_date TEXT`, (err) => {
      // Ignore error if column already exists
    });

    // Questions
    db.run(`CREATE TABLE IF NOT EXISTS questions (
      id TEXT PRIMARY KEY,
      assessment_id TEXT,
      question_text TEXT,
      question_type TEXT,
      options TEXT, -- JSON string
      correct_answer TEXT,
      marks INTEGER,
      FOREIGN KEY(assessment_id) REFERENCES assessments(id)
    )`);

    // Grades
    db.run(`CREATE TABLE IF NOT EXISTS grades (
      id TEXT PRIMARY KEY,
      assessment_id TEXT,
      student_id TEXT,
      total_score REAL,
      max_score REAL,
      percentage REAL,
      grade_letter TEXT,
      ai_feedback TEXT,
      graded_at TEXT,
      FOREIGN KEY(assessment_id) REFERENCES assessments(id),
      FOREIGN KEY(student_id) REFERENCES students(id)
    )`);

    // Add ai_feedback column if it doesn't exist (migration)
    db.run(`ALTER TABLE grades ADD COLUMN ai_feedback TEXT`, (err) => {
      // Ignore error if column already exists
    });

    // Submissions
    db.run(`CREATE TABLE IF NOT EXISTS submissions (
      id TEXT PRIMARY KEY,
      assessment_id TEXT,
      student_id TEXT,
      status TEXT,
      submitted_at TEXT,
      created_at TEXT,
      FOREIGN KEY(assessment_id) REFERENCES assessments(id),
      FOREIGN KEY(student_id) REFERENCES students(id)
    )`);

    // Events
    db.run(`CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      title TEXT,
      start TEXT,
      end TEXT,
      category TEXT,
      color TEXT
    )`);

    // Rubrics
    db.run(`CREATE TABLE IF NOT EXISTS rubrics (
      id TEXT PRIMARY KEY,
      assessment_id TEXT,
      criteria TEXT, -- JSON string
      FOREIGN KEY(assessment_id) REFERENCES assessments(id)
    )`);

    // Chat Logs (AI Tutor)
    db.run(`CREATE TABLE IF NOT EXISTS chat_logs (
      id TEXT PRIMARY KEY,
      student_id TEXT,
      role TEXT, -- 'user' or 'system'
      content TEXT,
      timestamp TEXT,
      FOREIGN KEY(student_id) REFERENCES students(id)
    )`);

    // Create admin user if not exists
    db.get(`SELECT id FROM users WHERE email = 'admin@gmail.com'`, (err, row) => {
      if (!row) {
        const crypto = require('crypto');
        const adminId = crypto.randomUUID();
        const hashedPassword = crypto.createHash('sha256').update('admin@123').digest('hex');

        db.run(`INSERT INTO users (id, email, password, full_name, role) VALUES (?, ?, ?, ?, ?)`,
          [adminId, 'admin@gmail.com', hashedPassword, 'Admin User', 'admin'],
          (err) => {
            if (err) {
              console.error('Error creating admin user:', err);
            } else {
              console.log('[DB] Admin user created successfully');
            }
          }
        );
      } else {
        console.log('[DB] Admin user already exists');
      }
    });
  });
}

module.exports = db;

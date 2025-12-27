const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'lms.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to the SQLite database.');
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
  });
}

module.exports = db;

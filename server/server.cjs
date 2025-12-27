const express = require('express');
const cors = require('cors');
const db = require('./db.cjs');
const crypto = require('crypto');
require('dotenv').config();
const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || 'gsk_something' }); // User to provide key if missing

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Health Check (No DB)
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        env: process.env.NODE_ENV,
        cwd: process.cwd()
    });
});

// Global Error Handlers for debugging crash
process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION:', err);
});
process.on('unhandledRejection', (reason, promise) => {
    console.error('UNHANDLED REJECTION:', reason);
});

// DEBUG: Log all requests
app.use((req, res, next) => {
    console.log(`[REQUEST] ${req.method} ${req.url}`);
    next();
});


// --- Share Lesson via Email (SMTP) ---
const nodemailer = require('nodemailer');

app.post('/api/share/lesson', async (req, res) => {
    const { lessonId, lessonTitle, recipients } = req.body;
    console.log(`[SHARE] Request to share "${lessonTitle}" with:`, recipients);

    if (!recipients || recipients.length === 0) {
        return res.status(400).json({ error: 'No recipients provided' });
    }

    try {
        // SMTP Transporter Setup
        let transporter;
        let isTestAccount = false;

        if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
            transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: process.env.SMTP_PORT || 587,
                secure: false,
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS
                }
            });
        } else {
            console.log('[SHARE] No SMTP credentials found. Creating test account...');
            const testAccount = await nodemailer.createTestAccount();
            transporter = nodemailer.createTransport({
                host: 'smtp.ethereal.email',
                port: 587,
                secure: false,
                auth: { user: testAccount.user, pass: testAccount.pass }
            });
            isTestAccount = true;
        }

        const info = await transporter.sendMail({
            from: '"EduSpark AI" <no-reply@eduspark.ai>',
            to: recipients.join(', '),
            subject: `Lesson Plan Shared: ${lessonTitle}`,
            text: `A lesson plan "${lessonTitle}" has been shared with you via EduSpark AI.`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
                     <h2 style="color: #6366f1;">EduSpark AI Lesson Share</h2>
                     <p>Hello,</p>
                     <p>The lesson plan <b>"${lessonTitle}"</b> has been shared with you.</p>
                     <p>You can view it by clicking the button below:</p>
                     <a href="http://localhost:8080/teacher/lessons" style="display: inline-block; padding: 10px 20px; background-color: #6366f1; color: white; text-decoration: none; border-radius: 5px;">View Lesson Plan</a>
                </div>
            `
        });

        console.log("Message sent: %s", info.messageId);
        let previewUrl = null;
        if (isTestAccount) previewUrl = nodemailer.getTestMessageUrl(info);

        res.json({ success: true, message: 'Emails sent successfully', preview: previewUrl });
    } catch (error) {
        console.error("Error sending email:", error);
        res.status(500).json({ error: 'Failed to send emails via SMTP', details: error.message });
    }
});

app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    db.get("SELECT * FROM users WHERE email = ? AND password = ?", [email, password], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(401).json({ error: 'Invalid credentials' });

        // Return user info explicitly
        res.json({
            user: {
                id: row.id,
                email: row.email,
                full_name: row.full_name,
                role: row.role
            },
            session: { access_token: 'mock-token' }
        });
    });
});

app.use(cors());
app.use(express.json());

// --- Dashboard Stats ---
// --- Dashboard Stats ---
app.get('/api/dashboard/stats', (req, res) => {
    const teacherId = 'teacher-demo-id'; // Hardcoded for demo

    const queries = {
        students: "SELECT COUNT(*) as count FROM students",
        lessons: "SELECT COUNT(*) as count FROM lessons WHERE teacher_id = ?",
        assessments: "SELECT COUNT(*) as count FROM assessments WHERE teacher_id = ?",
        grades: "SELECT AVG(percentage) as average FROM grades",
        recentLessons: "SELECT id, title, created_at, 'lesson' as type FROM lessons WHERE teacher_id = ? ORDER BY created_at DESC LIMIT 3",
        recentAssessments: "SELECT id, title, created_at, 'assessment' as type FROM assessments WHERE teacher_id = ? ORDER BY created_at DESC LIMIT 3"
    };

    db.get(queries.students, (err, studentRow) => {
        if (err) return res.status(500).json({ error: err.message });

        db.get(queries.lessons, [teacherId], (err, lessonRow) => {
            if (err) return res.status(500).json({ error: err.message });

            db.get(queries.assessments, [teacherId], (err, assessmentRow) => {
                if (err) return res.status(500).json({ error: err.message });

                db.get(queries.grades, (err, gradeRow) => {
                    if (err) return res.status(500).json({ error: err.message });

                    // Fetch recent activity
                    db.all(queries.recentLessons, [teacherId], (err, recentLessons) => {
                        if (err) return res.status(500).json({ error: err.message });

                        db.all(queries.recentAssessments, [teacherId], (err, recentAssessments) => {
                            if (err) return res.status(500).json({ error: err.message });

                            // Combine and sort recent activity
                            const recentActivity = [...recentLessons, ...recentAssessments]
                                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                                .slice(0, 5)
                                .map(item => ({
                                    action: item.type === 'lesson' ? 'Created lesson plan' : 'Created assessment',
                                    item: item.title,
                                    time: new Date(item.created_at).toLocaleDateString()
                                }));

                            res.json({
                                totalStudents: studentRow.count,
                                totalLessons: lessonRow.count,
                                totalAssessments: assessmentRow.count,
                                classAverage: Math.round(gradeRow.average || 0),
                                recentActivity
                            });
                        });
                    });
                });
            });
        });
    });
});

// --- Students ---
app.get('/api/students', (req, res) => {
    db.all("SELECT * FROM students", (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ data: rows });
    });
});

app.get('/api/students/:id', (req, res) => {
    db.get("SELECT * FROM students WHERE id = ?", [req.params.id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ data: row });
    });
});

app.put('/api/students/:id', (req, res) => {
    const { name, email, grade, class: className } = req.body;
    db.run(
        `UPDATE students SET name = ?, email = ?, grade = ?, class = ? WHERE id = ?`,
        [name, email, grade, className, req.params.id],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            // Also update user email if needed
            res.json({ data: { id: req.params.id, ...req.body } });
        }
    );
});

// --- Lessons ---
app.get('/api/lessons', (req, res) => {
    const teacherId = 'teacher-demo-id'; // Assume logged in teacher
    db.all("SELECT * FROM lessons WHERE teacher_id = ? ORDER BY updated_at DESC", [teacherId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ data: rows });
    });
});

app.get('/api/lessons/:id', (req, res) => {
    db.get("SELECT * FROM lessons WHERE id = ?", [req.params.id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: 'Lesson not found' });

        // Parse resources if stored as string
        try {
            if (row.resources && typeof row.resources === 'string') {
                row.resources = JSON.parse(row.resources);
            }
        } catch (e) {
            row.resources = [];
        }
        res.json({ data: row });
    });
});

// --- Assessments ---
app.get('/api/assessments', (req, res) => {
    const teacherId = 'teacher-demo-id'; // Assume logged in teacher
    db.all("SELECT * FROM assessments WHERE teacher_id = ? ORDER BY created_at DESC", [teacherId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ data: rows });
    });
});

// --- Grades ---
app.get('/api/grades', (req, res) => {
    db.all("SELECT * FROM grades", (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ data: rows });
    });
});

app.put('/api/grades/:id', (req, res) => {
    const { percentage, grade_letter, total_score } = req.body;
    db.run(
        `UPDATE grades SET percentage = ?, grade_letter = ?, total_score = ? WHERE id = ?`,
        [percentage, grade_letter, total_score, req.params.id],
        (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true });
        }
    );
});

// --- Submissions ---
app.get('/api/submissions', (req, res) => {
    db.all("SELECT * FROM submissions", (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ data: rows });
    });
});

// --- Events (Schedule) ---
app.get('/api/events', (req, res) => {
    db.all("SELECT * FROM events", (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ data: rows });
    });
});

// --- Start Server ---
// --- AI & Feature 1: Lesson Planning ---
app.post('/api/ai/lesson-plan', async (req, res) => {
    const { grade, subject, topic, additionalPrompt } = req.body;
    try {
        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: "You are an expert teacher. Create a detailed lesson plan. Use HTML formatting for the content (e.g., <h3>, <ul>, <li>, <p>, <strong>). Do not include <html> or <body> tags, just the content structure." },
                { role: "user", content: `Create a lesson plan for Grade ${grade} ${subject} on the topic "${topic}". ${additionalPrompt || ''}` }
            ],
            model: "llama-3.3-70b-versatile",
        });
        res.json({ content: completion.choices[0]?.message?.content || "" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/lessons', (req, res) => {
    const { teacher_id, title, class_name, grade, subject, topic, content, status } = req.body;
    const id = crypto.randomUUID();
    const created_at = new Date().toISOString();
    db.run(
        `INSERT INTO lessons (id, teacher_id, title, class_name, grade, subject, topic, content, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, teacher_id, title, class_name, grade, subject, topic, content, status, created_at, created_at],
        (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id, status: 'success' });
        }
    );
});

app.put('/api/lessons/:id', (req, res) => {
    const { title, class_name, grade, subject, topic, content, duration, resources, status } = req.body;
    const updated_at = new Date().toISOString();

    // Dynamic update
    // Simple version: Update all fields
    // Ensure resources is stringified if it's an object/array
    const resourcesStr = typeof resources === 'object' ? JSON.stringify(resources) : resources;

    db.run(
        `UPDATE lessons SET title = ?, class_name = ?, grade = ?, subject = ?, topic = ?, content = ?, duration = ?, resources = ?, status = COALESCE(?, status), updated_at = ? WHERE id = ?`,
        [title, class_name, grade, subject, topic, content, duration, resourcesStr, status, updated_at, req.params.id],
        (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: req.params.id, status: 'success' });
        }
    );
});

app.delete('/api/lessons/:id', (req, res) => {
    db.run("DELETE FROM lessons WHERE id = ?", [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Deleted successfully' });
    });
});

// --- Feature 2: Assessments ---
app.post('/api/ai/assessment', async (req, res) => {
    const { grade, subject, topic, type, count } = req.body;
    try {
        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system", content: `You are an expert teacher. Create an assessment with questions and a grading rubric. 
Return STRICT JSON format with this schema:
{
  "questions": [
    {
      "question_text": "Question goes here",
      "question_type": "mcq" | "short_answer" | "long_answer",
      "options": ["Option A", "Option B", "Option C", "Option D"], // REQUIRED if question_type is 'mcq'
      "correct_answer": "Option A",
      "marks": 5
    }
  ],
  "rubric": [
    { "criteria": "Criteria Name", "points": 10, "description": "Detailed description for grading." }
  ]
}

IMPORTANT RULES:
1. If the user asks for 'Multiple Choice', 'MCQ', or 'Quiz', the 'question_type' MUST be 'mcq' and 'options' MUST be an array of 4 choices.
2. If the user asks for 'Short Answer', 'Written', or 'Subjective', the 'question_type' should be 'short_answer' or 'long_answer' and 'options' should be an empty array [].
3. Ensure 'marks' are assigned appropriately.
4. "rubric" is required.` },
                { role: "user", content: `Create a ${type} assessment with ${count} questions for Grade ${grade} ${subject} on "${topic}".` }
            ],
            model: "llama-3.3-70b-versatile",
            response_format: { type: "json_object" }
        });
        res.json(JSON.parse(completion.choices[0]?.message?.content || "{}"));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
);

app.post('/api/ai/refine-assessment', async (req, res) => {
    const { questions, instruction, grade, subject, topic } = req.body;
    try {
        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system", content: `You are an expert teacher. Refine the given assessment questions based on the user's instructions.
Return STRICT JSON format:
{
  "questions": [
    {
      "question_text": "Refined question text",
      "question_type": "mcq" | "short_answer",
      "options": ["Option A", "Option B", "Option C", "Option D"], // Required for mcq
      "correct_answer": "Option A",
      "marks": 5
    }
  ]
}
Maintain consistency in keys: use "question_text" NOT "text", "question_type" NOT "type", "marks" NOT "points".` },
                {
                    role: "user", content: `Context: Grade ${grade} ${subject}, Topic: ${topic}.
                
                Current Questions: ${JSON.stringify(questions)}
                
                Instruction: ${instruction}`
                }
            ],
            model: "llama-3.3-70b-versatile",
            response_format: { type: "json_object" }
        });
        res.json(JSON.parse(completion.choices[0]?.message?.content || "{}"));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/assessments', (req, res) => {
    // Expected body: { assessment: { ... }, questions: [ ... ], rubric: [ ... ] }
    const { assessment, questions, rubric } = req.body;
    const assessmentId = crypto.randomUUID();
    const now = new Date().toISOString();

    db.serialize(() => {
        db.run(`INSERT INTO assessments (id, teacher_id, title, subject, class_name, grade, topic, type, difficulty, questions_count, due_date, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [assessmentId, assessment.teacher_id, assessment.title, assessment.subject, assessment.class_name, assessment.grade, assessment.topic, assessment.type, assessment.difficulty || 'medium', questions.length, assessment.due_date, 'draft', now]);

        questions.forEach(q => {
            const qId = crypto.randomUUID();
            db.run(`INSERT INTO questions (id, assessment_id, question_text, question_type, options, correct_answer, marks) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [qId, assessmentId, q.question_text, q.question_type, JSON.stringify(q.options), q.correct_answer, q.marks]);
        });

        // Rubric usually linked to assessment or questions. Simplified here as assessment-level rubric
        if (rubric) {
            const rId = crypto.randomUUID();
            db.run(`INSERT INTO rubrics (id, assessment_id, criteria) VALUES (?, ?, ?)`,
                [rId, assessmentId, JSON.stringify(rubric)]);
        }
    });
    // ... (existing POST)
    res.json({ id: assessmentId, status: 'success' });
});

app.get('/api/assessments/:id', (req, res) => {
    db.get("SELECT * FROM assessments WHERE id = ?", [req.params.id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: 'Assessment not found' });
        res.json({ data: row });
    });
});

app.put('/api/assessments/:id', (req, res) => {
    // Expect body: { assessment: { ...metadata }, questions: [ ... ] } OR just metadata fields
    const { title, subject, grade, topic, type, status, questions, questions_count } = req.body;

    // 1. Update Assessment Metadata
    db.run(
        `UPDATE assessments SET title = COALESCE(?, title), subject = COALESCE(?, subject), grade = COALESCE(?, grade), topic = COALESCE(?, topic), type = COALESCE(?, type), status = COALESCE(?, status) WHERE id = ?`,
        [title, subject, grade, topic, type, status, req.params.id],
        (err) => {
            if (err) return res.status(500).json({ error: err.message });

            // 2. If questions provided, replace them (Transaction-like)
            if (questions && Array.isArray(questions)) {
                db.serialize(() => {
                    db.run("DELETE FROM questions WHERE assessment_id = ?", [req.params.id]);
                    questions.forEach(q => {
                        const qId = crypto.randomUUID();
                        db.run(`INSERT INTO questions (id, assessment_id, question_text, question_type, options, correct_answer, marks) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                            [qId, req.params.id, q.question_text, q.question_type, JSON.stringify(q.options), q.correct_answer, q.marks]);
                    });
                });
            }
            res.json({ success: true });
        }
    );
});

app.delete('/api/assessments/:id', (req, res) => {
    db.serialize(() => {
        db.run("DELETE FROM grades WHERE assessment_id = ?", [req.params.id]);
        db.run("DELETE FROM submissions WHERE assessment_id = ?", [req.params.id]);
        db.run("DELETE FROM questions WHERE assessment_id = ?", [req.params.id]);
        db.run("DELETE FROM assessments WHERE id = ?", [req.params.id], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Deleted successfully' });
        });
    });
});

// --- Feature 4: Submissions & Auto-Grading ---
app.post('/api/submissions', async (req, res) => {
    const { assessment_id, student_id, answers } = req.body;
    const subId = crypto.randomUUID();
    const now = new Date().toISOString();

    // 1. Save Submission
    db.run(`INSERT INTO submissions (id, assessment_id, student_id, status, submitted_at) VALUES (?, ?, ?, ?, ?)`,
        [subId, assessment_id, student_id, 'submitted', now]);

    // 2. Auto-Grade (Simplistic AI Check)
    try {
        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system", content: `You are an auto-grader. Grade the student answers. 
Return STRICT JSON: 
{
  "score": number (0-100),
  "feedback": "Overall summary feedback",
  "rubric_feedback": [
    { "criteria": "Concept", "score": number, "max": 5, "comment": "Brief comment" },
    { "criteria": "Accuracy", "score": number, "max": 5, "comment": "Brief comment" }
  ],
  "corrections": [
    { "question_text": "text of question", "explanation": "Why the answer was right/wrong" }
  ]
}` },
                { role: "user", content: `Grade these answers for assessment ${assessment_id}: ${JSON.stringify(answers)}` }
            ],
            model: "llama-3.3-70b-versatile",
            response_format: { type: "json_object" }
        });

        const rawContent = completion.choices[0]?.message?.content;
        console.log("[AUTO-GRADE] Raw AI Response:", rawContent);

        const grading = JSON.parse(rawContent || "{}");
        const score = grading.score || 0;
        const percentage = Math.round((score / 100) * 100);
        // Store full rich object as string
        const feedback = JSON.stringify(grading);
        const gradeLetter = percentage >= 90 ? 'A' : percentage >= 80 ? 'B' : percentage >= 70 ? 'C' : 'D';

        console.log("[AUTO-GRADE] Parsed Score:", score);

        // Save Grade
        const gradeId = crypto.randomUUID();
        db.run(`INSERT INTO grades (id, assessment_id, student_id, total_score, percentage, grade_letter, ai_feedback, graded_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [gradeId, assessment_id, student_id, score, percentage, gradeLetter, feedback, now]);

        // Return Grade object
        res.json({
            submission_id: subId,
            grade: {
                id: gradeId,
                assessment_id,
                student_id,
                total_score: score,
                max_score: 100,
                percentage: percentage,
                grade_letter: gradeLetter,
                ai_feedback: feedback, // This is now a JSON string validation on frontend needed
                graded_at: now
            }
        });
    } catch (error) {
        console.error("Auto-grading error:", error);

        // Mock fallback with rich structure
        const mockFeedback = JSON.stringify({
            feedback: "AI Auto-grading failed. Submitting for manual review.",
            rubric_feedback: [],
            corrections: []
        });

        res.json({
            submission_id: subId,
            message: "Submitted. Grading pending.",
            grade: {
                id: crypto.randomUUID(),
                assessment_id,
                student_id,
                total_score: 0,
                max_score: 100,
                percentage: 0,
                grade_letter: 'P',
                ai_feedback: mockFeedback,
                graded_at: now
            }
        });
    }
});

// --- Feature 5: AI Tutor ---
app.post('/api/ai/tutor', async (req, res) => {
    const { student_id, message, grade, subject } = req.body;
    // Log user message
    const userLogId = crypto.randomUUID();
    const now = new Date().toISOString();
    db.run(`INSERT INTO chat_logs (id, student_id, role, content, timestamp) VALUES (?, ?, ?, ?, ?)`,
        [userLogId, student_id, 'user', message, now]);

    try {
        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: `You are a helpful tutor for a Grade ${grade} student studying ${subject}.` },
                { role: "user", content: message }
            ],
            model: "llama-3.3-70b-versatile",
        });
        const reply = completion.choices[0]?.message?.content || "";

        // Log system reply
        const sysLogId = crypto.randomUUID();
        db.run(`INSERT INTO chat_logs (id, student_id, role, content, timestamp) VALUES (?, ?, ?, ?, ?)`,
            [sysLogId, student_id, 'system', reply, new Date().toISOString()]);

        res.json({ reply });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/published-assessments', (req, res) => {
    // In real app, filter by student grade/class
    db.all("SELECT * FROM assessments", (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ data: rows });
    });
});

app.get('/api/assessments/:id/questions', (req, res) => {
    db.all("SELECT * FROM questions WHERE assessment_id = ?", [req.params.id], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });

        const questions = rows.map(q => {
            try {
                // Parse options if it's a string
                if (q.options && typeof q.options === 'string') {
                    q.options = JSON.parse(q.options);
                }
            } catch (e) {
                console.error("Error parsing question options:", e);
                q.options = [];
            }
            return q;
        });

        res.json({ data: questions });
    });
});

app.get('/api/students/:id/stats', (req, res) => {
    const studentId = req.params.id;
    db.all("SELECT * FROM grades WHERE student_id = ?", [studentId], (err, grades) => {
        if (err) return res.status(500).json({ error: err.message });
        const completed = grades.length;
        const avg = completed > 0 ? grades.reduce((a, b) => a + b.percentage, 0) / completed : 0;
        res.json({
            averageScore: Math.round(avg),
            completedAssessments: completed,
            pendingAssessments: 2 // Mock
        });
    });
});

app.get('/api/students/user/:userId', (req, res) => {
    db.get("SELECT * FROM students WHERE user_id = ?", [req.params.userId], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ data: row });
    });
});

app.get('/api/students/:id/grades', (req, res) => {
    db.all("SELECT * FROM grades WHERE student_id = ? ORDER BY graded_at DESC", [req.params.id], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ data: rows });
    });
});

app.post('/api/ai/lesson-refine', async (req, res) => {
    const { content, instruction } = req.body;
    try {
        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: "You are an expert teacher's assistant. You will be given a lesson plan (which may be in HTML or Markdown) and an instruction to refine it. Return ONLY the refined content. Do not include markdown code block fences (like ```html or ```markdown) unless explicitly asked. Return the raw content ready to be rendered." },
                { role: "user", content: `Original Content:\n${content}\n\nInstruction: ${instruction}` }
            ],
            model: "llama-3.3-70b-versatile",
        });
        res.json({ content: completion.choices[0]?.message?.content || content });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});



// --- Chat for Lesson Planning ---
app.post('/api/ai/lesson-chat', async (req, res) => {
    const { messages } = req.body;
    try {
        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: "You are an expert lesson planner. Help the teacher create a comprehensive lesson plan. Be interactive. Ask clarifying questions if needed. When provided with requirements, generate a structured lesson plan. If the user asks to modify it, output the full modified plan." },
                ...messages
            ],
            model: "llama-3.3-70b-versatile",
        });
        res.json({ reply: completion.choices[0]?.message?.content || "" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- Google Docs Integration ---
const { google } = require('googleapis');

// Hardcoded for demo - ideally env vars
const GOOGLE_CLIENT_ID = '851596132408-ia3sccmcut3ipvvbp50k1pe0bdfd6s79.apps.googleusercontent.com';
const GOOGLE_CLIENT_SECRET = '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';
const SERVER_URL = process.env.SERVER_URL || 'http://localhost:3000';
const GOOGLE_REDIRECT_URI = `${SERVER_URL}/api/auth/google/callback`;

const oauth2Client = new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI
);

// Store tokens in memory for demo session (user is always 'teacher-demo-id')
let teacherTokens = null;

app.get('/api/auth/google', (req, res) => {
    const scopes = [
        'https://www.googleapis.com/auth/documents',
        'https://www.googleapis.com/auth/drive.file'
    ];
    const url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
        prompt: 'consent' // force refresh token
    });
    res.json({ url });
});

app.get('/api/auth/google/callback', async (req, res) => {
    const { code } = req.query;
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    try {
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);
        teacherTokens = tokens; // Save to memory or DB

        // Redirect back to frontend
        res.redirect(`${clientUrl}/teacher/lessons?auth=success`);
    } catch (error) {
        console.error('Google Auth Error:', error);
        res.redirect(`${clientUrl}/teacher/lessons?auth=failed`);
    }
});

app.post('/api/export/google-doc', async (req, res) => {
    const { title, content } = req.body;

    if (!teacherTokens) {
        return res.status(401).json({ error: 'Not authenticated with Google' });
    }

    try {
        oauth2Client.setCredentials(teacherTokens); // Ensure current tokens
        const docs = google.docs({ version: 'v1', auth: oauth2Client });
        const drive = google.drive({ version: 'v3', auth: oauth2Client });

        // 1. Create Doc
        const createRes = await docs.documents.create({
            requestBody: { title }
        });
        const docId = createRes.data.documentId;

        // 2. Insert Content
        // Simple text insertion. HTML conversion is complex, so we strip or just insert raw text.
        // For rich text, we need to parse HTML and make batchUpdate requests.
        // Simplified: Insert text.
        const plainText = content.replace(/<[^>]+>/g, '\n').replace(/&nbsp;/g, ' ');

        await docs.documents.batchUpdate({
            documentId: docId,
            requestBody: {
                requests: [
                    {
                        insertText: {
                            text: plainText,
                            location: { index: 1 }
                        }
                    }
                ]
            }
        });

        // 3. Get view link from Drive (optional since we have docId)
        // const file = await drive.files.get({ fileId: docId, fields: 'webViewLink' });

        res.json({
            success: true,
            docId,
            url: `https://docs.google.com/document/d/${docId}/edit`
        });

    } catch (error) {
        console.error('Google Docs Export Error:', error);
        res.status(500).json({ error: error.message });
    }
});


// --- Start Server ---
if (require.main === module) {
    app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
    });
}

module.exports = app;
app.use((req, res) => {
    console.log(`[404] Route not found: ${req.method} ${req.url}`);
    res.status(404).json({ error: 'Not Found', path: req.url });
});

const server = app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

server.on('close', () => {
    console.log('Server connection closed');
});

// HEARTBEAT: Keep process alive
setInterval(() => {
    // Prevent process exit
}, 1000 * 60 * 60);

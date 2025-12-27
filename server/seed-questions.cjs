const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const crypto = require('crypto');

const dbPath = path.resolve(__dirname, 'lms.db');
const db = new sqlite3.Database(dbPath);

const dummyQuestions = {
    'Science': [
        { text: 'What is the powerhouse of the cell?', type: 'mcq', options: JSON.stringify([{ text: 'Mitochondria', isCorrect: true }, { text: 'Nucleus', isCorrect: false }, { text: 'Ribosome', isCorrect: false }]), correct: 'Mitochondria' },
        { text: 'What is the chemical symbol for Gold?', type: 'mcq', options: JSON.stringify([{ text: 'Au', isCorrect: true }, { text: 'Ag', isCorrect: false }, { text: 'Fe', isCorrect: false }]), correct: 'Au' },
        { text: 'Explain photosynthesis.', type: 'short_answer', options: '[]', correct: '' }
    ],
    'Math': [
        { text: 'What is 2 + 2?', type: 'mcq', options: JSON.stringify([{ text: '4', isCorrect: true }, { text: '5', isCorrect: false }]), correct: '4' },
        { text: 'Solve for x: 2x = 10', type: 'mcq', options: JSON.stringify([{ text: '5', isCorrect: true }, { text: '2', isCorrect: false }]), correct: '5' }
    ],
    'History': [
        { text: 'Who was the first President of the USA?', type: 'mcq', options: JSON.stringify([{ text: 'George Washington', isCorrect: true }, { text: 'Lincoln', isCorrect: false }]), correct: 'George Washington' },
        { text: 'In which year did WWII end?', type: 'mcq', options: JSON.stringify([{ text: '1945', isCorrect: true }, { text: '1939', isCorrect: false }]), correct: '1945' }
    ],
    'English': [
        { text: 'Identify the noun in the sentence: "The cat runs."', type: 'mcq', options: JSON.stringify([{ text: 'cat', isCorrect: true }, { text: 'runs', isCorrect: false }]), correct: 'cat' },
        { text: 'Who wrote Hamlet?', type: 'mcq', options: JSON.stringify([{ text: 'Shakespeare', isCorrect: true }, { text: 'Dickens', isCorrect: false }]), correct: 'Shakespeare' }
    ]
};

db.serialize(() => {
    db.all("SELECT * FROM assessments", (err, rows) => {
        if (err) {
            console.error(err);
            return;
        }

        console.log(`Found ${rows.length} assessments.`);

        rows.forEach(assessment => {
            // Check if questions exist
            db.get("SELECT count(*) as count FROM questions WHERE assessment_id = ?", [assessment.id], (err, row) => {
                if (row.count === 0) {
                    console.log(`Seeding questions for: ${assessment.title} (${assessment.subject})`);

                    const subjectKey = Object.keys(dummyQuestions).find(k => assessment.subject && assessment.subject.includes(k)) || 'Science';
                    const questions = dummyQuestions[subjectKey] || dummyQuestions['Science'];

                    questions.forEach(q => {
                        const id = crypto.randomUUID();
                        db.run(`INSERT INTO questions (id, assessment_id, question_text, question_type, options, correct_answer, marks) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                            [id, assessment.id, q.text, q.type, q.options, q.correct, 5]);
                    });

                    // Update count
                    db.run(`UPDATE assessments SET questions_count = ? WHERE id = ?`, [questions.length, assessment.id]);
                }
            });
        });
    });
});

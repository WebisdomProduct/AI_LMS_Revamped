// Local Database Service using LocalStorage
import { User, Session, Assessment, Question, Student, Grade, Submission, ScheduleEvent } from '@/types';

class LocalDatabaseService {
    private db: any = {
        users: [],
        lessons: [],
        assessments: [],
        questions: [],
        students: [],
        grades: [],
        submissions: [],
        events: []
    };

    constructor() {
        this.load();
        if (this.db.users.length === 0) {
            this.seed();
        } else {
            this.checkRequiredUsers();
        }
    }

    private checkRequiredUsers() {
        const studentEmail = 'student@gmail.com';
        const teacherEmail = 'demo@teacher.com';

        const hasStudent = this.db.users.some((u: any) => u.email === studentEmail);
        const hasTeacher = this.db.users.some((u: any) => u.email === teacherEmail);

        if (!hasStudent) {
            const demoStudentUser = {
                id: 'student-demo-user-id',
                email: studentEmail,
                password: 'student@123',
                full_name: 'Aryan Sharma',
                role: 'student'
            };
            this.db.users.push(demoStudentUser);

            // Also ensure student profile exists
            if (!this.db.students.some((s: any) => s.user_id === demoStudentUser.id)) {
                this.db.students.push({
                    id: 'student-demo-id',
                    user_id: demoStudentUser.id,
                    name: demoStudentUser.full_name,
                    email: demoStudentUser.email,
                    grade: 'Grade 5',
                    class: 'Primary',
                    role: 'student'
                });
            }
            this.save();
        }

        if (!hasTeacher) {
            this.db.users.push({
                id: 'teacher-demo-id',
                email: teacherEmail,
                password: 'password123',
                full_name: 'Dr. Sarah Jenkins',
                role: 'teacher'
            });
            this.save();
        }
    }

    private load() {
        const saved = localStorage.getItem('lms_data');
        if (saved) {
            try {
                this.db = JSON.parse(saved);

                // DATA MIGRATION: Ensure question options are arrays
                if (this.db.questions && Array.isArray(this.db.questions)) {
                    this.db.questions = this.db.questions.map((q: any) => {
                        if (typeof q.options === 'string') {
                            try {
                                return { ...q, options: JSON.parse(q.options) };
                            } catch (e) {
                                return { ...q, options: [] };
                            }
                        }
                        return q;
                    });
                }
            } catch (e) {
                console.error('Failed to parse local DB', e);
            }
        }
    }

    private save() {
        localStorage.setItem('lms_data', JSON.stringify(this.db));
    }

    private seed() {
        // Core Demo User (Teacher)
        const demoTeacher = {
            id: 'teacher-demo-id',
            email: 'demo@teacher.com',
            password: 'password123',
            full_name: 'Dr. Sarah Jenkins',
            role: 'teacher'
        };
        this.db.users.push(demoTeacher);

        // Core Demo User (Student)
        const demoStudentUser = {
            id: 'student-demo-user-id',
            email: 'student@gmail.com',
            password: 'student@123',
            full_name: 'Aryan Sharma',
            role: 'student'
        };
        this.db.users.push(demoStudentUser);

        // Real Names for Students
        const firstNames = ['James', 'Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'Ethan', 'Sophie', 'Lucas', 'Mia', 'Benjamin', 'Charlotte', 'Mason', 'Amelia', 'Alexander', 'Harper', 'Sebastian', 'Evelyn', 'Jack', 'Abigail'];
        const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'];

        // Seed 60 Students and their User Accounts
        for (let i = 0; i < 60; i++) {
            const fName = firstNames[i % firstNames.length];
            const lName = lastNames[Math.floor(i / 3) % lastNames.length];
            const fullName = `${fName} ${lName}`;
            const studentUserId = `user-student-${i + 1}`;
            const studentId = `student-${i + 1}`;
            const email = i === 0 ? 'student@gmail.com' : `${fName.toLowerCase()}.${lName.toLowerCase()}${i}@school.edu`;

            // If it's the first student, use the demo student user info
            if (i === 0) {
                this.db.students.push({
                    id: studentId,
                    user_id: demoStudentUser.id,
                    name: demoStudentUser.full_name,
                    email: demoStudentUser.email,
                    grade: 'Grade 5',
                    class: 'Primary',
                    role: 'student'
                });
            } else {
                // Create user account for each student
                this.db.users.push({
                    id: studentUserId,
                    email: email,
                    password: 'password123',
                    full_name: fullName,
                    role: 'student'
                });

                this.db.students.push({
                    id: studentId,
                    user_id: studentUserId,
                    name: fullName,
                    email: email,
                    grade: 'Grade 5',
                    class: 'Primary',
                    role: 'student'
                });
            }
        }

        // Seed Lessons with richness
        const subjects = ['Mathematics', 'Science', 'English'];
        subjects.forEach(subject => {
            for (let i = 1; i <= 9; i++) {
                this.db.lessons.push({
                    id: crypto.randomUUID(),
                    teacher_id: demoTeacher.id,
                    title: `${subject} Unit ${i}: ${this.getLessonSubTitle(subject, i)}`,
                    class_name: 'Primary',
                    grade: 'Grade 5',
                    subject: subject,
                    topic: `Topic ${i}`,
                    content: `Step-by-step comprehensive lesson material for ${subject} unit ${i}. This include key concepts, examples, and practice problems focused on ${this.getLessonSubTitle(subject, i)}.`,
                    duration: '45 mins',
                    resources: [
                        { title: 'Textbook Chapter', url: 'https://example.com/ebook' },
                        { title: 'Video Tutorial', url: 'https://youtube.com/watch?v=demo' }
                    ],
                    status: 'published',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                });
            }
        });

        // Seed Assessments
        const assessments = [
            { title: 'Fractions Discovery Quiz', subject: 'Mathematics' },
            { title: 'Solar System Mastery', subject: 'Science' },
            { title: 'Advanced Grammar Skills', subject: 'English' }
        ];

        assessments.forEach(a => {
            const assessmentId = crypto.randomUUID();
            this.db.assessments.push({
                id: assessmentId,
                teacher_id: demoTeacher.id,
                title: a.title,
                subject: a.subject,
                class_name: 'Primary',
                grade: 'Grade 5',
                topic: 'Introduction',
                type: 'mcq',
                difficulty: 'medium',
                questions_count: 5,
                total_marks: 100,
                passing_marks: 40,
                time_limit: 30, // 30 minutes
                status: 'published',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            });

            // Seed questions for each
            for (let j = 1; j <= 5; j++) {
                const options = [
                    { text: 'Concept X', isCorrect: true },
                    { text: 'Concept Y', isCorrect: false },
                    { text: 'Concept Z', isCorrect: false },
                    { text: 'All of above', isCorrect: false }
                ];
                this.db.questions.push({
                    id: crypto.randomUUID(),
                    assessment_id: assessmentId,
                    question_text: `Complex question ${j} for ${a.title}. Please evaluate the options.`,
                    question_type: 'mcq',
                    options: options,
                    correct_answer: options[0].text,
                    marks: 20
                });
            }
        });

        // Seed some grades
        this.db.students.slice(1, 15).forEach(student => {
            this.db.assessments.forEach(ass => {
                const score = 60 + Math.floor(Math.random() * 40);
                this.db.grades.push({
                    id: crypto.randomUUID(),
                    assessment_id: ass.id,
                    student_id: student.id,
                    total_score: score,
                    max_score: 100,
                    percentage: score,
                    grade_letter: score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : 'D',
                    graded_at: new Date().toISOString()
                });
            });
        });

        // Seed Schedule Events for every weekday (Mon-Fri) for current month
        const eventColors = ['bg-primary/10 text-primary border-primary/20', 'bg-accent/10 text-accent border-accent/20', 'bg-warning/10 text-warning border-warning/20', 'bg-success/10 text-success border-success/20'];
        const categories = ['lecture', 'lab', 'seminar', 'review'];

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        for (let d = new Date(startOfMonth); d <= endOfMonth; d.setDate(d.getDate() + 1)) {
            const dayOfWeek = d.getDay(); // 0 is Sunday, 6 is Saturday
            if (dayOfWeek === 0 || dayOfWeek === 6) continue; // Skip weekends

            const dateStr = d.toISOString().split('T')[0];
            const dailyCount = 2 + Math.floor(Math.random() * 3);

            for (let i = 0; i < dailyCount; i++) {
                const hour = 8 + (i * 3);
                const subjIdx = (d.getDate() + i) % subjects.length;
                this.db.events.push({
                    id: crypto.randomUUID(),
                    title: `${subjects[subjIdx]} ${i + 1}`,
                    start: `${dateStr}T${hour.toString().padStart(2, '0')}:00:00`,
                    end: `${dateStr}T${(hour + 2).toString().padStart(2, '0')}:30:00`,
                    category: categories[i % categories.length],
                    color: eventColors[subjIdx % eventColors.length]
                });
            }
        }

        this.save();
    }

    private getLessonSubTitle(subject: string, i: number): string {
        const subs: any = {
            'Mathematics': ['Numbers', 'Algebra', 'Geometry', 'Fractions', 'Decimals', 'Ratios', 'Percentages', 'Statistics', 'Probability'],
            'Science': ['Plants', 'Animals', 'Solar System', 'Energy', 'Forces', 'Matter', 'Chemicals', 'Environment', 'Human Body'],
            'English': ['Nouns', 'Verbs', 'Adjectives', 'Sentence Structure', 'Punctuation', 'Creative Writing', 'Comprehension', 'Poetry', 'Drama']
        };
        return (subs[subject] || [])[i - 1] || 'General Studies';
    }

    async reseed(teacherId: string) {
        localStorage.removeItem('lms_data');
        this.db = {
            users: [],
            lessons: [],
            assessments: [],
            questions: [],
            students: [],
            grades: [],
            submissions: [],
            events: []
        };
        this.seed();
        return { success: true };
    }

    // --- AUTH ---
    async signIn({ email, password }: any) {
        const user = this.db.users.find((u: any) => u.email === email && u.password === password);
        if (user) {
            const session = { user, access_token: 'mock-token', expires_at: Date.now() + 3600000 };
            localStorage.setItem('lms_session', JSON.stringify(session));
            return { data: { user, session }, error: null };
        }
        return { data: { user: null, session: null }, error: { message: 'Invalid credentials' } };
    }

    async signOut() {
        localStorage.removeItem('lms_session');
        return { error: null };
    }

    async getSession() {
        const saved = localStorage.getItem('lms_session');
        if (saved) {
            try {
                const session = JSON.parse(saved);
                return { data: { session }, error: null };
            } catch (e) {
                return { data: { session: null }, error: null };
            }
        }
        return { data: { session: null }, error: null };
    }

    // --- Lessons ---
    async getLessons(teacherId: string): Promise<{ data: any[], error: null }> {
        return { data: this.db.lessons.filter((l: any) => l.teacher_id === teacherId), error: null };
    }

    async getLesson(id: string): Promise<{ data: any | null, error: any }> {
        const lesson = this.db.lessons.find((l: any) => l.id === id);
        return { data: lesson || null, error: lesson ? null : { message: 'Lesson not found' } };
    }

    async createLesson(lesson: any): Promise<{ data: any, error: null }> {
        const newLesson = { ...lesson, id: crypto.randomUUID(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
        this.db.lessons.unshift(newLesson);
        this.save();
        return { data: newLesson, error: null };
    }

    async updateLesson(id: string, updates: any): Promise<{ data: any, error: any }> {
        const idx = this.db.lessons.findIndex((l: any) => l.id === id);
        if (idx === -1) return { data: null, error: { message: 'Lesson not found' } };
        this.db.lessons[idx] = { ...this.db.lessons[idx], ...updates, updated_at: new Date().toISOString() };
        this.save();
        return { data: this.db.lessons[idx], error: null };
    }

    async deleteLesson(id: string): Promise<{ error: null }> {
        this.db.lessons = this.db.lessons.filter((l: any) => l.id !== id);
        this.save();
        return { error: null };
    }

    // --- Assessments ---
    async getAssessments(teacherId: string): Promise<{ data: Assessment[], error: null }> {
        const assessments = this.db.assessments.filter((a: any) => a.teacher_id === teacherId);
        const withStats = assessments.map((a: any) => ({
            ...a,
            submissions_count: this.db.submissions.filter((s: any) => s.assessment_id === a.id).length +
                this.db.grades.filter((g: any) => g.assessment_id === a.id).length,
            questions_count: this.db.questions.filter((q: any) => q.assessment_id === a.id).length || a.questions_count || 0
        }));
        return { data: withStats as Assessment[], error: null };
    }

    async getAssessment(id: string): Promise<{ data: Assessment | null, error: any }> {
        const a = this.db.assessments.find((ass: any) => ass.id === id);
        return { data: a || null, error: a ? null : { message: 'Assessment not found' } };
    }

    async getAvailableAssessments(grade: string): Promise<{ data: Assessment[], error: null }> {
        return { data: this.db.assessments.filter((a: any) => a.grade === grade && a.status === 'published'), error: null };
    }

    async createAssessmentWithQuestions(assessment: any, questions: any[]): Promise<{ data: Assessment, error: null }> {
        const assessmentId = crypto.randomUUID();
        const newAssessment = { ...assessment, id: assessmentId, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
        this.db.assessments.unshift(newAssessment);

        const newQuestions = questions.map(q => ({
            ...q,
            id: crypto.randomUUID(),
            assessment_id: assessmentId,
            options: Array.isArray(q.options) ? q.options : JSON.parse(q.options || '[]')
        }));
        this.db.questions.push(...newQuestions);

        this.save();
        return { data: newAssessment as Assessment, error: null };
    }

    async updateAssessment(id: string, updates: any): Promise<{ data: Assessment | null, error: any }> {
        const idx = this.db.assessments.findIndex((a: any) => a.id === id);
        if (idx === -1) return { data: null, error: { message: 'Assessment not found' } };
        this.db.assessments[idx] = { ...this.db.assessments[idx], ...updates, updated_at: new Date().toISOString() };
        this.save();
        return { data: this.db.assessments[idx], error: null };
    }

    async deleteAssessment(id: string): Promise<{ error: null }> {
        this.db.assessments = this.db.assessments.filter((a: any) => a.id !== id);
        this.db.questions = this.db.questions.filter((q: any) => q.assessment_id !== id);
        this.db.grades = this.db.grades.filter((g: any) => g.assessment_id !== id);
        this.db.submissions = this.db.submissions.filter((s: any) => s.assessment_id !== id);
        this.save();
        return { error: null };
    }

    // --- Students ---
    async getStudents(): Promise<{ data: Student[], error: null }> {
        return { data: this.db.students, error: null };
    }

    async getStudent(id: string): Promise<{ data: Student | null, error: any }> {
        const s = this.db.students.find((std: any) => std.id === id);
        return { data: s || null, error: s ? null : { message: 'Student not found' } };
    }

    async getStudentByUserId(userId: string): Promise<{ data: Student | null, error: any }> {
        const s = this.db.students.find((std: any) => std.user_id === userId);
        return { data: s || null, error: s ? null : { message: 'Student profile not found' } };
    }

    async updateStudent(id: string, updates: any): Promise<{ data: Student | null, error: any }> {
        const idx = this.db.students.findIndex((s: any) => s.id === id);
        if (idx === -1) return { data: null, error: { message: 'Student not found' } };
        this.db.students[idx] = { ...this.db.students[idx], ...updates };
        this.save();
        return { data: this.db.students[idx], error: null };
    }

    async getProfiles(ids: string[]): Promise<{ data: Student[], error: null }> {
        // Mock returning students as "profiles"
        return { data: this.db.students.filter((s: any) => ids.includes(s.id)), error: null };
    }

    // --- Grades ---
    async getGrades(assessmentIds: string[]): Promise<{ data: Grade[], error: null }> {
        return { data: this.db.grades.filter((g: any) => assessmentIds.includes(g.assessment_id)), error: null };
    }

    async getStudentGrades(studentId: string): Promise<{ data: Grade[], error: null }> {
        return { data: this.db.grades.filter((g: any) => g.student_id === studentId), error: null };
    }

    async getAllGrades(): Promise<{ data: Grade[], error: null }> {
        return { data: this.db.grades, error: null };
    }

    // --- Questions ---
    async getQuestions(assessmentId: string): Promise<{ data: Question[], error: null }> {
        return { data: this.db.questions.filter((q: any) => q.assessment_id === assessmentId), error: null };
    }

    // --- Submissions ---
    async getSubmissions(assessmentIds: string[]): Promise<{ data: Submission[], error: null }> {
        return { data: this.db.submissions.filter((s: any) => assessmentIds.includes(s.assessment_id)), error: null };
    }

    async getStudentSubmissions(studentId: string): Promise<{ data: Submission[], error: null }> {
        return { data: this.db.submissions.filter((s: any) => s.student_id === studentId), error: null };
    }

    async submitAssessment(submission: any) {
        const subId = crypto.randomUUID();
        const newSubmission = {
            ...submission,
            id: subId,
            status: 'submitted',
            submitted_at: new Date().toISOString(),
            created_at: new Date().toISOString()
        };
        this.db.submissions.push(newSubmission);
        this.save();
        return { data: newSubmission, error: null };
    }

    async addGrade(grade: any) {
        const newGrade = {
            ...grade,
            id: crypto.randomUUID(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        this.db.grades.push(newGrade);
        this.save();
        return { data: newGrade, error: null };
    }

    // --- Analytics ---
    async getAnalytics(teacherId: string) {
        const myLessons = this.db.lessons.filter((l: any) => l.teacher_id === teacherId);
        const myAssessments = this.db.assessments.filter((a: any) => a.teacher_id === teacherId);
        const assessmentIds = myAssessments.map((a: any) => a.id);
        const myGrades = this.db.grades.filter((g: any) => assessmentIds.includes(g.assessment_id));

        const avg = myGrades.length > 0
            ? myGrades.reduce((sum: number, g: any) => sum + g.percentage, 0) / myGrades.length
            : 0;

        return {
            totalStudents: this.db.students.length,
            totalLessons: myLessons.length,
            totalAssessments: myAssessments.length,
            classAverage: Math.round(avg)
        };
    }

    async getStudentAnalytics(studentId: string) {
        const myGrades = this.db.grades.filter((g: any) => g.student_id === studentId);
        const avg = myGrades.length > 0
            ? myGrades.reduce((sum: number, g: any) => sum + g.percentage, 0) / myGrades.length
            : 0;

        return {
            averageScore: Math.round(avg),
            completedAssessments: myGrades.length,
            pendingAssessments: this.db.assessments.length - myGrades.length,
            recentPerformance: myGrades.slice(-5).map(g => g.percentage)
        };
    }

    async getEvents(): Promise<{ data: ScheduleEvent[], error: null }> {
        return { data: this.db.events, error: null };
    }

    async updateEvents(events: ScheduleEvent[]): Promise<{ error: null }> {
        this.db.events = events;
        this.save();
        return { error: null };
    }
}

export const dbService = new LocalDatabaseService();

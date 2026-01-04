
import { Student, Lesson, Assessment, Grade, Submission, Question } from '@/types';
import { ScheduleEvent } from '@/services/ai';

const API_URL = '/api';

class ApiService {
    // --- Students ---
    async getStudents(): Promise<{ data: Student[], error: any }> {
        try {
            const res = await fetch(`${API_URL}/students`);
            if (!res.ok) throw new Error('Failed to fetch students');
            const json = await res.json();
            return { data: json.data, error: null };
        } catch (error: any) {
            console.error('API Error:', error);
            return { data: [], error: error.message };
        }
    }

    async getStudentByUserId(userId: string): Promise<{ data: Student | null, error: any }> {
        try {
            const res = await fetch(`${API_URL}/students/user/${userId}`);
            if (!res.ok) throw new Error('Student not found');
            const json = await res.json();
            return { data: json.data, error: null };
        } catch (error: any) {
            return { data: null, error: error.message };
        }
    }


    async getStudentGrades(studentId: string): Promise<{ data: any[], error: any }> {
        try {
            const res = await fetch(`${API_URL}/students/${studentId}/grades`);
            if (!res.ok) throw new Error('Failed to fetch grades');
            const json = await res.json();
            return { data: json.data, error: null };
        } catch (error: any) {
            return { data: [], error: error.message };
        }
    }

    async getStudentSubmissions(studentId: string): Promise<{ data: any[], error: any }> {
        // Placeholder for specific student submissions endpoint if it differs
        // For now, filtering might happen on backend or we use a specific endpoint
        try {
            // Assuming an endpoint exists or we reuse submissions with a query param?
            // Since the backend doesn't explicitly list this, we might need to add it or fetch all.
            // Let's assume fetching all generic submissions is not efficient for a student.
            // BUT, looking at server.cjs, we might need to add this route or similar.
            // For now, let's implement a stub or a fetch that matches what useStudentAssignment expects.
            const res = await fetch(`${API_URL}/submissions?student_id=${studentId}`);
            if (!res.ok) return { data: [], error: 'Not implemented' }; // Fallback
            const json = await res.json();
            return { data: json.data, error: null };
        } catch (error: any) {
            return { data: [], error: error.message };
        }
    }

    async updateStudent(id: string, updates: any): Promise<{ data: Student | null, error: any }> {
        try {
            const res = await fetch(`${API_URL}/students/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });
            if (!res.ok) throw new Error('Failed to update student');
            const json = await res.json();
            return { data: json.data, error: null };
        } catch (error: any) {
            return { data: null, error: error.message };
        }
    }

    async createStudent(studentData: { name: string; email: string; grade: string; class: string }): Promise<{ data: Student | null, error: any }> {
        try {
            const res = await fetch(`${API_URL}/students`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(studentData)
            });
            if (!res.ok) throw new Error('Failed to create student');
            const json = await res.json();
            return { data: json.data, error: null };
        } catch (error: any) {
            return { data: null, error: error.message };
        }
    }

    async createStudentsBulk(students: Array<{ name: string; email: string; grade: string; class: string }>): Promise<{ data: Student[], errors: any[], error: any }> {
        try {
            const res = await fetch(`${API_URL}/students/bulk`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ students })
            });
            if (!res.ok) throw new Error('Failed to import students');
            const json = await res.json();
            return { data: json.data || [], errors: json.errors || [], error: null };
        } catch (error: any) {
            return { data: [], errors: [], error: error.message };
        }
    }


    // --- Teachers ---
    async getTeachers(): Promise<{ data: any[], error: any }> {
        try {
            const res = await fetch(`${API_URL}/teachers`);
            if (!res.ok) throw new Error('Failed to fetch teachers');
            const json = await res.json();
            return { data: json.data, error: null };
        } catch (error: any) {
            return { data: [], error: null }; // Return empty on error to avoid breaking UI
        }
    }


    // --- Lessons ---
    async getLessons(teacherId: string = 'teacher-demo-id'): Promise<{ data: Lesson[], error: any }> {
        try {
            const res = await fetch(`${API_URL}/lessons`);
            if (!res.ok) throw new Error('Failed to fetch lessons');
            const json = await res.json();
            return { data: json.data, error: null };
        } catch (error: any) {
            return { data: [], error: error.message };
        }
    }

    async getLesson(id: string): Promise<{ data: Lesson | null, error: any }> {
        try {
            const res = await fetch(`${API_URL}/lessons/${id}`);
            if (!res.ok) throw new Error('Lesson not found');
            const json = await res.json();
            return { data: json.data, error: null };
        } catch (error: any) {
            return { data: null, error: error.message };
        }
    }

    async updateLesson(id: string, updates: any): Promise<{ data: Lesson | null, error: any }> {
        try {
            const res = await fetch(`${API_URL}/lessons/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });
            if (!res.ok) throw new Error('Failed to update lesson');
            const json = await res.json();
            return { data: json.data, error: null };
        } catch (error: any) {
            return { data: null, error: error.message };
        }
    }

    async deleteLesson(id: string): Promise<{ success: boolean, error: any }> {
        try {
            const res = await fetch(`${API_URL}/lessons/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete lesson');
            return { success: true, error: null };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    }

    // --- Events ---
    async getEvents(): Promise<{ data: ScheduleEvent[], error: any }> {
        try {
            const res = await fetch(`${API_URL}/events`);
            if (!res.ok) throw new Error('Failed to fetch events');
            const json = await res.json();
            return { data: json.data, error: null };
        } catch (error: any) {
            return { data: [], error: error.message };
        }
    }

    async updateEvents(events: ScheduleEvent[]): Promise<{ data: ScheduleEvent[], error: any }> {
        // Bulk update or just single? The UI likely expects bulk or this is a placebo
        // Let's implement single add/update for now on backend, but here we stub it
        return { data: events, error: null };
    }


    // --- Analytics / Dashboard ---
    async getDashboardStats(teacherId: string = 'teacher-demo-id') {
        try {
            const res = await fetch(`${API_URL}/dashboard/stats`);
            if (!res.ok) throw new Error('Failed to fetch stats');
            return await res.json();
        } catch (error) {
            console.error(error);
            return { totalStudents: 0, totalLessons: 0, totalAssessments: 0, classAverage: 0 };
        }
    }

    async getStudentAnalytics(studentId: string): Promise<{ data: any, error: any }> {
        // Stub for now
        return { data: {}, error: null };
    }

    // --- Assessments ---
    async getAssessments(teacherId: string): Promise<{ data: Assessment[], error: any }> {
        try {
            const res = await fetch(`${API_URL}/assessments`);
            if (!res.ok) throw new Error('Failed to fetch assessments');
            const json = await res.json();
            return { data: json.data, error: null };
        } catch (error: any) {
            return { data: [], error: error.message };
        }
    }

    async getAvailableAssessments(grade?: string): Promise<{ data: Assessment[], error: any }> {
        try {
            const res = await fetch(`${API_URL}/published-assessments`);
            if (!res.ok) throw new Error('Failed fetch');
            const json = await res.json();
            return { data: json.data, error: null };
        } catch (error: any) {
            return { data: [], error: error.message };
        }
    }

    async getAssessment(id: string): Promise<{ data: Assessment | null, error: any }> {
        try {
            const res = await fetch(`${API_URL}/assessments/${id}`);
            if (!res.ok) throw new Error('Not found');
            const json = await res.json();
            return { data: json.data, error: null };
        } catch (error: any) {
            return { data: null, error: error.message };
        }
    }

    async updateAssessment(id: string, updates: any): Promise<{ data: Assessment | null, error: any }> {
        try {
            const res = await fetch(`${API_URL}/assessments/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });
            if (!res.ok) throw new Error('Failed to update');
            const json = await res.json();
            return { data: json.data, error: null };
        } catch (error: any) {
            return { data: null, error: error.message };
        }
    }

    async deleteAssessment(id: string): Promise<{ success: boolean, error: any }> {
        try {
            const res = await fetch(`${API_URL}/assessments/${id}`, {
                method: 'DELETE'
            });
            return { success: res.ok, error: null };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    }

    async getQuestions(assessmentId: string): Promise<{ data: Question[], error: any }> {
        try {
            const res = await fetch(`${API_URL}/assessments/${assessmentId}/questions`);
            if (!res.ok) throw new Error('Failed to fetch questions');
            const json = await res.json();
            return { data: json.data, error: null };
        } catch (error: any) {
            return { data: [], error: error.message };
        }
    }

    async getGrades(ids: string[] = []): Promise<{ data: Grade[], error: any }> {
        try {
            const res = await fetch(`${API_URL}/grades`);
            if (!res.ok) throw new Error('Failed to fetch grades');
            const json = await res.json();
            return { data: json.data, error: null };
        } catch (error: any) {
            return { data: [], error: error.message };
        }
    }

    async getAllGrades(): Promise<{ data: Grade[], error: any }> {
        return this.getGrades();
    }

    async getSubmissions(ids: string[] = []): Promise<{ data: Submission[], error: any }> {
        try {
            const res = await fetch(`${API_URL}/submissions`);
            if (!res.ok) throw new Error('Failed to fetch submissions');
            const json = await res.json();
            return { data: json.data, error: null };
        } catch (error: any) {
            return { data: [], error: error.message };
        }
    }

    async submitAssessment(data: any): Promise<{ data: any, error: any }> {
        try {
            const res = await fetch(`${API_URL}/submissions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const json = await res.json();
            return { data: json, error: null };
        } catch (error: any) {
            return { data: null, error: error.message };
        }
    }

    // --- Dev / Seed ---
    async reseed(): Promise<void> {
        // Call backend seed endpoint if exists, else log
        console.log("Reseed requested");
    }
}

export const dbService = new ApiService();

export interface Assessment {
  id: string;
  teacher_id: string;
  title: string;
  description: string | null;
  class_name: string;
  grade: string;
  subject: string;
  topic: string;
  type: 'mcq' | 'written' | 'mixed' | 'gamified';
  difficulty: 'easy' | 'medium' | 'hard';
  time_limit: number | null;
  total_marks: number;
  passing_marks: number;
  status: 'draft' | 'published' | 'closed';
  due_date: string | null;
  release_date: string | null;
  rubric: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Question {
  id: string;
  assessment_id: string;
  question_text: string;
  question_type: 'mcq' | 'short_answer' | 'long_answer' | 'true_false';
  options: QuestionOption[];
  correct_answer: string | null;
  marks: number;
  hint: string | null;
  explanation: string | null;
  order_index: number;
  created_at: string;
}

export interface QuestionOption {
  text: string;
  isCorrect: boolean;
}

export interface Submission {
  id: string;
  assessment_id: string;
  student_id: string;
  answers: Record<string, string>;
  started_at: string | null;
  submitted_at: string | null;
  status: 'in_progress' | 'submitted' | 'graded';
  time_taken: number | null;
  created_at: string;
}

export interface Grade {
  id: string;
  submission_id: string;
  assessment_id: string;
  student_id: string;
  total_score: number;
  max_score: number;
  percentage: number;
  grade_letter: string | null;
  feedback: Record<string, { score: number; feedback: string }>;
  ai_feedback: string | null;
  teacher_comments: string | null;
  graded_at: string | null;
  graded_by: 'ai' | 'teacher';
  created_at: string;
  updated_at: string;
}

export interface StudentEnrollment {
  id: string;
  student_id: string;
  class_name: string;
  grade: string;
  subject: string;
  enrolled_at: string;
}

export interface AssessmentWithStats extends Assessment {
  questions_count?: number;
  submissions_count?: number;
  average_score?: number;
}

export interface StudentGradeWithDetails extends Grade {
  student_name?: string;
  student_email?: string;
  assessment_title?: string;
}

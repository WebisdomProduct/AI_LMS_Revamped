export type UserRole = 'teacher' | 'student' | 'admin';

export interface User {
  id: string;
  email: string;
  fullName: string | null;
  role: UserRole;
  avatarUrl: string | null;
}

export interface Profile {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface CurriculumMetadata {
  id: string;
  class_name: string;
  grade: string;
  subject: string;
  topics: string[];
  created_at: string;
}

export interface Lesson {
  id: string;
  teacher_id: string;
  title: string;
  class_name: string;
  grade: string;
  subject: string;
  topic: string;
  content: string;
  prompt: string | null;
  status: 'draft' | 'published' | 'archived';
  shared_with: string[];
  google_doc_id: string | null;
  created_at: string;
  updated_at: string;
  duration?: string;
  resources?: { title: string; url: string }[];
}

export interface LessonContext {
  className: string;
  grade: string;
  subject: string;
  topic: string;
}

export interface NavigationItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  grade: string;
  class: string;
  avatar_url?: string;
  remarks?: string;
  average?: number;
}

export interface Question {
  id: string;
  assessment_id: string;
  question_text: string;
  question_type: 'mcq' | 'long_text';
  options: { text: string; isCorrect: boolean }[];
  correct_answer: string;
  marks: number;
}

export interface RubricItem {
  criteria: string;
  points: number;
}

export interface Assessment {
  id: string;
  teacher_id: string;
  title: string;
  subject: string;
  class_name: string;
  grade: string;
  topic: string;
  type: string;
  status: 'draft' | 'published' | 'archived';
  description?: string;
  time_limit?: number;
  questions?: Question[];
  rubric?: any;
  created_at: string;
  // Added properties
  questions_count?: number;
  submissions_count?: number;
  passing_marks?: number;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  due_date?: string;
  total_marks?: number;
}

export interface Submission {
  id: string;
  assessment_id: string;
  student_id: string;
  status: 'pending' | 'submitted' | 'graded';
  submitted_at: string;
  answers: Record<string, string>;
  grade?: Grade;
}

export interface Grade {
  id: string;
  assessment_id: string;
  student_id: string;
  total_score: number;
  max_score: number;
  percentage: number;
  grade_letter: string | null;
  ai_feedback: string | null;
  graded_at: string;
}

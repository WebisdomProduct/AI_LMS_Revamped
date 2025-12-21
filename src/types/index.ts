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

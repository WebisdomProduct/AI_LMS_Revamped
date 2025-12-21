-- Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL CHECK (role IN ('teacher', 'student', 'admin')),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Lessons Table
CREATE TABLE IF NOT EXISTS public.lessons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID NOT NULL,
  title TEXT NOT NULL,
  class_name TEXT NOT NULL,
  grade TEXT NOT NULL,
  subject TEXT NOT NULL,
  topic TEXT NOT NULL,
  content TEXT NOT NULL,
  prompt TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  shared_with UUID[] DEFAULT '{}',
  google_doc_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Assessments Table
CREATE TABLE IF NOT EXISTS public.assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  class_name TEXT NOT NULL,
  grade TEXT NOT NULL,
  subject TEXT NOT NULL,
  topic TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'mcq',
  difficulty TEXT DEFAULT 'medium',
  time_limit INTEGER,
  total_marks INTEGER DEFAULT 100,
  passing_marks INTEGER DEFAULT 40,
  status TEXT NOT NULL DEFAULT 'draft',
  due_date TIMESTAMP WITH TIME ZONE,
  release_date TIMESTAMP WITH TIME ZONE,
  rubric JSONB DEFAULT '{}',
  questions_count INTEGER DEFAULT 0,
  submissions_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Questions Table
CREATE TABLE IF NOT EXISTS public.questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  assessment_id UUID NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL DEFAULT 'mcq',
  options JSONB DEFAULT '[]',
  correct_answer TEXT,
  marks INTEGER DEFAULT 1,
  hint TEXT,
  explanation TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Student Enrollments Table
CREATE TABLE IF NOT EXISTS public.student_enrollments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL,
  class_name TEXT NOT NULL,
  grade TEXT NOT NULL,
  subject TEXT NOT NULL,
  enrolled_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Submissions Table
CREATE TABLE IF NOT EXISTS public.submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  assessment_id UUID NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
  student_id UUID NOT NULL,
  answers JSONB NOT NULL DEFAULT '{}',
  started_at TIMESTAMP WITH TIME ZONE,
  submitted_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'in_progress',
  time_taken INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Grades Table
CREATE TABLE IF NOT EXISTS public.grades (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  submission_id UUID NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
  assessment_id UUID NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
  student_id UUID NOT NULL,
  total_score DECIMAL(5,2) NOT NULL DEFAULT 0,
  max_score DECIMAL(5,2) NOT NULL DEFAULT 100,
  percentage DECIMAL(5,2) NOT NULL DEFAULT 0,
  grade_letter TEXT,
  feedback JSONB DEFAULT '{}',
  ai_feedback TEXT,
  teacher_comments TEXT,
  graded_at TIMESTAMP WITH TIME ZONE,
  graded_by TEXT DEFAULT 'ai',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_lessons_updated_at ON public.lessons;
CREATE TRIGGER update_lessons_updated_at BEFORE UPDATE ON public.lessons FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_assessments_updated_at ON public.assessments;
CREATE TRIGGER update_assessments_updated_at BEFORE UPDATE ON public.assessments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_grades_updated_at ON public.grades;
CREATE TRIGGER update_grades_updated_at BEFORE UPDATE ON public.grades FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

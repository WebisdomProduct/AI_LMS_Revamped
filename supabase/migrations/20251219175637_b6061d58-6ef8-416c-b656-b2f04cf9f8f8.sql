-- Create assessments table
CREATE TABLE public.assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  class_name TEXT NOT NULL,
  grade TEXT NOT NULL,
  subject TEXT NOT NULL,
  topic TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'mcq', -- mcq, written, mixed, gamified
  difficulty TEXT DEFAULT 'medium', -- easy, medium, hard
  time_limit INTEGER, -- in minutes
  total_marks INTEGER DEFAULT 100,
  passing_marks INTEGER DEFAULT 40,
  status TEXT NOT NULL DEFAULT 'draft', -- draft, published, closed
  due_date TIMESTAMP WITH TIME ZONE,
  release_date TIMESTAMP WITH TIME ZONE,
  rubric JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create questions table
CREATE TABLE public.questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  assessment_id UUID NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL DEFAULT 'mcq', -- mcq, short_answer, long_answer, true_false
  options JSONB DEFAULT '[]', -- for MCQ: [{text, isCorrect}]
  correct_answer TEXT,
  marks INTEGER DEFAULT 1,
  hint TEXT,
  explanation TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create student_enrollments table (to track which students are in which class)
CREATE TABLE public.student_enrollments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL,
  class_name TEXT NOT NULL,
  grade TEXT NOT NULL,
  subject TEXT NOT NULL,
  enrolled_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create submissions table
CREATE TABLE public.submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  assessment_id UUID NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
  student_id UUID NOT NULL,
  answers JSONB NOT NULL DEFAULT '{}', -- {question_id: answer_text}
  started_at TIMESTAMP WITH TIME ZONE,
  submitted_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'in_progress', -- in_progress, submitted, graded
  time_taken INTEGER, -- in seconds
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create grades table
CREATE TABLE public.grades (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  submission_id UUID NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
  assessment_id UUID NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
  student_id UUID NOT NULL,
  total_score DECIMAL(5,2) NOT NULL DEFAULT 0,
  max_score DECIMAL(5,2) NOT NULL DEFAULT 100,
  percentage DECIMAL(5,2) NOT NULL DEFAULT 0,
  grade_letter TEXT,
  feedback JSONB DEFAULT '{}', -- {question_id: {score, feedback}}
  ai_feedback TEXT,
  teacher_comments TEXT,
  graded_at TIMESTAMP WITH TIME ZONE,
  graded_by TEXT DEFAULT 'ai', -- ai, teacher
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;

-- Assessments policies
CREATE POLICY "Teachers can view their own assessments"
ON public.assessments FOR SELECT
USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can create assessments"
ON public.assessments FOR INSERT
WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "Teachers can update their own assessments"
ON public.assessments FOR UPDATE
USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can delete their own assessments"
ON public.assessments FOR DELETE
USING (auth.uid() = teacher_id);

-- Students can view published assessments (for their enrolled classes)
CREATE POLICY "Students can view published assessments"
ON public.assessments FOR SELECT
USING (status = 'published');

-- Questions policies
CREATE POLICY "Teachers can manage questions for their assessments"
ON public.questions FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.assessments a
    WHERE a.id = questions.assessment_id
    AND a.teacher_id = auth.uid()
  )
);

CREATE POLICY "Students can view questions for published assessments"
ON public.questions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.assessments a
    WHERE a.id = questions.assessment_id
    AND a.status = 'published'
  )
);

-- Enrollments policies
CREATE POLICY "Teachers can view enrollments"
ON public.student_enrollments FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Teachers can manage enrollments"
ON public.student_enrollments FOR ALL
USING (auth.uid() IS NOT NULL);

-- Submissions policies
CREATE POLICY "Students can create and view their own submissions"
ON public.submissions FOR ALL
USING (auth.uid() = student_id);

CREATE POLICY "Teachers can view submissions for their assessments"
ON public.submissions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.assessments a
    WHERE a.id = submissions.assessment_id
    AND a.teacher_id = auth.uid()
  )
);

-- Grades policies
CREATE POLICY "Students can view their own grades"
ON public.grades FOR SELECT
USING (auth.uid() = student_id);

CREATE POLICY "Teachers can manage grades for their assessments"
ON public.grades FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.assessments a
    WHERE a.id = grades.assessment_id
    AND a.teacher_id = auth.uid()
  )
);

-- Create triggers for updated_at
CREATE TRIGGER update_assessments_updated_at
BEFORE UPDATE ON public.assessments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_grades_updated_at
BEFORE UPDATE ON public.grades
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_assessments_teacher ON public.assessments(teacher_id);
CREATE INDEX idx_assessments_status ON public.assessments(status);
CREATE INDEX idx_questions_assessment ON public.questions(assessment_id);
CREATE INDEX idx_submissions_assessment ON public.submissions(assessment_id);
CREATE INDEX idx_submissions_student ON public.submissions(student_id);
CREATE INDEX idx_grades_student ON public.grades(student_id);
CREATE INDEX idx_grades_assessment ON public.grades(assessment_id);
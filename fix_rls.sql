-- Enable RLS (just in case)
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 1. Assessments Policies
DROP POLICY IF EXISTS "Teachers can view their own assessments" ON public.assessments;
CREATE POLICY "Teachers can view their own assessments"
ON public.assessments FOR SELECT
USING (auth.uid() = teacher_id);

DROP POLICY IF EXISTS "Teachers can create assessments" ON public.assessments;
CREATE POLICY "Teachers can create assessments"
ON public.assessments FOR INSERT
WITH CHECK (auth.uid() = teacher_id);

DROP POLICY IF EXISTS "Teachers can update their own assessments" ON public.assessments;
CREATE POLICY "Teachers can update their own assessments"
ON public.assessments FOR UPDATE
USING (auth.uid() = teacher_id);

DROP POLICY IF EXISTS "Teachers can delete their own assessments" ON public.assessments;
CREATE POLICY "Teachers can delete their own assessments"
ON public.assessments FOR DELETE
USING (auth.uid() = teacher_id);

-- 2. Profiles Policies (For Students list)
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;
CREATE POLICY "Authenticated users can view profiles"
ON public.profiles FOR SELECT
USING (auth.role() = 'authenticated');
-- Note: In a real app, strict filtering by class/teacher would be better, but for demo: all auth users can see profiles.

-- 3. Student Enrollments Policies (For Roster)
DROP POLICY IF EXISTS "Teachers can view enrollments" ON public.student_enrollments;
CREATE POLICY "Teachers can view enrollments"
ON public.student_enrollments FOR SELECT
USING (auth.uid() IS NOT NULL);

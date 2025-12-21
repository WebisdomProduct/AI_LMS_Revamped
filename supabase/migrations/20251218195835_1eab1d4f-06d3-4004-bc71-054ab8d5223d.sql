-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL CHECK (role IN ('teacher', 'student', 'admin')),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Create curriculum metadata table
CREATE TABLE public.curriculum_metadata (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  class_name TEXT NOT NULL,
  grade TEXT NOT NULL,
  subject TEXT NOT NULL,
  topics TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on curriculum_metadata
ALTER TABLE public.curriculum_metadata ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can view curriculum
CREATE POLICY "Authenticated users can view curriculum" ON public.curriculum_metadata FOR SELECT USING (auth.uid() IS NOT NULL);

-- Create lessons table
CREATE TABLE public.lessons (
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

-- Enable RLS on lessons
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

-- Lessons policies
CREATE POLICY "Teachers can view their own lessons" ON public.lessons FOR SELECT USING (auth.uid() = teacher_id);
CREATE POLICY "Teachers can insert their own lessons" ON public.lessons FOR INSERT WITH CHECK (auth.uid() = teacher_id);
CREATE POLICY "Teachers can update their own lessons" ON public.lessons FOR UPDATE USING (auth.uid() = teacher_id);
CREATE POLICY "Teachers can delete their own lessons" ON public.lessons FOR DELETE USING (auth.uid() = teacher_id);
CREATE POLICY "Teachers can view shared lessons" ON public.lessons FOR SELECT USING (auth.uid() = ANY(shared_with));

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_lessons_updated_at BEFORE UPDATE ON public.lessons FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample curriculum data (CBSE based)
INSERT INTO public.curriculum_metadata (class_name, grade, subject, topics) VALUES
('Primary', 'Grade 1', 'Mathematics', ARRAY['Numbers 1-100', 'Addition', 'Subtraction', 'Shapes', 'Measurement']),
('Primary', 'Grade 2', 'Mathematics', ARRAY['Place Value', 'Addition with Carry', 'Subtraction with Borrow', 'Multiplication Intro', 'Time']),
('Primary', 'Grade 3', 'Mathematics', ARRAY['Multiplication Tables', 'Division', 'Fractions Intro', 'Geometry', 'Data Handling']),
('Primary', 'Grade 4', 'Mathematics', ARRAY['Large Numbers', 'Factors and Multiples', 'Fractions', 'Decimals', 'Patterns']),
('Primary', 'Grade 5', 'Mathematics', ARRAY['Fractions Operations', 'Decimals', 'Percentages', 'Area and Perimeter', 'Volume']),
('Primary', 'Grade 1', 'English', ARRAY['Alphabets', 'Phonics', 'Simple Words', 'Reading', 'Writing']),
('Primary', 'Grade 2', 'English', ARRAY['Sentence Formation', 'Grammar Basics', 'Vocabulary', 'Comprehension', 'Creative Writing']),
('Primary', 'Grade 3', 'English', ARRAY['Parts of Speech', 'Tenses', 'Composition', 'Poetry', 'Story Writing']),
('Primary', 'Grade 4', 'English', ARRAY['Advanced Grammar', 'Essay Writing', 'Comprehension', 'Letter Writing', 'Diary Entry']),
('Primary', 'Grade 5', 'English', ARRAY['Complex Sentences', 'Report Writing', 'Debate', 'Drama', 'Creative Expression']),
('Primary', 'Grade 1', 'Science', ARRAY['Living and Non-living', 'My Body', 'Plants', 'Animals', 'Weather']),
('Primary', 'Grade 2', 'Science', ARRAY['Food', 'Water', 'Shelter', 'Our Environment', 'Simple Machines']),
('Primary', 'Grade 3', 'Science', ARRAY['Matter', 'Force', 'Energy', 'Living Things', 'Earth and Space']),
('Primary', 'Grade 4', 'Science', ARRAY['Human Body Systems', 'Ecosystems', 'Materials', 'Motion', 'Light and Sound']),
('Primary', 'Grade 5', 'Science', ARRAY['Cells', 'Reproduction', 'Earth Science', 'Chemical Changes', 'Electricity']),
('Secondary', 'Grade 6', 'Mathematics', ARRAY['Integers', 'Algebra Intro', 'Geometry', 'Data Handling', 'Mensuration']),
('Secondary', 'Grade 7', 'Mathematics', ARRAY['Rational Numbers', 'Algebraic Expressions', 'Triangles', 'Symmetry', 'Statistics']),
('Secondary', 'Grade 8', 'Mathematics', ARRAY['Linear Equations', 'Quadrilaterals', 'Cubes and Cube Roots', 'Graphs', 'Probability']),
('Secondary', 'Grade 6', 'Science', ARRAY['Food and Nutrition', 'Fibers', 'Separation', 'Motion', 'Electricity Basics']),
('Secondary', 'Grade 7', 'Science', ARRAY['Acids and Bases', 'Physical and Chemical Changes', 'Weather', 'Respiration', 'Transportation']),
('Secondary', 'Grade 8', 'Science', ARRAY['Synthetic Materials', 'Metals', 'Coal and Petroleum', 'Combustion', 'Force and Pressure']);
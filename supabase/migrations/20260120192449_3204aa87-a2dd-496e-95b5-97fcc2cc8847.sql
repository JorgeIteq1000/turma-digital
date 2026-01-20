-- =========================================
-- EduConnect Platform - Complete Database Schema
-- =========================================

-- 1. Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'student');

-- 2. Profiles table (linked to auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Profiles: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- 3. User roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'student',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check user role (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- User roles: Users can view their own roles
CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- User roles: Admins can manage all roles
CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- 4. Courses table
CREATE TABLE public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- Courses: Everyone can view active courses
CREATE POLICY "Anyone can view active courses"
  ON public.courses FOR SELECT
  USING (is_active = true);

-- Courses: Admins can manage all courses
CREATE POLICY "Admins can manage courses"
  ON public.courses FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- 5. Class groups (turmas)
CREATE TABLE public.class_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.class_groups ENABLE ROW LEVEL SECURITY;

-- Class groups: Admins can manage all class groups
CREATE POLICY "Admins can manage class groups"
  ON public.class_groups FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- 6. Class enrollments (aluno <-> turma relationship)
CREATE TABLE public.class_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  class_group_id UUID REFERENCES public.class_groups(id) ON DELETE CASCADE NOT NULL,
  enrolled_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  UNIQUE (user_id, class_group_id)
);

ALTER TABLE public.class_enrollments ENABLE ROW LEVEL SECURITY;

-- Class enrollments: Users can view their own enrollments
CREATE POLICY "Users can view own enrollments"
  ON public.class_enrollments FOR SELECT
  USING (auth.uid() = user_id);

-- Class enrollments: Admins can manage all enrollments
CREATE POLICY "Admins can manage enrollments"
  ON public.class_enrollments FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Class groups: Students can view their enrolled class groups
CREATE POLICY "Students can view enrolled class groups"
  ON public.class_groups FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.class_enrollments
      WHERE class_enrollments.class_group_id = class_groups.id
      AND class_enrollments.user_id = auth.uid()
      AND class_enrollments.is_active = true
    )
  );

-- 7. Lessons (aulas)
CREATE TABLE public.lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_group_id UUID REFERENCES public.class_groups(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  youtube_url TEXT NOT NULL,
  material_url TEXT,
  material_name TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

-- Lessons: Admins can manage all lessons
CREATE POLICY "Admins can manage lessons"
  ON public.lessons FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Lessons: Students can view lessons from their enrolled class groups
CREATE POLICY "Students can view enrolled lessons"
  ON public.lessons FOR SELECT
  USING (
    is_published = true AND
    EXISTS (
      SELECT 1 FROM public.class_enrollments
      WHERE class_enrollments.class_group_id = lessons.class_group_id
      AND class_enrollments.user_id = auth.uid()
      AND class_enrollments.is_active = true
    )
  );

-- 8. Lesson views (registro de visualizações)
CREATE TABLE public.lesson_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE NOT NULL,
  viewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  watch_duration_seconds INTEGER DEFAULT 0,
  UNIQUE (user_id, lesson_id)
);

ALTER TABLE public.lesson_views ENABLE ROW LEVEL SECURITY;

-- Lesson views: Users can view and insert their own views
CREATE POLICY "Users can view own lesson views"
  ON public.lesson_views FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own lesson views"
  ON public.lesson_views FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own lesson views"
  ON public.lesson_views FOR UPDATE
  USING (auth.uid() = user_id);

-- Lesson views: Admins can view all lesson views (for reports)
CREATE POLICY "Admins can view all lesson views"
  ON public.lesson_views FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- =========================================
-- Triggers for updated_at
-- =========================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_courses_updated_at
  BEFORE UPDATE ON public.courses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_class_groups_updated_at
  BEFORE UPDATE ON public.class_groups
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_lessons_updated_at
  BEFORE UPDATE ON public.lessons
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================
-- Function to create profile and assign role on signup
-- =========================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  );
  
  -- Assign default student role (admins are assigned manually)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'student');
  
  RETURN NEW;
END;
$$;

-- Trigger to run on new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========================================
-- Indexes for performance
-- =========================================

CREATE INDEX idx_class_enrollments_user_id ON public.class_enrollments(user_id);
CREATE INDEX idx_class_enrollments_class_group_id ON public.class_enrollments(class_group_id);
CREATE INDEX idx_lessons_class_group_id ON public.lessons(class_group_id);
CREATE INDEX idx_lessons_scheduled_at ON public.lessons(scheduled_at);
CREATE INDEX idx_lesson_views_user_id ON public.lesson_views(user_id);
CREATE INDEX idx_lesson_views_lesson_id ON public.lesson_views(lesson_id);
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
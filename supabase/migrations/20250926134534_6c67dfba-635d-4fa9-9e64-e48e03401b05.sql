-- Create enum for user roles
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE public.user_role AS ENUM ('gestor', 'cuidador', 'responsavel', 'professor');
    ELSE
        -- Adiciona o novo valor 'professor' se o tipo já existir mas não contiver o valor.
        -- Isso evita erros ao rodar a migração múltiplas vezes.
        IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumtypid = 'user_role'::regtype AND enumlabel = 'professor') THEN
            ALTER TYPE public.user_role ADD VALUE 'professor';
        END IF;
    END IF;
END $$;

-- Create enum for student status
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'student_status') THEN
        CREATE TYPE public.student_status AS ENUM ('ativo', 'inativo', 'transferido');
    END IF;
END $$;

-- Create enum for student period
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'student_period') THEN
        CREATE TYPE public.student_period AS ENUM ('Manhã', 'Tarde', 'Integral');
    END IF;
END $$;

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  cpf TEXT UNIQUE,
  phone TEXT,
  role user_role NOT NULL DEFAULT 'responsavel',
  function_title TEXT, -- For cuidadores
  work_schedule TEXT, -- For cuidadores
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  avatar_url TEXT -- Add the avatar_url column
);

-- Create students table
CREATE TABLE IF NOT EXISTS public.students (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  birth_date DATE,
  cpf TEXT UNIQUE,
  class_name TEXT,
  diagnosis TEXT,
  period student_period, -- Adiciona a coluna de período
  special_needs TEXT,
  medical_info TEXT,
  status student_status NOT NULL DEFAULT 'ativo',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create caregivers_students junction table (many-to-many)
CREATE TABLE IF NOT EXISTS public.caregivers_students (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  caregiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(caregiver_id, student_id)
);

-- Create guardians_students junction table (many-to-many)
CREATE TABLE IF NOT EXISTS public.guardians_students (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  guardian_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  relationship TEXT NOT NULL, -- pai, mae, tutor, etc
  is_primary BOOLEAN NOT NULL DEFAULT false,
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(guardian_id, student_id)
);

-- Create documents table for file uploads
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  file_type TEXT,
  document_type TEXT, -- 'laudo', 'relatorio', 'observacao', etc
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create reports table for caregiver observations
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  caregiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  report_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.caregivers_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guardians_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Função para obter o 'role' do usuário atual, lendo a tabela 'profiles'.
-- SECURITY DEFINER permite que a função execute com privilégios elevados para evitar paradoxos de RLS.
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS user_role AS $$ 
  SELECT role FROM public.profiles WHERE user_id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;
 
-- Create function to check if user is gestor
CREATE OR REPLACE FUNCTION public.is_gestor()
RETURNS boolean AS $$
  SELECT public.get_current_user_role() = 'gestor';
$$ LANGUAGE SQL STABLE;

-- RLS Policies for profiles
-- Unifica as políticas de SELECT para evitar conflitos e paradoxos de RLS.
-- Um usuário pode ver uma linha se for o dono da linha OU se for um gestor.
DROP POLICY IF EXISTS "Users can view profiles" ON public.profiles;
CREATE POLICY "Users can view profiles" ON public.profiles
  FOR SELECT USING (
    (auth.uid() = user_id) OR
    (public.is_gestor())
  );

DROP POLICY IF EXISTS "Gestores can insert profiles" ON public.profiles;
CREATE POLICY "Gestores can insert profiles" ON public.profiles
  FOR INSERT WITH CHECK (public.is_gestor());

DROP POLICY IF EXISTS "Gestores can update profiles" ON public.profiles;
CREATE POLICY "Gestores can update profiles" ON public.profiles
  FOR UPDATE USING (public.is_gestor());

-- RLS Policies for students
DROP POLICY IF EXISTS "Gestores can manage all students" ON public.students;
CREATE POLICY "Gestores can manage all students" ON public.students
  FOR ALL USING (public.is_gestor());

DROP POLICY IF EXISTS "Cuidadores can view assigned students" ON public.students;
CREATE POLICY "Cuidadores can view assigned students" ON public.students
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.caregivers_students cs
      JOIN public.profiles p ON p.id = cs.caregiver_id
      WHERE cs.student_id = students.id 
      AND p.user_id = auth.uid()
      AND p.role = 'cuidador'
    )
  );

DROP POLICY IF EXISTS "Responsaveis can view their students" ON public.students;
CREATE POLICY "Responsaveis can view their students" ON public.students
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.guardians_students gs
      JOIN public.profiles p ON p.id = gs.guardian_id
      WHERE gs.student_id = students.id 
      AND p.user_id = auth.uid()
      AND p.role = 'responsavel'
    )
  );

-- RLS Policies for caregivers_students
DROP POLICY IF EXISTS "Gestores can manage caregiver assignments" ON public.caregivers_students;
CREATE POLICY "Gestores can manage caregiver assignments" ON public.caregivers_students
  FOR ALL USING (public.is_gestor());

DROP POLICY IF EXISTS "Cuidadores can view their assignments" ON public.caregivers_students;
CREATE POLICY "Cuidadores can view their assignments" ON public.caregivers_students
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = caregiver_id AND p.user_id = auth.uid()
    )
  );

-- RLS Policies for guardians_students
DROP POLICY IF EXISTS "Gestores can manage guardian assignments" ON public.guardians_students;
CREATE POLICY "Gestores can manage guardian assignments" ON public.guardians_students
  FOR ALL USING (public.is_gestor());

DROP POLICY IF EXISTS "Responsaveis can view their assignments" ON public.guardians_students;
CREATE POLICY "Responsaveis can view their assignments" ON public.guardians_students
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = guardian_id AND p.user_id = auth.uid()
    )
  );

-- RLS Policies for documents
DROP POLICY IF EXISTS "Gestores can manage all documents" ON public.documents;
CREATE POLICY "Gestores can manage all documents" ON public.documents
  FOR ALL USING (public.is_gestor());

DROP POLICY IF EXISTS "Cuidadores can view/upload documents for assigned students" ON public.documents;
CREATE POLICY "Cuidadores can view/upload documents for assigned students" ON public.documents
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.caregivers_students cs
      JOIN public.profiles p ON p.id = cs.caregiver_id
      WHERE cs.student_id = documents.student_id 
      AND p.user_id = auth.uid()
      AND p.role = 'cuidador'
    )
  );

DROP POLICY IF EXISTS "Responsaveis can view documents for their students" ON public.documents;
CREATE POLICY "Responsaveis can view documents for their students" ON public.documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.guardians_students gs
      JOIN public.profiles p ON p.id = gs.guardian_id
      WHERE gs.student_id = documents.student_id 
      AND p.user_id = auth.uid()
      AND p.role = 'responsavel'
    )
  );

-- RLS Policies for reports
DROP POLICY IF EXISTS "Gestores can manage all reports" ON public.reports;
CREATE POLICY "Gestores can manage all reports" ON public.reports
  FOR ALL USING (public.is_gestor());

DROP POLICY IF EXISTS "Cuidadores can manage reports for assigned students" ON public.reports;
CREATE POLICY "Cuidadores can manage reports for assigned students" ON public.reports
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.caregivers_students cs
      JOIN public.profiles p ON p.id = cs.caregiver_id
      WHERE cs.student_id = reports.student_id 
      AND p.user_id = auth.uid()
      AND p.role = 'cuidador'
    )
  );

DROP POLICY IF EXISTS "Responsaveis can view reports for their students" ON public.reports;
CREATE POLICY "Responsaveis can view reports for their students" ON public.reports
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.guardians_students gs
      JOIN public.profiles p ON p.id = gs.guardian_id
      WHERE gs.student_id = reports.student_id 
      AND p.user_id = auth.uid()
      AND p.role = 'responsavel'
    )
  );

-- Create storage bucket for documents
INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for documents
DROP POLICY IF EXISTS "Authenticated users can upload documents" ON storage.objects;
CREATE POLICY "Authenticated users can upload documents" ON storage.objects
  FOR INSERT WITH CHECK ((
    bucket_id = 'documents' AND 
    auth.role() = 'authenticated'
  ));

DROP POLICY IF EXISTS "Users can view documents based on student access" ON storage.objects;
CREATE POLICY "Users can view documents based on student access" ON storage.objects
  FOR SELECT USING ((
    bucket_id = 'documents' AND 
    auth.role() = 'authenticated'
  ));

-- Create storage bucket for avatars
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies for avatars bucket
DROP POLICY IF EXISTS "Avatar images are publicly accessible." ON storage.objects;
CREATE POLICY "Avatar images are publicly accessible." ON storage.objects
  FOR SELECT USING ((bucket_id = 'avatars'));

DROP POLICY IF EXISTS "Anyone can upload an avatar." ON storage.objects;
CREATE POLICY "Anyone can upload an avatar." ON storage.objects
  FOR INSERT WITH CHECK ((bucket_id = 'avatars'));

DROP POLICY IF EXISTS "Anyone can update their own avatar." ON storage.objects;
CREATE POLICY "Anyone can update their own avatar." ON storage.objects
  FOR UPDATE USING ((
    auth.uid() = (storage.foldername(name))[1]::uuid
  )) WITH CHECK ((
    bucket_id = 'avatars'
  ));


-- Function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    'responsavel'::user_role
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to auto-create profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_students_updated_at ON public.students;
CREATE TRIGGER update_students_updated_at
  BEFORE UPDATE ON public.students
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_reports_updated_at ON public.reports;
CREATE TRIGGER update_reports_updated_at
  BEFORE UPDATE ON public.reports
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
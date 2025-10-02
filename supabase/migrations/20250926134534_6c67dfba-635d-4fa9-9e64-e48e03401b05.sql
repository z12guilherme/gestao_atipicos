-- Create enum for user roles
CREATE TYPE public.user_role AS ENUM ('gestor', 'cuidador', 'responsavel');

-- Create enum for student status
CREATE TYPE public.student_status AS ENUM ('ativo', 'inativo', 'transferido');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  cpf TEXT UNIQUE,
  phone TEXT,
  role user_role NOT NULL DEFAULT 'responsavel',
  function_title TEXT, -- For cuidadores
  work_schedule TEXT, -- For cuidadores
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create students table
CREATE TABLE public.students (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  birth_date DATE,
  cpf TEXT UNIQUE,
  class_name TEXT,
  diagnosis TEXT,
  special_needs TEXT,
  medical_info TEXT,
  status student_status NOT NULL DEFAULT 'ativo',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create caregivers_students junction table (many-to-many)
CREATE TABLE public.caregivers_students (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  caregiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(caregiver_id, student_id)
);

-- Create guardians_students junction table (many-to-many)
CREATE TABLE public.guardians_students (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  guardian_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  relationship TEXT NOT NULL, -- pai, mae, tutor, etc
  is_primary BOOLEAN NOT NULL DEFAULT false,
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(guardian_id, student_id)
);

-- Create documents table for file uploads
CREATE TABLE public.documents (
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
CREATE TABLE public.reports (
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

-- Create function to get current user role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS user_role AS $$
  SELECT role FROM public.profiles WHERE user_id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- Create function to check if user is gestor
CREATE OR REPLACE FUNCTION public.is_gestor()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'gestor'
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Gestores can view all profiles" ON public.profiles
  FOR SELECT USING (public.is_gestor());

CREATE POLICY "Gestores can insert profiles" ON public.profiles
  FOR INSERT WITH CHECK (public.is_gestor());

CREATE POLICY "Gestores can update profiles" ON public.profiles
  FOR UPDATE USING (public.is_gestor());

-- RLS Policies for students
CREATE POLICY "Gestores can manage all students" ON public.students
  FOR ALL USING (public.is_gestor());

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
CREATE POLICY "Gestores can manage caregiver assignments" ON public.caregivers_students
  FOR ALL USING (public.is_gestor());

CREATE POLICY "Cuidadores can view their assignments" ON public.caregivers_students
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = caregiver_id AND p.user_id = auth.uid()
    )
  );

-- RLS Policies for guardians_students
CREATE POLICY "Gestores can manage guardian assignments" ON public.guardians_students
  FOR ALL USING (public.is_gestor());

CREATE POLICY "Responsaveis can view their assignments" ON public.guardians_students
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = guardian_id AND p.user_id = auth.uid()
    )
  );

-- RLS Policies for documents
CREATE POLICY "Gestores can manage all documents" ON public.documents
  FOR ALL USING (public.is_gestor());

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
CREATE POLICY "Gestores can manage all reports" ON public.reports
  FOR ALL USING (public.is_gestor());

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
INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false);

-- Storage policies for documents
CREATE POLICY "Authenticated users can upload documents" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'documents' AND 
    auth.role() = 'authenticated'
  );

CREATE POLICY "Users can view documents based on student access" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'documents' AND 
    auth.role() = 'authenticated'
  );

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
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_students_updated_at
  BEFORE UPDATE ON public.students
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_reports_updated_at
  BEFORE UPDATE ON public.reports
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
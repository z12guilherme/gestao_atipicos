


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."student_period" AS ENUM (
    'Manhã',
    'Tarde',
    'Integral'
);


ALTER TYPE "public"."student_period" OWNER TO "postgres";


CREATE TYPE "public"."student_status" AS ENUM (
    'ativo',
    'inativo',
    'transferido'
);


ALTER TYPE "public"."student_status" OWNER TO "postgres";


CREATE TYPE "public"."user_role" AS ENUM (
    'root',
    'diretor',
    'gestor',
    'cuidador',
    'responsavel',
    'professor'
);


ALTER TYPE "public"."user_role" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_all_profiles_with_email"() RETURNS TABLE("id" "uuid", "user_id" "uuid", "name" "text", "email" "text", "role" "public"."user_role", "cpf" "text", "phone" "text", "function_title" "text", "work_schedule" "text")
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
    SELECT
        p.id,
        p.user_id,
        p.name,
        u.email,
        p.role,
        p.cpf,
        p.phone,
        p.function_title,
        p.work_schedule
    FROM
        public.profiles p
    JOIN
        auth.users u ON p.user_id = u.id;
$$;


ALTER FUNCTION "public"."get_all_profiles_with_email"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_all_users"() RETURNS TABLE("id" "uuid", "user_id" "uuid", "name" "text", "email" "text", "role" "public"."user_role", "phone" "text", "cpf" "text", "function_title" "text", "work_schedule" "text")
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT
    p.id, p.user_id, p.name, u.email, p.role, p.phone, p.cpf, p.function_title, p.work_schedule
  FROM
    public.profiles p
  JOIN auth.users u ON p.user_id = u.id;
$$;


ALTER FUNCTION "public"."get_all_users"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_current_user_role"() RETURNS "public"."user_role"
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$ 
  SELECT role FROM public.profiles WHERE user_id = auth.uid();
$$;


ALTER FUNCTION "public"."get_current_user_role"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_my_claim"("claim" "text") RETURNS "text"
    LANGUAGE "sql" STABLE
    AS $$
  SELECT current_setting('request.jwt.claims', true)::jsonb ->> claim;
$$;


ALTER FUNCTION "public"."get_my_claim"("claim" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_professors_with_details"() RETURNS TABLE("id" "uuid", "user_id" "uuid", "subject" "text", "created_at" timestamp with time zone, "updated_at" timestamp with time zone, "name" "text", "email" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY
    SELECT 
      p.id,
      p.user_id,
      p.subject,
      p.created_at,
      p.updated_at,
      prof.name,
      u.email
    FROM public.professors p
    JOIN public.profiles prof ON p.user_id = prof.id
    JOIN auth.users u ON prof.user_id = u.id;
END;
$$;


ALTER FUNCTION "public"."get_professors_with_details"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_profile_with_email"() RETURNS TABLE("id" "uuid", "user_id" "uuid", "name" "text", "email" "text", "role" "public"."user_role", "cpf" "text", "phone" "text", "function_title" "text", "work_schedule" "text")
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
    SELECT
        p.id,
        p.user_id,
        p.name,
        u.email,
        p.role,
        p.cpf,
        p.phone,
        p.function_title,
        p.work_schedule
    FROM
        public.profiles p
    JOIN
        auth.users u ON p.user_id = u.id
    WHERE
        p.user_id = auth.uid();
$$;


ALTER FUNCTION "public"."get_profile_with_email"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_profiles_with_email"() RETURNS TABLE("id" "uuid", "user_id" "uuid", "name" "text", "email" "text", "role" "public"."user_role", "cpf" "text", "phone" "text", "function_title" "text", "work_schedule" "text")
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
    SELECT
        p.id,
        p.user_id,
        p.name,
        u.email,
        p.role,
        p.cpf,
        p.phone,
        p.function_title,
        p.work_schedule
    FROM
        public.profiles p
    JOIN
        auth.users u ON p.user_id = u.id
    WHERE
        p.role <> 'root'; -- Exclui o usuário root da listagem
$$;


ALTER FUNCTION "public"."get_profiles_with_email"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_profiles_with_email"("p_user_id" "uuid") RETURNS TABLE("id" "uuid", "user_id" "uuid", "name" "text", "email" "text", "role" "public"."user_role", "cpf" "text", "phone" "text", "function_title" "text", "work_schedule" "text")
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
    SELECT
        p.id,
        p.user_id,
        p.name,
        u.email,
        p.role,
        p.cpf,
        p.phone,
        p.function_title,
        p.work_schedule
    FROM
        public.profiles p
    JOIN
        auth.users u ON p.user_id = u.id
    WHERE
        p.user_id = p_user_id;
$$;


ALTER FUNCTION "public"."get_profiles_with_email"("p_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_role_for_claims"("user_id_input" "uuid") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$DECLARE
  user_role_value user_role;
BEGIN
  SELECT role INTO user_role_value FROM public.profiles WHERE user_id = user_id_input;
  RETURN jsonb_build_object('user_role', user_role_value);
END;$$;


ALTER FUNCTION "public"."get_user_role_for_claims"("user_id_input" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  -- CORREÇÃO: Insere o ID do novo usuário do Auth na coluna 'user_id'.
  INSERT INTO public.profiles (user_id, email, name, role)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'name', 'Novo Usuário'),
    COALESCE(new.raw_user_meta_data->>'role', 'cuidador')::public.user_role
  );
  RETURN new;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_admin"() RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role IN ('root', 'diretor', 'gestor')
  );
$$;


ALTER FUNCTION "public"."is_admin"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_gestor"() RETURNS boolean
    LANGUAGE "sql" STABLE
    AS $$
  SELECT public.get_current_user_role() = 'gestor';
$$;


ALTER FUNCTION "public"."is_gestor"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_guardian_with_students"("p_guardian_id" "uuid", "p_profile_data" "jsonb", "p_student_ids" "uuid"[]) RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    -- Atualiza a tabela de perfis
    UPDATE public.profiles
    SET
        name = p_profile_data->>'name',
        cpf = p_profile_data->>'cpf',
        phone = p_profile_data->>'phone',
        function_title = p_profile_data->>'function_title',
        work_schedule = p_profile_data->>'work_schedule'
    WHERE id = p_guardian_id;

    -- Remove as associações antigas
    DELETE FROM public.guardians_students
    WHERE guardian_id = p_guardian_id;

    -- Insere as novas associações, se houver
    IF array_length(p_student_ids, 1) > 0 THEN
        INSERT INTO public.guardians_students (guardian_id, student_id, relationship)
        SELECT p_guardian_id, unnest(p_student_ids), 'responsavel';
    END IF;
END;
$$;


ALTER FUNCTION "public"."update_guardian_with_students"("p_guardian_id" "uuid", "p_profile_data" "jsonb", "p_student_ids" "uuid"[]) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."caregivers_students" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "caregiver_id" "uuid" NOT NULL,
    "student_id" "uuid" NOT NULL,
    "assigned_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."caregivers_students" OWNER TO "postgres";


COMMENT ON TABLE "public"."caregivers_students" IS 'Armazena os dados dos cuidadores';



CREATE TABLE IF NOT EXISTS "public"."classes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."classes" OWNER TO "postgres";


COMMENT ON TABLE "public"."classes" IS 'Armazena as turmas da instituição.';



CREATE TABLE IF NOT EXISTS "public"."documents" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "student_id" "uuid" NOT NULL,
    "uploaded_by" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "file_name" "text" NOT NULL,
    "file_path" "text" NOT NULL,
    "file_size" integer,
    "file_type" "text",
    "document_type" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."documents" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."guardians_students" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "guardian_id" "uuid" NOT NULL,
    "student_id" "uuid" NOT NULL,
    "relationship" "text" NOT NULL,
    "is_primary" boolean DEFAULT false NOT NULL,
    "assigned_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."guardians_students" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."professors" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "subject" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."professors" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "cpf" "text",
    "phone" "text",
    "role" "public"."user_role" DEFAULT 'responsavel'::"public"."user_role" NOT NULL,
    "function_title" "text",
    "work_schedule" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "school_id" "text",
    "avatar_url" "text",
    "email" "text"
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."reports" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "student_id" "uuid" NOT NULL,
    "caregiver_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "content" "text" NOT NULL,
    "report_date" "date" DEFAULT CURRENT_DATE NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."reports" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."schedules" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "student_id" "uuid",
    "caregiver_id" "uuid",
    "activity" "text" NOT NULL,
    "date" "date" NOT NULL,
    "start_time" time with time zone NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."schedules" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."students" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "birth_date" "date",
    "cpf" "text",
    "class_name" "text",
    "diagnosis" "text",
    "special_needs" "text",
    "medical_info" "text",
    "status" "public"."student_status" DEFAULT 'ativo'::"public"."student_status" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "guardian_id" "uuid",
    "period" "text",
    "laudo_url" "text"
);


ALTER TABLE "public"."students" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."teachers_classes" (
    "id" bigint NOT NULL,
    "teacher_id" "uuid" NOT NULL,
    "class_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."teachers_classes" OWNER TO "postgres";


COMMENT ON TABLE "public"."teachers_classes" IS 'Vincula professores (profiles) a turmas (classes).';



ALTER TABLE "public"."teachers_classes" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."teachers_classes_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



ALTER TABLE ONLY "public"."caregivers_students"
    ADD CONSTRAINT "caregivers_students_caregiver_id_student_id_key" UNIQUE ("caregiver_id", "student_id");



ALTER TABLE ONLY "public"."caregivers_students"
    ADD CONSTRAINT "caregivers_students_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."classes"
    ADD CONSTRAINT "classes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."documents"
    ADD CONSTRAINT "documents_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."guardians_students"
    ADD CONSTRAINT "guardians_students_guardian_id_student_id_key" UNIQUE ("guardian_id", "student_id");



ALTER TABLE ONLY "public"."guardians_students"
    ADD CONSTRAINT "guardians_students_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."professors"
    ADD CONSTRAINT "professors_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_cpf_key" UNIQUE ("cpf");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."reports"
    ADD CONSTRAINT "reports_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."schedules"
    ADD CONSTRAINT "schedules_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."students"
    ADD CONSTRAINT "students_cpf_key" UNIQUE ("cpf");



ALTER TABLE ONLY "public"."students"
    ADD CONSTRAINT "students_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."teachers_classes"
    ADD CONSTRAINT "teachers_classes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."teachers_classes"
    ADD CONSTRAINT "teachers_classes_unique" UNIQUE ("teacher_id", "class_id");



CREATE OR REPLACE TRIGGER "update_profiles_updated_at" BEFORE UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_reports_updated_at" BEFORE UPDATE ON "public"."reports" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_students_updated_at" BEFORE UPDATE ON "public"."students" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."caregivers_students"
    ADD CONSTRAINT "caregivers_students_caregiver_id_fkey" FOREIGN KEY ("caregiver_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."caregivers_students"
    ADD CONSTRAINT "caregivers_students_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."documents"
    ADD CONSTRAINT "documents_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."documents"
    ADD CONSTRAINT "documents_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."guardians_students"
    ADD CONSTRAINT "guardians_students_guardian_id_fkey" FOREIGN KEY ("guardian_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."guardians_students"
    ADD CONSTRAINT "guardians_students_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."professors"
    ADD CONSTRAINT "professors_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reports"
    ADD CONSTRAINT "reports_caregiver_id_fkey" FOREIGN KEY ("caregiver_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reports"
    ADD CONSTRAINT "reports_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."schedules"
    ADD CONSTRAINT "schedules_caregiver_id_fkey" FOREIGN KEY ("caregiver_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."schedules"
    ADD CONSTRAINT "schedules_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."teachers_classes"
    ADD CONSTRAINT "teachers_classes_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."teachers_classes"
    ADD CONSTRAINT "teachers_classes_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "public"."profiles"("user_id") ON DELETE CASCADE;



CREATE POLICY "Admins can manage all documents" ON "public"."documents" USING ("public"."is_admin"());



CREATE POLICY "Admins can manage all profiles" ON "public"."profiles" USING ("public"."is_admin"());



CREATE POLICY "Admins can manage all reports" ON "public"."reports" USING ("public"."is_admin"());



CREATE POLICY "Admins can manage all students" ON "public"."students" USING ("public"."is_admin"());



CREATE POLICY "Admins can manage caregiver assignments" ON "public"."caregivers_students" USING ("public"."is_admin"());



CREATE POLICY "Admins can manage guardian assignments" ON "public"."guardians_students" USING ("public"."is_admin"());



CREATE POLICY "Allow admin full access to classes" ON "public"."classes" TO "authenticated" USING (("public"."get_my_claim"('user_role'::"text") = 'gestor'::"text")) WITH CHECK (("public"."get_my_claim"('user_role'::"text") = 'gestor'::"text"));



CREATE POLICY "Allow admin full access to teachers_classes" ON "public"."teachers_classes" TO "authenticated" USING (("public"."get_my_claim"('user_role'::"text") = 'gestor'::"text")) WITH CHECK (("public"."get_my_claim"('user_role'::"text") = 'gestor'::"text"));



CREATE POLICY "Allow authenticated read access to teachers_classes" ON "public"."teachers_classes" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Allow guardians_students select for Gestors, Professors, and li" ON "public"."guardians_students" FOR SELECT TO "authenticated" USING (((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."user_id" = "auth"."uid"()) AND ("p"."role" = ANY (ARRAY['gestor'::"public"."user_role", 'professor'::"public"."user_role"]))))) OR ("guardian_id" = "auth"."uid"())));


CREATE POLICY "Authenticated users can view profiles" ON "public"."profiles" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Cuidadores can manage reports for assigned students" ON "public"."reports" USING ((EXISTS ( SELECT 1
   FROM ("public"."caregivers_students" "cs"
     JOIN "public"."profiles" "p" ON (("p"."id" = "cs"."caregiver_id")))
  WHERE (("cs"."student_id" = "reports"."student_id") AND ("p"."user_id" = "auth"."uid"()) AND ("p"."role" = 'cuidador'::"public"."user_role")))));



CREATE POLICY "Cuidadores can view assigned students" ON "public"."students" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM ("public"."caregivers_students" "cs"
     JOIN "public"."profiles" "p" ON (("p"."id" = "cs"."caregiver_id")))
  WHERE (("cs"."student_id" = "students"."id") AND ("p"."user_id" = "auth"."uid"()) AND ("p"."role" = 'cuidador'::"public"."user_role")))));



CREATE POLICY "Cuidadores can view their assignments" ON "public"."caregivers_students" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "caregivers_students"."caregiver_id") AND ("p"."user_id" = "auth"."uid"())))));



CREATE POLICY "Cuidadores can view/upload documents for assigned students" ON "public"."documents" USING ((EXISTS ( SELECT 1
   FROM ("public"."caregivers_students" "cs"
     JOIN "public"."profiles" "p" ON (("p"."id" = "cs"."caregiver_id")))
  WHERE (("cs"."student_id" = "documents"."student_id") AND ("p"."user_id" = "auth"."uid"()) AND ("p"."role" = 'cuidador'::"public"."user_role")))));



CREATE POLICY "Cuidadores gerenciam sua própria agenda" ON "public"."schedules" TO "authenticated" USING (("caregiver_id" = ( SELECT "profiles"."id"
   FROM "public"."profiles"
  WHERE ("profiles"."user_id" = "auth"."uid"())))) WITH CHECK (("caregiver_id" = ( SELECT "profiles"."id"
   FROM "public"."profiles"
  WHERE ("profiles"."user_id" = "auth"."uid"()))));



CREATE POLICY "Enable insert for authenticated users on guardians_students" ON "public"."guardians_students" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable insert for authenticated users on students" ON "public"."students" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable select for authenticated users on guardians_students" ON "public"."guardians_students" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Enable select for authenticated users on students" ON "public"."students" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Enable update for authenticated users on students" ON "public"."students" FOR UPDATE TO "authenticated" USING (true);



CREATE POLICY "Gestores can insert profiles" ON "public"."profiles" FOR INSERT WITH CHECK ("public"."is_gestor"());



CREATE POLICY "Gestores can manage all classes" ON "public"."classes" USING ("public"."is_gestor"());



CREATE POLICY "Gestores can manage all documents" ON "public"."documents" USING ("public"."is_gestor"());



CREATE POLICY "Gestores can manage all professors" ON "public"."professors" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."user_id" = "auth"."uid"()) AND ("p"."role" = 'gestor'::"public"."user_role")))));



CREATE POLICY "Gestores can manage all reports" ON "public"."reports" USING ("public"."is_gestor"());



CREATE POLICY "Gestores can manage all students" ON "public"."students" USING ("public"."is_gestor"());



CREATE POLICY "Gestores can manage caregiver assignments" ON "public"."caregivers_students" USING ("public"."is_gestor"());



CREATE POLICY "Gestores can manage guardian assignments" ON "public"."guardians_students" USING ("public"."is_gestor"());



CREATE POLICY "Gestores can update profiles" ON "public"."profiles" FOR UPDATE USING ("public"."is_gestor"());



CREATE POLICY "Gestores têm acesso total a agendas" ON "public"."schedules" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."user_id" = "auth"."uid"()) AND ("profiles"."role" = 'gestor'::"public"."user_role"))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."user_id" = "auth"."uid"()) AND ("profiles"."role" = 'gestor'::"public"."user_role")))));



CREATE POLICY "Gestores têm acesso total a estudantes" ON "public"."students" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."user_id" = "auth"."uid"()) AND ("profiles"."role" = 'gestor'::"public"."user_role"))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."user_id" = "auth"."uid"()) AND ("profiles"."role" = 'gestor'::"public"."user_role")))));



CREATE POLICY "Gestores têm acesso total a vínculos de cuidadores" ON "public"."caregivers_students" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."user_id" = "auth"."uid"()) AND ("profiles"."role" = 'gestor'::"public"."user_role"))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."user_id" = "auth"."uid"()) AND ("profiles"."role" = 'gestor'::"public"."user_role")))));



CREATE POLICY "Gestores têm acesso total a vínculos de responsáveis" ON "public"."guardians_students" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."user_id" = "auth"."uid"()) AND ("profiles"."role" = 'gestor'::"public"."user_role"))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."user_id" = "auth"."uid"()) AND ("profiles"."role" = 'gestor'::"public"."user_role")))));



CREATE POLICY "Gestors and Professors can insert guardians_students" ON "public"."guardians_students" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."user_id" = "auth"."uid"()) AND ("p"."role" = ANY (ARRAY['gestor'::"public"."user_role", 'professor'::"public"."user_role"]))))));



CREATE POLICY "Professors and Gestors can insert students" ON "public"."students" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."user_id" = "auth"."uid"()) AND ("p"."role" = ANY (ARRAY['gestor'::"public"."user_role", 'professor'::"public"."user_role"]))))));



CREATE POLICY "Professors and Gestors can update students" ON "public"."students" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."user_id" = "auth"."uid"()) AND ("p"."role" = ANY (ARRAY['gestor'::"public"."user_role", 'professor'::"public"."user_role"]))))));



CREATE POLICY "Professors can manage reports of their students" ON "public"."reports" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM ("public"."students" "s"
     JOIN "public"."professors" "p" ON (("p"."user_id" = "auth"."uid"())))
  WHERE (("s"."id" = "reports"."student_id") AND ("s"."class_name" = "p"."subject")))));



CREATE POLICY "Professors can manage their own records" ON "public"."professors" TO "authenticated" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Responsaveis can view documents for their students" ON "public"."documents" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM ("public"."guardians_students" "gs"
     JOIN "public"."profiles" "p" ON (("p"."id" = "gs"."guardian_id")))
  WHERE (("gs"."student_id" = "documents"."student_id") AND ("p"."user_id" = "auth"."uid"()) AND ("p"."role" = 'responsavel'::"public"."user_role")))));



CREATE POLICY "Responsaveis can view reports for their students" ON "public"."reports" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM ("public"."guardians_students" "gs"
     JOIN "public"."profiles" "p" ON (("p"."id" = "gs"."guardian_id")))
  WHERE (("gs"."student_id" = "reports"."student_id") AND ("p"."user_id" = "auth"."uid"()) AND ("p"."role" = 'responsavel'::"public"."user_role")))));



CREATE POLICY "Responsaveis can view their assignments" ON "public"."guardians_students" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "guardians_students"."guardian_id") AND ("p"."user_id" = "auth"."uid"())))));



CREATE POLICY "Responsaveis can view their students" ON "public"."students" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM ("public"."guardians_students" "gs"
     JOIN "public"."profiles" "p" ON (("p"."id" = "gs"."guardian_id")))
  WHERE (("gs"."student_id" = "students"."id") AND ("p"."user_id" = "auth"."uid"()) AND ("p"."role" = 'responsavel'::"public"."user_role")))));



CREATE POLICY "Responsáveis visualizam agenda de seus estudantes" ON "public"."schedules" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."guardians_students"
  WHERE (("guardians_students"."guardian_id" = ( SELECT "profiles"."id"
           FROM "public"."profiles"
          WHERE ("profiles"."user_id" = "auth"."uid"()))) AND ("guardians_students"."student_id" = "schedules"."student_id")))));



CREATE POLICY "Root full access on caregivers_students" ON "public"."caregivers_students" USING (("auth"."email"() = 'mguimarcos39@gmail.com'::"text"));



CREATE POLICY "Root full access on documents" ON "public"."documents" USING (("auth"."email"() = 'mguimarcos39@gmail.com'::"text"));



CREATE POLICY "Root full access on guardians_students" ON "public"."guardians_students" USING (("auth"."email"() = 'mguimarcos39@gmail.com'::"text"));



CREATE POLICY "Root full access on profiles" ON "public"."profiles" USING (("auth"."email"() = 'mguimarcos39@gmail.com'::"text"));



CREATE POLICY "Root full access on reports" ON "public"."reports" USING (("auth"."email"() = 'mguimarcos39@gmail.com'::"text"));



CREATE POLICY "Root full access on students" ON "public"."students" USING (("auth"."email"() = 'mguimarcos39@gmail.com'::"text"));



CREATE POLICY "Students visible only to Gestors, Professors or linked Guardian" ON "public"."students" FOR SELECT TO "authenticated" USING (((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."user_id" = "auth"."uid"()) AND ("p"."role" = ANY (ARRAY['gestor'::"public"."user_role", 'professor'::"public"."user_role"]))))) OR (EXISTS ( SELECT 1
   FROM "public"."guardians_students" "gs"
  WHERE (("gs"."student_id" = "students"."id") AND ("gs"."guardian_id" = "auth"."uid"()))))));



CREATE POLICY "Users can update their own profile" ON "public"."profiles" FOR UPDATE TO "authenticated" USING (("user_id" = "auth"."uid"())) WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can view profiles" ON "public"."profiles" FOR SELECT USING ((("auth"."uid"() = "user_id") OR "public"."is_gestor"()));



ALTER TABLE "public"."caregivers_students" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."classes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."documents" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."guardians_students" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."professors" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."reports" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."schedules" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."students" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."teachers_classes" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";






GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";
GRANT ALL ON SCHEMA "public" TO "root";

























































































































































GRANT ALL ON FUNCTION "public"."get_all_profiles_with_email"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_all_profiles_with_email"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_all_profiles_with_email"() TO "service_role";
GRANT ALL ON FUNCTION "public"."get_all_profiles_with_email"() TO "root";



GRANT ALL ON FUNCTION "public"."get_all_users"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_all_users"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_all_users"() TO "service_role";
GRANT ALL ON FUNCTION "public"."get_all_users"() TO "root";



GRANT ALL ON FUNCTION "public"."get_current_user_role"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_current_user_role"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_current_user_role"() TO "service_role";
GRANT ALL ON FUNCTION "public"."get_current_user_role"() TO "root";



GRANT ALL ON FUNCTION "public"."get_my_claim"("claim" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_my_claim"("claim" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_my_claim"("claim" "text") TO "service_role";
GRANT ALL ON FUNCTION "public"."get_my_claim"("claim" "text") TO "root";



GRANT ALL ON FUNCTION "public"."get_professors_with_details"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_professors_with_details"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_professors_with_details"() TO "service_role";
GRANT ALL ON FUNCTION "public"."get_professors_with_details"() TO "root";



GRANT ALL ON FUNCTION "public"."get_profile_with_email"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_profile_with_email"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_profile_with_email"() TO "service_role";
GRANT ALL ON FUNCTION "public"."get_profile_with_email"() TO "root";



GRANT ALL ON FUNCTION "public"."get_profiles_with_email"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_profiles_with_email"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_profiles_with_email"() TO "service_role";
GRANT ALL ON FUNCTION "public"."get_profiles_with_email"() TO "root";



GRANT ALL ON FUNCTION "public"."get_profiles_with_email"("p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_profiles_with_email"("p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_profiles_with_email"("p_user_id" "uuid") TO "service_role";
GRANT ALL ON FUNCTION "public"."get_profiles_with_email"("p_user_id" "uuid") TO "root";



GRANT ALL ON FUNCTION "public"."get_user_role_for_claims"("user_id_input" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_role_for_claims"("user_id_input" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_role_for_claims"("user_id_input" "uuid") TO "service_role";
GRANT ALL ON FUNCTION "public"."get_user_role_for_claims"("user_id_input" "uuid") TO "root";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "root";



GRANT ALL ON FUNCTION "public"."is_admin"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "service_role";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "root";



GRANT ALL ON FUNCTION "public"."is_gestor"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_gestor"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_gestor"() TO "service_role";
GRANT ALL ON FUNCTION "public"."is_gestor"() TO "root";



GRANT ALL ON FUNCTION "public"."update_guardian_with_students"("p_guardian_id" "uuid", "p_profile_data" "jsonb", "p_student_ids" "uuid"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."update_guardian_with_students"("p_guardian_id" "uuid", "p_profile_data" "jsonb", "p_student_ids" "uuid"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_guardian_with_students"("p_guardian_id" "uuid", "p_profile_data" "jsonb", "p_student_ids" "uuid"[]) TO "service_role";
GRANT ALL ON FUNCTION "public"."update_guardian_with_students"("p_guardian_id" "uuid", "p_profile_data" "jsonb", "p_student_ids" "uuid"[]) TO "root";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "root";


















GRANT ALL ON TABLE "public"."caregivers_students" TO "anon";
GRANT ALL ON TABLE "public"."caregivers_students" TO "authenticated";
GRANT ALL ON TABLE "public"."caregivers_students" TO "service_role";
GRANT ALL ON TABLE "public"."caregivers_students" TO "root";



GRANT ALL ON TABLE "public"."classes" TO "anon";
GRANT ALL ON TABLE "public"."classes" TO "authenticated";
GRANT ALL ON TABLE "public"."classes" TO "service_role";
GRANT ALL ON TABLE "public"."classes" TO "root";



GRANT ALL ON TABLE "public"."documents" TO "anon";
GRANT ALL ON TABLE "public"."documents" TO "authenticated";
GRANT ALL ON TABLE "public"."documents" TO "service_role";
GRANT ALL ON TABLE "public"."documents" TO "root";



GRANT ALL ON TABLE "public"."guardians_students" TO "anon";
GRANT ALL ON TABLE "public"."guardians_students" TO "authenticated";
GRANT ALL ON TABLE "public"."guardians_students" TO "service_role";
GRANT ALL ON TABLE "public"."guardians_students" TO "root";



GRANT ALL ON TABLE "public"."professors" TO "anon";
GRANT ALL ON TABLE "public"."professors" TO "authenticated";
GRANT ALL ON TABLE "public"."professors" TO "service_role";
GRANT ALL ON TABLE "public"."professors" TO "root";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";
GRANT ALL ON TABLE "public"."profiles" TO "root";



GRANT ALL ON TABLE "public"."reports" TO "anon";
GRANT ALL ON TABLE "public"."reports" TO "authenticated";
GRANT ALL ON TABLE "public"."reports" TO "service_role";
GRANT ALL ON TABLE "public"."reports" TO "root";



GRANT ALL ON TABLE "public"."schedules" TO "anon";
GRANT ALL ON TABLE "public"."schedules" TO "authenticated";
GRANT ALL ON TABLE "public"."schedules" TO "service_role";
GRANT ALL ON TABLE "public"."schedules" TO "root";



GRANT ALL ON TABLE "public"."students" TO "anon";
GRANT ALL ON TABLE "public"."students" TO "authenticated";
GRANT ALL ON TABLE "public"."students" TO "service_role";
GRANT ALL ON TABLE "public"."students" TO "root";



GRANT ALL ON TABLE "public"."teachers_classes" TO "anon";
GRANT ALL ON TABLE "public"."teachers_classes" TO "authenticated";
GRANT ALL ON TABLE "public"."teachers_classes" TO "service_role";
GRANT ALL ON TABLE "public"."teachers_classes" TO "root";



GRANT ALL ON SEQUENCE "public"."teachers_classes_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."teachers_classes_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."teachers_classes_id_seq" TO "service_role";
GRANT ALL ON SEQUENCE "public"."teachers_classes_id_seq" TO "root";




-- VIEW PARA O DASHBOARD (Calcula estatísticas corretas ignorando bugs de frontend)
CREATE OR REPLACE VIEW public.dashboard_general_stats AS
SELECT
    (SELECT count(*) FROM public.students) AS total_students,
    (SELECT count(*) FROM public.students WHERE status = 'ativo') AS active_students,
    (SELECT count(*) FROM public.profiles) AS total_users,
    (SELECT count(*) 
     FROM public.students s
     WHERE s.status = 'ativo' 
     AND NOT EXISTS (SELECT 1 FROM public.caregivers_students cs WHERE cs.student_id = s.id)
    ) AS active_students_without_caregiver;

ALTER VIEW public.dashboard_general_stats OWNER TO "postgres";
GRANT SELECT ON public.dashboard_general_stats TO authenticated;








ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "root";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "root";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "root";

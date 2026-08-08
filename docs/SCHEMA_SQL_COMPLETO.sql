


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
    'ManhÃ£',
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
        p.role <> 'root'; -- Exclui o usuÃ¡rio root da listagem
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
  -- CORREÃ‡ÃƒO: Insere o ID do novo usuÃ¡rio do Auth na coluna 'user_id'.
  INSERT INTO public.profiles (user_id, email, name, role)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'name', 'Novo UsuÃ¡rio'),
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

    -- Remove as associaÃ§Ãµes antigas
    DELETE FROM public.guardians_students
    WHERE guardian_id = p_guardian_id;

    -- Insere as novas associaÃ§Ãµes, se houver
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


COMMENT ON TABLE "public"."classes" IS 'Armazena as turmas da instituiÃ§Ã£o.';



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



CREATE POLICY "Cuidadores gerenciam sua prÃ³pria agenda" ON "public"."schedules" TO "authenticated" USING (("caregiver_id" = ( SELECT "profiles"."id"
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



CREATE POLICY "Gestores tÃªm acesso total a agendas" ON "public"."schedules" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."user_id" = "auth"."uid"()) AND ("profiles"."role" = 'gestor'::"public"."user_role"))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."user_id" = "auth"."uid"()) AND ("profiles"."role" = 'gestor'::"public"."user_role")))));



CREATE POLICY "Gestores tÃªm acesso total a estudantes" ON "public"."students" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."user_id" = "auth"."uid"()) AND ("profiles"."role" = 'gestor'::"public"."user_role"))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."user_id" = "auth"."uid"()) AND ("profiles"."role" = 'gestor'::"public"."user_role")))));



CREATE POLICY "Gestores tÃªm acesso total a vÃ­nculos de cuidadores" ON "public"."caregivers_students" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."user_id" = "auth"."uid"()) AND ("profiles"."role" = 'gestor'::"public"."user_role"))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."user_id" = "auth"."uid"()) AND ("profiles"."role" = 'gestor'::"public"."user_role")))));



CREATE POLICY "Gestores tÃªm acesso total a vÃ­nculos de responsÃ¡veis" ON "public"."guardians_students" TO "authenticated" USING ((EXISTS ( SELECT 1
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



CREATE POLICY "ResponsÃ¡veis visualizam agenda de seus estudantes" ON "public"."schedules" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
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

























































































































































GRANT ALL ON FUNCTION "public"."get_all_profiles_with_email"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_all_profiles_with_email"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_all_profiles_with_email"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_all_users"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_all_users"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_all_users"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_current_user_role"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_current_user_role"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_current_user_role"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_my_claim"("claim" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_my_claim"("claim" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_my_claim"("claim" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_professors_with_details"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_professors_with_details"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_professors_with_details"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_profile_with_email"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_profile_with_email"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_profile_with_email"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_profiles_with_email"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_profiles_with_email"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_profiles_with_email"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_profiles_with_email"("p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_profiles_with_email"("p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_profiles_with_email"("p_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_role_for_claims"("user_id_input" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_role_for_claims"("user_id_input" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_role_for_claims"("user_id_input" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_admin"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_gestor"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_gestor"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_gestor"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_guardian_with_students"("p_guardian_id" "uuid", "p_profile_data" "jsonb", "p_student_ids" "uuid"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."update_guardian_with_students"("p_guardian_id" "uuid", "p_profile_data" "jsonb", "p_student_ids" "uuid"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_guardian_with_students"("p_guardian_id" "uuid", "p_profile_data" "jsonb", "p_student_ids" "uuid"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";


















GRANT ALL ON TABLE "public"."caregivers_students" TO "anon";
GRANT ALL ON TABLE "public"."caregivers_students" TO "authenticated";
GRANT ALL ON TABLE "public"."caregivers_students" TO "service_role";



GRANT ALL ON TABLE "public"."classes" TO "anon";
GRANT ALL ON TABLE "public"."classes" TO "authenticated";
GRANT ALL ON TABLE "public"."classes" TO "service_role";



GRANT ALL ON TABLE "public"."documents" TO "anon";
GRANT ALL ON TABLE "public"."documents" TO "authenticated";
GRANT ALL ON TABLE "public"."documents" TO "service_role";



GRANT ALL ON TABLE "public"."guardians_students" TO "anon";
GRANT ALL ON TABLE "public"."guardians_students" TO "authenticated";
GRANT ALL ON TABLE "public"."guardians_students" TO "service_role";



GRANT ALL ON TABLE "public"."professors" TO "anon";
GRANT ALL ON TABLE "public"."professors" TO "authenticated";
GRANT ALL ON TABLE "public"."professors" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."reports" TO "anon";
GRANT ALL ON TABLE "public"."reports" TO "authenticated";
GRANT ALL ON TABLE "public"."reports" TO "service_role";



GRANT ALL ON TABLE "public"."schedules" TO "anon";
GRANT ALL ON TABLE "public"."schedules" TO "authenticated";
GRANT ALL ON TABLE "public"."schedules" TO "service_role";



GRANT ALL ON TABLE "public"."students" TO "anon";
GRANT ALL ON TABLE "public"."students" TO "authenticated";
GRANT ALL ON TABLE "public"."students" TO "service_role";



GRANT ALL ON TABLE "public"."teachers_classes" TO "anon";
GRANT ALL ON TABLE "public"."teachers_classes" TO "authenticated";
GRANT ALL ON TABLE "public"."teachers_classes" TO "service_role";



GRANT ALL ON SEQUENCE "public"."teachers_classes_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."teachers_classes_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."teachers_classes_id_seq" TO "service_role";




-- VIEW PARA O DASHBOARD (Calcula estatÃ­sticas corretas ignorando bugs de frontend)
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






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";
-- 20260807000000_pdi_and_siem.sql

-- ============================================================
-- 1. PDI (Plano de Desenvolvimento Individual)
-- ============================================================

CREATE TYPE public.pdi_status AS ENUM ('pendente', 'em_andamento', 'concluida');

CREATE TABLE IF NOT EXISTS public.student_pdi (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    title text NOT NULL,
    description text,
    status public.pdi_status DEFAULT 'pendente'::public.pdi_status NOT NULL,
    target_date date,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.pdi_evaluations (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    pdi_id uuid NOT NULL REFERENCES public.student_pdi(id) ON DELETE CASCADE,
    evaluator_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    notes text NOT NULL,
    progress_score integer CHECK (progress_score >= 1 AND progress_score <= 5),
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Triggers for updated_at
CREATE TRIGGER update_student_pdi_updated_at BEFORE UPDATE ON public.student_pdi FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS
ALTER TABLE public.student_pdi ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pdi_evaluations ENABLE ROW LEVEL SECURITY;

-- RLS for student_pdi
CREATE POLICY "Gestores can manage all student_pdi" ON public.student_pdi USING (public.is_gestor() OR public.is_admin());

CREATE POLICY "Cuidadores can view pdi for assigned students" ON public.student_pdi FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.caregivers_students cs
        JOIN public.profiles p ON p.id = cs.caregiver_id
        WHERE cs.student_id = student_pdi.student_id AND p.user_id = auth.uid() AND p.role = 'cuidador'::public.user_role
    )
);

CREATE POLICY "ResponsÃ¡veis can view pdi for their students" ON public.student_pdi FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.guardians_students gs
        JOIN public.profiles p ON p.id = gs.guardian_id
        WHERE gs.student_id = student_pdi.student_id AND p.user_id = auth.uid() AND p.role = 'responsavel'::public.user_role
    )
);

-- RLS for pdi_evaluations
CREATE POLICY "Gestores can manage all pdi_evaluations" ON public.pdi_evaluations USING (public.is_gestor() OR public.is_admin());

CREATE POLICY "Cuidadores can view evaluations for assigned students" ON public.pdi_evaluations FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.student_pdi pdi
        JOIN public.caregivers_students cs ON cs.student_id = pdi.student_id
        JOIN public.profiles p ON p.id = cs.caregiver_id
        WHERE pdi.id = pdi_evaluations.pdi_id AND p.user_id = auth.uid() AND p.role = 'cuidador'::public.user_role
    )
);

CREATE POLICY "ResponsÃ¡veis can view evaluations for their students" ON public.pdi_evaluations FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.student_pdi pdi
        JOIN public.guardians_students gs ON gs.student_id = pdi.student_id
        JOIN public.profiles p ON p.id = gs.guardian_id
        WHERE pdi.id = pdi_evaluations.pdi_id AND p.user_id = auth.uid() AND p.role = 'responsavel'::public.user_role
    )
);

CREATE POLICY "Cuidadores can insert evaluations for assigned students" ON public.pdi_evaluations FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.student_pdi pdi
        JOIN public.caregivers_students cs ON cs.student_id = pdi.student_id
        JOIN public.profiles p ON p.id = cs.caregiver_id
        WHERE pdi.id = pdi_evaluations.pdi_id AND p.user_id = auth.uid() AND p.role = 'cuidador'::public.user_role
    )
);


-- ============================================================
-- 2. SIEM (Security Logs)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.security_logs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    event_type text NOT NULL,
    user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    ip_address text,
    details jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.security_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Gestores can view security_logs" ON public.security_logs FOR SELECT USING (public.is_gestor() OR public.is_admin());

-- Allow insert from authenticated users (can be tightened later, but needed for frontend telemetry)
CREATE POLICY "Authenticated can insert security_logs" ON public.security_logs FOR INSERT TO authenticated WITH CHECK (true);
-- ========================================================================================
-- MIGRATION: 20260808000000_todo_features.sql
-- DESCRIÃ‡ÃƒO: CriaÃ§Ã£o das tabelas para as funcionalidades de SeguranÃ§a, PDI avanÃ§ado,
--            SaÃºde, e ComunicaÃ§Ã£o do TODO.md.
-- ========================================================================================

-- ==========================================
-- 1. SEGURANÃ‡A E MONITORAMENTO
-- ==========================================

-- Pessoas autorizadas a buscar o aluno
CREATE TABLE IF NOT EXISTS public.authorized_persons (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    name text NOT NULL,
    relationship text NOT NULL, -- Ex: Tio, AvÃ³, Motorista
    doc_id text NOT NULL, -- CPF ou RG
    photo_url text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Registro de Entrada e SaÃ­da (Check-in/Check-out)
CREATE TABLE IF NOT EXISTS public.student_checkins (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    authorized_person_id uuid REFERENCES public.authorized_persons(id) ON DELETE SET NULL,
    checkin_time timestamp with time zone,
    checkout_time timestamp with time zone,
    logged_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL, -- Profissional que registrou
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Incidentes (BotÃ£o de PÃ¢nico / Crises / Acidentes)
CREATE TABLE IF NOT EXISTS public.incidents (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    reporter_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
    severity text NOT NULL CHECK (severity IN ('baixa', 'media', 'alta', 'emergencia')),
    description text NOT NULL,
    action_taken text,
    resolved boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- ==========================================
-- 2. RELATÃ“RIOS E PDI AVANÃ‡ADO
-- ==========================================

-- DiÃ¡rio de Bordo / AnedotÃ¡rio
CREATE TABLE IF NOT EXISTS public.anecdotal_records (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    author_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title text NOT NULL,
    content text NOT NULL,
    media_url text, -- Opcional: foto/video curto ou Ã¡udio
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Conquistas (GamificaÃ§Ã£o)
CREATE TABLE IF NOT EXISTS public.student_achievements (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    title text NOT NULL,
    description text,
    badge_icon text, -- Ex: 'star', 'trophy'
    achieved_at timestamp with time zone DEFAULT now() NOT NULL
);

-- ==========================================
-- 3. SAÃšDE E BEM-ESTAR
-- ==========================================

-- PrescriÃ§Ãµes/MedicaÃ§Ãµes do Aluno
CREATE TABLE IF NOT EXISTS public.medications (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    name text NOT NULL,
    dosage text NOT NULL,
    schedule text NOT NULL, -- Ex: "Ã€s 10h e 14h"
    instructions text,
    active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Log de AdministraÃ§Ã£o da MedicaÃ§Ã£o
CREATE TABLE IF NOT EXISTS public.medication_logs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    medication_id uuid NOT NULL REFERENCES public.medications(id) ON DELETE CASCADE,
    administered_by uuid NOT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
    administered_at timestamp with time zone DEFAULT now() NOT NULL,
    notes text
);

-- DiÃ¡rio de SaÃºde (Sono, AlimentaÃ§Ã£o) - Preenchido parte pela famÃ­lia, parte pela escola
CREATE TABLE IF NOT EXISTS public.daily_health_logs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    log_date date DEFAULT CURRENT_DATE NOT NULL,
    -- Preenchido pela famÃ­lia de manhÃ£
    sleep_quality text, 
    morning_mood text,
    parents_notes text,
    -- Preenchido pela escola Ã  tarde
    meal_quality text,
    bathroom_notes text,
    school_notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- ==========================================
-- 4. COMUNICAÃ‡ÃƒO FAMÃLIA-ESCOLA
-- ==========================================

-- Chat seguro
CREATE TABLE IF NOT EXISTS public.messages (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    receiver_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    student_id uuid REFERENCES public.students(id) ON DELETE CASCADE, -- Contexto do chat
    content text NOT NULL,
    read_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Murais / Comunicados da Escola
CREATE TABLE IF NOT EXISTS public.announcements (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title text NOT NULL,
    content text NOT NULL,
    author_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
    requires_signature boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Assinaturas de Comunicados (Ex: AutorizaÃ§Ã£o de passeio)
CREATE TABLE IF NOT EXISTS public.announcement_signatures (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    announcement_id uuid NOT NULL REFERENCES public.announcements(id) ON DELETE CASCADE,
    guardian_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    signed_at timestamp with time zone DEFAULT now() NOT NULL
);

-- ==========================================
-- CONFIGURAÃ‡Ã•ES DE RLS (SEGURANÃ‡A BASICA)
-- (Pode ser ajustado conforme a lÃ³gica fina de negÃ³cios, 
-- por padrÃ£o permitindo Gestores tudo, e acesso restrito aos cuidadores/pais)
-- ==========================================

ALTER TABLE public.authorized_persons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anecdotal_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medication_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_health_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcement_signatures ENABLE ROW LEVEL SECURITY;

-- PolÃ­ticas de Admin/Gestor (Tem acesso total a todas as tabelas)
DROP POLICY IF EXISTS "Gestores can manage all" ON public.authorized_persons;
CREATE POLICY "Gestores can manage all" ON public.authorized_persons USING (public.is_gestor() OR public.is_admin());

DROP POLICY IF EXISTS "Gestores can manage all" ON public.student_checkins;
CREATE POLICY "Gestores can manage all" ON public.student_checkins USING (public.is_gestor() OR public.is_admin());

DROP POLICY IF EXISTS "Gestores can manage all" ON public.incidents;
CREATE POLICY "Gestores can manage all" ON public.incidents USING (public.is_gestor() OR public.is_admin());

DROP POLICY IF EXISTS "Gestores can manage all" ON public.anecdotal_records;
CREATE POLICY "Gestores can manage all" ON public.anecdotal_records USING (public.is_gestor() OR public.is_admin());

DROP POLICY IF EXISTS "Gestores can manage all" ON public.student_achievements;
CREATE POLICY "Gestores can manage all" ON public.student_achievements USING (public.is_gestor() OR public.is_admin());

DROP POLICY IF EXISTS "Gestores can manage all" ON public.medications;
CREATE POLICY "Gestores can manage all" ON public.medications USING (public.is_gestor() OR public.is_admin());

DROP POLICY IF EXISTS "Gestores can manage all" ON public.medication_logs;
CREATE POLICY "Gestores can manage all" ON public.medication_logs USING (public.is_gestor() OR public.is_admin());

DROP POLICY IF EXISTS "Gestores can manage all" ON public.daily_health_logs;
CREATE POLICY "Gestores can manage all" ON public.daily_health_logs USING (public.is_gestor() OR public.is_admin());

DROP POLICY IF EXISTS "Gestores can manage all" ON public.messages;
CREATE POLICY "Gestores can manage all" ON public.messages USING (public.is_gestor() OR public.is_admin());

DROP POLICY IF EXISTS "Gestores can manage all" ON public.announcements;
CREATE POLICY "Gestores can manage all" ON public.announcements USING (public.is_gestor() OR public.is_admin());

DROP POLICY IF EXISTS "Gestores can manage all" ON public.announcement_signatures;
CREATE POLICY "Gestores can manage all" ON public.announcement_signatures USING (public.is_gestor() OR public.is_admin());
-- ========================================================================================
-- MIGRATION: 20260808000001_mock_data.sql
-- DESCRIÃ‡ÃƒO: Insere dados falsos nas novas tabelas (PDI, SaÃºde, ComunicaÃ§Ã£o, SeguranÃ§a)
--            para popular a interface com dados reais do Supabase.
-- ========================================================================================

-- NOTA: Como nÃ£o sabemos os IDs exatos dos alunos e perfis, vamos fazer um bloco anonimo PL/pgSQL
-- para pegar o primeiro aluno e primeiro perfil e usÃ¡-los.

DO $$
DECLARE
    v_student_id uuid;
    v_profile_id uuid;
    v_medication_id uuid;
    v_announcement_id uuid;
BEGIN
    -- Pegar o primeiro aluno existente
    SELECT id INTO v_student_id FROM public.students LIMIT 1;
    
    -- Pegar o primeiro perfil existente (Provavelmente o gestor/professor)
    SELECT id INTO v_profile_id FROM public.profiles LIMIT 1;

    -- Se tiver aluno e perfil, insere os dados
    IF v_student_id IS NOT NULL AND v_profile_id IS NOT NULL THEN
    
        -- 1. SEGURANÃ‡A (Check-ins)
        INSERT INTO public.student_checkins (student_id, checkin_time, logged_by, notes)
        VALUES (v_student_id, now() - interval '4 hours', v_profile_id, 'Chegou animado');

        INSERT INTO public.incidents (student_id, reporter_id, severity, description, action_taken, resolved)
        VALUES (v_student_id, v_profile_id, 'media', 'Crise de choro ao trocar de sala', 'ContenÃ§Ã£o no cantinho da calma', true);

        -- 2. PDI (AnedotÃ¡rio e Conquistas)
        INSERT INTO public.anecdotal_records (student_id, author_id, title, content)
        VALUES 
            (v_student_id, v_profile_id, 'Uso do PECS', 'O aluno conseguiu pedir Ã¡gua apontando para a ficha correta de forma independente pela primeira vez.'),
            (v_student_id, v_profile_id, 'SocializaÃ§Ã£o', 'Dividiu o brinquedo com o colega durante o intervalo sem mediaÃ§Ã£o.');

        INSERT INTO public.student_achievements (student_id, title, description, badge_icon)
        VALUES 
            (v_student_id, 'Super SimpÃ¡tico', 'Deu bom dia para 3 colegas diferentes', 'smile'),
            (v_student_id, 'HerÃ³i da Calma', 'Respirou fundo durante uma frustraÃ§Ã£o', 'award');

        -- 3. SAÃšDE (MedicaÃ§Ã£o e DiÃ¡rio)
        INSERT INTO public.medications (student_id, name, dosage, schedule, instructions)
        VALUES (v_student_id, 'Risperidona', '1mg', '10:00 AM', 'Dar com suco ou Ã¡gua')
        RETURNING id INTO v_medication_id;

        INSERT INTO public.medication_logs (medication_id, administered_by, notes)
        VALUES (v_medication_id, v_profile_id, 'Tudo certo');

        INSERT INTO public.daily_health_logs (student_id, log_date, sleep_quality, parents_notes, meal_quality, bathroom_notes, school_notes)
        VALUES (v_student_id, CURRENT_DATE, 'Boa', 'Dormiu a noite toda', 'Regular', 'Fez xixi 2x', 'Aceitou apenas arroz no almoÃ§o');

        -- 4. COMUNICAÃ‡ÃƒO (Mural e Chat)
        INSERT INTO public.messages (sender_id, receiver_id, student_id, content)
        VALUES 
            (v_profile_id, v_profile_id, v_student_id, 'OlÃ¡! Como foi a noite dele?'),
            (v_profile_id, v_profile_id, v_student_id, 'Foi Ã³tima, dormiu bem. Ele estÃ¡ levando a lancheira azul hoje.');

        INSERT INTO public.announcements (title, content, author_id, requires_signature)
        VALUES ('Passeio ao Parque EcolÃ³gico', 'Iremos ao parque na prÃ³xima sexta-feira. Por favor, assinem a autorizaÃ§Ã£o.', v_profile_id, true)
        RETURNING id INTO v_announcement_id;

    END IF;
END $$;
-- ========================================================================================
-- MIGRATION: 20260808000002_more_real_data.sql
-- DESCRIÃ‡ÃƒO: CriaÃ§Ã£o das tabelas restantes para eliminar dados estÃ¡ticos do frontend.
--            (Metas PDI, Gatilhos e Materiais).
-- ========================================================================================

CREATE TABLE IF NOT EXISTS public.pdi_goals (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    title text NOT NULL,
    progress_percentage integer DEFAULT 0,
    color text DEFAULT 'violet',
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.student_triggers (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    insight_text text NOT NULL,
    suggestion_text text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.materials (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title text NOT NULL,
    type text NOT NULL, -- 'pdf', 'video'
    size_mb numeric,
    url text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Policies
ALTER TABLE public.pdi_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_triggers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Gestores can manage all" ON public.pdi_goals;
CREATE POLICY "Gestores can manage all" ON public.pdi_goals USING (public.is_gestor() OR public.is_admin());

DROP POLICY IF EXISTS "Gestores can manage all" ON public.student_triggers;
CREATE POLICY "Gestores can manage all" ON public.student_triggers USING (public.is_gestor() OR public.is_admin());

DROP POLICY IF EXISTS "Gestores can manage all" ON public.materials;
CREATE POLICY "Gestores can manage all" ON public.materials USING (public.is_gestor() OR public.is_admin());

-- Mock Data Injection
DO $$
DECLARE
    v_student_id uuid;
BEGIN
    SELECT id INTO v_student_id FROM public.students LIMIT 1;
    
    IF v_student_id IS NOT NULL THEN
        -- PDI Goals
        INSERT INTO public.pdi_goals (student_id, title, progress_percentage, color)
        VALUES 
            (v_student_id, 'Habilidade Motora Fina', 75, 'violet'),
            (v_student_id, 'ComunicaÃ§Ã£o Alternativa (PECS)', 90, 'emerald'),
            (v_student_id, 'InteraÃ§Ã£o Social Direcionada', 40, 'amber');

        -- Triggers
        INSERT INTO public.student_triggers (student_id, insight_text, suggestion_text)
        VALUES (
            v_student_id, 
            'Notamos que em 80% das vezes que a qualidade do sono Ã© relatada como "Agitada", ocorre uma "Crise de RegulaÃ§Ã£o" entre 09:30 e 10:30.',
            'Ao identificar noites de sono ruins, antecipar o horÃ¡rio do lanche e focar em atividades de baixa demanda sensorial na primeira aula.'
        );

        -- Materials
        INSERT INTO public.materials (title, type, size_mb)
        VALUES 
            ('Cartilha de RegulaÃ§Ã£o', 'pdf', 2.4),
            ('VÃ­deo: Uso de PECS', 'video', 15.0);
    END IF;
END $$;
CREATE TABLE IF NOT EXISTS public.meetings (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title text NOT NULL,
    participants text NOT NULL,
    scheduled_at timestamp with time zone NOT NULL,
    status text DEFAULT 'Confirmada',
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Gestores can manage all" ON public.meetings;
CREATE POLICY "Gestores can manage all" ON public.meetings USING (public.is_gestor() OR public.is_admin());

DO $$
BEGIN
    INSERT INTO public.meetings (title, participants, scheduled_at)
    VALUES ('Alinhamento de PDI - Lucas', 'Com: PsicÃ³loga, TO e MÃ£e', now() + interval '2 days');
END $$;
-- ========================================================================================
-- MIGRATION: 20260808000004_clear_mocks.sql
-- DESCRIÃ‡ÃƒO: Limpa os dados de teste (Lucas, etc) e prepara o banco para uso real em produÃ§Ã£o.
-- ========================================================================================

DELETE FROM public.medication_logs;
DELETE FROM public.medications;
DELETE FROM public.student_achievements;
DELETE FROM public.anecdotal_records;
DELETE FROM public.incidents;
DELETE FROM public.student_checkins;
DELETE FROM public.daily_health_logs;
DELETE FROM public.messages;
DELETE FROM public.announcements;
DELETE FROM public.pdi_goals;
DELETE FROM public.student_triggers;
DELETE FROM public.materials;
DELETE FROM public.meetings;

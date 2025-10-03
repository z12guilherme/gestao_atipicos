import { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { Student } from "./useStudents";
import { supabase } from "@/integrations/supabase/client";

type UserRole = 'gestor' | 'cuidador' | 'responsavel';

interface Profile {
  id: string;
  user_id: string;
  name: string;
  cpf?: string;
  phone?: string;
  role: UserRole;
  function_title?: string;
  work_schedule?: string;
}

interface GuardianStudent {
  students: Student;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  guardianStudents: Student[];
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [guardianStudents, setGuardianStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSessionAndProfile = async () => {
      setLoading(true);
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        console.error("Erro ao buscar sessão:", sessionError);
        setLoading(false);
        return;
      }

      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', session.user.id)
          .single();

        if (profileError) console.error("Erro ao buscar perfil:", profileError);
        setProfile(profileData as Profile | null);

        if (profileData?.role === 'responsavel') {
          const { data: studentsData } = await supabase
            .from('guardians_students')
            .select('students:student_id (*)')
            .eq('guardian_id', profileData.id);
          
          const students = (studentsData as any[] | null)?.map(item => item.students) || [];
          setGuardianStudents(students as Student[]);
        }
      } else {
        setProfile(null);
        setGuardianStudents([]);
      }
      setLoading(false);
    };

    fetchSessionAndProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        // Recarrega os dados da sessão e perfil quando o estado de autenticação muda (login/logout)
        fetchSessionAndProfile();
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string, name: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: { name }
      }
    });
    return { error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const value = {
    user,
    session,
    profile,
    guardianStudents,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
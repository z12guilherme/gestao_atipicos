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
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch user profile
          setTimeout(async () => {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('*')
              .eq('user_id', session.user.id)
              .single();
            
            setProfile(profileData as Profile);

            if (profileData?.role === 'responsavel') {
              const { data: studentsData } = await supabase
                .from('guardians_students')
                .select('students:student_id (*)')
                .eq('guardian_id', profileData.id);
              
              const students = (studentsData as GuardianStudent[] | null)?.map(item => item.students) || [];
              setGuardianStudents(students);
            } else {
              setGuardianStudents([]);
            }

            setLoading(false);
          }, 0);
        } else {
          setProfile(null);
          setGuardianStudents([]);
          setLoading(false);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Fetch user profile
        setTimeout(async () => {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', session.user.id)
            .single();
          
          setProfile(profileData as Profile);

          if (profileData?.role === 'responsavel') {
            const { data: studentsData } = await supabase
              .from('guardians_students')
              .select('students:student_id (*)')
              .eq('guardian_id', profileData.id);
            
            const students = (studentsData as GuardianStudent[] | null)?.map(item => item.students) || [];
            setGuardianStudents(students);
          } else {
            setGuardianStudents([]);
          }

          setLoading(false);
        }, 0);
      } else {
        setGuardianStudents([]);
        setLoading(false);
      }
    });

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
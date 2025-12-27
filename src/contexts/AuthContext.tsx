import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserRole, User as AppUser } from '@/types';
import { useToast } from '@/hooks/use-toast';

// Mock Session type to minimize refactoring impact
interface Session {
  user: { id: string; email?: string };
  access_token: string;
}

interface AuthContextType {
  user: AppUser | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, role: UserRole, fullName?: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check for local session
    const storedSession = localStorage.getItem('lms_local_session');
    if (storedSession) {
      try {
        const parsed = JSON.parse(storedSession);
        setSession(parsed.session);
        setUser(parsed.user); // The login response includes the user profile
      } catch (e) {
        console.error('Failed to restore session', e);
        localStorage.removeItem('lms_local_session');
      }
    }
    setIsLoading(false);
  }, []);

  const signIn = async (email: string, password: string): Promise<{ error: Error | null }> => {
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      const appUser: AppUser = {
        id: data.user.id,
        email: data.user.email,
        fullName: data.user.full_name,
        role: data.user.role as UserRole,
        avatarUrl: undefined
      };

      const sessionData = {
        user: appUser,
        session: { user: { id: appUser.id, email: appUser.email }, access_token: 'mock-token' }
      };

      setSession(sessionData.session);
      setUser(appUser);
      localStorage.setItem('lms_local_session', JSON.stringify(sessionData));

      toast({
        title: 'Welcome back!',
        description: 'You have successfully signed in.',
      });

      return { error: null };
    } catch (err) {
      const error = err as Error;
      toast({
        title: 'Sign In Failed',
        description: error.message,
        variant: 'destructive',
      });
      return { error };
    }
  };

  const signUp = async (
    email: string,
    password: string,
    role: UserRole,
    fullName?: string
  ): Promise<{ error: Error | null }> => {
    // For now, local sign up is not implemented in the backend schema fully (auto-id gen is okay but the endpoint is missing)
    // I'll leave this as a stub or implement a simple mock if needed.
    toast({
      title: 'Not Implemented',
      description: 'Sign up is not yet supported in local mode. Please use the demo accounts.',
      variant: 'destructive',
    });
    return { error: new Error('Not implemented') };
  };

  const signOut = async () => {
    localStorage.removeItem('lms_local_session');
    setUser(null);
    setSession(null);
    toast({
      title: 'Signed Out',
      description: 'You have been successfully signed out.',
    });
  };

  return (
    <AuthContext.Provider value={{ user, session, isLoading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { apiClient } from '@/lib/api-client';

interface User {
  id: string;
  email: string;
  name: string;
}

interface UserRole {
  id: string;
  user_id: string;
  establishment_id: string;
  role: string;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  profile: User | null;
  roles: UserRole[];
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<User | null>(null);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);

  const loadUserData = async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      // Get profile
      const profileData = await apiClient.get<User>('/auth/profile');
      setUser(profileData);
      setProfile(profileData);

      // Get roles
      const rolesData = await apiClient.get<UserRole[]>('/auth/roles');
      setRoles(rolesData);
    } catch (error) {
      console.error('Failed to load user data:', error);
      localStorage.removeItem('auth_token');
      setUser(null);
      setProfile(null);
      setRoles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserData();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const response = await apiClient.post<{ user: User; token: string }>('/auth/signin', {
        email,
        password,
      });

      localStorage.setItem('auth_token', response.token);
      setUser(response.user);
      setProfile(response.user);

      // Load roles
      const rolesData = await apiClient.get<UserRole[]>('/auth/roles');
      setRoles(rolesData);

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const response = await apiClient.post<{ user: User; token: string }>('/auth/signup', {
        name,
        email,
        password,
      });

      localStorage.setItem('auth_token', response.token);
      setUser(response.user);
      setProfile(response.user);

      // Load roles
      const rolesData = await apiClient.get<UserRole[]>('/auth/roles');
      setRoles(rolesData);

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    localStorage.removeItem('auth_token');
    setUser(null);
    setProfile(null);
    setRoles([]);
  };

  const refreshUserData = async () => {
    await loadUserData();
  };

  const value: AuthContextType = {
    user,
    profile,
    roles,
    loading,
    signIn,
    signUp,
    signOut,
    refreshUserData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

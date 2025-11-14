import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { establishmentsApi, userRolesApi } from '@/services/api';
import type { Database } from '@/integrations/supabase/types';

type Establishment = Database['public']['Tables']['establishments']['Row'];
type UserRole = Database['public']['Tables']['user_roles']['Row'] & {
  establishments: Establishment;
};

interface EstablishmentContextType {
  establishments: Establishment[];
  currentEstablishment: Establishment | null;
  userRoles: UserRole[];
  loading: boolean;
  error: string | null;
  setCurrentEstablishment: (establishment: Establishment | null) => void;
  refreshEstablishments: () => Promise<void>;
}

const EstablishmentContext = createContext<EstablishmentContextType | undefined>(undefined);

const STORAGE_KEY = 'a-pay:current-establishment';

export const EstablishmentProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [currentEstablishment, setCurrentEstablishmentState] = useState<Establishment | null>(null);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const setCurrentEstablishment = (establishment: Establishment | null) => {
    setCurrentEstablishmentState(establishment);
    if (establishment) {
      localStorage.setItem(STORAGE_KEY, establishment.id);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const loadEstablishments = async () => {
    if (!user) {
      setEstablishments([]);
      setUserRoles([]);
      setCurrentEstablishmentState(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Get user roles with establishments
      const roles = await userRolesApi.getByUser(user.id);
      setUserRoles(roles as UserRole[]);

      // Extract unique establishments
      const uniqueEstablishments = roles
        .map(r => (r as UserRole).establishments)
        .filter((est, index, self) =>
          index === self.findIndex(e => e.id === est.id)
        );

      setEstablishments(uniqueEstablishments);

      // Try to restore previously selected establishment
      const savedEstablishmentId = localStorage.getItem(STORAGE_KEY);
      if (savedEstablishmentId) {
        const savedEstablishment = uniqueEstablishments.find(
          e => e.id === savedEstablishmentId
        );
        if (savedEstablishment) {
          setCurrentEstablishmentState(savedEstablishment);
        } else if (uniqueEstablishments.length > 0) {
          setCurrentEstablishmentState(uniqueEstablishments[0]);
        }
      } else if (uniqueEstablishments.length > 0) {
        // Auto-select first establishment if none selected
        setCurrentEstablishmentState(uniqueEstablishments[0]);
      }
    } catch (err) {
      console.error('Error loading establishments:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar estabelecimentos');
    } finally {
      setLoading(false);
    }
  };

  const refreshEstablishments = async () => {
    await loadEstablishments();
  };

  useEffect(() => {
    loadEstablishments();
  }, [user]);

  const value: EstablishmentContextType = {
    establishments,
    currentEstablishment,
    userRoles,
    loading,
    error,
    setCurrentEstablishment,
    refreshEstablishments,
  };

  return (
    <EstablishmentContext.Provider value={value}>
      {children}
    </EstablishmentContext.Provider>
  );
};

export const useEstablishment = () => {
  const context = useContext(EstablishmentContext);
  if (context === undefined) {
    throw new Error('useEstablishment must be used within an EstablishmentProvider');
  }
  return context;
};

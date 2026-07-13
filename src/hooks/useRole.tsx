import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import type { Role } from '../types/game';
import { api } from '../services/api';

interface RoleContextValue { role: Role | null; selectRole: (role: Role) => Promise<void>; clearRole: () => void }
const RoleContext = createContext<RoleContextValue | null>(null);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role | null>(() => sessionStorage.getItem('demo-role') as Role | null);
  const value = useMemo<RoleContextValue>(() => ({
    role,
    selectRole: async (nextRole) => {
      try { await api.selectRole(nextRole); } catch { /* Vite-only preview uses the same UI guard. */ }
      sessionStorage.setItem('demo-role', nextRole);
      setRole(nextRole);
    },
    clearRole: () => { sessionStorage.removeItem('demo-role'); setRole(null); },
  }), [role]);
  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole() {
  const context = useContext(RoleContext);
  if (!context) throw new Error('useRole must be used inside RoleProvider.');
  return context;
}

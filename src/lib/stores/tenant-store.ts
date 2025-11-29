import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Tenant, AdminUnit, User } from '@/lib/types/database';

interface TenantState {
  // Current user
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;

  // Current tenant context
  currentTenant: Tenant | null;
  setCurrentTenant: (tenant: Tenant | null) => void;

  // Available tenants (for global admins)
  availableTenants: Tenant[];
  setAvailableTenants: (tenants: Tenant[]) => void;

  // Admin unit hierarchy for current tenant
  adminUnits: AdminUnit[];
  setAdminUnits: (units: AdminUnit[]) => void;

  // Selected admin unit for filtering
  selectedAdminUnit: AdminUnit | null;
  setSelectedAdminUnit: (unit: AdminUnit | null) => void;

  // Loading states
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;

  // Reset state
  reset: () => void;
}

const initialState = {
  currentUser: null,
  currentTenant: null,
  availableTenants: [],
  adminUnits: [],
  selectedAdminUnit: null,
  isLoading: false,
};

export const useTenantStore = create<TenantState>()(
  persist(
    (set) => ({
      ...initialState,

      setCurrentUser: (user) => set({ currentUser: user }),
      setCurrentTenant: (tenant) => set({ currentTenant: tenant }),
      setAvailableTenants: (tenants) => set({ availableTenants: tenants }),
      setAdminUnits: (units) => set({ adminUnits: units }),
      setSelectedAdminUnit: (unit) => set({ selectedAdminUnit: unit }),
      setIsLoading: (loading) => set({ isLoading: loading }),
      reset: () => set(initialState),
    }),
    {
      name: 'sormas-ai-tenant',
      partialize: (state) => ({
        currentTenant: state.currentTenant,
        selectedAdminUnit: state.selectedAdminUnit,
      }),
    }
  )
);

// Selectors
export const selectIsGlobalAdmin = (state: TenantState) =>
  state.currentUser?.role === 'global_admin';

export const selectCanManageTenant = (state: TenantState) =>
  state.currentUser?.role === 'global_admin' ||
  state.currentUser?.role === 'country_admin';

export const selectCanEditData = (state: TenantState) =>
  state.currentUser?.role !== 'regional_viewer';

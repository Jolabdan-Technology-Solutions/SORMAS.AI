'use client';

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { useTenantStore } from '@/lib/stores/tenant-store';
import type { Tenant, AdminUnit, User } from '@/lib/types/database';

export function useTenant() {
  const supabase = createClient();
  const {
    currentUser,
    currentTenant,
    adminUnits,
    availableTenants,
    setCurrentUser,
    setCurrentTenant,
    setAdminUnits,
    setAvailableTenants,
  } = useTenantStore();

  // Fetch current user profile
  const { data: userProfile, isLoading: isLoadingUser } = useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return data as User;
    },
  });

  // Fetch tenants (all for global admin, single for country users)
  const { data: tenants, isLoading: isLoadingTenants } = useQuery({
    queryKey: ['tenants', userProfile?.role],
    queryFn: async () => {
      if (!userProfile) return [];

      if (userProfile.role === 'global_admin') {
        const { data, error } = await supabase
          .from('tenants')
          .select('*')
          .order('name');
        if (error) throw error;
        return data as Tenant[];
      } else if (userProfile.tenant_id) {
        const { data, error } = await supabase
          .from('tenants')
          .select('*')
          .eq('id', userProfile.tenant_id)
          .single();
        if (error) throw error;
        return [data as Tenant];
      }
      return [];
    },
    enabled: !!userProfile,
  });

  // Fetch admin units for current tenant
  const { data: units, isLoading: isLoadingUnits } = useQuery({
    queryKey: ['admin-units', currentTenant?.id],
    queryFn: async () => {
      if (!currentTenant) return [];

      const { data, error } = await supabase
        .from('admin_units')
        .select(
          `
          *,
          admin_level:admin_levels(*)
        `
        )
        .eq('tenant_id', currentTenant.id)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return data as AdminUnit[];
    },
    enabled: !!currentTenant,
  });

  // Sync query data to store
  useEffect(() => {
    if (userProfile) {
      setCurrentUser(userProfile);
    }
  }, [userProfile, setCurrentUser]);

  useEffect(() => {
    if (tenants) {
      setAvailableTenants(tenants);
      // Auto-select first tenant if none selected
      if (!currentTenant && tenants.length > 0) {
        setCurrentTenant(tenants[0]);
      }
    }
  }, [tenants, currentTenant, setAvailableTenants, setCurrentTenant]);

  useEffect(() => {
    if (units) {
      setAdminUnits(units);
    }
  }, [units, setAdminUnits]);

  const isLoading = isLoadingUser || isLoadingTenants || isLoadingUnits;

  return {
    currentUser,
    currentTenant,
    adminUnits,
    availableTenants,
    isLoading,
    setCurrentTenant,
    isGlobalAdmin: currentUser?.role === 'global_admin',
    canManageTenant:
      currentUser?.role === 'global_admin' ||
      currentUser?.role === 'country_admin',
  };
}

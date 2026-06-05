import { useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../lib/axios';
import { useAuthStore } from '../stores/authStore';
import type { LoginResponse, UserProfile } from '../types/auth';

/**
 * Hook for handling login mutation.
 * Stores token and user info in authStore upon success.
 */
export const useLogin = () => {
  const setAuth = useAuthStore((state) => state.setAuth);
  
  return useMutation({
    mutationFn: async (credentials: any) => {
      const response = await api.post<LoginResponse>('/auth/login', credentials);
      return response.data;
    },
    onSuccess: (data) => {
      setAuth(data.token, data.user);
    },
  });
};

/**
 * Hook for handling logout.
 * Clears authStore and redirects to login page.
 */
export const useLogout = () => {
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const navigate = useNavigate();

  return () => {
    clearAuth();
    navigate('/login');
  };
};

/**
 * Hook for fetching current user profile.
 * Updates authStore.user with fresh data.
 */
export const useMe = () => {
  const setAuth = useAuthStore((state) => state.setAuth);
  const token = useAuthStore((state) => state.token);

  const query = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const response = await api.get<UserProfile>('/auth/me');
      return response.data;
    },
    enabled: !!token,
  });

  useEffect(() => {
    if (query.data && token) {
      setAuth(token, query.data);
    }
  }, [query.data, token, setAuth]);

  return query;
};

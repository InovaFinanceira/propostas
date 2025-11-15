'use client';

import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// Função helper para obter cookie
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

// Função helper para remover cookie
function removeCookie(name: string) {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

export const useCurrentUser = () => {
  const [userId, setUserId] = useState<Id<'users'> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Verifica localStorage primeiro
    let storedUserId = window.localStorage.getItem('userId');
    
    // Se não há no localStorage, verifica cookie
    if (!storedUserId) {
      storedUserId = getCookie('userId');
      if (storedUserId) {
        // Sincroniza localStorage com cookie
        window.localStorage.setItem('userId', storedUserId);
      }
    } else {
      // Se há no localStorage, garante que está no cookie também
      const cookieValue = `userId=${storedUserId}; path=/; max-age=86400; secure=${window.location.protocol === 'https:'}; samesite=strict`;
      document.cookie = cookieValue;
    }
    
    if (storedUserId) {
      setUserId(storedUserId as Id<'users'>);
    } else {
      // Sem autenticação, redireciona
      router.replace('/');
    }
    
    setIsLoading(false);
  }, [router]);

  const currentUser = useQuery(
    api.users.getCurrentUser,
    userId ? { userId } : "skip"
  );

  // Verifica se o usuário é válido
  useEffect(() => {
    if (!isLoading && userId && currentUser === null) {
      // Usuário inválido, fazer logout
      logout();
    }
  }, [currentUser, userId, isLoading]);

  // Função para logout
  const logout = () => {
    localStorage.removeItem('userId');
    removeCookie('userId');
    setUserId(null);
    window.location.href = '/';
  };

  return {
    currentUser,
    isLoading: isLoading || (!!userId && currentUser === undefined),
    isAuthenticated: !!userId && !!currentUser,
    logout,
  };
};
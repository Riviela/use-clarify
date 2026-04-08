'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { User } from '@supabase/supabase-js';

interface UseUpgradeReturn {
  handleUpgrade: () => void;
  user: User | null;
  loading: boolean;
}

/**
 * Custom hook for handling Premium upgrade navigation
 * 
 * Logic:
 * - If user is not logged in (Guest): Redirect to /login with redirect_to parameter
 * - If user is logged in: Redirect to /pricing
 * 
 * Usage:
 * const { handleUpgrade } = useUpgrade();
 * <Button onClick={handleUpgrade}>Upgrade to Pro</Button>
 */
export function useUpgrade(): UseUpgradeReturn {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  useEffect(() => {
    async function checkUser() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
      } catch (error) {
        console.error('Error checking user:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    checkUser();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleUpgrade = useCallback(() => {
    if (loading) return;

    if (!user) {
      // Guest user - redirect to login with redirect_to parameter
      const redirectUrl = encodeURIComponent(pathname);
      router.push(`/login?redirect_to=${redirectUrl}`);
    } else {
      // Logged in user - redirect to pricing
      router.push('/pricing');
    }
  }, [user, loading, router, pathname]);

  return { handleUpgrade, user, loading };
}

/**
 * Standalone function for use in non-hook contexts (like Server Components or event handlers)
 * 
 * Usage:
 * import { redirectToUpgrade } from '@/hooks/use-upgrade';
 * 
 * // In an event handler:
 * const handleClick = async () => {
 *   await redirectToUpgrade();
 * };
 */
export async function redirectToUpgrade(): Promise<void> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (typeof window !== 'undefined') {
    if (!user) {
      const currentPath = window.location.pathname;
      window.location.href = `/login?redirect_to=${encodeURIComponent(currentPath)}`;
    } else {
      window.location.href = '/pricing';
    }
  }
}

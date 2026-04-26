import { createClient } from '@/utils/supabase/server';

/**
 * Server-side check for admin role.
 * Reads `is_admin` from the `profiles` table for the currently authenticated user.
 */
export async function isCurrentUserAdmin(): Promise<boolean> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    return profile?.is_admin === true;
  } catch {
    return false;
  }
}

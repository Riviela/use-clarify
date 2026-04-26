import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { AdminConsole } from '@/components/admin-console';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Console',
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const supabase = await createClient();

  // 1. Auth check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login?redirect=/admin');
  }

  // 2. Admin check
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin, full_name')
    .eq('id', user.id)
    .single();

  if (!profile?.is_admin) {
    redirect('/');
  }

  // 3. Aggregate stats (best-effort; RLS may limit visibility for non-service roles)
  const [
    { count: totalUsers },
    { count: premiumUsers },
    { count: adminUsers },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('plan_type', 'premium'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('is_admin', true),
  ]);

  return (
    <AdminConsole
      adminEmail={user.email ?? ''}
      adminName={profile.full_name ?? user.email?.split('@')[0] ?? 'Admin'}
      stats={{
        totalUsers: totalUsers ?? 0,
        premiumUsers: premiumUsers ?? 0,
        adminUsers: adminUsers ?? 0,
      }}
    />
  );
}

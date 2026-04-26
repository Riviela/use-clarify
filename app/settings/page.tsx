'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import {
  UserCircle,
  CreditCard,
  Shield,
  Receipt,
  Loader2,
  Save,
  Crown,
  ExternalLink,
  Calendar,
  Sparkles,
  ArrowRight,
  DollarSign,
  Clock,
  XCircle,
  Zap,
} from 'lucide-react';
import { MFASettings } from '@/components/mfa-settings';
import { BillingHistory } from '@/components/billing-history';
import Link from 'next/link';

const VARIANT_YEARLY = process.env.NEXT_PUBLIC_LEMON_VARIANT_YEARLY || '';

interface ProfileData {
  plan_type: string;
  full_name: string | null;
  avatar_url: string | null;
  subscription_status: string | null;
  current_period_end: string | null;
  update_url: string | null;
  variant_id: string | null;
  subscription_start_date: string | null;
  subscription_end_date: string | null;
  plan_interval: string | null;
}

type SettingsTab = 'profile' | 'security' | 'subscription' | 'billing';

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(dateStr));
}

function getStatusBadge(status: string | null): { label: string; classes: string } {
  switch (status) {
    case 'active':
    case 'on_trial':
      return { label: 'Active', classes: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 border-0' };
    case 'past_due':
      return { label: 'Past Due', classes: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 border-0' };
    case 'cancelled':
    case 'expired':
      return { label: 'Cancelled', classes: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border-0' };
    default:
      return { label: 'Inactive', classes: 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400 border-0' };
  }
}

export default function SettingsPage() {
  const router = useRouter();
  const supabase = createClient();

  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');

  // Profile form state
  const [displayName, setDisplayName] = useState('');
  const [saving, setSaving] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const { data: { user: authUser } } = await supabase.auth.getUser();

      if (!authUser) {
        router.push('/login');
        return;
      }

      setUser(authUser);

      const { data: profileData } = await supabase
        .from('profiles')
        .select('plan_type, full_name, avatar_url, subscription_status, current_period_end, update_url, variant_id, subscription_start_date, subscription_end_date, plan_interval')
        .eq('id', authUser.id)
        .single();

      if (profileData) {
        setProfile(profileData);
        setDisplayName(
          profileData.full_name ||
          authUser.user_metadata?.full_name ||
          authUser.user_metadata?.display_name ||
          ''
        );
      }

      setLoading(false);
    }
    fetchData();
  }, [supabase, router]);

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);

    try {
      const { error: authError } = await supabase.auth.updateUser({
        data: { display_name: displayName, full_name: displayName },
      });

      if (authError) {
        toast.error('Failed to update profile: ' + authError.message);
        setSaving(false);
        return;
      }

      const { error: dbError } = await supabase
        .from('profiles')
        .update({ full_name: displayName })
        .eq('id', user.id);

      if (dbError) {
        console.error('Profile DB update error:', dbError);
      }

      toast.success('Profile updated successfully.');
      setProfile((prev) => prev ? { ...prev, full_name: displayName } : prev);
    } catch {
      toast.error('An unexpected error occurred.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpgradeToYearly = async () => {
    if (!VARIANT_YEARLY) {
      toast.error('Yearly plan is not configured.');
      return;
    }
    setCheckoutLoading(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variantId: VARIANT_YEARLY }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Checkout failed.');
        return;
      }
      if (data.url) window.location.href = data.url;
    } catch {
      toast.error('Could not reach the server.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
      </div>
    );
  }

  if (!user) return null;

  const currentDisplayName =
    profile?.full_name ||
    user.user_metadata?.full_name ||
    user.user_metadata?.display_name ||
    user.email?.split('@')[0] ||
    'User';
  const initials = currentDisplayName.slice(0, 2).toUpperCase();
  const avatarUrl = profile?.avatar_url || user.user_metadata?.avatar_url;
  const planType = profile?.plan_type ?? 'free';
  const isPremium = planType === 'premium';
  const isMonthly = profile?.plan_interval === 'month';
  const statusBadge = getStatusBadge(profile?.subscription_status ?? null);

  const hasNameChanged =
    displayName !== (profile?.full_name || user.user_metadata?.full_name || user.user_metadata?.display_name || '');

  const planAmount = isMonthly ? '$19.99 / month' : '$199.99 / year';

  const tabs: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
    { id: 'profile', label: 'Profile', icon: <UserCircle className="w-4 h-4" /> },
    { id: 'security', label: 'Security', icon: <Shield className="w-4 h-4" /> },
    { id: 'subscription', label: 'Subscription', icon: <CreditCard className="w-4 h-4" /> },
    { id: 'billing', label: 'Invoices', icon: <Receipt className="w-4 h-4" /> },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Page Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-white">
          Settings
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Manage your account and subscription preferences.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Navigation */}
        <nav className="md:w-56 flex-shrink-0">
          <div className="flex md:flex-col gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors w-full text-left ${
                  activeTab === tab.id
                    ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-900'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </nav>

        {/* Content Area */}
        <div className="flex-1 min-w-0">
          {/* ─── PROFILE TAB ─── */}
          {activeTab === 'profile' && (
            <div className="space-y-8">
              {/* Avatar Section */}
              <div className="flex items-center gap-6">
                <div className="relative">
                  <Avatar className="h-20 w-20 ring-4 ring-zinc-100 dark:ring-zinc-800">
                    <AvatarImage src={avatarUrl || undefined} />
                    <AvatarFallback className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text-xl font-semibold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  {isPremium && (
                    <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 rounded-full flex items-center justify-center shadow-lg">
                      <Crown className="h-3.5 w-3.5 text-white" />
                    </div>
                  )}
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                    {currentDisplayName}
                  </h2>
                  <p className="text-sm text-zinc-500">{user.email}</p>
                </div>
              </div>

              <div className="border-t border-zinc-200 dark:border-zinc-800" />

              {/* Display Name */}
              <div className="max-w-md space-y-2">
                <Label htmlFor="displayName" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Display Name
                </Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Enter your display name"
                  className="h-11 rounded-lg border-zinc-200 dark:border-zinc-800"
                />
                <p className="text-xs text-zinc-400">
                  This is how your name appears across the platform.
                </p>
              </div>

              {/* Email (Read-only) */}
              <div className="max-w-md space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Email Address
                </Label>
                <Input
                  id="email"
                  value={user.email || ''}
                  disabled
                  className="h-11 rounded-lg border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-400 cursor-not-allowed"
                />
                <p className="text-xs text-zinc-400">
                  Email cannot be changed from this page.
                </p>
              </div>

              {/* Save */}
              <div className="pt-2">
                <Button
                  onClick={handleSaveProfile}
                  disabled={!hasNameChanged || saving}
                  className="h-10 px-6 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg font-medium"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* ─── SECURITY TAB ─── */}
          {activeTab === 'security' && (
            <MFASettings />
          )}

          {/* ─── BILLING TAB ─── */}
          {activeTab === 'billing' && (
            <BillingHistory />
          )}

          {/* ─── SUBSCRIPTION TAB ─── */}
          {activeTab === 'subscription' && (
            <div className="space-y-6">
              {isPremium ? (
                <>
                  {/* ── A. Plan Overview ── */}
                  <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
                    <div className="px-6 py-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 via-yellow-400 to-amber-500 flex items-center justify-center shadow-md">
                            <Crown className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">Your Plan</p>
                            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
                              Pro Plan
                              <span className="ml-2 text-sm font-normal text-zinc-400">
                                ({isMonthly ? 'Monthly' : 'Yearly'})
                              </span>
                            </h2>
                          </div>
                        </div>
                        <Badge className={`${statusBadge.classes} font-medium text-xs px-3 py-1`}>
                          {statusBadge.label}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* ── B. Billing Details ── */}
                  <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
                    <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
                      <h3 className="text-sm font-semibold text-zinc-900 dark:text-white tracking-wide uppercase">
                        Billing Details
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-zinc-100 dark:divide-zinc-800">
                      {/* Start Date */}
                      <div className="px-6 py-5">
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="w-4 h-4 text-zinc-400" />
                          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                            Start Date
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                          {formatDate(profile?.subscription_start_date)}
                        </p>
                      </div>

                      {/* Next Renewal */}
                      <div className="px-6 py-5">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="w-4 h-4 text-zinc-400" />
                          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                            Next Renewal
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                          {formatDate(profile?.subscription_end_date)}
                        </p>
                      </div>

                      {/* Amount */}
                      <div className="px-6 py-5">
                        <div className="flex items-center gap-2 mb-2">
                          <DollarSign className="w-4 h-4 text-zinc-400" />
                          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                            Amount
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                          {planAmount}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* ── C. Action Buttons ── */}
                  <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
                    <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
                      <h3 className="text-sm font-semibold text-zinc-900 dark:text-white tracking-wide uppercase">
                        Manage
                      </h3>
                    </div>
                    <div className="px-6 py-5 space-y-4">
                      {/* Upgrade to Yearly — only for monthly subscribers */}
                      {isMonthly && (
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/40">
                          <div>
                            <p className="text-sm font-medium text-zinc-900 dark:text-white">
                              Switch to Annual Billing
                            </p>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                              Save ~17% with annual billing — $199.99/year instead of $239.88/year.
                            </p>
                          </div>
                          <Button
                            onClick={handleUpgradeToYearly}
                            disabled={checkoutLoading}
                            className="h-9 px-5 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg text-sm font-medium whitespace-nowrap"
                          >
                            {checkoutLoading ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                                Redirecting...
                              </>
                            ) : (
                              <>
                                <Zap className="w-3.5 h-3.5 mr-2" />
                                Upgrade to Yearly
                              </>
                            )}
                          </Button>
                        </div>
                      )}

                      {/* Update Payment Method */}
                      {profile?.update_url && (
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div>
                            <p className="text-sm font-medium text-zinc-900 dark:text-white">
                              Update Payment Method
                            </p>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                              Change your card or billing information on the secure portal.
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            className="h-9 rounded-lg text-sm font-medium whitespace-nowrap"
                            onClick={() => window.open(profile.update_url!, '_blank')}
                          >
                            <ExternalLink className="w-3.5 h-3.5 mr-2" />
                            Manage on Portal
                          </Button>
                        </div>
                      )}

                      {/* Cancel Subscription */}
                      {profile?.update_url && (
                        <>
                          <div className="border-t border-zinc-100 dark:border-zinc-800" />
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div>
                              <p className="text-sm font-medium text-zinc-900 dark:text-white">
                                Cancel Subscription
                              </p>
                              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                                You can cancel anytime. Access continues until the current period ends.
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              className="h-9 rounded-lg text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 whitespace-nowrap"
                              onClick={() => window.open(profile.update_url!, '_blank')}
                            >
                              <XCircle className="w-3.5 h-3.5 mr-2" />
                              Cancel Plan
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* ── Free Plan ── */}
                  <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
                    <div className="px-6 py-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                            <Sparkles className="w-6 h-6 text-zinc-500" />
                          </div>
                          <div>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">Your Plan</p>
                            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
                              Starter Plan
                            </h2>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-zinc-500 dark:text-zinc-400 font-medium text-xs px-3 py-1">
                          Free
                        </Badge>
                      </div>
                    </div>

                    <div className="px-6 pb-6 space-y-5">
                      <div className="border-t border-zinc-100 dark:border-zinc-800" />
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                        You are on the Starter tier with limited access. Upgrade to Clarify Pro to unlock
                        unlimited word limits, advanced grammar &amp; style engine, the Humanizer,
                        all tone modes, and detailed hallucination reports.
                      </p>
                      <Link href="/pricing">
                        <Button className="h-10 px-6 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg font-medium">
                          <Crown className="w-4 h-4 mr-2" />
                          Upgrade to Pro
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

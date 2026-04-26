/**
 * @server-only
 * This module should only be imported in Server Components or Server Actions.
 * Do not import this in Client Components - use '@/utils/supabase/client' instead.
 */

import { createClient } from '@/utils/supabase/server';

/** Union type representing available subscription plans */
export type PlanType = 'free' | 'premium';

export interface UserPlan {
  planType: PlanType;
  wordLimit: number;
  features: string[];
}

/**
 * Get user's plan information from the database
 * This function should be called from Server Components or Server Actions
 */
export async function getUserPlan(userId?: string): Promise<UserPlan | null> {
  try {
    const supabase = await createClient();
    
    // If no userId provided, get current user
    if (!userId) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      userId = user.id;
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('plan_type, is_admin')
      .eq('id', userId)
      .single();

    if (error || !profile) {
      console.error('Error fetching user plan:', error);
      return null;
    }

    // Admins always have premium privileges, regardless of subscription state
    const planType: PlanType =
      profile.is_admin === true || profile.plan_type === 'premium' ? 'premium' : 'free';

    return {
      planType,
      wordLimit: planType === 'premium' ? 3000 : 500,
      features: planType === 'premium'
        ? ['humanizer', 'unlimited_words', 'all_formats', 'advanced_grammar', 'all_tones']
        : ['detector', 'basic_grammar', 'bullet_summary', 'paraphrase_100'],
    };
  } catch (error) {
    console.error('Error in getUserPlan:', error);
    return null;
  }
}

/**
 * Check user's plan type
 * For Server Components and Server Actions
 */
export async function getUserPlanType(userId?: string): Promise<PlanType> {
  const plan = await getUserPlan(userId);
  return plan?.planType ?? 'free';
}

/**
 * Get word limit for user
 * For Server Components and Server Actions
 */
export async function getWordLimit(userId?: string): Promise<number> {
  const plan = await getUserPlan(userId);
  return plan?.wordLimit || 500;
}

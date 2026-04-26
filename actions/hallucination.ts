'use server';

import { createClient } from '@/utils/supabase/server';
import type { PlanType } from '@/lib/user-plan';

async function fetchPlanType(): Promise<PlanType> {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return 'free';
        const { data: profile } = await supabase
            .from('profiles')
            .select('plan_type')
            .eq('id', user.id)
            .single();
        return (profile?.plan_type === 'premium') ? 'premium' : 'free';
    } catch {
        return 'free';
    }
}

export interface HallucinationResult {
    success: boolean;
    summary?: string;
    claims?: string[];
    error?: string;
    claimCount?: number;
}

export async function detectHallucinations(text: string): Promise<HallucinationResult> {
    const planType = await fetchPlanType();
    try {
        if (!process.env.GROQ_API_KEY) {
            throw new Error('GROQ_API_KEY is missing');
        }

        if (!text.trim()) {
            return {
                success: false,
                error: 'Please enter text to analyze.',
            };
        }

        // Dynamic import to avoid issues during build/HMR
        const { default: Groq } = await import('groq-sdk');
        
        const groq = new Groq({
            apiKey: process.env.GROQ_API_KEY,
        });

        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: `STRICT LANGUAGE RULE: Analyze the input text and identify its language. Your output MUST be in the EXACT SAME LANGUAGE as the input. Do not translate under any circumstances. If input is Turkish, output Turkish. If English, output English. If Spanish, output Spanish. Maintain the original language throughout.

You are a content verification expert. Analyze the text and find suspicious claims.

When analyzing, pay attention to:
1. Logical inconsistencies
2. Impossible or unrealistic statements
3. Contradictory information
4. Exaggerated or unproven claims
5. Temporal inconsistencies

Respond in JSON format:
{
  "summary": "A brief general evaluation (2-3 sentences) in the same language as the input",
  "claimCount": number,
  "claims": [
    "Suspicious claim 1 - reason (in same language as input)",
    "Suspicious claim 2 - reason (in same language as input)"
  ]
}

If there are no suspicious claims, the claims array should be empty.

CRITICAL: All output must be in the same language as the input text.`,
                },
                {
                    role: 'user',
                    content: text,
                },
            ],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.3,
            max_tokens: 2048,
            response_format: { type: 'json_object' }
        });

        const content = completion.choices[0]?.message?.content;

        if (!content) {
            throw new Error('Groq API did not respond');
        }

        const result = JSON.parse(content);
        const claimCount = result.claimCount || result.claims?.length || 0;

        // For free users: Only show summary and claim count, not the actual claims
        if (planType !== 'premium') {
            return {
                success: true,
                summary: result.summary,
                claimCount: claimCount,
                claims: [], // Don't send actual claims to free users
            };
        }

        // For premium users: Full details
        return {
            success: true,
            summary: result.summary,
            claims: result.claims || [],
            claimCount: claimCount,
        };
    } catch (error) {
        console.error('Groq Hallucination Error:', error);
        
        return {
            success: false,
            error: 'Operation failed, please try again.',
        };
    }
}

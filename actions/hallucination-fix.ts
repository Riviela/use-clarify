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

export interface HallucinationFixResult {
    success: boolean;
    fixedText?: string;
    changes?: string[];
    error?: string;
}

export async function fixHallucinations(
    text: string, 
    claims: string[]
): Promise<HallucinationFixResult> {
    const planType = await fetchPlanType();
    console.log('Hallucination fix started... Text length:', text.length, 'Claims:', claims.length, 'Plan:', planType);

    try {
        if (!process.env.GROQ_API_KEY) {
            throw new Error('GROQ_API_KEY is missing');
        }

        if (!text.trim()) {
            return {
                success: false,
                error: 'Please enter text to fix.',
            };
        }

        if (planType !== 'premium') {
            return {
                success: false,
                error: 'The hallucination fix feature is only available for Premium members.',
            };
        }

        // Dynamic import to avoid issues during build/HMR
        const { default: Groq } = await import('groq-sdk');
        
        const groq = new Groq({
            apiKey: process.env.GROQ_API_KEY,
        });

        const claimsList = claims.join('\n');

        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: `STRICT LANGUAGE RULE: Analyze the input text and identify its language. Your output MUST be in the EXACT SAME LANGUAGE as the input. Do not translate under any circumstances. If input is Turkish, output Turkish. If English, output English. If Spanish, output Spanish. Maintain the original language throughout.

You are a professional editor and fact-checker. Your task is to fix logical errors, hallucinations, and suspicious claims in the given text.

Instructions:
1. Identify and fix the problematic claims listed
2. Remove or correct logical inconsistencies
3. Fix impossible or unrealistic statements
4. Correct contradictory information
5. Remove exaggerated or unproven claims
6. Fix temporal inconsistencies
7. Maintain the original meaning and flow of the text
8. CRITICAL: Preserve the original language of the text - DO NOT TRANSLATE

Respond in JSON format:
{
  "fixedText": "The corrected text with all issues fixed (in same language as input)",
  "changes": [
    "Description of change 1 (in same language as input)",
    "Description of change 2 (in same language as input)"
  ]
}

All output must be in the same language as the input text.`,
                },
                {
                    role: 'user',
                    content: `Original Text:\n${text}\n\nSuspicious Claims to Fix:\n${claimsList}\n\nPlease fix these issues in the text.`,
                },
            ],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.5,
            max_tokens: 4096,
            response_format: { type: 'json_object' }
        });

        const content = completion.choices[0]?.message?.content;

        if (!content) {
            throw new Error('Groq API did not respond');
        }

        const result = JSON.parse(content);

        console.log('Hallucination fix successful');

        return {
            success: true,
            fixedText: result.fixedText,
            changes: result.changes || [],
        };
    } catch (error) {
        console.error('Groq Hallucination Fix Error:', error);
        
        return {
            success: false,
            error: 'Operation failed, please try again.',
        };
    }
}

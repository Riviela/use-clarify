'use server';

import { createClient } from '@/utils/supabase/server';
import type { PlanType } from '@/lib/user-plan';

export interface ParaphraseResult {
    success: boolean;
    text?: string;
    error?: string;
    wordCount?: number;
    isPremiumRequired?: boolean;
}

const FREE_TIER_WORD_LIMIT = 100;

async function fetchUserPlanType(): Promise<PlanType> {
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

export async function paraphraseText(text: string): Promise<ParaphraseResult> {
    const planType = await fetchUserPlanType();

    try {
        const wordCount = text.trim().split(/\s+/).filter(word => word.length > 0).length;
        
        // Premium check - if more than 100 words, premium is required
        if (planType !== 'premium' && wordCount > FREE_TIER_WORD_LIMIT) {
            return {
                success: false,
                error: `This feature is only for Premium members. Free users can paraphrase up to ${FREE_TIER_WORD_LIMIT} words.`,
                wordCount,
                isPremiumRequired: true,
            };
        }

        if (!process.env.GROQ_API_KEY) {
            throw new Error('GROQ_API_KEY is missing');
        }

        if (!text.trim()) {
            return {
                success: false,
                error: 'Please enter text to paraphrase.',
                wordCount: 0,
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

You are a professional editor. You will rewrite (paraphrase) the given text.

Instructions:
1. Fully preserve the meaning and context of the text
2. Change sentence structures but don't lose the meaning
3. Enrich the expression using synonymous words
4. Make it more fluent and readable
5. CRITICAL: Preserve the original language of the text - DO NOT TRANSLATE
6. Return only the paraphrased text, no additional explanations
7. Preserve quotation marks, paragraph structure, and basic formatting
8. Keep the length of the text as much as possible (don't shorten or lengthen too much)`,
                },
                {
                    role: 'user',
                    content: text,
                },
            ],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.7,
            max_tokens: 4096,
        });

        const paraphrasedText = completion.choices[0]?.message?.content;

        if (!paraphrasedText) {
            throw new Error('Groq API did not respond');
        }

        return {
            success: true,
            text: paraphrasedText.trim(),
            wordCount,
            isPremiumRequired: false,
        };
    } catch (error) {
        console.error('Groq Paraphrase Error:', error);
        
        return {
            success: false,
            error: 'Operation failed, please try again.',
        };
    }
}

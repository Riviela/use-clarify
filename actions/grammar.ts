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

export interface GrammarResult {
    success: boolean;
    text?: string;
    error?: string;
    correctionsCount?: number;
}

export async function checkGrammar(text: string): Promise<GrammarResult> {
    const planType = await fetchPlanType();
    console.log('Grammar check started... Text length:', text.length, 'Plan:', planType);

    try {
        if (!process.env.GROQ_API_KEY) {
            throw new Error('GROQ_API_KEY is missing');
        }

        if (!text.trim()) {
            return {
                success: false,
                error: 'Please enter text to check.',
            };
        }

        // Dynamic import to avoid issues during build/HMR
        const { default: Groq } = await import('groq-sdk');
        
        const groq = new Groq({
            apiKey: process.env.GROQ_API_KEY,
        });

        // Base language preservation instruction
        const languageInstruction = `STRICT LANGUAGE RULE: Analyze the input text and identify its language. Your output MUST be in the EXACT SAME LANGUAGE as the input. Do not translate under any circumstances. If input is Turkish, output Turkish. If English, output English. If Spanish, output Spanish. Maintain the original language throughout.`;

        // Different prompts for Free and Premium
        const freePrompt = `${languageInstruction}

You are a grammar expert. Fix spelling errors, punctuation errors, and basic grammar errors in the text. ONLY correct errors, do not change the structure or tone of the text. Return the corrected text in the same language as the input.`;

        const premiumPrompt = `${languageInstruction}

You are a professional editor and grammar expert. Correct and improve the text comprehensively:

1. Fix spelling and punctuation errors
2. Check and correct punctuation marks
3. Improve sentence structure and flow
4. Enrich word choices
5. Make tone and style professional
6. Reduce repetitions
7. Fix expression errors

CRITICAL: Maintain the exact same language as the input text. Do not translate.

Return the corrected and improved text.`;

        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: planType === 'premium' ? premiumPrompt : freePrompt,
                },
                {
                    role: 'user',
                    content: text,
                },
            ],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.3,
            max_tokens: 4096,
        });

        const correctedText = completion.choices[0]?.message?.content;

        if (!correctedText) {
            throw new Error('Groq API did not respond');
        }

        // Calculate approximate corrections (word differences)
        const originalWords = text.trim().split(/\s+/).length;
        const correctedWords = correctedText.trim().split(/\s+/).length;
        const correctionsCount = Math.abs(originalWords - correctedWords) + Math.floor(text.length / 100);

        console.log('Grammar check successful. Corrections:', correctionsCount);

        return {
            success: true,
            text: correctedText.trim(),
            correctionsCount: Math.max(1, correctionsCount),
        };
    } catch (error) {
        console.error('Groq Grammar Error:', error);
        
        return {
            success: false,
            error: 'Operation failed, please try again.',
        };
    }
}

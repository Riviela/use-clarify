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

export type SummaryFormat = 'bullet' | 'paragraph' | 'executive';

export interface SummarizeResult {
    success: boolean;
    text?: string;
    error?: string;
    format?: SummaryFormat;
}

export async function summarizeText(
    text: string, 
    format: SummaryFormat
): Promise<SummarizeResult> {
    const planType = await fetchPlanType();
    try {
        if (!process.env.GROQ_API_KEY) {
            throw new Error('GROQ_API_KEY is missing');
        }

        if (!text.trim()) {
            return {
                success: false,
                error: 'Please enter text to summarize.',
            };
        }

        // For free users, only bullet format is allowed
        if (planType !== 'premium' && format !== 'bullet') {
            return {
                success: false,
                error: 'This feature is only for Premium members. Free users can only use the "Bullet Points" format.',
            };
        }

        // Dynamic import to avoid issues during build/HMR
        const { default: Groq } = await import('groq-sdk');
        
        const groq = new Groq({
            apiKey: process.env.GROQ_API_KEY,
        });

        let formatInstruction = '';
        switch (format) {
            case 'bullet':
                formatInstruction = 'Summarize the text in bullet points. Each item should be short and concise. Use the - mark.';
                break;
            case 'paragraph':
                formatInstruction = 'Summarize the text as a fluent paragraph. Sentences should be connected to each other.';
                break;
            case 'executive':
                formatInstruction = 'Summarize the text in a professional "Executive Summary" format. Include context, key findings, and conclusions. Use business language.';
                break;
        }

        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: `STRICT LANGUAGE RULE: Analyze the input text and identify its language. Your output MUST be in the EXACT SAME LANGUAGE as the input. Do not translate under any circumstances. If input is Turkish, output Turkish. If English, output English. If Spanish, output Spanish. Maintain the original language throughout.

You are a professional text summarizer. Summarize the following text:

${formatInstruction}

CRITICAL: The summary must be in the exact same language as the original text. The summary should preserve the main ideas while maintaining the original language.`,
                },
                {
                    role: 'user',
                    content: text,
                },
            ],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.5,
            max_tokens: 2048,
        });

        const summary = completion.choices[0]?.message?.content;

        if (!summary) {
            throw new Error('Groq API did not respond');
        }

        return {
            success: true,
            text: summary.trim(),
            format,
        };
    } catch (error) {
        console.error('Groq Summarize Error:', error);
        
        return {
            success: false,
            error: 'Operation failed, please try again.',
        };
    }
}

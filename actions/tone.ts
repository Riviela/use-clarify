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

export type ToneType = 'professional' | 'academic' | 'casual' | 'witty' | 'aggressive';

export interface ToneResult {
    success: boolean;
    text?: string;
    error?: string;
    tone?: ToneType;
}

// Free tier only allows 'professional'
const FREE_TONE: ToneType = 'professional';
const PREMIUM_TONES: ToneType[] = ['academic', 'casual', 'witty', 'aggressive'];

export async function changeTone(
    text: string, 
    tone: ToneType
): Promise<ToneResult> {
    const planType = await fetchPlanType();
    console.log('Tone change started... Text length:', text.length, 'Tone:', tone, 'Plan:', planType);

    try {
        if (!process.env.GROQ_API_KEY) {
            throw new Error('GROQ_API_KEY is missing');
        }

        if (!text.trim()) {
            return {
                success: false,
                error: 'Please enter text to change tone.',
            };
        }

        // Check if free user is trying to use premium tone
        if (planType !== 'premium' && tone !== FREE_TONE) {
            return {
                success: false,
                error: `The "${tone}" tone is only for Premium members. Free users can only use the "Professional" tone.`,
            };
        }

        // Dynamic import to avoid issues during build/HMR
        const { default: Groq } = await import('groq-sdk');
        
        const groq = new Groq({
            apiKey: process.env.GROQ_API_KEY,
        });

        let toneInstruction = '';
        switch (tone) {
            case 'professional':
                toneInstruction = 'Transform the text into a professional, formal tone suitable for the business world. Use corporate language.';
                break;
            case 'academic':
                toneInstruction = 'Rewrite the text in an academic, scientific, and scholarly article style. Use technical terminology.';
                break;
            case 'casual':
                toneInstruction = 'Transform the text into a friendly, casual, and conversational tone. Use a relaxed style.';
                break;
            case 'witty':
                toneInstruction = 'Transform the text into a witty, creative, and clever tone. Add humor elements.';
                break;
            case 'aggressive':
                toneInstruction = 'Transform the text into a strong, persuasive, and slightly aggressive tone. Use effective arguments.';
                break;
        }

        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: `STRICT LANGUAGE RULE: Analyze the input text and identify its language. Your output MUST be in the EXACT SAME LANGUAGE as the input. Do not translate under any circumstances. If input is Turkish, output Turkish. If English, output English. If Spanish, output Spanish. Maintain the original language throughout.

You are a professional writing expert. ${toneInstruction}

CRITICAL INSTRUCTION: The output MUST be in the EXACT SAME LANGUAGE as the input text. Do NOT translate or change the language under any circumstances. Preserve the meaning of the text while only changing its tone and style, but NEVER change the language.`,
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

        const tonedText = completion.choices[0]?.message?.content;

        if (!tonedText) {
            throw new Error('Groq API did not respond');
        }

        console.log('Tone change successful. Result length:', tonedText.length);

        return {
            success: true,
            text: tonedText.trim(),
            tone,
        };
    } catch (error) {
        console.error('Groq Tone Error:', error);
        
        return {
            success: false,
            error: 'Operation failed, please try again.',
        };
    }
}

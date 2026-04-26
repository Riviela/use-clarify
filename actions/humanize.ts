'use server';

import Groq from 'groq-sdk';
import { createClient } from '@/utils/supabase/server';
import type { PlanType } from '@/lib/user-plan';

const apiKey = process.env.GROQ_API_KEY || '';

const groq = new Groq({
    apiKey: apiKey,
});

async function getUserPlanType(): Promise<PlanType> {
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

export interface HumanizeResult {
    success: boolean;
    text?: string;
    error?: string;
}

// Generate Lorem Ipsum dummy text for free users
function generateLoremIpsum(wordCount: number): string {
    const words = [
        'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
        'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
        'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
        'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo',
        'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate',
        'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint',
        'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia',
        'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum'
    ];
    
    let result = '';
    for (let i = 0; i < wordCount; i++) {
        result += words[i % words.length] + ' ';
        if ((i + 1) % 12 === 0) result += '. ';
    }
    return result.trim() + '.';
}

export async function humanizeText(text: string): Promise<HumanizeResult> {
    const planType = await getUserPlanType();

    try {
        if (!process.env.GROQ_API_KEY) {
            throw new Error('GROQ_API_KEY is missing');
        }

        if (!text.trim()) {
            return {
                success: false,
                error: 'Please enter text to humanize.',
            };
        }

        // SECURITY: For free users, return dummy Lorem Ipsum text
        // Real content is NEVER sent to client for non-premium users
        if (planType !== 'premium') {
            const wordCount = text.trim().split(/\s+/).filter(w => w.length > 0).length;
            const dummyText = generateLoremIpsum(wordCount * 2); // Generate similar length text
            
            return {
                success: true,
                text: dummyText,
            };
        }

        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: `STRICT LANGUAGE RULE: Analyze the input text and identify its language. Your output MUST be in the EXACT SAME LANGUAGE as the input. Do not translate under any circumstances. If input is Turkish, output Turkish. If English, output English. If Spanish, output Spanish. Maintain the original language throughout.

You are a professional editor. Rewrite the given text without changing its meaning, using more natural, fluent, and human-like language.

Instructions:
1. Vary sentence structures (mix short and long sentences)
2. Avoid robotic repetitions
3. Use a more friendly, conversational style
4. Vary introductory phrases and conjunctions
5. CRITICAL: Preserve the original language of the text - DO NOT TRANSLATE
6. Return only the rewritten text, no additional explanations
7. Preserve quotation marks, paragraph structure, and basic formatting`,
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

        const humanizedText = completion.choices[0]?.message?.content;

        if (!humanizedText) {
            throw new Error('Groq API did not respond');
        }

        return {
            success: true,
            text: humanizedText.trim(),
        };
    } catch (error) {
        console.error('Groq Humanize Error:', error);
        
        return {
            success: false,
            error: 'Operation failed, please try again.',
        };
    }
}

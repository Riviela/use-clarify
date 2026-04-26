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

export interface ExpanderResult {
    success: boolean;
    text?: string;
    error?: string;
    wordCount?: number;
    isTruncated?: boolean;
}

const FREE_TIER_WORD_LIMIT = 500;
const PREMIUM_WORD_LIMIT = 5000;

// Generate dummy text for free users
function generateDummyText(wordCount: number): string {
    const loremWords = [
        'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
        'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
        'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
        'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo',
        'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate',
        'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint',
        'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia',
        'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum'
    ];
    
    let dummyText = '';
    for (let i = 0; i < wordCount; i++) {
        dummyText += loremWords[i % loremWords.length] + ' ';
        if ((i + 1) % 15 === 0) dummyText += '. ';
    }
    return dummyText.trim() + '.';
}

// Extract first sentence or first N words
function extractFirstPortion(text: string, maxWords: number = 20): string {
    // Try to get first sentence
    const sentences = text.split(/[.!?]+/);
    if (sentences.length > 0 && sentences[0].trim().split(/\s+/).length >= 5) {
        return sentences[0].trim() + '.';
    }
    
    // Fallback: get first N words
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    return words.slice(0, maxWords).join(' ') + '...';
}

export async function expandText(text: string): Promise<ExpanderResult> {
    const planType = await fetchPlanType();
    try {
        if (!process.env.GROQ_API_KEY) {
            throw new Error('GROQ_API_KEY is missing');
        }

        if (!text.trim()) {
            return {
                success: false,
                error: 'Please enter text to expand.',
                wordCount: 0,
            };
        }

        const inputWordCount = text.trim().split(/\s+/).filter(word => word.length > 0).length;

        // Check word limits
        const maxWords = planType === 'premium' ? PREMIUM_WORD_LIMIT : FREE_TIER_WORD_LIMIT;
        if (inputWordCount > maxWords) {
            return {
                success: false,
                error: `Text is too long. ${planType === 'premium' ? 'Premium' : 'Free'} users can send up to ${maxWords} words.`,
                wordCount: inputWordCount,
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

You are a professional writing expert. You will expand and enrich the short text given to you.

Instructions:
1. Expand the text into a detailed, professional, and engaging paragraph
2. Add context, examples, and depth while maintaining the original tone
3. Make the text more detailed and comprehensive
4. Don't make up new information, but expand existing information
5. Extend and detail sentences
6. Keep it fluent and readable
7. CRITICAL: Preserve the original language of the text - DO NOT TRANSLATE
8. Preserve quotation marks and paragraph structure
9. Do not just repeat the input - add meaningful expansion`,
                },
                {
                    role: 'user',
                    content: `Expand the following text into a detailed, professional, and engaging paragraph. Add context, examples, and depth while maintaining the original tone. Do not just repeat the input:\n\n${text}`,
                },
            ],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.7,
            max_tokens: 4096,
        });

        const expandedText = completion.choices[0]?.message?.content;

        if (!expandedText) {
            throw new Error('Groq API did not respond');
        }

        // For free users: Show only first sentence (or first 20 words), rest is dummy
        if (planType !== 'premium') {
            const realPortion = extractFirstPortion(expandedText, 20);
            const totalWords = expandedText.trim().split(/\s+/).filter(word => word.length > 0).length;
            const shownWords = realPortion.trim().split(/\s+/).filter(word => word.length > 0).length;
            const remainingWords = Math.max(totalWords - shownWords, 50);
            const dummyPortion = generateDummyText(remainingWords);
            
            return {
                success: true,
                text: realPortion + ' ' + dummyPortion,
                wordCount: inputWordCount,
                isTruncated: true,
            };
        }

        // For premium users: Full text
        return {
            success: true,
            text: expandedText.trim(),
            wordCount: inputWordCount,
            isTruncated: false,
        };
    } catch (error) {
        console.error('Groq Expander Error:', error);
        
        return {
            success: false,
            error: 'Operation failed, please try again.',
        };
    }
}

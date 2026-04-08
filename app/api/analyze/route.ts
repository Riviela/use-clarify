import { NextRequest, NextResponse } from 'next/server';
import { analyzeWithAI } from '@/lib/ai';

// export const runtime = 'edge'; // Groq SDK Node.js gerektirdiği için edge runtime'ı devre dışı bıraktık

interface AnalyzeRequest {
    text: string;
    language?: string;
}

export async function POST(request: NextRequest) {
    try {
        const body: AnalyzeRequest = await request.json();

        // Validate request
        if (!body.text || typeof body.text !== 'string') {
            return NextResponse.json(
                { error: 'Text is required and must be a string' },
                { status: 400 }
            );
        }

        // Check word count (max 3000 words)
        const wordCount = body.text.trim().split(/\s+/).length;
        if (wordCount > 3000) {
            return NextResponse.json(
                { error: 'Text exceeds maximum of 3000 words' },
                { status: 400 }
            );
        }

        if (wordCount === 0) {
            return NextResponse.json(
                { error: 'Text cannot be empty' },
                { status: 400 }
            );
        }

        // Run Groq analysis directly (No more rule-based fallback)
        // Loglama lib/ai.ts içinde yapılıyor
        const result = await analyzeWithAI(body.text, body.language);

        return NextResponse.json(result);
    } catch (error: any) {
        console.error('Analysis error:', error);

        // Return 500 with clear message
        return NextResponse.json(
            { error: error.message || 'AI servisine ulaşılamadı' },
            { status: 500 }
        );
    }
}

import { NextRequest, NextResponse } from 'next/server';
import { humanizeWithAI } from '@/lib/ai';

// export const runtime = 'edge'; // Groq SDK Node.js gerektirdiği için edge runtime'ı devre dışı bıraktık

export async function POST(request: NextRequest) {
    try {
        const { text } = await request.json();

        if (!text || typeof text !== 'string') {
            return NextResponse.json({ error: 'Text is required' }, { status: 400 });
        }

        const humanizedText = await humanizeWithAI(text);
        return NextResponse.json({ text: humanizedText });
    } catch (error) {
        console.error('Humanize API Error:', error);
        return NextResponse.json({ error: 'Failed to humanize text' }, { status: 500 });
    }
}

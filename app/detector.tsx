'use client';

import { useState } from 'react';
import { TextInput } from '@/components/text-input';
import { ResultsDisplay } from '@/components/results-display';
import { Disclaimer } from '@/components/disclaimer';
import type { DetectionResult } from '@/lib/detection/types';

export function Detector() {
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<DetectionResult | null>(null);
    const [error, setError] = useState<string>('');

    const handleAnalyze = async (text: string, language?: string) => {
        setIsLoading(true);
        setError('');
        setResult(null);

        try {
            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text, language }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to analyze text');
            }

            const data: DetectionResult = await response.json();
            setResult(data);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : 'An unexpected error occurred'
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            {/* Introduction */}
            <div className="text-center space-y-4">
                <h2 className="text-3xl font-bold tracking-tight">
                    Analyze Your Text for AI-Generated Content
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Upload or paste text to detect if it was written by a human,
                    AI-generated, or AI-refined. Get paragraph-level analysis with
                    confidence scores.
                </p>
            </div>

            {/* Disclaimer */}
            <Disclaimer />

            {/* Text Input */}
            <TextInput onAnalyze={handleAnalyze} isLoading={isLoading} />

            {/* Error Display */}
            {error && (
                <div className="p-4 rounded-lg bg-destructive/10 border border-destructive text-destructive text-sm">
                    <strong>Error:</strong> {error}
                </div>
            )}

            {/* Results */}
            {result && <ResultsDisplay result={result} />}
        </div>
    );
}

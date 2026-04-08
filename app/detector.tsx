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
        <div className="max-w-5xl mx-auto space-y-10">
            {/* Introduction */}
            <div className="text-center space-y-4">
                <h2 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-white">
                    Know Exactly What You&apos;re Reading.
                </h2>
                <p className="text-base text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
                    Clarify&apos;s precision engine scans every paragraph to surface
                    what&apos;s human, what&apos;s AI-generated, and what&apos;s been refined.
                    Paragraph-level verdicts. Real confidence scores. Zero guesswork.
                </p>
            </div>

            {/* Disclaimer */}
            <Disclaimer />

            {/* Text Input */}
            <TextInput onAnalyze={handleAnalyze} isLoading={isLoading} />

            {/* Error Display */}
            {error && (
                <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
                    <strong>Error:</strong> {error}
                </div>
            )}

            {/* Results */}
            {result && <ResultsDisplay result={result} />}
        </div>
    );
}

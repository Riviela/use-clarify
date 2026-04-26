'use client';

import { useState } from 'react';
import { TextInput } from '@/components/text-input';
import { ResultsDisplay } from '@/components/results-display';
import { Disclaimer } from '@/components/disclaimer';
import { useTranslation } from '@/components/language-provider';
import type { DetectionResult } from '@/lib/detection/types';

export function Detector() {
    const { t } = useTranslation();
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
                throw new Error(errorData.error || t('detectorPage.errorGeneric'));
            }

            const data: DetectionResult = await response.json();
            setResult(data);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : t('common.error')
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
                    {t('detectorPage.introTitle')}
                </h2>
                <p className="text-base text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
                    {t('detectorPage.introBody')}
                </p>
            </div>

            {/* Disclaimer */}
            <Disclaimer />

            {/* Text Input */}
            <TextInput onAnalyze={handleAnalyze} isLoading={isLoading} />

            {/* Error Display */}
            {error && (
                <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
                    <strong>{t('detectorPage.errorPrefix')}:</strong> {error}
                </div>
            )}

            {/* Results */}
            {result && <ResultsDisplay result={result} />}
        </div>
    );
}

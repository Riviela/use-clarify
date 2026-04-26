'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useTranslation } from '@/components/language-provider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3 } from 'lucide-react';
import type { DetectionResult } from '@/lib/detection/types';
import { ParagraphAnalysis } from './paragraph-analysis';

interface ResultsDisplayProps {
    result: DetectionResult;
}

export function ResultsDisplay({ result }: ResultsDisplayProps) {
    const { t } = useTranslation();
    const { overall, paragraphs } = result;

    // Determine dominant label
    const getDominantLabel = () => {
        if (overall.human >= overall.aiGenerated && overall.human >= overall.aiRefined) {
            return 'Human';
        } else if (overall.aiRefined > overall.aiGenerated) {
            return 'AI-Refined';
        } else {
            return 'AI-Generated';
        }
    };

    return (
        <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm rounded-xl">
            <CardHeader className="space-y-2">
                <CardTitle className="flex items-center gap-2 text-lg font-medium text-zinc-900 dark:text-white">
                    <BarChart3 className="h-5 w-5 text-zinc-500" />
                    {t('results.overallVerdict')}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 p-1">
                        <TabsTrigger value="overview" className="rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-700">{t('results.overallVerdict')}</TabsTrigger>
                        <TabsTrigger value="paragraphs" className="rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-700">
                            {t('results.paragraphs')} ({paragraphs.length})
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-6 mt-6">
                        <div className="text-center space-y-2">
                            <h3 className="text-xl font-semibold text-zinc-900 dark:text-white">
                                Primary Classification:{' '}
                                <span
                                    className={
                                        getDominantLabel() === 'Human'
                                            ? 'text-green-600'
                                            : getDominantLabel() === 'AI-Refined'
                                                ? 'text-amber-500'
                                                : 'text-red-600'
                                    }
                                >
                                    {getDominantLabel()}
                                </span>
                            </h3>
                            <p className="text-sm text-zinc-400">
                                Based on analysis of {paragraphs.length} paragraph
                                {paragraphs.length > 1 ? 's' : ''}
                            </p>
                        </div>

                        <div className="space-y-4">
                            {/* Human Score */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="inline-flex items-center rounded-md bg-green-50 dark:bg-green-900/30 px-2 py-1 text-xs font-medium text-green-700 dark:text-green-400 ring-1 ring-inset ring-green-600/20">
                                            Human
                                        </span>
                                        <span className="text-sm text-zinc-400">
                                            Human-written content
                                        </span>
                                    </div>
                                    <span className="font-semibold text-zinc-900 dark:text-white">{overall.human}%</span>
                                </div>
                                <Progress
                                    value={overall.human}
                                    className="h-3 [&>div]:bg-green-600"
                                />
                            </div>

                            {/* AI-Refined Score */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="inline-flex items-center rounded-md bg-amber-50 dark:bg-amber-900/30 px-2 py-1 text-xs font-medium text-amber-700 dark:text-amber-400 ring-1 ring-inset ring-amber-600/20">
                                            AI-Refined
                                        </span>
                                        <span className="text-sm text-zinc-400">
                                            AI-assisted or polished content
                                        </span>
                                    </div>
                                    <span className="font-semibold text-zinc-900 dark:text-white">{overall.aiRefined}%</span>
                                </div>
                                <Progress
                                    value={overall.aiRefined}
                                    className="h-3 [&>div]:bg-amber-500"
                                />
                            </div>

                            {/* AI-Generated Score */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="inline-flex items-center rounded-md bg-red-50 dark:bg-red-900/30 px-2 py-1 text-xs font-medium text-red-700 dark:text-red-400 ring-1 ring-inset ring-red-600/20">
                                            AI-Generated
                                        </span>
                                        <span className="text-sm text-zinc-400">
                                            Fully AI-generated content
                                        </span>
                                    </div>
                                    <span className="font-semibold text-zinc-900 dark:text-white">{overall.aiGenerated}%</span>
                                </div>
                                <Progress
                                    value={overall.aiGenerated}
                                    className="h-3 [&>div]:bg-red-600"
                                />
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="paragraphs" className="mt-6">
                        <ParagraphAnalysis paragraphs={paragraphs} />
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}

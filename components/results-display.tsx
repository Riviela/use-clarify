'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, FileSearch } from 'lucide-react';
import type { DetectionResult } from '@/lib/detection/types';
import { ParagraphAnalysis } from './paragraph-analysis';

interface ResultsDisplayProps {
    result: DetectionResult;
}

export function ResultsDisplay({ result }: ResultsDisplayProps) {
    const { overall, paragraphs } = result;

    // Determine dominant label
    const getDominantLabel = () => {
        if (overall.human >= overall.aiGenerated && overall.human >= overall.aiRefined) {
            return 'Human';
        } else if (overall.aiGenerated >= overall.aiRefined) {
            return 'AI-Generated';
        } else {
            return 'AI-Refined';
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Detection Results
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="paragraphs">
                            Paragraph Analysis ({paragraphs.length})
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-6 mt-6">
                        <div className="text-center space-y-2">
                            <h3 className="text-2xl font-bold">
                                Primary Classification:{' '}
                                <span
                                    className={
                                        getDominantLabel() === 'Human'
                                            ? 'text-green-600'
                                            : getDominantLabel() === 'AI-Generated'
                                                ? 'text-red-600'
                                                : 'text-amber-600'
                                    }
                                >
                                    {getDominantLabel()}
                                </span>
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Based on analysis of {paragraphs.length} paragraph
                                {paragraphs.length > 1 ? 's' : ''}
                            </p>
                        </div>

                        <div className="space-y-4">
                            {/* Human Score */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Badge className="bg-green-600 hover:bg-green-700">
                                            Human
                                        </Badge>
                                        <span className="text-sm text-muted-foreground">
                                            Human-written content
                                        </span>
                                    </div>
                                    <span className="font-semibold">{overall.human}%</span>
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
                                        <Badge className="bg-amber-600 hover:bg-amber-700">
                                            AI-Refined
                                        </Badge>
                                        <span className="text-sm text-muted-foreground">
                                            Human text edited by AI
                                        </span>
                                    </div>
                                    <span className="font-semibold">{overall.aiRefined}%</span>
                                </div>
                                <Progress
                                    value={overall.aiRefined}
                                    className="h-3 [&>div]:bg-amber-600"
                                />
                            </div>

                            {/* AI-Generated Score */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Badge className="bg-red-600 hover:bg-red-700">
                                            AI-Generated
                                        </Badge>
                                        <span className="text-sm text-muted-foreground">
                                            Fully AI-generated content
                                        </span>
                                    </div>
                                    <span className="font-semibold">{overall.aiGenerated}%</span>
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

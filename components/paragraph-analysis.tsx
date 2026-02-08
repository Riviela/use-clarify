'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger
} from '@/components/ui/tooltip';
import { Sparkles, Lock, RefreshCw } from 'lucide-react';
import type { ParagraphAnalysis as ParagraphAnalysisType } from '@/lib/detection/types';
import { isPremium } from '@/lib/user-plan';

interface ParagraphAnalysisProps {
    paragraphs: ParagraphAnalysisType[];
}

export function ParagraphAnalysis({ paragraphs }: ParagraphAnalysisProps) {
    // State to track loading status for each paragraph being humanized
    const [humanizingIndices, setHumanizingIndices] = useState<number[]>([]);
    // State to store humanized texts
    const [humanizedTexts, setHumanizedTexts] = useState<{ [key: number]: string }>({});

    const handleHumanize = async (index: number, text: string) => {
        setHumanizingIndices(prev => [...prev, index]);
        try {
            const response = await fetch('/api/humanize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text })
            });

            if (!response.ok) {
                throw new Error('Failed to humanize text');
            }

            const data = await response.json();
            setHumanizedTexts(prev => ({ ...prev, [index]: data.text }));
        } catch (error) {
            console.error('Failed to humanize text:', error);
        } finally {
            setHumanizingIndices(prev => prev.filter(i => i !== index));
        }
    };

    const getLabelColor = (label: string) => {
        switch (label) {
            case 'human':
                return 'bg-green-600 hover:bg-green-700';
            case 'ai_refined':
                return 'bg-amber-600 hover:bg-amber-700';
            case 'ai_generated':
                return 'bg-red-600 hover:bg-red-700';
            default:
                return 'bg-gray-600 hover:bg-gray-700';
        }
    };

    const getBackgroundColor = (label: string) => {
        switch (label) {
            case 'human':
                return 'bg-background border-border'; // Normal görünüm
            case 'ai_refined':
                return 'bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900';
            case 'ai_generated':
                return 'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-900';
            default:
                return 'bg-gray-50 border-gray-200 dark:bg-gray-950/20 dark:border-gray-900';
        }
    };

    const getLabelText = (label: string) => {
        switch (label) {
            case 'human': return 'Human';
            case 'ai_refined': return 'AI-Refined';
            case 'ai_generated': return 'AI-Generated';
            default: return 'Unknown';
        }
    };

    if (paragraphs.length === 0) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                No paragraphs to analyze
            </div>
        );
    }

    return (
        <TooltipProvider>
            <div className="space-y-4">
                {paragraphs.map((para) => {
                    const isAi = para.label === 'ai_generated' || para.label === 'ai_refined';
                    const displayText = humanizedTexts[para.index] || para.text;
                    const isHumanized = !!humanizedTexts[para.index];

                    return (
                        <Tooltip key={para.index}>
                            <TooltipTrigger asChild>
                                <Card className={`transition-colors relative ${getBackgroundColor(isHumanized ? 'human' : para.label)}`}>
                                    <CardContent className="pt-6 relative">
                                        <div className="space-y-3">
                                            <div className="flex items-start justify-between gap-4 flex-wrap">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-semibold text-muted-foreground">
                                                        Paragraph {para.index + 1}
                                                    </span>
                                                    <Badge className={getLabelColor(isHumanized ? 'human' : para.label)}>
                                                        {getLabelText(isHumanized ? 'human' : para.label)}
                                                    </Badge>
                                                    {isHumanized && (
                                                        <Badge className="border border-green-600 text-green-600 bg-transparent hover:bg-transparent">
                                                            <Sparkles className="h-3 w-3 mr-1" />
                                                            Refined
                                                        </Badge>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-semibold">
                                                        {para.confidence}% Confidence
                                                    </span>

                                                    {isPremium && isAi && !isHumanized && (
                                                        <Button
                                                            className="h-7 text-xs gap-1 ml-2 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground inline-flex items-center justify-center rounded-md font-medium px-3"
                                                            onClick={(e) => {
                                                                e.stopPropagation(); // Tooltip açılmasını engelle
                                                                handleHumanize(para.index, para.text);
                                                            }}
                                                            disabled={humanizingIndices.includes(para.index)}
                                                        >
                                                            {humanizingIndices.includes(para.index) ? (
                                                                <RefreshCw className="h-3 w-3 animate-spin" />
                                                            ) : (
                                                                <Sparkles className="h-3 w-3" />
                                                            )}
                                                            AI'dan Kurtar
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>

                                            <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                                {displayText}
                                            </p>
                                        </div>
                                    </CardContent>

                                    {/* Overlay for non-premium users on AI texts to prompt upgrade */}
                                    {!isPremium && isAi && (
                                        <div className="absolute top-2 right-2 opacity-50 hover:opacity-100 transition-opacity">
                                            <Lock className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                    )}
                                </Card>
                            </TooltipTrigger>

                            {/* Tooltip Content */}
                            {isAi && !isHumanized && (
                                <TooltipContent className="max-w-xs">
                                    {isPremium ? (
                                        <div className="space-y-1">
                                            <p className="font-semibold text-sm">Detection Reason:</p>
                                            <p className="text-sm">{para.reason || "AI patterns detected."}</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-2 text-center p-1">
                                            <div className="blur-sm select-none text-xs my-1">
                                                Lorem ipsum detector reason hidden text for premium users only.
                                            </div>
                                            <div className="flex items-center justify-center gap-1 text-xs font-semibold text-primary">
                                                <Lock className="h-3 w-3" />
                                                Upgrade to see why
                                            </div>
                                        </div>
                                    )}
                                </TooltipContent>
                            )}
                        </Tooltip>
                    );
                })}
            </div>
        </TooltipProvider>
    );
}

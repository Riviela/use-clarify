'use client';

import { useState, useEffect } from 'react';
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
import { createClient } from '@/utils/supabase/client';
import { useUpgrade } from '@/hooks/use-upgrade';

interface ParagraphAnalysisProps {
    paragraphs: ParagraphAnalysisType[];
}

export function ParagraphAnalysis({ paragraphs }: ParagraphAnalysisProps) {
    // State to track loading status for each paragraph being humanized
    const [humanizingIndices, setHumanizingIndices] = useState<number[]>([]);
    // State to store humanized texts
    const [humanizedTexts, setHumanizedTexts] = useState<{ [key: number]: string }>({});
    // State to track user plan
    const [planType, setPlanType] = useState<string>('free');
    
    // Upgrade hook for redirect logic
    const { handleUpgrade } = useUpgrade();

    // Fetch user's plan type
    useEffect(() => {
        async function fetchPlanType() {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            
            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('plan_type')
                    .eq('id', user.id)
                    .single();
                
                setPlanType(profile?.plan_type === 'premium' ? 'premium' : 'free');
            }
        }
        fetchPlanType();
    }, []);

    const isPremiumPlan = planType === 'premium';

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
            case 'ai_generated':
                return 'bg-red-600 hover:bg-red-700';
            default:
                return 'bg-gray-600 hover:bg-gray-700';
        }
    };

    const getBackgroundColor = (label: string) => {
        switch (label) {
            case 'human':
                return 'bg-background border-border';
            case 'ai_generated':
                return 'bg-red-100/70 border-red-200 dark:bg-red-900/40 dark:border-red-800';
            default:
                return 'bg-gray-50 border-gray-200 dark:bg-gray-900/40 dark:border-gray-800';
        }
    };

    const getLabelText = (label: string) => {
        switch (label) {
            case 'human': return 'Human';
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
                    const isAi = para.label === 'ai_generated';
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

                                                    {isPremiumPlan && isAi && !isHumanized && (
                                                        <Button
                                                            size="sm"
                                                            className="h-7 text-xs gap-1 ml-2 bg-cyan-500 text-white hover:bg-cyan-600 shadow-sm"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleHumanize(para.index, para.text);
                                                            }}
                                                            disabled={humanizingIndices.includes(para.index)}
                                                        >
                                                            {humanizingIndices.includes(para.index) ? (
                                                                <RefreshCw className="h-3 w-3 animate-spin" />
                                                            ) : (
                                                                <Sparkles className="h-3 w-3" />
                                                            )}
                                                            Humanize
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>

                                            <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                                {displayText}
                                            </p>
                                        </div>
                                    </CardContent>

                                    {!isPremiumPlan && isAi && (
                                        <div className="absolute top-2 right-2 opacity-50 hover:opacity-100 transition-opacity">
                                            <Lock className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                    )}
                                </Card>
                            </TooltipTrigger>

                            {isAi && (
                                <TooltipContent className="max-w-sm p-4 animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2">
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between border-b pb-2">
                                            <span className="font-semibold text-sm flex items-center gap-2">
                                                <span className="text-red-600 flex items-center gap-1">
                                                    <Sparkles className="h-4 w-4" /> AI Detected
                                                </span>
                                            </span>
                                            {!isPremiumPlan && <Badge className="text-[10px] h-5 px-1.5 border border-input bg-background hover:bg-accent text-foreground font-normal"><Lock className="h-3 w-3 mr-1" /> Premium</Badge>}
                                        </div>

                                        {isPremiumPlan ? (
                                            <div className="space-y-1">
                                                <p className="text-sm leading-relaxed text-muted-foreground">{para.reason || "AI patterns and low diversity detected."}</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-2 relative overflow-hidden rounded-md p-2 bg-muted/50">
                                                <div className="blur-sm select-none text-sm text-muted-foreground leading-relaxed">
                                                    {para.reason || "Linguistic markers, repetitive patterns, and low entropy indicating AI-generated content detected in the text."}
                                                </div>
                                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/20 backdrop-blur-[1px]">
                                                    <button 
                                                        onClick={handleUpgrade}
                                                        className="bg-background/90 px-3 py-1.5 rounded-full shadow-sm border text-xs font-semibold flex items-center gap-1.5 hover:bg-background transition-colors cursor-pointer"
                                                    >
                                                        <Lock className="h-3 w-3" />
                                                        Upgrade to see reasons
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </TooltipContent>
                            )}
                        </Tooltip>
                    );
                })}
            </div>
        </TooltipProvider>
    );
}

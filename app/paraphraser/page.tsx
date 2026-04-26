'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Copy, Check, Lock, RefreshCw, AlertCircle, Crown } from 'lucide-react';
import { paraphraseText, ParaphraseResult } from '@/actions/paraphrase';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useUpgrade } from '@/hooks/use-upgrade';

const FREE_TIER_WORD_LIMIT = 100;

export default function ParaphraserPage() {
    const [inputText, setInputText] = useState('');
    const [outputText, setOutputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [showPremiumModal, setShowPremiumModal] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [wordCount, setWordCount] = useState(0);
    const [result, setResult] = useState<ParaphraseResult | null>(null);
    const { handleUpgrade } = useUpgrade();
    const [planType, setPlanType] = useState<string>('free');

    useEffect(() => {
        async function fetchPlanType() {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('plan_type, is_admin')
                    .eq('id', user.id)
                    .single();
                setPlanType((profile?.is_admin === true || profile?.plan_type === 'premium') ? 'premium' : 'free');
            }
        }
        fetchPlanType();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const text = e.target.value;
        setInputText(text);
        const count = text.trim().split(/\s+/).filter(word => word.length > 0).length;
        setWordCount(count);
        setError(null);
    };

    const handleParaphrase = async () => {
        if (!inputText.trim()) return;

        setIsLoading(true);
        setOutputText('');
        setError(null);
        setResult(null);

        try {
            const paraphraseResult = await paraphraseText(inputText);
            setResult(paraphraseResult);

            if (paraphraseResult.success && paraphraseResult.text) {
                setOutputText(paraphraseResult.text);
            } else if (paraphraseResult.isPremiumRequired) {
                setShowPremiumModal(true);
                setError(paraphraseResult.error || null);
            } else {
                setError(paraphraseResult.error || 'Operation failed, please try again.');
            }
        } catch (err) {
            console.error('Paraphrase error:', err);
            setError('Operation failed, please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = async () => {
        if (!outputText) return;
        await navigator.clipboard.writeText(outputText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const isOverLimit = planType !== 'premium' && wordCount > FREE_TIER_WORD_LIMIT;
    const isNearLimit = planType !== 'premium' && wordCount > FREE_TIER_WORD_LIMIT * 0.8 && wordCount <= FREE_TIER_WORD_LIMIT;

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            {/* Title Section */}
            <div className="text-center space-y-4">
                <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-white">
                    Paraphraser
                </h1>
                <p className="text-base text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
                    Rewrite any text with fresh phrasing while keeping the original meaning intact.
                    {planType !== 'premium' && (
                        <span className="text-cyan-400 font-medium block mt-2">
                            (Free: up to {FREE_TIER_WORD_LIMIT} words)
                        </span>
                    )}
                </p>
            </div>

            {/* Error Message */}
            {error && (
                <Alert variant="destructive" className="max-w-3xl mx-auto">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* Main Content */}
            <div className="grid md:grid-cols-2 gap-6">
                {/* Input Area */}
                <Card className="flex flex-col border-zinc-200 dark:border-zinc-800 shadow-sm rounded-xl">
                    <CardHeader className="space-y-2">
                        <CardTitle className="text-lg font-medium text-zinc-900 dark:text-white">
                            Original Text
                        </CardTitle>
                        <CardDescription className="text-sm text-zinc-500">
                            Paste the content you want rewritten
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1">
                        <Textarea
                            placeholder="Paste your text here..."
                            value={inputText}
                            onChange={handleInputChange}
                            className="min-h-[300px] resize-none rounded-lg border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-indig5-500 focus:border-transparent"
                        />
                        <div className="flex items-center justify-between mt-3">
                            <p className={`text-sm ${isOverLimit ? 'text-red-500 font-medium' : isNearLimit ? 'text-amber-500' : 'text-zinc-400'}`}>
                                {wordCount} / {planType === 'premium' ? 'Unlimited' : FREE_TIER_WORD_LIMIT} words
                                {planType !== 'premium' && isOverLimit && ' (Limit exceeded!)'}
                            </p>
                            {planType !== 'premium' && (
                                <span className="text-xs text-zinc-400">
                                    Free: {FREE_TIER_WORD_LIMIT} words
                                </span>
                            )}
                            {planType === 'premium' && (
                                <span className="text-xs text-cyan-400 font-medium flex items-center gap-1">
                                    <Crown className="w-3 h-3" />
                                    Premium
                                </span>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Output Area */}
                <Card className="flex flex-col relative border-zinc-200 dark:border-zinc-800 shadow-sm rounded-xl">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0">
                        <div className="space-y-2">
                            <CardTitle className="text-lg font-medium text-zinc-900 dark:text-white flex items-center gap-2">
                                <RefreshCw className="w-5 h-5 text-purple-500" />
                                <span>Paraphrased Text</span>
                            </CardTitle>
                            <CardDescription className="text-sm text-zinc-500">
                                Result rewritten with different words
                            </CardDescription>
                        </div>
                        {/* Copy Button - In Card Header, outside text area */}
                        {outputText && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleCopy}
                                className="rounded-lg border-zinc-200 dark:border-zinc-800"
                            >
                                {copied ? (
                                    <>
                                        <Check className="w-4 h-4 mr-1" />
                                        Copied
                                    </>
                                ) : (
                                    <>
                                        <Copy className="w-4 h-4 mr-1" />
                                        Copy
                                    </>
                                )}
                            </Button>
                        )}
                    </CardHeader>
                    <CardContent className="flex-1 relative">
                        <Textarea
                            readOnly
                            placeholder="Result will appear here..."
                            value={outputText}
                            className="min-h-[300px] resize-none bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-lg"
                        />
                        
                        {/* Premium Modal */}
                        {showPremiumModal && (
                            <div className="absolute inset-0 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center space-y-4 m-6 z-10">
                                <div className="w-16 h-16 rounded-full bg-cyan-50 dark:bg-cyan-900/30 flex items-center justify-center">
                                    <Crown className="w-8 h-8 text-cyan-400" />
                                </div>
                                <div className="text-center space-y-2">
                                    <h3 className="text-xl font-semibold text-zinc-900 dark:text-white">Pro Feature</h3>
                                    <p className="text-zinc-500 max-w-xs">
                                        Clarify Pro is required for {wordCount} words.
                                        Starter plan supports up to {FREE_TIER_WORD_LIMIT} words.
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <Button 
                                        variant="outline" 
                                        onClick={() => setShowPremiumModal(false)}
                                        className="rounded-lg border-zinc-200 dark:border-zinc-800"
                                    >
                                        Close
                                    </Button>
                                    <Button 
                                        className="bg-cyan-500 hover:bg-cyan-600 rounded-lg"
                                        onClick={handleUpgrade}
                                    >
                                        <Crown className="w-4 h-4 mr-2" />
                                        Upgrade to Pro
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Paraphrase Button */}
            <div className="flex flex-col items-center gap-4">
                <Button
                    size="lg"
                    onClick={handleParaphrase}
                    disabled={isLoading || !inputText.trim() || isOverLimit}
                    className="px-12 h-12 text-base rounded-lg bg-cyan-500 hover:bg-cyan-600 text-white"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Paraphrasing...
                        </>
                    ) : isOverLimit ? (
                        <>
                            <Lock className="w-5 h-5 mr-2" />
                            Premium Required ({wordCount} words)
                        </>
                    ) : (
                        <>
                            <RefreshCw className="w-5 h-5 mr-2" />
                            Paraphrase
                        </>
                    )}
                </Button>
                
                {planType !== 'premium' && (
                    <p className="text-sm text-zinc-400">
                        Starter plan limit: {FREE_TIER_WORD_LIMIT} words
                    </p>
                )}
            </div>

            {/* Features */}
            <div className="grid md:grid-cols-3 gap-4 mt-12">
                <Card className="text-center border-zinc-200 dark:border-zinc-800 shadow-sm rounded-xl">
                    <CardContent className="pt-6">
                        <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-4">
                            <RefreshCw className="w-6 h-6 text-zinc-600 dark:text-zinc-400" />
                        </div>
                        <h3 className="font-semibold mb-2 text-zinc-900 dark:text-white">Fresh Phrasing</h3>
                        <p className="text-sm text-zinc-500">
                            Same meaning, entirely different words and structure
                        </p>
                    </CardContent>
                </Card>
                <Card className="text-center border-zinc-200 dark:border-zinc-800 shadow-sm rounded-xl">
                    <CardContent className="pt-6">
                        <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-4">
                            <Check className="w-6 h-6 text-zinc-600 dark:text-zinc-400" />
                        </div>
                        <h3 className="font-semibold mb-2 text-zinc-900 dark:text-white">Context Preserved</h3>
                        <p className="text-sm text-zinc-500">
                            Your original intent stays intact through every rewrite
                        </p>
                    </CardContent>
                </Card>
                <Card className="text-center border-zinc-200 dark:border-zinc-800 shadow-sm rounded-xl">
                    <CardContent className="pt-6">
                        <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-4">
                            <Crown className="w-6 h-6 text-zinc-600 dark:text-zinc-400" />
                        </div>
                        <h3 className="font-semibold mb-2 text-zinc-900 dark:text-white">No Limits</h3>
                        <p className="text-sm text-zinc-500">
                            Unlimited paraphrasing with Clarify Pro
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

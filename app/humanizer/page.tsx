'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Copy, Check, Lock, Sparkles, AlertCircle, Crown } from 'lucide-react';
import { humanizeText } from '@/actions/humanize';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useUpgrade } from '@/hooks/use-upgrade';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 100,
      damping: 15,
    },
  },
};

export default function HumanizerPage() {
    const [inputText, setInputText] = useState('');
    const [outputText, setOutputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState<string | null>(null);
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

    const handleHumanize = async () => {
        if (!inputText.trim()) return;

        setIsLoading(true);
        setOutputText('');
        setError(null);

        try {
            const result = await humanizeText(inputText);

            if (result.success && result.text) {
                setOutputText(result.text);
            } else {
                setError(result.error || 'Operation failed, please try again.');
            }
        } catch (err) {
            console.error('Humanize error:', err);
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

    return (
        <motion.div 
            className="max-w-5xl mx-auto space-y-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Title Section */}
            <motion.div variants={itemVariants} className="text-center space-y-4">
                <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-white">
                    Humanizer
                </h1>
                <p className="text-base text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
                    Strip the robotic fingerprint from AI-generated text and make it genuinely human.
                    {planType !== 'premium' && (
                        <span className="text-cyan-400 font-medium block mt-2">Pro Feature</span>
                    )}
                </p>
            </motion.div>

            {/* Error Message */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                    >
                        <Alert variant="destructive" className="max-w-3xl mx-auto">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <motion.div variants={itemVariants} className="grid md:grid-cols-2 gap-6">
                {/* Input Area */}
                <Card className="flex flex-col border-zinc-200 dark:border-zinc-800 shadow-sm rounded-xl">
                    <CardHeader className="space-y-2">
                        <CardTitle className="text-lg font-medium text-zinc-900 dark:text-white">
                            AI Content Input
                        </CardTitle>
                        <CardDescription className="text-sm text-zinc-500">
                            Paste the AI-generated text you want to humanize
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1">
                        <Textarea
                            placeholder="Paste AI-generated text here..."
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            className="min-h-[300px] resize-none rounded-lg border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                        />
                        <p className="text-sm text-zinc-400 mt-3 text-right">
                            {inputText.length} characters
                        </p>
                    </CardContent>
                </Card>

                {/* Output Area */}
                <Card className="flex flex-col relative border-zinc-200 dark:border-zinc-800 shadow-sm rounded-xl">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0">
                        <div className="space-y-2">
                            <CardTitle className="text-lg font-medium text-zinc-900 dark:text-white flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-cyan-400" />
                                <span>Humanized Result</span>
                            </CardTitle>
                            <CardDescription className="text-sm text-zinc-500">
                                A more natural and fluent result
                            </CardDescription>
                        </div>
                        {outputText && (
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
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
                            </motion.div>
                        )}
                    </CardHeader>
                    <CardContent className="flex-1 relative">
                        <div className="relative">
                            <Textarea
                                readOnly
                                placeholder="Result will appear here..."
                                value={outputText}
                                className={`min-h-[300px] resize-none bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-lg ${outputText && planType !== 'premium' ? 'blur-md select-none' : ''}`}
                            />
                            
                            {/* Premium Blur Overlay with Animation */}
                            <AnimatePresence>
                                {outputText && planType !== 'premium' && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                                        className="absolute inset-0 flex items-center justify-center"
                                    >
                                        <motion.div
                                            initial={{ scale: 0.9, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            exit={{ scale: 0.9, opacity: 0 }}
                                            transition={{ 
                                                duration: 0.3, 
                                                ease: [0.22, 1, 0.36, 1],
                                                delay: 0.1 
                                            }}
                                            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-lg rounded-xl px-6 py-6 flex flex-col items-center gap-4 text-center max-w-xs"
                                        >
                                            <motion.div
                                                animate={{ 
                                                    scale: [1, 1.1, 1],
                                                    rotate: [0, 5, -5, 0]
                                                }}
                                                transition={{ 
                                                    duration: 2, 
                                                    repeat: Infinity, 
                                                    repeatDelay: 1 
                                                }}
                                                className="w-12 h-12 rounded-full bg-cyan-50 dark:bg-cyan-900/30 flex items-center justify-center"
                                            >
                                                <Lock className="w-6 h-6 text-cyan-400" />
                                            </motion.div>
                                            <div>
                                                <h3 className="font-semibold text-lg text-zinc-900 dark:text-white">Pro Feature</h3>
                                                <p className="text-sm text-zinc-500 mt-1">
                                                    Upgrade to Clarify Pro to unlock the Humanizer.
                                                </p>
                                            </div>
                                            <motion.div 
                                                whileHover={{ scale: 1.02 }} 
                                                whileTap={{ scale: 0.98 }}
                                                className="w-full"
                                            >
                                                <Button 
                                                    className="w-full bg-cyan-500 hover:bg-cyan-600 rounded-lg"
                                                    onClick={handleUpgrade}
                                                >
                                                    <Crown className="w-4 h-4 mr-2" />
                                                    Upgrade to Pro
                                                </Button>
                                            </motion.div>
                                        </motion.div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Humanize Button */}
            <motion.div variants={itemVariants} className="flex justify-center">
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <Button
                        size="lg"
                        onClick={handleHumanize}
                        disabled={isLoading || !inputText.trim()}
                        className="px-12 h-12 text-base rounded-lg bg-cyan-500 hover:bg-cyan-600 text-white"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                Humanizing...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-5 h-5 mr-2" />
                                Humanize Text
                            </>
                        )}
                    </Button>
                </motion.div>
            </motion.div>

            {/* Features */}
            <motion.div variants={itemVariants} className="grid md:grid-cols-3 gap-4 mt-12">
                {[
                    { icon: Sparkles, title: 'Authentically Human', desc: 'Rewrites AI output so it reads like it was written by a person' },
                    { icon: Check, title: 'Meaning Intact', desc: 'Preserves your original message while transforming the voice' },
                    { icon: Copy, title: 'One-Click Copy', desc: 'Grab the result and use it anywhere — instantly' },
                ].map((feature, index) => (
                    <motion.div
                        key={feature.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                        whileHover={{ y: -5 }}
                    >
                        <Card className="text-center border-zinc-200 dark:border-zinc-800 shadow-sm rounded-xl h-full">
                            <CardContent className="pt-6">
                                <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-4">
                                    <feature.icon className="w-6 h-6 text-zinc-600 dark:text-zinc-400" />
                                </div>
                                <h3 className="font-semibold mb-2 text-zinc-900 dark:text-white">{feature.title}</h3>
                                <p className="text-sm text-zinc-500">
                                    {feature.desc}
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </motion.div>
        </motion.div>
    );
}

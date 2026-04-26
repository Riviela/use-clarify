'use client';

import { useState, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Loader2 } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useTranslation } from '@/components/language-provider';

interface TextInputProps {
    onAnalyze: (text: string, language?: string) => void;
    isLoading: boolean;
}

export function TextInput({ onAnalyze, isLoading }: TextInputProps) {
    const { t } = useTranslation();
    const [text, setText] = useState('');
    const [wordCount, setWordCount] = useState(0);
    const [charCount, setCharCount] = useState(0);
    const [error, setError] = useState('');
    const [maxWords, setMaxWords] = useState(500); // Default free limit

    // Fetch user's word limit from database
    useEffect(() => {
        async function fetchUserPlan() {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            
            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('plan_type, is_admin')
                    .eq('id', user.id)
                    .single();
                
                setMaxWords((profile?.is_admin === true || profile?.plan_type === 'premium') ? 3000 : 500);
            }
        }
        fetchUserPlan();
    }, []);

    useEffect(() => {
        const words = text.trim().split(/\s+/).filter((w) => w.length > 0);
        setWordCount(words.length);
        setCharCount(text.length);

        if (words.length > maxWords) {
            setError(t('toolLayout.freeUserLimit', { count: maxWords }));
        } else if (text.trim() && words.length === 0) {
            setError(t('common.error'));
        } else {
            setError('');
        }
    }, [text, maxWords]);

    const [language, setLanguage] = useState('');

    const handleSubmit = () => {
        if (!text.trim()) {
            setError(t('common.enterText'));
            return;
        }

        if (wordCount > maxWords) {
            return;
        }

        onAnalyze(text, language || undefined);
    };

    return (
        <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm rounded-xl">
            <CardHeader className="space-y-4">
                <CardTitle className="flex items-center justify-between text-lg font-medium text-zinc-900 dark:text-white">
                    <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-zinc-500" />
                        {t('textInput.label')}
                    </div>

                    <select
                        className="text-sm border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 bg-white dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        disabled={isLoading}
                    >
                        <option value="">{t('textInput.languageAuto')}</option>
                        <option value="English">{t('textInput.languageEn')}</option>
                        <option value="Turkish">{t('textInput.languageTr')}</option>
                        <option value="Spanish">{t('textInput.languageEs')}</option>
                        <option value="German">{t('textInput.languageDe')}</option>
                        <option value="French">{t('textInput.languageFr')}</option>
                    </select>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="text-input" className="text-sm text-zinc-500">
                        {t('toolLayout.freeUserLimit', { count: maxWords })}
                    </Label>
                    <Textarea
                        id="text-input"
                        placeholder={t('textInput.placeholder')}
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        className="min-h-[200px] resize-y rounded-lg border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                        disabled={isLoading}
                        aria-describedby="word-count char-count error-message"
                    />
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex gap-4 text-sm text-zinc-400">
                        <span
                            id="word-count"
                            className={wordCount > maxWords ? 'text-red-500 font-semibold' : ''}
                        >
                            {t('toolLayout.wordsCountMax', { count: wordCount, max: maxWords })}
                        </span>
                        <span id="char-count">
                            {t('common.charCount', { count: charCount })}
                        </span>
                    </div>

                    <Button
                        onClick={handleSubmit}
                        disabled={isLoading || !text.trim() || wordCount > maxWords}
                        className="h-10 px-8 rounded-lg bg-cyan-500 hover:bg-cyan-600 text-white"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                {t('textInput.detectingButton')}
                            </>
                        ) : (
                            t('textInput.detectButton')
                        )}
                    </Button>
                </div>

                {error && (
                    <p id="error-message" className="text-sm text-red-500">
                        {error}
                    </p>
                )}
            </CardContent>
        </Card>
    );
}

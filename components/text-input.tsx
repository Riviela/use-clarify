'use client';

import { useState, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Loader2 } from 'lucide-react';
import { isPremium, getWordLimit } from '@/lib/user-plan';

interface TextInputProps {
    onAnalyze: (text: string, language?: string) => void;
    isLoading: boolean;
}

export function TextInput({ onAnalyze, isLoading }: TextInputProps) {
    const [text, setText] = useState('');
    const [wordCount, setWordCount] = useState(0);
    const [charCount, setCharCount] = useState(0);
    const [error, setError] = useState('');

    // Kelime limiti kullanıcı planına göre belirlenir
    const MAX_WORDS = getWordLimit();

    useEffect(() => {
        const words = text.trim().split(/\s+/).filter((w) => w.length > 0);
        setWordCount(words.length);
        setCharCount(text.length);

        if (words.length > MAX_WORDS) {
            setError(`Text exceeds maximum of ${MAX_WORDS} words associated with your plan`);
        } else if (text.trim() && words.length === 0) {
            setError('Please enter valid text');
        } else {
            setError('');
        }
    }, [text, MAX_WORDS]);

    const handleSubmit = () => {
        if (!text.trim()) {
            setError('Please enter some text to analyze');
            return;
        }

        if (wordCount > MAX_WORDS) {
            return;
        }

        onAnalyze(text);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Enter Text to Analyze
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="text-input">
                        Paste or type your text below (max {MAX_WORDS} words)
                    </Label>
                    <Textarea
                        id="text-input"
                        placeholder="Enter the text you want to analyze for AI-generated content..."
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        className="min-h-[200px] resize-y"
                        disabled={isLoading}
                        aria-describedby="word-count char-count error-message"
                    />
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex gap-4 text-sm text-muted-foreground">
                        <span
                            id="word-count"
                            className={wordCount > MAX_WORDS ? 'text-destructive font-semibold' : ''}
                        >
                            {wordCount} / {MAX_WORDS} words
                        </span>
                        <span id="char-count">
                            {charCount} chars
                        </span>
                    </div>

                    <Button
                        onClick={handleSubmit}
                        disabled={isLoading || !text.trim() || wordCount > MAX_WORDS}
                        size="lg"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Analyzing...
                            </>
                        ) : (
                            'Analyze Text'
                        )}
                    </Button>
                </div>

                {error && (
                    <p id="error-message" className="text-sm text-destructive">
                        {error}
                    </p>
                )}
            </CardContent>
        </Card>
    );
}

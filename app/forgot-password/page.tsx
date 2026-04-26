'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';
import { Loader2, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useTranslation } from '@/components/language-provider';

export default function ForgotPasswordPage() {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    const supabase = createClient();

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/callback?redirect=/reset-password`,
            });

            if (error) {
                toast.error(error.message);
            } else {
                setEmailSent(true);
                toast.success(t('auth.forgot.sentTitle'));
            }
        } catch {
            toast.error(t('auth.errors.genericError'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-12">
            <Card className="w-full max-w-md border-zinc-200 shadow-sm">
                {emailSent ? (
                    <>
                        <CardHeader className="space-y-1 text-center">
                            <div className="mx-auto w-14 h-14 rounded-full bg-green-50 dark:bg-green-900/30 flex items-center justify-center mb-2">
                                <CheckCircle2 className="w-7 h-7 text-green-500" />
                            </div>
                            <CardTitle className="text-2xl font-semibold tracking-tight">
                                {t('auth.forgot.sentTitle')}
                            </CardTitle>
                            <CardDescription className="text-zinc-500">
                                {t('auth.forgot.sentDesc', { email })}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Button
                                variant="outline"
                                className="w-full h-11 rounded-lg"
                                onClick={() => {
                                    setEmailSent(false);
                                    setEmail('');
                                }}
                            >
                                {t('common.tryAgain')}
                            </Button>
                        </CardContent>
                        <CardFooter>
                            <Link
                                href="/login"
                                className="w-full text-sm text-center text-zinc-400 hover:text-zinc-600 flex items-center justify-center gap-1"
                            >
                                <ArrowLeft className="w-3.5 h-3.5" />
                                {t('auth.forgot.backToLogin')}
                            </Link>
                        </CardFooter>
                    </>
                ) : (
                    <>
                        <CardHeader className="space-y-1 text-center">
                            <CardTitle className="text-2xl font-semibold tracking-tight">
                                {t('auth.forgot.title')}
                            </CardTitle>
                            <CardDescription className="text-zinc-500">
                                {t('auth.forgot.subtitle')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <form onSubmit={handleResetPassword} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-sm font-medium">
                                        {t('auth.email')}
                                    </Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder={t('auth.emailPlaceholder')}
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="pl-10 h-11 bg-white border-zinc-200 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                                            required
                                            autoFocus
                                        />
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full h-11 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-medium"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            {t('common.loading')}
                                        </>
                                    ) : (
                                        t('auth.forgot.submit')
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                        <CardFooter>
                            <Link
                                href="/login"
                                className="w-full text-sm text-center text-zinc-400 hover:text-zinc-600 flex items-center justify-center gap-1"
                            >
                                <ArrowLeft className="w-3.5 h-3.5" />
                                {t('auth.forgot.backToLogin')}
                            </Link>
                        </CardFooter>
                    </>
                )}
            </Card>
        </div>
    );
}

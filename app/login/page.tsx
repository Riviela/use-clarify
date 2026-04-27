'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';
import { Loader2, Mail, Lock, Github, Chrome, Eye, EyeOff, ShieldCheck, KeyRound } from 'lucide-react';
import { useTranslation } from '@/components/language-provider';

function LoginPageContent() {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // MFA state
    const [mfaRequired, setMfaRequired] = useState(false);
    const [mfaFactorId, setMfaFactorId] = useState('');
    const [mfaCode, setMfaCode] = useState('');
    const [mfaLoading, setMfaLoading] = useState(false);

    const router = useRouter();
    const searchParams = useSearchParams();
    const redirect = searchParams.get('redirect') || '/';
    const oauthError = searchParams.get('error');

    const supabase = createClient();

    // Surface OAuth callback errors back to the user
    useEffect(() => {
        if (!oauthError) return;
        const messages: Record<string, string> = {
            auth: t('auth.errors.signInFailed'),
            missing_code: t('auth.errors.missingCode'),
        };
        toast.error(messages[oauthError] || decodeURIComponent(oauthError));
    }, [oauthError]);

    /**
     * Convert any thrown / returned auth error into a human-readable string.
     * Supabase auth errors sometimes serialize to "{}" which is useless.
     */
    const formatAuthError = (err: unknown): string => {
        if (!err) return t('auth.errors.genericError');
        if (typeof err === 'string') return err;
        if (err instanceof Error && err.message) return err.message;

        const e = err as { message?: string; code?: string; status?: number; name?: string };
        if (e.message && typeof e.message === 'string' && e.message.length > 0) return e.message;

        // Map known Supabase error codes / statuses to friendly messages
        if (e.code === 'over_email_send_rate_limit' || e.status === 429) {
            return 'Too many sign-up attempts. Please wait a minute and try again.';
        }
        if (e.code === 'request_timeout' || e.status === 504 || e.name === 'AbortError') {
            return 'The server took too long to respond. Please try again in a moment.';
        }
        if (e.status === 0 || e.name === 'TypeError' || e.name === 'NetworkError') {
            return 'Network error — check your internet connection and try again.';
        }
        return t('auth.errors.genericError');
    };

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();

        // Client-side guards — fail fast before hitting Supabase
        if (isSignUp) {
            if (password.length < 6) {
                toast.error('Password must be at least 6 characters long.');
                return;
            }
            if (password !== confirmPassword) {
                toast.error(t('auth.errors.passwordsDoNotMatch'));
                return;
            }
        }

        setIsLoading(true);

        // Hard timeout — Supabase signUp sometimes hangs ~10s waiting for SMTP.
        // We surface a clear message before the server times out.
        const timeoutMs = 12000;
        const timeoutId = setTimeout(() => {
            toast.error(
                'Sign-up is taking longer than expected. Please try again — if the problem persists, contact support.'
            );
            setIsLoading(false);
        }, timeoutMs);

        try {
            if (isSignUp) {
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo: `${window.location.origin}/auth/callback`,
                    },
                });

                clearTimeout(timeoutId);

                if (error) {
                    toast.error(formatAuthError(error));
                } else if (data.session) {
                    // Email confirmation disabled — user logged in immediately
                    toast.success(t('auth.errors.accountCreated'));
                    router.push(redirect);
                    router.refresh();
                } else {
                    // Email confirmation enabled — confirmation email sent
                    toast.success(t('auth.errors.checkEmail'));
                }
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });

                clearTimeout(timeoutId);

                if (error) {
                    toast.error(formatAuthError(error));
                } else {
                    // Check if MFA is required
                    const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

                    if (aalData && aalData.nextLevel === 'aal2' && aalData.currentLevel === 'aal1') {
                        const { data: factorsData } = await supabase.auth.mfa.listFactors();
                        const totpFactor = factorsData?.totp?.[0];

                        if (totpFactor) {
                            setMfaFactorId(totpFactor.id);
                            setMfaRequired(true);
                            setIsLoading(false);
                            return;
                        }
                    }

                    toast.success(t('common.signIn') + ' ✓');
                    router.push(redirect);
                    router.refresh();
                }
            }
        } catch (error) {
            clearTimeout(timeoutId);
            toast.error(formatAuthError(error));
        } finally {
            setIsLoading(false);
        }
    };

    const handleOAuthSignIn = async (provider: 'google' | 'github') => {
        setIsLoading(true);

        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider,
                options: {
                    redirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirect)}`,
                },
            });

            if (error) {
                toast.error(error.message);
                setIsLoading(false);
            }
        } catch (error) {
            toast.error('An unexpected error occurred');
            setIsLoading(false);
        }
    };

    const handleMfaVerify = async () => {
        if (mfaCode.length !== 6) {
            toast.error('Please enter a 6-digit code.');
            return;
        }

        setMfaLoading(true);
        try {
            const { data: challengeData, error: challengeError } =
                await supabase.auth.mfa.challenge({ factorId: mfaFactorId });

            if (challengeError) throw challengeError;

            const { error: verifyError } = await supabase.auth.mfa.verify({
                factorId: mfaFactorId,
                challengeId: challengeData.id,
                code: mfaCode,
            });

            if (verifyError) throw verifyError;

            toast.success('Successfully signed in');
            router.push(redirect);
            router.refresh();
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Verification failed.';
            toast.error(message);
            setMfaCode('');
        } finally {
            setMfaLoading(false);
        }
    };

    // ── MFA CHALLENGE SCREEN ──
    if (mfaRequired) {
        return (
            <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-12">
                <Card className="w-full max-w-md border-zinc-200 shadow-sm">
                    <CardHeader className="space-y-1 text-center">
                        <div className="mx-auto w-14 h-14 rounded-full bg-cyan-50 dark:bg-cyan-900/30 flex items-center justify-center mb-2">
                            <ShieldCheck className="w-7 h-7 text-cyan-500" />
                        </div>
                        <CardTitle className="text-2xl font-semibold tracking-tight">
                            Two-Factor Authentication
                        </CardTitle>
                        <CardDescription className="text-zinc-500">
                            Enter the 6-digit code from your authenticator app
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="mfa-code" className="text-sm font-medium">
                                Verification Code
                            </Label>
                            <div className="relative">
                                <KeyRound className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                                <Input
                                    id="mfa-code"
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    maxLength={6}
                                    placeholder="000000"
                                    value={mfaCode}
                                    onChange={(e) =>
                                        setMfaCode(e.target.value.replace(/\D/g, '').slice(0, 6))
                                    }
                                    className="pl-10 h-11 bg-white border-zinc-200 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent text-center text-lg tracking-[0.3em] font-mono"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && mfaCode.length === 6) {
                                            handleMfaVerify();
                                        }
                                    }}
                                    autoFocus
                                />
                            </div>
                        </div>

                        <Button
                            onClick={handleMfaVerify}
                            className="w-full h-11 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-medium"
                            disabled={mfaLoading || mfaCode.length !== 6}
                        >
                            {mfaLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Verifying...
                                </>
                            ) : (
                                'Verify & Sign In'
                            )}
                        </Button>
                    </CardContent>

                    <CardFooter>
                        <button
                            onClick={() => {
                                setMfaRequired(false);
                                setMfaCode('');
                                setMfaFactorId('');
                                supabase.auth.signOut();
                            }}
                            className="w-full text-sm text-center text-zinc-400 hover:text-zinc-600"
                        >
                            Cancel and go back to login
                        </button>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    // ── MAIN LOGIN / SIGNUP SCREEN ──
    return (
        <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-12">
            <Card className="w-full max-w-md border-zinc-200 shadow-sm">
                <CardHeader className="space-y-1 text-center">
                    <CardTitle className="text-2xl font-semibold tracking-tight">
                        {isSignUp ? t('auth.signUpTitle') : t('auth.signInTitle')}
                    </CardTitle>
                    <CardDescription className="text-zinc-500">
                        {isSignUp
                            ? t('auth.signUpSubtitle')
                            : t('auth.signInSubtitle')}
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                    <form onSubmit={handleEmailAuth} className="space-y-4">
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
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password" className="text-sm font-medium">
                                    {t('auth.password')}
                                </Label>
                                {!isSignUp && (
                                    <Link
                                        href="/forgot-password"
                                        className="text-xs text-cyan-500 hover:text-cyan-600 font-medium hover:underline underline-offset-4"
                                    >
                                        {t('auth.forgotPassword')}
                                    </Link>
                                )}
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="pl-10 pr-10 h-11 bg-white border-zinc-200 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-3 text-zinc-400 hover:text-zinc-600 transition-colors"
                                    tabIndex={-1}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {isSignUp && (
                            <div className="space-y-2">
                                <Label htmlFor="confirm-password" className="text-sm font-medium">
                                    {t('auth.confirmPassword')}
                                </Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                                    <Input
                                        id="confirm-password"
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="pl-10 pr-10 h-11 bg-white border-zinc-200 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-3 text-zinc-400 hover:text-zinc-600 transition-colors"
                                        tabIndex={-1}
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                                {confirmPassword && password !== confirmPassword && (
                                    <p className="text-xs text-red-500">
                                        {t('auth.errors.passwordsDoNotMatch')}
                                    </p>
                                )}
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full h-11 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-medium"
                            disabled={isLoading || (isSignUp && password !== confirmPassword)}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {t('common.loading')}
                                </>
                            ) : isSignUp ? (
                                t('auth.createAccount')
                            ) : (
                                t('common.signIn')
                            )}
                        </Button>
                    </form>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-zinc-200" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white px-2 text-zinc-500">{t('auth.orContinueWith')}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <Button
                            variant="outline"
                            className="h-11 border-zinc-200 hover:bg-zinc-50 rounded-lg"
                            onClick={() => handleOAuthSignIn('google')}
                            disabled={isLoading}
                        >
                            <Chrome className="mr-2 h-4 w-4" />
                            Google
                        </Button>
                        <Button
                            variant="outline"
                            className="h-11 border-zinc-200 hover:bg-zinc-50 rounded-lg"
                            onClick={() => handleOAuthSignIn('github')}
                            disabled={isLoading}
                        >
                            <Github className="mr-2 h-4 w-4" />
                            GitHub
                        </Button>
                    </div>
                </CardContent>

                <CardFooter className="flex flex-col space-y-2">
                    <div className="text-sm text-center text-zinc-500">
                        {isSignUp ? t('auth.haveAccount') : t('auth.noAccount')}{' '}
                        <button
                            onClick={() => {
                                setIsSignUp(!isSignUp);
                                setConfirmPassword('');
                                setShowConfirmPassword(false);
                            }}
                            className="text-cyan-500 hover:text-cyan-600 font-medium underline-offset-4 hover:underline"
                        >
                            {isSignUp ? t('common.signIn') : t('common.signUp')}
                        </button>
                    </div>

                    {!isSignUp && (
                        <Link
                            href="/"
                            className="text-sm text-center text-zinc-400 hover:text-zinc-600"
                        >
                            {t('auth.skipForNow')}
                        </Link>
                    )}
                </CardFooter>
            </Card>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-zinc-400" /></div>}>
            <LoginPageContent />
        </Suspense>
    );
}

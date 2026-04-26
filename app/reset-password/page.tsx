'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';
import { Loader2, Lock, Eye, EyeOff, KeyRound, CheckCircle2, ArrowLeft, ShieldCheck } from 'lucide-react';
import { useTranslation } from '@/components/language-provider';

type PageState = 'loading' | 'mfa_challenge' | 'set_password' | 'success';

export default function ResetPasswordPage() {
    const { t } = useTranslation();
    const [pageState, setPageState] = useState<PageState>('loading');

    // Password form
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // MFA challenge
    const [mfaFactorId, setMfaFactorId] = useState('');
    const [mfaCode, setMfaCode] = useState('');
    const [mfaLoading, setMfaLoading] = useState(false);

    const router = useRouter();
    const supabase = createClient();

    const checkAAL = useCallback(async () => {
        try {
            const { data: aalData, error: aalError } =
                await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

            if (aalError) {
                setPageState('set_password');
                return;
            }

            if (aalData.nextLevel === 'aal2' && aalData.currentLevel === 'aal1') {
                const { data: factorsData } = await supabase.auth.mfa.listFactors();
                const totpFactor = factorsData?.totp?.find(
                    (f: { status: string }) => f.status === 'verified'
                );

                if (totpFactor) {
                    setMfaFactorId(totpFactor.id);
                    setPageState('mfa_challenge');
                    return;
                }
            }

            setPageState('set_password');
        } catch {
            setPageState('set_password');
        }
    }, [supabase]);

    useEffect(() => {
        checkAAL();
    }, [checkAAL]);

    const handleMfaVerify = async () => {
        if (mfaCode.length !== 6) {
            toast.error(t('auth.errors.mfaInvalidCode'));
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

            toast.success(t('common.success'));
            setPageState('set_password');
        } catch (err) {
            const message = err instanceof Error ? err.message : t('common.error');
            toast.error(message);
            setMfaCode('');
        } finally {
            setMfaLoading(false);
        }
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password.length < 6) {
            toast.error(t('common.error'));
            return;
        }

        if (password !== confirmPassword) {
            toast.error(t('auth.errors.passwordsDoNotMatch'));
            return;
        }

        setIsLoading(true);

        try {
            const { error } = await supabase.auth.updateUser({
                password,
            });

            if (error) {
                toast.error(error.message);
            } else {
                setPageState('success');
                toast.success(t('auth.reset.successTitle'));
            }
        } catch {
            toast.error(t('auth.errors.genericError'));
        } finally {
            setIsLoading(false);
        }
    };

    // ── LOADING ──
    if (pageState === 'loading') {
        return (
            <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
            </div>
        );
    }

    // ── SUCCESS ──
    if (pageState === 'success') {
        return (
            <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-12">
                <Card className="w-full max-w-md border-zinc-200 shadow-sm">
                    <CardHeader className="space-y-1 text-center">
                        <div className="mx-auto w-14 h-14 rounded-full bg-green-50 dark:bg-green-900/30 flex items-center justify-center mb-2">
                            <CheckCircle2 className="w-7 h-7 text-green-500" />
                        </div>
                        <CardTitle className="text-2xl font-semibold tracking-tight">
                            {t('auth.reset.successTitle')}
                        </CardTitle>
                        <CardDescription className="text-zinc-500">
                            {t('auth.reset.successDesc')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button
                            onClick={() => router.push('/')}
                            className="w-full h-11 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-medium"
                        >
                            {t('common.continue')}
                        </Button>
                    </CardContent>
                    <CardFooter>
                        <Link
                            href="/login"
                            className="w-full text-sm text-center text-zinc-400 hover:text-zinc-600 flex items-center justify-center gap-1"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            Back to sign in
                        </Link>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    // ── MFA CHALLENGE ──
    if (pageState === 'mfa_challenge') {
        return (
            <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-12">
                <Card className="w-full max-w-md border-zinc-200 shadow-sm">
                    <CardHeader className="space-y-1 text-center">
                        <div className="mx-auto w-14 h-14 rounded-full bg-cyan-50 dark:bg-cyan-900/30 flex items-center justify-center mb-2">
                            <ShieldCheck className="w-7 h-7 text-cyan-500" />
                        </div>
                        <CardTitle className="text-2xl font-semibold tracking-tight">
                            {t('auth.mfa.title')}
                        </CardTitle>
                        <CardDescription className="text-zinc-500">
                            {t('auth.mfa.subtitle')}
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="mfa-code" className="text-sm font-medium">
                                {t('auth.mfa.title')}
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
                                    {t('common.loading')}
                                </>
                            ) : (
                                t('auth.mfa.verify')
                            )}
                        </Button>
                    </CardContent>

                    <CardFooter>
                        <Link
                            href="/login"
                            className="w-full text-sm text-center text-zinc-400 hover:text-zinc-600 flex items-center justify-center gap-1"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            Back to sign in
                        </Link>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    // ── SET PASSWORD FORM ──
    return (
        <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-12">
            <Card className="w-full max-w-md border-zinc-200 shadow-sm">
                <CardHeader className="space-y-1 text-center">
                    <div className="mx-auto w-14 h-14 rounded-full bg-cyan-50 dark:bg-cyan-900/30 flex items-center justify-center mb-2">
                        <KeyRound className="w-7 h-7 text-cyan-500" />
                    </div>
                    <CardTitle className="text-2xl font-semibold tracking-tight">
                        {t('auth.reset.title')}
                    </CardTitle>
                    <CardDescription className="text-zinc-500">
                        {t('auth.reset.subtitle')}
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleUpdatePassword} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="new-password" className="text-sm font-medium">
                                {t('auth.reset.newPassword')}
                            </Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                                <Input
                                    id="new-password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="pl-10 pr-10 h-11 bg-white border-zinc-200 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                                    required
                                    minLength={6}
                                    autoFocus
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
                            <p className="text-xs text-zinc-400">
                                {t('common.optional')}
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirm-password" className="text-sm font-medium">
                                {t('auth.confirmPassword')}
                            </Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                                <Input
                                    id="confirm-password"
                                    type={showConfirm ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="pl-10 pr-10 h-11 bg-white border-zinc-200 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                                    required
                                    minLength={6}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirm(!showConfirm)}
                                    className="absolute right-3 top-3 text-zinc-400 hover:text-zinc-600 transition-colors"
                                    tabIndex={-1}
                                >
                                    {showConfirm ? (
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

                        <Button
                            type="submit"
                            className="w-full h-11 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-medium"
                            disabled={isLoading || !password || !confirmPassword || password !== confirmPassword}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {t('common.loading')}
                                </>
                            ) : (
                                t('auth.reset.submit')
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
                        Back to sign in
                    </Link>
                </CardFooter>
            </Card>
        </div>
    );
}

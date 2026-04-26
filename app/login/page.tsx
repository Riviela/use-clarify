'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';
import { Loader2, Mail, Lock, Github, Chrome, Eye, EyeOff, ShieldCheck, KeyRound } from 'lucide-react';

export default function LoginPage() {
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

    const supabase = createClient();

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            if (isSignUp) {
                if (password !== confirmPassword) {
                    toast.error('Passwords do not match.');
                    setIsLoading(false);
                    return;
                }

                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo: `${window.location.origin}/auth/callback`,
                    },
                });

                if (error) {
                    toast.error(error.message);
                } else if (data.session) {
                    // Email verification is disabled - user logged in immediately
                    toast.success('Account created successfully!');
                    router.push(redirect);
                    router.refresh();
                } else {
                    // Email verification is enabled - email sent to user
                    toast.success('Check your email to confirm your account');
                }
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });

                if (error) {
                    toast.error(error.message);
                } else {
                    // Check if MFA is required
                    const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

                    if (aalData && aalData.nextLevel === 'aal2' && aalData.currentLevel === 'aal1') {
                        // User has MFA enrolled — need verification
                        const { data: factorsData } = await supabase.auth.mfa.listFactors();
                        const totpFactor = factorsData?.totp?.[0];

                        if (totpFactor) {
                            setMfaFactorId(totpFactor.id);
                            setMfaRequired(true);
                            return; // Don't redirect yet
                        }
                    }

                    toast.success('Successfully signed in');
                    router.push(redirect);
                    router.refresh();
                }
            }
        } catch (error) {
            toast.error('An unexpected error occurred');
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
                    redirectTo: `${window.location.origin}/auth/callback?redirect=${redirect}`,
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
                        {isSignUp ? 'Join Clarify' : 'Welcome back'}
                    </CardTitle>
                    <CardDescription className="text-zinc-500">
                        {isSignUp
                            ? 'Create your account to unlock AI detection, humanization & more'
                            : 'Sign in to your Clarify account'}
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                    <form onSubmit={handleEmailAuth} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-medium">
                                Email
                            </Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="name@example.com"
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
                                    Password
                                </Label>
                                {!isSignUp && (
                                    <Link
                                        href="/forgot-password"
                                        className="text-xs text-cyan-500 hover:text-cyan-600 font-medium hover:underline underline-offset-4"
                                    >
                                        Forgot password?
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
                                    Confirm Password
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
                                        Passwords do not match
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
                                    {isSignUp ? 'Creating account...' : 'Signing in...'}
                                </>
                            ) : isSignUp ? (
                                'Create account'
                            ) : (
                                'Sign in'
                            )}
                        </Button>
                    </form>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-zinc-200" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white px-2 text-zinc-500">Or continue with</span>
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
                        {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                        <button
                            onClick={() => {
                                setIsSignUp(!isSignUp);
                                setConfirmPassword('');
                                setShowConfirmPassword(false);
                            }}
                            className="text-cyan-500 hover:text-cyan-600 font-medium underline-offset-4 hover:underline"
                        >
                            {isSignUp ? 'Sign in' : 'Sign up'}
                        </button>
                    </div>

                    {!isSignUp && (
                        <Link
                            href="/"
                            className="text-sm text-center text-zinc-400 hover:text-zinc-600"
                        >
                            Explore Clarify without an account
                        </Link>
                    )}
                </CardFooter>
            </Card>
        </div>
    );
}

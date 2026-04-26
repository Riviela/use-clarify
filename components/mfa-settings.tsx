'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Shield,
  ShieldCheck,
  ShieldOff,
  Loader2,
  QrCode,
  KeyRound,
  Copy,
  Check,
  AlertTriangle,
} from 'lucide-react';

type MFAStatus = 'loading' | 'disabled' | 'enrolling' | 'verifying' | 'enabled';

interface TOTPFactor {
  id: string;
  friendlyName?: string;
  status: string;
}

export function MFASettings() {
  const supabase = createClient();

  const [status, setStatus] = useState<MFAStatus>('loading');
  const [factorId, setFactorId] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [challengeId, setChallengeId] = useState('');
  const [error, setError] = useState('');
  const [enrolledFactor, setEnrolledFactor] = useState<TOTPFactor | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [secretCopied, setSecretCopied] = useState(false);

  // Disable MFA confirmation
  const [showDisableConfirm, setShowDisableConfirm] = useState(false);
  const [disableCode, setDisableCode] = useState('');
  const [disableLoading, setDisableLoading] = useState(false);
  const [disableError, setDisableError] = useState('');

  const checkMFAStatus = useCallback(async () => {
    try {
      const { data, error: listError } = await supabase.auth.mfa.listFactors();
      if (listError) throw listError;

      const verifiedTOTP = data.totp.find(
        (f: { status: string }) => f.status === 'verified'
      );

      if (verifiedTOTP) {
        setEnrolledFactor({
          id: verifiedTOTP.id,
          friendlyName: verifiedTOTP.friendly_name ?? undefined,
          status: verifiedTOTP.status,
        });
        setStatus('enabled');
      } else {
        setStatus('disabled');
      }
    } catch (err) {
      console.error('MFA status check failed:', err);
      setStatus('disabled');
    }
  }, [supabase]);

  useEffect(() => {
    checkMFAStatus();
  }, [checkMFAStatus]);

  const handleEnroll = async () => {
    setError('');
    setActionLoading(true);
    try {
      const { data, error: enrollError } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: 'Authenticator App',
      });

      if (enrollError) throw enrollError;

      setFactorId(data.id);
      setQrCode(data.totp.qr_code);
      setSecret(data.totp.secret);
      setStatus('enrolling');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to start enrollment.';
      setError(message);
      toast.error('Enrollment failed', { description: message });
    } finally {
      setActionLoading(false);
    }
  };

  const handleVerify = async () => {
    if (verifyCode.length !== 6) {
      setError('Please enter a 6-digit code.');
      return;
    }

    setError('');
    setActionLoading(true);
    try {
      const { data: challengeData, error: challengeError } =
        await supabase.auth.mfa.challenge({ factorId });

      if (challengeError) throw challengeError;

      setChallengeId(challengeData.id);

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challengeData.id,
        code: verifyCode,
      });

      if (verifyError) throw verifyError;

      toast.success('MFA enabled successfully!', {
        description: 'Your account is now protected with two-factor authentication.',
      });

      setQrCode('');
      setSecret('');
      setVerifyCode('');
      setChallengeId('');
      await checkMFAStatus();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Verification failed.';
      setError(message);
      toast.error('Verification failed', { description: message });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDisableConfirm = async () => {
    if (!enrolledFactor) return;
    if (disableCode.length !== 6) {
      setDisableError('Please enter a 6-digit code.');
      return;
    }

    setDisableError('');
    setDisableLoading(true);
    try {
      // Verify the TOTP code first
      const { data: challengeData, error: challengeError } =
        await supabase.auth.mfa.challenge({ factorId: enrolledFactor.id });

      if (challengeError) throw challengeError;

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: enrolledFactor.id,
        challengeId: challengeData.id,
        code: disableCode,
      });

      if (verifyError) throw verifyError;

      // Code is valid — proceed to unenroll
      const { error: unenrollError } = await supabase.auth.mfa.unenroll({
        factorId: enrolledFactor.id,
      });

      if (unenrollError) throw unenrollError;

      toast.success('MFA disabled', {
        description: 'Two-factor authentication has been removed from your account.',
      });

      setEnrolledFactor(null);
      setShowDisableConfirm(false);
      setDisableCode('');
      setStatus('disabled');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Invalid or expired code.';
      setDisableError(message);
      setDisableCode('');
    } finally {
      setDisableLoading(false);
    }
  };

  const handleCancelDisable = () => {
    setShowDisableConfirm(false);
    setDisableCode('');
    setDisableError('');
  };

  const handleCancelEnroll = async () => {
    if (factorId) {
      try {
        await supabase.auth.mfa.unenroll({ factorId });
      } catch {
        // Ignore — factor may not be fully enrolled yet
      }
    }
    setQrCode('');
    setSecret('');
    setVerifyCode('');
    setFactorId('');
    setChallengeId('');
    setError('');
    setStatus('disabled');
  };

  const handleCopySecret = async () => {
    try {
      await navigator.clipboard.writeText(secret);
      setSecretCopied(true);
      setTimeout(() => setSecretCopied(false), 2000);
    } catch {
      toast.error('Failed to copy secret');
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-5 h-5 animate-spin text-zinc-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
        <div className="px-6 py-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-md ${
                  status === 'enabled'
                    ? 'bg-gradient-to-br from-green-500 to-emerald-600'
                    : 'bg-zinc-100 dark:bg-zinc-800'
                }`}
              >
                {status === 'enabled' ? (
                  <ShieldCheck className="w-6 h-6 text-white" />
                ) : (
                  <Shield className="w-6 h-6 text-zinc-500" />
                )}
              </div>
              <div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Two-Factor Authentication
                </p>
                <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
                  Authenticator App
                </h2>
              </div>
            </div>
            <Badge
              className={`font-medium text-xs px-3 py-1 border-0 ${
                status === 'enabled'
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
                  : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'
              }`}
            >
              {status === 'enabled' ? 'Enabled' : 'Disabled'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/40">
          <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* ── DISABLED STATE ── */}
      {status === 'disabled' && (
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
          <div className="px-6 py-5 space-y-4">
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Add an extra layer of security to your account by enabling two-factor
              authentication. You&apos;ll need an authenticator app like{' '}
              <strong>Google Authenticator</strong>, <strong>Authy</strong>, or{' '}
              <strong>1Password</strong>.
            </p>
            <Button
              onClick={handleEnroll}
              disabled={actionLoading}
              className="h-10 px-6 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg font-medium"
            >
              {actionLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Setting up...
                </>
              ) : (
                <>
                  <QrCode className="w-4 h-4 mr-2" />
                  Enable Two-Factor Authentication
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* ── ENROLLING STATE — QR Code ── */}
      {status === 'enrolling' && (
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-white tracking-wide uppercase">
              Step 1: Scan QR Code
            </h3>
          </div>
          <div className="px-6 py-6 space-y-6">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Scan this QR code with your authenticator app, then enter the 6-digit
              code it generates.
            </p>

            {/* QR Code */}
            <div className="flex justify-center">
              <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm">
                <img
                  src={qrCode}
                  alt="Scan this QR code with your authenticator app"
                  width={200}
                  height={200}
                  className="block"
                />
              </div>
            </div>

            {/* Secret key fallback */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                Can&apos;t scan? Enter this key manually:
              </Label>
              <div className="flex items-center gap-2">
                <code className="flex-1 px-3 py-2 bg-zinc-50 dark:bg-zinc-800 rounded-lg text-xs font-mono text-zinc-700 dark:text-zinc-300 break-all border border-zinc-200 dark:border-zinc-700">
                  {secret}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopySecret}
                  className="rounded-lg shrink-0"
                >
                  {secretCopied ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </Button>
              </div>
            </div>

            {/* Verification input */}
            <div className="space-y-3">
              <div className="border-t border-zinc-100 dark:border-zinc-800" />
              <h4 className="text-sm font-semibold text-zinc-900 dark:text-white tracking-wide uppercase pt-2">
                Step 2: Verify Code
              </h4>
              <div className="max-w-xs space-y-2">
                <Label htmlFor="mfa-code" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  6-Digit Code
                </Label>
                <Input
                  id="mfa-code"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  placeholder="000000"
                  value={verifyCode}
                  onChange={(e) =>
                    setVerifyCode(e.target.value.replace(/\D/g, '').slice(0, 6))
                  }
                  className="h-11 rounded-lg border-zinc-200 dark:border-zinc-800 text-center text-lg tracking-[0.5em] font-mono"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && verifyCode.length === 6) {
                      handleVerify();
                    }
                  }}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <Button
                onClick={handleVerify}
                disabled={actionLoading || verifyCode.length !== 6}
                className="h-10 px-6 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg font-medium"
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4 mr-2" />
                    Verify & Enable
                  </>
                )}
              </Button>
              <Button
                variant="ghost"
                onClick={handleCancelEnroll}
                disabled={actionLoading}
                className="h-10 rounded-lg text-sm text-zinc-500 hover:text-zinc-700"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── ENABLED STATE ── */}
      {status === 'enabled' && (
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
          <div className="px-6 py-5 space-y-4">
            <div className="flex items-center gap-3 p-4 rounded-lg bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800/40">
              <ShieldCheck className="w-5 h-5 text-green-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-green-800 dark:text-green-300">
                  Two-factor authentication is active
                </p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-0.5">
                  Your account is protected with an authenticator app.
                </p>
              </div>
            </div>

            <div className="border-t border-zinc-100 dark:border-zinc-800" />

            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-zinc-900 dark:text-white">
                    Disable Two-Factor Authentication
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    This will remove the authenticator app from your account.
                  </p>
                </div>
                {!showDisableConfirm && (
                  <Button
                    variant="ghost"
                    onClick={() => setShowDisableConfirm(true)}
                    className="h-9 rounded-lg text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 whitespace-nowrap"
                  >
                    <ShieldOff className="w-3.5 h-3.5 mr-2" />
                    Disable MFA
                  </Button>
                )}
              </div>

              {showDisableConfirm && (
                <div className="rounded-lg border border-red-200 dark:border-red-800/40 bg-red-50/50 dark:bg-red-900/10 p-4 space-y-3">
                  <p className="text-sm text-zinc-700 dark:text-zinc-300">
                    Enter the 6-digit code from your authenticator app to confirm.
                  </p>

                  {disableError && (
                    <div className="flex items-center gap-2 text-xs text-red-600 dark:text-red-400">
                      <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                      {disableError}
                    </div>
                  )}

                  <div className="max-w-xs">
                    <Input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      placeholder="000000"
                      value={disableCode}
                      onChange={(e) =>
                        setDisableCode(e.target.value.replace(/\D/g, '').slice(0, 6))
                      }
                      className="h-11 rounded-lg border-zinc-200 dark:border-zinc-700 text-center text-lg tracking-[0.5em] font-mono"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && disableCode.length === 6) {
                          handleDisableConfirm();
                        }
                      }}
                      autoFocus
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <Button
                      onClick={handleDisableConfirm}
                      disabled={disableLoading || disableCode.length !== 6}
                      className="h-9 px-4 rounded-lg text-sm font-medium bg-red-600 hover:bg-red-700 text-white"
                    >
                      {disableLoading ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        'Confirm & Disable'
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={handleCancelDisable}
                      disabled={disableLoading}
                      className="h-9 rounded-lg text-sm text-zinc-500 hover:text-zinc-700"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

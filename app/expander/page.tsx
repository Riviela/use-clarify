'use client';

import { useState, useEffect } from 'react';
import { ToolLayout } from '@/components/tool-layout';
import { useTranslation } from '@/components/language-provider';
import { Expand, Lock, AlertCircle } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { expandText } from '@/actions/expand';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const FREE_TIER_WORD_LIMIT = 500;
const PREMIUM_WORD_LIMIT = 5000;

export default function ExpanderPage() {
  const { t } = useTranslation();
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTruncated, setIsTruncated] = useState(false);
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

  const wordCount = inputText.trim().split(/\s+/).filter(word => word.length > 0).length;
  const maxWords = planType === 'premium' ? PREMIUM_WORD_LIMIT : FREE_TIER_WORD_LIMIT;
  const isOverLimit = wordCount > maxWords;

  const handleExpand = async () => {
    if (!inputText.trim()) return;

    setIsLoading(true);
    setOutputText('');
    setError(null);
    setIsTruncated(false);

    try {
      const result = await expandText(inputText);

      if (result.success && result.text) {
        setOutputText(result.text);
        setIsTruncated(result.isTruncated || false);
      } else {
        setError(result.error || 'Operation failed, please try again.');
      }
    } catch (err) {
      console.error('Expander error:', err);
      setError('Operation failed, please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Word Limit Info */}
      <Alert className={isOverLimit ? "border-red-200 bg-red-50" : "border-blue-200 bg-blue-50"}>
        <AlertCircle className={`h-4 w-4 ${isOverLimit ? 'text-red-600' : 'text-blue-600'}`} />
        <AlertTitle>
          {planType === 'premium' ? 'Clarify Pro Active' : 'Starter Plan'}
        </AlertTitle>
        <AlertDescription>
          {planType === 'premium' ? (
            <>
              Full access enabled — expand up to {PREMIUM_WORD_LIMIT} words per request.
            </>
          ) : (
            <>
              Starter plan supports up to {FREE_TIER_WORD_LIMIT} words.
              Only the first 30% of output is visible — upgrade for full results.
            </>
          )}
        </AlertDescription>
      </Alert>

      <ToolLayout
        title={t('tools.expander.title')}
        description="Turn concise ideas into rich, detailed content — instantly."
        icon={<Expand className="w-5 h-5 text-orange-500" />}
        inputPlaceholder="Paste your brief text here..."
        outputPlaceholder="Expanded content will appear here..."
        actionButtonText="Expand"
        actionButtonIcon={<Expand className="w-5 h-5 mr-2" />}
        loadingText={t('tools.expander.expanding')}
        planType={planType}
        premiumBadge={planType !== 'premium' ? `Limit: ${FREE_TIER_WORD_LIMIT} words, only 30% visible` : undefined}
        wordCount={wordCount}
        maxWords={maxWords}
        isOverLimit={isOverLimit}
        outputText={outputText}
        isLoading={isLoading}
        onInputChange={setInputText}
        onAction={handleExpand}
        inputText={inputText}
        blurOverlay={planType !== 'premium' && isTruncated}
        blurMessage="Upgrade to Clarify Pro\nto unlock the full output."
      >
        {/* Truncation Warning */}
        {isTruncated && planType !== 'premium' && (
          <div className="mt-4 p-4 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
              <Lock className="w-5 h-5" />
              <span className="font-medium">Content Restricted</span>
            </div>
            <p className="text-sm text-zinc-500 mt-1">
              Only the first 30% is visible on the Starter plan.
              Upgrade to Clarify Pro for the complete output.
            </p>
          </div>
        )}
      </ToolLayout>
    </div>
  );
}

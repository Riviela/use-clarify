'use client';

import { useState, useEffect } from 'react';
import { ToolLayout } from '@/components/tool-layout';
import { useTranslation } from '@/components/language-provider';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { checkGrammar } from '@/actions/grammar';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function GrammarPage() {
  const { t } = useTranslation();
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [correctionsCount, setCorrectionsCount] = useState(0);
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

  const handleGrammarCheck = async () => {
    if (!inputText.trim()) return;

    setIsLoading(true);
    setOutputText('');
    setError(null);
    setCorrectionsCount(0);

    try {
      const result = await checkGrammar(inputText);

      if (result.success && result.text) {
        setOutputText(result.text);
        setCorrectionsCount(result.correctionsCount || 0);
      } else {
        setError(result.error || t('common.error'));
      }
    } catch (err) {
      console.error('Grammar error:', err);
      setError(t('common.error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Premium/Free Banner */}
      {planType !== 'premium' && (
        <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertTitle>Starter Plan</AlertTitle>
          <AlertDescription>
            Core spelling and grammar fixes are active.
            Upgrade to Clarify Pro for advanced style, tone, and fluency refinements.
          </AlertDescription>
        </Alert>
      )}
      
      {planType === 'premium' && (
        <Alert className="bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800">
          <CheckCircle className="h-4 w-4 text-amber-600" />
          <AlertTitle>Clarify Pro Active</AlertTitle>
          <AlertDescription>
            Full grammar, style, and fluency engine is enabled.
          </AlertDescription>
        </Alert>
      )}

      <ToolLayout
        title={t('tools.grammar.title')}
        description={t('tools.grammar.subtitle')}
        icon={<CheckCircle className="w-5 h-5 text-green-500" />}
        inputPlaceholder={t('common.placeholder')}
        outputPlaceholder={t('tools.grammar.result')}
        actionButtonText={t('tools.grammar.check')}
        actionButtonIcon={<CheckCircle className="w-5 h-5 mr-2" />}
        loadingText={t('tools.grammar.checking')}
        planType={planType}
        premiumBadge={planType !== 'premium' ? "Basic corrections only" : undefined}
        wordCount={wordCount}
        outputText={outputText}
        isLoading={isLoading}
        onInputChange={setInputText}
        onAction={handleGrammarCheck}
        inputText={inputText}
      >
        {/* Extra info when result is shown */}
        {outputText && correctionsCount > 0 && (
          <div className="mt-4 p-4 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="font-medium text-zinc-900 dark:text-white">Correction Completed!</span>
            </div>
            <div className="text-sm text-zinc-500 mt-1">
              Approximately <span className="font-medium text-zinc-700 dark:text-zinc-300">{correctionsCount}</span> corrections were made.
              {planType !== 'premium' && (
                <span className="ml-2">
                  Unlock deeper corrections with Clarify Pro.
                </span>
              )}
            </div>
          </div>
        )}
      </ToolLayout>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { ToolLayout } from '@/components/tool-layout';
import { useTranslation } from '@/components/language-provider';
import { FileText, Lock, AlertCircle } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { summarizeText, SummaryFormat } from '@/actions/summarize';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function SummarizerPage() {
  const { t } = useTranslation();
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<SummaryFormat>('bullet');
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

  const handleSummarize = async () => {
    if (!inputText.trim()) return;

    // Check if free user is trying to use premium format
    if (planType !== 'premium' && selectedFormat !== 'bullet') {
      alert('This format is only for Premium members! Free users can only use the "Bullet Points" format.');
      return;
    }

    setIsLoading(true);
    setOutputText('');
    setError(null);

    try {
      const result = await summarizeText(inputText, selectedFormat);

      if (result.success && result.text) {
        setOutputText(result.text);
      } else {
        setError(result.error || 'Operation failed, please try again.');
      }
    } catch (err) {
      console.error('Summarize error:', err);
      setError('Operation failed, please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTabs = (
    <Tabs value={selectedFormat} onValueChange={(value) => setSelectedFormat(value as SummaryFormat)} className="w-full max-w-md">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="bullet" className="flex items-center gap-1">
          Bullet Points
        </TabsTrigger>
        <TabsTrigger value="paragraph" className="flex items-center gap-1" disabled={planType !== 'premium'}>
          Paragraph
          {planType !== 'premium' && <Lock className="w-3 h-3" />}
        </TabsTrigger>
        <TabsTrigger value="executive" className="flex items-center gap-1" disabled={planType !== 'premium'}>
          Executive
          {planType !== 'premium' && <Lock className="w-3 h-3" />}
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Format Info */}
      {planType !== 'premium' && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">Starter Plan</span>
          </div>
          <p className="text-sm text-blue-600 dark:text-blue-300 mt-1">
            Bullet Points format is available on the free tier. Upgrade to Clarify Pro for Paragraph and Executive Summary.
          </p>
        </div>
      )}

      <ToolLayout
        title={t('tools.summarizer.title')}
        description="Distill lengthy content into sharp, actionable summaries."
        icon={<FileText className="w-5 h-5 text-blue-500" />}
        inputPlaceholder={t('common.placeholder')}
        outputPlaceholder="Your summary will appear here..."
        actionButtonText={t('tools.summarizer.summarize')}
        actionButtonIcon={<FileText className="w-5 h-5 mr-2" />}
        loadingText={t('tools.summarizer.summarizing')}
        planType={planType}
        premiumBadge={planType !== 'premium' ? "Bullet Points only" : undefined}
        wordCount={wordCount}
        outputText={outputText}
        isLoading={isLoading}
        onInputChange={setInputText}
        onAction={handleSummarize}
        inputText={inputText}
        extraControls={formatTabs}
      />
    </div>
  );
}

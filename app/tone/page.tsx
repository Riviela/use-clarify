'use client';

import { useState, useEffect } from 'react';
import { ToolLayout } from '@/components/tool-layout';
import { Music, Lock } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { changeTone, ToneType } from '@/actions/tone';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const TONES: { value: ToneType; label: string; description: string; color: string }[] = [
  { value: 'professional', label: 'Professional', description: 'Formal and corporate', color: 'bg-blue-500' },
  { value: 'academic', label: 'Academic', description: 'Scientific and technical', color: 'bg-purple-500' },
  { value: 'casual', label: 'Casual', description: 'Friendly and relaxed', color: 'bg-green-500' },
  { value: 'witty', label: 'Witty', description: 'Creative and clever', color: 'bg-yellow-500' },
  { value: 'aggressive', label: 'Aggressive', description: 'Strong and persuasive', color: 'bg-red-500' },
];

export default function TonePage() {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTone, setSelectedTone] = useState<ToneType>('professional');
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

  const handleToneChange = async () => {
    if (!inputText.trim()) return;

    setIsLoading(true);
    setOutputText('');
    setError(null);

    try {
      const result = await changeTone(inputText, selectedTone);

      if (result.success && result.text) {
        setOutputText(result.text);
      } else {
        setError(result.error || 'Operation failed, please try again.');
      }
    } catch (err) {
      console.error('Tone error:', err);
      setError('Operation failed, please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToneSelect = (value: ToneType) => {
    // Check if free user is trying to use premium tone
    if (planType !== 'premium' && value !== 'professional') {
      const toneLabel = TONES.find(t => t.value === value)?.label;
      toast.error('Pro Feature', {
        description: `'${toneLabel}' tone is available on Clarify Pro.`,
      });
      return;
    }
    setSelectedTone(value);
  };

  const toneSelector = (
    <div className="flex flex-wrap justify-center gap-2">
      {TONES.map((tone) => {
        const isLocked = planType !== 'premium' && tone.value !== 'professional';
        const isSelected = selectedTone === tone.value;
        
        return (
          <Button
            key={tone.value}
            variant={isSelected ? "default" : "outline"}
            size="sm"
            onClick={() => handleToneSelect(tone.value)}
            className={`relative ${isSelected ? tone.color + ' text-white' : ''}`}
          >
            {tone.label}
            {isLocked && (
              <Lock className="w-3 h-3 ml-1 text-amber-500" />
            )}
            {isSelected && (
              <Badge variant="secondary" className="ml-2 text-[10px]">
                Selected
              </Badge>
            )}
          </Button>
        );
      })}
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Tone Info */}
      {planType !== 'premium' && (
        <Alert className="border-blue-200 bg-blue-50">
          <AlertTitle>Starter Plan</AlertTitle>
          <AlertDescription>
            Professional tone is available on the free tier.
            Unlock Academic, Casual, Witty, and Aggressive modes with Clarify Pro.
          </AlertDescription>
        </Alert>
      )}

      <ToolLayout
        title="Tone Changer"
        description="Shift your writing's voice in seconds — from boardroom polish to casual charm."
        icon={<Music className="w-5 h-5 text-pink-500" />}
        inputPlaceholder="Paste your text here..."
        outputPlaceholder="Rewritten text will appear here..."
        actionButtonText="Change Tone"
        actionButtonIcon={<Music className="w-5 h-5 mr-2" />}
        loadingText="Changing tone..."
        planType={planType}
        premiumBadge={planType !== 'premium' ? "Professional tone only" : undefined}
        wordCount={wordCount}
        outputText={outputText}
        isLoading={isLoading}
        onInputChange={setInputText}
        onAction={handleToneChange}
        inputText={inputText}
        extraControls={toneSelector}
      >
        {/* Selected Tone Info */}
        {outputText && (
          <div className="mt-4 p-4 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              <span className="font-medium text-zinc-900 dark:text-white">Selected Tone:</span>{' '}
              {TONES.find(t => t.value === selectedTone)?.label}
              {planType !== 'premium' && selectedTone === 'professional' && (
                <span className="ml-2 text-zinc-400">(Starter tier)</span>
              )}
            </p>
          </div>
        )}
      </ToolLayout>
    </div>
  );
}

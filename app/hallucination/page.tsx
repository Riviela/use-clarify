'use client';

import { useState, useEffect } from 'react';
import { ToolLayout } from '@/components/tool-layout';
import { Search, AlertTriangle, Lock, Eye, EyeOff, Wand2, CheckCircle } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { detectHallucinations } from '@/actions/hallucination';
import { fixHallucinations } from '@/actions/hallucination-fix';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useUpgrade } from '@/hooks/use-upgrade';

export default function HallucinationPage() {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFixing, setIsFixing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState('');
  const [claims, setClaims] = useState<string[]>([]);
  const [claimCount, setClaimCount] = useState(0);
  const [fixedText, setFixedText] = useState('');
  const [changes, setChanges] = useState<string[]>([]);
  const [showFixed, setShowFixed] = useState(false);
  const [planType, setPlanType] = useState<string>('free');
  const { handleUpgrade } = useUpgrade();

  useEffect(() => {
    async function fetchPlanType() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('plan_type')
          .eq('id', user.id)
          .single();
        setPlanType(profile?.plan_type === 'premium' ? 'premium' : 'free');
      }
    }
    fetchPlanType();
  }, []);

  const wordCount = inputText.trim().split(/\s+/).filter(word => word.length > 0).length;

  const handleDetect = async () => {
    if (!inputText.trim()) return;

    setIsLoading(true);
    setOutputText('');
    setError(null);
    setSummary('');
    setClaims([]);
    setClaimCount(0);
    setFixedText('');
    setChanges([]);
    setShowFixed(false);

    try {
      const result = await detectHallucinations(inputText);

      if (result.success) {
        setSummary(result.summary || '');
        setClaimCount(result.claimCount || 0);
        
        // For premium users, show actual claims
        if (planType === 'premium' && result.claims) {
          setClaims(result.claims);
          // Format output for display
          const output = result.claims.length > 0 
            ? `ANALYSIS RESULT:\n\n${result.summary}\n\nSUSPICIOUS CLAIMS FOUND (${result.claimCount}):\n\n${result.claims.map((claim, i) => `${i + 1}. ${claim}`).join('\n\n')}`
            : `ANALYSIS RESULT:\n\n${result.summary}\n\nNo suspicious claims found.`;
          setOutputText(output);
        } else {
          // For free users, show only summary
          const output = claimCount > 0
            ? `ANALYSIS RESULT:\n\n${result.summary}\n\n${result.claimCount} suspicious claims found.\n\nUpgrade to Clarify Pro to see details.`
            : `ANALYSIS RESULT:\n\n${result.summary}\n\nNo suspicious claims found.`;
          setOutputText(output);
        }
      } else {
        setError(result.error || 'Operation failed, please try again.');
      }
    } catch (err) {
      console.error('Hallucination detection error:', err);
      setError('Operation failed, please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFix = async () => {
    if (planType !== 'premium' || claims.length === 0 || !inputText.trim()) return;

    setIsFixing(true);
    setError(null);

    try {
      const result = await fixHallucinations(inputText, claims);

      if (result.success && result.fixedText) {
        setFixedText(result.fixedText);
        setChanges(result.changes || []);
        setShowFixed(true);
      } else {
        setError(result.error || 'Failed to fix issues.');
      }
    } catch (err) {
      console.error('Hallucination fix error:', err);
      setError('Failed to fix issues.');
    } finally {
      setIsFixing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Plan Info */}
      {planType !== 'premium' && (
        <Alert className="border-amber-200 bg-amber-50">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertTitle>Starter Plan</AlertTitle>
          <AlertDescription>
            Claim count is visible, but detailed breakdowns are reserved for Clarify Pro.
          </AlertDescription>
        </Alert>
      )}

      <ToolLayout
        title="Hallucination Detector"
        description="Surface factual inconsistencies and dubious claims before they reach your audience."
        icon={<Search className="w-5 h-5 text-red-500" />}
        inputPlaceholder="Paste your text here..."
        outputPlaceholder="Analysis report will appear here..."
        actionButtonText="Analyze"
        actionButtonIcon={<Search className="w-5 h-5 mr-2" />}
        loadingText="Analyzing..."
        planType={planType}
        premiumBadge={planType !== 'premium' ? "Details hidden" : undefined}
        wordCount={wordCount}
        outputText={showFixed ? fixedText : outputText}
        isLoading={isLoading}
        onInputChange={setInputText}
        onAction={handleDetect}
        inputText={inputText}
        blurOverlay={false}
      >
        {/* Results Display */}
        {summary && (
          <div className="mt-6 space-y-4">
            {/* Summary Card */}
            <Card className={claimCount > 0 ? "border-zinc-200 dark:border-zinc-800" : "border-zinc-200 dark:border-zinc-800"}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  {claimCount > 0 ? (
                    <AlertTriangle className="w-6 h-6 text-amber-500 mt-1" />
                  ) : (
                    <Search className="w-6 h-6 text-green-500 mt-1" />
                  )}
                  <div>
                    <h3 className="font-semibold mb-1 text-zinc-900 dark:text-white">
                      {claimCount > 0 ? `${claimCount} Suspicious Claims Found` : 'No Issues Found'}
                    </h3>
                    <p className="text-sm text-zinc-500">{summary}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Fix Button - Premium Only */}
            {planType === 'premium' && claimCount > 0 && !showFixed && (
              <div className="flex justify-center">
                <Button
                  onClick={handleFix}
                  disabled={isFixing}
                  className="bg-cyan-500 hover:bg-cyan-600 text-white"
                >
                  {isFixing ? (
                    <span className="flex items-center">
                      <Search className="w-4 h-4 mr-2 animate-spin" />
                      Fixing Issues...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <Wand2 className="w-4 h-4 mr-2" />
                      Fix Issues
                    </span>
                  )}
                </Button>
              </div>
            )}

            {/* Fixed Text Display */}
            {showFixed && (
              <div className="space-y-4">
                <Card className="border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/20">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-6 h-6 text-green-500 mt-1" />
                      <div className="flex-1">
                        <h3 className="font-semibold mb-2 text-zinc-900 dark:text-white">
                          Fixed Text
                        </h3>
                        <p className="text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">{fixedText}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Changes List */}
                {changes.length > 0 && (
                  <Card className="border-zinc-200 dark:border-zinc-800">
                    <CardContent className="pt-6">
                      <h4 className="font-medium mb-3 text-zinc-900 dark:text-white">Changes Made:</h4>
                      <ul className="space-y-2">
                        {changes.map((change, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                            {change}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                <div className="flex justify-center">
                  <Button
                    variant="outline"
                    onClick={() => setShowFixed(false)}
                  >
                    Show Original Analysis
                  </Button>
                </div>
              </div>
            )}

            {/* Claims List - Premium Only */}
            {planType === 'premium' && claims.length > 0 && !showFixed && (
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2 text-zinc-900 dark:text-white">
                  <Eye className="w-4 h-4" />
                  Detailed Claims List
                </h4>
                {claims.map((claim, index) => (
                  <Card key={index} className="border-zinc-200 dark:border-zinc-800">
                    <CardContent className="pt-4 pb-4">
                      <div className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 text-xs font-medium flex items-center justify-center">
                          {index + 1}
                        </span>
                        <p className="text-sm text-zinc-700 dark:text-zinc-300">{claim}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Blurred Claims - Free Users */}
            {planType !== 'premium' && claimCount > 0 && (
              <Card className="border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
                <CardContent className="pt-6">
                  <div className="relative">
                    <div className="blur-sm select-none space-y-2">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-start gap-3">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full border border-zinc-200 text-zinc-400 text-xs font-medium flex items-center justify-center">{i}</span>
                          <p className="text-sm text-zinc-400">
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                          </p>
                        </div>
                      ))}
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-white dark:bg-zinc-900 px-4 py-3 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-800 flex flex-col items-center gap-2 text-center">
                        <Lock className="w-5 h-5 text-cyan-400" />
                        <span className="text-sm font-medium text-zinc-900 dark:text-white">
                          {claimCount} suspicious claims found
                        </span>
                        <span className="text-xs text-zinc-500">
                          Upgrade to Clarify Pro for full details.
                        </span>
                        <Button 
                          size="sm" 
                          className="mt-1 bg-cyan-500 hover:bg-cyan-600 rounded-lg"
                          onClick={handleUpgrade}
                        >
                          Upgrade to Pro
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </ToolLayout>
    </div>
  );
}

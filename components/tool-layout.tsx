'use client';

import { useState, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Copy, Check, Lock, Crown } from 'lucide-react';
import { useUpgrade } from '@/hooks/use-upgrade';
import { useTranslation } from '@/components/language-provider';

interface ToolLayoutProps {
  title: string;
  description: string;
  icon: ReactNode;
  inputPlaceholder: string;
  outputPlaceholder: string;
  actionButtonText: string;
  actionButtonIcon: ReactNode;
  loadingText: string;
  planType: string;
  premiumBadge?: string;
  wordCount?: number;
  maxWords?: number;
  isOverLimit?: boolean;
  outputText: string;
  isLoading: boolean;
  onInputChange: (text: string) => void;
  onAction: () => void;
  inputText: string;
  children?: ReactNode;
  extraControls?: ReactNode;
  blurOverlay?: boolean;
  blurMessage?: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 100,
      damping: 15,
    },
  },
};

export function ToolLayout({
  title,
  description,
  icon,
  inputPlaceholder,
  outputPlaceholder,
  actionButtonText,
  actionButtonIcon,
  loadingText,
  planType,
  premiumBadge,
  wordCount = 0,
  maxWords,
  isOverLimit = false,
  outputText,
  isLoading,
  onInputChange,
  onAction,
  inputText,
  children,
  extraControls,
  blurOverlay = false,
  blurMessage,
}: ToolLayoutProps) {
  const [copied, setCopied] = useState(false);
  const { handleUpgrade } = useUpgrade();
  const { t } = useTranslation();
  const effectiveBlurMessage = blurMessage ?? t('toolLayout.blurMessageDefault');

  const handleCopy = async () => {
    if (!outputText) return;
    await navigator.clipboard.writeText(outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getWordCountText = () => {
    if (maxWords) {
      if (planType === 'premium') return t('toolLayout.wordsCountUnlimited', { count: wordCount });
      return t('toolLayout.wordsCountMax', { count: wordCount, max: maxWords });
    }
    return t('toolLayout.wordsCount', { count: wordCount });
  };

  return (
    <motion.div 
      className="max-w-6xl mx-auto space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Title Section */}
      <motion.div variants={itemVariants} className="text-center space-y-4">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-white">
          {title}
        </h1>
        <p className="text-base text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          {description}
          {premiumBadge && planType !== 'premium' && (
            <span className="text-cyan-400 font-medium block mt-2">
              ({premiumBadge})
            </span>
          )}
        </p>
      </motion.div>

      {/* Extra Controls (if any) */}
      {extraControls && (
        <motion.div variants={itemVariants} className="flex justify-center">
          {extraControls}
        </motion.div>
      )}

      {/* Main Content */}
      <motion.div variants={itemVariants} className="grid md:grid-cols-2 gap-6">
        {/* Input Area */}
        <Card className="flex flex-col border-zinc-200 dark:border-zinc-800 shadow-sm rounded-xl">
          <CardHeader className="space-y-2">
            <CardTitle className="text-lg font-medium text-zinc-900 dark:text-white">
              {t('toolLayout.inputTitle')}
            </CardTitle>
            <CardDescription className="text-sm text-zinc-500">
              {t('toolLayout.inputDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <Textarea
              placeholder={inputPlaceholder}
              value={inputText}
              onChange={(e) => onInputChange(e.target.value)}
              className="min-h-[300px] resize-none rounded-lg border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
            />
            <div className="flex items-center justify-between mt-3">
              <p className={`text-sm ${isOverLimit ? 'text-red-500 font-medium' : 'text-zinc-400'}`}>
                {getWordCountText()}
                {isOverLimit && ` ${t('toolLayout.limitExceeded')}`}
              </p>
              {planType !== 'premium' && maxWords && (
                <span className="text-xs text-zinc-400">
                  {t('toolLayout.freeWords', { count: maxWords })}
                </span>
              )}
              {planType === 'premium' && (
                <span className="text-xs text-cyan-400 font-medium flex items-center gap-1">
                  <Crown className="w-3 h-3" />
                  {t('common.premium')}
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Output Area */}
        <Card className="flex flex-col relative border-zinc-200 dark:border-zinc-800 shadow-sm rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div className="space-y-2">
              <CardTitle className="text-lg font-medium text-zinc-900 dark:text-white flex items-center gap-2">
                {icon}
                <span>{t('toolLayout.result')}</span>
              </CardTitle>
              <CardDescription className="text-sm text-zinc-500">
                {outputPlaceholder}
              </CardDescription>
            </div>
            {/* Copy Button - Card Header */}
            {outputText && (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  className="rounded-lg border-zinc-200 dark:border-zinc-800"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 mr-1" />
                      {t('common.copied')}
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-1" />
                      {t('common.copy')}
                    </>
                  )}
                </Button>
              </motion.div>
            )}
          </CardHeader>
          <CardContent className="flex-1 relative">
            <div className="relative">
              <Textarea
                readOnly
                placeholder={outputPlaceholder}
                value={outputText}
                className={`min-h-[300px] resize-none bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-lg ${blurOverlay && outputText ? 'blur-[3px] select-none' : ''}`}
              />
              
              {/* Blur Overlay with Animation */}
              <AnimatePresence>
                {blurOverlay && outputText && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.9, opacity: 0 }}
                      transition={{ 
                        duration: 0.3, 
                        ease: [0.22, 1, 0.36, 1],
                        delay: 0.1 
                      }}
                      className="bg-white/95 dark:bg-zinc-900/95 px-6 py-4 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-800 flex flex-col items-center gap-3 text-center"
                    >
                      <motion.div
                        animate={{ 
                          scale: [1, 1.1, 1],
                          rotate: [0, 5, -5, 0]
                        }}
                        transition={{ 
                          duration: 2, 
                          repeat: Infinity, 
                          repeatDelay: 1 
                        }}
                      >
                        <Lock className="w-6 h-6 text-cyan-400" />
                      </motion.div>
                      <span 
                        className="text-sm font-medium text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap"
                        style={{ whiteSpace: 'pre-wrap' }}
                      >
                        {effectiveBlurMessage}
                      </span>
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button 
                          size="sm" 
                          className="mt-1 bg-cyan-500 hover:bg-cyan-600 rounded-lg"
                          onClick={handleUpgrade}
                        >
                          <Crown className="w-4 h-4 mr-1" />
                          {t('common.upgradeToPro')}
                        </Button>
                      </motion.div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {children}
          </CardContent>
        </Card>
      </motion.div>

      {/* Action Button */}
      <motion.div variants={itemVariants} className="flex flex-col items-center gap-4">
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            size="lg"
            onClick={onAction}
            disabled={isLoading || !inputText.trim() || isOverLimit}
            className="px-12 h-12 text-base rounded-lg bg-cyan-500 hover:bg-cyan-600 text-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                {loadingText}
              </>
            ) : isOverLimit ? (
              <>
                <Lock className="w-5 h-5 mr-2" />
                {t('toolLayout.premiumRequired', { count: wordCount })}
              </>
            ) : (
              <>
                {actionButtonIcon}
                {actionButtonText}
              </>
            )}
          </Button>
        </motion.div>
        
        {maxWords && planType !== 'premium' && (
          <p className="text-sm text-zinc-400">
            {t('toolLayout.freeUserLimit', { count: maxWords })}
          </p>
        )}
      </motion.div>
    </motion.div>
  );
}

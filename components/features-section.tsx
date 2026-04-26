'use client';

import Link from 'next/link';
import {
  ScanSearch,
  UserCheck,
  SpellCheck,
  FileText,
  Expand,
  Palette,
  ShieldAlert,
  RefreshCw,
} from 'lucide-react';
import { useTranslation } from '@/components/language-provider';

export function FeaturesSection() {
  const { t } = useTranslation();

  const features = [
    { icon: ScanSearch, title: t('features.detector.title'), description: t('features.detector.desc'), href: '/', color: 'text-cyan-500', bg: 'bg-cyan-50 dark:bg-cyan-950/40' },
    { icon: UserCheck, title: t('features.humanizer.title'), description: t('features.humanizer.desc'), href: '/humanizer', color: 'text-violet-500', bg: 'bg-violet-50 dark:bg-violet-950/40', premium: true },
    { icon: SpellCheck, title: t('features.grammar.title'), description: t('features.grammar.desc'), href: '/grammar', color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-950/40' },
    { icon: FileText, title: t('features.summarizer.title'), description: t('features.summarizer.desc'), href: '/summarizer', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/40' },
    { icon: Expand, title: t('features.expander.title'), description: t('features.expander.desc'), href: '/expander', color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-950/40' },
    { icon: Palette, title: t('features.tone.title'), description: t('features.tone.desc'), href: '/tone', color: 'text-pink-500', bg: 'bg-pink-50 dark:bg-pink-950/40' },
    { icon: ShieldAlert, title: t('features.hallucination.title'), description: t('features.hallucination.desc'), href: '/hallucination', color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-950/40' },
    { icon: RefreshCw, title: t('features.paraphraser.title'), description: t('features.paraphraser.desc'), href: '/paraphraser', color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-950/40' },
  ];

  return (
    <section id="features" className="scroll-mt-24">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
          {t('features.sectionTitle')}
        </h2>
        <p className="mt-3 text-base text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto">
          {t('features.sectionSubtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {features.map((feature) => (
          <Link
            key={feature.title}
            href={feature.href}
            className="group relative rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-md transition-all duration-200"
          >
            <div
              className={`w-10 h-10 rounded-lg ${feature.bg} flex items-center justify-center mb-4`}
            >
              <feature.icon className={`w-5 h-5 ${feature.color}`} />
            </div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-1.5 flex items-center gap-2">
              {feature.title}
              {feature.premium && (
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded">
                  {t('common.pro')}
                </span>
              )}
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              {feature.description}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}

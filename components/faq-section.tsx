'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/components/language-provider';

interface FAQItem {
  question: string;
  answer: string;
}


function FAQAccordionItem({ item }: { item: FAQItem }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-zinc-100 dark:border-zinc-800 last:border-0">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between py-5 text-left"
      >
        <span className="text-sm font-medium text-zinc-900 dark:text-white pr-4">
          {item.question}
        </span>
        <ChevronDown
          className={cn(
            'w-4 h-4 flex-shrink-0 text-zinc-400 transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </button>
      <div
        className={cn(
          'grid transition-all duration-200 ease-in-out',
          isOpen ? 'grid-rows-[1fr] opacity-100 pb-5' : 'grid-rows-[0fr] opacity-0'
        )}
      >
        <div className="overflow-hidden">
          <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
            {item.answer}
          </p>
        </div>
      </div>
    </div>
  );
}

export function FAQSection() {
  const { t } = useTranslation();

  const faqItems: FAQItem[] = [
    { question: t('faq.items.q1.q'), answer: t('faq.items.q1.a') },
    { question: t('faq.items.q2.q'), answer: t('faq.items.q2.a') },
    { question: t('faq.items.q3.q'), answer: t('faq.items.q3.a') },
    { question: t('faq.items.q4.q'), answer: t('faq.items.q4.a') },
    { question: t('faq.items.q5.q'), answer: t('faq.items.q5.a') },
    { question: t('faq.items.q6.q'), answer: t('faq.items.q6.a') },
    { question: t('faq.items.q7.q'), answer: t('faq.items.q7.a') },
    { question: t('faq.items.q8.q'), answer: t('faq.items.q8.a') },
  ];

  return (
    <section id="faq" className="scroll-mt-24">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
          {t('faq.sectionTitle')}
        </h2>
        <p className="mt-3 text-base text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto">
          {t('faq.sectionSubtitle')}
        </p>
      </div>

      <div className="max-w-2xl mx-auto rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-6">
        {faqItems.map((item) => (
          <FAQAccordionItem key={item.question} item={item} />
        ))}
      </div>
    </section>
  );
}

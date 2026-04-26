'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FAQItem {
  question: string;
  answer: string;
}

const faqItems: FAQItem[] = [
  {
    question: 'What is Clarify?',
    answer:
      'Clarify is an all-in-one AI text analysis platform. It detects AI-generated content, humanizes robotic text, checks grammar, summarizes, paraphrases, changes tone, expands text, and identifies hallucinations — all in one place.',
  },
  {
    question: 'How accurate is the AI detection?',
    answer:
      'Clarify uses advanced paragraph-level analysis powered by LLMs to provide confidence scores for each section of text. While no AI detector is 100% accurate, Clarify distinguishes between fully human, AI-generated, and AI-refined content with high precision.',
  },
  {
    question: 'What is the difference between Free and Pro plans?',
    answer:
      'The Free plan gives you access to basic detection (500 words), grammar checking, bullet-point summaries, and limited paraphrasing (100 words). Clarify Pro unlocks all tools with higher limits (3,000 words), the AI Humanizer, all tone options, full hallucination details, executive summaries, and expanded text output.',
  },
  {
    question: 'What AI model does Clarify use?',
    answer:
      'Clarify is powered by fast, state-of-the-art language models through the Gemini API, including Gemini 3.1 Pro Thinking and similar high-performance models optimized for speed and accuracy.',
  },
  {
    question: 'Is my text stored or used for training?',
    answer:
      'No. Text you submit is processed in real time and is not permanently stored after analysis. We do not use your content to train any AI models. See our Privacy Policy for full details.',
  },
  {
    question: 'Can I cancel my subscription anytime?',
    answer:
      'Yes. You can cancel your Clarify Pro subscription at any time from your Account Settings or via the Lemon Squeezy customer portal. You\'ll retain access to premium features until the end of your current billing period.',
  },
  {
    question: 'Do you offer refunds?',
    answer:
      'Yes. We offer a 7-day money-back guarantee on first-time subscriptions. If you\'re not satisfied, contact support@use-clarify.com within 7 days of your purchase for a full refund.',
  },
  {
    question: 'What languages does Clarify support?',
    answer:
      'Clarify supports content analysis in multiple languages including English, Turkish, German, French, and Spanish. The interface is currently in English with multi-language support planned for future releases.',
  },
];

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
  return (
    <section id="faq" className="scroll-mt-24">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
          Frequently Asked Questions
        </h2>
        <p className="mt-3 text-base text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto">
          Got questions? We&apos;ve got answers.
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

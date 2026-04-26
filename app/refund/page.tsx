import type { Metadata } from 'next';
import { getDictionary, getLocale } from '@/lib/i18n';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Refund Policy — Clarify',
  description: 'Clarify refund policy. Learn about our refund and cancellation terms for paid subscriptions.',
};

export default async function RefundPolicyPage() {
  const dict = getDictionary(await getLocale());
  return (
    <div className="max-w-3xl mx-auto">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        {dict.common.back}
      </Link>

      <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white mb-2">
        Refund Policy
      </h1>
      <p className="text-sm text-zinc-400 mb-10">{dict.legal.lastUpdated}: April 10, 2026</p>

      <div className="prose prose-zinc dark:prose-invert prose-sm max-w-none space-y-8">
        <section>
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-3">
            1. Overview
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
            We want you to be fully satisfied with your Clarify Pro subscription. This Refund
            Policy outlines the conditions under which refunds are available.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-3">
            2. 7-Day Money-Back Guarantee
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
            If you are not satisfied with Clarify Pro, you may request a full refund within
            <strong className="text-zinc-800 dark:text-zinc-200"> 7 days </strong>
            of your initial purchase. This applies to first-time subscriptions only. Renewal
            charges are not eligible for this guarantee.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-3">
            3. How to Request a Refund
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed mb-3">
            To request a refund, please contact our support team:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-zinc-600 dark:text-zinc-400">
            <li>
              Email us at{' '}
              <a href="mailto:info@use-clarify.com" className="text-cyan-500 hover:text-cyan-600 underline">
                info@use-clarify.com
              </a>{' '}
              with the subject line &quot;Refund Request&quot;.
            </li>
            <li>Include the email address associated with your Clarify account.</li>
            <li>Briefly describe the reason for your refund request (optional but helpful).</li>
          </ul>
          <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed mt-3">
            We aim to process refund requests within <strong className="text-zinc-800 dark:text-zinc-200">3–5 business days</strong>.
            Approved refunds will be credited back to the original payment method.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-3">
            4. Cancellations
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
            You may cancel your Clarify Pro subscription at any time from your
            <strong className="text-zinc-800 dark:text-zinc-200"> Account Settings </strong>
            or via the Lemon Squeezy customer portal. Upon cancellation:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-zinc-600 dark:text-zinc-400 mt-3">
            <li>You will retain access to all premium features until the end of your current billing period.</li>
            <li>No further charges will be made after the current period ends.</li>
            <li>Your account will automatically revert to the Free plan when the period expires.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-3">
            5. Non-Refundable Cases
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed mb-3">
            Refunds may not be granted in the following cases:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-zinc-600 dark:text-zinc-400">
            <li>Requests made more than 7 days after the initial purchase.</li>
            <li>Renewal charges (monthly or annual) after the first billing cycle.</li>
            <li>Accounts that have been suspended or terminated due to Terms of Service violations.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-3">
            6. Exceptional Circumstances
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
            If you believe you have been charged in error or have experienced a significant
            service disruption, please contact us. We evaluate exceptional cases on an individual
            basis and are committed to finding a fair resolution.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-3">
            7. Contact Us
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
            For any questions regarding refunds or billing, reach out to us at{' '}
            <a href="mailto:info@use-clarify.com" className="text-cyan-500 hover:text-cyan-600 underline">
              info@use-clarify.com
            </a>.
          </p>
        </section>
      </div>
    </div>
  );
}

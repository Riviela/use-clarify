import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy — Clarify',
  description: 'Clarify privacy policy. Learn how we collect, use, and protect your personal information.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to home
      </Link>

      <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white mb-2">
        Privacy Policy
      </h1>
      <p className="text-sm text-zinc-400 mb-10">Last updated: April 10, 2026</p>

      <div className="prose prose-zinc dark:prose-invert prose-sm max-w-none space-y-8">
        <section>
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-3">
            1. Introduction
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Clarify (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your privacy.
            This Privacy Policy explains how we collect, use, disclose, and safeguard your
            information when you use our AI text analysis platform at{' '}
            <a href="https://use-clarify.com" className="text-cyan-500 hover:text-cyan-600 underline">use-clarify.com</a> (the &quot;Service&quot;).
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-3">
            2. Information We Collect
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed mb-3">
            We may collect the following types of information:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-zinc-600 dark:text-zinc-400">
            <li>
              <strong className="text-zinc-800 dark:text-zinc-200">Account Information:</strong> When you
              create an account, we collect your name, email address, and authentication credentials.
            </li>
            <li>
              <strong className="text-zinc-800 dark:text-zinc-200">Usage Data:</strong> We collect information
              about how you interact with the Service, including features used and analysis requests made.
            </li>
            <li>
              <strong className="text-zinc-800 dark:text-zinc-200">Payment Information:</strong> Payment
              processing is handled by Lemon Squeezy. We do not store your credit card details directly.
            </li>
            <li>
              <strong className="text-zinc-800 dark:text-zinc-200">Text Content:</strong> Text you submit for
              analysis is processed by our AI systems. We do not permanently store analyzed text after
              processing is complete.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-3">
            3. How We Use Your Information
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-zinc-600 dark:text-zinc-400">
            <li>To provide, operate, and maintain the Service.</li>
            <li>To process your transactions and manage your subscription.</li>
            <li>To communicate with you, including sending service-related updates.</li>
            <li>To improve and personalize your experience.</li>
            <li>To comply with legal obligations and enforce our terms.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-3">
            4. Data Sharing and Disclosure
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
            We do not sell your personal data. We may share information with trusted third-party
            service providers (such as Supabase for authentication and Lemon Squeezy for payments)
            solely to operate and improve the Service. We may also disclose information if required
            by law or to protect our rights.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-3">
            5. Data Security
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
            We implement industry-standard security measures, including encryption in transit (TLS)
            and at rest, to protect your data. However, no electronic transmission or storage method
            is 100% secure.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-3">
            6. Your Rights
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Depending on your jurisdiction, you may have the right to access, correct, or delete
            your personal data. You may also request a copy of the data we hold about you. To
            exercise these rights, contact us at{' '}
            <a href="mailto:support@use-clarify.com" className="text-cyan-500 hover:text-cyan-600 underline">
              support@use-clarify.com
            </a>.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-3">
            7. Cookies
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
            We use essential cookies for authentication and session management. We do not use
            third-party advertising cookies or tracking pixels.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-3">
            8. Changes to This Policy
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
            We may update this Privacy Policy from time to time. We will notify you of material
            changes by posting the updated policy on this page with a revised date.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-3">
            9. Contact Us
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
            If you have questions or concerns about this Privacy Policy, please contact us at{' '}
            <a href="mailto:support@use-clarify.com" className="text-cyan-500 hover:text-cyan-600 underline">
              support@use-clarify.com
            </a>.
          </p>
        </section>
      </div>
    </div>
  );
}

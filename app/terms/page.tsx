import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms of Service — Clarify',
  description: 'Clarify terms of service. Read the terms and conditions for using our AI text analysis platform.',
};

export default function TermsOfServicePage() {
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
        Terms of Service
      </h1>
      <p className="text-sm text-zinc-400 mb-10">Last updated: April 10, 2026</p>

      <div className="prose prose-zinc dark:prose-invert prose-sm max-w-none space-y-8">
        <section>
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-3">
            1. Acceptance of Terms
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
            By accessing or using Clarify (the &quot;Service&quot;), operated at{' '}
            <a href="https://use-clarify.com" className="text-cyan-500 hover:text-cyan-600 underline">use-clarify.com</a>,
            you agree to be bound by these Terms of Service. If you do not agree, please do not
            use the Service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-3">
            2. Description of Service
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Clarify is an AI-powered text analysis platform that provides content detection,
            humanization, grammar checking, summarization, paraphrasing, tone adjustment,
            text expansion, and hallucination detection services. The Service is provided on a
            freemium basis with additional features available through paid subscriptions.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-3">
            3. User Accounts
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-zinc-600 dark:text-zinc-400">
            <li>You must provide accurate and complete information when creating an account.</li>
            <li>You are responsible for maintaining the security of your account credentials.</li>
            <li>You must be at least 16 years of age to use the Service.</li>
            <li>One person or entity may not maintain more than one free account.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-3">
            4. Subscriptions and Payments
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed mb-3">
            Paid subscriptions are billed in advance on a monthly or annual basis through our
            payment processor, Lemon Squeezy. By subscribing, you authorize recurring charges
            to your payment method.
          </p>
          <ul className="list-disc pl-5 space-y-2 text-zinc-600 dark:text-zinc-400">
            <li>Prices are listed in USD and may be subject to applicable taxes.</li>
            <li>Subscriptions renew automatically unless cancelled before the renewal date.</li>
            <li>You may cancel your subscription at any time through your account settings or the customer portal.</li>
            <li>Upon cancellation, you retain access to premium features until the end of your current billing period.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-3">
            5. Acceptable Use
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed mb-3">
            You agree not to:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-zinc-600 dark:text-zinc-400">
            <li>Use the Service for any unlawful purpose or in violation of any applicable laws.</li>
            <li>Attempt to reverse-engineer, decompile, or extract source code from the Service.</li>
            <li>Automate access to the Service through bots, scrapers, or similar tools without prior written consent.</li>
            <li>Interfere with or disrupt the integrity or performance of the Service.</li>
            <li>Submit content that infringes on the intellectual property rights of others.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-3">
            6. Intellectual Property
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
            The Service, including its design, code, branding, and AI models, is owned by Clarify
            and protected by intellectual property laws. You retain ownership of the text you submit
            for analysis. We do not claim any rights over your input or output content.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-3">
            7. Disclaimer of Warranties
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
            The Service is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind,
            either express or implied. AI-generated analysis results are probabilistic and should
            not be treated as absolute determinations. We do not guarantee the accuracy, completeness,
            or reliability of any analysis results.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-3">
            8. Limitation of Liability
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
            To the maximum extent permitted by law, Clarify shall not be liable for any indirect,
            incidental, special, consequential, or punitive damages, including loss of profits, data,
            or goodwill, arising out of or related to your use of the Service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-3">
            9. Termination
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
            We reserve the right to suspend or terminate your access to the Service at any time
            for violations of these Terms, without prior notice. Upon termination, your right to
            use the Service ceases immediately.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-3">
            10. Changes to Terms
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
            We may modify these Terms at any time. Continued use of the Service after changes
            constitutes acceptance of the revised Terms. We will notify users of material changes
            via email or an in-app notice.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-3">
            11. Contact
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
            For questions about these Terms, please contact us at{' '}
            <a href="mailto:info@use-clarify.com" className="text-cyan-500 hover:text-cyan-600 underline">
              info@use-clarify.com
            </a>.
          </p>
        </section>
      </div>
    </div>
  );
}

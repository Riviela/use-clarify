'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Loader2,
  ExternalLink,
  Receipt,
  FileText,
  AlertCircle,
} from 'lucide-react';

interface InvoiceItem {
  id: string;
  date: string;
  description: string;
  amount: string;
  status: string;
  receiptUrl: string | null;
}

function formatInvoiceDate(dateStr: string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(dateStr));
}

function getStatusBadge(status: string) {
  const normalized = status.toLowerCase();

  switch (normalized) {
    case 'paid':
      return (
        <Badge className="bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 border-0 text-xs font-medium">
          Paid
        </Badge>
      );
    case 'refunded':
      return (
        <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border-0 text-xs font-medium">
          Refunded
        </Badge>
      );
    case 'pending':
      return (
        <Badge className="bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border-0 text-xs font-medium">
          Pending
        </Badge>
      );
    default:
      return (
        <Badge className="bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border-0 text-xs font-medium capitalize">
          {status}
        </Badge>
      );
  }
}

function SkeletonRow() {
  return (
    <tr className="border-b border-zinc-100 dark:border-zinc-800">
      <td className="px-4 py-3">
        <div className="h-4 w-24 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse" />
      </td>
      <td className="px-4 py-3">
        <div className="h-4 w-40 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse" />
      </td>
      <td className="px-4 py-3">
        <div className="h-4 w-16 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse" />
      </td>
      <td className="px-4 py-3">
        <div className="h-5 w-14 bg-zinc-200 dark:bg-zinc-700 rounded-full animate-pulse" />
      </td>
      <td className="px-4 py-3">
        <div className="h-8 w-28 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse" />
      </td>
    </tr>
  );
}

export function BillingHistory() {
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const res = await fetch('/api/billing/invoices');

        let data;
        try {
          data = await res.json();
        } catch {
          data = {};
        }

        if (!res.ok) {
          const msg = data?.error || `Server returned ${res.status}`;
          console.error('[BillingHistory] API error:', res.status, msg);
          setErrorMessage(msg);
          setHasError(true);
          toast.error('Failed to load billing history.');
          return;
        }

        setInvoices(data.invoices || []);
      } catch (err) {
        console.error('[BillingHistory] Fetch error:', err);
        setErrorMessage('Network error. Please check your connection.');
        setHasError(true);
        toast.error('Failed to load billing history.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvoices();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
        <div className="px-6 py-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shadow-md">
              <Receipt className="w-6 h-6 text-zinc-500" />
            </div>
            <div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Billing History
              </p>
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
                Invoices & Payments
              </h2>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
        {hasError ? (
          <div className="px-6 py-12 text-center">
            <AlertCircle className="w-10 h-10 text-zinc-300 dark:text-zinc-600 mx-auto mb-3" />
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Failed to load invoices
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-md mx-auto">
              {errorMessage || 'Please try again later or contact support.'}
            </p>
          </div>
        ) : isLoading ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
              </tbody>
            </table>
          </div>
        ) : invoices.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <FileText className="w-10 h-10 text-zinc-300 dark:text-zinc-600 mx-auto mb-3" />
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              No invoices found
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Your billing history will appear here after your first purchase.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr
                    key={invoice.id}
                    className="border-b border-zinc-100 dark:border-zinc-800 last:border-0 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors"
                  >
                    <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300 whitespace-nowrap">
                      {formatInvoiceDate(invoice.date)}
                    </td>
                    <td className="px-4 py-3 text-zinc-900 dark:text-white font-medium">
                      {invoice.description}
                    </td>
                    <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300 font-mono whitespace-nowrap">
                      {invoice.amount}
                    </td>
                    <td className="px-4 py-3">
                      {getStatusBadge(invoice.status)}
                    </td>
                    <td className="px-4 py-3">
                      {invoice.receiptUrl ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                          className="h-8 rounded-lg text-xs font-medium text-cyan-600 hover:text-cyan-700 hover:bg-cyan-50 dark:hover:bg-cyan-900/20"
                        >
                          <a
                            href={invoice.receiptUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                            View Invoice
                          </a>
                        </Button>
                      ) : (
                        <span className="text-xs text-zinc-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

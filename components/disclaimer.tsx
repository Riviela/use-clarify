import { AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export function Disclaimer() {
    return (
        <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-900/50 dark:bg-amber-900/10">
            <CardContent className="pt-6">
                <div className="flex gap-3">
                    <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
                    <div className="space-y-2 text-sm">
                        <p className="font-semibold text-amber-900 dark:text-amber-100">
                            Important Disclaimer
                        </p>
                        <p className="text-amber-800 dark:text-amber-200">
                            No AI detector is 100% accurate. Results are indicative, not
                            definitive. Use this tool as one factor among many when
                            evaluating content authenticity.
                        </p>
                        <p className="text-xs text-amber-700 dark:text-amber-300">
                            Privacy: Your text is analyzed in-session only and is never stored.
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

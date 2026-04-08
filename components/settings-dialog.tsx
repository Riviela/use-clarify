'use client';

import { useState } from 'react';
import { User } from '@supabase/supabase-js';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';
import { Loader2, Save, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SettingsDialogProps {
    user: User;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function SettingsDialog({ user, open, onOpenChange }: SettingsDialogProps) {
    const supabase = createClient();
    const [displayName, setDisplayName] = useState(user.user_metadata?.display_name || '');
    const [email, setEmail] = useState(user.email || '');
    const [isLoading, setIsLoading] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    const handleDisplayNameChange = (value: string) => {
        setDisplayName(value);
        setHasChanges(value !== (user.user_metadata?.display_name || ''));
    };

    const handleEmailChange = (value: string) => {
        setEmail(value);
        setHasChanges(value !== (user.email || ''));
    };

    const handleSave = async () => {
        setIsLoading(true);

        try {
            // Update display name
            if (displayName !== (user.user_metadata?.display_name || '')) {
                const { error } = await supabase.auth.updateUser({
                    data: { display_name: displayName }
                });

                if (error) {
                    toast.error('Failed to update display name: ' + error.message);
                    setIsLoading(false);
                    return;
                }
            }

            // Update email
            if (email !== user.email) {
                const { error } = await supabase.auth.updateUser({ email });

                if (error) {
                    toast.error('Failed to update email: ' + error.message);
                    setIsLoading(false);
                    return;
                }

                toast.success('Email update initiated. Please check your new email for confirmation.');
            } else {
                toast.success('Settings saved successfully!');
            }

            setHasChanges(false);
            // Close dialog after a short delay
            setTimeout(() => {
                onOpenChange(false);
                window.location.reload(); // Refresh to show updated data
            }, 1000);
        } catch (error) {
            toast.error('An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    const isEmailChanged = email !== user.email;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-semibold">Settings</DialogTitle>
                    <DialogDescription className="text-zinc-500">
                        Manage your account preferences
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Display Name */}
                    <div className="space-y-2">
                        <Label htmlFor="displayName" className="text-sm font-medium">
                            Display Name
                        </Label>
                        <Input
                            id="displayName"
                            value={displayName}
                            onChange={(e) => handleDisplayNameChange(e.target.value)}
                            placeholder="Enter your display name"
                            className="h-11 rounded-lg border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                        />
                        <p className="text-xs text-zinc-400">
                            This is how you&apos;ll appear across the platform
                        </p>
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium">
                            Email Address
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => handleEmailChange(e.target.value)}
                            placeholder="Enter your email"
                            className="h-11 rounded-lg border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                        />
                        {isEmailChanged && (
                            <Alert className="mt-2 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
                                <AlertCircle className="h-4 w-4 text-amber-600" />
                                <AlertDescription className="text-xs text-amber-700 dark:text-amber-300">
                                    Changing your email requires confirmation. A verification link will be sent to your new address.
                                </AlertDescription>
                            </Alert>
                        )}
                    </div>

                    {/* Save Button */}
                    <Button
                        onClick={handleSave}
                        disabled={!hasChanges || isLoading}
                        className="w-full h-11 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-medium"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                Save Changes
                            </>
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

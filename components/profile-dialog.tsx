'use client';

import { User } from '@supabase/supabase-js';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Crown, Mail, Sparkles } from 'lucide-react';
import { useUpgrade } from '@/hooks/use-upgrade';

interface UserProfile {
    plan_type: string;
    full_name: string | null;
    avatar_url: string | null;
}

interface ProfileDialogProps {
    user: User;
    planType: string;
    userProfile?: UserProfile | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ProfileDialog({ user, planType, userProfile, open, onOpenChange }: ProfileDialogProps) {
    const isPremiumPlan = planType === 'premium';
    // Use database values or fallback to auth metadata
    const displayName = userProfile?.full_name || user.user_metadata?.full_name || user.user_metadata?.display_name || user.email?.split('@')[0] || 'User';
    const initials = displayName.slice(0, 2).toUpperCase();
    const avatarUrl = userProfile?.avatar_url || user.user_metadata?.avatar_url;
    const { handleUpgrade } = useUpgrade();

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader className="text-center">
                    <DialogTitle className="text-2xl font-semibold">Profile</DialogTitle>
                    <DialogDescription className="text-zinc-500">
                        Your account details and subscription status
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col items-center space-y-6 py-6">
                    {/* Avatar */}
                    <div className="relative">
                        <Avatar className="h-24 w-24 ring-4 ring-zinc-100 dark:ring-zinc-800">
                            <AvatarImage src={avatarUrl || undefined} />
                            <AvatarFallback className="bg-cyan-100 dark:bg-cyan-900 text-cyan-600 dark:text-cyan-300 text-2xl font-semibold">
                                {initials}
                            </AvatarFallback>
                        </Avatar>
                        {isPremiumPlan && (
                            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 rounded-full flex items-center justify-center shadow-lg">
                                <Crown className="h-4 w-4 text-white" />
                            </div>
                        )}
                    </div>

                    {/* User Info */}
                    <div className="text-center space-y-1">
                        <h3 className="text-xl font-semibold text-zinc-900 dark:text-white">
                            {displayName}
                        </h3>
                        <div className="flex items-center justify-center gap-2 text-zinc-500">
                            <Mail className="h-4 w-4" />
                            <span className="text-sm">{user.email}</span>
                        </div>
                    </div>

                    {/* Plan Status */}
                    <div className="w-full p-4 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Sparkles className="h-5 w-5 text-cyan-400" />
                                <span className="font-medium text-zinc-900 dark:text-white">Current Plan</span>
                            </div>
                            {isPremiumPlan ? (
                                <Badge className="bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-white border-0 font-semibold">
                                    <Crown className="h-3 w-3 mr-1" />
                                    Premium
                                </Badge>
                            ) : (
                                <Badge variant="outline" className="text-zinc-600 dark:text-zinc-400">
                                    Free
                                </Badge>
                            )}
                        </div>
                        
                        {!isPremiumPlan && (
                            <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                                <p className="text-sm text-zinc-500 mb-3">
                                    Unlock all features with Clarify Pro
                                </p>
                                <Button 
                                    className="w-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-600 hover:via-yellow-500 hover:to-amber-600 text-white font-semibold"
                                    onClick={handleUpgrade}
                                >
                                    <Crown className="h-4 w-4 mr-2" />
                                    Upgrade to Pro
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

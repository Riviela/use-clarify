'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { UserCircle, LogOut, ChevronDown, Settings, Crown, Shield } from 'lucide-react';
import Image from 'next/image';
import { LanguageSwitcher } from '@/components/language-switcher';
import { useTranslation } from '@/components/language-provider';

interface UserProfile {
    plan_type: string;
    full_name: string | null;
    avatar_url: string | null;
    is_admin?: boolean;
}

interface NavbarProps {
    user: User | null;
    userProfile?: UserProfile | null;
}


export function Navbar({ user, userProfile }: NavbarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const supabase = createClient();
    const { t } = useTranslation();

    const navLinks = [
        { href: '/', label: t('navbar.detector') },
        { href: '/grammar', label: t('navbar.grammar') },
        { href: '/summarizer', label: t('navbar.summarizer') },
        { href: '/expander', label: t('navbar.expander') },
        { href: '/tone', label: t('navbar.tone') },
        { href: '/hallucination', label: t('navbar.hallucination') },
        { href: '/paraphraser', label: t('navbar.paraphraser') },
        { href: '/humanizer', label: t('navbar.humanizer') },
        { href: '/pricing', label: t('navbar.pricing') },
    ];

    // Derive premium status from plan_type
    const planType = userProfile?.plan_type ?? 'free';
    const isPremiumPlan = planType === 'premium';
    const isAdmin = userProfile?.is_admin === true;

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push('/');
        router.refresh();
    };

    return (
        <>
            <motion.header 
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="sticky top-0 z-50 w-full border-b border-zinc-100 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl"
            >
                <div className="container mx-auto px-4">
                    <div className="flex h-16 items-center justify-between">
                        {/* Logo */}
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            <Link href="/" className="flex items-center gap-2">
                                <Image
                                    src="/clarify.png"
                                    alt="Clarify"
                                    width={120}
                                    height={32}
                                    className="h-7 w-auto dark:invert"
                                    priority
                                />
                            </Link>
                        </motion.div>

                        {/* Navigation */}
                        <nav className="hidden md:flex items-center gap-1 relative">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`relative px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                                        pathname === link.href
                                            ? 'text-zinc-900 dark:text-white'
                                            : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-900'
                                    }`}
                                >
                                    {pathname === link.href && (
                                        <motion.div
                                            layoutId="activeTab"
                                            className="absolute inset-0 bg-zinc-100 dark:bg-zinc-800 rounded-lg"
                                            transition={{
                                                type: 'spring',
                                                stiffness: 380,
                                                damping: 30,
                                            }}
                                        />
                                    )}
                                    <span className="relative z-10">{link.label}</span>
                                </Link>
                            ))}
                        </nav>

                        {/* Auth Section */}
                        <div className="flex items-center gap-2">
                            <LanguageSwitcher />
                            <AnimatePresence mode="wait">
                                {user ? (
                                    <motion.div
                                        key="authenticated"
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ duration: 0.2 }}
                                        className="flex items-center gap-2"
                                    >
                                        {/* Admin Badge */}
                                        {isAdmin && (
                                            <motion.div
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.1 }}
                                            >
                                                <Link href="/admin">
                                                    <Badge
                                                        className="hidden sm:flex items-center gap-1 bg-[#B60000] text-white border-0 font-bold text-xs px-3 py-1 shadow-lg shadow-[#B60000]/40 cursor-pointer hover:bg-[#9a0000] hover:shadow-[#B60000]/60 transition-all"
                                                    >
                                                        <motion.div
                                                            animate={{ rotate: [0, 360] }}
                                                            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                                                        >
                                                            <Shield className="h-3 w-3" />
                                                        </motion.div>
                                                        {t('common.admin')}
                                                    </Badge>
                                                </Link>
                                            </motion.div>
                                        )}

                                        {/* Premium Badge */}
                                        {isPremiumPlan && !isAdmin && (
                                            <motion.div
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.1 }}
                                            >
                                                <Badge 
                                                    className="hidden sm:flex items-center gap-1 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-white border-0 font-semibold text-xs px-3 py-1 shadow-lg shadow-amber-500/20"
                                                >
                                                    <motion.div
                                                        animate={{ rotate: [0, 10, -10, 0] }}
                                                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                                                    >
                                                        <Crown className="h-3 w-3" />
                                                    </motion.div>
                                                    PREMIUM
                                                </Badge>
                                            </motion.div>
                                        )}
                                        
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                                    <Button
                                                        variant="ghost"
                                                        className="flex items-center gap-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                                                    >
                                                        <UserCircle className="h-5 w-5" />
                                                        <span className="hidden sm:inline max-w-[120px] truncate">
                                                            {user.user_metadata?.display_name || user.email?.split('@')[0]}
                                                        </span>
                                                        <ChevronDown className="h-4 w-4" />
                                                    </Button>
                                                </motion.div>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-56">
                                                <div className="px-2 py-1.5">
                                                    <p className="text-sm font-medium text-zinc-900 dark:text-white">
                                                        {user.user_metadata?.display_name || 'User'}
                                                    </p>
                                                    <p className="text-xs text-zinc-500 truncate">
                                                        {user.email}
                                                    </p>
                                                    {isAdmin && (
                                                        <Badge
                                                            className="mt-1.5 flex sm:hidden w-fit items-center gap-1 bg-[#B60000] text-white border-0 font-bold text-[10px] px-2 py-0.5"
                                                        >
                                                            <Shield className="h-2.5 w-2.5" />
                                                            {t('common.admin')}
                                                        </Badge>
                                                    )}
                                                    {isPremiumPlan && !isAdmin && (
                                                        <Badge 
                                                            className="mt-1.5 flex sm:hidden w-fit items-center gap-1 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-white border-0 font-semibold text-[10px] px-2 py-0.5"
                                                        >
                                                            <Crown className="h-2.5 w-2.5" />
                                                            PREMIUM
                                                        </Badge>
                                                    )}
                                                </div>
                                                <DropdownMenuSeparator />
                                                {isAdmin && (
                                                    <>
                                                        <DropdownMenuItem
                                                            onClick={() => router.push('/admin')}
                                                            className="cursor-pointer text-[#B60000] dark:text-red-400 focus:text-[#9a0000] dark:focus:text-red-300 font-semibold"
                                                        >
                                                            <Shield className="mr-2 h-4 w-4" />
                                                            {t('navbar.adminConsole')}
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                    </>
                                                )}
                                                <DropdownMenuItem
                                                    onClick={() => router.push('/settings')}
                                                    className="cursor-pointer"
                                                >
                                                    <UserCircle className="mr-2 h-4 w-4" />
                                                    {t('navbar.profile')}
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => router.push('/settings')}
                                                    className="cursor-pointer"
                                                >
                                                    <Settings className="mr-2 h-4 w-4" />
                                                    {t('navbar.settings')}
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    onClick={handleSignOut}
                                                    className="text-red-600 cursor-pointer"
                                                >
                                                    <LogOut className="mr-2 h-4 w-4" />
                                                    {t('common.signOut')}
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="guest"
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ duration: 0.2 }}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <Button
                                            asChild
                                            variant="default"
                                            className="bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 rounded-lg"
                                        >
                                            <Link href="/login">{t('common.signIn')}</Link>
                                        </Button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Mobile Navigation */}
                    <nav className="md:hidden flex items-center gap-1 overflow-x-auto pb-3 -mx-4 px-4 scrollbar-hide relative">
                        {navLinks.map((link, index) => (
                            <motion.div
                                key={link.href}
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <Link
                                    href={link.href}
                                    className={`relative px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                                        pathname === link.href
                                            ? 'text-zinc-900 dark:text-white'
                                            : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-900'
                                    }`}
                                >
                                    {pathname === link.href && (
                                        <motion.div
                                            layoutId="activeTabMobile"
                                            className="absolute inset-0 bg-zinc-100 dark:bg-zinc-800 rounded-lg"
                                            transition={{
                                                type: 'spring',
                                                stiffness: 380,
                                                damping: 30,
                                            }}
                                        />
                                    )}
                                    <span className="relative z-10">{link.label}</span>
                                </Link>
                            </motion.div>
                        ))}
                    </nav>
                </div>
            </motion.header>

        </>
    );
}

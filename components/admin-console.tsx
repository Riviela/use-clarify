'use client';

import { motion } from 'framer-motion';
import { Shield, Users, Crown, Activity, Server, Database, Zap, TerminalSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AdminStats {
  totalUsers: number;
  premiumUsers: number;
  adminUsers: number;
}

interface AdminConsoleProps {
  adminEmail: string;
  adminName: string;
  stats: AdminStats;
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  accent: string;
  delay?: number;
}

function StatCard({ icon, label, value, accent, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
    >
      <Card className="relative overflow-hidden border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 backdrop-blur">
        <div className={`absolute inset-x-0 top-0 h-0.5 ${accent}`} />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
            {label}
          </CardTitle>
          <div className="text-zinc-400 dark:text-zinc-500">{icon}</div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-zinc-900 dark:text-white tabular-nums">
            {value}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function SystemRow({ label, status, value }: { label: string; status: 'ok' | 'warn' | 'err'; value: string }) {
  const dot = {
    ok: 'bg-emerald-500 shadow-emerald-500/50',
    warn: 'bg-amber-500 shadow-amber-500/50',
    err: 'bg-red-500 shadow-red-500/50',
  }[status];

  return (
    <div className="flex items-center justify-between py-3 border-b border-zinc-100 dark:border-zinc-800 last:border-0">
      <div className="flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full ${dot} shadow-lg animate-pulse`} />
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{label}</span>
      </div>
      <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400">{value}</span>
    </div>
  );
}

export function AdminConsole({ adminEmail, adminName, stats }: AdminConsoleProps) {
  return (
    <div className="relative min-h-[80vh]">
      {/* Background grid effect */}
      <div className="absolute inset-0 -z-10 opacity-50 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(182,0,0,0.10)_1px,transparent_1px),linear-gradient(to_bottom,rgba(182,0,0,0.10)_1px,transparent_1px)] bg-[size:48px_48px]" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#B60000]/10 via-transparent to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          <div className="flex items-center gap-3 mb-3">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              className="relative"
            >
              <Shield className="w-7 h-7 text-[#B60000]" strokeWidth={2.5} />
              <div className="absolute inset-0 blur-xl bg-[#B60000]/50" />
            </motion.div>
            <Badge className="bg-[#B60000] text-white border-0 font-bold tracking-widest text-[10px] px-2.5 py-0.5 shadow-lg shadow-[#B60000]/50">
              ADMIN
            </Badge>
            <span className="font-mono text-xs text-zinc-400 dark:text-zinc-600 tracking-widest">
              CLEARANCE: ROOT
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Admin <span className="bg-gradient-to-r from-[#B60000] via-[#ff3333] to-[#B60000] bg-clip-text text-transparent">Console</span>
          </h1>

          <p className="mt-2 text-zinc-500 dark:text-zinc-400 font-mono text-sm">
            <span className="text-[#B60000]">$</span> logged_in_as: <span className="text-zinc-700 dark:text-zinc-300">{adminName}</span>{' '}
            <span className="text-zinc-400 dark:text-zinc-600">&lt;{adminEmail}&gt;</span>
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            icon={<Users className="w-4 h-4" />}
            label="Total Users"
            value={stats.totalUsers}
            accent="bg-gradient-to-r from-[#B60000] via-red-400 to-transparent"
            delay={0.1}
          />
          <StatCard
            icon={<Crown className="w-4 h-4" />}
            label="Premium Users"
            value={stats.premiumUsers}
            accent="bg-gradient-to-r from-amber-500 via-amber-400 to-transparent"
            delay={0.2}
          />
          <StatCard
            icon={<Shield className="w-4 h-4" />}
            label="Admins"
            value={stats.adminUsers}
            accent="bg-gradient-to-r from-emerald-500 via-emerald-400 to-transparent"
            delay={0.3}
          />
        </div>

        {/* Two-column section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* System Status */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Server className="w-4 h-4 text-[#B60000]" />
                  System Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SystemRow label="Auth (Supabase)" status="ok" value="OPERATIONAL" />
                <SystemRow label="Database (Postgres)" status="ok" value="OPERATIONAL" />
                <SystemRow label="AI (Groq)" status="ok" value="OPERATIONAL" />
                <SystemRow label="Payments (Lemon Squeezy)" status="ok" value="LIVE MODE" />
                <SystemRow label="Webhook Listener" status="ok" value="LISTENING" />
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 backdrop-blur h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <TerminalSquare className="w-4 h-4 text-[#B60000]" />
                  Quick Links
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <a
                  href="https://supabase.com/dashboard/project/yvwwrkahqbxvrifqexeg"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:border-[#B60000]/50 hover:bg-[#B60000]/5 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <Database className="w-4 h-4 text-[#B60000]" />
                    <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Supabase Dashboard</span>
                  </div>
                  <span className="text-xs text-zinc-400 group-hover:text-[#B60000] transition-colors">↗</span>
                </a>
                <a
                  href="https://app.lemonsqueezy.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:border-[#B60000]/50 hover:bg-[#B60000]/5 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <Zap className="w-4 h-4 text-[#B60000]" />
                    <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Lemon Squeezy</span>
                  </div>
                  <span className="text-xs text-zinc-400 group-hover:text-[#B60000] transition-colors">↗</span>
                </a>
                <a
                  href="https://console.groq.com/playground"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:border-[#B60000]/50 hover:bg-[#B60000]/5 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <Activity className="w-4 h-4 text-[#B60000]" />
                    <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Groq Console</span>
                  </div>
                  <span className="text-xs text-zinc-400 group-hover:text-[#B60000] transition-colors">↗</span>
                </a>
                <a
                  href="https://vercel.com/dashboard"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:border-[#B60000]/50 hover:bg-[#B60000]/5 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <Server className="w-4 h-4 text-[#B60000]" />
                    <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Vercel Dashboard</span>
                  </div>
                  <span className="text-xs text-zinc-400 group-hover:text-[#B60000] transition-colors">↗</span>
                </a>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Footer notice */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="border-t border-zinc-200 dark:border-zinc-800 pt-4 mt-8"
        >
          <p className="text-xs font-mono text-zinc-400 dark:text-zinc-600 text-center">
            <span className="text-[#B60000]">●</span> SECURE_SESSION  ·  Restricted access  ·  All actions logged
          </p>
        </motion.div>
      </div>
    </div>
  );
}

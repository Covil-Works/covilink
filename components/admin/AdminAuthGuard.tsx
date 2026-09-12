'use client';

import React from 'react';
import { useAuth } from '@/lib/auth-client';
import AdminLoginForm from './AdminLoginForm';
import { ShieldCheck, Loader2 } from 'lucide-react';

interface AdminAuthGuardProps {
  children: React.ReactNode;
}

export default function AdminAuthGuard({ children }: AdminAuthGuardProps) {
  const { user, loading } = useAuth();

  // 1. Loading state with strict anti-white screen prevention
  if (loading) {
    return (
      <div className="min-h-screen w-full bg-[#08090d] text-gray-100 flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4 animate-in fade-in duration-300">
          <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#ff3b94]/20 to-[#9333ea]/20 border border-white/10 shadow-xl shadow-black/80">
            <ShieldCheck className="w-8 h-8 text-[#ff3b94] animate-pulse" />
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-gray-400">
            <Loader2 className="w-4 h-4 animate-spin text-[#ff3b94]" />
            <span>Autenticando...</span>
          </div>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated state: show Firebase Admin Login
  if (!user) {
    return <AdminLoginForm />;
  }

  // 3. Authenticated: render protected admin dashboard
  return <>{children}</>;
}

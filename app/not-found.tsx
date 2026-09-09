import React from 'react';
import Link from 'next/link';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#08090d] text-white flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full p-8 rounded-3xl bg-[#12141c] border border-white/10 shadow-2xl flex flex-col items-center">
        <div className="text-4xl font-black text-brand-pink mb-2">404</div>
        <h2 className="text-lg font-bold text-white mb-2">Página não encontrada</h2>
        <p className="text-xs text-gray-400 mb-6">
          O link solicitado não existe ou foi movido.
        </p>
        <Link
          href="/"
          className="py-3 px-6 rounded-xl bg-gradient-to-r from-brand-pink to-brand-purple text-white font-bold text-xs hover:opacity-90 flex items-center gap-2 transition shadow-lg"
        >
          <Home className="w-4 h-4" />
          <span>Voltar ao Portal de Links</span>
        </Link>
      </div>
    </div>
  );
}

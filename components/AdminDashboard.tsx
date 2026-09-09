'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  BarChart3,
  TrendingUp,
  Users,
  MousePointerClick,
  Smartphone,
  Monitor,
  Tablet,
  Database,
  RefreshCw,
  Eye,
  CheckCircle2,
  ArrowLeft,
  Layers,
  Sparkles,
  RotateCcw,
  Zap,
  Globe,
  Plus,
  Trash2,
  Save,
  ArrowUp,
  ArrowDown,
  Instagram,
  Twitter,
  Youtube,
  Linkedin,
  Music,
  Video,
  Github,
  Facebook,
  Tv,
  AtSign,
  MessageCircle,
  ExternalLink,
  FileCode,
  Check
} from 'lucide-react';
import { AnalyticsSummary } from '@/lib/analytics';
import { INITIAL_LINKS, LinkItem, SocialLink, INITIAL_PROFILE } from '@/lib/links-config';

type TabType = 'metrics' | 'socials' | 'layout';

const PLATFORM_OPTIONS: { label: string; value: SocialLink['platform'] }[] = [
  { label: 'Instagram', value: 'instagram' },
  { label: 'YouTube', value: 'youtube' },
  { label: 'X (Twitter)', value: 'twitter' },
  { label: 'LinkedIn', value: 'linkedin' },
  { label: 'Spotify', value: 'spotify' },
  { label: 'TikTok', value: 'tiktok' },
  { label: 'WhatsApp', value: 'whatsapp' },
  { label: 'GitHub', value: 'github' },
  { label: 'Facebook', value: 'facebook' },
  { label: 'Twitch', value: 'twitch' },
  { label: 'Threads', value: 'threads' },
  { label: 'Website / Link', value: 'website' },
  { label: 'Outro', value: 'other' },
];

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('metrics');
  const [linksList, setLinksList] = useState<LinkItem[]>(INITIAL_LINKS);
  const [socialsList, setSocialsList] = useState<SocialLink[]>([]);
  const [savingSocials, setSavingSocials] = useState(false);
  const [socialsSaveSuccess, setSocialsSaveSuccess] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  // Fetch metrics from analytics API
  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/metrics');
      const data = await res.json();
      setMetrics(data);
    } catch (err) {
      console.error('Error fetching metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch socials configuration stored in local JSON file
  const fetchSocials = async () => {
    try {
      const res = await fetch('/api/socials');
      const data = await res.json();
      if (data && Array.isArray(data.socials)) {
        setSocialsList(data.socials);
      }
    } catch (err) {
      console.error('Error fetching socials:', err);
    }
  };

  useEffect(() => {
    fetchMetrics();
    fetchSocials();
    const interval = setInterval(fetchMetrics, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleResetMetrics = async () => {
    if (!confirm('Deseja reiniciar todas as métricas para o estado de teste original?')) return;
    try {
      const res = await fetch('/api/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset' }),
      });
      const data = await res.json();
      if (data.metrics) {
        setMetrics(data.metrics);
        setResetSuccess(true);
        setTimeout(() => setResetSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Error resetting analytics:', err);
    }
  };

  const handleSaveSocials = async () => {
    setSavingSocials(true);
    try {
      const res = await fetch('/api/socials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ socials: socialsList }),
      });
      const data = await res.json();
      if (data && Array.isArray(data.socials)) {
        setSocialsList(data.socials);
        setSocialsSaveSuccess(true);
        setTimeout(() => setSocialsSaveSuccess(false), 3500);
      }
    } catch (err) {
      console.error('Error saving socials JSON:', err);
      alert('Erro ao salvar as redes sociais no arquivo JSON.');
    } finally {
      setSavingSocials(false);
    }
  };

  const handleResetSocials = async () => {
    if (!confirm('Restaurar as redes sociais originais no arquivo JSON?')) return;
    try {
      const res = await fetch('/api/socials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset' }),
      });
      const data = await res.json();
      if (data.socials) {
        setSocialsList(data.socials);
        setSocialsSaveSuccess(true);
        setTimeout(() => setSocialsSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Error resetting socials:', err);
    }
  };

  const toggleLinkActive = (id: string) => {
    setLinksList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, active: !item.active } : item))
    );
  };

  const toggleSocialActive = (id: string) => {
    setSocialsList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, active: item.active === false ? true : false } : item))
    );
  };

  const updateSocialItem = (id: string, key: keyof SocialLink, value: any) => {
    setSocialsList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [key]: value } : item))
    );
  };

  const removeSocialItem = (id: string) => {
    setSocialsList((prev) => prev.filter((item) => item.id !== id));
  };

  const moveSocialItem = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= socialsList.length) return;
    const updated = [...socialsList];
    const [moved] = updated.splice(index, 1);
    updated.splice(newIndex, 0, moved);
    setSocialsList(updated);
  };

  const addSocialItem = (presetPlatform?: SocialLink['platform']) => {
    const platform = presetPlatform || 'instagram';
    const titleMap: Record<string, string> = {
      instagram: 'Instagram',
      youtube: 'YouTube',
      twitter: 'X (Twitter)',
      linkedin: 'LinkedIn',
      spotify: 'Spotify',
      tiktok: 'TikTok',
      whatsapp: 'WhatsApp',
      github: 'GitHub',
      facebook: 'Facebook',
      twitch: 'Twitch',
      threads: 'Threads',
      website: 'Website Oficial',
      other: 'Nova Rede',
    };
    const urlMap: Record<string, string> = {
      instagram: 'https://instagram.com/seu_usuario',
      youtube: 'https://youtube.com/@seu_canal',
      twitter: 'https://x.com/seu_usuario',
      linkedin: 'https://linkedin.com/in/seu_perfil',
      spotify: 'https://open.spotify.com/user/seu_id',
      tiktok: 'https://tiktok.com/@seu_usuario',
      whatsapp: 'https://wa.me/5511999999999',
      github: 'https://github.com/seu_usuario',
      facebook: 'https://facebook.com/sua_pagina',
      twitch: 'https://twitch.tv/seu_canal',
      threads: 'https://threads.net/@seu_usuario',
      website: 'https://seuwebsite.com',
      other: 'https://link.com',
    };

    const newItem: SocialLink = {
      id: `soc-${Date.now()}`,
      platform: platform,
      title: titleMap[platform] || 'Nova Rede',
      url: urlMap[platform] || 'https://',
      active: true,
    };
    setSocialsList((prev) => [...prev, newItem]);
  };

  const getSocialIconComponent = (platform: string) => {
    switch (platform) {
      case 'instagram':
        return <Instagram className="w-5 h-5 text-pink-400" />;
      case 'twitter':
        return <Twitter className="w-5 h-5 text-sky-400" />;
      case 'youtube':
        return <Youtube className="w-5 h-5 text-red-500" />;
      case 'linkedin':
        return <Linkedin className="w-5 h-5 text-blue-500" />;
      case 'spotify':
        return <Music className="w-5 h-5 text-emerald-400" />;
      case 'tiktok':
        return <Video className="w-5 h-5 text-purple-400" />;
      case 'github':
        return <Github className="w-5 h-5 text-gray-200" />;
      case 'facebook':
        return <Facebook className="w-5 h-5 text-blue-600" />;
      case 'whatsapp':
        return <MessageCircle className="w-5 h-5 text-green-400" />;
      case 'twitch':
        return <Tv className="w-5 h-5 text-purple-400" />;
      case 'threads':
        return <AtSign className="w-5 h-5 text-gray-300" />;
      case 'website':
        return <Globe className="w-5 h-5 text-cyan-400" />;
      default:
        return <ExternalLink className="w-5 h-5 text-gray-300" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#08090d] text-white font-sans selection:bg-brand-purple/30 flex flex-col md:flex-row pb-24 md:pb-0">
      
      {/* Desktop Lateral Sidebar Menu */}
      <aside className="hidden md:flex w-64 border-r border-white/10 p-6 flex-col justify-between bg-[#0b0c13] shrink-0 sticky top-0 h-screen z-30">
        <div className="space-y-6">
          
          {/* Logo & Portal Header */}
          <div className="flex items-center gap-3 pb-4 border-b border-white/10">
            <Link
              href="/"
              className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 flex items-center justify-center text-gray-300 hover:text-white transition"
              title="Voltar ao site público"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h2 className="text-base font-bold tracking-tight text-white">Covilink Admin</h2>
              <span className="text-[10px] text-brand-pink font-semibold bg-brand-pink/10 border border-brand-pink/20 px-2 py-0.5 rounded-full">
                Portal Management
              </span>
            </div>
          </div>

          {/* Navigation Menu Links */}
          <nav className="space-y-1.5">
            <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider px-3 mb-2">
              Menu de Navegação
            </p>

            <button
              onClick={() => setActiveTab('metrics')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition text-left ${
                activeTab === 'metrics'
                  ? 'bg-brand-purple/20 text-white border border-brand-purple/40 shadow-glow-purple'
                  : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <BarChart3 className={`w-4 h-4 ${activeTab === 'metrics' ? 'text-brand-purple' : ''}`} />
              <span>Métricas & Analytics</span>
            </button>

            <button
              onClick={() => setActiveTab('socials')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition text-left ${
                activeTab === 'socials'
                  ? 'bg-brand-pink/20 text-white border border-brand-pink/40 shadow-glow-pink'
                  : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <Globe className={`w-4 h-4 ${activeTab === 'socials' ? 'text-brand-pink' : ''}`} />
              <span>Redes Sociais (JSON)</span>
            </button>

            <button
              onClick={() => setActiveTab('layout')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition text-left ${
                activeTab === 'layout'
                  ? 'bg-brand-cyan/20 text-white border border-brand-cyan/40'
                  : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <Layers className={`w-4 h-4 ${activeTab === 'layout' ? 'text-brand-cyan' : ''}`} />
              <span>Gerenciador de Links</span>
            </button>
          </nav>

        </div>

        {/* Sidebar Footer Info */}
        <div className="pt-4 border-t border-white/10 space-y-3">
          <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-[11px] space-y-1">
            <div className="flex items-center gap-1.5 text-green-400 font-semibold">
              <FileCode className="w-3.5 h-3.5" />
              <span>Config em JSON Rápido</span>
            </div>
            <p className="text-[10px] text-gray-400">
              Redes salvas em <code className="text-gray-300">data/socials.json</code> com 0ms de busca de banco!
            </p>
          </div>

          <Link
            href="/"
            target="_blank"
            className="w-full py-2.5 px-3 rounded-xl bg-white text-dark-900 font-bold text-xs hover:bg-gray-200 flex items-center justify-center gap-1.5 shadow-lg transition"
          >
            <Eye className="w-4 h-4" />
            <span>Ver Portal ao Vivo</span>
          </Link>
        </div>
      </aside>

      {/* Floating Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-4 left-4 right-4 z-50 bg-[#0f111a]/95 backdrop-blur-xl border border-white/15 rounded-2xl shadow-2xl p-2 flex items-center justify-around">
        <button
          onClick={() => setActiveTab('metrics')}
          className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl text-[11px] font-bold transition ${
            activeTab === 'metrics'
              ? 'bg-brand-purple/20 text-brand-purple border border-brand-purple/30'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <BarChart3 className="w-5 h-5" />
          <span>Métricas</span>
        </button>

        <button
          onClick={() => setActiveTab('socials')}
          className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl text-[11px] font-bold transition ${
            activeTab === 'socials'
              ? 'bg-brand-pink/20 text-brand-pink border border-brand-pink/30'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Globe className="w-5 h-5" />
          <span>Redes Sociais</span>
        </button>

        <button
          onClick={() => setActiveTab('layout')}
          className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl text-[11px] font-bold transition ${
            activeTab === 'layout'
              ? 'bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Layers className="w-5 h-5" />
          <span>Links</span>
        </button>
      </nav>

      {/* Main Content Area */}
      <div className="flex-1 p-4 sm:p-6 md:p-8 max-w-6xl mx-auto w-full">
        
        {/* Top Header Mobile / Quick Bar */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="md:hidden w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-300"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">
                {activeTab === 'metrics' && 'Métricas & Analytics'}
                {activeTab === 'socials' && 'Gerenciador de Redes Sociais'}
                {activeTab === 'layout' && 'Gerenciador de Links & Mídias'}
              </h1>
              <p className="text-xs text-gray-400 mt-0.5">
                Painel de controle para {INITIAL_PROFILE.name} ({INITIAL_PROFILE.handle})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {activeTab === 'metrics' && (
              <button
                onClick={fetchMetrics}
                disabled={loading}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-gray-300 hover:text-white flex items-center gap-2 transition disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Atualizar</span>
              </button>
            )}

            {activeTab === 'socials' && (
              <button
                onClick={handleSaveSocials}
                disabled={savingSocials}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-brand-pink to-brand-purple text-white font-bold text-xs hover:opacity-90 flex items-center gap-1.5 shadow-lg shadow-pink-500/20 transition disabled:opacity-50"
              >
                {savingSocials ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>Salvar no JSON</span>
              </button>
            )}

            <Link
              href="/"
              target="_blank"
              className="md:hidden px-3 py-1.5 rounded-xl bg-white text-dark-900 font-bold text-xs hover:bg-gray-200 flex items-center gap-1.5 shadow-md transition"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Ver Site</span>
            </Link>
          </div>
        </header>

        {/* Banner Database status */}
        <div className="rounded-2xl p-4 bg-dark-800/90 border border-amber-500/30 backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl mb-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 mt-0.5">
              <Database className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-amber-200">
                  {metrics?.isDatabaseConnected
                    ? 'Conectado ao Neon PostgreSQL (Produção)'
                    : 'Configuração Rápida em JSON & Métricas em Memória'}
                </h3>
                <span className="bg-amber-400/20 text-amber-300 text-[10px] font-semibold px-2 py-0.5 rounded-md">
                  {metrics?.isDatabaseConnected ? 'Neon DB Ativo' : '0ms Latência DB'}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-1 max-w-2xl leading-relaxed">
                As redes sociais são salvas e lidas diretamente de arquivos de configuração (<code className="text-amber-300 bg-black/40 px-1 py-0.5 rounded">data/socials.json</code>) para velocidade máxima instantânea.
              </p>
            </div>
          </div>

          {activeTab === 'metrics' && (
            <button
              onClick={handleResetMetrics}
              className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-medium flex items-center gap-1.5 transition shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Resetar Métricas</span>
            </button>
          )}
        </div>

        {resetSuccess && (
          <div className="mb-6 bg-green-500/20 border border-green-500/40 text-green-200 text-xs px-4 py-2.5 rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-400" />
            <span>Métricas restauradas com sucesso!</span>
          </div>
        )}

        {socialsSaveSuccess && (
          <div className="mb-6 bg-green-500/20 border border-green-500/40 text-green-200 text-xs px-4 py-2.5 rounded-xl flex items-center gap-2">
            <Check className="w-4 h-4 text-green-400" />
            <span>Redes sociais salvas no arquivo JSON (<code className="text-green-300 font-mono">data/socials.json</code>) com sucesso!</span>
          </div>
        )}

        {/* TAB 1: METRICS */}
        {activeTab === 'metrics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              <div className="glass-card rounded-2xl p-5 border border-white/10 relative overflow-hidden">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total de Cliques</span>
                  <div className="w-9 h-9 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center">
                    <MousePointerClick className="w-4 h-4 text-pink-400" />
                  </div>
                </div>
                <div className="text-3xl font-black text-white tracking-tight">
                  {loading ? '...' : metrics?.totalClicks || 0}
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-pink-400 font-semibold mt-2">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>+24.5% vs semana anterior</span>
                </div>
              </div>

              <div className="glass-card rounded-2xl p-5 border border-white/10 relative overflow-hidden">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Visitantes Únicos</span>
                  <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                    <Users className="w-4 h-4 text-purple-400" />
                  </div>
                </div>
                <div className="text-3xl font-black text-white tracking-tight">
                  {loading ? '...' : metrics?.uniqueVisitors || 0}
                </div>
                <div className="text-[11px] text-gray-400 mt-2">
                  Est. baseada em sessão & IP
                </div>
              </div>

              <div className="glass-card rounded-2xl p-5 border border-white/10 relative overflow-hidden">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Top Link Clicado</span>
                  <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                    <Zap className="w-4 h-4 text-cyan-400" />
                  </div>
                </div>
                <div className="text-sm font-bold text-cyan-300 truncate">
                  {loading ? '...' : metrics?.topPerformingLink?.title || 'Nenhum ainda'}
                </div>
                <div className="text-xs font-semibold text-gray-400 mt-1">
                  {metrics?.topPerformingLink ? `${metrics.topPerformingLink.clicks} cliques acumulados` : '-'}
                </div>
              </div>

              <div className="glass-card rounded-2xl p-5 border border-white/10 relative overflow-hidden">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Taxa de Engajamento</span>
                  <div className="w-9 h-9 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                  </div>
                </div>
                <div className="text-3xl font-black text-white tracking-tight">
                  84.2%
                </div>
                <div className="text-[11px] text-green-400 font-semibold mt-2">
                  Alta taxa de conversão visual
                </div>
              </div>

            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              <div className="lg:col-span-2 glass-card rounded-2xl p-6 border border-white/10">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="text-base font-bold text-white">Detalhamento de Cliques por Link</h3>
                    <p className="text-xs text-gray-400">Contagem de cliques individuais para cada botão e card de mídia</p>
                  </div>
                  <span className="text-xs font-semibold text-brand-purple bg-brand-purple/10 px-2.5 py-1 rounded-full border border-brand-purple/20">
                    {metrics ? Object.keys(metrics.clicksByLink).length : 0} links rastreados
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/10 text-gray-400 font-semibold uppercase tracking-wider">
                        <th className="pb-3">Link / Mídia</th>
                        <th className="pb-3 text-center">Cliques</th>
                        <th className="pb-3 text-right">Participação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {metrics && Object.values(metrics.clicksByLink).length > 0 ? (
                        Object.values(metrics.clicksByLink)
                          .sort((a, b) => b.clicks - a.clicks)
                          .map((item) => {
                            const percent = metrics.totalClicks > 0
                              ? Math.round((item.clicks / metrics.totalClicks) * 100)
                              : 0;

                            return (
                              <tr key={item.id} className="hover:bg-white/5 transition">
                                <td className="py-3 pr-2">
                                  <div className="font-semibold text-white truncate max-w-xs">{item.title}</div>
                                  <div className="text-[10px] text-gray-500 truncate max-w-xs">{item.url}</div>
                                </td>
                                <td className="py-3 px-2 text-center font-bold text-brand-pink">
                                  {item.clicks}
                                </td>
                                <td className="py-3 pl-2 text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    <div className="w-16 h-1.5 bg-dark-700 rounded-full overflow-hidden">
                                      <div
                                        className="h-full bg-gradient-to-r from-brand-pink to-brand-purple rounded-full"
                                        style={{ width: `${percent}%` }}
                                      />
                                    </div>
                                    <span className="font-mono text-gray-300 w-8">{percent}%</span>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                      ) : (
                        <tr>
                          <td colSpan={3} className="py-6 text-center text-gray-500">
                            Nenhum clique registrado ainda. Clique nos botões para testar!
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="space-y-6">
                <div className="glass-card rounded-2xl p-6 border border-white/10">
                  <h3 className="text-base font-bold text-white mb-1">Origem por Dispositivo</h3>
                  <p className="text-xs text-gray-400 mb-4">Dispositivos usados pelos visitantes</p>

                  {metrics && (
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-xs mb-1 font-semibold">
                          <span className="flex items-center gap-1.5 text-gray-300">
                            <Smartphone className="w-4 h-4 text-brand-pink" /> Mobile (Smartphone)
                          </span>
                          <span className="text-brand-pink font-bold">
                            {metrics.totalClicks > 0
                              ? Math.round((metrics.deviceBreakdown.mobile / metrics.totalClicks) * 100)
                              : 0}%
                          </span>
                        </div>
                        <div className="w-full h-2 bg-dark-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-brand-pink rounded-full transition-all"
                            style={{
                              width: `${
                                metrics.totalClicks > 0
                                  ? (metrics.deviceBreakdown.mobile / metrics.totalClicks) * 100
                                  : 0
                              }%`,
                            }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs mb-1 font-semibold">
                          <span className="flex items-center gap-1.5 text-gray-300">
                            <Monitor className="w-4 h-4 text-brand-cyan" /> Desktop (Computador)
                          </span>
                          <span className="text-brand-cyan font-bold">
                            {metrics.totalClicks > 0
                              ? Math.round((metrics.deviceBreakdown.desktop / metrics.totalClicks) * 100)
                              : 0}%
                          </span>
                        </div>
                        <div className="w-full h-2 bg-dark-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-brand-cyan rounded-full transition-all"
                            style={{
                              width: `${
                                metrics.totalClicks > 0
                                  ? (metrics.deviceBreakdown.desktop / metrics.totalClicks) * 100
                                  : 0
                              }%`,
                            }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs mb-1 font-semibold">
                          <span className="flex items-center gap-1.5 text-gray-300">
                            <Tablet className="w-4 h-4 text-brand-purple" /> Tablet
                          </span>
                          <span className="text-brand-purple font-bold">
                            {metrics.totalClicks > 0
                              ? Math.round((metrics.deviceBreakdown.tablet / metrics.totalClicks) * 100)
                              : 0}%
                          </span>
                        </div>
                        <div className="w-full h-2 bg-dark-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-brand-purple rounded-full transition-all"
                            style={{
                              width: `${
                                metrics.totalClicks > 0
                                  ? (metrics.deviceBreakdown.tablet / metrics.totalClicks) * 100
                                  : 0
                              }%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="glass-card rounded-2xl p-5 border border-white/10 bg-gradient-to-br from-dark-800 to-purple-950/30">
                  <div className="flex items-center gap-2 text-brand-purple font-bold text-xs mb-2">
                    <Sparkles className="w-4 h-4" />
                    <span>Velocidade Ultrarrápida em JSON</span>
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    Sua configuração de redes sociais não precisa fazer queries lentas no banco de dados. Os arquivos JSON na pasta <code className="text-pink-300 bg-black/40 px-1 py-0.5 rounded">data/socials.json</code> são lidos instantaneamente pelo servidor.
                  </p>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SOCIAL MEDIA MANAGER */}
        {activeTab === 'socials' && (
          <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-6">
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Globe className="w-5 h-5 text-brand-pink" />
                  <span>Configurar Botões de Rede Social</span>
                </h3>
                <p className="text-xs text-gray-400 mt-1 max-w-xl">
                  Selecione quais redes sociais você quer exibir na página principal, altere seus nomes, links e ordens. Tudo é gravado no arquivo JSON local sem sobrecarregar o banco de dados.
                </p>
              </div>

              <div className="flex items-center gap-2 self-stretch sm:self-auto">
                <button
                  onClick={handleResetSocials}
                  className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-gray-300 hover:text-white flex items-center gap-1.5 transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restaurar Padrão</span>
                </button>

                <button
                  onClick={() => addSocialItem()}
                  className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-white flex items-center gap-1.5 transition"
                >
                  <Plus className="w-4 h-4 text-brand-pink" />
                  <span>Adicionar Rede</span>
                </button>

                <button
                  onClick={handleSaveSocials}
                  disabled={savingSocials}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-brand-pink to-brand-purple text-white font-bold text-xs hover:opacity-90 flex items-center gap-1.5 shadow-lg shadow-pink-500/20 transition disabled:opacity-50"
                >
                  {savingSocials ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>Salvar no JSON</span>
                </button>
              </div>
            </div>

            {/* Quick Add Presets */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-400">Atalhos para Adicionar Rápido:</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { platform: 'whatsapp', name: '+ WhatsApp', icon: <MessageCircle className="w-3.5 h-3.5 text-green-400" /> },
                  { platform: 'instagram', name: '+ Instagram', icon: <Instagram className="w-3.5 h-3.5 text-pink-400" /> },
                  { platform: 'youtube', name: '+ YouTube', icon: <Youtube className="w-3.5 h-3.5 text-red-500" /> },
                  { platform: 'tiktok', name: '+ TikTok', icon: <Video className="w-3.5 h-3.5 text-purple-400" /> },
                  { platform: 'twitter', name: '+ X (Twitter)', icon: <Twitter className="w-3.5 h-3.5 text-sky-400" /> },
                  { platform: 'linkedin', name: '+ LinkedIn', icon: <Linkedin className="w-3.5 h-3.5 text-blue-500" /> },
                  { platform: 'github', name: '+ GitHub', icon: <Github className="w-3.5 h-3.5 text-gray-200" /> },
                  { platform: 'website', name: '+ Meu Site', icon: <Globe className="w-3.5 h-3.5 text-cyan-400" /> },
                ].map((item) => (
                  <button
                    key={item.platform}
                    onClick={() => addSocialItem(item.platform as SocialLink['platform'])}
                    className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-gray-300 hover:text-white flex items-center gap-1.5 transition"
                  >
                    {item.icon}
                    <span>{item.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Social Links List */}
            <div className="space-y-3 pt-2">
              {socialsList.length === 0 ? (
                <div className="text-center py-10 text-gray-500 text-xs border border-dashed border-white/10 rounded-2xl">
                  Nenhuma rede social configurada. Clique em um dos atalhos acima para adicionar!
                </div>
              ) : (
                socialsList.map((item, idx) => (
                  <div
                    key={item.id}
                    className={`p-4 rounded-2xl border transition flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                      item.active !== false
                        ? 'bg-white/5 border-white/15 shadow-md'
                        : 'bg-black/40 border-white/5 opacity-60'
                    }`}
                  >
                    {/* Left: Drag / Move & Platform Icon */}
                    <div className="flex items-center gap-3 w-full md:w-auto">
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => moveSocialItem(idx, 'up')}
                          disabled={idx === 0}
                          className="p-1 rounded bg-white/5 hover:bg-white/10 text-gray-400 disabled:opacity-20 hover:text-white transition"
                          title="Mover para cima"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => moveSocialItem(idx, 'down')}
                          disabled={idx === socialsList.length - 1}
                          className="p-1 rounded bg-white/5 hover:bg-white/10 text-gray-400 disabled:opacity-20 hover:text-white transition"
                          title="Mover para baixo"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                        {getSocialIconComponent(item.platform)}
                      </div>

                      {/* Select Platform */}
                      <div className="flex-1 md:w-40">
                        <label className="text-[10px] text-gray-400 uppercase font-semibold block mb-1">
                          Plataforma
                        </label>
                        <select
                          value={item.platform}
                          onChange={(e) => updateSocialItem(item.id, 'platform', e.target.value)}
                          className="w-full bg-dark-900 border border-white/15 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-brand-pink"
                        >
                          {PLATFORM_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value} className="bg-dark-900 text-white">
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Middle: Title & URL fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full md:flex-1">
                      <div>
                        <label className="text-[10px] text-gray-400 uppercase font-semibold block mb-1">
                          Título / Rótulo
                        </label>
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) => updateSocialItem(item.id, 'title', e.target.value)}
                          placeholder="Ex: Instagram"
                          className="w-full bg-dark-900 border border-white/15 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-brand-pink"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] text-gray-400 uppercase font-semibold block mb-1">
                          URL Completa do Perfil
                        </label>
                        <input
                          type="text"
                          value={item.url}
                          onChange={(e) => updateSocialItem(item.id, 'url', e.target.value)}
                          placeholder="https://..."
                          className="w-full bg-dark-900 border border-white/15 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-brand-pink font-mono"
                        />
                      </div>
                    </div>

                    {/* Right: Active Switch & Delete */}
                    <div className="flex items-center gap-2 self-end md:self-auto shrink-0 pt-2 md:pt-0 border-t md:border-0 border-white/10 w-full md:w-auto justify-end">
                      <button
                        onClick={() => toggleSocialActive(item.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                          item.active !== false
                            ? 'bg-green-500/20 text-green-300 border-green-500/40 hover:bg-green-500/30'
                            : 'bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700'
                        }`}
                      >
                        {item.active !== false ? 'Ativo' : 'Oculto'}
                      </button>

                      <button
                        onClick={() => removeSocialItem(item.id)}
                        className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 transition"
                        title="Excluir rede social"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Bottom Save Bar */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
              <span className="text-xs text-gray-400">
                {socialsList.filter((s) => s.active !== false).length} redes ativas para exibição pública
              </span>

              <button
                onClick={handleSaveSocials}
                disabled={savingSocials}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-pink to-brand-purple text-white font-bold text-xs hover:opacity-90 flex items-center gap-2 shadow-lg shadow-pink-500/20 transition disabled:opacity-50"
              >
                {savingSocials ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>Salvar Todas as Redes (JSON)</span>
              </button>
            </div>

          </div>
        )}

        {/* TAB 3: LAYOUT & LINKS MANAGER */}
        {activeTab === 'layout' && (
          <div className="glass-card rounded-2xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-bold text-white">Gerenciador de Layout & Mídias</h3>
                <p className="text-xs text-gray-400">
                  Ative ou desative links e mídias visíveis na página principal sem alterar o código
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {linksList.map((item) => (
                <div
                  key={item.id}
                  className={`p-4 rounded-2xl border transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                    item.active
                      ? 'bg-white/5 border-white/15'
                      : 'bg-black/40 border-white/5 opacity-50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {item.image ? (
                      <div className="w-16 h-12 rounded-lg relative overflow-hidden bg-dark-700 shrink-0 border border-white/10">
                        <Image src={item.image} alt={item.title} fill className="object-cover" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-brand-purple/20 border border-brand-purple/30 flex items-center justify-center shrink-0 text-brand-purple">
                        <Layers className="w-5 h-5" />
                      </div>
                    )}

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">{item.title}</span>
                        {item.badge && (
                          <span className="bg-brand-pink/20 text-brand-pink text-[10px] font-bold px-2 py-0.5 rounded-full border border-brand-pink/30">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">{item.subtitle || item.url}</p>
                      <div className="text-[10px] text-gray-500 mt-1 uppercase font-semibold">
                        Tipo: {item.type} • Categoria: {item.category}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    <button
                      onClick={() => toggleLinkActive(item.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                        item.active
                          ? 'bg-green-500/20 text-green-300 border-green-500/40 hover:bg-green-500/30'
                          : 'bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700'
                      }`}
                    >
                      {item.active ? 'Ativo na Página' : 'Oculto'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

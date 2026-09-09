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
  EyeOff,
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
  ExternalLink,
  FileCode,
  Check,
  User,
  Image as ImageIcon,
  ArrowUpDown,
  Edit3,
  LayoutList
} from 'lucide-react';
import { AnalyticsSummary } from '@/lib/analytics';
import { INITIAL_LINKS, LinkItem, SocialLink, INITIAL_PROFILE, ProfileConfig } from '@/lib/links-config';
import { SocialIcon } from '@/components/SocialIcons';

type TabType = 'metrics' | 'profile' | 'socials' | 'buttons' | 'reorder';

const PLATFORM_OPTIONS: { label: string; value: SocialLink['platform'] }[] = [
  { label: 'Instagram', value: 'instagram' },
  { label: 'YouTube', value: 'youtube' },
  { label: 'X (Twitter)', value: 'twitter' },
  { label: 'TikTok', value: 'tiktok' },
  { label: 'WhatsApp', value: 'whatsapp' },
  { label: 'LinkedIn', value: 'linkedin' },
  { label: 'Spotify', value: 'spotify' },
  { label: 'GitHub', value: 'github' },
  { label: 'Facebook', value: 'facebook' },
  { label: 'Twitch', value: 'twitch' },
  { label: 'Threads', value: 'threads' },
  { label: 'Discord', value: 'discord' },
  { label: 'Telegram', value: 'telegram' },
  { label: 'Pinterest', value: 'pinterest' },
  { label: 'Snapchat', value: 'snapchat' },
  { label: 'Bluesky', value: 'bluesky' },
  { label: 'Website / Link', value: 'website' },
  { label: 'Outro', value: 'other' },
];

const BUTTON_TYPE_OPTIONS: { label: string; value: LinkItem['type']; description: string }[] = [
  { label: 'Botão Sem Foto', value: 'no-photo', description: 'Botão simples com título, subtítulo e link' },
  { label: 'Botão com Foto na Esquerda (Miniatura)', value: 'left-thumb', description: 'Foto miniatura na esquerda, título e subtítulo ao lado' },
  { label: 'Botão com Foto em Destaque (Card)', value: 'card-photo', description: 'Card visual grande com imagem de fundo' },
  { label: 'Botão Chamada VIP (Mentoria)', value: 'cta-primary', description: 'Botão de destaque principal com fundo claro/brilhante' },
];

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('metrics');
  
  // Profile state
  const [profile, setProfile] = useState<ProfileConfig>(INITIAL_PROFILE);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSaveSuccess, setProfileSaveSuccess] = useState(false);

  // Socials state
  const [socialsList, setSocialsList] = useState<SocialLink[]>([]);
  const [savingSocials, setSavingSocials] = useState(false);
  const [socialsSaveSuccess, setSocialsSaveSuccess] = useState(false);

  // Links state
  const [linksList, setLinksList] = useState<LinkItem[]>(INITIAL_LINKS);
  const [savingLinks, setSavingLinks] = useState(false);
  const [linksSaveSuccess, setLinksSaveSuccess] = useState(false);

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

  // Fetch Profile config
  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/profile');
      const data = await res.json();
      if (data && data.profile) {
        setProfile(data.profile);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  };

  // Fetch Socials config
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

  // Fetch Links config
  const fetchLinks = async () => {
    try {
      const res = await fetch('/api/links');
      const data = await res.json();
      if (data && Array.isArray(data.links)) {
        setLinksList(data.links);
      }
    } catch (err) {
      console.error('Error fetching links:', err);
    }
  };

  useEffect(() => {
    fetchMetrics();
    fetchProfile();
    fetchSocials();
    fetchLinks();
    const interval = setInterval(fetchMetrics, 10000);
    return () => clearInterval(interval);
  }, []);

  // Profile operations
  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile }),
      });
      const data = await res.json();
      if (data && data.profile) {
        setProfile(data.profile);
        setProfileSaveSuccess(true);
        setTimeout(() => setProfileSaveSuccess(false), 3500);
      }
    } catch (err) {
      console.error('Error saving profile:', err);
      alert('Erro ao salvar as informações do perfil.');
    } finally {
      setSavingProfile(false);
    }
  };

  // Socials operations
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
      alert('Erro ao salvar as redes sociais.');
    } finally {
      setSavingSocials(false);
    }
  };

  const handleResetSocials = async () => {
    if (!confirm('Restaurar as redes sociais originais?')) return;
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
      tiktok: 'TikTok',
      whatsapp: 'WhatsApp',
      linkedin: 'LinkedIn',
      spotify: 'Spotify',
      github: 'GitHub',
      facebook: 'Facebook',
      twitch: 'Twitch',
      threads: 'Threads',
      discord: 'Discord',
      telegram: 'Telegram',
      pinterest: 'Pinterest',
      snapchat: 'Snapchat',
      bluesky: 'Bluesky',
      website: 'Website Oficial',
      other: 'Nova Rede',
    };
    const urlMap: Record<string, string> = {
      instagram: 'https://instagram.com/seu_usuario',
      youtube: 'https://youtube.com/@seu_canal',
      twitter: 'https://x.com/seu_usuario',
      tiktok: 'https://tiktok.com/@seu_usuario',
      whatsapp: 'https://wa.me/5511999999999',
      linkedin: 'https://linkedin.com/in/seu_perfil',
      spotify: 'https://open.spotify.com/user/seu_id',
      github: 'https://github.com/seu_usuario',
      facebook: 'https://facebook.com/sua_pagina',
      twitch: 'https://twitch.tv/seu_canal',
      threads: 'https://threads.net/@seu_usuario',
      discord: 'https://discord.gg/seu_servidor',
      telegram: 'https://t.me/seu_usuario',
      pinterest: 'https://pinterest.com/seu_usuario',
      snapchat: 'https://snapchat.com/add/seu_usuario',
      bluesky: 'https://bsky.app/profile/seu_usuario.bsky.social',
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

  // Links operations
  const handleSaveLinks = async (updatedLinks?: LinkItem[]) => {
    const targetLinks = updatedLinks || linksList;
    setSavingLinks(true);
    try {
      const res = await fetch('/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ links: targetLinks }),
      });
      const data = await res.json();
      if (data && Array.isArray(data.links)) {
        setLinksList(data.links);
        setLinksSaveSuccess(true);
        setTimeout(() => setLinksSaveSuccess(false), 3500);
      }
    } catch (err) {
      console.error('Error saving links JSON:', err);
      alert('Erro ao salvar os botões.');
    } finally {
      setSavingLinks(false);
    }
  };

  const handleResetLinks = async () => {
    if (!confirm('Restaurar a lista de botões original?')) return;
    try {
      const res = await fetch('/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset' }),
      });
      const data = await res.json();
      if (data.links) {
        setLinksList(data.links);
        setLinksSaveSuccess(true);
        setTimeout(() => setLinksSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Error resetting links:', err);
    }
  };

  const toggleLinkActive = (id: string) => {
    setLinksList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, active: !item.active } : item))
    );
  };

  const updateLinkItem = (id: string, key: keyof LinkItem, value: any) => {
    setLinksList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [key]: value } : item))
    );
  };

  const removeLinkItem = (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este botão?')) return;
    const updated = linksList.filter((item) => item.id !== id);
    setLinksList(updated);
    handleSaveLinks(updated);
  };

  const moveLinkItem = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= linksList.length) return;
    const updated = [...linksList];
    const [moved] = updated.splice(index, 1);
    updated.splice(newIndex, 0, moved);
    setLinksList(updated);
  };

  const addNewButton = (type: LinkItem['type'] = 'no-photo') => {
    const newItem: LinkItem = {
      id: `link-${Date.now()}`,
      type: type,
      title: type === 'cta-primary' ? 'Novo Botão Mentoria VIP' : 'Novo Botão Personalizado',
      subtitle: 'Descrição do seu botão',
      url: 'https://exemplo.com',
      image: type !== 'no-photo' ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80' : '',
      active: true,
      category: 'custom',
    };
    const updated = [...linksList, newItem];
    setLinksList(updated);
  };

  const handleResetMetrics = async () => {
    if (!confirm('Deseja reiniciar todas as métricas para o estado original?')) return;
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

  const getSocialIconComponent = (platform: string) => {
    return <SocialIcon platform={platform} className="w-5 h-5" />;
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
                Painel de Controle
              </span>
            </div>
          </div>

          {/* Navigation Menu Links */}
          <nav className="space-y-1.5">
            <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider px-3 mb-2">
              Menu de Controle
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
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition text-left ${
                activeTab === 'profile'
                  ? 'bg-brand-cyan/20 text-white border border-brand-cyan/40 shadow-glow-cyan'
                  : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <User className={`w-4 h-4 ${activeTab === 'profile' ? 'text-brand-cyan' : ''}`} />
              <span>Editar Perfil & Fotos</span>
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
              <span>Redes Sociais</span>
            </button>

            <button
              onClick={() => setActiveTab('buttons')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition text-left ${
                activeTab === 'buttons'
                  ? 'bg-purple-600/20 text-white border border-purple-500/40'
                  : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <Edit3 className={`w-4 h-4 ${activeTab === 'buttons' ? 'text-purple-400' : ''}`} />
              <span>Criar & Modificar Botões</span>
            </button>

            <button
              onClick={() => setActiveTab('reorder')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition text-left ${
                activeTab === 'reorder'
                  ? 'bg-amber-500/20 text-white border border-amber-500/40'
                  : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <ArrowUpDown className={`w-4 h-4 ${activeTab === 'reorder' ? 'text-amber-400' : ''}`} />
              <span>Reordenar Ordem</span>
            </button>
          </nav>

        </div>

        {/* Sidebar Footer Info */}
        <div className="pt-4 border-t border-white/10 space-y-3">
          <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-[11px] space-y-1">
            <div className="flex items-center gap-1.5 text-green-400 font-semibold">
              <FileCode className="w-3.5 h-3.5" />
              <span>Armazenamento Instantâneo</span>
            </div>
            <p className="text-[10px] text-gray-400">
              Alterações salvas instantaneamente no diretório <code className="text-gray-300">data/</code>.
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
          className={`flex flex-col items-center gap-1 px-2.5 py-1.5 rounded-xl text-[10px] font-bold transition ${
            activeTab === 'metrics'
              ? 'bg-brand-purple/20 text-brand-purple border border-brand-purple/30'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Métricas</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center gap-1 px-2.5 py-1.5 rounded-xl text-[10px] font-bold transition ${
            activeTab === 'profile'
              ? 'bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Perfil</span>
        </button>

        <button
          onClick={() => setActiveTab('socials')}
          className={`flex flex-col items-center gap-1 px-2.5 py-1.5 rounded-xl text-[10px] font-bold transition ${
            activeTab === 'socials'
              ? 'bg-brand-pink/20 text-brand-pink border border-brand-pink/30'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>Redes</span>
        </button>

        <button
          onClick={() => setActiveTab('buttons')}
          className={`flex flex-col items-center gap-1 px-2.5 py-1.5 rounded-xl text-[10px] font-bold transition ${
            activeTab === 'buttons'
              ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Edit3 className="w-4 h-4" />
          <span>Botões</span>
        </button>

        <button
          onClick={() => setActiveTab('reorder')}
          className={`flex flex-col items-center gap-1 px-2.5 py-1.5 rounded-xl text-[10px] font-bold transition ${
            activeTab === 'reorder'
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <ArrowUpDown className="w-4 h-4" />
          <span>Ordem</span>
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
                {activeTab === 'profile' && 'Editar Perfil & Fotos'}
                {activeTab === 'socials' && 'Gerenciador de Redes Sociais'}
                {activeTab === 'buttons' && 'Criar & Modificar Botões'}
                {activeTab === 'reorder' && 'Reordenar Ordem dos Botões'}
              </h1>
              <p className="text-xs text-gray-400 mt-0.5">
                Gerenciando {profile.name} ({profile.handle})
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

            {activeTab === 'profile' && (
              <button
                onClick={handleSaveProfile}
                disabled={savingProfile}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-brand-cyan to-brand-purple text-white font-bold text-xs hover:opacity-90 flex items-center gap-1.5 shadow-lg transition disabled:opacity-50"
              >
                {savingProfile ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Salvar Perfil</span>
              </button>
            )}

            {activeTab === 'socials' && (
              <button
                onClick={handleSaveSocials}
                disabled={savingSocials}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-brand-pink to-brand-purple text-white font-bold text-xs hover:opacity-90 flex items-center gap-1.5 shadow-lg shadow-pink-500/20 transition disabled:opacity-50"
              >
                {savingSocials ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Salvar Redes</span>
              </button>
            )}

            {(activeTab === 'buttons' || activeTab === 'reorder') && (
              <button
                onClick={() => handleSaveLinks()}
                disabled={savingLinks}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-brand-pink text-white font-bold text-xs hover:opacity-90 flex items-center gap-1.5 shadow-lg transition disabled:opacity-50"
              >
                {savingLinks ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Salvar Botões</span>
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

        {/* Global Notifications */}
        {profileSaveSuccess && (
          <div className="mb-6 bg-green-500/20 border border-green-500/40 text-green-200 text-xs px-4 py-2.5 rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-400" />
            <span>Informações e fotos do perfil salvas com sucesso!</span>
          </div>
        )}

        {socialsSaveSuccess && (
          <div className="mb-6 bg-green-500/20 border border-green-500/40 text-green-200 text-xs px-4 py-2.5 rounded-xl flex items-center gap-2">
            <Check className="w-4 h-4 text-green-400" />
            <span>Redes sociais salvas no arquivo JSON com sucesso!</span>
          </div>
        )}

        {linksSaveSuccess && (
          <div className="mb-6 bg-green-500/20 border border-green-500/40 text-green-200 text-xs px-4 py-2.5 rounded-xl flex items-center gap-2">
            <Check className="w-4 h-4 text-green-400" />
            <span>Configuração e ordem dos botões salvas com sucesso!</span>
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
                    <p className="text-xs text-gray-400">Contagem de cliques individuais para cada botão</p>
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
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PROFILE MANAGER */}
        {activeTab === 'profile' && (
          <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <User className="w-5 h-5 text-brand-cyan" />
                  <span>Editar Perfil & Fotos</span>
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Modifique o nome, arroba (@), foto de perfil, foto de capa e descrições do perfil.
                </p>
              </div>

              <button
                onClick={handleSaveProfile}
                disabled={savingProfile}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-cyan to-brand-purple text-white font-bold text-xs hover:opacity-90 flex items-center gap-2 shadow-lg transition disabled:opacity-50"
              >
                {savingProfile ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Salvar Alterações</span>
              </button>
            </div>

            {/* Profile Live Preview Card */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center relative overflow-hidden">
              <div className="w-full h-28 rounded-xl relative overflow-hidden mb-[-36px] bg-dark-800 border border-white/10">
                {profile.coverImageUrl && profile.coverImageUrl.trim() !== '' ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={profile.coverImageUrl}
                    alt="Previa da Capa"
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-950/60 via-dark-800 to-pink-950/40" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#08090d] via-transparent to-black/20 pointer-events-none" />
              </div>
              <div className="w-20 h-20 rounded-full overflow-hidden relative bg-dark-800 shadow-xl relative z-10 border-2 border-white/15 shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={profile.avatarUrl || INITIAL_PROFILE.avatarUrl}
                  alt="Previa do Perfil"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = INITIAL_PROFILE.avatarUrl;
                  }}
                />
              </div>
              <div className="text-center mt-2">
                <div className="flex items-center justify-center gap-1.5">
                  <h4 className="font-bold text-white text-base">{profile.name || 'Nome'}</h4>
                  {profile.isVerified && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src="/images/verify.webp"
                      alt="Verificado"
                      className="w-4 h-4 object-contain shrink-0 drop-shadow-sm select-none"
                      onError={(e) => {
                        (e.currentTarget as HTMLElement).style.display = 'none';
                      }}
                    />
                  )}
                </div>
                {profile.showHandle !== false && (
                  <p className="text-xs text-gray-400 font-medium">{profile.handle || '@handle'}</p>
                )}
                {profile.showBio !== false && profile.bio && (
                  <p className="text-xs text-gray-300 mt-1 max-w-xs">{profile.bio}</p>
                )}
              </div>
            </div>

            {/* Profile Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-gray-300">Nome Exibido</label>
                  <button
                    type="button"
                    onClick={() => setProfile({ ...profile, isVerified: !profile.isVerified })}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1.5 transition border ${
                      profile.isVerified
                        ? 'bg-blue-500/20 text-blue-300 border-blue-500/40 hover:bg-blue-500/30'
                        : 'bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700'
                    }`}
                    title={profile.isVerified ? 'Clique para ocultar o selo verificado' : 'Clique para exibir o selo verificado'}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/images/verify.webp"
                      alt="Selo Verificado"
                      className="w-3 h-3 object-contain shrink-0"
                    />
                    <span>{profile.isVerified ? 'Selo Verificado Ativo' : 'Sem Verificado'}</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  placeholder="Seu Nome"
                  className="w-full bg-dark-900 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-cyan"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-gray-300">Arroba / Handle (@)</label>
                  <button
                    type="button"
                    onClick={() => setProfile({ ...profile, showHandle: profile.showHandle === false ? true : false })}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 transition border ${
                      profile.showHandle !== false
                        ? 'bg-green-500/20 text-green-300 border-green-500/40 hover:bg-green-500/30'
                        : 'bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700'
                    }`}
                    title={profile.showHandle !== false ? 'Clique para ocultar da página' : 'Clique para exibir na página'}
                  >
                    {profile.showHandle !== false ? (
                      <>
                        <Eye className="w-3 h-3 text-green-400" />
                        <span>Visível</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3 h-3 text-gray-400" />
                        <span>Oculto</span>
                      </>
                    )}
                  </button>
                </div>
                <input
                  type="text"
                  value={profile.handle}
                  onChange={(e) => setProfile({ ...profile, handle: e.target.value })}
                  placeholder="@seuusuario"
                  className="w-full bg-dark-900 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-cyan"
                />
              </div>

              <div className="md:col-span-2">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-gray-300">E-mail Profissional de Contato</label>
                  <button
                    type="button"
                    onClick={() => setProfile({ ...profile, showContactEmail: profile.showContactEmail === false ? true : false })}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 transition border ${
                      profile.showContactEmail !== false
                        ? 'bg-green-500/20 text-green-300 border-green-500/40 hover:bg-green-500/30'
                        : 'bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700'
                    }`}
                    title={profile.showContactEmail !== false ? 'Clique para ocultar da página' : 'Clique para exibir na página'}
                  >
                    {profile.showContactEmail !== false ? (
                      <>
                        <Eye className="w-3 h-3 text-green-400" />
                        <span>Visível</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3 h-3 text-gray-400" />
                        <span>Oculto</span>
                      </>
                    )}
                  </button>
                </div>
                <input
                  type="email"
                  value={profile.contactEmail}
                  onChange={(e) => setProfile({ ...profile, contactEmail: e.target.value })}
                  placeholder="contato@exemplo.com"
                  className="w-full bg-dark-900 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-cyan font-mono"
                />
              </div>

              <div className="md:col-span-2">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-gray-300">Bio / Descrição do Perfil</label>
                  <button
                    type="button"
                    onClick={() => setProfile({ ...profile, showBio: profile.showBio === false ? true : false })}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 transition border ${
                      profile.showBio !== false
                        ? 'bg-green-500/20 text-green-300 border-green-500/40 hover:bg-green-500/30'
                        : 'bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700'
                    }`}
                    title={profile.showBio !== false ? 'Clique para ocultar da página' : 'Clique para exibir na página'}
                  >
                    {profile.showBio !== false ? (
                      <>
                        <Eye className="w-3 h-3 text-green-400" />
                        <span>Visível</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3 h-3 text-gray-400" />
                        <span>Oculto</span>
                      </>
                    )}
                  </button>
                </div>
                <textarea
                  rows={2}
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  placeholder="Escreva sua bio (ex: Criadora de Conteúdo, Empreendedora...)"
                  className="w-full bg-dark-900 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-cyan resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1">URL da Foto de Perfil (Avatar)</label>
                <input
                  type="text"
                  value={profile.avatarUrl}
                  onChange={(e) => setProfile({ ...profile, avatarUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full bg-dark-900 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-cyan font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1">URL da Foto de Capa (Header)</label>
                <input
                  type="text"
                  value={profile.coverImageUrl || ''}
                  onChange={(e) => setProfile({ ...profile, coverImageUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full bg-dark-900 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-cyan font-mono"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex justify-end">
              <button
                onClick={handleSaveProfile}
                disabled={savingProfile}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-cyan to-brand-purple text-white font-bold text-xs hover:opacity-90 flex items-center gap-2 shadow-lg transition disabled:opacity-50"
              >
                {savingProfile ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Salvar Perfil</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: SOCIAL MEDIA MANAGER */}
        {activeTab === 'socials' && (
          <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-6">
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Globe className="w-5 h-5 text-brand-pink" />
                  <span>Configurar Botões de Rede Social</span>
                </h3>
                <p className="text-xs text-gray-400 mt-1 max-w-xl">
                  Gerencie os ícones de redes sociais exibidos no topo do seu perfil.
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
                  {savingSocials ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>Salvar Redes</span>
                </button>
              </div>
            </div>

            {/* Quick Add Presets */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-400">Atalhos para Adicionar Rápido:</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { platform: 'instagram', name: '+ Instagram' },
                  { platform: 'youtube', name: '+ YouTube' },
                  { platform: 'tiktok', name: '+ TikTok' },
                  { platform: 'whatsapp', name: '+ WhatsApp' },
                  { platform: 'twitter', name: '+ X (Twitter)' },
                  { platform: 'spotify', name: '+ Spotify' },
                  { platform: 'linkedin', name: '+ LinkedIn' },
                  { platform: 'github', name: '+ GitHub' },
                  { platform: 'threads', name: '+ Threads' },
                  { platform: 'discord', name: '+ Discord' },
                  { platform: 'telegram', name: '+ Telegram' },
                  { platform: 'website', name: '+ Meu Site' },
                ].map((item) => (
                  <button
                    key={item.platform}
                    onClick={() => addSocialItem(item.platform as SocialLink['platform'])}
                    className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-gray-300 hover:text-white flex items-center gap-1.5 transition"
                  >
                    <SocialIcon platform={item.platform} className="w-3.5 h-3.5 shrink-0" />
                    <span>{item.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Social Links List */}
            <div className="space-y-3 pt-2">
              {socialsList.length === 0 ? (
                <div className="text-center py-10 text-gray-500 text-xs border border-dashed border-white/10 rounded-2xl">
                  Nenhuma rede social configurada.
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
                    <div className="flex items-center gap-3 w-full md:w-auto">
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => moveSocialItem(idx, 'up')}
                          disabled={idx === 0}
                          className="p-1 rounded bg-white/5 hover:bg-white/10 text-gray-400 disabled:opacity-20 hover:text-white transition"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => moveSocialItem(idx, 'down')}
                          disabled={idx === socialsList.length - 1}
                          className="p-1 rounded bg-white/5 hover:bg-white/10 text-gray-400 disabled:opacity-20 hover:text-white transition"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                        {getSocialIconComponent(item.platform)}
                      </div>

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

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full md:flex-1">
                      <div>
                        <label className="text-[10px] text-gray-400 uppercase font-semibold block mb-1">
                          Rótulo / Nome
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
                          URL do Perfil
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
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
              <span className="text-xs text-gray-400">
                {socialsList.filter((s) => s.active !== false).length} redes ativas
              </span>

              <button
                onClick={handleSaveSocials}
                disabled={savingSocials}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-pink to-brand-purple text-white font-bold text-xs hover:opacity-90 flex items-center gap-2 shadow-lg transition disabled:opacity-50"
              >
                {savingSocials ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Salvar Redes</span>
              </button>
            </div>

          </div>
        )}

        {/* TAB 4: BUTTON MANAGER (CREATE & EDIT BUTTONS) */}
        {activeTab === 'buttons' && (
          <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-purple-400" />
                  <span>Criar & Modificar Botões</span>
                </h3>
                <p className="text-xs text-gray-400 mt-1 max-w-xl">
                  Crie novos botões com ou sem fotos (miniatura na esquerda ou card completo), altere textos e URLs.
                </p>
              </div>

              <div className="flex items-center gap-2 self-stretch sm:self-auto">
                <button
                  onClick={handleResetLinks}
                  className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-gray-300 hover:text-white flex items-center gap-1.5 transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restaurar Padrão</span>
                </button>

                <button
                  onClick={() => addNewButton('no-photo')}
                  className="px-3.5 py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-xs font-bold text-white flex items-center gap-1.5 transition shadow-lg"
                >
                  <Plus className="w-4 h-4 text-purple-300" />
                  <span>Criar Novo Botão</span>
                </button>

                <button
                  onClick={() => handleSaveLinks()}
                  disabled={savingLinks}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-brand-pink text-white font-bold text-xs hover:opacity-90 flex items-center gap-1.5 shadow-lg transition disabled:opacity-50"
                >
                  {savingLinks ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>Salvar Alterações</span>
                </button>
              </div>
            </div>

            {/* Quick Create Buttons Shortcuts */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
              <p className="text-xs font-bold text-gray-300">Tipos de Botão para Adicionar:</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  onClick={() => addNewButton('no-photo')}
                  className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition flex items-center gap-3 group"
                >
                  <div className="w-8 h-8 rounded-lg bg-gray-700/50 border border-white/10 flex items-center justify-center shrink-0">
                    <Edit3 className="w-4 h-4 text-gray-300 group-hover:text-white" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Botão sem Foto</div>
                    <div className="text-[10px] text-gray-400">Texto simples e direto</div>
                  </div>
                </button>

                <button
                  onClick={() => addNewButton('left-thumb')}
                  className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition flex items-center gap-3 group"
                >
                  <div className="w-8 h-8 rounded-lg bg-pink-500/20 border border-pink-500/30 flex items-center justify-center shrink-0">
                    <ImageIcon className="w-4 h-4 text-pink-300" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Miniatura na Esquerda</div>
                    <div className="text-[10px] text-gray-400">Foto pequena à esquerda</div>
                  </div>
                </button>

                <button
                  onClick={() => addNewButton('card-photo')}
                  className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition flex items-center gap-3 group"
                >
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4 text-cyan-300" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Botão com Foto (Card)</div>
                    <div className="text-[10px] text-gray-400">Card grande com imagem</div>
                  </div>
                </button>
              </div>
            </div>

            {/* List of Buttons for Editing */}
            <div className="space-y-4 pt-2">
              {linksList.map((item) => (
                <div
                  key={item.id}
                  className={`p-4 rounded-2xl border transition flex flex-col gap-4 ${
                    item.active
                      ? 'bg-white/5 border-white/15 shadow-lg'
                      : 'bg-black/40 border-white/5 opacity-60'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-white/10 text-[10px] font-bold flex items-center justify-center text-gray-300">
                        {item.type === 'cta-primary' ? '⚡' : item.type === 'left-thumb' ? '📷' : item.type === 'card-photo' ? '🖼️' : '🔗'}
                      </span>
                      <div>
                        <h4 className="text-sm font-bold text-white">{item.title || 'Sem título'}</h4>
                        <p className="text-[11px] text-gray-400">
                          {BUTTON_TYPE_OPTIONS.find((b) => b.value === item.type)?.label || item.type}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
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

                      <button
                        onClick={() => removeLinkItem(item.id)}
                        className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 transition"
                        title="Excluir Botão"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Form fields for button */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[10px] text-gray-400 uppercase font-semibold block mb-1">
                        Estilo / Tipo do Botão
                      </label>
                      <select
                        value={item.type}
                        onChange={(e) => updateLinkItem(item.id, 'type', e.target.value)}
                        className="w-full bg-dark-900 border border-white/15 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-400"
                      >
                        {BUTTON_TYPE_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value} className="bg-dark-900 text-white">
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] text-gray-400 uppercase font-semibold block mb-1">
                        Título do Botão
                      </label>
                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) => updateLinkItem(item.id, 'title', e.target.value)}
                        placeholder="Ex: Agendar Chamada"
                        className="w-full bg-dark-900 border border-white/15 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-400"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-gray-400 uppercase font-semibold block mb-1">
                        Subtítulo / Descrição Curta
                      </label>
                      <input
                        type="text"
                        value={item.subtitle || ''}
                        onChange={(e) => updateLinkItem(item.id, 'subtitle', e.target.value)}
                        placeholder="Ex: Sessão 1-on-1 exclusiva"
                        className="w-full bg-dark-900 border border-white/15 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-400"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="text-[10px] text-gray-400 uppercase font-semibold block mb-1">
                        URL do Link de Destino
                      </label>
                      <input
                        type="text"
                        value={item.url}
                        onChange={(e) => updateLinkItem(item.id, 'url', e.target.value)}
                        placeholder="https://..."
                        className="w-full bg-dark-900 border border-white/15 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-400 font-mono"
                      />
                    </div>

                    {item.type !== 'no-photo' && (
                      <div>
                        <label className="text-[10px] text-gray-400 uppercase font-semibold block mb-1">
                          URL da Imagem / Foto
                        </label>
                        <input
                          type="text"
                          value={item.image || ''}
                          onChange={(e) => updateLinkItem(item.id, 'image', e.target.value)}
                          placeholder="https://..."
                          className="w-full bg-dark-900 border border-white/15 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-400 font-mono"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-white/10 flex justify-end">
              <button
                onClick={() => handleSaveLinks()}
                disabled={savingLinks}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-brand-pink text-white font-bold text-xs hover:opacity-90 flex items-center gap-2 shadow-lg transition disabled:opacity-50"
              >
                {savingLinks ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Salvar Todos os Botões</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 5: REORDER BUTTONS & CARDS */}
        {activeTab === 'reorder' && (
          <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <ArrowUpDown className="w-5 h-5 text-amber-400" />
                  <span>Reordenar Ordem dos Botões</span>
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Mova os botões para cima ou para baixo para alterar exatamente a sequência em que aparecem no seu perfil.
                </p>
              </div>

              <button
                onClick={() => handleSaveLinks()}
                disabled={savingLinks}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-brand-pink text-white font-bold text-xs hover:opacity-90 flex items-center gap-2 shadow-lg transition disabled:opacity-50"
              >
                {savingLinks ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Salvar Nova Ordem</span>
              </button>
            </div>

            <div className="space-y-3">
              {linksList.map((item, idx) => (
                <div
                  key={item.id}
                  className={`p-4 rounded-2xl border transition flex items-center justify-between gap-4 ${
                    item.active
                      ? 'bg-white/5 border-white/15 shadow-md'
                      : 'bg-black/40 border-white/5 opacity-50'
                  }`}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <span className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold text-xs flex items-center justify-center shrink-0">
                      #{idx + 1}
                    </span>

                    {item.image && item.image.trim() !== '' && (item.type === 'left-thumb' || item.type === 'card-photo' || item.type === 'hero-card') ? (
                      <div className="w-12 h-12 rounded-xl overflow-hidden relative shrink-0 border border-white/10 bg-dark-800">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.image}
                          alt={item.title}
                          className="absolute inset-0 w-full h-full object-cover"
                          onError={(e) => {
                            (e.currentTarget as HTMLElement).style.display = 'none';
                          }}
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-dark-800 border border-white/10 flex items-center justify-center shrink-0 text-gray-400">
                        <Layers className="w-5 h-5" />
                      </div>
                    )}

                    <div className="truncate">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-white truncate">{item.title}</h4>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-gray-300 font-medium shrink-0">
                          {item.type === 'cta-primary' ? 'VIP' : item.type === 'left-thumb' ? 'Miniatura' : item.type === 'card-photo' ? 'Card Foto' : 'Sem Foto'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 truncate mt-0.5">{item.subtitle || item.url}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => moveLinkItem(idx, 'up')}
                      disabled={idx === 0}
                      className="p-2 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-gray-300 disabled:opacity-20 transition"
                      title="Mover para cima"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => moveLinkItem(idx, 'down')}
                      disabled={idx === linksList.length - 1}
                      className="p-2 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-gray-300 disabled:opacity-20 transition"
                      title="Mover para baixo"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-white/10 flex justify-end">
              <button
                onClick={() => handleSaveLinks()}
                disabled={savingLinks}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-brand-pink text-white font-bold text-xs hover:opacity-90 flex items-center gap-2 shadow-lg transition disabled:opacity-50"
              >
                {savingLinks ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Salvar Nova Ordem</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

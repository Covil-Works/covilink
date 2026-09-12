'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  BarChart3,
  TrendingUp,
  Users,
  MousePointerClick,
  Smartphone,
  Monitor,
  Tablet,
  RefreshCw,
  Eye,
  EyeOff,
  ArrowLeft,
  Sparkles,
  RotateCcw,
  Zap,
  Globe,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  User,
  Image as ImageIcon,
  Edit3,
  LayoutList,
  Check,
  Crop,
  Layers,
  Sliders,
  ExternalLink,
  LogOut,
} from 'lucide-react';
import { useAuth, authFetch } from '@/lib/auth-client';
import { AnalyticsSummary } from '@/lib/analytics';
import { INITIAL_LINKS, LinkItem, SocialLink, INITIAL_PROFILE, ProfileConfig } from '@/lib/links-config';
import { SocialIcon } from '@/components/SocialIcons';
import GallerySection from './admin/GallerySection';
import GalleryPickerModal from './admin/GalleryPickerModal';
import ImageCropModal from './admin/ImageCropModal';
import GlobalSaveButton from './admin/GlobalSaveButton';

type TabType = 'metrics' | 'profile' | 'gallery' | 'socials' | 'buttons';

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
  { label: 'Botão com Miniatura na Esquerda', value: 'left-thumb', description: 'Foto miniatura na esquerda, título e subtítulo ao lado' },
  { label: 'Botão com Foto em Destaque (Card)', value: 'card-photo', description: 'Card visual grande com imagem de fundo' },
];

const BADGE_COLOR_OPTIONS = [
  { id: 'pink', label: 'Rosa', hex: '#ff3b94', bgClass: 'bg-[#ff3b94]' },
  { id: 'purple', label: 'Roxo', hex: '#9333ea', bgClass: 'bg-[#9333ea]' },
  { id: 'cyan', label: 'Ciano', hex: '#06b6d4', bgClass: 'bg-[#06b6d4]' },
  { id: 'emerald', label: 'Verde', hex: '#10b981', bgClass: 'bg-[#10b981]' },
  { id: 'amber', label: 'Âmbar', hex: '#f59e0b', bgClass: 'bg-[#f59e0b]' },
  { id: 'rose', label: 'Vermelho', hex: '#e11d48', bgClass: 'bg-[#e11d48]' },
  { id: 'white', label: 'Branco', hex: '#ffffff', bgClass: 'bg-[#ffffff]' },
  { id: 'dark', label: 'Grafite', hex: '#18181b', bgClass: 'bg-[#18181b]' },
];

export default function AdminDashboard() {
  const { user, signOutUser } = useAuth();
  const [metrics, setMetrics] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('metrics');
  
  // Profile state
  const [profile, setProfile] = useState<ProfileConfig>(INITIAL_PROFILE);
  const [savedProfile, setSavedProfile] = useState<ProfileConfig>(INITIAL_PROFILE);

  // Socials state
  const [socialsList, setSocialsList] = useState<SocialLink[]>([]);
  const [savedSocials, setSavedSocials] = useState<SocialLink[]>([]);

  // Links state
  const [linksList, setLinksList] = useState<LinkItem[]>(INITIAL_LINKS);
  const [savedLinks, setSavedLinks] = useState<LinkItem[]>(INITIAL_LINKS);

  // Global save state
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Gallery Picker & Crop Modal states for Profile / Buttons
  const [galleryPickerOpen, setGalleryPickerOpen] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<{
    type: 'avatar' | 'cover' | 'link-image';
    linkId?: string;
  } | null>(null);

  const [cropModalConfig, setCropModalConfig] = useState<{
    isOpen: boolean;
    imageUrl: string;
    position: string;
    fit: 'cover' | 'contain';
    aspectRatio: 'banner' | 'card' | 'square' | 'auto';
    showAvatarGuide: boolean;
    title: string;
    onSave: (url: string, position: string, fit: 'cover' | 'contain') => void;
  }>({
    isOpen: false,
    imageUrl: '',
    position: '50% 50%',
    fit: 'contain',
    aspectRatio: 'card',
    showAvatarGuide: false,
    title: 'Ajustar Enquadramento',
    onSave: () => {},
  });

  // Calculate pending unsaved changes
  const hasUnsavedChanges = Boolean(
    JSON.stringify(profile) !== JSON.stringify(savedProfile) ||
    JSON.stringify(socialsList) !== JSON.stringify(savedSocials) ||
    JSON.stringify(linksList) !== JSON.stringify(savedLinks)
  );

  // Fetch metrics from analytics API
  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const res = await authFetch('/api/metrics');
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
      const res = await authFetch('/api/profile');
      const data = await res.json();
      if (data && data.profile) {
        setProfile(data.profile);
        setSavedProfile(data.profile);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  };

  // Fetch Socials config
  const fetchSocials = async () => {
    try {
      const res = await authFetch('/api/socials');
      const data = await res.json();
      if (data && Array.isArray(data.socials)) {
        setSocialsList(data.socials);
        setSavedSocials(data.socials);
      }
    } catch (err) {
      console.error('Error fetching socials:', err);
    }
  };

  // Fetch Links config
  const fetchLinks = async () => {
    try {
      const res = await authFetch('/api/links');
      const data = await res.json();
      if (data && Array.isArray(data.links)) {
        setLinksList(data.links);
        setSavedLinks(data.links);
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

  // Global Save Handler
  const handleGlobalSave = async () => {
    setIsSaving(true);
    try {
      const promises: Promise<any>[] = [];

      // Save profile if changed
      if (JSON.stringify(profile) !== JSON.stringify(savedProfile)) {
        promises.push(
          authFetch('/api/profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ profile }),
          }).then(async (res) => {
            const data = await res.json();
            if (data?.profile) {
              setProfile(data.profile);
              setSavedProfile(data.profile);
            }
          })
        );
      }

      // Save socials if changed
      if (JSON.stringify(socialsList) !== JSON.stringify(savedSocials)) {
        promises.push(
          authFetch('/api/socials', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ socials: socialsList }),
          }).then(async (res) => {
            const data = await res.json();
            if (data && Array.isArray(data.socials)) {
              setSocialsList(data.socials);
              setSavedSocials(data.socials);
            }
          })
        );
      }

      // Save links if changed
      if (JSON.stringify(linksList) !== JSON.stringify(savedLinks)) {
        promises.push(
          authFetch('/api/links', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ links: linksList }),
          }).then(async (res) => {
            const data = await res.json();
            if (data && Array.isArray(data.links)) {
              setLinksList(data.links);
              setSavedLinks(data.links);
            }
          })
        );
      }

      await Promise.all(promises);

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2800);
    } catch (err) {
      console.error('Error saving changes globally:', err);
      alert('Houve um erro ao salvar as alterações. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  // Socials operations
  const handleResetSocials = async () => {
    if (!confirm('Restaurar as redes sociais padrão?')) return;
    try {
      const res = await authFetch('/api/socials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset' }),
      });
      const data = await res.json();
      if (data?.socials) {
        setSocialsList(data.socials);
        setSavedSocials(data.socials);
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
  const handleResetLinks = async () => {
    if (!confirm('Restaurar os botões originais?')) return;
    try {
      const res = await authFetch('/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset' }),
      });
      const data = await res.json();
      if (data?.links) {
        setLinksList(data.links);
        setSavedLinks(data.links);
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
    setLinksList((prev) => prev.filter((item) => item.id !== id));
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
      title: 'Novo Botão',
      subtitle: 'Descrição breve do botão',
      url: 'https://exemplo.com',
      image: '',
      imagePosition: '50% 50%',
      imageFit: 'contain',
      active: true,
      hasBlur: false,
      blurText: '',
      badge: '',
      badgeColor: 'pink',
      category: 'custom',
    };
    setLinksList((prev) => [...prev, newItem]);
  };

  // Gallery Picker open helpers
  const openGalleryForAvatar = () => {
    setPickerTarget({ type: 'avatar' });
    setGalleryPickerOpen(true);
  };

  const openGalleryForCover = () => {
    setPickerTarget({ type: 'cover' });
    setGalleryPickerOpen(true);
  };

  const openGalleryForLink = (linkId: string) => {
    setPickerTarget({ type: 'link-image', linkId });
    setGalleryPickerOpen(true);
  };

  const handleGallerySelectedImage = (url: string, position: string, fit: 'cover' | 'contain') => {
    if (!pickerTarget) return;

    if (pickerTarget.type === 'avatar') {
      setProfile((prev) => ({
        ...prev,
        avatarUrl: url,
      }));
    } else if (pickerTarget.type === 'cover') {
      setProfile((prev) => ({
        ...prev,
        coverImageUrl: url,
        coverPosition: position,
        coverFit: fit,
      }));
    } else if (pickerTarget.type === 'link-image' && pickerTarget.linkId) {
      updateLinkItem(pickerTarget.linkId, 'image', url);
      updateLinkItem(pickerTarget.linkId, 'imagePosition', position);
      updateLinkItem(pickerTarget.linkId, 'imageFit', fit);
    }
  };

  // Crop / Adjust open helpers
  const openCropForAvatar = () => {
    setCropModalConfig({
      isOpen: true,
      imageUrl: profile.avatarUrl || INITIAL_PROFILE.avatarUrl,
      position: '50% 50%',
      fit: 'contain',
      aspectRatio: 'square',
      showAvatarGuide: false,
      title: 'Ajustar Foto de Perfil',
      onSave: (newUrl) => {
        setProfile((prev) => ({ ...prev, avatarUrl: newUrl }));
      },
    });
  };

  const openCropForCover = () => {
    if (!profile.coverImageUrl) return;
    setCropModalConfig({
      isOpen: true,
      imageUrl: profile.coverImageUrl,
      position: profile.coverPosition || '50% 50%',
      fit: profile.coverFit || 'contain',
      aspectRatio: 'banner',
      showAvatarGuide: true,
      title: 'Ajustar Foto de Capa (Banner)',
      onSave: (newUrl, pos, fit) => {
        setProfile((prev) => ({
          ...prev,
          coverImageUrl: newUrl,
          coverPosition: pos,
          coverFit: fit,
        }));
      },
    });
  };

  const openCropForLink = (item: LinkItem) => {
    if (!item.image) return;
    setCropModalConfig({
      isOpen: true,
      imageUrl: item.image,
      position: item.imagePosition || '50% 50%',
      fit: item.imageFit || 'contain',
      aspectRatio: item.type === 'left-thumb' ? 'square' : 'card',
      showAvatarGuide: false,
      title: `Ajustar Imagem: ${item.title || 'Botão'}`,
      onSave: (newUrl, pos, fit) => {
        updateLinkItem(item.id, 'image', newUrl);
        updateLinkItem(item.id, 'imagePosition', pos);
        updateLinkItem(item.id, 'imageFit', fit);
      },
    });
  };

  const hasCoverImage = Boolean(
    profile.coverImageUrl &&
    profile.coverImageUrl.trim() !== '' &&
    profile.coverImageUrl !== profile.avatarUrl
  );

  return (
    <div className="min-h-screen bg-[#08090d] text-gray-100 font-sans selection:bg-brand-purple/30 flex flex-col md:flex-row pb-28 md:pb-12 overflow-x-hidden">
      
      {/* Desktop Lateral Sidebar */}
      <aside className="hidden md:flex w-64 border-r border-white/[0.08] p-6 flex-col justify-between bg-[#0b0c13] shrink-0 sticky top-0 h-screen z-30">
        <div className="space-y-6">
          
          {/* Logo & Portal Header */}
          <div className="flex items-center gap-3 pb-5 border-b border-white/[0.08]">
            <Link
              href="/"
              className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition"
              title="Voltar ao site público"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h2 className="text-sm font-bold tracking-tight text-white">Covilink Admin</h2>
              <span className="text-[10px] text-gray-400 font-medium">Painel Administrativo</span>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="space-y-1">
            <p className="text-[10px] uppercase font-semibold text-gray-500 tracking-wider px-3 mb-2">
              Seções
            </p>

            <button
              type="button"
              onClick={() => setActiveTab('metrics')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition text-left ${
                activeTab === 'metrics'
                  ? 'bg-white/10 text-white shadow-sm'
                  : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <BarChart3 className={`w-4 h-4 ${activeTab === 'metrics' ? 'text-brand-purple' : 'text-gray-400'}`} />
              <span>Métricas</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition text-left ${
                activeTab === 'profile'
                  ? 'bg-white/10 text-white shadow-sm'
                  : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <User className={`w-4 h-4 ${activeTab === 'profile' ? 'text-brand-cyan' : 'text-gray-400'}`} />
              <span>Perfil</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('gallery')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition text-left ${
                activeTab === 'gallery'
                  ? 'bg-white/10 text-white shadow-sm'
                  : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <ImageIcon className={`w-4 h-4 ${activeTab === 'gallery' ? 'text-brand-pink' : 'text-gray-400'}`} />
              <span>Galeria</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('socials')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition text-left ${
                activeTab === 'socials'
                  ? 'bg-white/10 text-white shadow-sm'
                  : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Globe className={`w-4 h-4 ${activeTab === 'socials' ? 'text-brand-pink' : 'text-gray-400'}`} />
              <span>Redes</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('buttons')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition text-left ${
                activeTab === 'buttons'
                  ? 'bg-white/10 text-white shadow-sm'
                  : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <LayoutList className={`w-4 h-4 ${activeTab === 'buttons' ? 'text-purple-400' : 'text-gray-400'}`} />
              <span>Botões</span>
            </button>
          </nav>

        </div>

        {/* Sidebar User Info & Footer */}
        <div className="pt-4 border-t border-white/[0.08] space-y-2.5">
          {/* Authenticated User Status */}
          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white/[0.03] border border-white/5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#ff3b94]/30 to-[#9333ea]/30 border border-white/15 flex items-center justify-center shrink-0 text-white text-xs font-bold overflow-hidden relative">
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || user.email || 'Admin'}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                <span>{(user?.email?.[0] || 'A').toUpperCase()}</span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-white truncate">
                {user?.displayName || (user?.email ? user.email.split('@')[0] : 'Administrador')}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 animate-pulse" />
                <span className="text-[10px] text-gray-400 truncate">
                  {user?.email || 'Conectado'}
                </span>
              </div>
            </div>
          </div>

          {/* Logout Button */}
          <button
            type="button"
            onClick={signOutUser}
            className="w-full py-2 px-3 rounded-xl border border-rose-500/20 hover:border-rose-500/40 bg-rose-500/5 hover:bg-rose-500/10 text-rose-300 hover:text-rose-200 font-medium text-xs flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sair do Admin</span>
          </button>

          <Link
            href="/"
            target="_blank"
            className="w-full py-2 px-3 rounded-xl border border-white/10 hover:border-white/20 bg-white/[0.02] hover:bg-white/[0.06] text-gray-300 hover:text-white font-medium text-xs flex items-center justify-center gap-2 transition"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Ver site público</span>
            <ExternalLink className="w-3 h-3 text-gray-500 ml-auto" />
          </Link>
        </div>
      </aside>

      {/* Floating Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-4 left-4 right-4 z-40 bg-[#0e1017]/95 backdrop-blur-xl border border-white/15 rounded-2xl shadow-2xl p-1.5 flex items-center justify-around">
        <button
          type="button"
          onClick={() => setActiveTab('metrics')}
          className={`flex flex-col items-center gap-1 px-2 py-1 rounded-xl text-[10px] font-semibold transition ${
            activeTab === 'metrics'
              ? 'text-white bg-white/10'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Métricas</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center gap-1 px-2 py-1 rounded-xl text-[10px] font-semibold transition ${
            activeTab === 'profile'
              ? 'text-white bg-white/10'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Perfil</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('gallery')}
          className={`flex flex-col items-center gap-1 px-2 py-1 rounded-xl text-[10px] font-semibold transition ${
            activeTab === 'gallery'
              ? 'text-white bg-white/10'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>Galeria</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('socials')}
          className={`flex flex-col items-center gap-1 px-2 py-1 rounded-xl text-[10px] font-semibold transition ${
            activeTab === 'socials'
              ? 'text-white bg-white/10'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>Redes</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('buttons')}
          className={`flex flex-col items-center gap-1 px-2 py-1 rounded-xl text-[10px] font-semibold transition ${
            activeTab === 'buttons'
              ? 'text-white bg-white/10'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <LayoutList className="w-4 h-4" />
          <span>Botões</span>
        </button>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-5xl mx-auto w-full">
        
        {/* Mobile Top Header */}
        <header className="flex md:hidden items-center justify-between gap-3 mb-6 pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <Link
              href="/"
              className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-300"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-sm font-bold text-white tracking-tight">Covilink Admin</h1>
              <p className="text-[10px] text-gray-400">
                {activeTab === 'metrics' && 'Métricas'}
                {activeTab === 'profile' && 'Perfil'}
                {activeTab === 'gallery' && 'Galeria'}
                {activeTab === 'socials' && 'Redes'}
                {activeTab === 'buttons' && 'Botões'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={signOutUser}
              title="Sair do Admin"
              className="p-1.5 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-300 hover:text-rose-200 transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
            <Link
              href="/"
              target="_blank"
              className="px-2.5 py-1.5 rounded-xl border border-white/10 bg-white/5 text-[11px] font-medium text-gray-200 flex items-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Ver site</span>
            </Link>
          </div>
        </header>

        {/* TAB 1: METRICS */}
        {activeTab === 'metrics' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-brand-purple" />
                  <span>Métricas & Analytics</span>
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                  Acompanhe cliques e visitantes do seu portal em tempo real.
                </p>
              </div>

              <button
                type="button"
                onClick={fetchMetrics}
                disabled={loading}
                className="px-3 py-1.5 rounded-xl border border-white/10 hover:bg-white/5 text-xs font-medium text-gray-300 hover:text-white flex items-center gap-1.5 transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Atualizar</span>
              </button>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              <div className="rounded-2xl p-4 border border-white/[0.08] bg-[#0e1017]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">Total de Cliques</span>
                  <MousePointerClick className="w-4 h-4 text-brand-pink" />
                </div>
                <div className="text-2xl font-bold text-white tracking-tight">
                  {loading ? '...' : metrics?.totalClicks || 0}
                </div>
                <div className="flex items-center gap-1 text-[11px] text-brand-pink mt-1 font-medium">
                  <TrendingUp className="w-3 h-3" />
                  <span>Cliques registrados</span>
                </div>
              </div>

              <div className="rounded-2xl p-4 border border-white/[0.08] bg-[#0e1017]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">Visitantes Únicos</span>
                  <Users className="w-4 h-4 text-brand-purple" />
                </div>
                <div className="text-2xl font-bold text-white tracking-tight">
                  {loading ? '...' : metrics?.uniqueVisitors || 0}
                </div>
                <div className="text-[11px] text-gray-400 mt-1">
                  Estimativa por sessão
                </div>
              </div>

              <div className="rounded-2xl p-4 border border-white/[0.08] bg-[#0e1017]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">Top Link</span>
                  <Zap className="w-4 h-4 text-brand-cyan" />
                </div>
                <div className="text-sm font-bold text-white truncate">
                  {loading ? '...' : metrics?.topPerformingLink?.title || 'Nenhum ainda'}
                </div>
                <div className="text-[11px] text-gray-400 mt-1">
                  {metrics?.topPerformingLink ? `${metrics.topPerformingLink.clicks} cliques` : '-'}
                </div>
              </div>

              <div className="rounded-2xl p-4 border border-white/[0.08] bg-[#0e1017]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">Engajamento</span>
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-bold text-white tracking-tight">
                  84.2%
                </div>
                <div className="text-[11px] text-emerald-400 mt-1 font-medium">
                  Taxa de conversão visual
                </div>
              </div>
            </div>

            {/* Tables & Breakdowns */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Clicks Table */}
              <div className="lg:col-span-2 rounded-2xl p-5 border border-white/[0.08] bg-[#0e1017]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-white">Cliques por Link</h3>
                  <span className="text-[11px] text-gray-400">
                    {metrics ? Object.keys(metrics.clicksByLink).length : 0} links rastreados
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/[0.08] text-gray-400 font-medium">
                        <th className="pb-2.5">Link</th>
                        <th className="pb-2.5 text-center">Cliques</th>
                        <th className="pb-2.5 text-right">Participação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04]">
                      {metrics && Object.values(metrics.clicksByLink).length > 0 ? (
                        Object.values(metrics.clicksByLink)
                          .sort((a, b) => b.clicks - a.clicks)
                          .map((item) => {
                            const percent = metrics.totalClicks > 0
                              ? Math.round((item.clicks / metrics.totalClicks) * 100)
                              : 0;

                            return (
                              <tr key={item.id} className="hover:bg-white/[0.02] transition">
                                <td className="py-2.5 pr-2">
                                  <div className="font-medium text-white truncate max-w-xs">{item.title}</div>
                                  <div className="text-[10px] text-gray-500 truncate max-w-xs">{item.url}</div>
                                </td>
                                <td className="py-2.5 px-2 text-center font-bold text-brand-pink">
                                  {item.clicks}
                                </td>
                                <td className="py-2.5 pl-2 text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    <div className="w-16 h-1 bg-white/10 rounded-full overflow-hidden">
                                      <div
                                        className="h-full bg-brand-pink rounded-full"
                                        style={{ width: `${percent}%` }}
                                      />
                                    </div>
                                    <span className="font-mono text-gray-400 w-7">{percent}%</span>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                      ) : (
                        <tr>
                          <td colSpan={3} className="py-6 text-center text-gray-500">
                            Nenhum clique registrado ainda.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Device Breakdown */}
              <div className="rounded-2xl p-5 border border-white/[0.08] bg-[#0e1017] space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-white">Dispositivos</h3>
                  <p className="text-[11px] text-gray-400 mt-0.5">Origem dos acessos</p>
                </div>

                {metrics && (
                  <div className="space-y-3 pt-1">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="flex items-center gap-1.5 text-gray-300">
                          <Smartphone className="w-3.5 h-3.5 text-brand-pink" /> Mobile
                        </span>
                        <span className="font-bold text-white">
                          {metrics.totalClicks > 0
                            ? Math.round((metrics.deviceBreakdown.mobile / metrics.totalClicks) * 100)
                            : 0}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-brand-pink rounded-full"
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
                      <div className="flex justify-between text-xs mb-1">
                        <span className="flex items-center gap-1.5 text-gray-300">
                          <Monitor className="w-3.5 h-3.5 text-brand-cyan" /> Desktop
                        </span>
                        <span className="font-bold text-white">
                          {metrics.totalClicks > 0
                            ? Math.round((metrics.deviceBreakdown.desktop / metrics.totalClicks) * 100)
                            : 0}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-brand-cyan rounded-full"
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
                      <div className="flex justify-between text-xs mb-1">
                        <span className="flex items-center gap-1.5 text-gray-300">
                          <Tablet className="w-3.5 h-3.5 text-brand-purple" /> Tablet
                        </span>
                        <span className="font-bold text-white">
                          {metrics.totalClicks > 0
                            ? Math.round((metrics.deviceBreakdown.tablet / metrics.totalClicks) * 100)
                            : 0}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-brand-purple rounded-full"
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
        )}

        {/* TAB 2: PROFILE */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            
            {/* Header */}
            <div className="pb-4 border-b border-white/[0.08]">
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <User className="w-5 h-5 text-brand-cyan" />
                <span>Editar Perfil</span>
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                Configure as informações visuais e de contato do seu perfil.
              </p>
            </div>

            {/* Profile Live Card Preview */}
            <div className="rounded-2xl border border-white/[0.08] bg-[#0e1017] p-5 flex flex-col items-center relative overflow-hidden">
              
              {/* Banner Cover Box */}
              <div className="w-full h-32 rounded-xl relative overflow-hidden mb-[-40px] bg-dark-900 border border-white/10 flex items-center justify-center">
                {hasCoverImage ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={profile.coverImageUrl}
                    alt="Capa do Perfil"
                    className="absolute inset-0 w-full h-full"
                    style={{
                      objectPosition: profile.coverPosition || '50% 50%',
                      objectFit: profile.coverFit || 'contain',
                    }}
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-white/[0.05] via-[#0b0c13] to-white/[0.02] flex items-center justify-center">
                    <span className="text-[11px] text-gray-500 font-medium">Gradiente escuro padrão ativo</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#08090d]/80 via-transparent to-black/20 pointer-events-none" />
              </div>

              {/* Avatar Circle */}
              <div className="w-20 h-20 rounded-full overflow-hidden bg-dark-900 border-2 border-white/20 shadow-xl relative z-10 shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={profile.avatarUrl || INITIAL_PROFILE.avatarUrl}
                  alt={profile.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = INITIAL_PROFILE.avatarUrl;
                  }}
                />
              </div>

              {/* Name & details */}
              <div className="text-center mt-3 space-y-1">
                <div className="flex items-center justify-center gap-1.5">
                  <h3 className="text-base font-bold text-white">{profile.name || 'Seu Nome'}</h3>
                  {profile.isVerified && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src="/images/verify.webp"
                      alt="Verificado"
                      className="w-4 h-4 object-contain shrink-0"
                      onError={(e) => {
                        (e.currentTarget as HTMLElement).style.display = 'none';
                      }}
                    />
                  )}
                </div>

                {profile.showHandle !== false && (
                  <p className="text-xs text-gray-400 font-mono">{profile.handle || '@usuario'}</p>
                )}

                {profile.showBio !== false && profile.bio && (
                  <p className="text-xs text-gray-300 max-w-sm mx-auto pt-0.5">{profile.bio}</p>
                )}
              </div>

            </div>

            {/* Photo Selection Area (CENTRALIZED IN GALLERY) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Foto de Perfil (Avatar) */}
              <div className="p-4 rounded-2xl border border-white/[0.08] bg-[#0e1017] space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-white">Foto de Perfil (Avatar)</label>
                  <span className="text-[11px] text-gray-500">Proporção quadrada 1:1</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-full overflow-hidden bg-dark-900 border border-white/15 shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={profile.avatarUrl || INITIAL_PROFILE.avatarUrl}
                      alt="Avatar atual"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = INITIAL_PROFILE.avatarUrl;
                      }}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5 flex-1">
                    <button
                      type="button"
                      onClick={openGalleryForAvatar}
                      className="px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-semibold text-white flex items-center justify-center gap-1.5 transition"
                    >
                      <ImageIcon className="w-3.5 h-3.5 text-brand-cyan" />
                      <span>Escolher da Galeria</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={openCropForAvatar}
                        className="px-2.5 py-1 rounded-lg border border-white/10 text-[11px] font-medium text-gray-300 hover:text-white hover:bg-white/5 transition flex-1 text-center"
                      >
                        Ajustar foto
                      </button>

                      <button
                        type="button"
                        onClick={() => setProfile((p) => ({ ...p, avatarUrl: INITIAL_PROFILE.avatarUrl }))}
                        className="px-2.5 py-1 rounded-lg border border-white/10 text-[11px] font-medium text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition"
                        title="Restaurar avatar padrão"
                      >
                        Padrão
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Foto de Capa (Banner) */}
              <div className="p-4 rounded-2xl border border-white/[0.08] bg-[#0e1017] space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-white">Foto de Capa (Header)</label>
                  <span className="text-[11px] text-gray-500">
                    {hasCoverImage ? 'Foto personalizada ativa' : 'Sem foto (Gradiente ativo)'}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-dark-900 border border-white/15 shrink-0 flex items-center justify-center">
                    {hasCoverImage ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={profile.coverImageUrl}
                        alt="Capa atual"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.currentTarget as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-white/[0.05] via-[#0b0c13] to-white/[0.02]" />
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5 flex-1">
                    <button
                      type="button"
                      onClick={openGalleryForCover}
                      className="px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-semibold text-white flex items-center justify-center gap-1.5 transition"
                    >
                      <ImageIcon className="w-3.5 h-3.5 text-brand-pink" />
                      <span>Escolher da Galeria</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      {hasCoverImage && (
                        <button
                          type="button"
                          onClick={openCropForCover}
                          className="px-2.5 py-1 rounded-lg border border-white/10 text-[11px] font-medium text-gray-300 hover:text-white hover:bg-white/5 transition flex-1 text-center"
                        >
                          Ajustar capa
                        </button>
                      )}

                      {hasCoverImage && (
                        <button
                          type="button"
                          onClick={() => setProfile((p) => ({ ...p, coverImageUrl: '' }))}
                          className="px-2.5 py-1 rounded-lg border border-white/10 text-[11px] font-medium text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition"
                          title="Remover foto de capa para exibir gradiente dark"
                        >
                          Remover capa
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Profile Fields */}
            <div className="p-5 rounded-2xl border border-white/[0.08] bg-[#0e1017] space-y-4">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Informações do Perfil
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Nome */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-gray-300">Nome Exibido</label>
                    <button
                      type="button"
                      onClick={() => setProfile((p) => ({ ...p, isVerified: !p.isVerified }))}
                      className={`text-[10px] px-2 py-0.5 rounded-md border transition font-medium flex items-center gap-1 ${
                        profile.isVerified
                          ? 'bg-blue-500/15 text-blue-300 border-blue-500/30'
                          : 'bg-white/5 text-gray-400 border-white/10'
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/images/verify.webp" alt="V" className="w-3 h-3 object-contain" />
                      <span>{profile.isVerified ? 'Verificado' : 'Sem selo'}</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                    placeholder="Seu Nome"
                    className="w-full bg-dark-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-cyan transition"
                  />
                </div>

                {/* Arroba */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-gray-300">Arroba / Handle (@)</label>
                    <button
                      type="button"
                      onClick={() => setProfile((p) => ({ ...p, showHandle: p.showHandle === false ? true : false }))}
                      className={`text-[10px] px-2 py-0.5 rounded-md border transition font-medium flex items-center gap-1 ${
                        profile.showHandle !== false
                          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                          : 'bg-white/5 text-gray-400 border-white/10'
                      }`}
                    >
                      {profile.showHandle !== false ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      <span>{profile.showHandle !== false ? 'Visível' : 'Oculto'}</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    value={profile.handle}
                    onChange={(e) => setProfile((p) => ({ ...p, handle: e.target.value }))}
                    placeholder="@seuusuario"
                    className="w-full bg-dark-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-cyan transition font-mono"
                  />
                </div>

                {/* E-mail de Contato */}
                <div className="sm:col-span-2 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-gray-300">E-mail de Contato</label>
                    <button
                      type="button"
                      onClick={() => setProfile((p) => ({ ...p, showContactEmail: p.showContactEmail === false ? true : false }))}
                      className={`text-[10px] px-2 py-0.5 rounded-md border transition font-medium flex items-center gap-1 ${
                        profile.showContactEmail !== false
                          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                          : 'bg-white/5 text-gray-400 border-white/10'
                      }`}
                    >
                      {profile.showContactEmail !== false ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      <span>{profile.showContactEmail !== false ? 'Visível' : 'Oculto'}</span>
                    </button>
                  </div>
                  <input
                    type="email"
                    value={profile.contactEmail}
                    onChange={(e) => setProfile((p) => ({ ...p, contactEmail: e.target.value }))}
                    placeholder="contato@exemplo.com"
                    className="w-full bg-dark-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-cyan transition font-mono"
                  />
                </div>

                {/* Bio */}
                <div className="sm:col-span-2 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-gray-300">Bio / Descrição</label>
                    <button
                      type="button"
                      onClick={() => setProfile((p) => ({ ...p, showBio: p.showBio === false ? true : false }))}
                      className={`text-[10px] px-2 py-0.5 rounded-md border transition font-medium flex items-center gap-1 ${
                        profile.showBio !== false
                          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                          : 'bg-white/5 text-gray-400 border-white/10'
                      }`}
                    >
                      {profile.showBio !== false ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      <span>{profile.showBio !== false ? 'Visível' : 'Oculto'}</span>
                    </button>
                  </div>
                  <textarea
                    rows={2}
                    value={profile.bio}
                    onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))}
                    placeholder="Escreva sua bio..."
                    className="w-full bg-dark-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-cyan transition resize-none"
                  />
                </div>

              </div>
            </div>

          </div>
        )}

        {/* TAB 3: GALLERY (NEW MAIN SECTION) */}
        {activeTab === 'gallery' && (
          <GallerySection />
        )}

        {/* TAB 4: SOCIALS */}
        {activeTab === 'socials' && (
          <div className="space-y-6">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                  <Globe className="w-5 h-5 text-brand-pink" />
                  <span>Redes Sociais</span>
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                  Gerencie os ícones de redes sociais exibidos no topo do perfil.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetSocials}
                  className="px-3 py-1.5 rounded-xl border border-white/10 text-xs font-medium text-gray-300 hover:text-white hover:bg-white/5 transition flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restaurar Padrão</span>
                </button>

                <button
                  type="button"
                  onClick={() => addSocialItem()}
                  className="px-3.5 py-1.5 rounded-xl bg-white text-dark-900 text-xs font-semibold hover:bg-gray-200 transition shadow flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Adicionar Rede</span>
                </button>
              </div>
            </div>

            {/* Quick Add Presets */}
            <div className="space-y-2">
              <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">Atalhos Rápidos:</span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { platform: 'instagram', name: 'Instagram' },
                  { platform: 'youtube', name: 'YouTube' },
                  { platform: 'tiktok', name: 'TikTok' },
                  { platform: 'whatsapp', name: 'WhatsApp' },
                  { platform: 'twitter', name: 'X' },
                  { platform: 'spotify', name: 'Spotify' },
                  { platform: 'linkedin', name: 'LinkedIn' },
                  { platform: 'github', name: 'GitHub' },
                  { platform: 'discord', name: 'Discord' },
                  { platform: 'telegram', name: 'Telegram' },
                  { platform: 'website', name: 'Website' },
                ].map((item) => (
                  <button
                    key={item.platform}
                    type="button"
                    onClick={() => addSocialItem(item.platform as SocialLink['platform'])}
                    className="px-2.5 py-1 rounded-lg border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] text-xs font-medium text-gray-300 hover:text-white flex items-center gap-1.5 transition"
                  >
                    <SocialIcon platform={item.platform} className="w-3.5 h-3.5 shrink-0" />
                    <span>+{item.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Social Links List */}
            <div className="space-y-3 pt-2">
              {socialsList.length === 0 ? (
                <div className="text-center py-12 text-gray-500 text-xs border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
                  Nenhuma rede social cadastrada. Adicione uma rede acima.
                </div>
              ) : (
                socialsList.map((item, idx) => (
                  <div
                    key={item.id}
                    className={`p-3.5 rounded-2xl border transition flex flex-col md:flex-row items-start md:items-center justify-between gap-3 ${
                      item.active !== false
                        ? 'bg-[#0e1017] border-white/10'
                        : 'bg-black/30 border-white/[0.05] opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 w-full md:w-auto">
                      {/* Move controls */}
                      <div className="flex flex-col gap-0.5">
                        <button
                          type="button"
                          onClick={() => moveSocialItem(idx, 'up')}
                          disabled={idx === 0}
                          className="p-1 rounded text-gray-400 hover:text-white disabled:opacity-20 transition"
                          title="Mover para cima"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveSocialItem(idx, 'down')}
                          disabled={idx === socialsList.length - 1}
                          className="p-1 rounded text-gray-400 hover:text-white disabled:opacity-20 transition"
                          title="Mover para baixo"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Icon */}
                      <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                        <SocialIcon platform={item.platform} className="w-4 h-4" />
                      </div>

                      {/* Platform Select */}
                      <div className="flex-1 md:w-36">
                        <select
                          value={item.platform}
                          onChange={(e) => updateSocialItem(item.id, 'platform', e.target.value)}
                          className="w-full bg-dark-900 border border-white/10 rounded-xl px-2 py-1.5 text-xs text-white focus:outline-none focus:border-brand-pink"
                        >
                          {PLATFORM_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value} className="bg-dark-900 text-white">
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Inputs */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full md:flex-1">
                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) => updateSocialItem(item.id, 'title', e.target.value)}
                        placeholder="Nome / Rótulo"
                        className="w-full bg-dark-900 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-brand-pink"
                      />

                      <input
                        type="text"
                        value={item.url}
                        onChange={(e) => updateSocialItem(item.id, 'url', e.target.value)}
                        placeholder="https://..."
                        className="w-full bg-dark-900 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-brand-pink font-mono"
                      />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 self-end md:self-auto shrink-0 pt-1 md:pt-0">
                      <button
                        type="button"
                        onClick={() => toggleSocialActive(item.id)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition border ${
                          item.active !== false
                            ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                            : 'bg-white/5 text-gray-400 border-white/10'
                        }`}
                      >
                        {item.active !== false ? 'Ativo' : 'Oculto'}
                      </button>

                      <button
                        type="button"
                        onClick={() => removeSocialItem(item.id)}
                        className="p-1.5 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10 transition"
                        title="Excluir rede"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>
        )}

        {/* TAB 5: BUTTONS (WITH BUILT-IN REORDERING) */}
        {activeTab === 'buttons' && (
          <div className="space-y-6">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                  <LayoutList className="w-5 h-5 text-purple-400" />
                  <span>Botões do Site</span>
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                  Crie, configure e reorganize os botões e cards visuais do seu portal.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetLinks}
                  className="px-3 py-1.5 rounded-xl border border-white/10 text-xs font-medium text-gray-300 hover:text-white hover:bg-white/5 transition flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restaurar Padrão</span>
                </button>

                <button
                  type="button"
                  onClick={() => addNewButton('no-photo')}
                  className="px-3.5 py-1.5 rounded-xl bg-white text-dark-900 text-xs font-semibold hover:bg-gray-200 transition shadow flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Novo Botão</span>
                </button>
              </div>
            </div>

            {/* Quick Add Presets */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => addNewButton('no-photo')}
                className="p-3 rounded-xl border border-white/10 bg-[#0e1017] hover:border-white/20 hover:bg-white/[0.03] transition text-left space-y-1"
              >
                <div className="text-xs font-semibold text-white">Botão Simples</div>
                <div className="text-[10px] text-gray-400">Texto sem foto</div>
              </button>

              <button
                type="button"
                onClick={() => addNewButton('left-thumb')}
                className="p-3 rounded-xl border border-white/10 bg-[#0e1017] hover:border-white/20 hover:bg-white/[0.03] transition text-left space-y-1"
              >
                <div className="text-xs font-semibold text-white">Miniatura Esquerda</div>
                <div className="text-[10px] text-gray-400">Foto pequena lateral</div>
              </button>

              <button
                type="button"
                onClick={() => addNewButton('card-photo')}
                className="p-3 rounded-xl border border-white/10 bg-[#0e1017] hover:border-white/20 hover:bg-white/[0.03] transition text-left space-y-1"
              >
                <div className="text-xs font-semibold text-white">Card com Foto</div>
                <div className="text-[10px] text-gray-400">Card visual grande</div>
              </button>
            </div>

            {/* List of Buttons with integrated reordering */}
            <div className="space-y-4 pt-2">
              {linksList.map((item, idx) => (
                <div
                  key={item.id}
                  className={`p-4 rounded-2xl border transition space-y-4 ${
                    item.active
                      ? 'bg-[#0e1017] border-white/10 shadow-sm'
                      : 'bg-black/30 border-white/[0.05] opacity-60'
                  }`}
                >
                  {/* Top Bar of item: position, title, reorder buttons, status */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
                    
                    <div className="flex items-center gap-3">
                      {/* Position & Move Up/Down Controls */}
                      <div className="flex items-center gap-1">
                        <span className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 text-[11px] font-mono font-semibold text-gray-400 flex items-center justify-center">
                          #{idx + 1}
                        </span>

                        <div className="flex flex-col gap-0.5">
                          <button
                            type="button"
                            onClick={() => moveLinkItem(idx, 'up')}
                            disabled={idx === 0}
                            className="p-1 rounded text-gray-400 hover:text-white disabled:opacity-20 transition"
                            title="Mover para cima"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveLinkItem(idx, 'down')}
                            disabled={idx === linksList.length - 1}
                            className="p-1 rounded text-gray-400 hover:text-white disabled:opacity-20 transition"
                            title="Mover para baixo"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Title & tags */}
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-semibold text-white">{item.title || 'Sem título'}</h4>
                          {item.badge && item.badge.trim() !== '' && (
                            <span
                              className="px-2 py-0.5 rounded-md text-[9px] font-semibold border uppercase tracking-wider"
                              style={{
                                backgroundColor: item.badgeColor?.startsWith('#')
                                  ? `${item.badgeColor}22`
                                  : BADGE_COLOR_OPTIONS.find((b) => b.id === item.badgeColor)?.hex
                                  ? `${BADGE_COLOR_OPTIONS.find((b) => b.id === item.badgeColor)?.hex}22`
                                  : '#ff3b9422',
                                borderColor: item.badgeColor?.startsWith('#')
                                  ? `${item.badgeColor}55`
                                  : BADGE_COLOR_OPTIONS.find((b) => b.id === item.badgeColor)?.hex
                                  ? `${BADGE_COLOR_OPTIONS.find((b) => b.id === item.badgeColor)?.hex}55`
                                  : '#ff3b9455',
                                color: item.badgeColor?.startsWith('#')
                                  ? item.badgeColor
                                  : BADGE_COLOR_OPTIONS.find((b) => b.id === item.badgeColor)?.hex || '#ff3b94',
                              }}
                            >
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-gray-400">
                          {BUTTON_TYPE_OPTIONS.find((b) => b.value === item.type)?.label || item.type}
                        </p>
                      </div>
                    </div>

                    {/* Toggle Active & Delete */}
                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <button
                        type="button"
                        onClick={() => toggleLinkActive(item.id)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition border ${
                          item.active
                            ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                            : 'bg-white/5 text-gray-400 border-white/10'
                        }`}
                      >
                        {item.active ? 'Ativo' : 'Oculto'}
                      </button>

                      <button
                        type="button"
                        onClick={() => removeLinkItem(item.id)}
                        className="p-1.5 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10 transition"
                        title="Excluir Botão"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </div>

                  {/* Form fields for button */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    
                    {/* Estilo */}
                    <div>
                      <label className="text-[10px] text-gray-400 uppercase font-semibold block mb-1">
                        Estilo do Botão
                      </label>
                      <select
                        value={item.type}
                        onChange={(e) => updateLinkItem(item.id, 'type', e.target.value)}
                        className="w-full bg-dark-900 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-brand-purple"
                      >
                        {BUTTON_TYPE_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value} className="bg-dark-900 text-white">
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Título */}
                    <div>
                      <label className="text-[10px] text-gray-400 uppercase font-semibold block mb-1">
                        Título
                      </label>
                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) => updateLinkItem(item.id, 'title', e.target.value)}
                        placeholder="Ex: Ver Mentoria"
                        className="w-full bg-dark-900 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-brand-purple"
                      />
                    </div>

                    {/* Subtítulo */}
                    <div>
                      <label className="text-[10px] text-gray-400 uppercase font-semibold block mb-1">
                        Subtítulo (Opcional)
                      </label>
                      <input
                        type="text"
                        value={item.subtitle || ''}
                        onChange={(e) => updateLinkItem(item.id, 'subtitle', e.target.value)}
                        placeholder="Ex: Sessão 1-on-1 exclusiva"
                        className="w-full bg-dark-900 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-brand-purple"
                      />
                    </div>

                    {/* URL */}
                    <div className="md:col-span-2">
                      <label className="text-[10px] text-gray-400 uppercase font-semibold block mb-1">
                        URL de Destino
                      </label>
                      <input
                        type="text"
                        value={item.url}
                        onChange={(e) => updateLinkItem(item.id, 'url', e.target.value)}
                        placeholder="https://..."
                        className="w-full bg-dark-900 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-brand-purple font-mono"
                      />
                    </div>

                    {/* Tag / Selo (Badge) */}
                    <div>
                      <label className="text-[10px] text-gray-400 uppercase font-semibold block mb-1">
                        Selo / Tag (Opcional)
                      </label>
                      <input
                        type="text"
                        value={item.badge || ''}
                        onChange={(e) => updateLinkItem(item.id, 'badge', e.target.value)}
                        placeholder="Ex: Destaque, VIP"
                        className="w-full bg-dark-900 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-brand-purple"
                      />
                    </div>

                    {/* Badge Color Picker */}
                    {item.badge && item.badge.trim() !== '' && (
                      <div className="md:col-span-3 flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                        <span className="text-[11px] text-gray-400 font-medium">Cor do Selo:</span>
                        <div className="flex items-center gap-1.5">
                          {BADGE_COLOR_OPTIONS.map((c) => {
                            const isSelected = (!item.badgeColor && c.id === 'pink') || item.badgeColor === c.id || item.badgeColor === c.hex;
                            return (
                              <button
                                key={c.id}
                                type="button"
                                onClick={() => updateLinkItem(item.id, 'badgeColor', c.id)}
                                className={`w-4 h-4 rounded-full ${c.bgClass} transition flex items-center justify-center ${
                                  isSelected ? 'ring-2 ring-white scale-110' : 'opacity-60 hover:opacity-100'
                                }`}
                                title={c.label}
                              />
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Image handling via Gallery if button type supports image */}
                    {item.type !== 'no-photo' && (
                      <div className="md:col-span-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-dark-900 overflow-hidden border border-white/10 flex items-center justify-center shrink-0">
                            {item.image && item.image.trim() !== '' ? (
                              /* eslint-disable-next-line @next/next/no-img-element */
                              <img
                                src={item.image}
                                alt="Foto do botão"
                                className="w-full h-full"
                                style={{
                                  objectFit: item.imageFit || 'contain',
                                  objectPosition: item.imagePosition || '50% 50%',
                                }}
                                onError={(e) => {
                                  (e.currentTarget as HTMLElement).style.display = 'none';
                                }}
                              />
                            ) : (
                              <ImageIcon className="w-5 h-5 text-gray-500" />
                            )}
                          </div>

                          <div>
                            <span className="text-xs font-semibold text-white block">Foto do Botão</span>
                            <span className="text-[11px] text-gray-400">
                              {item.image ? 'Foto selecionada da Galeria' : 'Nenhuma imagem selecionada'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openGalleryForLink(item.id)}
                            className="px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-semibold text-white transition flex items-center gap-1.5"
                          >
                            <ImageIcon className="w-3.5 h-3.5 text-brand-cyan" />
                            <span>{item.image ? 'Trocar Imagem' : 'Escolher da Galeria'}</span>
                          </button>

                          {item.image && (
                            <button
                              type="button"
                              onClick={() => openCropForLink(item)}
                              className="px-3 py-1.5 rounded-xl border border-white/10 text-xs font-medium text-gray-300 hover:text-white hover:bg-white/5 transition"
                            >
                              Ajustar
                            </button>
                          )}

                          {item.image && (
                            <button
                              type="button"
                              onClick={() => updateLinkItem(item.id, 'image', '')}
                              className="p-1.5 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10 transition"
                              title="Remover foto"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Blur Toggle Option */}
                    {item.type !== 'no-photo' && (
                      <div className="md:col-span-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                              <EyeOff className="w-3.5 h-3.5 text-purple-400" />
                              <span>Efeito Blur com Revelação</span>
                            </div>
                            <p className="text-[11px] text-gray-400 mt-0.5">
                              A imagem inicia borrada e revela a foto ao clicar.
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => updateLinkItem(item.id, 'hasBlur', !item.hasBlur)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition border ${
                              item.hasBlur
                                ? 'bg-purple-600/20 text-purple-300 border-purple-500/40'
                                : 'bg-white/5 text-gray-400 border-white/10'
                            }`}
                          >
                            {item.hasBlur ? 'Blur Ativado' : 'Sem Blur'}
                          </button>
                        </div>

                        {item.hasBlur && (
                          <div className="pt-2 border-t border-white/[0.06] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                            <label className="text-[11px] text-gray-300 font-medium">Texto de Revelação:</label>
                            <input
                              type="text"
                              value={item.blurText !== undefined ? item.blurText : ''}
                              onChange={(e) => updateLinkItem(item.id, 'blurText', e.target.value)}
                              placeholder="Clique para ver a foto"
                              className="w-full sm:w-64 bg-dark-900 border border-white/10 rounded-xl px-2.5 py-1 text-xs text-white focus:outline-none focus:border-purple-400"
                            />
                          </div>
                        )}
                      </div>
                    )}

                  </div>

                </div>
              ))}
            </div>

          </div>
        )}

      </main>

      {/* Global Floating Save Button */}
      <GlobalSaveButton
        hasUnsavedChanges={hasUnsavedChanges}
        onSave={handleGlobalSave}
        isSaving={isSaving}
        saveSuccess={saveSuccess}
      />

      {/* Gallery Picker Modal for Profile & Buttons */}
      <GalleryPickerModal
        isOpen={galleryPickerOpen}
        onClose={() => {
          setGalleryPickerOpen(false);
          setPickerTarget(null);
        }}
        onSelectImage={handleGallerySelectedImage}
        currentUrl={
          pickerTarget?.type === 'avatar'
            ? profile.avatarUrl
            : pickerTarget?.type === 'cover'
            ? profile.coverImageUrl
            : pickerTarget?.linkId
            ? linksList.find((l) => l.id === pickerTarget.linkId)?.image
            : undefined
        }
        targetTitle={
          pickerTarget?.type === 'avatar'
            ? 'Foto de Perfil'
            : pickerTarget?.type === 'cover'
            ? 'Foto de Capa'
            : 'Foto do Botão'
        }
        aspectRatio={
          pickerTarget?.type === 'avatar'
            ? 'square'
            : pickerTarget?.type === 'cover'
            ? 'banner'
            : pickerTarget?.linkId && linksList.find((l) => l.id === pickerTarget.linkId)?.type === 'left-thumb'
            ? 'square'
            : 'card'
        }
        showAvatarGuide={pickerTarget?.type === 'cover'}
      />

      {/* Unified Image Crop Modal */}
      {cropModalConfig.isOpen && (
        <ImageCropModal
          isOpen={cropModalConfig.isOpen}
          onClose={() => setCropModalConfig((prev) => ({ ...prev, isOpen: false }))}
          imageUrl={cropModalConfig.imageUrl}
          initialPosition={cropModalConfig.position}
          initialFit={cropModalConfig.fit}
          aspectRatio={cropModalConfig.aspectRatio}
          showAvatarGuide={cropModalConfig.showAvatarGuide}
          title={cropModalConfig.title}
          onSaveCrop={(url, pos, fit) => {
            cropModalConfig.onSave(url, pos, fit);
            setCropModalConfig((prev) => ({ ...prev, isOpen: false }));
          }}
        />
      )}

    </div>
  );
}

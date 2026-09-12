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
  LayoutList,
  UploadCloud,
  Upload,
  FolderOpen,
  X,
  Crop,
  Sliders,
  ZoomIn,
  ZoomOut,
  Move
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

const BADGE_COLOR_OPTIONS = [
  { id: 'pink', label: 'Rosa (Padrão)', hex: '#ff3b94', bgClass: 'bg-[#ff3b94]' },
  { id: 'purple', label: 'Roxo Neon', hex: '#9333ea', bgClass: 'bg-[#9333ea]' },
  { id: 'cyan', label: 'Azul / Ciano', hex: '#06b6d4', bgClass: 'bg-[#06b6d4]' },
  { id: 'emerald', label: 'Verde', hex: '#10b981', bgClass: 'bg-[#10b981]' },
  { id: 'amber', label: 'Dourado / Âmbar', hex: '#f59e0b', bgClass: 'bg-[#f59e0b]' },
  { id: 'rose', label: 'Vermelho', hex: '#e11d48', bgClass: 'bg-[#e11d48]' },
  { id: 'white', label: 'Branco', hex: '#ffffff', bgClass: 'bg-[#ffffff]' },
  { id: 'dark', label: 'Preto / Grafite', hex: '#18181b', bgClass: 'bg-[#18181b]' },
];

interface UploadedImageItem {
  name: string;
  url: string;
  size: number;
  updatedAt: number;
}

function MediaGalleryModal({
  isOpen,
  onClose,
  onSelect,
  currentUrl,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  currentUrl?: string;
}) {
  const [images, setImages] = useState<UploadedImageItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const fetchImages = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/upload');
      const data = await res.json();
      if (data && Array.isArray(data.images)) {
        setImages(data.images);
      }
    } catch (err) {
      console.error('Error fetching gallery:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchImages();
    }
  }, [isOpen]);

  const handleUploadNew = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      alert('A imagem é muito grande (máximo 15MB).');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.success && data.url) {
        onSelect(data.url);
        onClose();
      } else {
        alert(data.error || 'Erro ao enviar imagem.');
      }
    } catch (err) {
      console.error('Upload error:', err);
      alert('Erro ao enviar imagem.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteImage = async (img: UploadedImageItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Excluir permanentemente a imagem "${img.name}" do disco?`)) return;

    try {
      const res = await fetch(`/api/upload?filename=${encodeURIComponent(img.name)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setImages((prev) => prev.filter((item) => item.name !== img.name));
      } else {
        alert(data.error || 'Erro ao excluir a imagem.');
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('Erro ao excluir a imagem.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#0f111a] border border-white/15 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-brand-cyan" />
            <div>
              <h3 className="text-sm font-bold text-white">Galeria de Imagens do Site</h3>
              <p className="text-[11px] text-gray-400">Escolha uma imagem já enviada ou suba uma nova</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action bar */}
        <div className="p-3 bg-white/5 border-b border-white/10 flex items-center justify-between gap-3">
          <span className="text-xs text-gray-400 font-medium">
            {images.length} {images.length === 1 ? 'imagem salva' : 'imagens salvas'} no diretório <code className="text-gray-300">public/uploads/</code>
          </span>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleUploadNew}
            accept="image/png,image/jpeg,image/jpg,image/webp,image/gif,image/svg+xml,image/avif"
            className="hidden"
          />

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchImages}
              disabled={loading}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition"
              title="Atualizar lista"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-brand-cyan to-brand-purple text-white font-bold text-xs hover:opacity-90 flex items-center gap-1.5 transition disabled:opacity-50 shadow-md"
            >
              {uploading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Enviando...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Subir Nova Imagem</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Gallery Grid Content */}
        <div className="p-4 overflow-y-auto max-h-[55vh] flex-1">
          {loading && images.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-gray-400 gap-2">
              <RefreshCw className="w-6 h-6 animate-spin text-brand-cyan" />
              <span className="text-xs">Carregando galeria...</span>
            </div>
          ) : images.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-gray-400 gap-3 text-center">
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-dashed border-white/15 flex items-center justify-center text-gray-500">
                <ImageIcon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Nenhuma imagem enviada ainda</p>
                <p className="text-[11px] text-gray-400 mt-0.5">Suba a sua primeira imagem clicando no botão acima.</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {images.map((img) => {
                const isSelected = currentUrl === img.url;
                return (
                  <div
                    key={img.name}
                    onClick={() => {
                      onSelect(img.url);
                      onClose();
                    }}
                    className={`group relative rounded-xl border p-2 cursor-pointer transition flex flex-col items-center justify-between gap-2 overflow-hidden ${
                      isSelected
                        ? 'bg-brand-cyan/15 border-brand-cyan shadow-glow-cyan'
                        : 'bg-white/5 border-white/10 hover:border-white/25 hover:bg-white/10'
                    }`}
                  >
                    <div className="w-full aspect-square rounded-lg bg-dark-900 overflow-hidden relative border border-white/10 flex items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img.url}
                        alt={img.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition"
                        onError={(e) => {
                          (e.currentTarget as HTMLElement).style.display = 'none';
                        }}
                      />
                      {isSelected && (
                        <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-brand-cyan text-dark-900 flex items-center justify-center shadow">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </div>

                    <div className="w-full flex items-center justify-between gap-1 text-[10px]">
                      <div className="truncate flex-1 text-gray-300 font-mono" title={img.name}>
                        {img.name}
                      </div>
                      <button
                        type="button"
                        onClick={(e) => handleDeleteImage(img, e)}
                        className="p-1 rounded-md text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition shrink-0"
                        title="Excluir imagem do disco"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-semibold text-white transition"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
}

interface ImageCropModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  initialPosition?: string;
  initialFit?: 'cover' | 'contain';
  aspectRatio?: 'banner' | 'card' | 'square' | 'auto';
  showAvatarGuide?: boolean;
  title?: string;
  onSaveCrop: (croppedUrl: string, position: string, fit: 'cover' | 'contain') => void;
}

function ImageCropModal({
  isOpen,
  onClose,
  imageUrl,
  initialPosition = '50% 50%',
  initialFit = 'cover',
  aspectRatio = 'card',
  showAvatarGuide = false,
  title = 'Ajustar Enquadramento da Imagem',
  onSaveCrop,
}: ImageCropModalProps) {
  const parsePos = (posStr: string) => {
    const parts = (posStr || '50% 50%').split(' ');
    const x = parseInt(parts[0]) || 50;
    const y = parseInt(parts[1]) || 50;
    return { x, y };
  };

  const [posX, setPosX] = useState(50);
  const [posY, setPosY] = useState(50);
  const [zoom, setZoom] = useState(100);
  const [fit, setFit] = useState<'cover' | 'contain'>('cover');
  const [avatarGuideActive, setAvatarGuideActive] = useState(showAvatarGuide);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const parsed = parsePos(initialPosition);
      setPosX(parsed.x);
      setPosY(parsed.y);
      setZoom(100);
      setFit(initialFit || 'cover');
      setAvatarGuideActive(showAvatarGuide);
    }
  }, [isOpen, initialPosition, initialFit, showAvatarGuide]);

  if (!isOpen || !imageUrl) return null;

  const handleCropAndSave = async () => {
    setIsProcessing(true);
    try {
      const img = document.createElement('img');
      img.crossOrigin = 'anonymous';
      img.src = imageUrl;

      await new Promise((resolve, reject) => {
        if (img.complete) resolve(true);
        img.onload = () => resolve(true);
        img.onerror = () => reject(new Error('Falha ao carregar imagem para recorte'));
      });

      let targetW = 800;
      let targetH = 450;
      let prefix = 'card';

      if (aspectRatio === 'banner') {
        targetW = 1200;
        targetH = 480;
        prefix = 'banner';
      } else if (aspectRatio === 'square') {
        targetW = 600;
        targetH = 600;
        prefix = 'foto';
      }

      const canvas = document.createElement('canvas');
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Contexto 2D não disponível');

      ctx.fillStyle = '#08090d';
      ctx.fillRect(0, 0, targetW, targetH);

      const scaleMultiplier = zoom / 100;
      const imgW = img.naturalWidth || img.width;
      const imgH = img.naturalHeight || img.height;

      if (fit === 'contain') {
        ctx.save();
        ctx.filter = 'blur(20px) brightness(0.4)';
        ctx.drawImage(img, -50, -50, targetW + 100, targetH + 100);
        ctx.restore();

        const ratio = Math.min(targetW / imgW, targetH / imgH) * scaleMultiplier;
        const drawW = imgW * ratio;
        const drawH = imgH * ratio;
        const drawX = (targetW - drawW) * (posX / 100);
        const drawY = (targetH - drawH) * (posY / 100);

        ctx.drawImage(img, drawX, drawY, drawW, drawH);
      } else {
        const baseRatio = Math.max(targetW / imgW, targetH / imgH);
        const finalRatio = baseRatio * scaleMultiplier;
        const drawW = imgW * finalRatio;
        const drawH = imgH * finalRatio;

        const drawX = (targetW - drawW) * (posX / 100);
        const drawY = (targetH - drawH) * (posY / 100);

        ctx.drawImage(img, drawX, drawY, drawW, drawH);
      }

      if (aspectRatio === 'banner') {
        const gradient = ctx.createLinearGradient(0, targetH * 0.5, 0, targetH);
        gradient.addColorStop(0, 'rgba(8, 9, 13, 0)');
        gradient.addColorStop(1, 'rgba(8, 9, 13, 0.6)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, targetW, targetH);
      }

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob((b) => resolve(b), 'image/webp', 0.92)
      );

      if (!blob) throw new Error('Falha ao gerar blob recortado.');

      const formData = new FormData();
      const filename = `${prefix}-recortado-${Date.now()}.webp`;
      formData.append('file', blob, filename);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (res.ok && data.success && data.url) {
        onSaveCrop(data.url, '50% 50%', 'cover');
        onClose();
      } else {
        onSaveCrop(imageUrl, `${posX}% ${posY}%`, fit);
        onClose();
      }
    } catch (err) {
      console.warn('Fallback to CSS position/fit:', err);
      onSaveCrop(imageUrl, `${posX}% ${posY}%`, fit);
      onClose();
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-[#0f111a] border border-white/15 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crop className="w-5 h-5 text-brand-cyan" />
            <div>
              <h3 className="text-sm font-bold text-white">{title}</h3>
              <p className="text-[11px] text-gray-400">Posicione, dê zoom ou recorte a imagem</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          
          {/* Real-time Visual Preview Box */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-brand-cyan" />
                <span>Pré-visualização do Enquadramento</span>
              </span>
              {showAvatarGuide && (
                <button
                  type="button"
                  onClick={() => setAvatarGuideActive(!avatarGuideActive)}
                  className={`text-[10px] px-2 py-0.5 rounded-full border transition flex items-center gap-1 font-semibold ${
                    avatarGuideActive
                      ? 'bg-brand-cyan/20 text-brand-cyan border-brand-cyan/40'
                      : 'bg-white/5 text-gray-400 border-white/10'
                  }`}
                >
                  <span>{avatarGuideActive ? 'Guia do Avatar Ativo' : 'Ocultar Guia do Avatar'}</span>
                </button>
              )}
            </div>

            {/* Frame Container */}
            <div className="flex justify-center">
              <div
                className={`rounded-2xl overflow-hidden relative border border-white/20 shadow-2xl bg-dark-900 flex items-center justify-center ${
                  aspectRatio === 'banner'
                    ? 'w-full h-44 sm:h-48'
                    : aspectRatio === 'square'
                    ? 'w-44 h-44 sm:w-52 sm:h-52 aspect-square'
                    : 'w-full h-44 sm:h-48 aspect-video max-w-md'
                }`}
              >
                {fit === 'contain' && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={imageUrl}
                    alt="Ambient BG"
                    className="absolute inset-0 w-full h-full object-cover blur-xl opacity-30 scale-125 pointer-events-none"
                  />
                )}

                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="w-full h-full select-none pointer-events-none transition-all duration-75"
                  style={{
                    objectFit: fit,
                    objectPosition: `${posX}% ${posY}%`,
                    transform: zoom !== 100 ? `scale(${zoom / 100})` : undefined,
                    transformOrigin: `${posX}% ${posY}%`,
                  }}
                />

                {aspectRatio === 'banner' && (
                  <div className="absolute inset-0 bg-gradient-to-t from-[#08090d]/80 via-transparent to-black/20 pointer-events-none" />
                )}

                {showAvatarGuide && avatarGuideActive && (
                  <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-dashed border-white/60 bg-black/40 backdrop-blur-xs flex flex-col items-center justify-center text-center pointer-events-none z-10 shadow-xl">
                    <span className="text-[9px] font-bold text-white tracking-wider uppercase drop-shadow">Foto Perfil</span>
                  </div>
                )}
              </div>
            </div>
            {showAvatarGuide && (
              <p className="text-[10px] text-gray-400 text-center">
                O círculo pontilhado indica onde sua foto de perfil ficará sobreposta no banner.
              </p>
            )}
          </div>

          {/* Controls Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
            
            {/* Vertical Position (Y) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-gray-300">Posição Vertical (Altura)</label>
                <span className="text-xs font-mono text-brand-cyan font-bold">{posY}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={posY}
                onChange={(e) => setPosY(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <div className="flex items-center gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => setPosY(0)}
                  className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] text-gray-300 hover:text-white transition flex-1"
                >
                  ⬆️ Topo (0%)
                </button>
                <button
                  type="button"
                  onClick={() => setPosY(50)}
                  className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] text-gray-300 hover:text-white transition flex-1"
                >
                  🎯 Centro (50%)
                </button>
                <button
                  type="button"
                  onClick={() => setPosY(100)}
                  className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] text-gray-300 hover:text-white transition flex-1"
                >
                  ⬇️ Base (100%)
                </button>
              </div>
            </div>

            {/* Horizontal Position (X) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-gray-300">Posição Horizontal (Largura)</label>
                <span className="text-xs font-mono text-brand-cyan font-bold">{posX}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={posX}
                onChange={(e) => setPosX(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <div className="flex items-center gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => setPosX(0)}
                  className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] text-gray-300 hover:text-white transition flex-1"
                >
                  ⬅️ Esquerda
                </button>
                <button
                  type="button"
                  onClick={() => setPosX(50)}
                  className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] text-gray-300 hover:text-white transition flex-1"
                >
                  🎯 Centro
                </button>
                <button
                  type="button"
                  onClick={() => setPosX(100)}
                  className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] text-gray-300 hover:text-white transition flex-1"
                >
                  ➡️ Direita
                </button>
              </div>
            </div>

            {/* Zoom / Scale */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-gray-300">Zoom / Escala</label>
                <span className="text-xs font-mono text-brand-cyan font-bold">{zoom}%</span>
              </div>
              <input
                type="range"
                min="100"
                max="250"
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <div className="flex items-center justify-between text-[10px] text-gray-400">
                <span>100% (Normal)</span>
                <button
                  type="button"
                  onClick={() => setZoom(100)}
                  className="text-brand-cyan hover:underline"
                >
                  Resetar Zoom
                </button>
                <span>250% (Max)</span>
              </div>
            </div>

            {/* Modo de Encaixe */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-300 block">Modo de Enquadramento</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFit('cover')}
                  className={`p-2 rounded-xl text-xs font-bold border transition text-left flex flex-col ${
                    fit === 'cover'
                      ? 'bg-brand-cyan/20 border-brand-cyan text-white shadow-glow-cyan'
                      : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                  }`}
                >
                  <span>Preencher (Cover)</span>
                  <span className="text-[9px] font-normal opacity-75">Corta sobras da imagem</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFit('contain')}
                  className={`p-2 rounded-xl text-xs font-bold border transition text-left flex flex-col ${
                    fit === 'contain'
                      ? 'bg-brand-cyan/20 border-brand-cyan text-white shadow-glow-cyan'
                      : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                  }`}
                >
                  <span>Conter (Inteira)</span>
                  <span className="text-[9px] font-normal opacity-75">Mostra 100% da foto</span>
                </button>
              </div>
            </div>

          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-white/10 bg-[#0b0c13] flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              setPosX(50);
              setPosY(50);
              setZoom(100);
              setFit('cover');
            }}
            className="text-xs text-gray-400 hover:text-white transition flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Resetar Ajustes</span>
          </button>

          <div className="flex items-center gap-2 self-stretch sm:self-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-gray-300 hover:text-white transition"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={handleCropAndSave}
              disabled={isProcessing}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-brand-cyan to-brand-purple text-white font-bold text-xs hover:opacity-90 flex items-center gap-2 transition shadow-lg shadow-cyan-500/20 disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Processando Recorte...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Aplicar Enquadramento</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

interface ImageUploadFieldProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
  helpText?: string;
  allowCrop?: boolean;
  cropAspectRatio?: 'banner' | 'card' | 'square' | 'auto';
  showAvatarGuide?: boolean;
  cropTitle?: string;
  position?: string;
  onPositionChange?: (pos: string) => void;
  fit?: 'cover' | 'contain';
  onFitChange?: (fit: 'cover' | 'contain') => void;
}

function ImageUploadField({
  label,
  value,
  onChange,
  placeholder = 'https://... ou suba um arquivo',
  helpText,
  allowCrop = true,
  cropAspectRatio = 'card',
  showAvatarGuide = false,
  cropTitle,
  position = '50% 50%',
  onPositionChange,
  fit = 'cover',
  onFitChange,
}: ImageUploadFieldProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [cropOpen, setCropOpen] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      alert('A imagem é muito grande (máximo 15MB).');
      return;
    }

    setUploading(true);
    setUploadSuccess(false);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.success && data.url) {
        onChange(data.url);
        setUploadSuccess(true);
        setTimeout(() => setUploadSuccess(false), 3000);
      } else {
        alert(data.error || 'Erro ao enviar a imagem.');
      }
    } catch (err: any) {
      console.error('Upload error:', err);
      alert('Erro de conexão ao fazer upload da imagem.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const hasImage = Boolean(value && value.trim() !== '');

  return (
    <div className="space-y-1.5 w-full">
      <div className="flex items-center justify-between">
        <label className="text-[10px] text-gray-400 uppercase font-semibold block">
          {label}
        </label>
        {hasImage && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="text-[10px] text-red-400 hover:text-red-300 transition flex items-center gap-1 font-medium"
            title="Remover imagem"
          >
            <Trash2 className="w-3 h-3" />
            <span>Remover foto</span>
          </button>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Preview Thumbnail */}
        {hasImage ? (
          <div className="w-9 h-9 rounded-xl bg-dark-800 border border-white/15 overflow-hidden shrink-0 relative flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt="Prévia"
              className="w-full h-full"
              style={{
                objectPosition: position || '50% 50%',
                objectFit: fit || 'cover',
              }}
              onError={(e) => {
                (e.currentTarget as HTMLElement).style.display = 'none';
              }}
            />
          </div>
        ) : (
          <div className="w-9 h-9 rounded-xl bg-white/5 border border-dashed border-white/15 flex items-center justify-center shrink-0 text-gray-500">
            <ImageIcon className="w-4 h-4" />
          </div>
        )}

        {/* URL Input */}
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 min-w-0 bg-dark-900 border border-white/15 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-brand-cyan font-mono"
        />

        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/png,image/jpeg,image/jpg,image/webp,image/gif,image/svg+xml,image/avif"
          className="hidden"
        />

        {/* Galeria Button */}
        <button
          type="button"
          onClick={() => setGalleryOpen(true)}
          className="px-2.5 py-1.5 rounded-xl border border-white/15 hover:border-white/30 bg-white/5 hover:bg-white/10 text-xs font-bold text-gray-200 hover:text-white transition shrink-0 flex items-center gap-1.5"
          title="Abrir galeria de imagens salvas"
        >
          <FolderOpen className="w-3.5 h-3.5 text-purple-300" />
          <span className="hidden sm:inline">Galeria</span>
        </button>

        {/* Direct Upload Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition shrink-0 flex items-center gap-1.5 ${
            uploadSuccess
              ? 'bg-green-500/20 text-green-300 border-green-500/40'
              : 'bg-white/10 hover:bg-white/15 border-white/15 hover:border-white/30 text-white disabled:opacity-50'
          }`}
          title="Fazer upload de nova imagem do computador"
        >
          {uploading ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-brand-cyan" />
              <span className="hidden sm:inline">Enviando...</span>
            </>
          ) : uploadSuccess ? (
            <>
              <Check className="w-3.5 h-3.5 text-green-400" />
              <span className="hidden sm:inline">Enviado!</span>
            </>
          ) : (
            <>
              <UploadCloud className="w-3.5 h-3.5 text-brand-cyan" />
              <span className="hidden sm:inline">Subir Foto</span>
              <span className="sm:hidden">Subir</span>
            </>
          )}
        </button>

        {/* Crop / Adjust Button */}
        {hasImage && allowCrop && (
          <button
            type="button"
            onClick={() => setCropOpen(true)}
            className="px-2.5 py-1.5 rounded-xl border border-brand-cyan/30 hover:border-brand-cyan/50 bg-brand-cyan/15 hover:bg-brand-cyan/25 text-xs font-bold text-brand-cyan hover:text-white transition shrink-0 flex items-center gap-1.5 shadow-sm"
            title="Ajustar enquadramento e recortar foto"
          >
            <Crop className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ajustar</span>
          </button>
        )}
      </div>

      {/* Quick position & fit adjustment presets */}
      {hasImage && (onPositionChange || onFitChange) && (
        <div className="flex items-center gap-1.5 flex-wrap pt-0.5 text-[10px]">
          <span className="text-gray-400 font-semibold mr-0.5 flex items-center gap-1">
            <Sliders className="w-3 h-3 text-brand-cyan" />
            <span>Ajuste Rápido:</span>
          </span>
          {onPositionChange && (
            <>
              <button
                type="button"
                onClick={() => onPositionChange('50% 0%')}
                className={`px-2 py-0.5 rounded-md border transition ${
                  position === '50% 0%'
                    ? 'bg-brand-cyan/20 border-brand-cyan/40 text-brand-cyan font-bold'
                    : 'bg-white/5 hover:bg-white/10 border-white/10 text-gray-300'
                }`}
                title="Alinhar ao Topo"
              >
                ⬆️ Topo
              </button>
              <button
                type="button"
                onClick={() => onPositionChange('50% 50%')}
                className={`px-2 py-0.5 rounded-md border transition ${
                  position === '50% 50%' || !position
                    ? 'bg-brand-cyan/20 border-brand-cyan/40 text-brand-cyan font-bold'
                    : 'bg-white/5 hover:bg-white/10 border-white/10 text-gray-300'
                }`}
                title="Alinhar ao Centro"
              >
                🎯 Centro
              </button>
              <button
                type="button"
                onClick={() => onPositionChange('50% 100%')}
                className={`px-2 py-0.5 rounded-md border transition ${
                  position === '50% 100%'
                    ? 'bg-brand-cyan/20 border-brand-cyan/40 text-brand-cyan font-bold'
                    : 'bg-white/5 hover:bg-white/10 border-white/10 text-gray-300'
                }`}
                title="Alinhar à Base"
              >
                ⬇️ Base
              </button>
            </>
          )}
          {onFitChange && (
            <button
              type="button"
              onClick={() => onFitChange(fit === 'contain' ? 'cover' : 'contain')}
              className={`px-2 py-0.5 rounded-md border transition ${
                fit === 'contain'
                  ? 'bg-brand-cyan/20 border-brand-cyan/40 text-brand-cyan font-bold'
                  : 'bg-white/5 hover:bg-white/10 border-white/10 text-gray-300'
              }`}
              title="Alternar entre preencher ou conter foto inteira"
            >
              🖼️ {fit === 'contain' ? 'Modo Inteiro (Ativo)' : 'Encaixar Inteira'}
            </button>
          )}
          <span className="ml-auto text-gray-500 font-mono text-[9px]">
            {position || '50% 50%'} ({fit === 'contain' ? 'Inteira' : 'Preencher'})
          </span>
        </div>
      )}

      {helpText && <p className="text-[10px] text-gray-500">{helpText}</p>}

      {/* Gallery Modal */}
      <MediaGalleryModal
        isOpen={galleryOpen}
        onClose={() => setGalleryOpen(false)}
        onSelect={(url) => onChange(url)}
        currentUrl={value}
      />

      {/* Unified Image Crop Modal */}
      {hasImage && allowCrop && (
        <ImageCropModal
          isOpen={cropOpen}
          onClose={() => setCropOpen(false)}
          imageUrl={value}
          initialPosition={position || '50% 50%'}
          initialFit={fit || 'cover'}
          aspectRatio={cropAspectRatio}
          showAvatarGuide={showAvatarGuide}
          title={cropTitle || `Ajustar Enquadramento: ${label}`}
          onSaveCrop={(croppedUrl, newPos, newFit) => {
            onChange(croppedUrl);
            onPositionChange?.(newPos);
            onFitChange?.(newFit);
          }}
        />
      )}
    </div>
  );
}

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
      imagePosition: '50% 50%',
      imageFit: 'cover',
      active: true,
      hasBlur: false,
      blurText: '',
      badge: '',
      badgeColor: 'pink',
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
                    className="absolute inset-0 w-full h-full"
                    style={{
                      objectPosition: profile.coverPosition || '50% 50%',
                      objectFit: profile.coverFit || 'cover',
                    }}
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
                <ImageUploadField
                  label="Foto de Perfil (Avatar)"
                  value={profile.avatarUrl}
                  onChange={(url) => setProfile({ ...profile, avatarUrl: url })}
                  placeholder="https://... ou suba um arquivo"
                  allowCrop={true}
                  cropAspectRatio="square"
                  cropTitle="Ajustar Foto de Perfil"
                  helpText="Recomendado: proporção 1:1 (quadrada)."
                />
              </div>

              <div>
                <ImageUploadField
                  label="Foto de Capa (Header / Banner)"
                  value={profile.coverImageUrl || ''}
                  onChange={(url) => setProfile({ ...profile, coverImageUrl: url })}
                  placeholder="https://... ou suba um arquivo"
                  allowCrop={true}
                  cropAspectRatio="banner"
                  showAvatarGuide={true}
                  cropTitle="Ajustar Foto de Capa (Banner)"
                  position={profile.coverPosition}
                  onPositionChange={(pos) => setProfile({ ...profile, coverPosition: pos })}
                  fit={profile.coverFit}
                  onFitChange={(fit) => setProfile({ ...profile, coverFit: fit })}
                  helpText="Deixe vazio para exibir o gradiente escuro elegante."
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
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white">{item.title || 'Sem título'}</h4>
                          {item.badge && item.badge.trim() !== '' && (
                            <span
                              className="px-2 py-0.5 rounded-full text-[9px] font-bold border uppercase tracking-wider"
                              style={{
                                backgroundColor: item.badgeColor?.startsWith('#')
                                  ? `${item.badgeColor}33`
                                  : BADGE_COLOR_OPTIONS.find((b) => b.id === item.badgeColor)?.hex
                                  ? `${BADGE_COLOR_OPTIONS.find((b) => b.id === item.badgeColor)?.hex}33`
                                  : '#ff3b9433',
                                borderColor: item.badgeColor?.startsWith('#')
                                  ? `${item.badgeColor}66`
                                  : BADGE_COLOR_OPTIONS.find((b) => b.id === item.badgeColor)?.hex
                                  ? `${BADGE_COLOR_OPTIONS.find((b) => b.id === item.badgeColor)?.hex}66`
                                  : '#ff3b9466',
                                color: item.badgeColor?.startsWith('#')
                                  ? item.badgeColor
                                  : BADGE_COLOR_OPTIONS.find((b) => b.id === item.badgeColor)?.hex || '#ff3b94',
                              }}
                            >
                              {item.badge}
                            </span>
                          )}
                          {item.hasBlur && item.type !== 'no-photo' && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                              <EyeOff className="w-2.5 h-2.5 text-purple-400" />
                              <span>Blur Ativo</span>
                            </span>
                          )}
                        </div>
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

                    <div className={item.type !== 'no-photo' ? 'md:col-span-1' : 'md:col-span-2'}>
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
                      <div className="md:col-span-2">
                        <ImageUploadField
                          label="Foto / Imagem do Botão"
                          value={item.image || ''}
                          onChange={(url) => updateLinkItem(item.id, 'image', url)}
                          placeholder="https://... ou suba uma foto"
                          allowCrop={true}
                          cropAspectRatio={item.type === 'left-thumb' ? 'square' : 'card'}
                          cropTitle={`Ajustar Imagem: ${item.title || 'Botão'}`}
                          position={item.imagePosition}
                          onPositionChange={(pos) => updateLinkItem(item.id, 'imagePosition', pos)}
                          fit={item.imageFit}
                          onFitChange={(fit) => updateLinkItem(item.id, 'imageFit', fit)}
                          helpText={
                            item.type === 'left-thumb'
                              ? 'Miniatura na lateral esquerda (proporção 1:1 quadrada recomendada).'
                              : 'Card visual com foto em destaque grande (proporção 16:9 recomendada).'
                          }
                        />
                      </div>
                    )}

                    <div className="flex flex-col justify-between">
                      <div>
                        <label className="text-[10px] text-gray-400 uppercase font-semibold block mb-1">
                          Tag / Selo no Canto (Opcional)
                        </label>
                        <input
                          type="text"
                          value={item.badge || ''}
                          onChange={(e) => updateLinkItem(item.id, 'badge', e.target.value)}
                          placeholder="Ex: Populares, Destaque, VIP"
                          className="w-full bg-dark-900 border border-white/15 rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-gray-600 focus:outline-none focus:border-purple-400"
                        />
                      </div>

                      {/* Badge Color Selector */}
                      {item.badge && item.badge.trim() !== '' && (
                        <div className="mt-2 pt-2 border-t border-white/10">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[10px] text-gray-400 uppercase font-semibold">Cor da Tag</span>
                            <span className="text-[9px] text-gray-400 font-medium">
                              {BADGE_COLOR_OPTIONS.find((c) => c.id === item.badgeColor)?.label || item.badgeColor || 'Rosa'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {BADGE_COLOR_OPTIONS.map((c) => {
                              const isSelected = (!item.badgeColor && c.id === 'pink') || item.badgeColor === c.id || item.badgeColor === c.hex;
                              return (
                                <button
                                  key={c.id}
                                  type="button"
                                  onClick={() => updateLinkItem(item.id, 'badgeColor', c.id)}
                                  className={`w-5 h-5 rounded-full ${c.bgClass} transition-all flex items-center justify-center shrink-0 ${
                                    isSelected
                                      ? 'scale-110 ring-2 ring-white ring-offset-1 ring-offset-dark-900 border border-white'
                                      : 'border border-white/30 hover:scale-105 opacity-70 hover:opacity-100'
                                  }`}
                                  title={c.label}
                                >
                                  {isSelected && (
                                    <Check className={`w-2.5 h-2.5 ${c.id === 'white' ? 'text-black' : 'text-white'}`} />
                                  )}
                                </button>
                              );
                            })}

                            {/* Custom Hex Color Picker */}
                            <label
                              className="relative w-5 h-5 rounded-full border border-white/40 cursor-pointer overflow-hidden flex items-center justify-center hover:scale-105 transition bg-gradient-to-tr from-pink-500 via-purple-500 to-cyan-500 shrink-0"
                              title="Escolher Cor Personalizada"
                            >
                              <input
                                type="color"
                                value={item.badgeColor?.startsWith('#') ? item.badgeColor : '#ff3b94'}
                                onChange={(e) => updateLinkItem(item.id, 'badgeColor', e.target.value)}
                                className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                              />
                            </label>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Blur Toggle Option */}
                    {item.type !== 'no-photo' && (
                      <div className="md:col-span-3 pt-1 space-y-2">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 rounded-xl bg-dark-900 border border-white/10 gap-3">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center border transition ${
                              item.hasBlur 
                                ? 'bg-purple-600/30 border-purple-500/40 text-purple-300' 
                                : 'bg-white/5 border-white/10 text-gray-400'
                            }`}>
                              <EyeOff className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                                <span>Efeito Blur com Revelação (Sensível / Spoiler)</span>
                                {item.hasBlur && (
                                  <span className="text-[9px] bg-purple-500/30 text-purple-200 px-1.5 py-0.5 rounded font-semibold">ATIVADO</span>
                                )}
                              </div>
                              <p className="text-[10px] text-gray-400">
                                A imagem começa borrada com um ícone de olho no centro. Ao clicar, o olho e o blur desaparecem.
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => updateLinkItem(item.id, 'hasBlur', !item.hasBlur)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition border shrink-0 ${
                              item.hasBlur
                                ? 'bg-purple-600/30 text-purple-200 border-purple-500/50 hover:bg-purple-600/40 shadow-glow-purple'
                                : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white'
                            }`}
                          >
                            {item.hasBlur ? (
                              <>
                                <EyeOff className="w-3.5 h-3.5 text-purple-300" />
                                <span>Blur Ativado</span>
                              </>
                            ) : (
                              <>
                                <Eye className="w-3.5 h-3.5" />
                                <span>Sem Blur (Normal)</span>
                              </>
                            )}
                          </button>
                        </div>

                        {item.hasBlur && (
                          <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                            <div className="w-full sm:w-auto">
                              <label className="text-xs font-semibold text-purple-200 block mb-0.5">
                                Texto de Revelação do Blur
                              </label>
                              <p className="text-[10px] text-gray-400">
                                Mensagem exibida abaixo do ícone (Padrão: &quot;Clique para ver a foto&quot;)
                              </p>
                            </div>
                            <input
                              type="text"
                              value={item.blurText !== undefined ? item.blurText : ''}
                              onChange={(e) => updateLinkItem(item.id, 'blurText', e.target.value)}
                              placeholder="Clique para ver a foto"
                              className="w-full sm:w-64 bg-dark-900 border border-purple-500/30 rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-gray-600 focus:outline-none focus:border-purple-400"
                            />
                          </div>
                        )}
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
                          className="absolute inset-0 w-full h-full"
                          style={{
                            objectPosition: item.imagePosition || '50% 50%',
                            objectFit: item.imageFit || 'cover',
                          }}
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

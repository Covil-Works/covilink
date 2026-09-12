'use client';

import React, { useState, useEffect } from 'react';
import {
  Crop,
  X,
  RotateCcw,
  Check,
  RefreshCw,
  Eye,
} from 'lucide-react';
import { authFetch } from '@/lib/auth-client';

export interface ImageCropModalProps {
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

export default function ImageCropModal({
  isOpen,
  onClose,
  imageUrl,
  initialPosition = '50% 50%',
  initialFit = 'contain',
  aspectRatio = 'card',
  showAvatarGuide = false,
  title = 'Ajustar Enquadramento',
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
  const [fit, setFit] = useState<'cover' | 'contain'>('contain');
  const [avatarGuideActive, setAvatarGuideActive] = useState(showAvatarGuide);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const parsed = parsePos(initialPosition);
      setPosX(parsed.x);
      setPosY(parsed.y);
      setZoom(100);
      setFit(initialFit || 'contain');
      setAvatarGuideActive(showAvatarGuide);
    }
  }, [isOpen, initialPosition, initialFit, showAvatarGuide]);

  if (!isOpen || !imageUrl) return null;

  const handleApply = async () => {
    setIsProcessing(true);
    try {
      // Create canvas to crop image cleanly
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
        prefix = 'avatar';
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
        ctx.filter = 'blur(24px) brightness(0.35)';
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
        gradient.addColorStop(1, 'rgba(8, 9, 13, 0.65)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, targetW, targetH);
      }

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob((b) => resolve(b), 'image/webp', 0.92)
      );

      if (!blob) throw new Error('Falha ao gerar blob.');

      const formData = new FormData();
      const filename = `${prefix}-recortado-${Date.now()}.webp`;
      formData.append('file', blob, filename);

      const res = await authFetch('/api/upload', {
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
    } catch {
      // Fallback directly to CSS position and fit
      onSaveCrop(imageUrl, `${posX}% ${posY}%`, fit);
      onClose();
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-[#0e1017] border border-white/10 rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-300">
              <Crop className="w-4 h-4 text-brand-cyan" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white tracking-tight">{title}</h3>
              <p className="text-[11px] text-gray-400">Defina o enquadramento, zoom e alinhamento</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          
          {/* Visual Preview Box */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-300 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-gray-400" />
                <span>Prévia do Enquadramento</span>
              </span>
              {showAvatarGuide && (
                <button
                  type="button"
                  onClick={() => setAvatarGuideActive(!avatarGuideActive)}
                  className={`text-[10px] px-2.5 py-1 rounded-md border transition font-medium ${
                    avatarGuideActive
                      ? 'bg-brand-cyan/15 text-brand-cyan border-brand-cyan/30'
                      : 'bg-white/5 text-gray-400 border-white/10'
                  }`}
                >
                  {avatarGuideActive ? 'Ocultar Guia do Avatar' : 'Exibir Guia do Avatar'}
                </button>
              )}
            </div>

            {/* Frame Container */}
            <div className="flex justify-center p-2 rounded-xl bg-black/40 border border-white/[0.06]">
              <div
                className={`rounded-xl overflow-hidden relative border border-white/15 bg-dark-900 flex items-center justify-center shadow-inner ${
                  aspectRatio === 'banner'
                    ? 'w-full h-44 sm:h-48'
                    : aspectRatio === 'square'
                    ? 'w-44 h-44 sm:w-48 sm:h-48 aspect-square'
                    : 'w-full h-44 aspect-video max-w-md'
                }`}
              >
                {fit === 'contain' && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={imageUrl}
                    alt="Ambient Backdrop"
                    className="absolute inset-0 w-full h-full object-cover blur-xl opacity-30 scale-125 pointer-events-none"
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = 'none';
                    }}
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
                  onError={(e) => {
                    (e.currentTarget as HTMLElement).style.display = 'none';
                  }}
                />

                {aspectRatio === 'banner' && (
                  <div className="absolute inset-0 bg-gradient-to-t from-[#08090d]/80 via-transparent to-black/20 pointer-events-none" />
                )}

                {showAvatarGuide && avatarGuideActive && (
                  <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-dashed border-white/70 bg-black/50 backdrop-blur-xs flex items-center justify-center text-center pointer-events-none z-10 shadow-xl">
                    <span className="text-[9px] font-semibold text-white tracking-wider uppercase">Avatar</span>
                  </div>
                )}
              </div>
            </div>

            {showAvatarGuide && (
              <p className="text-[11px] text-gray-500 text-center">
                O círculo indica a área em que a foto de perfil ficará sobreposta.
              </p>
            )}
          </div>

          {/* Mode Selector */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">Modo da Imagem</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFit('contain')}
                className={`px-3 py-2.5 rounded-xl text-left border transition ${
                  fit === 'contain'
                    ? 'bg-brand-cyan/15 border-brand-cyan/50 text-white shadow-sm'
                    : 'bg-white/[0.03] border-white/10 text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="text-xs font-semibold">Conter (Sem cortes)</div>
                <div className="text-[10px] text-gray-400 mt-0.5">Mostra 100% da imagem original</div>
              </button>

              <button
                type="button"
                onClick={() => setFit('cover')}
                className={`px-3 py-2.5 rounded-xl text-left border transition ${
                  fit === 'cover'
                    ? 'bg-brand-cyan/15 border-brand-cyan/50 text-white shadow-sm'
                    : 'bg-white/[0.03] border-white/10 text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="text-xs font-semibold">Preencher (Cover)</div>
                <div className="text-[10px] text-gray-400 mt-0.5">Ocupa todo o espaço do card</div>
              </button>
            </div>
          </div>

          {/* Controls */}
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.07] space-y-4">
            {/* Vertical Position */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label className="font-medium text-gray-300">Posição Vertical</label>
                <span className="font-mono text-gray-400 text-[11px]">{posY}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={posY}
                onChange={(e) => setPosY(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-dark-700 rounded-lg"
              />
              <div className="grid grid-cols-3 gap-1.5 pt-0.5">
                <button
                  type="button"
                  onClick={() => setPosY(0)}
                  className={`px-2 py-1 rounded-lg text-[11px] font-medium border transition ${
                    posY === 0 ? 'bg-white/10 text-white border-white/20' : 'bg-white/[0.02] text-gray-400 border-white/10 hover:text-white'
                  }`}
                >
                  Topo
                </button>
                <button
                  type="button"
                  onClick={() => setPosY(50)}
                  className={`px-2 py-1 rounded-lg text-[11px] font-medium border transition ${
                    posY === 50 ? 'bg-white/10 text-white border-white/20' : 'bg-white/[0.02] text-gray-400 border-white/10 hover:text-white'
                  }`}
                >
                  Centro
                </button>
                <button
                  type="button"
                  onClick={() => setPosY(100)}
                  className={`px-2 py-1 rounded-lg text-[11px] font-medium border transition ${
                    posY === 100 ? 'bg-white/10 text-white border-white/20' : 'bg-white/[0.02] text-gray-400 border-white/10 hover:text-white'
                  }`}
                >
                  Base
                </button>
              </div>
            </div>

            {/* Horizontal Position */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label className="font-medium text-gray-300">Posição Horizontal</label>
                <span className="font-mono text-gray-400 text-[11px]">{posX}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={posX}
                onChange={(e) => setPosX(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-dark-700 rounded-lg"
              />
              <div className="grid grid-cols-3 gap-1.5 pt-0.5">
                <button
                  type="button"
                  onClick={() => setPosX(0)}
                  className={`px-2 py-1 rounded-lg text-[11px] font-medium border transition ${
                    posX === 0 ? 'bg-white/10 text-white border-white/20' : 'bg-white/[0.02] text-gray-400 border-white/10 hover:text-white'
                  }`}
                >
                  Esquerda
                </button>
                <button
                  type="button"
                  onClick={() => setPosX(50)}
                  className={`px-2 py-1 rounded-lg text-[11px] font-medium border transition ${
                    posX === 50 ? 'bg-white/10 text-white border-white/20' : 'bg-white/[0.02] text-gray-400 border-white/10 hover:text-white'
                  }`}
                >
                  Centro
                </button>
                <button
                  type="button"
                  onClick={() => setPosX(100)}
                  className={`px-2 py-1 rounded-lg text-[11px] font-medium border transition ${
                    posX === 100 ? 'bg-white/10 text-white border-white/20' : 'bg-white/[0.02] text-gray-400 border-white/10 hover:text-white'
                  }`}
                >
                  Direita
                </button>
              </div>
            </div>

            {/* Zoom */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label className="font-medium text-gray-300">Zoom</label>
                <span className="font-mono text-gray-400 text-[11px]">{zoom}%</span>
              </div>
              <input
                type="range"
                min="100"
                max="220"
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-dark-700 rounded-lg"
              />
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-white/[0.08] bg-black/30 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              setPosX(50);
              setPosY(50);
              setZoom(100);
              setFit('contain');
            }}
            className="text-xs text-gray-400 hover:text-white transition flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Redefinir</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl border border-white/10 hover:bg-white/5 text-xs font-medium text-gray-300 hover:text-white transition"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={handleApply}
              disabled={isProcessing}
              className="px-4 py-1.5 rounded-xl bg-white text-dark-900 font-semibold text-xs hover:bg-gray-200 flex items-center gap-1.5 transition shadow disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Salvando...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Aplicar Ajuste</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

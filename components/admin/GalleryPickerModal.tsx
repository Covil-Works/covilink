'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  ImageIcon,
  X,
  RefreshCw,
  UploadCloud,
  Check,
  Crop,
  ArrowLeft,
  Sliders,
  Sparkles,
} from 'lucide-react';
import ImageCropModal from './ImageCropModal';

export interface UploadedImageItem {
  name: string;
  url: string;
  size: number;
  updatedAt: number;
}

interface GalleryPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImage: (url: string, position: string, fit: 'cover' | 'contain') => void;
  currentUrl?: string;
  targetTitle?: string;
  aspectRatio?: 'banner' | 'card' | 'square' | 'auto';
  showAvatarGuide?: boolean;
}

export default function GalleryPickerModal({
  isOpen,
  onClose,
  onSelectImage,
  currentUrl,
  targetTitle = 'Selecionar Imagem',
  aspectRatio = 'card',
  showAvatarGuide = false,
}: GalleryPickerModalProps) {
  const [images, setImages] = useState<UploadedImageItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [step, setStep] = useState<'picker' | 'decision'>('picker');
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      setSelectedImage(null);
      setStep('picker');
    }
  }, [isOpen]);

  const handleUploadDirect = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
        // Add to images list and move directly to decision step for this uploaded image
        await fetchImages();
        setSelectedImage(data.url);
        setStep('decision');
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

  const handleChooseImage = (url: string) => {
    setSelectedImage(url);
    setStep('decision');
  };

  const handleUseNormally = () => {
    if (!selectedImage) return;
    // Default behavior is contain, centered, no manual crop
    onSelectImage(selectedImage, '50% 50%', 'contain');
    onClose();
  };

  const handleOpenAdjust = () => {
    setCropModalOpen(true);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
        <div className="bg-[#0e1017] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[88vh] flex flex-col shadow-2xl overflow-hidden">
          
          {/* Header */}
          <div className="px-5 py-4 border-b border-white/[0.08] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {step === 'decision' ? (
                <button
                  type="button"
                  onClick={() => setStep('picker')}
                  className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 flex items-center justify-center text-gray-300 hover:text-white transition"
                  title="Voltar à lista de imagens"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              ) : (
                <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-300">
                  <ImageIcon className="w-4 h-4 text-brand-cyan" />
                </div>
              )}
              <div>
                <h3 className="text-sm font-semibold text-white tracking-tight">
                  {step === 'decision' ? 'Opções de Aplicação' : `Selecionar ${targetTitle}`}
                </h3>
                <p className="text-[11px] text-gray-400">
                  {step === 'decision'
                    ? 'Escolha se deseja usar a foto normalmente ou ajustá-la'
                    : 'Escolha uma imagem existente na Galeria ou envie uma nova'}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* STEP 1: PICKER */}
          {step === 'picker' && (
            <>
              {/* Action Bar */}
              <div className="px-5 py-3 bg-white/[0.02] border-b border-white/[0.07] flex items-center justify-between gap-3">
                <span className="text-xs text-gray-400 font-medium">
                  {images.length} {images.length === 1 ? 'imagem na Galeria' : 'imagens na Galeria'}
                </span>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleUploadDirect}
                  accept="image/png,image/jpeg,image/jpg,image/webp,image/gif,image/svg+xml,image/avif"
                  className="hidden"
                />

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={fetchImages}
                    disabled={loading}
                    className="p-2 rounded-xl border border-white/10 hover:bg-white/5 text-gray-300 hover:text-white transition"
                    title="Atualizar imagens"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  </button>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-semibold text-white flex items-center gap-1.5 transition disabled:opacity-50"
                  >
                    {uploading ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Enviando...</span>
                      </>
                    ) : (
                      <>
                        <UploadCloud className="w-3.5 h-3.5 text-brand-cyan" />
                        <span>Subir Nova Imagem</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Grid content */}
              <div className="p-5 overflow-y-auto max-h-[58vh] flex-1">
                {loading && images.length === 0 ? (
                  <div className="py-12 flex flex-col items-center justify-center text-gray-400 gap-2">
                    <RefreshCw className="w-6 h-6 animate-spin text-brand-cyan" />
                    <span className="text-xs">Carregando galeria...</span>
                  </div>
                ) : images.length === 0 ? (
                  <div className="py-12 flex flex-col items-center justify-center text-gray-400 gap-3 text-center">
                    <div className="w-12 h-12 rounded-xl bg-white/5 border border-dashed border-white/15 flex items-center justify-center text-gray-500">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white">Nenhuma imagem na Galeria ainda</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">Envie a primeira imagem usando o botão acima.</p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {images.map((img) => {
                      const isCurrent = currentUrl === img.url;
                      return (
                        <div
                          key={img.name}
                          onClick={() => handleChooseImage(img.url)}
                          className={`group relative rounded-xl border p-2 cursor-pointer transition flex flex-col items-center gap-2 overflow-hidden ${
                            isCurrent
                              ? 'bg-brand-cyan/10 border-brand-cyan/50 shadow-sm'
                              : 'bg-white/[0.03] border-white/10 hover:border-white/25 hover:bg-white/[0.06]'
                          }`}
                        >
                          <div className="w-full aspect-square rounded-lg bg-dark-900 overflow-hidden relative border border-white/10 flex items-center justify-center">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={img.url}
                              alt={img.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
                              onError={(e) => {
                                (e.currentTarget as HTMLElement).style.display = 'none';
                              }}
                            />
                            {isCurrent && (
                              <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded bg-brand-cyan text-dark-900 text-[9px] font-bold shadow">
                                Atual
                              </div>
                            )}
                          </div>

                          <div className="w-full truncate text-[11px] text-gray-300 font-mono text-center">
                            {img.name}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}

          {/* STEP 2: DECISION (USAR NORMALMENTE OU AJUSTAR) */}
          {step === 'decision' && selectedImage && (
            <div className="p-6 overflow-y-auto space-y-6 flex-1 flex flex-col items-center justify-center text-center">
              
              {/* Selected image preview */}
              <div className="w-full max-w-sm rounded-xl overflow-hidden border border-white/15 bg-dark-900 p-2 shadow-xl">
                <div
                  className={`rounded-lg overflow-hidden relative bg-black/50 flex items-center justify-center ${
                    aspectRatio === 'banner'
                      ? 'w-full h-36'
                      : aspectRatio === 'square'
                      ? 'w-36 h-36 mx-auto rounded-full'
                      : 'w-full h-36 aspect-video'
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={selectedImage}
                    alt="Preview selecionada"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>
              </div>

              <div className="max-w-md space-y-1">
                <h4 className="text-base font-semibold text-white">Como prefere usar esta imagem?</h4>
                <p className="text-xs text-gray-400">
                  Por padrão, a imagem é exibida normalmente sem cortes forçados. Você também pode ajustar o enquadramento se desejar.
                </p>
              </div>

              {/* Action buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-md pt-2">
                
                {/* Usar Normalmente */}
                <button
                  type="button"
                  onClick={handleUseNormally}
                  className="p-4 rounded-xl border border-white/15 bg-white/[0.04] hover:bg-white/[0.08] hover:border-white/30 text-left transition flex flex-col justify-between group"
                >
                  <div>
                    <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-300 group-hover:text-white mb-2">
                      <Check className="w-4 h-4 stroke-[2.5]" />
                    </div>
                    <div className="text-xs font-bold text-white">Usar Normalmente</div>
                    <div className="text-[11px] text-gray-400 mt-1">
                      Exibe a foto inteira sem recorte ou reposicionamento manual.
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-brand-cyan mt-3 inline-flex items-center gap-1">
                    Selecionar padrão &rarr;
                  </span>
                </button>

                {/* Ajustar Foto */}
                <button
                  type="button"
                  onClick={handleOpenAdjust}
                  className="p-4 rounded-xl border border-brand-cyan/30 bg-brand-cyan/10 hover:bg-brand-cyan/20 hover:border-brand-cyan/50 text-left transition flex flex-col justify-between group"
                >
                  <div>
                    <div className="w-8 h-8 rounded-lg bg-brand-cyan/20 border border-brand-cyan/30 flex items-center justify-center text-brand-cyan mb-2">
                      <Crop className="w-4 h-4" />
                    </div>
                    <div className="text-xs font-bold text-white">Ajustar Foto</div>
                    <div className="text-[11px] text-gray-300 mt-1">
                      Ajuste zoom, alinhamento vertical/horizontal e área de corte.
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-brand-cyan mt-3 inline-flex items-center gap-1">
                    Abrir ajustes &rarr;
                  </span>
                </button>

              </div>

            </div>
          )}

          {/* Footer */}
          <div className="px-5 py-3.5 border-t border-white/[0.08] bg-black/30 flex justify-between items-center">
            {step === 'decision' ? (
              <button
                type="button"
                onClick={() => setStep('picker')}
                className="text-xs text-gray-400 hover:text-white transition flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Escolher outra imagem</span>
              </button>
            ) : (
              <span className="text-[11px] text-gray-500">
                Formatos aceitos: PNG, JPG, WEBP, GIF, SVG, AVIF (até 15MB)
              </span>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl border border-white/10 hover:bg-white/5 text-xs font-medium text-gray-300 hover:text-white transition"
            >
              Cancelar
            </button>
          </div>

        </div>
      </div>

      {/* Embedded Crop Modal if user chose "Ajustar Foto" */}
      {selectedImage && cropModalOpen && (
        <ImageCropModal
          isOpen={cropModalOpen}
          onClose={() => setCropModalOpen(false)}
          imageUrl={selectedImage}
          initialFit="contain"
          initialPosition="50% 50%"
          aspectRatio={aspectRatio}
          showAvatarGuide={showAvatarGuide}
          title={`Ajustar ${targetTitle}`}
          onSaveCrop={(finalUrl, position, fit) => {
            setCropModalOpen(false);
            onSelectImage(finalUrl, position, fit);
            onClose();
          }}
        />
      )}
    </>
  );
}

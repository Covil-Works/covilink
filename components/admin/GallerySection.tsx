'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  ImageIcon,
  UploadCloud,
  Trash2,
  Copy,
  Check,
  RefreshCw,
  Search,
  Maximize2,
  X,
  ExternalLink,
  FileImage,
  AlertCircle,
} from 'lucide-react';
import { UploadedImageItem } from './GalleryPickerModal';

function formatBytes(bytes: number, decimals = 1) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function formatDate(timestamp: number) {
  if (!timestamp) return '-';
  const date = new Date(timestamp);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default function GallerySection() {
  const [images, setImages] = useState<UploadedImageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<UploadedImageItem | null>(null);
  const [imageToDelete, setImageToDelete] = useState<UploadedImageItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

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
      console.error('Error fetching gallery images:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const handleUploadFiles = async (files: FileList | File[]) => {
    const fileList = Array.from(files);
    if (fileList.length === 0) return;

    setUploading(true);
    try {
      for (const file of fileList) {
        if (file.size > 15 * 1024 * 1024) {
          alert(`O arquivo "${file.name}" ultrapassa o limite de 15MB.`);
          continue;
        }

        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          alert(data.error || `Erro ao enviar ${file.name}`);
        }
      }
      await fetchImages();
    } catch (err) {
      console.error('Error uploading files:', err);
      alert('Erro ao enviar imagens.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleUploadFiles(e.dataTransfer.files);
    }
  };

  const handleCopyUrl = (url: string) => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      setTimeout(() => setCopiedUrl(null), 2500);
    }
  };

  const confirmDelete = async () => {
    if (!imageToDelete) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/upload?filename=${encodeURIComponent(imageToDelete.name)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setImages((prev) => prev.filter((img) => img.name !== imageToDelete.name));
        setImageToDelete(null);
      } else {
        alert(data.error || 'Erro ao excluir imagem.');
      }
    } catch (err) {
      console.error('Error deleting image:', err);
      alert('Falha ao excluir a imagem.');
    } finally {
      setDeleting(false);
    }
  };

  const filteredImages = images.filter((img) =>
    img.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalBytes = images.reduce((acc, img) => acc + (img.size || 0), 0);

  return (
    <div className="space-y-6">
      
      {/* Header & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/[0.08]">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2.5">
            <ImageIcon className="w-5 h-5 text-brand-cyan" />
            <span>Galeria de Imagens</span>
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Gerenciamento central de todas as fotos armazenadas no site.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchImages}
            disabled={loading}
            className="px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-medium text-gray-300 hover:text-white transition flex items-center gap-2"
            title="Atualizar lista"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Atualizar</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="px-4 py-2 rounded-xl bg-white text-dark-900 font-semibold text-xs hover:bg-gray-200 transition shadow flex items-center gap-2 disabled:opacity-50"
          >
            {uploading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Enviando...</span>
              </>
            ) : (
              <>
                <UploadCloud className="w-4 h-4" />
                <span>Adicionar Imagem</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => e.target.files && handleUploadFiles(e.target.files)}
        accept="image/png,image/jpeg,image/jpg,image/webp,image/gif,image/svg+xml,image/avif"
        multiple
        className="hidden"
      />

      {/* Drag & Drop Upload Banner */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`p-6 rounded-2xl border-2 border-dashed transition cursor-pointer text-center flex flex-col items-center justify-center gap-2 ${
          isDragOver
            ? 'border-brand-cyan bg-brand-cyan/10'
            : 'border-white/15 bg-white/[0.02] hover:border-white/25 hover:bg-white/[0.04]'
        }`}
      >
        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400">
          <UploadCloud className="w-5 h-5 text-brand-cyan" />
        </div>
        <div>
          <span className="text-xs font-semibold text-white">Arraste e solte fotos aqui</span>
          <span className="text-xs text-gray-400"> ou clique para selecionar do computador</span>
        </div>
        <p className="text-[11px] text-gray-500">
          Suporta PNG, JPG, WEBP, GIF, SVG e AVIF (máx. 15MB por arquivo)
        </p>
      </div>

      {/* Toolbar: Search and Summary */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar imagem por nome..."
            className="w-full bg-[#0e1017] border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-brand-cyan transition font-mono"
          />
        </div>

        <div className="text-xs text-gray-400 flex items-center gap-2 self-end sm:self-auto">
          <span>{filteredImages.length} {filteredImages.length === 1 ? 'imagem' : 'imagens'}</span>
          <span className="text-gray-600">•</span>
          <span className="font-mono text-gray-400">{formatBytes(totalBytes)} no total</span>
        </div>
      </div>

      {/* Images Grid */}
      {loading && images.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center text-gray-400 gap-2">
          <RefreshCw className="w-6 h-6 animate-spin text-brand-cyan" />
          <span className="text-xs">Carregando galeria...</span>
        </div>
      ) : filteredImages.length === 0 ? (
        <div className="py-16 text-center border border-white/[0.08] rounded-2xl bg-white/[0.01] p-6">
          <FileImage className="w-10 h-10 text-gray-600 mx-auto mb-2" />
          <p className="text-xs font-semibold text-white">Nenhuma imagem encontrada</p>
          <p className="text-[11px] text-gray-400 mt-1">
            {searchQuery ? 'Tente outra busca.' : 'Suba a primeira foto usando a área acima.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
          {filteredImages.map((img) => (
            <div
              key={img.name}
              className="group relative rounded-xl border border-white/10 bg-[#0e1017] hover:border-white/20 transition overflow-hidden flex flex-col shadow-sm"
            >
              {/* Image Preview */}
              <div className="relative aspect-square w-full bg-dark-900 overflow-hidden flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.url}
                  alt={img.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
                  onError={(e) => {
                    (e.currentTarget as HTMLElement).style.display = 'none';
                  }}
                />

                {/* Hover overlay actions */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-2">
                  <button
                    type="button"
                    onClick={() => setPreviewImage(img)}
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition"
                    title="Visualizar em tamanho real"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCopyUrl(img.url)}
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition"
                    title="Copiar URL"
                  >
                    {copiedUrl === img.url ? (
                      <Check className="w-3.5 h-3.5 text-green-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setImageToDelete(img)}
                    className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 transition"
                    title="Excluir imagem"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Meta information */}
              <div className="p-2.5 space-y-1">
                <div className="text-[11px] font-medium text-gray-200 truncate font-mono" title={img.name}>
                  {img.name}
                </div>
                <div className="flex items-center justify-between text-[10px] text-gray-500">
                  <span>{formatBytes(img.size)}</span>
                  <span>{formatDate(img.updatedAt)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox / Fullscreen Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="relative max-w-4xl max-h-[85vh] bg-[#0e1017] border border-white/15 rounded-2xl overflow-hidden shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between gap-3">
              <div className="truncate">
                <p className="text-xs font-mono font-medium text-white truncate">{previewImage.name}</p>
                <p className="text-[10px] text-gray-400">{formatBytes(previewImage.size)} • {formatDate(previewImage.updatedAt)}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCopyUrl(previewImage.url)}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-gray-300 hover:text-white transition flex items-center gap-1.5"
                >
                  {copiedUrl === previewImage.url ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-green-400" />
                      <span>Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar URL</span>
                    </>
                  )}
                </button>

                <a
                  href={previewImage.url}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition"
                  title="Abrir em nova aba"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>

                <button
                  type="button"
                  onClick={() => setPreviewImage(null)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Image viewer */}
            <div className="p-4 flex items-center justify-center overflow-auto max-h-[70vh] bg-black/40">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewImage.url}
                alt={previewImage.name}
                className="max-h-[65vh] max-w-full object-contain rounded-lg shadow-md"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = 'none';
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {imageToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#0e1017] border border-white/10 rounded-2xl w-full max-w-md p-5 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <div className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Excluir Imagem Permanentemente?</h3>
                <p className="text-xs text-gray-400">Esta ação não poderá ser desfeita no servidor.</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-dark-900 overflow-hidden relative shrink-0 border border-white/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageToDelete.url}
                  alt={imageToDelete.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
              <div className="truncate text-xs">
                <div className="font-mono text-gray-200 truncate">{imageToDelete.name}</div>
                <div className="text-[10px] text-gray-500">{formatBytes(imageToDelete.size)}</div>
              </div>
            </div>

            <p className="text-[11px] text-gray-400">
              Se esta imagem estiver sendo usada em algum botão ou perfil, ela deixará de carregar na página pública.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setImageToDelete(null)}
                disabled={deleting}
                className="px-3.5 py-1.5 rounded-xl border border-white/10 text-xs font-medium text-gray-300 hover:text-white hover:bg-white/5 transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleting}
                className="px-4 py-1.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50 shadow"
              >
                {deleting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Excluindo...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Confirmar Exclusão</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

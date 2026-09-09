'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  ExternalLink,
  ChevronDown,
  Mail,
  Calendar,
  Sparkles,
  BarChart3,
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
  Globe,
  MessageCircle,
  Check,
  Share2
} from 'lucide-react';
import { ProfileConfig, SocialLink, LinkItem } from '@/lib/links-config';

interface LinkPortalProps {
  profile: ProfileConfig;
  socials: SocialLink[];
  links: LinkItem[];
}

export default function LinkPortal({ profile, socials, links }: LinkPortalProps) {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [clickNotice, setClickNotice] = useState<string | null>(null);

  // Track click metric via API asynchronously
  const handleLinkClick = (id: string, title: string, url: string) => {
    // Show quick feedback notice
    setClickNotice(`Métrica registrada para: "${title.slice(0, 20)}..."`);
    setTimeout(() => setClickNotice(null), 2500);

    try {
      if (typeof window !== 'undefined') {
        const payload = JSON.stringify({ linkId: id, linkTitle: title, url });
        if (navigator.sendBeacon) {
          navigator.sendBeacon('/api/track', payload);
        } else {
          fetch('/api/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: payload,
            keepalive: true,
          });
        }
      }
    } catch (err) {
      console.error('Failed to send click metric:', err);
    }
  };

  const copyEmailToClipboard = (email: string) => {
    handleLinkClick('link-contact-email', 'E-mail de Contato (Copiado)', `mailto:${email}`);
    navigator.clipboard.writeText(email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const getSocialIcon = (platform: string) => {
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

  const safeSocials = Array.isArray(socials) ? socials : [];
  const activeSocials = safeSocials.filter((s) => s && typeof s === 'object' && s.active !== false);

  const safeLinks = Array.isArray(links) ? links : [];
  const primaryCta = safeLinks.find((l) => l && l.type === 'cta-primary' && l.active);
  const heroCard = safeLinks.find((l) => l && l.type === 'hero-card' && l.active);
  const gridCards = safeLinks.filter((l) => l && l.type === 'grid-card' && l.active);
  const contactCard = safeLinks.find((l) => l && l.type === 'contact-card' && l.active);

  return (
    <div className="min-h-screen bg-[#08090d] text-white flex flex-col items-center pb-16 relative selection:bg-brand-pink/30">
      
      {/* Background Decorative Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-b from-purple-900/20 via-pink-900/15 to-transparent rounded-full blur-3xl opacity-70" />
        <div className="absolute top-96 -left-32 w-[350px] h-[350px] bg-brand-pink/10 rounded-full blur-3xl" />
        <div className="absolute bottom-32 -right-32 w-[350px] h-[350px] bg-brand-purple/10 rounded-full blur-3xl" />
      </div>

      {/* Real-time Click Metric Toast */}
      {clickNotice && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-4 z-50 bg-dark-700/90 border border-brand-pink/40 text-xs text-pink-200 px-4 py-2 rounded-full shadow-glow-pink backdrop-blur-md flex items-center gap-2"
        >
          <BarChart3 className="w-3.5 h-3.5 text-brand-pink animate-pulse" />
          <span>{clickNotice}</span>
        </motion.div>
      )}

      {/* Main Container - Mobile First Centered Column */}
      <main className="w-full max-w-md px-4 pt-6 z-10 flex flex-col items-center">
        
        {/* Cover Header Banner */}
        <div className="w-full h-44 rounded-2xl overflow-hidden relative border border-white/10 shadow-2xl mb-[-50px]">
          <Image
            src={profile.coverImageUrl || profile.avatarUrl}
            alt="Cover"
            fill
            className="object-cover object-center filter brightness-90"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#08090d] via-transparent to-black/30" />
          
          {/* Top Admin Quick Switcher */}
          <Link
            href="/admin"
            className="absolute top-3 right-3 bg-black/50 hover:bg-black/80 border border-white/20 text-white/80 hover:text-white px-3 py-1 rounded-full text-xs font-medium backdrop-blur-md transition flex items-center gap-1.5 shadow-lg group"
          >
            <BarChart3 className="w-3.5 h-3.5 text-brand-cyan group-hover:rotate-12 transition-transform" />
            <span>Painel Admin</span>
          </Link>
        </div>

        {/* Profile Avatar */}
        <div className="relative mb-3">
          <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-brand-pink via-brand-purple to-brand-cyan shadow-glow-purple">
            <div className="w-full h-full rounded-full overflow-hidden relative bg-dark-800">
              <Image
                src={profile.avatarUrl}
                alt={profile.name}
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="text-center mb-5 flex flex-col items-center">
          <div className="flex items-center justify-center gap-1.5 mb-0.5">
            <h1 className="text-2xl font-bold tracking-tight text-white">{profile.name}</h1>
            {profile.isVerified && (
              <CheckCircle2 className="w-5 h-5 text-blue-400 fill-blue-400/20" />
            )}
          </div>
          
          <p className="text-sm text-gray-400 font-medium mb-2">{profile.handle}</p>

          {/* Social Icons Bar */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 my-2">
            {activeSocials.map((s) => (
              <a
                key={s.id}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handleLinkClick(s.id, `Social: ${s.title}`, s.url)}
                className="w-10 h-10 rounded-full bg-white/5 border border-white/10 hover:border-white/30 flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-md backdrop-blur-md group"
                title={s.title}
              >
                {getSocialIcon(s.platform)}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-1 text-xs font-semibold text-gray-300 bg-white/5 px-3 py-1 rounded-full border border-white/10 mt-1 mb-2">
            <span>{profile.followersCount}</span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </div>

          <p className="text-xs text-gray-400 max-w-xs leading-relaxed">{profile.tagline}</p>
        </div>

        {/* Primary CTA Button (Book Call / Action) */}
        {primaryCta && (
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full mb-4"
          >
            <a
              href={primaryCta.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => handleLinkClick(primaryCta.id, primaryCta.title, primaryCta.url)}
              className="w-full py-4 px-6 rounded-2xl bg-white text-dark-900 font-bold text-center text-sm shadow-xl flex items-center justify-between group hover:bg-gray-100 transition-all border border-white/40 relative overflow-hidden"
            >
              <span className="w-6 h-6" /> {/* Spacer */}
              <span className="tracking-wide text-base font-extrabold">{primaryCta.title}</span>
              <div className="w-7 h-7 rounded-full bg-dark-900/10 flex items-center justify-center group-hover:bg-dark-900/20 transition">
                <Calendar className="w-4 h-4 text-dark-900" />
              </div>
            </a>
          </motion.div>
        )}

        {/* Hero Featured Card (Linkme Feature Card) */}
        {heroCard && (
          <motion.div
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="w-full mb-4"
          >
            <a
              href={heroCard.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => handleLinkClick(heroCard.id, heroCard.title, heroCard.url)}
              className="group relative w-full h-56 rounded-2xl overflow-hidden block border border-white/15 shadow-2xl glass-card-interactive"
            >
              {heroCard.image && (
                <Image
                  src={heroCard.image}
                  alt={heroCard.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500 filter brightness-90 group-hover:brightness-100"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
              
              {/* Badge & Link Icon */}
              <div className="absolute top-3 right-3">
                <div className="w-9 h-9 rounded-full bg-black/40 border border-white/20 backdrop-blur-md flex items-center justify-center group-hover:scale-110 transition">
                  <ExternalLink className="w-4 h-4 text-white" />
                </div>
              </div>

              {heroCard.badge && (
                <div className="absolute top-3 left-3 bg-brand-pink/80 text-white font-semibold text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full border border-pink-300/30 backdrop-blur-md">
                  {heroCard.badge}
                </div>
              )}

              {/* Title & Subtitle */}
              <div className="absolute bottom-4 left-4 right-4 text-left">
                <h3 className="text-lg font-bold text-white mb-0.5 leading-snug drop-shadow-md">
                  {heroCard.title}
                </h3>
                {heroCard.subtitle && (
                  <p className="text-xs text-gray-300 line-clamp-1">{heroCard.subtitle}</p>
                )}
              </div>
            </a>
          </motion.div>
        )}

        {/* 2x2 Visual Cards Grid */}
        <div className="w-full grid grid-cols-2 gap-3 mb-4">
          {gridCards.map((card) => (
            <motion.div
              key={card.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <a
                href={card.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handleLinkClick(card.id, card.title, card.url)}
                className="group relative w-full h-44 rounded-2xl overflow-hidden block border border-white/10 shadow-xl bg-dark-800 glass-card-interactive"
              >
                {card.image ? (
                  <Image
                    src={card.image}
                    alt={card.title}
                    fill
                    className="object-cover group-hover:scale-108 transition-transform duration-500 filter brightness-85 group-hover:brightness-100"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-dark-700 to-dark-900" />
                )}
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                {/* Top Right Icon */}
                <div className="absolute top-2.5 right-2.5">
                  <div className="w-7 h-7 rounded-full bg-black/40 border border-white/20 backdrop-blur-md flex items-center justify-center group-hover:scale-110 transition">
                    <ExternalLink className="w-3.5 h-3.5 text-white" />
                  </div>
                </div>

                {/* Bottom Overlay Title */}
                <div className="absolute bottom-3 left-3 right-3 text-left">
                  <h4 className="text-xs font-bold text-white leading-tight drop-shadow-md mb-0.5">
                    {card.title}
                  </h4>
                  {card.subtitle && (
                    <p className="text-[10px] text-gray-300 line-clamp-1">{card.subtitle}</p>
                  )}
                </div>
              </a>
            </motion.div>
          ))}
        </div>

        {/* Contact Email Block */}
        {contactCard && (
          <div className="w-full mb-6">
            <button
              onClick={() => copyEmailToClipboard(profile.contactEmail)}
              className="w-full py-3.5 px-4 rounded-xl bg-dark-800/80 hover:bg-dark-700/90 border border-white/10 hover:border-white/20 text-gray-200 text-xs font-medium flex items-center justify-center gap-2 transition-all shadow-md group"
            >
              {copiedEmail ? (
                <>
                  <Check className="w-4 h-4 text-green-400" />
                  <span className="text-green-300 font-semibold">E-mail copiado para a área de transferência!</span>
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 text-gray-400 group-hover:text-white transition" />
                  <span className="font-semibold">{profile.contactEmail}</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Footer info & Admin Button */}
        <footer className="text-center pt-2 pb-6 border-t border-white/5 w-full flex flex-col items-center gap-2">
          <div className="flex items-center justify-center gap-4 text-[11px] text-gray-500 font-medium">
            <span>Covilink Analytics</span>
            <span>•</span>
            <Link href="/admin" className="hover:text-brand-pink underline transition">
              Acessar Painel de Métricas
            </Link>
          </div>
        </footer>

      </main>
    </div>
  );
}

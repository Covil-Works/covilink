'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ExternalLink,
  Mail,
  Sparkles,
  Check,
  EyeOff
} from 'lucide-react';
import { ProfileConfig, SocialLink, LinkItem, INITIAL_PROFILE } from '@/lib/links-config';
import { SocialIcon } from '@/components/SocialIcons';

interface LinkPortalProps {
  profile?: ProfileConfig;
  socials?: SocialLink[];
  links?: LinkItem[];
}

function getBadgeColorClasses(color?: string, isCardPhoto = false): string {
  if (!color || color === 'pink' || color === '#ff3b94') {
    return isCardPhoto
      ? 'bg-brand-pink/85 text-white border-pink-300/40 shadow-glow-pink'
      : 'bg-brand-pink/20 text-brand-pink border-brand-pink/30';
  }
  if (color === 'purple' || color === '#9333ea') {
    return isCardPhoto
      ? 'bg-purple-600/85 text-white border-purple-400/40 shadow-glow-purple'
      : 'bg-purple-500/20 text-purple-300 border-purple-500/30';
  }
  if (color === 'cyan' || color === 'blue' || color === '#06b6d4') {
    return isCardPhoto
      ? 'bg-cyan-500/85 text-white border-cyan-300/40 shadow-glow-cyan'
      : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
  }
  if (color === 'emerald' || color === 'green' || color === '#10b981') {
    return isCardPhoto
      ? 'bg-emerald-500/85 text-white border-emerald-300/40'
      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
  }
  if (color === 'amber' || color === 'yellow' || color === 'gold' || color === '#f59e0b') {
    return isCardPhoto
      ? 'bg-amber-500/85 text-white border-amber-300/40'
      : 'bg-amber-500/20 text-amber-300 border-amber-500/30';
  }
  if (color === 'rose' || color === 'red' || color === '#e11d48') {
    return isCardPhoto
      ? 'bg-rose-600/85 text-white border-rose-300/40'
      : 'bg-rose-500/20 text-rose-300 border-rose-500/30';
  }
  if (color === 'white' || color === '#ffffff') {
    return isCardPhoto
      ? 'bg-white/95 text-dark-900 border-white/60'
      : 'bg-white/20 text-white border-white/40';
  }
  if (color === 'dark' || color === 'black' || color === '#18181b') {
    return isCardPhoto
      ? 'bg-black/80 text-white border-white/25'
      : 'bg-black/40 text-gray-300 border-white/20';
  }
  return isCardPhoto
    ? 'text-white border-white/30'
    : 'border-white/30';
}

function getBadgeInlineStyle(color?: string, isCardPhoto = false): React.CSSProperties | undefined {
  if (color && color.startsWith('#')) {
    const isLight = color.toLowerCase() === '#ffffff' || color.toLowerCase() === '#fff';
    if (isCardPhoto) {
      return {
        backgroundColor: color,
        color: isLight ? '#08090d' : '#ffffff',
        borderColor: isLight ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.4)',
      };
    } else {
      return {
        backgroundColor: `${color}33`,
        color: isLight ? '#ffffff' : color,
        borderColor: `${color}55`,
      };
    }
  }
  return undefined;
}

export default function LinkPortal({ profile, socials, links }: LinkPortalProps) {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [revealedCards, setRevealedCards] = useState<Record<string, boolean>>({});

  const safeProfile: ProfileConfig = {
    name: profile?.name || INITIAL_PROFILE.name,
    handle: profile?.handle || INITIAL_PROFILE.handle,
    showHandle: profile?.showHandle !== false,
    isVerified: profile?.isVerified !== false,
    followersCount: profile?.followersCount || INITIAL_PROFILE.followersCount,
    bio: profile?.bio || INITIAL_PROFILE.bio,
    showBio: profile?.showBio !== false,
    avatarUrl: profile?.avatarUrl || INITIAL_PROFILE.avatarUrl,
    coverImageUrl: profile?.coverImageUrl || '',
    coverPosition: profile?.coverPosition || '50% 50%',
    coverFit: profile?.coverFit || 'cover',
    contactEmail: profile?.contactEmail || INITIAL_PROFILE.contactEmail,
    showContactEmail: profile?.showContactEmail !== false,
  };

  const [avatarSrc, setAvatarSrc] = useState(safeProfile.avatarUrl || INITIAL_PROFILE.avatarUrl);
  const [coverSrc, setCoverSrc] = useState(safeProfile.coverImageUrl || '');
  const [coverFailed, setCoverFailed] = useState(false);

  useEffect(() => {
    setAvatarSrc(safeProfile.avatarUrl || INITIAL_PROFILE.avatarUrl);
    setCoverSrc(safeProfile.coverImageUrl || '');
    setCoverFailed(false);
    if (safeProfile.name && typeof document !== 'undefined') {
      document.title = safeProfile.name;
    }
  }, [safeProfile.avatarUrl, safeProfile.coverImageUrl, safeProfile.name]);

  // Track pageview on mount and maintain anonymous visitor ID
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        let vid = '';
        try {
          vid = localStorage.getItem('covilink_vid') || '';
          if (!vid) {
            vid = `v-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
            localStorage.setItem('covilink_vid', vid);
          }
        } catch {
          vid = `v-${Date.now()}`;
        }

        const sessionKey = 'covilink_pv_sent';
        if (!sessionStorage.getItem(sessionKey)) {
          sessionStorage.setItem(sessionKey, '1');
          const payload = JSON.stringify({
            type: 'pageview',
            linkId: 'pageview',
            linkTitle: 'Visualização do Perfil',
            url: window.location.href,
            visitorId: vid,
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            language: navigator.language,
          });

          if (navigator.sendBeacon) {
            navigator.sendBeacon('/api/track', payload);
          } else {
            fetch('/api/track', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: payload,
              keepalive: true,
            }).catch(() => {});
          }
        }
      }
    } catch (err) {
      console.error('Failed to register pageview:', err);
    }
  }, []);

  // Track scroll depth milestones (25%, 50%, 75%, 100%)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const reported = new Set<number>();

    const sendScrollDepth = (depth: number) => {
      if (reported.has(depth)) return;
      reported.add(depth);

      let vid = '';
      try {
        vid = localStorage.getItem('covilink_vid') || '';
      } catch {}

      const payload = JSON.stringify({
        type: 'scroll_depth',
        scrollDepth: depth,
        linkId: `scroll-${depth}`,
        linkTitle: `Rolagem: ${depth}%`,
        url: window.location.href,
        visitorId: vid,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: navigator.language,
      });

      if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/track', payload);
      } else {
        fetch('/api/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payload,
          keepalive: true,
        }).catch(() => {});
      }
    };

    const checkScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight <= 10) {
        [25, 50, 75, 100].forEach((d) => sendScrollDepth(d));
        return;
      }
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const pct = Math.min(100, Math.round((scrollTop / scrollHeight) * 100));

      if (pct >= 25) sendScrollDepth(25);
      if (pct >= 50) sendScrollDepth(50);
      if (pct >= 75) sendScrollDepth(75);
      if (pct >= 95) sendScrollDepth(100);
    };

    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          checkScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    const timer = setTimeout(checkScroll, 500);

    return () => {
      window.removeEventListener('scroll', onScroll);
      clearTimeout(timer);
    };
  }, []);

  // Track dwell time (active time on page)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let startTime = Date.now();
    let accumulatedActiveSeconds = 0;
    let isVisible = document.visibilityState === 'visible';

    const sendDwell = () => {
      let currentSessionSeconds = 0;
      if (isVisible) {
        currentSessionSeconds = Math.round((Date.now() - startTime) / 1000);
      }
      const totalSeconds = Math.min(600, Math.max(1, accumulatedActiveSeconds + currentSessionSeconds));

      let vid = '';
      try {
        vid = localStorage.getItem('covilink_vid') || '';
      } catch {}

      const payload = JSON.stringify({
        type: 'dwell_time',
        dwellSeconds: totalSeconds,
        linkId: 'dwell',
        linkTitle: `Permanência: ${totalSeconds}s`,
        url: window.location.href,
        visitorId: vid,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: navigator.language,
      });

      if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/track', payload);
      } else {
        fetch('/api/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payload,
          keepalive: true,
        }).catch(() => {});
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        if (isVisible) {
          accumulatedActiveSeconds += Math.round((Date.now() - startTime) / 1000);
          isVisible = false;
          sendDwell();
        }
      } else {
        startTime = Date.now();
        isVisible = true;
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', sendDwell);
    window.addEventListener('pagehide', sendDwell);

    const checkpointTimers = [
      setTimeout(sendDwell, 5000),
      setTimeout(sendDwell, 15000),
      setTimeout(sendDwell, 30000),
      setTimeout(sendDwell, 60000),
    ];

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', sendDwell);
      window.removeEventListener('pagehide', sendDwell);
      checkpointTimers.forEach(clearTimeout);
      sendDwell();
    };
  }, []);

  const hasCustomCover = Boolean(
    coverSrc &&
    coverSrc.trim() !== '' &&
    coverSrc !== avatarSrc &&
    !coverFailed
  );

  // Track click metric via API asynchronously in the background
  const handleLinkClick = (id: string, title: string, url: string) => {
    try {
      if (typeof window !== 'undefined') {
        let vid = '';
        try {
          vid = localStorage.getItem('covilink_vid') || '';
        } catch {}

        const payload = JSON.stringify({
          type: 'click',
          linkId: id,
          linkTitle: title,
          url,
          visitorId: vid,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          language: navigator.language,
        });

        if (navigator.sendBeacon) {
          navigator.sendBeacon('/api/track', payload);
        } else {
          fetch('/api/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: payload,
            keepalive: true,
          }).catch(() => {});
        }
      }
    } catch (err) {
      console.error('Failed to send click metric:', err);
    }
  };

  // Track blur reveal metric when user clicks to unblur a photo card
  const handleBlurReveal = (id: string, title: string, url: string) => {
    try {
      if (typeof window !== 'undefined') {
        let vid = '';
        try {
          vid = localStorage.getItem('covilink_vid') || '';
        } catch {}

        const payload = JSON.stringify({
          type: 'blur_reveal',
          linkId: id,
          linkTitle: title,
          url,
          visitorId: vid,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          language: navigator.language,
        });

        if (navigator.sendBeacon) {
          navigator.sendBeacon('/api/track', payload);
        } else {
          fetch('/api/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: payload,
            keepalive: true,
          }).catch(() => {});
        }
      }
    } catch (err) {
      console.error('Failed to send blur reveal metric:', err);
    }
  };

  const copyEmailToClipboard = (email: string) => {
    handleLinkClick('link-contact-email', 'E-mail de Contato (Copiado)', `mailto:${email}`);
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(email).catch(() => {});
    }
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const safeSocials = Array.isArray(socials) ? socials : [];
  const activeSocials = safeSocials.filter((s) => s && typeof s === 'object' && s.active !== false);

  const safeLinks = Array.isArray(links) ? links : [];
  const activeLinks = safeLinks.filter((l) => l && typeof l === 'object' && l.active !== false);

  return (
    <div className="min-h-screen min-h-[100dvh] w-full max-w-full overflow-x-hidden bg-[#08090d] text-white flex flex-col items-center relative selection:bg-brand-pink/30">
      
      {/* Background Decorative Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 w-full max-w-full">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[500px] max-w-[100vw] h-[500px] bg-gradient-to-b from-purple-900/20 via-pink-900/15 to-transparent rounded-full blur-3xl opacity-70" />
        <div className="absolute top-96 left-0 w-[240px] h-[240px] bg-brand-pink/10 rounded-full blur-3xl -translate-x-1/2" />
        <div className="absolute bottom-32 right-0 w-[240px] h-[240px] bg-brand-purple/10 rounded-full blur-3xl translate-x-1/2" />
      </div>

      {/* Main Container - Mobile First Centered Column */}
      <main className="w-full max-w-md px-4 pt-4 z-10 flex flex-col items-center flex-1 overflow-x-hidden">
        
        {/* Cover Header Banner */}
        <div className="w-full h-[161px] rounded-2xl overflow-hidden relative border border-white/10 shadow-2xl mb-[-48px] bg-dark-800 shrink-0">
          {hasCustomCover ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={coverSrc}
              alt="Cover"
              className="absolute inset-0 w-full h-full filter brightness-90 transition-opacity duration-300"
              style={{
                objectPosition: safeProfile.coverPosition || '50% 50%',
                objectFit: safeProfile.coverFit || 'cover',
              }}
              onError={() => setCoverFailed(true)}
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-purple-950/60 via-dark-800 to-pink-950/40" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#08090d] via-transparent to-black/30 pointer-events-none" />
        </div>

        {/* Profile Avatar (Strictly sized, never stretches) */}
        <div className="relative mb-3 z-10 shrink-0">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden relative bg-dark-800 shadow-2xl border-2 border-white/15 shrink-0 mx-auto">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={avatarSrc}
              alt={safeProfile.name}
              className="w-full h-full object-cover object-center"
              onError={() => setAvatarSrc(INITIAL_PROFILE.avatarUrl)}
            />
          </div>
        </div>

        {/* Profile Details */}
        <div className="text-center mb-5 flex flex-col items-center w-full">
          <div className="flex items-center justify-center gap-1.5 mb-0.5">
            <h1 className="text-2xl font-bold tracking-tight text-white">{safeProfile.name}</h1>
            {safeProfile.isVerified && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src="/images/verify.webp"
                alt="Selo Verificado"
                className="w-5 h-5 object-contain shrink-0 select-none inline-block drop-shadow-sm"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = 'none';
                }}
              />
            )}
          </div>
          
          {safeProfile.showHandle && safeProfile.handle && (
            <p className="text-sm text-gray-400 font-medium mb-2">{safeProfile.handle}</p>
          )}

          {/* Social Icons Bar */}
          {activeSocials.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-2.5 my-2">
              {activeSocials.map((s) => (
                <a
                  key={s.id}
                  href={s.url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handleLinkClick(s.id, `Social: ${s.title}`, s.url)}
                  className="w-10 h-10 rounded-full bg-white/5 border border-white/10 hover:border-white/30 flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-md backdrop-blur-md group"
                  title={s.title}
                >
                  <SocialIcon platform={s.platform} className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
                </a>
              ))}
            </div>
          )}

          {safeProfile.showBio && safeProfile.bio && (
            <p className="text-xs text-gray-300 max-w-xs leading-relaxed mt-1 text-center font-normal">{safeProfile.bio}</p>
          )}
        </div>

        {/* Render Buttons in exact configured order */}
        <div className="w-full space-y-3 mb-4">
          {activeLinks.map((item) => {
            const hasValidImage = Boolean(item.image && item.image.trim() !== '');

            // Type 1: Left Miniature Photo Thumbnail ("left-thumb" / miniatura na esquerda)
            if (item.type === 'left-thumb' || item.type === 'cta-primary') {
              return (
                <motion.div
                  key={item.id}
                  whileHover={{ scale: 1.015 }}
                  whileTap={{ scale: 0.985 }}
                  className="w-full"
                >
                  <a
                    href={item.url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => handleLinkClick(item.id, item.title, item.url)}
                    className="w-full p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/25 text-white shadow-xl flex items-center justify-between group transition-all backdrop-blur-md"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {hasValidImage ? (
                        <div className="w-12 h-12 rounded-xl overflow-hidden relative shrink-0 border border-white/20 shadow-md bg-dark-800">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-full h-full transition-transform duration-300"
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
                        <div className="w-12 h-12 rounded-xl bg-brand-purple/20 border border-brand-purple/30 flex items-center justify-center shrink-0 text-brand-purple">
                          <Sparkles className="w-5 h-5" />
                        </div>
                      )}
                      <div className="text-left truncate">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-white truncate group-hover:text-pink-300 transition">{item.title}</h3>
                          {item.badge && item.badge.trim() !== '' && (
                            <span
                              className={`text-[9px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${getBadgeColorClasses(item.badgeColor, false)}`}
                              style={getBadgeInlineStyle(item.badgeColor, false)}
                            >
                              {item.badge}
                            </span>
                          )}
                        </div>
                        {item.subtitle && <p className="text-xs text-gray-400 truncate mt-0.5">{item.subtitle}</p>}
                      </div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-white/5 group-hover:bg-white/15 flex items-center justify-center transition shrink-0 ml-3 border border-white/10">
                      <ExternalLink className="w-3.5 h-3.5 text-gray-300 group-hover:text-white" />
                    </div>
                  </a>
                </motion.div>
              );
            }

            // Type 3: Full Photo Card ("botão com foto")
            if (item.type === 'card-photo' || item.type === 'hero-card') {
              const isBlurred = Boolean(item.hasBlur && !revealedCards[item.id]);

              return (
                <motion.div
                  key={item.id}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="w-full"
                >
                  <a
                    href={item.url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => {
                      if (isBlurred) {
                        e.preventDefault();
                        handleBlurReveal(item.id, item.title, item.url);
                        setRevealedCards((prev) => ({ ...prev, [item.id]: true }));
                        return;
                      }
                      handleLinkClick(item.id, item.title, item.url);
                    }}
                    className="group relative w-full h-48 rounded-2xl overflow-hidden block border border-white/15 shadow-2xl glass-card-interactive bg-dark-800 shrink-0 select-none"
                  >
                    {hasValidImage ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={item.image}
                        alt={item.title}
                        className={`absolute inset-0 w-full h-full transition-all duration-500 filter ${
                          isBlurred
                            ? 'blur-lg scale-110 brightness-75'
                            : 'blur-0 scale-100 brightness-90 group-hover:brightness-100 group-hover:scale-105'
                        }`}
                        style={{
                          objectPosition: item.imagePosition || '50% 50%',
                          objectFit: item.imageFit || 'cover',
                        }}
                        onError={(e) => {
                          (e.currentTarget as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className={`w-full h-full bg-gradient-to-br from-brand-purple/40 to-dark-900 transition-all duration-500 ${isBlurred ? 'blur-lg scale-110' : ''}`} />
                    )}

                    {/* Central Eye-Off Icon & Blur Overlay */}
                    {isBlurred && (
                      <div
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleBlurReveal(item.id, item.title, item.url);
                          setRevealedCards((prev) => ({ ...prev, [item.id]: true }));
                        }}
                        className="absolute inset-0 z-20 flex flex-col items-center justify-center backdrop-blur-md bg-black/40 cursor-pointer transition-all duration-300 hover:bg-black/50 group/blur px-4 text-center"
                        title={item.blurText && item.blurText.trim() !== '' ? item.blurText : 'Clique para ver a foto'}
                      >
                        <EyeOff className="w-8 h-8 text-white drop-shadow-lg group-hover/blur:scale-110 transition-transform duration-300 shrink-0" />
                        <span className="text-xs font-semibold text-white/95 mt-2 drop-shadow-md tracking-wide max-w-full truncate">
                          {item.blurText && item.blurText.trim() !== '' ? item.blurText : 'Clique para ver a foto'}
                        </span>
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent pointer-events-none z-10" />
                    
                    <div className="absolute top-3 right-3 z-30">
                      <div className="w-8 h-8 rounded-full bg-black/50 border border-white/20 backdrop-blur-md flex items-center justify-center group-hover:scale-110 transition">
                        <ExternalLink className="w-4 h-4 text-white" />
                      </div>
                    </div>

                    {item.badge && item.badge.trim() !== '' && (
                      <div
                        className={`absolute top-3 left-3 z-30 font-semibold text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full border backdrop-blur-md shadow-md ${getBadgeColorClasses(item.badgeColor, true)}`}
                        style={getBadgeInlineStyle(item.badgeColor, true)}
                      >
                        {item.badge}
                      </div>
                    )}

                    <div className="absolute bottom-4 left-4 right-4 text-left z-10">
                      <h3 className="text-base font-bold text-white mb-0.5 leading-snug drop-shadow-md">
                        {item.title}
                      </h3>
                      {item.subtitle && (
                        <p className="text-xs text-gray-300 line-clamp-1">{item.subtitle}</p>
                      )}
                    </div>
                  </a>
                </motion.div>
              );
            }

            // Type 4: Simple Button Without Photo ("botão sem foto")
            return (
              <motion.div
                key={item.id}
                whileHover={{ scale: 1.015 }}
                whileTap={{ scale: 0.985 }}
                className="w-full"
              >
                <a
                  href={item.url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handleLinkClick(item.id, item.title, item.url)}
                  className="w-full py-4 px-5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/25 text-white shadow-xl flex items-center justify-between group transition-all backdrop-blur-md"
                >
                  <div className="text-left truncate pr-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold tracking-wide text-white group-hover:text-pink-300 transition truncate">{item.title}</span>
                      {item.badge && item.badge.trim() !== '' && (
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${getBadgeColorClasses(item.badgeColor, false)}`}
                          style={getBadgeInlineStyle(item.badgeColor, false)}
                        >
                          {item.badge}
                        </span>
                      )}
                    </div>
                    {item.subtitle && <p className="text-xs text-gray-400 truncate mt-0.5">{item.subtitle}</p>}
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white/5 group-hover:bg-white/15 flex items-center justify-center transition shrink-0 border border-white/10">
                    <ExternalLink className="w-3.5 h-3.5 text-gray-300 group-hover:text-white" />
                  </div>
                </a>
              </motion.div>
            );
          })}
        </div>

        {/* Contact Email Block */}
        {safeProfile.showContactEmail && safeProfile.contactEmail && (
          <div className="w-full mb-4">
            <button
              onClick={() => copyEmailToClipboard(safeProfile.contactEmail)}
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
                  <span className="font-semibold">{safeProfile.contactEmail}</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Footer info (Aligned to bottom on short content, flows naturally on scroll) */}
        <footer className="w-full mt-auto pt-6 pb-6 sm:pb-8 border-t border-white/5 flex flex-col items-center text-center gap-1">
          <p className="text-[11px] text-gray-500 font-medium tracking-wide">
            covilink
          </p>
        </footer>

      </main>
    </div>
  );
}

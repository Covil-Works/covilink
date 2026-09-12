export interface LinkItem {
  id: string;
  type: 'cta-primary' | 'hero-card' | 'grid-card' | 'contact-card' | 'no-photo' | 'left-thumb' | 'card-photo';
  title: string;
  subtitle?: string;
  url: string;
  image?: string;
  imagePosition?: string;
  imageFit?: 'cover' | 'contain';
  badge?: string;
  iconName?: string;
  category?: 'mentorship' | 'social' | 'product' | 'content' | 'contact' | 'custom';
  gridSpan?: 'full' | 'half';
  active: boolean;
  hasBlur?: boolean;
  blurText?: string;
  badgeColor?: string;
}

export interface SocialLink {
  id: string;
  platform:
    | 'instagram'
    | 'youtube'
    | 'twitter'
    | 'tiktok'
    | 'whatsapp'
    | 'linkedin'
    | 'spotify'
    | 'github'
    | 'facebook'
    | 'twitch'
    | 'threads'
    | 'discord'
    | 'telegram'
    | 'pinterest'
    | 'snapchat'
    | 'bluesky'
    | 'website'
    | 'other'
    | string;
  title: string;
  url: string;
  icon?: string;
  active?: boolean;
}

export interface ProfileConfig {
  name: string;
  handle: string;
  showHandle?: boolean;
  isVerified: boolean;
  followersCount: string;
  tagline?: string;
  bio: string;
  showBio?: boolean;
  avatarUrl: string;
  coverImageUrl?: string;
  coverPosition?: string;
  coverFit?: 'cover' | 'contain';
  contactEmail: string;
  showContactEmail?: boolean;
}

export const INITIAL_PROFILE: ProfileConfig = {
  name: "Kourtney Reppert",
  handle: "@kourtneyreppert",
  showHandle: true,
  isVerified: true,
  followersCount: "2.4M Total Followers",
  bio: "Criadora de Conteúdo, Empreendedora & Mentora de Estilo de Vida.",
  showBio: true,
  avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
  coverImageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80",
  contactEmail: "contato@kourtneyreppert.com",
  showContactEmail: true,
};

export const INITIAL_SOCIALS: SocialLink[] = [
  { id: 'soc-1', platform: 'instagram', title: 'Instagram', url: 'https://instagram.com/kourtneyreppert', active: true },
  { id: 'soc-2', platform: 'twitter', title: 'X (Twitter)', url: 'https://x.com/kourtneyreppert', active: true },
  { id: 'soc-3', platform: 'youtube', title: 'YouTube', url: 'https://youtube.com/@kourtneyreppert', active: true },
  { id: 'soc-4', platform: 'tiktok', title: 'TikTok', url: 'https://tiktok.com/@kourtneyreppert', active: true },
  { id: 'soc-5', platform: 'whatsapp', title: 'WhatsApp', url: 'https://wa.me/5511999999999', active: true },
  { id: 'soc-6', platform: 'linkedin', title: 'LinkedIn', url: 'https://linkedin.com/in/kourtneyreppert', active: true },
  { id: 'soc-7', platform: 'spotify', title: 'Spotify', url: 'https://open.spotify.com', active: true },
  { id: 'soc-8', platform: 'github', title: 'GitHub', url: 'https://github.com', active: true },
];

export const INITIAL_LINKS: LinkItem[] = [
  {
    id: 'link-mentor-call',
    type: 'left-thumb',
    title: 'Agendar Chamada de Mentoria VIP!',
    subtitle: 'Sessão 1-on-1 exclusiva com horário garantido',
    url: 'https://calendly.com',
    badge: 'Populares',
    iconName: 'Calendar',
    category: 'mentorship',
    gridSpan: 'full',
    active: true,
  },
  {
    id: 'link-indigo-beauty',
    type: 'card-photo',
    title: 'Programa Indigo Alien Beauty 🌌👽',
    subtitle: 'Descubra os segredos da estética futurista & maquiagem',
    url: 'https://example.com/indigo-beauty',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
    badge: 'Destaque Principal',
    category: 'product',
    gridSpan: 'full',
    active: true,
  },
  {
    id: 'link-bombshell-glam',
    type: 'left-thumb',
    title: 'Bombshell Glam Program',
    subtitle: 'Curso completo de estilo',
    url: 'https://example.com/bombshell',
    image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=600&q=80',
    category: 'content',
    gridSpan: 'full',
    active: true,
  },
  {
    id: 'link-kr-media',
    type: 'left-thumb',
    title: 'KR Media: Mentorship & Programs',
    subtitle: 'Aceleração de negócios criativos',
    url: 'https://example.com/kr-media',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
    category: 'mentorship',
    gridSpan: 'full',
    active: true,
  },
  {
    id: 'link-ko-art',
    type: 'no-photo',
    title: 'Galeria Ko-Art 🎨',
    subtitle: 'Obras de arte & NFTs exclusivos',
    url: 'https://example.com/ko-art',
    category: 'product',
    gridSpan: 'full',
    active: true,
  },
  {
    id: 'link-calendars-merch',
    type: 'no-photo',
    title: 'Calendários & Merch Oficial',
    subtitle: 'Produtos físicos com frete grátis',
    url: 'https://example.com/merch',
    category: 'product',
    gridSpan: 'full',
    active: true,
  },
];

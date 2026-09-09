import LinkPortal from '@/components/LinkPortal';
import { getSocials } from '@/lib/socials-store';
import { getProfile } from '@/lib/profile-store';
import { getLinks } from '@/lib/links-store';
import { SocialLink, ProfileConfig, LinkItem } from '@/lib/links-config';

// Ensure fresh read of configuration files on every request
export const revalidate = 0;

export const metadata = {
  title: 'Kourtney Reppert | Covilink',
  description: 'Galactic Glam Goddess - Links oficiais, mentoria, cursos e mídias.',
};

export default async function HomePage() {
  let profile: ProfileConfig;
  let socials: SocialLink[] = [];
  let links: LinkItem[] = [];

  try {
    profile = await getProfile();
    socials = await getSocials();
    links = await getLinks();
  } catch (err) {
    console.error('Error loading data in HomePage:', err);
    profile = (await import('@/lib/links-config')).INITIAL_PROFILE;
    socials = (await import('@/lib/links-config')).INITIAL_SOCIALS;
    links = (await import('@/lib/links-config')).INITIAL_LINKS;
  }

  return (
    <LinkPortal
      profile={profile}
      socials={Array.isArray(socials) ? socials : []}
      links={Array.isArray(links) ? links : []}
    />
  );
}

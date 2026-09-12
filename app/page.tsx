import type { Metadata } from 'next';
import LinkPortal from '@/components/LinkPortal';
import { getSocials } from '@/lib/socials-store';
import { getProfile } from '@/lib/profile-store';
import { getLinks } from '@/lib/links-store';
import { SocialLink, ProfileConfig, LinkItem, INITIAL_PROFILE } from '@/lib/links-config';

// Ensure fresh read of configuration files on every request
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  try {
    const profile = await getProfile();
    const title = profile?.name?.trim() || INITIAL_PROFILE.name;
    const description = profile?.bio?.trim() || `Portal de links oficial de ${title}`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
      },
    };
  } catch (err) {
    return {
      title: INITIAL_PROFILE.name,
      description: INITIAL_PROFILE.bio,
    };
  }
}

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

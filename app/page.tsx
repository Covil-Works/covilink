import LinkPortal from '@/components/LinkPortal';
import { INITIAL_PROFILE, INITIAL_LINKS, SocialLink } from '@/lib/links-config';
import { getSocials } from '@/lib/socials-store';

// Ensure fresh read of configuration file
export const revalidate = 0;

export const metadata = {
  title: 'Kourtney Reppert | Covilink',
  description: 'Galactic Glam Goddess - Links oficiais, mentoria, cursos e mídias.',
};

export default async function HomePage() {
  let socials: SocialLink[] = [];
  try {
    socials = await getSocials();
  } catch (err) {
    console.error('Error loading socials in HomePage:', err);
  }

  return (
    <LinkPortal
      profile={INITIAL_PROFILE}
      socials={Array.isArray(socials) ? socials : []}
      links={INITIAL_LINKS}
    />
  );
}


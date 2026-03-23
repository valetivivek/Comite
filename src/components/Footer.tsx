import {
  BookOpenText,
  Bookmark,
  FileText,
  Flame,
  History,
  Library,
  LogIn,
  Scale,
  ScrollText,
  Settings,
  ShieldCheck,
  Sparkles,
  UserPlus,
  UserRound,
} from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';
import { Footer as FooterBlock, FooterColumn } from '@/components/ui/footer';

const Footer = () => {
  const { isAuthenticated } = useAuth();

  const columns: FooterColumn[] = [
    {
      title: 'Discover',
      links: [
        { name: 'Browse library', Icon: BookOpenText, href: '/' },
        { name: 'Popular', Icon: Flame, href: '/popular' },
        { name: 'New releases', Icon: Sparkles, href: '/new-releases' },
        { name: 'Reading history', Icon: History, href: '/history' },
      ],
    },
    {
      title: isAuthenticated ? 'Your shelf' : 'Get started',
      links: isAuthenticated
        ? [
            { name: 'Bookmarks', Icon: Bookmark, href: '/bookmarks' },
            { name: 'Library', Icon: Library, href: '/library' },
            { name: 'Profile', Icon: UserRound, href: '/profile' },
            { name: 'Settings', Icon: Settings, href: '/settings' },
          ]
        : [
            { name: 'Bookmarks', Icon: Bookmark, href: '/bookmarks' },
            { name: 'Reading history', Icon: History, href: '/history' },
            { name: 'Sign in', Icon: LogIn, href: '/login' },
            { name: 'Create account', Icon: UserPlus, href: '/signup' },
          ],
    },
    {
      title: 'Legal',
      links: [
        { name: 'Privacy policy', Icon: ShieldCheck, href: '/legal/privacy' },
        { name: 'Terms of use', Icon: ScrollText, href: '/legal/terms' },
        { name: 'License', Icon: Scale, href: '/legal/license' },
        { name: 'DMCA', Icon: FileText, href: '/legal/dmca' },
      ],
    },
  ];

  return (
    <FooterBlock
      brand={{
        name: 'ComiTe',
        description:
          'A cleaner way to browse series, keep your place, and return to the right chapter without the clutter of a generic comic portal.',
      }}
      socialLinks={[
        {
          name: 'Portfolio',
          href: 'https://valeti.live',
        },
      ]}
      columns={columns}
      copyright={`Copyright ${new Date().getFullYear()} ComiTe. Designed and built by Vishnu Vivek Valeti.`}
    />
  );
};

export default Footer;

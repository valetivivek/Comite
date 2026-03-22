import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  BookmarkIcon,
  BookOpenIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import BrandLogo from './BrandLogo';

const containerVariants = {
  hidden: { opacity: 0, y: 48 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: 'easeOut',
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.55, ease: 'easeOut' },
  },
};

const linkVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
};

const quickActionVariants = {
  hidden: { opacity: 0, scale: 0.75 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 220,
      damping: 16,
    },
  },
};

const backgroundVariants = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 1.6,
      ease: 'easeOut',
    },
  },
};

const footerData = {
  sections: [
    {
      title: 'Browse',
      links: [
        { label: 'Library', to: '/' },
        { label: 'Popular', to: '/popular' },
        { label: 'New Releases', to: '/new-releases' },
        { label: 'Welcome Shelf', to: '/welcome' },
      ],
    },
    {
      title: 'Reading',
      links: [
        { label: 'History', to: '/history' },
        { label: 'Bookmarks', to: '/bookmarks' },
        { label: 'Notifications', to: '/notifications' },
        { label: 'Library', to: '/library' },
      ],
    },
    {
      title: 'Account',
      links: [
        { label: 'Login', to: '/login' },
        { label: 'Signup', to: '/signup' },
        { label: 'Profile', to: '/profile' },
        { label: 'Settings', to: '/settings' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { label: 'Terms', to: '/legal/terms' },
        { label: 'License', to: '/legal/license' },
        { label: 'Privacy', to: '/legal/privacy' },
        { label: 'DMCA', to: '/legal/dmca' },
      ],
    },
  ],
  quickActions: [
    { to: '/', label: 'Browse', icon: BookOpenIcon },
    { to: '/bookmarks', label: 'Bookmarks', icon: BookmarkIcon },
    { to: '/history', label: 'History', icon: ClockIcon },
  ],
  title: 'ComiTe',
  subtitle: 'Quiet browsing. Fast return trips. Better reading flow.',
};

interface NavSectionProps {
  title: string;
  links: Array<{ label: string; to: string }>;
}

const NavSection = ({ title, links }: NavSectionProps) => (
  <motion.div variants={itemVariants} className="flex flex-col gap-2">
    <h3 className="mb-2 border-b border-manga-border/80 pb-2 text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-manga-muted">
      {title}
    </h3>
    {links.map((link) => (
      <motion.div key={link.label} variants={linkVariants}>
        <Link
          to={link.to}
          className="group inline-flex items-center gap-2 rounded px-1 py-1 text-xs text-manga-text-secondary transition-colors duration-300 hover:text-manga-accent md:text-sm"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-manga-border transition-colors duration-300 group-hover:bg-manga-accent" />
          <span className="relative">
            {link.label}
            <span className="absolute bottom-0 left-0 h-px w-0 bg-manga-accent transition-all duration-300 group-hover:w-full" />
          </span>
        </Link>
      </motion.div>
    ))}
  </motion.div>
);

interface QuickActionProps {
  to: string;
  label: string;
  icon: typeof BookOpenIcon;
}

const QuickAction = ({ to, label, icon: Icon }: QuickActionProps) => (
  <motion.div variants={quickActionVariants}>
    <Link
      to={to}
      aria-label={label}
      className="group flex h-10 w-10 items-center justify-center rounded-full border border-manga-border bg-manga-surface/85 text-manga-text transition-all duration-300 hover:border-manga-accent/40 hover:bg-manga-accent hover:text-manga-on-accent md:h-11 md:w-11"
    >
      <Icon className="h-4 w-4 md:h-5 md:w-5" />
    </Link>
  </motion.div>
);

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="relative mt-auto h-[72vh]"
      style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' }}
    >
      <div className="relative -top-[100vh] h-[calc(100vh+72vh)]">
        <div className="sticky top-[calc(100vh-72vh)] h-[72vh]">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={containerVariants}
            className="relative flex h-full w-full flex-col justify-between overflow-hidden border-t border-manga-border bg-[radial-gradient(circle_at_top,rgba(249,115,22,0.08),transparent_30%),linear-gradient(135deg,var(--card),color-mix(in_srgb,var(--surface)_72%,var(--card)),var(--card))] px-4 py-8 sm:px-6 md:px-10 md:py-10 lg:px-12 lg:py-12"
          >
            <div className="pointer-events-none absolute inset-0" aria-hidden="true">
              <div className="absolute inset-0 bg-gradient-to-t from-manga-bg/10 to-transparent" />
              <motion.div
                variants={backgroundVariants}
                className="absolute right-0 top-0 h-52 w-52 rounded-full bg-manga-accent/10 blur-3xl md:h-80 md:w-80"
                animate={{ scale: [1, 1.08, 1], opacity: [0.24, 0.44, 0.24] }}
                transition={{ duration: 4.5, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
              />
              <motion.div
                variants={backgroundVariants}
                className="absolute bottom-0 left-0 h-56 w-56 rounded-full bg-manga-accent-secondary/10 blur-3xl md:h-96 md:w-96"
                animate={{ scale: [1, 1.14, 1], opacity: [0.18, 0.34, 0.18] }}
                transition={{
                  duration: 5.2,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: 'easeInOut',
                  delay: 0.8,
                }}
              />
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 opacity-[0.12]">
                <BrandLogo
                  variant="mark"
                  tone="primary"
                  className="h-[clamp(7rem,18vw,14rem)] w-auto"
                />
              </div>
            </div>

            <motion.div variants={containerVariants} className="relative z-10">
              <div className="grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-10 lg:gap-14">
                {footerData.sections.map((section) => (
                  <NavSection key={section.title} title={section.title} links={section.links} />
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: 0.45, duration: 0.8, ease: 'easeOut' }}
              className="relative z-10 mt-8 flex flex-col gap-5 md:mt-10 md:flex-row md:items-end md:justify-between"
            >
              <div className="max-w-3xl flex-1">
                <div className="flex items-center gap-3">
                  <BrandLogo variant="mark" className="h-10 w-10 rounded-2xl border border-manga-border bg-manga-surface p-2 shadow-[0_16px_40px_-28px_rgba(15,23,42,0.9)]" />
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-manga-muted">
                    Reader-first platform
                  </p>
                </div>

                <h2 className="mt-4 bg-gradient-to-r from-manga-text via-manga-text-secondary to-manga-muted bg-clip-text font-heading text-[clamp(3.6rem,12vw,7rem)] leading-[0.86] tracking-[-0.06em] text-transparent">
                  {footerData.title}
                </h2>

                <div className="mt-3 flex items-center gap-3 md:gap-4">
                  <motion.div
                    className="h-0.5 w-10 bg-gradient-to-r from-manga-accent to-manga-accent-secondary md:w-14"
                    animate={{ scaleX: [1, 1.18, 1] }}
                    transition={{ duration: 2.4, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
                  />
                  <p className="text-xs text-manga-text-secondary transition-colors duration-300 md:text-sm">
                    {footerData.subtitle}
                  </p>
                </div>
              </div>

              <div className="text-left md:text-right">
                <p className="mb-3 max-w-xs text-xs leading-6 text-manga-muted md:ml-auto md:text-sm">
                  (C) {currentYear} ComiTe. All rights reserved. Templates and UI are proprietary
                  and should not be reused without written permission from Vishnu Vivek Valeti.
                </p>

                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.2 }}
                  className="flex gap-2 md:justify-end md:gap-3"
                >
                  {footerData.quickActions.map((action) => (
                    <QuickAction
                      key={action.label}
                      to={action.to}
                      label={action.label}
                      icon={action.icon}
                    />
                  ))}
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

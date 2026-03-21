import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { BookOpenIcon } from '@heroicons/react/24/outline';
import HeroAnnouncementPill from './HeroAnnouncementPill';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const browseLinks = [
    { name: 'Browse', href: '/' },
    { name: 'Popular', href: '/popular' },
    { name: 'New Releases', href: '/new-releases' },
    { name: 'History', href: '/history' },
  ];

  const accountLinks = [
    { name: 'Login', href: '/login' },
    { name: 'Signup', href: '/signup' },
    { name: 'Bookmarks', href: '/bookmarks' },
    { name: 'Profile', href: '/profile' },
  ];

  const legalLinks = [
    { name: 'Terms of Use', href: '/legal/terms' },
    { name: 'License', href: '/legal/license' },
    { name: 'Privacy', href: '/legal/privacy' },
    { name: 'DMCA', href: '/legal/dmca' },
  ];

  const sections = [
    { title: 'Browse', links: browseLinks },
    { title: 'Account', links: accountLinks },
    { title: 'Legal', links: legalLinks },
  ];

  return (
    <footer className="deferred-render relative mt-auto overflow-hidden border-t border-manga-border bg-manga-card">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute left-1/2 top-0 h-32 w-[26rem] -translate-x-1/2 rounded-full bg-manga-accent/12 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-56 w-56 rounded-full bg-manga-warning/8 blur-3xl" />
        <div className="absolute bottom-10 right-0 h-64 w-64 rounded-full bg-manga-accent-secondary/10 blur-3xl" />
        <div className="absolute bottom-28 left-1/2 h-px w-[72%] -translate-x-1/2 bg-gradient-to-r from-transparent via-manga-border to-transparent" />
        <div className="absolute bottom-10 left-1/2 w-full -translate-x-1/2 px-4 text-center font-heading text-[clamp(3.5rem,14vw,9rem)] font-semibold uppercase tracking-[-0.08em] text-manga-border/55">
          Comite
        </div>
      </div>

      <div className="container-spacing relative py-12 sm:py-16 lg:py-20">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-3xl text-center"
        >
          <div className="flex justify-center">
            <HeroAnnouncementPill
              to="/welcome"
              announcement="Reader Notes"
              label="Open the distilled welcome shelf"
            />
          </div>
          <Link
            to="/"
            className="mt-6 inline-flex flex-col items-center rounded-3xl px-4 py-2 transition-transform duration-300 hover:scale-[1.01]"
          >
            <span className="bg-gradient-to-r from-manga-accent-light via-manga-accent to-manga-warning bg-clip-text font-heading text-[2.8rem] font-semibold tracking-[-0.05em] text-transparent sm:text-[3.6rem]">
              ComiTe
            </span>
            <span className="eyebrow mt-2 text-center">
              Quiet browsing. Fast return trips. Better reading flow.
            </span>
          </Link>
          <p className="body-text mx-auto mt-4 max-w-2xl text-center">
            A calm reader shell for discovering new series, returning to the right chapter, and
            staying oriented without portal-style clutter.
          </p>
        </motion.div>

        <div className="mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-[1.1fr_0.8fr_0.8fr_0.8fr]">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="relative overflow-hidden rounded-[28px] border border-manga-border/80 bg-manga-surface/70 p-6 backdrop-blur"
          >
            <div className="pointer-events-none absolute -right-10 top-6 h-28 w-28 rounded-full bg-manga-accent/18 blur-3xl" />
            <div className="relative">
              <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-[1.4rem] border border-manga-border bg-manga-card text-manga-accent shadow-[0_16px_40px_-28px_rgba(15,23,42,0.9)]">
                <BookOpenIcon className="h-7 w-7" />
              </div>
              <p className="heading-4 text-manga-text">Reading-first by design</p>
              <p className="mt-3 text-sm leading-7 text-manga-text-secondary">
                Browse the library, keep your place, and jump back into the right chapter without
                hunting through noisy chrome.
              </p>
            </div>
          </motion.div>

          {sections.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.5, delay: 0.1 + index * 0.05 }}
            >
              <h3 className="heading-4 mb-5 text-manga-text">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="group inline-flex items-center gap-2 rounded px-2 py-1 -ml-2 text-sm text-manga-muted transition-colors duration-200 hover:text-manga-accent focus:outline-none focus:ring-2 focus:ring-manga-accent focus:ring-offset-2 focus:ring-offset-manga-card"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-manga-border transition-colors duration-200 group-hover:bg-manga-accent" />
                      <span>{link.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        <div className="relative mt-16 flex flex-col gap-6 border-t border-manga-border pt-8 lg:flex-row lg:items-end lg:justify-between">
          <p className="caption max-w-2xl text-manga-muted">
            (C) {currentYear} ComiTe. All rights reserved. Templates and UI are proprietary and
            should not be reused without written permission from Vishnu Vivek Valeti.
          </p>
          <div className="flex flex-wrap gap-5">
            {legalLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="caption rounded px-2 py-1 text-manga-muted transition-colors duration-200 hover:text-manga-accent focus:outline-none focus:ring-2 focus:ring-manga-accent focus:ring-offset-2 focus:ring-offset-manga-card"
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

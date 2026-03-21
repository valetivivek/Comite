import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';

interface HeroAnnouncementPillProps {
  to: string;
  label: string;
  announcement: string;
  className?: string;
}

const HeroAnnouncementPill = ({
  to,
  label,
  announcement,
  className,
}: HeroAnnouncementPillProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: 'easeOut' }}
      className={clsx('inline-flex', className)}
    >
      <Link
        to={to}
        className={clsx(
          'group inline-flex items-center gap-2 rounded-full border border-manga-border/80 bg-manga-surface/80 px-2 py-1 pr-3 text-sm text-manga-text shadow-[0_18px_48px_-34px_rgba(15,23,42,0.9)] backdrop-blur transition-all duration-300 hover:border-manga-accent/35 hover:bg-manga-card hover:text-manga-accent'
        )}
      >
        <span className="rounded-full bg-manga-accent px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-manga-on-accent">
          {announcement}
        </span>
        <span className="font-medium tracking-[0.01em]">
          {label}
        </span>
        <ArrowRightIcon className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
      </Link>
    </motion.div>
  );
};

export default HeroAnnouncementPill;

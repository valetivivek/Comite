import { motion } from 'framer-motion';
import { useState } from 'react';
import { cn } from '@/lib/utils';

type NavItem = {
  id: number;
  tile: string;
};

interface AnimatedNavigationTabsProps {
  items: NavItem[];
}

export function AnimatedNavigationTabs({ items }: AnimatedNavigationTabsProps) {
  const [active, setActive] = useState<NavItem>(items[0]);
  const [isHover, setIsHover] = useState<NavItem | null>(null);

  return (
    <div className="relative">
      <ul className="flex items-center justify-center">
        {items.map((item) => (
          <button
            key={item.id}
            className={cn(
              'py-2 relative duration-300 transition-colors hover:!text-manga-accent',
              active.id === item.id ? 'text-manga-accent' : 'text-manga-muted'
            )}
            onClick={() => setActive(item)}
            onMouseEnter={() => setIsHover(item)}
            onMouseLeave={() => setIsHover(null)}
          >
            <div className="px-5 py-2 relative">
              {item.tile}
              {isHover?.id === item.id && (
                <motion.div
                  layoutId="hover-bg"
                  className="absolute bottom-0 left-0 right-0 w-full h-full bg-manga-accent/10"
                  style={{ borderRadius: 6 }}
                />
              )}
            </div>
            {active.id === item.id && (
              <motion.div
                layoutId="active"
                className="absolute bottom-0 left-0 right-0 w-full h-0.5 bg-manga-accent"
              />
            )}
            {isHover?.id === item.id && (
              <motion.div
                layoutId="hover"
                className="absolute bottom-0 left-0 right-0 w-full h-0.5 bg-manga-accent"
              />
            )}
          </button>
        ))}
      </ul>
    </div>
  );
}

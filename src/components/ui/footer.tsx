import * as React from 'react';
import type { LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

import { cn } from '@/lib/utils';

export interface SocialLink {
  name: string;
  href: string;
}

export interface FooterLink {
  name: string;
  Icon: LucideIcon | React.FC<React.SVGProps<SVGSVGElement>>;
  href?: string;
}

export interface FooterColumn {
  title: string;
  links: FooterLink[];
}

export interface FooterProps extends React.HTMLAttributes<HTMLDivElement> {
  brand: {
    name: string;
    description: string;
  };
  socialLinks: SocialLink[];
  columns: FooterColumn[];
  copyright?: string;
}

function isExternalHref(href: string) {
  return href.startsWith('http://') || href.startsWith('https://') || href.startsWith('mailto:');
}

function FooterAnchor({
  href,
  className,
  children,
}: {
  href?: string;
  className?: string;
  children: React.ReactNode;
}) {
  if (!href) {
    return <span className={className}>{children}</span>;
  }

  if (isExternalHref(href)) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer noopener"
        className={className}
      >
        {children}
      </a>
    );
  }

  return (
    <Link to={href} className={className}>
      {children}
    </Link>
  );
}

export const Footer = React.forwardRef<HTMLDivElement, FooterProps>(
  ({ className, brand, socialLinks, columns, copyright, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('pt-10 sm:pt-14', className)}
        {...props}
      >
        <div className="mx-auto w-full max-w-[88rem] px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden border-t border-manga-border/80 pt-8 sm:pt-10 lg:pt-12">
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-manga-accent/45 to-transparent"
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute -left-16 top-0 h-28 w-28 rounded-full bg-manga-accent/10 blur-3xl"
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute right-0 top-8 h-28 w-28 rounded-full bg-manga-accent-secondary/10 blur-3xl"
              aria-hidden="true"
            />

            <div className="relative grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8">
              <div className="space-y-5 lg:col-span-4 lg:pr-8">
                <Link
                  to="/"
                  className="inline-block font-heading text-[clamp(1.85rem,3vw,2.45rem)] font-semibold tracking-[-0.04em] text-manga-text transition-colors hover:text-manga-accent"
                >
                  {brand.name}
                </Link>
                <p className="max-w-lg text-[0.98rem] leading-8 text-manga-text-secondary">
                  {brand.description}
                </p>

                {socialLinks.length > 0 && (
                  <div className="flex flex-wrap gap-3">
                    {socialLinks.map((link) => (
                      <a
                        key={link.name}
                        className="inline-flex min-h-[40px] items-center rounded-full border border-manga-border/70 bg-manga-surface/35 px-4 text-sm font-medium text-manga-muted transition-all hover:border-manga-accent/35 hover:bg-manga-surface/70 hover:text-manga-text"
                        target="_blank"
                        href={link.href}
                        rel="noreferrer noopener"
                      >
                        {link.name}
                      </a>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:col-span-8 lg:grid-cols-3 lg:gap-10">
                {columns.map(({ title, links }) => (
                  <div key={title} className="w-full">
                    <h3 className="text-xs font-semibold uppercase tracking-[0.24em] text-manga-text-secondary">
                      {title}
                    </h3>
                    <ul className="mt-5 space-y-3">
                      {links.map(({ name, Icon, href }) => (
                        <li key={name}>
                          <FooterAnchor
                            href={href}
                            className="group inline-flex items-center text-sm text-manga-muted transition-colors hover:text-manga-text"
                          >
                            <span className="mr-3 inline-flex h-8 w-8 items-center justify-center rounded-full border border-manga-border/70 bg-manga-surface/30 transition-all group-hover:border-manga-accent/35 group-hover:bg-manga-surface/70">
                              <Icon className="h-4 w-4 stroke-[1.8] text-manga-muted transition-colors group-hover:text-manga-text" />
                            </span>
                            <span className="leading-6">{name}</span>
                          </FooterAnchor>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {copyright && (
              <div className="relative mt-10 border-t border-manga-border/70 pb-8 pt-6 sm:mt-12 sm:flex sm:items-center sm:justify-between">
                <p className="max-w-3xl text-xs leading-6 text-manga-muted">{copyright}</p>
                <div
                  className="pointer-events-none mt-4 h-px w-24 bg-gradient-to-r from-manga-accent/40 to-transparent sm:mt-0"
                  aria-hidden="true"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
);

Footer.displayName = 'Footer';

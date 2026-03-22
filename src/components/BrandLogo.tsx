import { useTheme } from '../contexts/ThemeContext';

type BrandLogoVariant = 'mark' | 'lockup';
type BrandLogoTone = 'theme' | 'primary';

interface BrandLogoProps {
  variant?: BrandLogoVariant;
  tone?: BrandLogoTone;
  className?: string;
  alt?: string;
}

const themeAwareAssets = {
  mark: {
    dark: '/branding/comite-dark.svg',
    light: '/branding/comite-light.svg',
  },
  lockup: {
    dark: '/branding/comite-dark.png',
    light: '/branding/comite-light.png',
  },
};

const primaryAssets = {
  mark: '/branding/comite-primary.svg',
  lockup: '/branding/comite-primary.png',
};

const BrandLogo = ({
  variant = 'mark',
  tone = 'theme',
  className = '',
  alt = 'ComiTe',
}: BrandLogoProps) => {
  const { theme } = useTheme();

  const src =
    tone === 'primary'
      ? primaryAssets[variant]
      : themeAwareAssets[variant][theme];

  return <img src={src} alt={alt} className={className} />;
};

export default BrandLogo;

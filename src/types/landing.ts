import type { ReactNode } from 'react';
import { type Route } from 'next';

import type { IBlockquote, IFaqItem, IIconElement, ILogo } from '@/types/common';
import type { TSocialIcons } from '@/components/icons';

export type TSectionAction =
  | { kind: 'primary-button'; label: string; href: Route<string> | URL }
  | { kind: 'secondary-button'; label: string; href: Route<string> | URL }
  | {
      kind: 'link';
      label: string;
      href: Route<string> | URL;
      variant?: 'foreground' | 'default';
    }
  | { kind: 'form'; placeholder?: string; submit: string };

export interface IHeroSection {
  avatars?: string[];
  label?: ReactNode;
  title: string;
  subtitle?: string;
  description: string;
  content?: string;
  logosTitle?: string;
  actions?: ReactNode;
  image: {
    src: string;
    alt?: string;
    width: number;
    height: number;
  };
  items?: {
    lucideIcon: IIconElement['lucideIcon'];
    label: string;
  }[];
  slides?: {
    className?: string;
    image: { src: string; alt?: string; width: number; height: number };
  }[];
  logos: ILogo[];
}

export interface IFeatureItemCard {
  image?: {
    src: string;
    alt?: string;
    width: number;
    height: number;
  };
  label?: string;
  title: string;
  description: ReactNode | string;
  linkUrl?: Route<string> | URL;
}

export interface IFeatureCard {
  title: string;
  description?: string;
  linkUrl?: Route<string> | URL;
  linkText?: string;
  actions?: ReactNode;
  image?: {
    src: string;
    alt?: string;
    width: number;
    height: number;
  };
}

export interface IFeatureItemIcon extends IIconElement {
  title: string;
  description: string;
}

export interface IFeaturesSection {
  label?: string;
  title: string;
  description: ReactNode | string;
  actions?: ReactNode;
  items: IFeatureItemCard[] | IFeatureItemIcon[];
  image?: { src: string; alt?: string; width: number; height: number };
  content?: string;
}

export interface INumbersSectionBase {
  label?: string;
  title?: string;
  description?: ReactNode | string;
  actions?: ReactNode;
  image?: { src: string; alt?: string; width: number; height: number };
}

export interface INumberItem {
  value: string;
  label?: string;
  title?: string;
  description?: ReactNode | string;
  prefix?: string;
}

export interface INumbersTextItem {
  title: string;
  description: ReactNode | string;
}

export interface INumbersSection extends INumbersSectionBase {
  items: INumberItem[];
}

export interface IIntegrationsSectionBase {
  title: string;
  description: ReactNode | string;
  actions?: ReactNode;
  content?: string;
}

export interface ITableSectionBase {
  title?: string;
  description?: ReactNode | string;
  categories?: string[];
}

export interface ITableRow {
  title: string;
  description: ReactNode | string;
  linkUrl?: Route<string> | URL;
  linkText?: string;
  lucideIcon?: IIconElement['lucideIcon'];
  logo?: {
    src: string;
    alt?: string;
  };
}

export interface IBentoCard {
  label?: string;
  image: {
    src: string;
    alt?: string;
    width?: number;
    height?: number;
  };
  isWide?: boolean;
  title: string;
  description: ReactNode | string;
  linkUrl?: Route<string> | URL;
  linkText?: string;
}

export interface IBentoSection {
  label?: string;
  title: string;
  description: string;
  actions?: ReactNode;
  items: IBentoCard[];
}

export interface ITabItem {
  key: string;
  label: string;
  image: {
    src: string;
    alt?: string;
    width: number;
    height: number;
  };
  description?: string;
  linkText?: string;
  linkUrl?: Route<string> | URL;
}

export interface ISectionTabs {
  label?: string;
  title: string;
  description: string;
  actions?: ReactNode;
  items: ITabItem[];
}

export interface ISectionSlider {
  label?: string;
  title: string;
  description: string;
  actions?: ReactNode;
  items: {
    key: string;
    image: { src: string; alt?: string; width: number; height: number };
  }[];
  autoplay?: boolean;
  duration?: number;
}

export interface ITestimonialSectionData {
  quotes: IBlockquote[] | IBlockquote;
}

export interface ITestimonialSectionBase {
  title?: string;
  description?: ReactNode | string;
  actions?: ReactNode;
}

export interface ITestimonialAuthor {
  name: string;
  role: string;
  photo?: {
    src: string;
    alt?: string;
    width: number;
    height: number;
  };
}

export interface ITestimonialItem {
  quote: string;
  author: ITestimonialAuthor;
}

export interface ISocialItem {
  icon: TSocialIcons;
  title: string;
  description: string;
  url: Route<string> | URL;
  linkText: string;
}

export interface ICommunitySection {
  label?: string;
  title: string;
  description: string;
  socials: ISocialItem[];
}

export interface ICtaSection {
  label?: string;
  title: string;
  description: string;
  actions?: ReactNode;
}

export interface ISectionSplit {
  label?: string;
  title: string;
  description?: string;
  image: {
    src: string;
    alt?: string;
    width: number;
    height: number;
  };
  actions?: ReactNode;
}

export interface IFaqSection {
  title: string;
  items: IFaqItem[];
  actions?: ReactNode;
}

export interface IHomePageData {
  hero: IHeroSection;
  features: IFeaturesSection;
  bento: IBentoSection;
  sectionSplit?: ISectionSplit;
  sectionTabs: ISectionTabs;
  testimonial: ITestimonialSectionData;
  community: ICommunitySection;
  cta: ICtaSection;
}

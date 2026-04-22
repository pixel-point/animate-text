import type { IHeaderMenuItem, IMenuItem, IMenuSocialItem } from '@/types/common';

const HEADER_MENU = [] satisfies IHeaderMenuItem[];

const FOOTER_MENU = [] satisfies IMenuItem[];

const FOOTER_SOCIAL = [
  {
    href: 'https://twitter.com/yourusername',
    label: 'Follow us on Twitter',
    icon: 'twitter',
  },
  {
    href: 'https://github.com/yourusername',
    label: 'Follow us on GitHub',
    icon: 'github',
  },
  {
    href: 'https://linkedin.com/in/yourusername',
    label: 'Follow us on LinkedIn',
    icon: 'linkedin',
  },
] satisfies IMenuSocialItem[];

export const MENUS = {
  header: HEADER_MENU,
  footer: {
    main: FOOTER_MENU,
    social: FOOTER_SOCIAL,
  },
};

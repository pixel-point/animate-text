const config = {
  projectName: 'New Project',
  logo: {
    light: '/logo-dark.svg',
    dark: '/logo-light.svg',
  },
  logoAlt: 'New Project',
  logoLink: '/',
  metaThemeColors: {
    light: '#ffffff',
    dark: '#000000',
  },
  githubOrg: 'pixel-point',
  githubRepo: 'prime',
  blog: {
    postsPerPage: 20,
    contentWidth: 704,
    contentDir: 'src/content/blog',
  },
  docs: {
    basePath: '/docs',
    rootPage: '/docs/introduction',
    contentDir: 'src/content/docs',
  },
  changelog: {
    contentDir: 'src/content/changelog',
    postsPerPage: 20,
  },
  legal: {
    contentDir: 'src/content',
  },
};

export default config;

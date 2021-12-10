/** @type {import('@docusaurus/types').DocusaurusConfig} */
module.exports = {
  title: 'Safient Core SDK',
  tagline: 'JavaScript SDK to manage and interact with core Safient client features on Safient protocol',
  url: 'https://docs.safient.io',
  baseUrl: '/',
  onBrokenLinks: 'ignore',
  favicon: 'img/favicon.ico',
  organizationName: 'safient', // Usually your GitHub org/user name.
  projectName: 'safient-core-js', // Usually your repo name.
  themeConfig: {
    navbar: {
      logo: {
        alt: 'Safient',
        src: 'img/logo.svg',
        srcDark: 'img/logo-dark.svg',
      },
      items: [
        {
          href: 'https://blog.safient.io',
          label: 'Blog',
          position: 'right',
        },
        {
          href: 'https://safient.io',
          label: 'Website',
          position: 'right',
        },
        {
          href: 'https://github.com/safient',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Basics',
              to: '/safient-basics/basics',
            },
            {
              label: 'Developers',
              to: '/dev-overview',
            },
            {
              label: 'Roadmap',
              to: '/roadmap',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'Discord',
              href: 'https://discord.safient.io',
            },
            {
              label: 'Twitter',
              href: 'https://twitter.com/safientio',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'Blog',
              href: 'https://blog.safient.io',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/safient',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Safient. Built with Docusaurus.`,
    },
    algolia: {
      apiKey: '6badda78379280a9cc4a22a2500da66a',
      indexName: 'safient_DOCS',
      // Optional: see doc section below
      contextualSearch: true,
      // Optional: see doc section below
      appId: '1Z67YD0ZOD',
    },
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          editUrl: 'https://github.com/safient/safient-core-js/edit/master/',
          routeBasePath: '/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
  plugins: [
    [
      'docusaurus-plugin-typedoc',
      {
        entryPoints: ['../src/index.ts'],
        tsconfig: '../tsconfig.json',
      },
    ],
  ],
};

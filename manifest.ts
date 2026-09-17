import { defineManifest } from '@crxjs/vite-plugin';

export default defineManifest({
  manifest_version: 3,
  name: 'AgentMore Markdown Reader',
  short_name: 'AgentMore MD',
  description: 'A private, GitHub-style reader for local and remote Markdown files.',
  homepage_url: 'https://agentmore.app',
  version: '0.1.0',
  icons: {
    16: 'icons/icon-16.png',
    32: 'icons/icon-32.png',
    48: 'icons/icon-48.png',
    128: 'icons/store-icon-128.png',
  },
  permissions: ['storage'],
  action: {
    default_title: 'Recent Markdown',
    default_popup: 'src/popup/index.html',
    default_icon: {
      16: 'icons/icon-16.png',
      32: 'icons/icon-32.png',
    },
  },
  content_scripts: [
    {
      matches: [
        'file:///*',
        'http://*/*.md',
        'https://*/*.md',
        'http://*/*.markdown',
        'https://*/*.markdown',
        'http://*/*.txt',
        'https://*/*.txt',
      ],
      js: ['public/early-blank.js', 'src/content.tsx'],
      run_at: 'document_start',
    },
  ],
});

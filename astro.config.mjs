// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap'; 
import icon from 'astro-icon'

// https://astro.build/config
export default defineConfig({
  site: 'https://www.escuela-manuel-urbano-ayarza.com',
  trailingSlash: 'never',
  vite: {
    plugins: [tailwindcss()]
  },
  integrations: [
    react(),
    icon(),
    sitemap()
  ]
});
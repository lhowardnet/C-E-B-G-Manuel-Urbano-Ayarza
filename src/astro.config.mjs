import { defineConfig } from 'astro/config';
import animations from "@midudev/tailwind-animations";
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  plugins: [animations],
  integrations: [react(), sitemap()]
});
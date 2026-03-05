// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import icon from 'astro-icon';

const API_BASE_URL = (
  process.env.SITEMAP_API_BASE_URL
  ?? 'https://manuel-urbano-ayarza-c4b8d3cffkb0byd9.canadacentral-01.azurewebsites.net'
).replace(/\/+$/, '');

const REQUEST_TIMEOUT_MS = 8000;

function extractLocUrls(xml) {
  const matches = xml.matchAll(/<loc>(.*?)<\/loc>/g);
  const urls = [];

  for (const match of matches) {
    const value = match[1]?.trim();
    if (!value) continue;
    urls.push(value);
  }

  return urls;
}

async function fetchXml(url) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, { signal: controller.signal });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.text();
  } finally {
    clearTimeout(timeoutId);
  }
}

async function loadDynamicArticleUrls() {
  try {
    const rootXml = await fetchXml(`${API_BASE_URL}/sitemap.xml`);
    const rootLocs = extractLocUrls(rootXml);

    if (rootXml.includes('<sitemapindex')) {
      const pageXmlList = await Promise.all(
        rootLocs.map((pageUrl) => fetchXml(pageUrl)),
      );

      return pageXmlList
        .flatMap((xml) => extractLocUrls(xml))
        .filter((url) => !url.endsWith('/sitemap.xml') && !/\/sitemap-\d+\.xml$/.test(url));
    }

    return rootLocs.filter((url) => !url.endsWith('/sitemap.xml') && !/\/sitemap-\d+\.xml$/.test(url));
  } catch (error) {
    console.warn(
      '[sitemap] No se pudieron cargar URLs dinamicas desde la API. Se generara sitemap solo con rutas de Astro.',
      error,
    );
    return [];
  }
}

const dynamicArticleUrls = await loadDynamicArticleUrls();

// https://astro.build/config
export default defineConfig({
  site: 'https://www.escuela-manuel-urbano-ayarza.com',
  vite: {
    plugins: [tailwindcss()]
  },
  integrations: [
    react(),
    icon(),
    sitemap({
      customPages: dynamicArticleUrls,
    }),
  ],
});

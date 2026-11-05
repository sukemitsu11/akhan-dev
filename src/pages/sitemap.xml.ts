import type { APIRoute } from 'astro';
import { siteConfig } from '../config';

const escapeXml = (value: string) => value.replace(/[<>&"']/g, (character) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' })[character]!);

/** Только страницы, которые должны попасть в поиск. Демо-сайты закрыты через noindex. */
const pages = [
  { path: '/', priority: '1.0' },
  { path: '/projects/', priority: '0.8' },
];

// Дата сборки: страницы статические, поэтому они обновляются вместе с деплоем.
const lastmod = new Date().toISOString().slice(0, 10);

export const GET: APIRoute = () => new Response(
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${pages.map(({ path, priority }) => `<url><loc>${escapeXml(new URL(path, siteConfig.url).href)}</loc><lastmod>${lastmod}</lastmod><priority>${priority}</priority></url>`).join('')}</urlset>`,
  { headers: { 'Content-Type': 'application/xml; charset=utf-8' } },
);

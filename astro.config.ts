import { defineConfig } from 'astro/config';
import { siteConfig } from './src/config';

export default defineConfig({
  site: siteConfig.url,
  output: 'static',
  trailingSlash: 'ignore',
});

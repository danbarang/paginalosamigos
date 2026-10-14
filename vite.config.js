import { defineConfig } from 'vite';
import { resolve, basename } from 'path';
import { readFileSync } from 'fs';

// Dirección pública del sitio. Cuando el dominio propio esté conectado,
// cambia SITE_URL por el dominio (por ejemplo https://losamigoscastro.cl),
// BASE por '/' y agrega public/CNAME con el dominio.
const SITE_URL = 'https://danbarang.github.io/paginalosamigos';
// Netlify (vistas previas de los PR) sirve el sitio desde la raíz.
const BASE = process.env.NETLIFY ? '/' : '/paginalosamigos/';

// Páginas publicadas. La clave es el nombre de entrada de Vite.
const PAGES = {
  main: 'index.html',
  centro: 'centro.html',
  especialidades: 'especialidades.html',
  programas: 'programas.html',
  reservas: 'reservas.html',
  terapias: 'terapias.html',
  profesionales: 'profesionales.html',
  recinto: 'recinto.html',
  colaboraciones: 'colaboraciones.html',
  educacion: 'educacion.html',
  inclusion: 'inclusion-diversidad.html',
  proceso: 'proceso-terapeutico.html',
  prevencion: 'prevencion-calidad-de-vida.html',
  pautas: 'pautas-de-trabajo.html',
  acompanar: 'recomendaciones-acompanar.html'
};

// Sección del menú que se marca como activa en cada página.
const NAV_SECTION = {
  'educacion.html': 'educacion.html',
  'inclusion-diversidad.html': 'educacion.html',
  'proceso-terapeutico.html': 'educacion.html',
  'prevencion-calidad-de-vida.html': 'educacion.html',
  'pautas-de-trabajo.html': 'educacion.html',
  'recomendaciones-acompanar.html': 'educacion.html',
  'centro.html': 'centro.html',
  'profesionales.html': 'centro.html',
  'recinto.html': 'centro.html',
  'colaboraciones.html': 'centro.html',
  'especialidades.html': 'especialidades.html',
  'programas.html': 'programas.html',
  'terapias.html': 'terapias.html',
  'reservas.html': 'reservas.html'
};

const partial = (name) => readFileSync(resolve(__dirname, 'partials', name), 'utf8');

function siteLayout() {
  return {
    name: 'los-amigos-layout',
    transformIndexHtml: {
      order: 'pre',
      handler(html, ctx) {
        const page = basename(ctx.filename);
        let nav = partial('nav.html');
        const section = NAV_SECTION[page];
        if (section) {
          nav = nav.replace(
            new RegExp(`(<a href="${section}" class="nav-link[^"]*)"`),
            '$1 active" aria-current="page"'
          );
        }
        return html
          .replace('<!-- @nav -->', nav)
          .replace('<!-- @footer -->', partial('footer.html'))
          .replace('</head>', `${partial('head.html')}</head>`)
          .replaceAll('%SITE_URL%', SITE_URL)
          .replaceAll('%YEAR%', String(new Date().getFullYear()));
      }
    },
    generateBundle() {
      const today = new Date().toISOString().slice(0, 10);
      const urls = Object.values(PAGES)
        .map((p) => {
          const loc = p === 'index.html' ? `${SITE_URL}/` : `${SITE_URL}/${p}`;
          return `  <url><loc>${loc}</loc><lastmod>${today}</lastmod></url>`;
        })
        .join('\n');
      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
      });
      this.emitFile({
        type: 'asset',
        fileName: 'robots.txt',
        source: `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`
      });
    }
  };
}

export default defineConfig({
  base: BASE,
  plugins: [siteLayout()],
  build: {
    rollupOptions: {
      input: Object.fromEntries(
        Object.entries(PAGES).map(([key, file]) => [key, resolve(__dirname, file)])
      )
    }
  }
});

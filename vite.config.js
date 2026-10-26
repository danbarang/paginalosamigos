import { defineConfig } from 'vite';
import { resolve, basename } from 'path';
import { readFileSync } from 'fs';

// Dirección pública del sitio. Cuando el dominio propio esté conectado,
// cambia SITE_URL por el dominio (por ejemplo https://losamigoscastro.cl),
// BASE por '/' y agrega public/CNAME con el dominio.
const SITE_URL = 'https://danbarang.github.io/paginalosamigos';
const BASE = '/paginalosamigos/';

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
  acompanar: 'recomendaciones-acompanar.html',
  fono: 'fonoaudiologia-castro.html',
  kine: 'kinesiologia-castro.html',
  to: 'terapia-ocupacional-castro.html',
  psico: 'psicologia-castro.html',
  nutri: 'nutricion-castro.html',
  acv: 'rehabilitacion-acv-castro.html',
  tea: 'autismo-tea-castro.html',
  lenguaje: 'lenguaje-infantil-castro.html',
  c0: 'trastornos-habla-lenguaje-castro.html',
  c1: 'deglucion-atipica-castro.html',
  c2: 'respiracion-oral-castro.html',
  c3: 'terapia-voz-castro.html',
  c4: 'disfagia-castro.html',
  c5: 'dolor-lumbar-castro.html',
  c6: 'prevencion-caidas-castro.html',
  c7: 'desarrollo-motor-infantil-castro.html',
  c8: 'integracion-sensorial-castro.html',
  c9: 'motricidad-fina-castro.html',
  c10: 'autonomia-personas-mayores-castro.html',
  c11: 'ansiedad-castro.html',
  c12: 'depresion-castro.html',
  c13: 'tdah-castro.html',
  privacidad: 'politica-de-privacidad.html',
  aviso: 'aviso-legal.html'
};

// Páginas que se publican pero no se listan en el sitemap.
const FUERA_DEL_SITEMAP = ['politica-de-privacidad.html', 'aviso-legal.html'];

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
  'fonoaudiologia-castro.html': 'especialidades.html',
  'kinesiologia-castro.html': 'especialidades.html',
  'terapia-ocupacional-castro.html': 'especialidades.html',
  'psicologia-castro.html': 'especialidades.html',
  'nutricion-castro.html': 'especialidades.html',
  'programas.html': 'programas.html',
  'terapias.html': 'terapias.html',
  'rehabilitacion-acv-castro.html': 'terapias.html',
  'autismo-tea-castro.html': 'terapias.html',
  'lenguaje-infantil-castro.html': 'terapias.html',
  'trastornos-habla-lenguaje-castro.html': 'terapias.html',
  'deglucion-atipica-castro.html': 'terapias.html',
  'respiracion-oral-castro.html': 'terapias.html',
  'terapia-voz-castro.html': 'terapias.html',
  'disfagia-castro.html': 'terapias.html',
  'dolor-lumbar-castro.html': 'terapias.html',
  'prevencion-caidas-castro.html': 'terapias.html',
  'desarrollo-motor-infantil-castro.html': 'terapias.html',
  'integracion-sensorial-castro.html': 'terapias.html',
  'motricidad-fina-castro.html': 'terapias.html',
  'autonomia-personas-mayores-castro.html': 'terapias.html',
  'ansiedad-castro.html': 'terapias.html',
  'depresion-castro.html': 'terapias.html',
  'tdah-castro.html': 'terapias.html',
  'reservas.html': 'reservas.html'
};

// Contenido reservado: lo que va entre <!-- @oculto: motivo --> y <!-- @/oculto -->
// queda en el código fuente pero no se publica (ni visible ni para buscadores).
// Para volver a mostrarlo, borra los dos marcadores.
const OCULTO = /<!-- @oculto(?::[^>]*)? -->[\s\S]*?<!-- @\/oculto -->/g;

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
          .replace(OCULTO, '')
          .replaceAll('%SITE_URL%', SITE_URL)
          .replaceAll('%YEAR%', String(new Date().getFullYear()));
      }
    },
    generateBundle() {
      const today = new Date().toISOString().slice(0, 10);
      const urls = Object.values(PAGES)
        .filter((p) => !FUERA_DEL_SITEMAP.includes(p))
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

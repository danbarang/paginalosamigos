# Los Amigos · sitio web

Sitio estático del centro terapéutico y de rehabilitación Los Amigos (Castro, Chiloé), construido con Vite y publicado en GitHub Pages.

## Desarrollo

```bash
npm ci
npm run dev     # servidor local
npm run build   # genera dist/
```

## Estructura

- Cada página es un `.html` en la raíz. El menú, el pie y las etiquetas comunes del `<head>` viven en `partials/` y se insertan al compilar (`<!-- @nav -->`, `<!-- @footer -->`).
- `%SITE_URL%` y `%YEAR%` se reemplazan al compilar. `robots.txt` y `sitemap.xml` también se generan al compilar.
- Para agregar una página, súmala a `PAGES` (y a `NAV_SECTION` si va en el menú) en `vite.config.js`.
- Imágenes, íconos de la marca y fuentes están en `public/`.

## Conectar el dominio propio

1. Registra el dominio en nic.cl y apunta sus DNS a GitHub Pages.
2. Crea `public/CNAME` con el dominio (por ejemplo `losamigoscastro.cl`).
3. En `vite.config.js`, cambia `SITE_URL` por `https://<dominio>` y `BASE` por `'/'`.
4. En GitHub › Settings › Pages, escribe el dominio y marca "Enforce HTTPS".

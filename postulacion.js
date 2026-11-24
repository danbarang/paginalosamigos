// Postulación guiada de profesionales (S4).
// ENDPOINT = URL de la aplicación web de Apps Script que escribe en la planilla
// del centro en Google Drive. Mientras esté vacía, el formulario no envía datos:
// muestra el agradecimiento y ofrece WhatsApp (modo prueba local).
const ENDPOINT = '';
const WA = '56950925082';

const form = document.getElementById('postulacion');
if (form) {
  form.hidden = false;
  const steps = [...form.querySelectorAll('.post-step')];
  const bar = form.querySelector('.post-progress span');
  const err = form.querySelector('.post-error');
  const back = form.querySelector('[data-back]');
  const next = form.querySelector('[data-next]');
  const last = steps.length - 1; // último = agradecimiento
  let i = 0;

  const show = (n) => {
    i = n;
    steps.forEach((s, k) => s.classList.toggle('is-active', k === n));
    bar.style.width = `${Math.round((n / last) * 100)}%`;
    back.style.visibility = n === 0 || n === last ? 'hidden' : 'visible';
    form.querySelector('.post-nav').style.display = n === last ? 'none' : '';
    next.textContent = n === last - 1 ? 'Enviar postulación' : 'Siguiente';
    err.textContent = '';
    const h = steps[n].querySelector('h2');
    if (h && n > 0) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: false }); }
  };

  const valid = (step) => {
    const group = step.querySelector('[data-required]');
    if (group) {
      const name = group.dataset.required;
      if (!form.querySelector(`[name="${name}"]:checked`)) return 'Elige al menos una opción.';
    }
    for (const el of step.querySelectorAll('[required]')) {
      if (el.type === 'checkbox' ? !el.checked : !el.value.trim()) {
        return el.type === 'checkbox' ? 'Necesitamos tu consentimiento para guardar la postulación.' : 'Completa los campos marcados.';
      }
    }
    const wa = step.querySelector('[name="whatsapp"]');
    if (wa && wa.value.replace(/\D/g, '').length < 8) return 'Revisa el número de WhatsApp.';
    return '';
  };

  const collect = () => {
    const fd = new FormData(form);
    const out = {};
    for (const [k, v] of fd.entries()) out[k] = out[k] ? `${out[k]}, ${v}` : String(v).trim();
    out.enviado = new Date().toISOString();
    return out;
  };

  const send = async (data) => {
    if (data.sitio_web) return; // trampa para bots
    if (!ENDPOINT) { console.info('[postulación] modo prueba, sin envío', data); return; }
    // text/plain evita la verificación previa (CORS) de Apps Script.
    await fetch(ENDPOINT, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(data) });
  };

  back.addEventListener('click', () => show(Math.max(0, i - 1)));
  next.addEventListener('click', async () => {
    const msg = valid(steps[i]);
    if (msg) { err.textContent = msg; return; }
    if (i < last - 1) { show(i + 1); return; }
    next.disabled = true;
    next.textContent = 'Enviando…';
    const data = collect();
    try {
      await send(data);
      const txt = `Hola, soy ${data.nombre} (${data.profesion}). Envié mi postulación y quiero agendar un recorrido por Los Amigos.`;
      document.getElementById('post-wa').href = `https://wa.me/${WA}?text=${encodeURIComponent(txt)}`;
      show(last);
    } catch {
      err.textContent = 'No pudimos enviar la postulación. Escríbenos por WhatsApp y te ayudamos.';
    } finally {
      next.disabled = false;
    }
  });

  show(0);
}

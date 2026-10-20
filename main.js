import './style.css';
import { gsap } from 'gsap';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollToPlugin, ScrollTrigger);

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

document.addEventListener('DOMContentLoaded', () => {
  // Las animaciones solo agregan movimiento: el contenido es visible sin JavaScript
  // y no se anima si la persona pidió reducir el movimiento.
  if (prefersReducedMotion) return;

  // Lo que ya se ve al cargar se queda tal como lo pintó el HTML: solo se anima
  // lo que aparece al bajar, para que el primer contenido no espere al JavaScript.
  const visibleAlCargar = (el) => el.getBoundingClientRect().top < window.innerHeight;
  const bajoElPliegue = (selector) => gsap.utils.toArray(selector).filter((el) => !visibleAlCargar(el));

  // Aparición al bajar: entra apenas el elemento asoma por abajo de la pantalla,
  // con un movimiento corto. Los que entran juntos (una fila de tarjetas) salen
  // en el mismo lote con un desfase pequeño.
  // Mientras GSAP anima se apaga la transición CSS del elemento (las tarjetas tienen
  // "transition: all"), porque si no cada cuadro se retrasa 300 ms y la animación
  // se ve lenta y a saltos; al terminar se devuelve para que el hover siga igual.
  const revelar = (selector) => {
    const items = bajoElPliegue(selector);
    if (!items.length) return;
    gsap.set(items, { opacity: 0, y: 24 });
    ScrollTrigger.batch(items, {
      start: 'top 95%',
      once: true,
      onEnter: (lote) => {
        // Se guarda la transición escrita en el HTML (algunas tarjetas la traen en style)
        // para devolverla tal cual al terminar.
        lote.forEach((el) => { el.dataset.transicion = el.style.transition; el.style.transition = 'none'; });
        gsap.to(lote, {
          opacity: 1,
          y: 0,
          duration: 0.45,
          ease: 'power2.out',
          // Desfase de 60 ms entre elementos, pero el lote completo se reparte en
          // máximo 180 ms: una fila de 9 no hace esperar al último.
          stagger: lote.length > 1 ? Math.min(0.06, 0.18 / (lote.length - 1)) : 0,
          overwrite: true,
          onComplete: () => {
            lote.forEach((el) => { el.style.transition = el.dataset.transicion; delete el.dataset.transicion; });
            gsap.set(lote, { clearProps: 'opacity,transform' });
          }
        });
      }
    });
  };

  // Incluye la grilla de servicios del inicio, que antes esperaba a toda la grilla
  // y soltaba los 9 de a uno.
  revelar('.animate-on-scroll');
  revelar('.card:not(.animate-on-scroll)');

  // Floating background blobs
  if (document.querySelector('.bg-shape')) {
    gsap.to('.bg-shape', {
      y: 'random(-20, 20)',
      x: 'random(-20, 20)',
      rotation: 'random(-5, 5)',
      duration: 'random(3, 5)',
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      stagger: {
        amount: 2,
        from: "random"
      }
    });
  }

  // Handle cross-page scrolling to specialties
  if (window.location.pathname.includes('especialidades.html')) {
    const hash = window.location.hash;
    if (hash) {
      setTimeout(() => {
        gsap.to(window, { 
          duration: 0.8, 
          scrollTo: { y: hash, offsetY: 180 }, 
          ease: "power2.inOut",
          onComplete: () => {
            // Eliminar el hash de la URL para que al refrescar la página no vuelva a bajar
            history.replaceState(null, null, window.location.pathname + window.location.search);
          }
        });
      }, 200);
    }
  }
});

document.addEventListener('DOMContentLoaded', () => {
  // Navbar Shrink on Scroll (Optimized with requestAnimationFrame and hysteresis)
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    let ticking = false;
    let isScrolled = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          if (scrollY > 50 && !isScrolled) {
            navbar.classList.add('navbar-scrolled');
            isScrolled = true;
          } else if (scrollY < 20 && isScrolled) {
            navbar.classList.remove('navbar-scrolled');
            isScrolled = false;
          }
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  // Menú móvil
  const menuBtn = document.querySelector('.mobile-menu-btn');
  if (navbar && menuBtn) {
    menuBtn.addEventListener('click', () => {
      const isOpen = navbar.classList.toggle('menu-open');
      menuBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      menuBtn.setAttribute('aria-label', isOpen ? 'Cerrar menú' : 'Abrir menú');
    });
  }
});



  // Carousel Navigation Buttons Logic
  document.querySelectorAll('.carousel-wrapper').forEach(wrapper => {
    const prevBtn = wrapper.querySelector('.carousel-prev');
    const nextBtn = wrapper.querySelector('.carousel-next');
    // Find the scrollable container: either .mobile-carousel or .marquee-content
    const container = wrapper.querySelector('.mobile-carousel, .marquee-content');

    if (prevBtn && nextBtn && container) {
      const scrollAmount = 300; // Pixels to scroll per click

      prevBtn.addEventListener('click', (e) => {
        e.preventDefault();
        container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      });

      nextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      });
    }
  });

  // ==========================================================================
  // SECCIÓN: AGENDAR CON ESPECIALISTAS (Pestañas Desktop + Acordeón Móvil)
  // ==========================================================================
  function initSpecialistsTabs() {
    const tabButtons = document.querySelectorAll('.specialist-tab-btn');
    const accordionItems = document.querySelectorAll('.specialist-accordion-item');

    if (!tabButtons.length || !accordionItems.length) return;

    function setActiveSpecialty(targetSpecialty) {
      // 1. Actualizar botones de pestañas en escritorio
      tabButtons.forEach(btn => {
        const isMatch = btn.getAttribute('data-target') === targetSpecialty;
        btn.classList.toggle('active', isMatch);
        btn.setAttribute('aria-selected', isMatch ? 'true' : 'false');
      });

      // 2. Actualizar el panel visible en escritorio
      accordionItems.forEach(item => {
        item.classList.toggle('active', item.getAttribute('data-specialty') === targetSpecialty);
      });
    }

    // Acordeón en móvil: todos parten cerrados; abrir uno cierra los demás
    function toggleAccordion(targetItem) {
      const willOpen = !targetItem.classList.contains('is-open');
      accordionItems.forEach(item => {
        const isMatch = item === targetItem && willOpen;
        item.classList.toggle('is-open', isMatch);
        const trigger = item.querySelector('.accordion-trigger');
        if (trigger) {
          trigger.setAttribute('aria-expanded', isMatch ? 'true' : 'false');
        }
      });
      if (willOpen) setActiveSpecialty(targetItem.getAttribute('data-specialty'));
    }

    // Interacción de pestañas en escritorio
    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-target');
        setActiveSpecialty(target);
      });
    });

    // Interacción de acordeón en móvil (modo exclusivo)
    accordionItems.forEach(item => {
      const trigger = item.querySelector('.accordion-trigger');
      if (trigger) {
        trigger.addEventListener('click', (e) => {
          e.preventDefault();
          toggleAccordion(item);

          // Desplazamiento suave para enfocar el encabezado si queda fuera de vista
          setTimeout(() => {
            const rect = trigger.getBoundingClientRect();
            if (rect.top < 70 || rect.top > window.innerHeight - 150) {
              trigger.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }, 180);
        });
      }
    });
  }

  initSpecialistsTabs();

  // ==========================================================================
  // SECCIÓN: ACORDEONES DESPLEGABLES (Programas y Servicios)
  // ==========================================================================
  function initProgramAccordions() {
    const sections = ['#evaluaciones-diagnosticas', '#terapia-tradicional'];

    sections.forEach(sectionId => {
      const section = document.querySelector(sectionId);
      if (!section) return;

      const cards = section.querySelectorAll('.diagnostic-card, .individual-card');

      cards.forEach(card => {
        const toggleBtn = card.querySelector('.btn-card-toggle');
        if (!toggleBtn) return;

        toggleBtn.addEventListener('click', (e) => {
          e.preventDefault();
          const isCurrentlyExpanded = card.classList.contains('is-expanded');

          // Modo exclusivo: Colapsar las demás tarjetas de la misma sección
          cards.forEach(otherCard => {
            if (otherCard !== card && otherCard.classList.contains('is-expanded')) {
              otherCard.classList.remove('is-expanded');
              const otherBtn = otherCard.querySelector('.btn-card-toggle');
              if (otherBtn) {
                otherBtn.setAttribute('aria-expanded', 'false');
                const otherText = otherBtn.querySelector('.toggle-text');
                if (otherText) otherText.textContent = 'Más información';
              }
            }
          });

          // Alternar estado de la tarjeta clickeada
          if (isCurrentlyExpanded) {
            card.classList.remove('is-expanded');
            toggleBtn.setAttribute('aria-expanded', 'false');
            const toggleText = toggleBtn.querySelector('.toggle-text');
            if (toggleText) toggleText.textContent = 'Más información';
          } else {
            card.classList.add('is-expanded');
            toggleBtn.setAttribute('aria-expanded', 'true');
            const toggleText = toggleBtn.querySelector('.toggle-text');
            if (toggleText) toggleText.textContent = 'Menos información';

            // Auto-scroll suave si la tarjeta queda fuera de vista
            setTimeout(() => {
              const rect = card.getBoundingClientRect();
              if (rect.top < 90 || rect.bottom > window.innerHeight) {
                card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
              }
            }, 180);
          }
        });
      });
    });
  }

  initProgramAccordions();

  // ==========================================================================
  // NAVBAR: MENÚS DESPLEGABLES "EDUCACIÓN" Y "EL CENTRO" (Móvil y Accesibilidad)
  // ==========================================================================
  function initNavDropdown() {
    const dropdowns = document.querySelectorAll('.nav-item-dropdown');
    if (!dropdowns.length) return;

    dropdowns.forEach(dropdown => {
      const toggleBtn = dropdown.querySelector('.btn-mobile-dropdown-toggle');
      const triggerLink = dropdown.querySelector('.nav-dropdown-trigger');

      if (toggleBtn) {
        toggleBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const isOpen = dropdown.classList.toggle('dropdown-open');
          toggleBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });
      }

      // En dispositivos móviles o táctiles, si el submenú está cerrado, el primer toque en el trigger abre el submenú
      if (triggerLink) {
        triggerLink.addEventListener('click', (e) => {
          const isMobile = window.innerWidth <= 768;
          if (isMobile && !dropdown.classList.contains('dropdown-open')) {
            e.preventDefault();
            dropdown.classList.add('dropdown-open');
            if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'true');
          }
        });
      }
    });

    // Cerrar al hacer clic fuera
    document.addEventListener('click', (e) => {
      dropdowns.forEach(dropdown => {
        if (!dropdown.contains(e.target)) {
          dropdown.classList.remove('dropdown-open');
          const toggleBtn = dropdown.querySelector('.btn-mobile-dropdown-toggle');
          if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'false');
        }
      });
    });

    // Cerrar con Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        dropdowns.forEach(dropdown => {
          dropdown.classList.remove('dropdown-open');
          const toggleBtn = dropdown.querySelector('.btn-mobile-dropdown-toggle');
          if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'false');
        });
      }
    });
  }

  initNavDropdown();





  // ==========================================================================
  // ACORDEONES DE TERAPIAS (details/summary con animación suave)
  // ==========================================================================
  function initTherapyAccordions() {
    const accordions = document.querySelectorAll('details');

    accordions.forEach(acc => {
      const summary = acc.querySelector('summary');
      const content = acc.querySelector('div');

      summary.addEventListener('click', (e) => {
        e.preventDefault();

        // Close all other open accordions smoothly
        accordions.forEach(otherAcc => {
          if (otherAcc !== acc && otherAcc.hasAttribute('open')) {
            const otherContent = otherAcc.querySelector('div');
            otherContent.style.overflow = 'hidden';

            const startHeight = otherContent.offsetHeight;
            const animation = otherContent.animate(
              [
                { height: startHeight + 'px', opacity: 1, transform: 'translateY(0)' },
                { height: '0px', opacity: 0, transform: 'translateY(-10px)' }
              ],
              { duration: 350, easing: 'ease-in-out' }
            );

            animation.onfinish = () => {
              otherAcc.removeAttribute('open');
              otherContent.style.height = '';
              otherContent.style.overflow = '';
            };
          }
        });

        // Toggle current accordion
        if (acc.hasAttribute('open')) {
          // Close it
          content.style.overflow = 'hidden';
          const startHeight = content.offsetHeight;
          const animation = content.animate(
            [
              { height: startHeight + 'px', opacity: 1, transform: 'translateY(0)' },
              { height: '0px', opacity: 0, transform: 'translateY(-10px)' }
            ],
            { duration: 350, easing: 'ease-in-out' }
          );

          animation.onfinish = () => {
            acc.removeAttribute('open');
            content.style.height = '';
            content.style.overflow = '';
          };
        } else {
          // Open it
          acc.setAttribute('open', '');
          content.style.overflow = 'hidden';
          const targetHeight = content.offsetHeight;

          content.animate(
            [
              { height: '0px', opacity: 0, transform: 'translateY(-10px)' },
              { height: targetHeight + 'px', opacity: 1, transform: 'translateY(0)' }
            ],
            { duration: 350, easing: 'ease-in-out' }
          ).onfinish = () => {
             content.style.overflow = '';
             content.style.height = '';
          };
        }
      });
    });
  }

  initTherapyAccordions();

// Franjas de tejuela (DESIGN.md §5b): ajusta el mosaico para que siempre entre un número
// entero de tejuelas en el ancho, sin piezas cortadas en los bordes.
function ajustarTejuelas() {
  document.querySelectorAll('.chilota-tejuela').forEach((el) => {
    // offsetWidth mide el ancho real de diseño; getBoundingClientRect cambiaría con las animaciones de escala.
    const ancho = el.offsetWidth;
    if (!ancho) return;
    const alto = el.offsetHeight;
    const ideal = alto * 4; // un mosaico de 3 tejuelas mide 4 veces su alto visible
    const n = Math.max(1, Math.round(ancho / ideal));
    el.style.backgroundSize = `${ancho / n}px ${alto}px`;
    // Las tejuelas pintadas con máscara (programas) usan el mismo tamaño de mosaico.
    el.style.webkitMaskSize = el.style.maskSize = `${ancho / n}px ${alto}px`;
  });
}
document.addEventListener('DOMContentLoaded', () => {
  ajustarTejuelas();
  // Las tarjetas cambian de ancho en el carrusel móvil y al cargar las fuentes.
  if ('ResizeObserver' in window) {
    const ro = new ResizeObserver(ajustarTejuelas);
    document.querySelectorAll('.chilota-tejuela').forEach((el) => ro.observe(el));
  } else {
    window.addEventListener('resize', ajustarTejuelas);
  }
});

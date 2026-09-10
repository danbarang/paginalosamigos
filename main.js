import './style.css';
import { gsap } from 'gsap';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollToPlugin, ScrollTrigger);

document.addEventListener('DOMContentLoaded', () => {

  // Scroll animations for elements with .animate-on-scroll
  const elements = document.querySelectorAll('.animate-on-scroll');
  
  elements.forEach((el) => {
    gsap.from(el, {
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        toggleActions: 'play none none reverse'
      },
      y: 50,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.out'
    });
  });

  // Stagger animation  // Group cards for staggered animation if they exist
  if (document.querySelector('.cards-grid')) {
    gsap.fromTo('.card', 
      { y: 50, opacity: 0 },
      {
        scrollTrigger: {
          trigger: '.cards-grid',
          start: 'top 80%',
          toggleActions: 'play none none reverse'
        },
        y: 0,
        opacity: 1,
        duration: 0.6,
        stagger: 0.15,
        ease: 'power3.out'
      }
    );
  } else {
    // Fallback if cards exist but not in a grid container
    gsap.utils.toArray('.card').forEach(card => {
      if (!card.classList.contains('animate-on-scroll')) {
        gsap.fromTo(card, 
          { y: 50, opacity: 0 },
          {
            scrollTrigger: {
              trigger: card,
              start: 'top 85%',
              toggleActions: 'play none none reverse'
            },
            y: 0,
            opacity: 1,
            duration: 0.6,
            ease: 'power3.out'
          }
        );
      }
    });
  }

  // Stagger animation for the new 9-item services grid
  if (document.querySelector('.services-grid')) {
    // Remove animate-on-scroll to avoid duplicate animations
    document.querySelectorAll('.service-col').forEach(el => el.classList.remove('animate-on-scroll'));
    
    gsap.fromTo('.service-col', 
      { y: 40, opacity: 0 },
      {
        scrollTrigger: {
          trigger: '.services-grid',
          start: 'top 75%',
          toggleActions: 'play none none reverse'
        },
        y: 0,
        opacity: 1,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power2.out'
      }
    );
  }

  // Floating background blobs (only if user prefers motion)
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  if (!prefersReducedMotion && document.querySelector('.bg-shape')) {
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
          duration: 1, 
          scrollTo: { y: hash, offsetY: 180 }, 
          ease: "power2.inOut",
          onComplete: () => {
            // Eliminar el hash de la URL para que al refrescar la página no vuelva a bajar
            history.replaceState(null, null, window.location.pathname + window.location.search);
          }
        });
      }, 500);
    }
  }

  // Dynamic Navbar Indicator logic
  const navLinks = document.querySelectorAll('.nav-link');
  const indicator = document.querySelector('.nav-indicator');

  if (indicator && navLinks.length > 0) {
    // Find active link
    let activeLink = Array.from(navLinks).find(link => 
      window.location.pathname.includes(link.getAttribute('href')) ||
      (window.location.pathname === '/' && link.getAttribute('href') === 'index.html')
    );

    if (!activeLink) activeLink = navLinks[0];

    const updateIndicator = (link) => {
      const rect = link.getBoundingClientRect();
      const parentRect = link.closest('.nav-links').getBoundingClientRect();
      
      indicator.style.width = `${rect.width}px`;
      indicator.style.transform = `translateX(${rect.left - parentRect.left}px)`;
    };

    // Initial position
    setTimeout(() => updateIndicator(activeLink), 100);

    // Update on resize
    window.addEventListener('resize', () => updateIndicator(activeLink));
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

  // Global Custom Cursor Logic
  // Inject cursor element to ensure it works on all pages
  let cursor = document.querySelector('.custom-cursor');
  if (!cursor) {
    cursor = document.createElement('div');
    cursor.className = 'custom-cursor';
    document.body.appendChild(cursor);
  }

  // Actualizar posición usando estilos en línea (evita recalcular el layout de toda la página)
  document.addEventListener('mousemove', (e) => {
    if (cursor) {
      // 20px es la mitad del ancho del cursor (40px) para centrarlo perfectamente
      cursor.style.translate = `${e.clientX - 20}px ${e.clientY - 20}px`;
    }
  });

  // Hero Background Particles
  const heroSection = document.getElementById('hero-section');
  if (heroSection) {
    const particlesContainer = document.createElement('div');
    particlesContainer.className = 'hero-particles';
    // Insertamos al principio para que quede al fondo
    heroSection.insertBefore(particlesContainer, heroSection.firstChild);

    const colors = ['var(--primary-color)', 'var(--accent-yellow)', 'var(--accent-green-light)', 'var(--white)'];
    const numParticles = 25; // Cantidad de partículas

    for (let i = 0; i < numParticles; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      
      const size = Math.random() * 40 + 10; // de 10px a 50px
      const left = Math.random() * 100;
      const top = Math.random() * 100;
      const color = colors[Math.floor(Math.random() * colors.length)];
      // Animaciones aleatorias intermedias
      const delay = Math.random() * -15;
      const duration = Math.random() * 6 + 8; // 8s a 14s (un poco más lento)
      
      const moveX = (Math.random() * 60 - 30) + 'vw';
      const moveY = (Math.random() * 60 - 30) + 'vh';

      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.left = `${left}%`;
      particle.style.top = `${top}%`;
      particle.style.backgroundColor = color;
      particle.style.animation = `floatParticle ${duration}s ease-in-out ${delay}s infinite alternate`;
      particle.style.setProperty('--move-x', moveX);
      particle.style.setProperty('--move-y', moveY);

      particlesContainer.appendChild(particle);
    }
  }

  // Detectar hover sobre elementos interactivos para el efecto Morph
  document.addEventListener('mouseover', (e) => {
    const cursor = document.querySelector('.custom-cursor');
    if (cursor && e.target.closest('a, button, [role="button"], .card, .profile-card, .quote-card, .service-col')) {
      cursor.classList.add('hovering');
    }
  });

  document.addEventListener('mouseout', (e) => {
    const cursor = document.querySelector('.custom-cursor');
    if (cursor && e.target.closest('a, button, [role="button"], .card, .profile-card, .quote-card, .service-col')) {
      cursor.classList.remove('hovering');
    }
  });
});



  // Mobile Stacking Cards (Peel off) for Services Grid
  let mm = gsap.matchMedia();
  
  mm.add("(max-width: 768px)", () => {
    const servicesGrid = document.querySelector('.services-grid');
    if (servicesGrid) {
      const cards = gsap.utils.toArray('.services-grid .service-col');
      
      // We set the grid to a fixed block to hold absolute children
      gsap.set(servicesGrid, { 
        display: 'block', 
        position: 'relative', 
        height: '400px', // Fixed height for mobile card
        marginTop: '20px' 
      });
      
      // Stack cards with z-index so first is on top
      cards.forEach((card, i) => {
        gsap.set(card, { 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          width: '100%', 
          height: '100%',
          background: 'var(--white)', 
          padding: 'var(--spacing-5)', 
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          boxSizing: 'border-box',
          border: '1px solid rgba(0,0,0,0.05)',
          zIndex: cards.length - i,
          // Remove default margin from grid children
          margin: 0
        });
      });

      // Pin the grid and animate peeling
      let tl = gsap.timeline({
        scrollTrigger: {
          trigger: servicesGrid,
          start: 'top 25%',
          end: '+=400%', // 4x viewport height for scrubbing
          scrub: 1, // smooth scrub
          pin: true,
          // Optional: markers for debugging
          // markers: true
        }
      });

      // Stagger the peeling off of cards
      cards.forEach((card, index) => {
        if (index < cards.length - 1) {
          // Add a subtle scale effect to the card *behind* it to make it pop when revealed
          const nextCard = cards[index + 1];
          if (nextCard) {
            gsap.set(nextCard, { scale: 0.95, opacity: 0.8 });
            tl.to(nextCard, { scale: 1, opacity: 1, duration: 0.5 }, index);
          }
          
          // Peel away the current card
          tl.to(card, {
            yPercent: -120, // Move up
            opacity: 0,     // Fade out
            rotate: Math.random() * 5 - 2.5, // Slight random rotation for the "photo" feel
            duration: 1
          }, index);
        }
      });
      
      return () => {
        // Cleanup if screen grows past 768px
        gsap.set(servicesGrid, { clearProps: 'all' });
        gsap.set(cards, { clearProps: 'all' });
      };
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

      // 2. Actualizar paneles / acordeón en móvil (modo exclusivo)
      accordionItems.forEach(item => {
        const isMatch = item.getAttribute('data-specialty') === targetSpecialty;
        item.classList.toggle('active', isMatch);
        const trigger = item.querySelector('.accordion-trigger');
        if (trigger) {
          trigger.setAttribute('aria-expanded', isMatch ? 'true' : 'false');
        }
      });
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
          const target = item.getAttribute('data-specialty');
          setActiveSpecialty(target);

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




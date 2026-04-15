console.log('🟢 [site-enhancements.js] Script loaded');

(function () {
  const body = document.body;
  const path = (window.location.pathname || '').toLowerCase();
  const page = path.split('/').pop() || 'home.html';

  if (!body) {
    return;
  }

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const animated = new WeakSet();
  const observed = new WeakSet();

  body.classList.add('kemet-enhanced');

  function updateScrollState() {
    body.classList.toggle('is-scrolled', window.scrollY > 24);
  }

  function installMobileNav() {
    const nav = document.querySelector('nav');
    const navLinks = nav ? nav.querySelector('.nav-links') : null;

    if (!nav || !navLinks || nav.querySelector('.kemet-nav-toggle')) {
      return;
    }

    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'kemet-nav-toggle';
    toggle.setAttribute('aria-label', 'Toggle navigation menu');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.innerHTML = '<span></span><span></span><span></span>';

    const navCta = nav.querySelector('.nav-cta');
    if (navCta) {
      nav.insertBefore(toggle, navCta);
    } else {
      nav.appendChild(toggle);
    }

    const closeMenu = () => {
      body.classList.remove('nav-open');
      toggle.setAttribute('aria-expanded', 'false');
    };

    toggle.addEventListener('click', () => {
      const isOpen = body.classList.toggle('nav-open');
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    navLinks.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', closeMenu);
    });

    document.addEventListener('click', (event) => {
      if (window.innerWidth > 900 || !body.classList.contains('nav-open')) {
        return;
      }

      if (nav.contains(event.target)) {
        return;
      }

      closeMenu();
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 900) {
        closeMenu();
      }
    });
  }

  function installScrollProgress() {
    if (
      page === 'home.html' ||
      page === '' ||
      page === 'index.html' ||
      page === 'blogs.html' ||
      page === 'portfolio.html' ||
      page === 'admingeorge.html' ||
      page === 'blog-create.html'
    ) {
      return;
    }

    const progress = document.createElement('div');
    progress.className = 'kemet-scroll-progress';

    const fill = document.createElement('span');
    fill.className = 'kemet-scroll-progress__fill';
    progress.appendChild(fill);
    body.appendChild(progress);

    const update = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = maxScroll > 0 ? Math.min(1, Math.max(0, window.scrollY / maxScroll)) : 0;
      fill.style.transform = `scaleX(${ratio})`;
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
  }

  installMobileNav();
  updateScrollState();
  window.addEventListener('scroll', updateScrollState, { passive: true });

  if (!prefersReducedMotion) {
    installScrollProgress();
  }

  if (page === 'contact.html') {
    const contactIntroTargets = [
      ...document.querySelectorAll('.contact-hero .hero-left > *'),
      ...document.querySelectorAll('.contact-hero .hero-right > *')
    ];

    if (!prefersReducedMotion) {
      contactIntroTargets.forEach((element, index) => {
        if (!(element instanceof Element)) {
          return;
        }

        const direction = element.closest('.hero-left') ? 'translate3d(-32px, 18px, 0)' : 'translate3d(32px, 18px, 0)';
        element.animate(
          [
            { opacity: 0, transform: direction, filter: 'blur(8px)' },
            { opacity: 1, transform: 'translate3d(0, 0, 0)', filter: 'blur(0)' }
          ],
          {
            duration: 900,
            delay: index * 90,
            easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
            fill: 'both'
          }
        );
      });
    }

    return;
  }

  const revealSelectors = [
    '.page-hero > *',
    '.contact-hero .hero-left > *',
    '.contact-hero .hero-right > *',
    '.team-carousel',
    '.culture-grid > *',
    '.join-cta > *',
    '.stats-strip > *',
    '.footer-top > *',
    '.footer-bottom > *',
    '.info-item',
    '.book-call',
    '.create-header > *',
    '.post-settings > *',
    '.cover-image-upload',
    '.content-editor',
    '.section-header > *',
    '.stats-row .stat-card',
    '.admin-table',
    '.message-detail-card',
    '.login-box > *',
    '.post-hero-content > *',
    '.post-cover',
    '.post-content > *',
    '.post-share',
    '.blog-intro .container > *',
    '.filter-bar'
  ];

  function getDirection(element) {
    if (element.matches('.contact-hero .hero-left > *') || element.matches('.info-item')) {
      return 'left';
    }

    if (element.matches('.contact-hero .hero-right > *') || element.matches('.culture-grid > :last-child')) {
      return 'right';
    }

    if (
      element.matches('.cover-image-upload') ||
      element.matches('.content-editor') ||
      element.matches('.admin-table') ||
      element.matches('.message-detail-card') ||
      element.matches('.team-carousel') ||
      element.matches('.post-cover')
    ) {
      return 'scale';
    }

    return 'up';
  }

  function getDelay(element) {
    const parent = element.parentElement;
    if (!parent) {
      return 0;
    }

    const siblings = Array.from(parent.children).filter((child) => child.nodeType === 1);
    const index = Math.max(0, siblings.indexOf(element));
    return (index % 5) * 85;
  }

  function runReveal(element) {
    if (animated.has(element) || prefersReducedMotion) {
      animated.add(element);
      return;
    }

    const direction = getDirection(element);
    const delay = getDelay(element);
    let keyframes;

    if (direction === 'left') {
      keyframes = [
        { opacity: 0, transform: 'translate3d(-36px, 20px, 0)', filter: 'blur(10px)' },
        { opacity: 1, transform: 'translate3d(0, 0, 0)', filter: 'blur(0)' }
      ];
    } else if (direction === 'right') {
      keyframes = [
        { opacity: 0, transform: 'translate3d(36px, 20px, 0)', filter: 'blur(10px)' },
        { opacity: 1, transform: 'translate3d(0, 0, 0)', filter: 'blur(0)' }
      ];
    } else if (direction === 'scale') {
      keyframes = [
        { opacity: 0, transform: 'translate3d(0, 24px, 0) scale(0.96)', filter: 'blur(10px)' },
        { opacity: 1, transform: 'translate3d(0, 0, 0) scale(1)', filter: 'blur(0)' }
      ];
    } else {
      keyframes = [
        { opacity: 0, transform: 'translate3d(0, 34px, 0)', filter: 'blur(10px)' },
        { opacity: 1, transform: 'translate3d(0, 0, 0)', filter: 'blur(0)' }
      ];
    }

    element.animate(keyframes, {
      duration: 900,
      delay,
      easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
      fill: 'both'
    });

    animated.add(element);
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        runReveal(entry.target);
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.16,
      rootMargin: '0px 0px -10% 0px'
    }
  );

  function register(element) {
    if (!(element instanceof Element) || observed.has(element) || animated.has(element)) {
      return;
    }

    if (element.closest('nav') || element.closest('.admin-topbar') || element.closest('.marquee-track')) {
      return;
    }

    observed.add(element);
    observer.observe(element);
  }

  function collectTargets(scope) {
    revealSelectors.forEach((selector) => {
      if (scope.matches && scope.matches(selector)) {
        register(scope);
      }

      scope.querySelectorAll(selector).forEach(register);
    });
  }

  collectTargets(body);

  const mutationObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (!(node instanceof Element)) {
          return;
        }

        collectTargets(node);
      });
    });
  });

  mutationObserver.observe(body, {
    childList: true,
    subtree: true
  });
})();

/* Smooth image carousel for all featured work cards */
function initFeaturedWorkCarousel() {
  const featuredCards = document.querySelectorAll('.fw-card[data-images]');
  
  if (!featuredCards.length) {
    console.warn('⚠️ No featured work cards found');
    return;
  }

  console.log(`✓ Initializing featured work carousel for ${featuredCards.length} card(s)`);

  featuredCards.forEach((card, cardIdx) => {
    try {
      const imagesJSON = card.getAttribute('data-images');
      if (!imagesJSON) return;
      
      const images = JSON.parse(imagesJSON);
      if (!images || !Array.isArray(images) || images.length === 0) return;

      const mainImg = card.querySelector('.fw-main-image');
      if (!mainImg) return;

      // Set transition for smooth fade
      mainImg.style.transition = 'opacity 0.5s ease-in-out';

      let carouselTimer = null;
      let currentIdx = 0;
      let isHovered = false;
      const CYCLE_TIME = 1200; // 1.2 seconds per image

      // Preload all images
      images.forEach(src => {
        const preload = new Image();
        preload.src = src;
      });

      function showImage(index) {
        mainImg.style.opacity = '0';
        setTimeout(() => {
          mainImg.src = images[index];
          mainImg.style.opacity = '1';
        }, 250);
      }

      function nextImage() {
        if (!isHovered) return;
        currentIdx = (currentIdx + 1) % images.length;
        showImage(currentIdx);
        scheduleNext();
      }

      function scheduleNext() {
        if (carouselTimer) clearTimeout(carouselTimer);
        if (isHovered) {
          carouselTimer = setTimeout(nextImage, CYCLE_TIME);
        }
      }

      card.addEventListener('mouseenter', () => {
        isHovered = true;
        if (!carouselTimer) {
          scheduleNext();
        }
      });

      card.addEventListener('mouseleave', () => {
        isHovered = false;
        if (carouselTimer) {
          clearTimeout(carouselTimer);
          carouselTimer = null;
        }
        // Reset to first image
        mainImg.style.opacity = '0';
        setTimeout(() => {
          currentIdx = 0;
          mainImg.src = images[0];
          mainImg.style.opacity = '1';
        }, 250);
      });
    } catch (e) {
      console.warn('⚠️ Error initializing carousel for card:', e.message);
    }
  });
}

// Initialize carousel immediately (defer ensures DOM is ready)
console.log('📍 site-enhancements.js loaded, initializing featured work carousel...');
setTimeout(() => {
  console.log('🔄 Attempting to initialize featured work carousel...');
  initFeaturedWorkCarousel();
}, 50);

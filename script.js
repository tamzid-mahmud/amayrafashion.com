(() => {
  'use strict';
  const q = (s, c = document) => c.querySelector(s),
        qa = (s, c = document) => [...c.querySelectorAll(s)];

  /* ---------- Preloader ---------- */
  const pre = q('[data-preloader]');
  const finish = () => pre && pre.classList.add('done');
  window.addEventListener('load', () => setTimeout(finish, 450));
  setTimeout(finish, 2200);

  /* ---------- Header, progress bar, menu position ---------- */
  const header = q('[data-header]'),
        progress = q('[data-progress]');

  // Measures where the header's bottom edge really is and gives it to the CSS
  const setNavTop = () => {
    if (!header) return;
    const bottom = Math.max(0, header.getBoundingClientRect().bottom);
    document.documentElement.style.setProperty('--nav-top', bottom + 'px');
  };

  const scrollUpdate = () => {
    const y = window.scrollY || 0;

    if (header) {
      // two thresholds stop the header flickering around one scroll position
      if (y > 50) header.classList.add('scrolled');
      else if (y < 10) header.classList.remove('scrolled');
    }

    if (progress) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = (max > 0 ? Math.min(100, (y / max) * 100) : 0) + '%';
    }

    setNavTop();
  };

  window.addEventListener('scroll', scrollUpdate, { passive: true });
  window.addEventListener('resize', setNavTop);
  // keeps --nav-top correct while the header's height animates (88px -> 72px)
  if (header && 'ResizeObserver' in window) {
    new ResizeObserver(setNavTop).observe(header);
  }
  scrollUpdate();

  /* ---------- Mobile menu ---------- */
  const toggle = q('[data-menu-toggle]'),
        nav = q('[data-nav]');

  if (toggle && nav) {
    const closeMenu = () => {
      toggle.setAttribute('aria-expanded', 'false');
      nav.classList.remove('open');
      document.body.classList.remove('menu-open');
    };

    toggle.addEventListener('click', () => {
      setNavTop(); // make sure the value is fresh before opening
      const open = toggle.getAttribute('aria-expanded') !== 'true';
      toggle.setAttribute('aria-expanded', String(open));
      nav.classList.toggle('open', open);
      document.body.classList.toggle('menu-open', open);
    });

    qa('a', nav).forEach(a => a.addEventListener('click', closeMenu));

    window.addEventListener('resize', () => {
      if (window.innerWidth > 900) closeMenu();
    });
  }

  /* ---------- Reveal on scroll ---------- */
  const revealEls = qa('.reveal');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      entries => entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      }),
      { threshold: 0.12, rootMargin: '0px 0px -30px 0px' }
    );
    revealEls.forEach(el => observer.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('visible'));
  }

  /* ---------- Custom cursor ---------- */
  const cursor = q('[data-cursor]');
  if (cursor && window.matchMedia('(pointer:fine)').matches) {
    document.addEventListener('mousemove', e => {
      cursor.style.opacity = '1';
      cursor.style.left = e.clientX + 'px';
      cursor.style.top = e.clientY + 'px';
    });
    qa('a,button').forEach(el => {
      el.addEventListener('mouseenter', () => {
        cursor.style.width = '14px';
        cursor.style.height = '14px';
      });
      el.addEventListener('mouseleave', () => {
        cursor.style.width = '8px';
        cursor.style.height = '8px';
      });
    });
  }

  /* ---------- Footer year ---------- */
  qa('[data-year]').forEach(el => (el.textContent = new Date().getFullYear()));

  /* ---------- Enquiry form ---------- */
  const form = q('[data-enquiry-form]');
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const d = new FormData(form),
            get = k => (d.get(k) || '').toString().trim();

      const subject = encodeURIComponent('Amayra Fashion enquiry — ' + get('route'));
      const body = encodeURIComponent(
`Hello Amayra Fashion,

I'd like to discuss a product enquiry.

Name: ${get('name')}
Business / brand: ${get('business')}
Email: ${get('email')}
Country / market: ${get('country')}
Enquiry type: ${get('route')}
Estimated quantity: ${get('quantity')}
Target timeline: ${get('timeline')}

Product brief:
${get('brief')}

Best regards,
${get('name')}`);

      const status = q('[data-form-status]');
      if (status) status.textContent = 'Opening your email app with the enquiry details…';
      window.location.href = `mailto:info@amayrafashion.com?subject=${subject}&body=${body}`;
    });
  }
})();
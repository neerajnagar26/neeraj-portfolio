(() => {
  const root = document.documentElement;
  const button = document.getElementById('themeToggle');
  function setTheme(theme) {
    root.dataset.theme = theme;
    if (button) {
      button.hidden = false;
      const label = document.getElementById('themeLabel');
      if (label) label.textContent = theme === 'dark' ? 'Light mode' : 'Dark mode';
      const sun = button.querySelector('.theme-icon-sun');
      const moon = button.querySelector('.theme-icon-moon');
      if (sun) sun.style.display = theme === 'dark' ? 'none' : 'block';
      if (moon) moon.style.display = theme === 'dark' ? 'block' : 'none';
      button.title = `Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`;
      const divider = document.querySelector('.theme-divider');
      if (divider) divider.hidden = false;
      button.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`);
      button.setAttribute('aria-pressed', String(theme === 'dark'));
    }
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = theme === 'dark' ? '#111113' : '#ffffff';
  }
  let saved = null;
  try { saved = localStorage.getItem('theme'); } catch (_) {}
  setTheme(saved === 'dark' ? 'dark' : 'light');
  button?.addEventListener('click', () => {
    const theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    setTheme(theme);
    try { localStorage.setItem('theme', theme); } catch (_) {}
  });
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();


// Magnify nearby dock controls without layout reflow while the pointer moves.
(() => {
  const dock = document.querySelector('.dock');
  if (!dock) return;
  const controls = [...dock.querySelectorAll('.dock-control')];
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(min-width: 601px) and (hover: hover) and (pointer: fine)');
  let frame = 0;
  let pointerX = null;
  let pointerY = null;
  let centers = null;

  function reset(settle = false) {
    cancelAnimationFrame(frame);
    frame = 0;
    pointerX = null;
    pointerY = null;
    dock.classList.toggle('dock-settling', settle);
    controls.forEach(control => control.style.removeProperty('--dock-scale'));
  }

  function measureCenters() {
    centers = controls.map(control => {
      const rect = control.getBoundingClientRect();
      return { x:rect.left + rect.width / 2, y:rect.top + rect.height / 2 };
    });
  }

  function magnify(x, y) {
    if (reducedMotion.matches || !finePointer.matches) return reset();
    if (!centers) measureCenters();
    dock.classList.remove('dock-settling');
    const growth = Math.min(22, Math.max(0, (innerWidth - 440) / 3));
    controls.forEach((control, index) => {
      const distance = Math.hypot(x - centers[index].x, y - centers[index].y);
      const proximity = Math.max(0, 1 - distance / 120);
      const scale = 1 + (growth / 44) * proximity ** 2;
      control.style.setProperty('--dock-scale', scale.toFixed(3));
    });
  }

  dock.addEventListener('pointermove', event => {
    if (event.pointerType === 'touch') return reset();
    pointerX = event.clientX;
    pointerY = event.clientY;
    dock.classList.remove('dock-settling');
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      magnify(pointerX, pointerY);
    });
  });

  dock.addEventListener('pointerleave', () => {
    reset(true);
    const focused = controls.indexOf(document.activeElement);
    if (focused >= 0 && document.activeElement.matches(':focus-visible')) {
      if (!centers) measureCenters();
      magnify(centers[focused].x, centers[focused].y);
    }
  });

  dock.addEventListener('focusin', event => {
    const focused = controls.indexOf(event.target);
    if (focused >= 0 && event.target.matches(':focus-visible')) {
      if (!centers) measureCenters();
      magnify(centers[focused].x, centers[focused].y);
    }
  });
  dock.addEventListener('focusout', event => {
    if (!dock.contains(event.relatedTarget)) reset();
  });
  reducedMotion.addEventListener('change', () => reset());
  finePointer.addEventListener('change', () => { centers = null; reset(); });
  window.addEventListener('resize', () => { centers = null; reset(); });
  window.addEventListener('blur', () => reset());
})();

// On mobile, tuck the fixed dock away while the page is actively scrolling.
(() => {
  const dock = document.querySelector('.dock');
  if (!dock) return;
  const mobile = matchMedia('(max-width: 600px)');
  let showTimer = 0;
  let lastScrollAt = 0;

  function clearShowTimer() {
    if (showTimer) clearTimeout(showTimer);
    showTimer = 0;
  }

  function show() {
    clearShowTimer();
    dock.classList.remove('dock-hidden');
  }

  function scheduleShow(delay = 500) {
    clearShowTimer();
    showTimer = setTimeout(() => {
      showTimer = 0;
      dock.classList.remove('dock-hidden');
    }, Math.max(0, delay));
  }

  function onScroll() {
    if (!mobile.matches) return;
    lastScrollAt = performance.now();
    if (dock.contains(document.activeElement) && document.activeElement.matches(':focus-visible')) {
      show();
      return;
    }
    dock.classList.add('dock-hidden');
    scheduleShow(500);
  }

  function onFocusOut(event) {
    if (!mobile.matches || dock.contains(event.relatedTarget)) return;
    const remaining = 500 - (performance.now() - lastScrollAt);
    if (remaining > 0) {
      dock.classList.add('dock-hidden');
      scheduleShow(remaining);
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  dock.addEventListener('focusin', show);
  dock.addEventListener('focusout', onFocusOut);
  mobile.addEventListener('change', event => {
    if (!event.matches) show();
  });
})();


// Each job expands independently from either its row or disclosure button.
(() => {
  document.querySelectorAll('.job').forEach(job => {
    const button = job.querySelector('.job-toggle');
    const panel = job.querySelector('.job-details');
    if (!button || !panel) return;
    function setExpanded(expanded) {
      job.dataset.expanded = String(expanded);
      button.setAttribute('aria-expanded', String(expanded));
      button.setAttribute('aria-label', `${expanded ? 'Collapse' : 'Expand'} ${button.dataset.jobLabel}`);
      button.title = expanded ? 'Hide job description' : 'Show full job description';
      panel.setAttribute('aria-hidden', String(!expanded));
      panel.inert = !expanded;
    }
    setExpanded(false);
    job.classList.add('is-collapsible');
    button.hidden = false;
    job.addEventListener('click', event => {
      if (event.target.closest('a,button')) return;
      setExpanded(job.dataset.expanded !== 'true');
    });
    button.addEventListener('click', () => setExpanded(job.dataset.expanded !== 'true'));
  });
})();


(() => {
  const hand = document.querySelector('.wave');
  if (!hand) return;
  hand.addEventListener('click', () => {
    hand.classList.remove('is-waving');
    // Restart the brief greeting when clicked again.
    void hand.offsetWidth;
    hand.classList.add('is-waving');
  });
  hand.addEventListener('animationend', () => hand.classList.remove('is-waving'));
})();

// Keep keyboard focus clear of the fixed dock, including its mobile second row.
(() => {
  const dock = document.querySelector('.dock');
  const page = document.querySelector('.page');
  if (!dock || !page) return;
  let frame = 0;

  function updateClearance() {
    frame = 0;
    const bar = dock.getBoundingClientRect();
    const gap = 16;
    const dockHidden = dock.classList.contains('dock-hidden');
    document.documentElement.style.setProperty(
      '--dock-clearance', dockHidden ? '100px' : `${Math.ceil(innerHeight - bar.top + gap)}px`
    );
    if (dockHidden) return;
    const focused = document.activeElement;
    if (!page.contains(focused) || !focused.matches(':focus-visible')) return;
    const bounds = focused.getBoundingClientRect();
    const safeBottom = bar.top - gap;
    if (bounds.bottom > safeBottom && bounds.top < bar.bottom) {
      window.scrollBy({ top: bounds.bottom - safeBottom, behavior: 'auto' });
    }
  }

  function scheduleUpdate() {
    if (!frame) frame = requestAnimationFrame(updateClearance);
  }

  // Wait until native focus scrolling has completed before correcting overlap.
  document.addEventListener('focusin', scheduleUpdate);
  window.addEventListener('resize', scheduleUpdate);
  window.visualViewport?.addEventListener('resize', scheduleUpdate);
  if ('ResizeObserver' in window) {
    new ResizeObserver(scheduleUpdate).observe(dock);
  } else {
    dock.addEventListener('transitionend', scheduleUpdate);
  }
  scheduleUpdate();
})();

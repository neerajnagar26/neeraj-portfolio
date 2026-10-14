(() => {
  const root = document.documentElement;
  const button = document.getElementById('themeToggle');
  function setTheme(theme) {
    root.dataset.theme = theme;
    if (button) {
      button.hidden = false;
      const label = document.getElementById('themeLabel');
      if (label) label.textContent = theme === 'dark' ? 'Light mode' : 'Dark mode';
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


// Magnify nearby dock controls without changing their links or focus behavior.
(() => {
  const dock = document.querySelector('.dock');
  if (!dock) return;
  const controls = [...dock.querySelectorAll('.dock-control')];
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  let frame = 0;
  let pointerX = null;

  function reset() {
    cancelAnimationFrame(frame);
    frame = 0;
    pointerX = null;
    controls.forEach(control => control.style.removeProperty('--dock-size'));
  }

  function magnify(distances) {
    if (reducedMotion.matches || !finePointer.matches) return reset();
    // Keep the animated dock inside the screen even on a narrow viewport.
    const growth = Math.min(16, Math.max(0, (innerWidth - 296) / 3));
    controls.forEach((control, index) => {
      const proximity = Math.max(0, 1 - Math.abs(distances[index]) / 120);
      control.style.setProperty('--dock-size', `${44 + growth * proximity ** 2}px`);
    });
  }

  dock.addEventListener('pointermove', event => {
    if (event.pointerType === 'touch') return reset();
    pointerX = event.clientX;
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      magnify(controls.map(control => {
        const rect = control.getBoundingClientRect();
        return pointerX - rect.left - rect.width / 2;
      }));
    });
  });

  dock.addEventListener('pointerleave', () => {
    reset();
    const focused = controls.indexOf(document.activeElement);
    if (focused >= 0 && document.activeElement.matches(':focus-visible')) {
      magnify(controls.map((_, index) => (index - focused) * 50));
    }
  });

  dock.addEventListener('focusin', event => {
    const focused = controls.indexOf(event.target);
    if (focused >= 0 && event.target.matches(':focus-visible')) {
      magnify(controls.map((_, index) => (index - focused) * 50));
    }
  });
  dock.addEventListener('focusout', event => {
    if (!dock.contains(event.relatedTarget)) reset();
  });
  reducedMotion.addEventListener('change', reset);
  finePointer.addEventListener('change', reset);
  window.addEventListener('resize', reset);
  window.addEventListener('blur', reset);
})();

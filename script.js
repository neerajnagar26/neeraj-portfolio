// Mobile menu toggle
function toggleMenu(){
    const nav = document.getElementById('nav');
    const btn = document.querySelector('.menu');
    const isOpen = nav.style.display === 'flex';
    nav.style.display = isOpen ? 'none' : 'flex';
    btn.setAttribute('aria-expanded', String(!isOpen));
  }
  
  // Theme handling (black or white only) with persistence
  (function(){
    const root = document.documentElement;
    const btn = document.getElementById('themeToggle');
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initial = saved || (prefersDark ? 'dark' : 'light');
  
    function setTheme(mode){
      root.setAttribute('data-theme', mode);
      localStorage.setItem('theme', mode);
      if(btn){
        btn.textContent = mode === 'dark' ? '☀︎' : '🌙';
        btn.setAttribute('aria-label', mode === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
        btn.setAttribute('aria-pressed', mode === 'dark' ? 'true' : 'false');
      }
    }
  
    setTheme(initial);
  
    if(btn){
      btn.addEventListener('click', ()=>{
        const mode = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        setTheme(mode);
      });
    }
  
    // Fallback loader for avatar: try multiple filenames
    (function setAvatar(){
      const el = document.getElementById('avatar');
      if(!el) return;
      const candidates = [
        'assets/profile.jpg',
        'assets/profile.jpeg',
        'assets/profile.png',
        'assets/profile.svg'
      ];
      let i = 0;
      function tryNext(){
        if(i >= candidates.length) return;
        const url = candidates[i++];
        const img = new Image();
        img.onload = ()=>{ el.src = url; };
        img.onerror = tryNext;
        img.src = url;
      }
      tryNext();
    })();
  
    // Footer year
    const y = document.getElementById('year');
    if(y) y.textContent = new Date().getFullYear();
  })();

  // Header scroll effects
  (function() {
    const header = document.querySelector('.site-header');
    let lastScrollY = window.scrollY;
    
    function updateHeader() {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > 100) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
      
      lastScrollY = currentScrollY;
    }
    
    window.addEventListener('scroll', updateHeader, { passive: true });
    updateHeader(); // Initial call
  })();

  // Enhanced scroll reveal animations
  (function(){
    const els = [
      ...document.querySelectorAll('[data-reveal]'),
      ...document.querySelectorAll('.card'),
      ...document.querySelectorAll('.edu-item'),
      ...document.querySelectorAll('.section h2'),
    ];
    const seen = new WeakSet();
    
    const io = new IntersectionObserver((entries)=>{
      entries.forEach(entry => {
        if(entry.isIntersecting && !seen.has(entry.target)){
          // Add staggered delay for cards in the same section
          const cards = entry.target.closest('.section')?.querySelectorAll('.card');
          if (cards && entry.target.classList.contains('card')) {
            const cardIndex = Array.from(cards).indexOf(entry.target);
            entry.target.style.transitionDelay = `${cardIndex * 0.1}s`;
            
            // Add subtle entrance animation
            entry.target.style.transform = 'translateY(20px)';
            entry.target.style.opacity = '0.8';
            
            // Trigger the animation
            setTimeout(() => {
              entry.target.style.transform = 'translateY(0)';
              entry.target.style.opacity = '1';
            }, 50);
          }
          
          entry.target.classList.add('in');
          seen.add(entry.target);
          
          // Add loading animation for cards
          if (entry.target.classList.contains('card')) {
            entry.target.classList.add('loading');
            setTimeout(() => {
              entry.target.classList.remove('loading');
            }, 600);
          }
        }
      });
    }, { 
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px'
    });
    
    els.forEach(el => io.observe(el));
  })();

  // Back to top functionality
  (function(){
    const btn = document.getElementById('backToTop');
    if(!btn) return;
    
    const showAt = 400;
    
    function updateBackToTop() {
      if(window.scrollY > showAt) {
        btn.classList.add('show');
      } else {
        btn.classList.remove('show');
      }
    }
    
    window.addEventListener('scroll', updateBackToTop, { passive: true });
    
    btn.addEventListener('click', () => {
      window.scrollTo({ 
        top: 0, 
        behavior: 'smooth' 
      });
    });
    
    updateBackToTop(); // Initial call
  })();

  // Smooth scrolling for navigation links
  (function() {
    const navLinks = document.querySelectorAll('a[href^="#"]');
    
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
          const headerHeight = document.querySelector('.site-header').offsetHeight;
          const targetPosition = targetElement.offsetTop - headerHeight - 20;
          
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
          
          // Close mobile menu if open
          const nav = document.getElementById('nav');
          if (nav.style.display === 'flex') {
            toggleMenu();
          }
        }
      });
    });
  })();

  // Enhanced form interactions
  (function() {
    const form = document.getElementById('contactForm');
    if (!form) return;
    
    const inputs = form.querySelectorAll('input, textarea');
    
    // Add focus effects
    inputs.forEach(input => {
      input.addEventListener('focus', () => {
        input.parentElement.classList.add('focused');
      });
      
      input.addEventListener('blur', () => {
        input.parentElement.classList.remove('focused');
      });
    });
    
    // Form validation with real-time feedback
    inputs.forEach(input => {
      input.addEventListener('input', () => {
        if (input.checkValidity()) {
          input.classList.remove('invalid');
          input.classList.add('valid');
        } else {
          input.classList.remove('valid');
          input.classList.add('invalid');
        }
      });
    });
  })();

  // Contact form -> mailto (no backend)
  document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('contactForm');
    if (!form) return;
  
    form.addEventListener('submit', (e) => {
      e.preventDefault();
  
      const name = form.elements['name'].value.trim();
      const email = form.elements['email'].value.trim();
      const message = form.elements['message'].value.trim();
  
      if (!name || !email || !message) {
        showToast('Please complete all fields.');
        return;
      }
  
      const subject = `Portfolio message from ${name}`;
      const body = `From: ${name} <${email}>\n\n${message}`;
  
      const mailto = `mailto:nnagar@uwaterloo.ca?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  
      // Open the user's email client
      window.location.href = mailto;
  
      // Nice little confirmation + reset
      showToast('Opening your email app…');
      form.reset();
      
      // Remove validation classes
      form.querySelectorAll('input, textarea').forEach(input => {
        input.classList.remove('valid', 'invalid');
      });
    });
  });
  
  // Enhanced toast notifications
  function showToast(text, type = 'info'){
    let t = document.getElementById('toast');
    if(!t){
      t = document.createElement('div');
      t.id = 'toast';
      document.body.appendChild(t);
    }
    
    t.textContent = text;
    t.className = `toast show ${type}`;
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
      t.classList.remove('show');
    }, 3000);
  }
  
  // Copy to clipboard functionality
  (function(){
    function showCopyToast(text){
      showToast(text, 'success');
    }
    
    document.addEventListener('click', async (e)=>{
      const btn = e.target.closest('.copy-btn');
      if(!btn) return;
      
      const value = btn.getAttribute('data-copy');
      try{
        await navigator.clipboard.writeText(value);
        showCopyToast('Copied to clipboard!');
      }catch{
        showToast('Copy failed', 'error');
      }
    });
  })();
  
  // Keyboard shortcuts
  document.addEventListener('keydown', (e)=>{
    // 't' toggles theme
    if(e.key.toLowerCase() === 't'){
      document.getElementById('themeToggle')?.click();
    }
    
    // 'Escape' closes mobile menu
    if(e.key === 'Escape'){
      const nav = document.getElementById('nav');
      if(nav.style.display === 'flex'){
        toggleMenu();
      }
    }
    
    // 'Home' goes to top
    if(e.key === 'Home'){
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });
  
  // Performance optimization: Throttle scroll events
  function throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    }
  }
  
  // Apply throttling to scroll events
  const throttledScrollHandler = throttle(() => {
    // Update header effects
    const header = document.querySelector('.site-header');
    if (window.scrollY > 100) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    
    // Update back to top button
    const backToTop = document.getElementById('backToTop');
    if (backToTop) {
      if (window.scrollY > 400) {
        backToTop.classList.add('show');
      } else {
        backToTop.classList.remove('show');
      }
    }
  }, 16); // ~60fps
  
  window.addEventListener('scroll', throttledScrollHandler, { passive: true });
  
  // Preload critical images
  (function() {
    const criticalImages = [
      'assets/profile.jpg',
      'assets/logo-uwaterloo.png',
      'assets/logo-samsung-research.png'
    ];
    
    criticalImages.forEach(src => {
      const img = new Image();
      img.src = src;
    });
  })();
  
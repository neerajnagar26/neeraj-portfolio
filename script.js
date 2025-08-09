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
  
      // Open the user’s email client
      window.location.href = mailto;
  
      // Nice little confirmation + reset
      showToast('Opening your email app…');
      form.reset();
    });
  });
  
  // Simple toast
  function showToast(text){
    let t = document.getElementById('toast');
    if(!t){
      t = document.createElement('div');
      t.id = 'toast';
      document.body.appendChild(t);
    }
    t.textContent = text;
    t.className = 'toast show';
    setTimeout(() => t.classList.remove('show'), 2000);
  }
  
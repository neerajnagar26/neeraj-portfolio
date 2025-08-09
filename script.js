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
  

  // --- reveal on scroll ---
(function(){
    const els = [
      ...document.querySelectorAll('[data-reveal]'),
      ...document.querySelectorAll('.card'),
      ...document.querySelectorAll('.edu-item'),
      ...document.querySelectorAll('.section h2'),
    ];
    const seen = new WeakSet();
    const io = new IntersectionObserver((entries)=>{
      for(const e of entries){
        if(e.isIntersecting && !seen.has(e.target)){
          e.target.classList.add('in'); seen.add(e.target);
        }
      }
    }, { threshold: 0.12 });
    els.forEach(el=> io.observe(el));
  })();
  
  // --- copy to clipboard for email/phone ---
  (function(){
    function toast(text){
      let t = document.getElementById('toast');
      if(!t){ t = document.createElement('div'); t.id='toast'; t.className='toast'; document.body.appendChild(t); }
      t.textContent = text; t.classList.add('show');
      setTimeout(()=> t.classList.remove('show'), 1800);
    }
    document.addEventListener('click', async (e)=>{
      const btn = e.target.closest('.copy-btn');
      if(!btn) return;
      const value = btn.getAttribute('data-copy');
      try{
        await navigator.clipboard.writeText(value);
        toast('Copied: ' + value);
      }catch{
        toast('Copy failed');
      }
    });
  })();
  
  // --- mailto submit (front-end only) ---
  (function(){
    const form = document.getElementById('contactForm');
    if(!form) return;
    form.addEventListener('submit', (e)=>{
      e.preventDefault();
      const name = form.elements['name'].value.trim();
      const email = form.elements['email'].value.trim();
      const message = form.elements['message'].value.trim();
      if(!name || !email || !message){ return; }
      const subject = `Portfolio message from ${name}`;
      const body = `From: ${name} <${email}>\n\n${message}`;
      window.location.href = `mailto:nnagar@uwaterloo.ca?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      // tiny confirmation
      let t = document.getElementById('toast');
      if(!t){ t = document.createElement('div'); t.id='toast'; t.className='toast'; document.body.appendChild(t); }
      t.textContent = 'Opening your email app…'; t.classList.add('show');
      setTimeout(()=> t.classList.remove('show'), 1600);
      form.reset();
    });
  })();
  
  // --- back to top ---
  (function(){
    const btn = document.getElementById('toTop');
    if(!btn) return;
    const showAt = 480;
    window.addEventListener('scroll', ()=>{
      if(window.scrollY > showAt) btn.classList.add('show'); else btn.classList.remove('show');
    });
    btn.addEventListener('click', ()=> window.scrollTo({ top: 0, behavior: 'smooth' }));
  })();
  
  // --- keyboard shortcut: 't' toggles theme ---
  document.addEventListener('keydown', (e)=>{
    if(e.key.toLowerCase() === 't'){
      document.getElementById('themeToggle')?.click();
    }
  });
  
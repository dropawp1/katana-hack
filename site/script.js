const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const header = document.querySelector('[data-header]');
const navToggle = document.querySelector('.nav-toggle');

const updateHeader = () => header?.classList.toggle('scrolled', window.scrollY > 18);
updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

navToggle?.addEventListener('click', () => {
  const open = document.body.classList.toggle('nav-open');
  navToggle.setAttribute('aria-expanded', String(open));
});

document.querySelectorAll('.site-nav a').forEach((link) => {
  link.addEventListener('click', () => {
    document.body.classList.remove('nav-open');
    navToggle?.setAttribute('aria-expanded', 'false');
  });
});

document.querySelectorAll('[data-delay]').forEach((element) => {
  element.style.setProperty('--delay', `${element.dataset.delay}ms`);
});

if ('IntersectionObserver' in window && !reducedMotion) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));
} else {
  document.querySelectorAll('.reveal').forEach((element) => element.classList.add('visible'));
}

const speedInput = document.querySelector('#speed-demo');
const speedOutput = document.querySelector('output[for="speed-demo"]');
speedInput?.addEventListener('input', () => {
  const value = Number(speedInput.value) / 100;
  speedOutput.value = `x${value.toFixed(2)}`;
});

document.querySelectorAll('[data-demo-toggle]').forEach((button, index) => {
  button.addEventListener('click', () => {
    button.classList.toggle('active');
    const state = button.querySelector('span');
    if (state) state.textContent = button.classList.contains('active') ? 'ON' : 'OFF';
    if (index === 0) button.textContent = button.classList.contains('active') ? 'Disable' : 'Enable';
  });
});

const dialog = document.querySelector('[data-lightbox-dialog]');
const dialogImage = dialog?.querySelector('img');
document.querySelectorAll('[data-lightbox]').forEach((button) => {
  button.addEventListener('click', () => {
    if (!dialog || !dialogImage) return;
    dialogImage.src = button.dataset.lightbox;
    dialog.showModal();
  });
});
document.querySelector('[data-lightbox-close]')?.addEventListener('click', () => dialog?.close());
dialog?.addEventListener('click', (event) => {
  const bounds = dialog.getBoundingClientRect();
  const inside = event.clientX >= bounds.left && event.clientX <= bounds.right && event.clientY >= bounds.top && event.clientY <= bounds.bottom;
  if (!inside) dialog.close();
});

const tiltCard = document.querySelector('[data-tilt]');
if (tiltCard && !reducedMotion && window.matchMedia('(pointer: fine)').matches) {
  tiltCard.addEventListener('pointermove', (event) => {
    const rect = tiltCard.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - .5;
    const y = (event.clientY - rect.top) / rect.height - .5;
    tiltCard.style.transform = `rotateY(${x * 7 - 4}deg) rotateX(${-y * 5 + 2}deg) translateY(-2px)`;
  });
  tiltCard.addEventListener('pointerleave', () => {
    tiltCard.style.transform = 'rotateY(-4deg) rotateX(2deg)';
  });
}

const startEmbers = (canvas) => {
  const context = canvas.getContext('2d');
  if (!context) return;
  let particles = [];
  let frame = 0;

  const resize = () => {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const bounds = canvas.getBoundingClientRect();
    canvas.width = Math.max(1, Math.floor(bounds.width * ratio));
    canvas.height = Math.max(1, Math.floor(bounds.height * ratio));
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    particles = Array.from({ length: Math.min(42, Math.max(18, Math.floor(bounds.width / 34))) }, () => ({
      x: Math.random() * bounds.width,
      y: Math.random() * bounds.height,
      radius: .7 + Math.random() * 2.1,
      speed: .25 + Math.random() * .8,
      drift: (Math.random() - .5) * .35,
      alpha: .2 + Math.random() * .7
    }));
  };

  const draw = () => {
    const bounds = canvas.getBoundingClientRect();
    context.clearRect(0, 0, bounds.width, bounds.height);
    particles.forEach((particle) => {
      particle.y -= particle.speed;
      particle.x += particle.drift;
      if (particle.y < -8) {
        particle.y = bounds.height + 8;
        particle.x = Math.random() * bounds.width;
      }
      const glow = context.createRadialGradient(particle.x, particle.y, 0, particle.x, particle.y, particle.radius * 4);
      glow.addColorStop(0, `rgba(255, 210, 88, ${particle.alpha})`);
      glow.addColorStop(.35, `rgba(255, 93, 24, ${particle.alpha * .55})`);
      glow.addColorStop(1, 'rgba(255, 70, 10, 0)');
      context.fillStyle = glow;
      context.beginPath();
      context.arc(particle.x, particle.y, particle.radius * 4, 0, Math.PI * 2);
      context.fill();
    });
    frame = requestAnimationFrame(draw);
  };

  resize();
  if (!reducedMotion) draw();
  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener('pagehide', () => cancelAnimationFrame(frame), { once: true });
};

document.querySelectorAll('[data-embers]').forEach(startEmbers);
document.querySelector('[data-year]').textContent = new Date().getFullYear();

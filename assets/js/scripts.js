// 1. Setup Icons
lucide.createIcons();

// 2. Animation: Scroll Reveal
const observerOptions = {
  root: null,
  rootMargin: '0px',
  threshold: 0.1,
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

document.querySelectorAll('[data-animate="fade-up"]').forEach((el) => {
  // Set initial state via JS, not class to avoid CSS specificity wars
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
  observer.observe(el);
});

// 3. Animation: Helium Float Effect
// Applies gentle, randomized sine wave motion
document.querySelectorAll('[data-float-speed]').forEach((el, index) => {
  const speed = parseFloat(el.dataset.floatSpeed) || 2;
  const offset = index * 1000; // Offset start times

  function animate(time) {
    const y = Math.sin((time + offset) / (1000 * speed)) * 10; // 10px amplitude
    el.style.transform = `translateY(${y}px)`;
    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);
});

// 4. Interaction: Mobile Nav & Header Scroll
const header = document.querySelector('header');
const menuBtn = document.querySelector('[data-ref="mobile-menu-btn"]');
const mobileMenu = document.querySelector('[data-ref="mobile-menu"]');

// Header Scroll Effect
window.addEventListener('scroll', () => {
  if (window.scrollY > 20) {
    header.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
    header.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
  } else {
    header.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
    header.style.boxShadow = 'none';
  }
});

// Mobile Menu Toggle
if (menuBtn && mobileMenu) {
  menuBtn.addEventListener('click', () => {
    const isHidden = mobileMenu.style.display === 'none';
    mobileMenu.style.display = isHidden ? 'block' : 'none';
  });
}

// 5. Interaction: Draggable Testimonials
const slider = document.querySelector('[data-ref="carousel-track"]');
if (slider) {
  let isDown = false;
  let startX;
  let scrollLeft;

  slider.addEventListener('mousedown', (e) => {
    isDown = true;
    slider.style.cursor = 'grabbing';
    startX = e.pageX - slider.offsetLeft;
    scrollLeft = slider.scrollLeft;
  });

  slider.addEventListener('mouseleave', () => {
    isDown = false;
    slider.style.cursor = 'grab';
  });

  slider.addEventListener('mouseup', () => {
    isDown = false;
    slider.style.cursor = 'grab';
  });

  slider.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - slider.offsetLeft;
    const walk = (x - startX) * 2; // scroll-fast
    slider.scrollLeft = scrollLeft - walk;
  });
}

document.querySelectorAll('[data-loki-link]').forEach((element) => {
  element.addEventListener('click', (event) => {
    event.preventDefault();
    const link = document.createElement('a');
    link.href = element.dataset.lokiLink;
    if (event.currentTarget.dataset.lokiLink[0] !== '#') {
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
    }

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });
});

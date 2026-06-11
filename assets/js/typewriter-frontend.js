(() => {
  const COLOR = '#c2e7ff';
  const TEXT = "frontend developer";

  function initTypewriter() {
    const target = document.querySelector('[data-typewriter]');
    if (!target) return;

    // Reset content 
    target.innerHTML = '';

    const animated = document.createElement('span');
    animated.className = 'tw-animated';
    target.appendChild(animated);

    const caret = document.createElement('span');
    caret.className = 'tw-caret';
    caret.setAttribute('aria-hidden', 'true');
    caret.style.backgroundColor = COLOR;
    animated.appendChild(caret);

    const prefersReduced =
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) {
      animated.insertBefore(document.createTextNode(TEXT), caret);
      caret.style.opacity = '1';
      return;
    }

    // Infinite loop: type -> pause -> delete -> pause
    const fullText = TEXT;
    const typingSpeed = 100; // ms per char
    const deletingSpeed = 45;
    const holdAfterType = 1100;
    const holdAfterDelete = 400;

    let index = 0;
    let isDeleting = false;
    let lastStart = 0;

    function tick(now) {
      if (now - lastStart < (isDeleting ? deletingSpeed : typingSpeed)) {
        requestAnimationFrame(tick);
        return;
      }
      lastStart = now;

      if (!isDeleting) {
        index++;
        if (index >= fullText.length) {
          index = fullText.length;
          isDeleting = true;
          requestAnimationFrame(tick);
          setTimeout(() => requestAnimationFrame(tick), holdAfterType);
          return;
        }
      } else {
        index--;
        if (index <= 0) {
          index = 0;
          isDeleting = false;
          requestAnimationFrame(tick);
          setTimeout(() => requestAnimationFrame(tick), holdAfterDelete);
          return;
        }
      }

      const text = fullText.slice(0, index);

      // Remove old text nodes but keep caret
      for (let i = animated.childNodes.length - 1; i >= 0; i--) {
        const node = animated.childNodes[i];
        if (node !== caret) animated.removeChild(node);
      }

      animated.insertBefore(document.createTextNode(text), caret);
      requestAnimationFrame(tick);
    }

    setTimeout(() => requestAnimationFrame(tick), 300);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTypewriter);
  } else {
    initTypewriter();
  }
})();



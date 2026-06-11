
function initSeeMoreDetails({
  cardsContainer,
  cardSelector = '.project-card',
  fullWrapSelector = '.desc-full-wrap',
  toggleBtnSelector = '.project-desc-toggle',
  expandedClassName = 'is-expanded',
  moreText = 'see more details',
  lessText = 'see less details',
} = {}) {
  if (!cardsContainer) return;

  function setExpanded(cardEl, expanded) {
    const fullWrap = cardEl.querySelector(fullWrapSelector);
    const toggleBtn = cardEl.querySelector(toggleBtnSelector);
    const isExpanded = !!expanded;

    cardEl.classList.toggle(expandedClassName, isExpanded);

    if (fullWrap) {
      fullWrap.style.ariaHidden = String(!isExpanded);
      fullWrap.setAttribute('aria-hidden', String(!isExpanded));
    }

    if (toggleBtn) {
      toggleBtn.setAttribute('aria-expanded', String(isExpanded));
      toggleBtn.textContent = isExpanded ? lessText : moreText;
    }
  }

  cardsContainer.addEventListener('click', (e) => {
    const btn = e.target.closest(toggleBtnSelector);
    if (!btn) return;

    const cardEl = btn.closest(cardSelector);
    if (!cardEl) return;

    const expanded = !cardEl.classList.contains(expandedClassName);
    setExpanded(cardEl, expanded);
  });
}

// expose for non-module usage 
window.initSeeMoreDetails = initSeeMoreDetails;



(function () {
  const body = document.body;
  const icon = document.querySelector('[data-theme-toggle-icon]');
  if (!body || !icon) return;

  const SUN_CLASS = 'bi-brightness-high';
  const MOON_CLASS = 'bi-moon';
  const DARK_CLASS = 'theme-dark';
  const KEY = 'theme';

  function applyTheme(theme) {
    const isDark = theme === 'dark';
    body.classList.toggle(DARK_CLASS, isDark);

    // Swap icon classes
    icon.classList.remove(SUN_CLASS, MOON_CLASS);
    icon.classList.add(isDark ? MOON_CLASS : SUN_CLASS);
  }

  function readStoredTheme() {
    try {
      return localStorage.getItem(KEY);
    } catch {
      return null;
    }
  }

  // init
  const stored = readStoredTheme();
  applyTheme(stored === 'dark' ? 'dark' : 'light');

  icon.addEventListener('click', () => {
    const nextTheme = body.classList.contains(DARK_CLASS) ? 'light' : 'dark';
    applyTheme(nextTheme);
    try {
      localStorage.setItem(KEY, nextTheme);
    } catch {
      // ignore
    }
  });
})();


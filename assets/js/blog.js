const API_URL ="https://gnews.io/api/v4/top-headlines?category=general&apikey=648fbfb8e7044a906e318a247dd076be";
const DEFAULT_IMAGE = "assets/imgs/blog.png";
const MAX_CARDS = 38; // max articles fetched (per NewsAPI)
const ITEMS_PER_PAGE = 9; // pagination size (Bootstrap pages)

function escapeHtml(str) {
  return (str ?? '').toString()
    .replaceAll('&', '&amp;')
    .replaceAll('<', '<')
    .replaceAll('>', '>')
    .replaceAll('"', '"')
    .replaceAll("'", '&#39;');
}

function formatDate(input) {
  if (!input) return "";
  const d = new Date(input);
  return Number.isNaN(d.getTime())
    ? ""
    : d.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "2-digit",
      });
}

function renderLoading(container) {
  container.innerHTML = `
    <div class="col-12">
      <div class="alert alert-primary mb-0" role="status">
        Loading blogs...
      </div>
    </div>
  `;
}

function renderError(container, message) {
  container.innerHTML = `
    <div class="col-12">
      <div class="alert alert-danger mb-0" role="alert">
        ${escapeHtml(message)}
      </div>
    </div>
  `;
}

function createBlogCard(article) {
  const title = article?.title || "Untitled";
  const url = article?.url || "#";
  const description = article?.description || "";
  const sourceName = article?.source?.name || "Unknown source";
  const publishedAt = formatDate(article?.publishedAt);
  const imageUrl = article?.image || DEFAULT_IMAGE;

  const cleanDesc = String(description ?? '').trim();
  const PREVIEW = 140;
  const hasOverflow = cleanDesc.length > PREVIEW;
  const preview = hasOverflow ? cleanDesc.slice(0, PREVIEW).trimEnd() + '…' : cleanDesc;

  return `
    <div class="col-12 col-md-6 col-lg-4">
      <div class="card blog-card h-100 shadow-sm blog-project-card">
        <img
          src="${escapeHtml(imageUrl)}"
          class="card-img-top blog-card-img"
          alt="${escapeHtml(title)}"
          loading="lazy"
          onerror="this.onerror=null;this.src='${escapeHtml(DEFAULT_IMAGE)}';"
        />

        <div class="card-body d-flex flex-column">
          <div class="d-flex justify-content-between align-items-start gap-3">
            <span class="badge text-bg-primary text-black">${escapeHtml(sourceName)}</span>
            <div class="d-flex flex-column align-items-end">
            <small class="text-secondary">${escapeHtml(publishedAt)}</small>
            </div>
          </div>

          <h5 class="card-title mt-3">${escapeHtml(title)}</h5>

          <div class="blog-desc-area mt-2">
            <p class="card-text text-secondary mb-2 blog-preview">${escapeHtml(
              preview
            )}</p>

            <div class="blog-desc-full" aria-hidden="true">
              <p class="card-text text-secondary mb-0">${escapeHtml(
                cleanDesc
              )}</p>
            </div>
          </div>

          <button
            class="btn btn-link p-0 mt-auto blog-desc-toggle"
            type="button"
            aria-expanded="false"
            ${hasOverflow ? '' : 'style="display:none"'}
          >
            see more details
          </button>

          <div class="mt-2 d-flex gap-2">
            <a
              href="${escapeHtml(url)}"
              class="btn btn-sm btn-outline-primary "
              target="_blank"
              rel="noopener noreferrer"
            >Read more</a>
          </div>
        </div>
      </div>
    </div>
  `;
}

let BLOG_STATE = {
  articles: [],
  currentPage: 1,
  totalPages: 1,
  itemsPerPage: ITEMS_PER_PAGE,
};

function getPaginationEl() {
  return document.getElementById('blogPagination');
}

function renderPagination() {
  const paginationEl = getPaginationEl();
  if (!paginationEl) return;

  const { totalPages, currentPage } = BLOG_STATE;

  if (!totalPages || totalPages <= 1) {
    paginationEl.innerHTML = '';
    return;
  }

  const makePageItem = ({ label, page, active = false, disabled = false }) => {
    const ariaCurrent = active ? 'aria-current="page"' : '';
    const classes = ['page-item'];
    if (active) classes.push('active');
    if (disabled) classes.push('disabled');

    return `
      <li class="${classes.join(' ')}">
        <button
          class="page-link"
          type="button"
          data-page="${page}"
          ${ariaCurrent}
          ${disabled ? 'disabled' : ''}
        >${label}</button>
      </li>
    `;
  };

  const items = [];
  items.push(
    makePageItem({
      label: 'Prev',
      page: Math.max(1, currentPage - 1),
      disabled: currentPage === 1,
    })
  );

  // Page number window around current page
  const windowSize = 5;
  const half = Math.floor(windowSize / 2);
  let start = Math.max(1, currentPage - half);
  let end = Math.min(totalPages, start + windowSize - 1);
  start = Math.max(1, end - windowSize + 1);

  for (let p = start; p <= end; p++) {
    items.push(makePageItem({ label: String(p), page: p, active: p === currentPage }));
  }

  items.push(
    makePageItem({
      label: 'Next',
      page: Math.min(totalPages, currentPage + 1),
      disabled: currentPage === totalPages,
    })
  );

  paginationEl.innerHTML = items.join('');
}

function renderBlogsPage(page) {
  const container = document.getElementById('blog');
  if (!container) return;

  const { articles, itemsPerPage, totalPages } = BLOG_STATE;
  const safePage = Math.min(Math.max(1, page), totalPages || 1);
  BLOG_STATE.currentPage = safePage;

  const startIdx = (safePage - 1) * itemsPerPage;
  const endIdx = startIdx + itemsPerPage;
  const pageItems = articles.slice(startIdx, endIdx);

  container.innerHTML = pageItems.map(createBlogCard).join("");

  // Re-init expand/collapse after re-rendering cards.
  // initSeeMoreDetails is idempotent on pages where cards are replaced.
  if (window.initSeeMoreDetails) {
    const cardsContainer = document.getElementById('blog');
    window.initSeeMoreDetails({
      cardsContainer,
      cardSelector: '.blog-card',
      fullWrapSelector: '.blog-desc-full',
      toggleBtnSelector: '.blog-desc-toggle',
      expandedClassName: 'is-expanded',
      moreText: 'see more details',
      lessText: 'see less details',
    });
  }

  renderPagination();
}

async function fetchBlogs() {
  const container = document.getElementById("blog");
  if (!container) return;

  renderLoading(container);

  try {
    const res = await fetch(API_URL);

    if (!res.ok) {
      throw new Error(`Request failed: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    console.log("Fetched blogs data:", data);
    const articles = Array.isArray(data?.articles) ? data.articles : [];

    if (articles.length === 0) {
      container.innerHTML = `
        <div class="col-12">
          <div class="alert alert-warning mb-0" role="status">
            No blogs found for the selected sources.
          </div>
        </div>
      `;
      const paginationEl = getPaginationEl();
      if (paginationEl) paginationEl.innerHTML = '';
      return;
    }

    const limited = articles.slice(0, MAX_CARDS);

    BLOG_STATE.articles = limited;
    BLOG_STATE.totalPages = Math.max(
      1,
      Math.ceil(limited.length / BLOG_STATE.itemsPerPage)
    );
    BLOG_STATE.currentPage = 1;

    renderBlogsPage(1);
  } catch (err) {
    renderError(
      container,
      err?.message ||
        "Could not load blogs. If you're running locally, your browser may block the request (CORS)."
    );
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const paginationEl = getPaginationEl();
  if (paginationEl) {
    paginationEl.addEventListener('click', (e) => {
      const btn = e.target && e.target.closest ? e.target.closest('[data-page]') : null;
      if (!btn) return;
      const page = Number(btn.getAttribute('data-page'));
      if (!Number.isFinite(page)) return;
      renderBlogsPage(page);
    });
  }

  fetchBlogs();
});





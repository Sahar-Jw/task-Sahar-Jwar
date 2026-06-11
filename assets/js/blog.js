const API_URL = "assets/data/blog_data.json"; 
const DEFAULT_IMAGE = "assets/imgs/blog.png";
const MAX_CARDS = 38; 
const ITEMS_PER_PAGE = 9; 

function escapeHtml(str) {
  return (str ?? '').toString()
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
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
  const sourceName = article?.source?.name || "TechCrunch";
  const publishedAt = formatDate(article?.publishedAt || article?.published_at);
  const imageUrl = article?.image || article?.urlToImage || DEFAULT_IMAGE;

  const cleanDesc = String(description ?? '').trim();
  const PREVIEW_LIMIT = 140;
  const hasOverflow = cleanDesc.length > PREVIEW_LIMIT;
  const previewText = hasOverflow ? cleanDesc.slice(0, PREVIEW_LIMIT).trimEnd() + '…' : cleanDesc;

  return `
    <div class="col-12 col-md-6 col-lg-4">
      <div class="card blog-card h-100 shadow-sm blog-project-card">
        <img
          src="${escapeHtml(imageUrl)}"
          class="card-img-top blog-card-img"
          alt="${escapeHtml(title)}"
          loading="lazy"
          onerror="this.onerror=null;this.src='${escapeHtml(DEFAULT_IMAGE)}';"
          style="height: 200px; object-fit: cover;"
        />

        <div class="card-body d-flex flex-column">
          <div class="d-flex justify-content-between align-items-start gap-3">
            <span class="badge text-bg-primary text-white p-2">${escapeHtml(sourceName)}</span>
            <div class="d-flex flex-column align-items-end">
              <small class="text-secondary">${escapeHtml(publishedAt)}</small>
            </div>
          </div>

          <h5 class="card-title mt-3">${escapeHtml(title)}</h5>

          <div class="blog-desc-area mt-2">
            <!-- نستخدم وسم واحد فقط ونخزن النص الكامل داخل سمة مخصصة data-full-text لمنع الاختفاء والتعارض -->
            <p class="card-text text-secondary mb-2 blog-description-text" 
               data-full-text="${escapeHtml(cleanDesc)}" 
               data-preview-text="${escapeHtml(previewText)}">
              ${escapeHtml(previewText)}
            </p>
          </div>

          <button
            class="btn btn-link p-0 mt-auto text-start blog-desc-toggle shadow-none text-decoration-none"
            type="button"
            aria-expanded="false"
            ${hasOverflow ? '' : 'style="display:none"'}
          >
            see more details
          </button>

          <div class="mt-2 d-flex gap-2">
            <a
              href="${escapeHtml(url)}"
              class="btn btn-sm btn-outline-primary"
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
    const articles = Array.isArray(data?.articles) ? data.articles : [];

    if (articles.length === 0) {
      container.innerHTML = `
        <div class="col-12">
          <div class="alert alert-warning mb-0" role="status">
            No integrity data blogs found.
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
      "Could not load blog data. Please make sure the JSON file exists in the correct assets directory path."
    );
  }
}

// 🛠️ الحل البرمجي الجذري والآمن 100%: التبديل النصي المباشر بدون إخفاء عناصر
document.addEventListener('click', function(e) {
  const toggleBtn = e.target.closest('.blog-desc-toggle');
  if (toggleBtn) {
    const cardBody = toggleBtn.closest('.card-body');
    const textEl = cardBody.querySelector('.blog-description-text');
    
    const fullText = textEl.getAttribute('data-full-text');
    const previewText = textEl.getAttribute('data-preview-text');

    // التبديل بين النصين المخزنين في الـ HTML مباشرة لمنع الاختفاء الصادم
    if (toggleBtn.getAttribute('aria-expanded') === 'false') {
      textEl.textContent = fullText;
      toggleBtn.innerText = 'see less details';
      toggleBtn.setAttribute('aria-expanded', 'true');
    } else {
      textEl.textContent = previewText;
      toggleBtn.innerText = 'see more details';
      toggleBtn.setAttribute('aria-expanded', 'false');
    }
  }
});

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

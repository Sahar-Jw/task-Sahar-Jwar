const productCard = document.getElementById("productCard");

// 1. GLOBAL TOAST CONTAINER: 
if (productCard && !document.querySelector('.toast-container')) {
  const container = document.createElement('div');
  container.className = "toast-container position-fixed bottom-0 end-0 p-3";
  container.innerHTML = `
    <div id="liveToast" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
      <div class="toast-header">
        <strong class="me-auto" id="toastTitle">Notification</strong>
        <small>Just now</small>
        <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
      <div class="toast-body" id="toastBody">Product updated!</div>
    </div>
  `;
  document.body.appendChild(container);
}

// GET FAV PRODUCTS FROM LOACALSTORAGE
function getFavorites() {
  const favs = localStorage.getItem('product_favorites');
  return favs ? JSON.parse(favs) : [];
}

// UPDATE CART BADGE
function updateCartBadge() {
  const cart = document.getElementById('cart-span');
  if (cart) {
    const favorites = getFavorites();
    cart.innerText = favorites.length;
  }
}

// 2. DYNAMIC FETCH API: (WITH FILTER)
async function fetchProducts(category = "all") {
  try {
    if (productCard) {
      productCard.innerHTML = "<div class='text-center w-100 p-5'><div class='spinner-border text-primary' role='status'></div></div>";
    }

    let url = "https://fakestoreapi.com/products";
    if (category !== "all") {
      url = `https://fakestoreapi.com/products/category/${encodeURIComponent(category)}`;
    }

    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();

    if (!productCard) return;
    productCard.innerHTML = "";

    const currentFavorites = getFavorites();

    data.forEach((product) => {

      //CHECK IF PRODUCT IS FAV OR NOT TO CHANGE THE COLOR AND THE ICON
      const isAlreadyFav = currentFavorites.includes(product.id.toString());
      const btnClass = isAlreadyFav ? "btn btn-danger" : "btn btn-outline-danger";
      const iconClass = isAlreadyFav ? "bi bi-heart-fill" : "bi bi-heart";

      productCard.innerHTML += `
      <div class="col-12 col-md-6 col-lg-4 d-flex justify-content-center">
        <div class="card mb-3 w-100" style="max-width: 540px;">
          <div class="row g-0 h-100">
            <div class="col-md-4 d-flex align-items-center justify-content-center bg-light p-2 rounded-start">
              <img src="${product.image}" class="img-fluid rounded-start" alt="${product.title}" style="max-height: 150px; object-fit: contain;">
            </div>
            <div class="col-md-8">
              <div class="card-body d-flex flex-column h-100 justify-content-between">
                <div>
                  <h6 class="card-title text-truncate" title="${product.title}">${product.title}</h6>
                  <h5 class="card-title text-secondary">$${product.price}</h5>
                  <p class="card-text mb-2"><small class="text-body-secondary">${product.category}</small></p>
                </div>
                <button type="button" class="${btnClass} toastBtn align-self-start" data-product-id="${product.id}" data-product-title="${product.title}" aria-label="Favorite toggle">
                  <i class="${iconClass}"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>`;
    });
  } catch (error) {
    console.error("Fetch failed:", error);
    if (productCard) productCard.innerHTML = "<div class='alert alert-danger w-100'>Failed to load products.</div>";
  }
}

// 3. DYNAMIC MODAL RENDER:
async function updateCartModalContent() {
  const modalList = document.getElementById("cartModalList");
  const totalValueSpan = document.getElementById("cartTotalValue");
  const favoritesIds = getFavorites();

  if (!modalList || !totalValueSpan) return;

  if (favoritesIds.length === 0) {
    modalList.innerHTML = "<p class='text-muted text-center my-4'>Your cart is empty.</p>";
    totalValueSpan.innerText = "$0.00";
    return;
  }

  modalList.innerHTML = "<div class='text-center p-3'><div class='spinner-border spinner-border-sm text-primary'></div></div>";

  try {
    const response = await fetch("https://fakestoreapi.com/products");
    const allProducts = await response.json();

    const favoriteProducts = allProducts.filter(product => favoritesIds.includes(product.id.toString()));

    let totalPrice = 0;
    modalList.innerHTML = "";

    favoriteProducts.forEach(product => {
      totalPrice += product.price;

      modalList.innerHTML += `
        <div class="d-flex align-items-center justify-content-between border-bottom pb-2 mb-2" id="modal-item-${product.id}">
          <div class="d-flex align-items-center gap-3" style="max-width: 75%;">
            <img src="${product.image}" alt="${product.title}" style="width: 50px; height: 50px; object-fit: contain;" class="bg-light p-1 rounded">
            <div>
              <h6 class="mb-0 text-truncate" style="max-width: 250px;" title="${product.title}">${product.title}</h6>
              <small class="text-secondary fw-semibold">$${product.price}</small>
            </div>
          </div>
          <button type="button" class="btn btn-sm btn-link text-danger removeModalBtn" data-product-id="${product.id}">
            <i class="bi bi-trash-fill fs-5"></i>
          </button>
        </div>
      `;
    });

    totalValueSpan.innerText = `$${totalPrice.toFixed(2)}`;

  } catch (error) {
    console.error("Failed to populate modal:", error);
    modalList.innerHTML = "<div class='alert alert-danger py-2'>Error loading data.</div>";
  }
}

// 4. EVENT DELEGATION:
document.addEventListener('click', function (event) {
  const tabButton = event.target.closest('[data-category]');
  if (tabButton) {
    const selectedCategory = tabButton.getAttribute('data-category');
    document.querySelectorAll('[data-category]').forEach(btn => btn.classList.remove('active'));
    tabButton.classList.add('active');
    fetchProducts(selectedCategory);
    return;
  }

  // DEELETE BUTTON
  const removeModalBtn = event.target.closest('.removeModalBtn');
  if (removeModalBtn) {
    const productId = removeModalBtn.getAttribute('data-product-id');
    let favorites = getFavorites();

    favorites = favorites.filter(id => id !== productId);
    localStorage.setItem('product_favorites', JSON.stringify(favorites));

    updateCartBadge();
    updateCartModalContent(); 

    const galleryButton = document.querySelector(`.toastBtn[data-product-id="${productId}"]`);
    if (galleryButton) {
      galleryButton.className = "btn btn-outline-danger toastBtn align-self-start";
      const icon = galleryButton.querySelector('i');
      if (icon) icon.className = "bi bi-heart";
    }
    return;
  }

  const button = event.target.closest('.toastBtn');
  if (button) {
    const toastElement = document.getElementById('liveToast');
    const toastBody = document.getElementById('toastBody');
    const productName = button.getAttribute('data-product-title');
    const productId = button.getAttribute('data-product-id');
    const icon = button.querySelector('i');

    if (icon && toastBody && productName && productId) {
      let favorites = getFavorites();
      const isFavorite = icon.classList.contains('bi-heart-fill');

      if (isFavorite) {
        
        icon.className = "bi bi-heart";
        button.className = "btn btn-outline-danger toastBtn align-self-start";
        favorites = favorites.filter(id => id !== productId);
        localStorage.setItem('product_favorites', JSON.stringify(favorites));
        updateCartBadge();
        return; 
      } else {
        icon.className = "bi bi-heart-fill";
        button.className = "btn btn-danger toastBtn align-self-start";
        toastBody.textContent = ` "${productName}" added to Cart!`;
        
        if (!favorites.includes(productId)) {
          favorites.push(productId);
        }
        localStorage.setItem('product_favorites', JSON.stringify(favorites));
        updateCartBadge();
      }
    }

    if (toastElement) {
      const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toastElement);
      toastBootstrap.show();
    }
  }
});

// 5. BOOTSTRAP MODAL EVENT: 
document.addEventListener('DOMContentLoaded', () => {
  const myModalEl = document.getElementById('cartModal');
  if (myModalEl) {
    myModalEl.addEventListener('show.bs.modal', function () {
      updateCartModalContent();
    });
  }
});

updateCartBadge();
fetchProducts("all");

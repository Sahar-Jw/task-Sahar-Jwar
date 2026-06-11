# about this project

This project is a multi-page front-end showcasing featured projects and interactive demos. It’s built with plain HTML/CSS/JavaScript,RESTapis with **Bootstrap 5** for layout/components and a custom stylesheet for UI polish, responsiveness, and light/dark theming.

## Pages

- **Home (index.html)**
  - Hero section with profile image, social links, and a CV download button.
  - Project cards are rendered dynamically from `assets/js/ProjectData.js`.
  - “See more details” expands/collapses descriptions using `assets/js/seeMoreDetails.js`.
  - Theme toggle supported via `assets/js/theme-toggle.js`.

- **Blog (Blog.html)**
  - Pulls and displays tech blog posts using the **gnewsApi** (handled in `assets/js/blog.js`).
  - Includes pagination and description expand/collapse.
  - Blog imagery uses a default fallback image (`assets/imgs/blog.png`) when an article has no thumbnail.

- **Product Gallery (ProductGallery.html)**
  - Fetches products from **Fake Store API** (`assets/js/products.js`).
  - Category filters via Bootstrap tabs.
  - Favorite/cart behavior stored in **localStorage** (`product_favorites`).
  - A modal shows the user’s saved favorites and calculates the total price.

- **Calculator (Calculator.html)**
  - Responsive calculator UI.
  - Includes keyboard support, real-time input validation/error messaging, and safe evaluation logic in `assets/js/calculater.js`.

- **Consultation (Consultation.html)**
  - A contact/consultation form with client-side validation.
  - Validation and feedback are implemented in `assets/js/validation.js`.

## Key Features

- Dynamic rendering from JavaScript data sources (`ProjectData.js`, Fake Store API, NewsAPI).
- Client-side interactivity: expand/collapse, pagination, modals, toasts.
- Persistent “cart/favorites” experience using `localStorage`.
- Light/dark theme styling driven by CSS + `theme-toggle.js`.
- Responsive layout across desktop and mobile breakpoints.

## Project Structure

- `index.html`, `Blog.html`, `ProductGallery.html`, `Calculator.html`, `Consultation.html`
- `assets/css/main.css` (global styling + page-specific styles)
- `assets/js/`
  - `ProjectData.js` (featured projects dataset)
  - `seeMoreDetails.js` (shared expand/collapse logic)
  - `blog.js` (gnewsAPI fetching + blog UI + pagination)
  - `products.js` (Fake Store API + favorites modal)
  - `calculater.js` (calculator logic)
  - `validation.js` (form validation)
  - `theme-toggle.js` (theme switching)

## Running the project

Because this is a static front-end project, you can open the HTML files directly in a browser.



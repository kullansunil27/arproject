// Backend-connected catalog - fetches from /api/products
const grid = document.getElementById("products");

let allProducts = []; // Fetched from backend

async function loadProducts() {
  try {
    grid.innerHTML = '<div class="loading">Loading products from server...</div>';
    allProducts = await fetchProducts(); // From utils.js
    localStorage.setItem("products", JSON.stringify(allProducts));
    displayProducts(allProducts.filter(p => p.category === "Furniture")); // Default
    setupFilters();
  } catch (error) {
    grid.innerHTML = `<div class="error">${error.message}</div>`;
    // Fallback static
    allProducts = JSON.parse(localStorage.getItem("products") || "[]");
    if (allProducts.length) {
      displayProducts(allProducts.filter(p => p.category === "Furniture"));
      setupFilters();
    }
  }
}

function displayProducts(list) {
  grid.innerHTML = "";
  list.forEach(product => {
    grid.innerHTML += `
      <div class="card" onclick="openProduct(${product.id || product._id})">
        <model-viewer
          src="${product.model}"
          camera-controls
          auto-rotate
          shadow-intensity="1">
        </model-viewer>
        <h3>${product.name}</h3>
        <p>${product.category}</p>
        <div class="price">₹${product.price}</div>
        <button>View Details</button>
      </div>
    `;
  });
}

function setupFilters() {
  document.querySelector(".filter button.active")?.classList.remove("active");
  document.querySelector(".filter button")?.classList.add("active");
}

function filterCategory(category, btn) {
  const buttons = document.querySelectorAll(".filter button");
  buttons.forEach(b => b.classList.remove("active"));
  btn.classList.add("active");

  const filtered = category === 'All' ? allProducts : allProducts.filter(p => p.category === category);
  displayProducts(filtered);
}

function openProduct(id) {
  window.location.href = `product.html?id=${id}`;
}

window.onload = loadProducts;


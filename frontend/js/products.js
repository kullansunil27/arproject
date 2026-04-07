// Backend-connected products list with AR
async function loadProducts() {
  const list = document.getElementById("product-list");
  if (!list) return;

  try {
    list.innerHTML = '<div class="loading">Loading products...</div>';
    const products = await apiFetch('/products'); // Uses dynamic API_BASE + auth from utils.js
    
    list.innerHTML = '';
    products.forEach(p => {
      list.innerHTML += `
        <div class="product-card">
          <h3>${p.name}</h3>
          <p>${p.category}</p>
          <p>₹${p.price}</p>
          <button onclick="viewAR('${p.arModel || p.model}')">
            View in AR
          </button>
        </div>
      `;
    });
  } catch (error) {
    list.innerHTML = `<div class="error">${error.message}</div>`;
  }
}

function viewAR(model) {
  window.location.href = `ar.html?model=${model}`;
}

window.onload = loadProducts;


// Backend-connected homedecor - filters Home Decor from /api/products
async function loadHomeDecor() {
  const grid = document.getElementById("homeDecorGrid");
  if (!grid) return;

  try {
    grid.innerHTML = '<div class="loading">Loading home decor...</div>';
    const products = await fetchProducts();
    const homeDecor = products.filter(p => p.category === 'Home Decor');
    
    grid.innerHTML = '';
    homeDecor.forEach(p => {
      grid.innerHTML += `
        <div class="card">
          <h3>${p.name}</h3>
          <a class="btn" href="ar.html?model=${p.model || p.arModel}">
            View in AR
          </a>
        </div>
      `;
    });
  } catch (error) {
    grid.innerHTML = `<div class="error">${error.message}</div>`;
  }
}

window.onload = loadHomeDecor;


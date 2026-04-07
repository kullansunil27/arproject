// Backend-connected admin - POST to /api/products
async function addProduct() {
  const name = document.getElementById("name").value.trim();
  const category = document.getElementById("category").value;
  const price = document.getElementById("price").value;
  const model = document.getElementById("model").value.trim();

  if (!name || !category || !price || !model) {
    alert('Please fill all fields');
    return;
  }

  const newProduct = {
    name,
    category,
    price: parseFloat(price),
    model,
    arModel: model // Backend expects arModel
  };

  try {
    await apiFetch('/products', {
      method: 'POST',
      body: JSON.stringify(newProduct)
    });
    alert("Product Added Successfully to Backend!");
    window.location.href = "catalog.html";
  } catch (error) {
    alert(`Error: ${error.message}. Requires login/admin token?`);
  }
}

window.addProduct = addProduct;


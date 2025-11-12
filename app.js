// Protección de sesión
if (!localStorage.getItem('token')) {
  window.location.href = './login.html';
}

const API_URL = 'https://fakestoreapi.com/products';
const fmt = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'USD' });

function descPersonalizada(p) {
  const base = {
    "men's clothing": 'Tela suave y resistente, ideal para uso diario.',
    "women's clothing": 'Corte cómodo y versátil para combinar.',
    "jewelery": 'Acabado pulido y detalles de alta calidad.',
    "electronics": 'Rendimiento confiable y lista para trabajar.'
  };
  const plus = [
    'Garantía de satisfacción.',
    'Ligero y fácil de mantener.',
    'Diseño pensado para durar.',
    'Excelente relación calidad-precio.'
  ];
  const pick = plus[p.id % plus.length];
  return `${base[p.category] || 'Calidad verificada y lista para usar.'} ${pick}`;
}

export const carrito = {
  items: [],
  guardar() { localStorage.setItem('carrito', JSON.stringify(this.items)); },
  cargar() {
    const data = localStorage.getItem('carrito');
    if (data) this.items = JSON.parse(data);
  },
  agregarItem(producto) {
    const idx = this.items.findIndex(it => it.id === producto.id);
    if (idx >= 0) this.items[idx].qty++;
    else this.items.push({ id: producto.id, title: producto.title, price: producto.price, customDescription: producto.customDescription, qty: 1 });
    this.guardar(); this.renderizarCarrito();
  },
  quitarItem(id) {
    const idx = this.items.findIndex(it => it.id === id);
    if (idx >= 0) this.items[idx].qty > 1 ? this.items[idx].qty-- : this.items.splice(idx, 1);
    this.guardar(); this.renderizarCarrito();
  },
  eliminarItem(id) {
    this.items = this.items.filter(it => it.id !== id);
    this.guardar(); this.renderizarCarrito();
  },
  calcularTotal() { return this.items.reduce((acc, it) => acc + it.price * it.qty, 0); },
  renderizarCarrito() {
    const cont = document.getElementById('carrito');
    const totalEl = document.getElementById('carrito-total');
    cont.querySelectorAll('.carrito-item').forEach(n => n.remove());
    cont.querySelector('.muted')?.remove();

    if (!this.items.length) {
      cont.insertAdjacentHTML('afterbegin', `<p class="muted">Tu carrito está vacío.</p>`);
      totalEl.textContent = '$0.00';
      return;
    }
    this.items.forEach(it => {
      const row = document.createElement('div');
      row.className = 'carrito-item';
      row.innerHTML = `
        <span>${it.title}</span>
        <div>
          <button class="btn btn-sm" data-action="menos" data-id="${it.id}">−</button>
          <strong>${it.qty}</strong>
          <button class="btn btn-sm" data-action="mas" data-id="${it.id}">+</button>
          <button class="btn btn-sm btn-danger" data-action="borrar" data-id="${it.id}">🗑️</button>
        </div>
        <strong>${fmt.format(it.price * it.qty)}</strong>`;
      cont.insertBefore(row, cont.querySelector('.carrito-total'));
    });
    totalEl.textContent = fmt.format(this.calcularTotal());
  }
};

let productosCache = [];

function renderCatalogo(lista) {
  const grid = document.getElementById('catalogo-productos');
  grid.innerHTML = lista.map(p => `
    <div class="card">
      <img src="${p.image}" alt="${p.title}">
      <h3>${p.title}</h3>
      <p class="muted">${p.customDescription}</p>
      <div class="price">${fmt.format(p.price)}</div>
      <button class="btn btn-add" data-id="${p.id}">Añadir al carrito</button>
    </div>
  `).join('');
}

async function cargarProductos() {
  const grid = document.getElementById('catalogo-productos');
  grid.innerHTML = `<p class="muted">Cargando productos...</p>`;
  try {
    const res = await fetch(API_URL);
    const data = await res.json();
    productosCache = data.map(p => ({ ...p, customDescription: descPersonalizada(p) }));
    renderCatalogo(productosCache);
  } catch {
    grid.innerHTML = `<p class="muted">Error al cargar productos.</p>`;
  }
}

function bindUI() {
  // Vaciar carrito (vista lateral)
  document.getElementById('btn-vaciar')?.addEventListener('click', () => {
    carrito.items = [];
    carrito.guardar();
    carrito.renderizarCarrito();
  });

  // Añadir al carrito desde tarjetas
  document.getElementById('catalogo-productos').addEventListener('click', e => {
    const btn = e.target.closest('.btn-add');
    if (!btn) return;
    const id = Number(btn.dataset.id);
    const p = productosCache.find(x => x.id === id);
    if (p) carrito.agregarItem(p);
  });

  // Controles del carrito (+, −, 🗑️) en vista lateral
  document.getElementById('carrito').addEventListener('click', e => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;
    const id = Number(btn.dataset.id);
    const action = btn.dataset.action;
    if (action === 'mas') carrito.agregarItem({ ...productosCache.find(p => p.id === id) });
    if (action === 'menos') carrito.quitarItem(id);
    if (action === 'borrar') carrito.eliminarItem(id);
  });

  // Cerrar sesión
  document.getElementById('logout')?.addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.removeItem('token');
    window.location.href = './login.html';
  });
}

window.addEventListener('DOMContentLoaded', () => {
  bindUI();
  carrito.cargar();
  carrito.renderizarCarrito();
  cargarProductos();
});

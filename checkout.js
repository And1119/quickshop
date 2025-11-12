// Protección de sesión
if (!localStorage.getItem('token')) {
  window.location.href = './login.html';
}

const fmt = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'USD' });
let items = JSON.parse(localStorage.getItem('carrito') || '[]');

function guardar() {
  localStorage.setItem('carrito', JSON.stringify(items));
}

function total() {
  return items.reduce((acc, it) => acc + it.price * it.qty, 0);
}

function filaHTML(it) {
  return `
    <div class="carrito-item" style="padding:12px 16px">
      <span>${it.title}</span>
      <div>
        <button class="btn btn-sm" data-action="menos" data-id="${it.id}">−</button>
        <strong>${it.qty}</strong>
        <button class="btn btn-sm" data-action="mas" data-id="${it.id}">+</button>
        <button class="btn btn-sm btn-danger" data-action="borrar" data-id="${it.id}">🗑️</button>
      </div>
      <strong>${fmt.format(it.price * it.qty)}</strong>
    </div>
  `;
}

function render() {
  const cont = document.getElementById('carrito-lista');
  const totalEl = document.getElementById('carrito-total');
  cont.innerHTML = '';

  if (!items.length) {
    cont.innerHTML = `<div style="padding:16px"><p class="muted">Tu carrito está vacío.</p></div>`;
    totalEl.textContent = fmt.format(0);
    return;
  }

  items.forEach(it => cont.insertAdjacentHTML('beforeend', filaHTML(it)));
  totalEl.textContent = fmt.format(total());
}

function bindUI() {
  // Cerrar sesión
  document.getElementById('logout')?.addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.removeItem('token');
    window.location.href = './login.html';
  });

  // Controles carrito
  document.getElementById('carrito-lista').addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;
    const id = Number(btn.dataset.id);
    const action = btn.dataset.action;
    const idx = items.findIndex(x => x.id === id);
    if (idx < 0) return;

    if (action === 'mas') items[idx].qty += 1;
    if (action === 'menos') items[idx].qty > 1 ? items[idx].qty -= 1 : items.splice(idx, 1);
    if (action === 'borrar') items = items.filter(x => x.id !== id);

    guardar(); render();
  });

  // Vaciar
  document.getElementById('btn-vaciar').addEventListener('click', () => {
    items = [];
    guardar(); render();
  });

  // Finalizar compra (simulado)
  document.getElementById('btn-pagar').addEventListener('click', () => {
    const msg = document.getElementById('msg');
    if (!items.length) { msg.textContent = 'Agrega productos antes de pagar.'; return; }
    msg.textContent = 'Procesando pago (simulado)…';
    setTimeout(() => {
      msg.textContent = '¡Compra realizada! Gracias por tu pedido 🙌';
      items = [];
      guardar(); render();
    }, 800);
  });
}

window.addEventListener('DOMContentLoaded', () => {
  bindUI(); render();
});

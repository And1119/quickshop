const form = document.getElementById('form-login');
const msg = document.getElementById('login-msg');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();
  msg.textContent = 'Validando credenciales...';

  try {
    const res = await fetch('https://fakestoreapi.com/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();

    if (data.token) {
      localStorage.setItem('token', data.token);
      msg.textContent = 'Inicio de sesión exitoso 🎉';
      setTimeout(() => { window.location.href = './index.html'; }, 800);
    } else {
      msg.textContent = 'Credenciales inválidas. Intenta nuevamente.';
    }
  } catch (err) {
    console.error(err);
    msg.textContent = 'Error al conectar con el servidor.';
  }
});

// Si ya hay token, redirige al home
window.addEventListener('DOMContentLoaded', () => {
  if (localStorage.getItem('token')) {
    window.location.href = './index.html';
  }
});

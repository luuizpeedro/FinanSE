const container = document.querySelector('.container');
const signupButton = document.querySelector('.signup-section header');
const loginButton = document.querySelector('.login-section header');

loginButton.addEventListener('click', () => {
    container.classList.add('active');
});

signupButton.addEventListener('click', () => {
    container.classList.remove('active');
});

window.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('.container');

    if (window.location.hash === '#login') {
        container.classList.add('active');
    } else if (window.location.hash === '#register') {
        container.classList.remove('active');
    }
});

    document.querySelector('#form-registro').addEventListener('submit', async (e) => {
    e.preventDefault();

    const nome = document.querySelector('#nome').value;
    const email = document.querySelector('#email').value;
    const senha = document.querySelector('#senha').value;

    try {
      const registro = await fetch('/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, senha })
      });

      if (registro.ok) {
        alert('Usuário registrado com sucesso! Efetuando login...');

        //faz login automático
        const login = await fetch('/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, senha })
        });

        if (login.ok) {
          alert('Login realizado com sucesso!');
          // Redireciona para área logada
          window.top.location.href = '/dashboard.html';
        } else {
          alert('Erro ao fazer login automático.');
        }
      } else {
        const msg = await registro.text();
        alert('Erro ao registrar: ' + msg);
      }

    } catch (error) {
      console.error(error);
      alert('Erro na requisição.');
    }
  });
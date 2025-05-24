  window.addEventListener('DOMContentLoaded', async () => {
    try {
      const res = await fetch('/session');
      const logout = await fetch('/logout');
      const data = await res.json();

      if (data.logado) {
        // Esconde os botões de login e registro
        document.getElementById('loginBtn').classList.add('d-none');
        document.getElementById('registerBtn').classList.add('d-none');

        // Mostra o botão do dashboard
        document.getElementById('dashboardLink').classList.remove('d-none');
        document.getElementById('logout').classList.remove('d-none');
      } else {
        document.getElementById('loginBtn').classList.remove('d-none');
        document.getElementById('registerBtn').classList.remove('d-none');

        // Mostra o botão do dashboard
        document.getElementById('dashboardLink').classList.add('d-none');
        document.getElementById('logout').classList.add('d-none');
      }
    } catch (error) {
      console.error('Erro ao verificar sessão:', error);
    }

    document.getElementById('logout').addEventListener('click', async () => {
      try {
        await fetch('/logout');
        window.location.href = '/index.html'; // Redireciona após logout
      } catch (error) {
        console.error('Erro ao deslogar:', error);
      }
    });
  });
window.addEventListener("DOMContentLoaded", async () => {
  let oldEmail = null;

  try {
    const res = await fetch("/session");
    const data = await res.json();

    if (data.logado) {
      oldEmail = data.usuario.email;

      // Esconde os botões de login e registro
      document.getElementById("loginBtn").classList.add("d-none");
      document.getElementById("registerBtn").classList.add("d-none");

      document.getElementById("navbar1").classList.add("d-none");
      document.getElementById("navbar2").classList.remove("d-none");
      document.getElementById("navbar3").classList.remove("d-none");
      document.getElementById("navbar4").classList.remove("d-none");

      // Mostra o botão do dashboard e logout
      document.getElementById("dashboardLink").classList.remove("d-none");
      document.getElementById("logout").classList.remove("d-none");

      // Preenche os campos com os dados da sessão
      document.getElementById("name").value = data.usuario.nome;
      document.getElementById("email").value = data.usuario.email;
      document.querySelector(".user-name").textContent = data.usuario.nome;

      const primeiraLetra = data.usuario.nome.charAt(0).toUpperCase();
      document.querySelector(".user-icon span").textContent = primeiraLetra;
    } else {
      await fetch("/html/dashboard.html", {});

      // Exibe os botões de login e registro, oculta dashboard e logout
      document.getElementById("loginBtn").classList.remove("d-none");
      document.getElementById("registerBtn").classList.remove("d-none");
      document.getElementById("dashboardLink").classList.add("d-none");
      document.getElementById("logout").classList.add("d-none");
      document.getElementById("navbar1").classList.remove("d-none");
      document.getElementById("navbar2").classList.add("d-none");
      document.getElementById("navbar3").classList.add("d-none");
      document.getElementById("navbar4").classList.add("d-none");
    }
  } catch (error) {
    console.error("Erro ao verificar sessão:", error);
  }
  // Logout
  document.getElementById("logout").addEventListener("click", async () => {
    try {
      await fetch("/logout");
      window.location.href = "/index.html";
    } catch (error) {
      console.error("Erro ao deslogar:", error);
    }
  });

  const confirmBtn = document.getElementById("confirmUpdateBtn");
  if (confirmBtn) {
    confirmBtn.addEventListener("click", async () => {
      const nome = document.getElementById("name").value;
      const email = document.getElementById("email").value;
      const senha = document.getElementById("password").value;

      try {
        const res = await fetch("/atualizar-usuario", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nome, email, senha, oldEmail }),
        });

        const result = await res.json();
        if (res.ok) {
          alert("Dados atualizados com sucesso!");
          window.location.reload();
        } else {
          alert("Erro: " + result.message);
        }
      } catch (err) {
        alert("Erro de conexão.");
      }
    });
  }
});

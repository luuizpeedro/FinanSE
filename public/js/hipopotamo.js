window.addEventListener("DOMContentLoaded", async () => {
  let oldEmail = null;

  // Função auxiliar para acessar um elemento com segurança
  const get = (id) => document.getElementById(id);

  // Função auxiliar para alterar visibilidade de um grupo de elementos
  const toggleClass = (ids, className, action) => {
    ids.forEach(id => {
      const el = get(id);
      if (el) el.classList[action](className);
    });
  };

  try {
    const res = await fetch("/session");
    const data = await res.json();

    if (data.logado) {
      oldEmail = data.usuario.email;

      // Esconde login/registro, mostra funcionalidades e dados do usuário
      toggleClass(["loginBtn", "registerBtn", "iniC" ], "d-none", "add");
      toggleClass(["minhasAC", "consultaMERC", "minhaCART", "logout", "dashboardLink"], "d-none", "remove");

      if (get("name")) get("name").value = data.usuario.nome;
      if (get("email")) get("email").value = data.usuario.email;

      const userName = document.querySelector(".user-name");
      if (userName) userName.textContent = data.usuario.nome;

      const icon = document.querySelector(".user-icon span");
      if (icon) icon.textContent = data.usuario.nome.charAt(0).toUpperCase();

    } else {
      // Usuário não logado: mostra login/registro, oculta dashboard e áreas protegidas
      toggleClass(["loginBtn", "registerBtn", "logout"], "d-none", "remove");
      toggleClass(["minhasAC", "minhaCART", "dashboardLink"], "d-none", "add");
      toggleClass(["iniC", "consultaMERC"], "d-none", "remove");
    }
  } catch (error) {
    console.error("Erro ao verificar sessão:", error);
  }

  // Logout
  const logoutBtn = get("logout");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      try {
        await fetch("/logout");
        window.location.href = "/index.html";
      } catch (error) {
        console.error("Erro ao deslogar:", error);
      }
    });
  }

  // Atualização de dados do usuário
  const confirmBtn = get("confirmUpdateBtn");
  if (confirmBtn) {
    confirmBtn.addEventListener("click", async () => {
      const nome = get("name")?.value || "";
      const email = get("email")?.value || "";
      const senha = get("password")?.value || "";

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

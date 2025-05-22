<!DOCTYPE html>
<html lang="pt-br">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Minhas Ações</title>
    <!-- Bootstrap e Google Fonts -->
    <script
      src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.6/dist/js/bootstrap.bundle.min.js"
      integrity="sha384-j1CDi7MgGQ12Z7Qab0qlWQ/Qqz24Gc6BM0thvEMVjHnfYGF0rmFCozFSxQBxwHKO"
      crossorigin="anonymous"
    ></script>
    <link
      href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.6/dist/css/bootstrap.min.css"
      rel="stylesheet"
      integrity="sha384-4Q6Gf2aSP4eDXB8Miphtr37CMZZQ5oXLH2yaXMJ2w8e2ZtHTl7GptT4jmndRuHDT"
      crossorigin="anonymous"
    />
    <link
      href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500&family=Poppins:wght@400;600&display=swap"
      rel="stylesheet"
    />
    <link
      href="https://cdn.jsdelivr.net/npm/bootstrap-icons/font/bootstrap-icons.css"
      rel="stylesheet"
    />
    <link rel="stylesheet" href="./style/index.css" />
  </head>

  <body>
    <!-- Navbar -->
    <nav class="navbar navbar-expand-lg navbar-light bg-light shadow-sm">
      <div class="container">
        <a class="navbar-brand d-flex align-items-center" href="/index.html">
          <img
            src="/src/images/finance.png"
            alt="FinanSE"
            width="40"
            height="40"
          />
          <span class="ms-2 h3">FinanSE</span>
        </a>
        <div
          class="collapse navbar-collapse justify-content-center"
          id="navbarNav"
        >
          <ul class="navbar-nav">
            <li class="nav-item">
              <a class="nav-link" href="/index.html">Início</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="/src/minhasacoes.html">Minhas Ações</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="/src/consultamercado.html">Consulta Mercado</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="/src/consultacarteira.html">Consulta Carteira</a>
            </li>
          </ul>
        </div>
        <div class="d-flex ms-auto">
          <button
            class="btn btn-outline-success me-2"
            id="loginBtn"
            data-bs-toggle="modal"
            data-bs-target="#loginModal"
          >
            Login
          </button>
          <button
            class="btn btn-outline-primary"
            id="registerBtn"
            data-bs-toggle="modal"
            data-bs-target="#registerModal"
          >
            Registro
          </button>
        </div>
      </div>
    </nav>

    <!-- Seção Minhas Ações -->
    <div class="container my-5">
      <h2 class="text-center mb-4">Minhas Ações</h2>

      <!-- Tabela de Ações -->
      <div id="acoesTable" class="table-responsive">
        <table class="table table-striped table-bordered">
          <thead>
            <tr>
              <th>Código</th>
              <th>Preço Atual</th>
              <th>Quantidade</th>
              <th>Valor Total</th>
            </tr>
          </thead>
          <tbody>
            <!-- As linhas da tabela serão preenchidas via JS -->
          </tbody>
        </table>
      </div>
    </div>

    <script>
      // Função para carregar as ações e preencher a tabela
      document.addEventListener("DOMContentLoaded", function () {
        const acoesTable = document.getElementById("acoesTable").querySelector("tbody");

        // Consultar as ações armazenadas no localStorage
        const acoesSalvas = JSON.parse(localStorage.getItem("acoes")) || [];

        // Verificar se há ações salvas
        if (acoesSalvas.length > 0) {
          // Para cada ação salva, crie uma linha na tabela
          acoesSalvas.forEach((action) => {
            const row = document.createElement("tr");
            row.innerHTML = `
              <td>${action.codigo}</td>
              <td>R$ ${action.preco_atual.toFixed(2)}</td>
              <td>${action.quantidade}</td>
              <td>R$ ${(action.preco_atual * action.quantidade).toFixed(2)}</td>
            `;
            acoesTable.appendChild(row);
          });
        } else {
          // Se não houver ações salvas, mostrar uma mensagem
          const row = document.createElement("tr");
          row.innerHTML = `<td colspan="4" class="text-center">Nenhuma ação registrada.</td>`;
          acoesTable.appendChild(row);
        }
      });
    </script>
  </body>
</html>

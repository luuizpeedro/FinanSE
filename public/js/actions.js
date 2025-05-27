document.addEventListener("DOMContentLoaded", function () {
  const actionSelect = document.getElementById("actionSelect");
  const incluirBtn = document.getElementById("incluirBtn");
  const totalInvestidoElem = document.getElementById("totalInvestido");
  const totalAcoesElem = document.getElementById("totalAcoes");
  const verAcoesBtn = document.getElementById("verAcoesBtn");
  const acoesTable = document.getElementById("acoesTable");
  const themeSwitch = document.getElementById("themeSwitch");
  const body = document.body;

  if (!actionSelect || !incluirBtn || !totalInvestidoElem || !totalAcoesElem)
    return;

  fetch("/json/acoesBR.json")
    .then((response) => response.json())
    .then((data) => {
      for (let codigo in data) {
        if (data.hasOwnProperty(codigo)) {
          const option = document.createElement("option");
          option.value = codigo;
          option.textContent = codigo;
          actionSelect.appendChild(option);
        }
      }
    })
    .catch((error) => console.error("Erro ao carregar ações:", error));

  let acoesSalvas = JSON.parse(localStorage.getItem("acoes")) || [];
  acoesSalvas.forEach((action) => exibirAcao(action));

  function exibirAcao(action) {
    const container = document.querySelector(".acoes-modernas");
    if (!container) return;

    const precoAtual = parseFloat(action.preco_atual);
    const quantidade = parseInt(action.quantidade);
    const total = precoAtual * quantidade;

    const card = document.createElement("div");
    card.className = "acao-card";
    card.innerHTML = `
      <h5>${action.codigo} - ${action.nome}</h5>
      <p><strong>Preço Atual:</strong> R$ ${precoAtual.toFixed(2)}</p>
      <p><strong>Quantidade:</strong> ${quantidade}</p>
      <p class="valor-total"><strong>Total:</strong> R$ ${total.toFixed(2)}</p>
    `;
    container.appendChild(card);
    atualizarTotais();
  }

  function atualizarTotais() {
    let totalInvestido = 0;
    let totalAcoes = 0;

    acoesSalvas.forEach((acao) => {
      totalInvestido +=
        parseFloat(acao.preco_atual) * parseInt(acao.quantidade);
      totalAcoes += parseInt(acao.quantidade);
    });

    totalInvestidoElem.textContent = `R$ ${totalInvestido.toFixed(2)}`;
    totalAcoesElem.textContent = `${totalAcoes} ações`;
  }

  actionSelect.addEventListener("change", function () {
    const selectedAction = actionSelect.value;
    if (selectedAction) {
      fetch("/json/acoesBR.json")
        .then((response) => response.json())
        .then((data) => {
          const selected = data[selectedAction];
          if (selected) {
            document.getElementById("actionValue").value = selected.preco_atual;
          }
        });
    } else {
      document.getElementById("actionValue").value = "";
    }
  });

  incluirBtn.addEventListener("click", function () {
    const selectedAction = actionSelect.value;
    const quantidade = parseInt(
      document.getElementById("actionQuantity").value
    );

    if (selectedAction && quantidade > 0) {
      fetch("/json/acoesBR.json")
        .then((response) => response.json())
        .then((data) => {
          const selected = data[selectedAction];
          if (selected) {
            const newAction = {
              codigo: selectedAction,
              nome: selected.nome,
              preco_atual: parseFloat(selected.preco_atual),
              quantidade: quantidade,
            };

            acoesSalvas.push(newAction);
            localStorage.setItem("acoes", JSON.stringify(acoesSalvas));
            exibirAcao(newAction);

            document.getElementById("actionQuantity").value = "";
            actionSelect.selectedIndex = 0;
            document.getElementById("actionValue").value = "";
            closeModal();
          }
        })
        .catch((error) => console.error("Erro ao adicionar ação:", error));
    } else {
      alert("Selecione uma ação e insira uma quantidade válida.");
    }
  });

  function closeModal() {
    const modal = document.getElementById("actionModal");
    if (modal && bootstrap?.Modal?.getInstance) {
      const modalInstance = bootstrap.Modal.getInstance(modal);
      modalInstance?.hide();
    }
  }

  if (verAcoesBtn && acoesTable) {
    verAcoesBtn.addEventListener("click", function () {
      const tbody = acoesTable.querySelector("tbody");
      if (!tbody) return;

      if (
        acoesTable.style.display === "none" ||
        acoesTable.style.display === ""
      ) {
        acoesTable.style.display = "block";
        tbody.innerHTML = "";

        acoesSalvas.forEach((action) => {
          const preco = parseFloat(action.preco_atual);
          const qtd = parseInt(action.quantidade);
          const row = document.createElement("tr");
          row.innerHTML = `
            <td>${action.codigo}</td>
            <td>R$ ${preco.toFixed(2)}</td>
            <td>${qtd}</td>
            <td>R$ ${(preco * qtd).toFixed(2)}</td>
          `;
          tbody.appendChild(row);
        });
      } else {
        acoesTable.style.display = "none";
      }
    });
  }

  const toggleAcoesBtn = document.getElementById("toggleAcoesBtn");
  const acoesModernasDiv = document.querySelector(".acoes-modernas");

  if (toggleAcoesBtn && acoesModernasDiv) {
    const arrowSpan = toggleAcoesBtn.querySelector(".arrow");
    toggleAcoesBtn.addEventListener("click", function () {
      const isVisible = acoesModernasDiv.classList.contains("show");

      acoesModernasDiv.classList.toggle("show");

      toggleAcoesBtn.textContent = isVisible
        ? "Ver Minhas Ações "
        : "Ocultar Minhas Ações ";

      if (arrowSpan) {
        arrowSpan.textContent = isVisible ? "▼" : "▲";
        toggleAcoesBtn.appendChild(arrowSpan);
      }
    });
  }
});

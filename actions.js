document.addEventListener("DOMContentLoaded", function () {
  const actionSelect = document.getElementById("actionSelect");
  const incluirBtn = document.getElementById("incluirBtn");
  const resultadoDiv = document.querySelector(".Actions");
  const totalInvestidoElem = document.getElementById("totalInvestido");
  const totalAcoesElem = document.getElementById("totalAcoes");
  const verAcoesBtn = document.getElementById("verAcoesBtn"); // Botão "Ver Ações"
  const acoesTable = document.getElementById("acoesTable"); // Tabela de Ações

  fetch("acoesBR.json")
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
    .catch((error) => {
      console.error("Erro ao carregar ações:", error);
    });

  const acoesSalvas = JSON.parse(localStorage.getItem("acoes")) || [];
  acoesSalvas.forEach((action) => {
    exibirAcao(action);
  });

  function exibirAcao(action) {
    const container = document.querySelector(".acoes-modernas");

    const card = document.createElement("div");
    card.className = "acao-card";
    card.innerHTML = `
      <h5>${action.codigo} - ${action.nome}</h5>
      <p><strong>Preço Atual:</strong> R$ ${action.preco_atual.toFixed(2)}</p>
      <p><strong>Quantidade:</strong> ${action.quantidade}</p>
      <p class="valor-total"><strong>Total:</strong> R$ ${(action.preco_atual * action.quantidade).toFixed(2)}</p>
    `;

    container.appendChild(card);
    atualizarTotais();
  }

  function atualizarTotais() {
    let totalInvestido = 0;
    let totalAcoes = 0;

    acoesSalvas.forEach((acao) => {
      totalInvestido += acao.preco_atual * acao.quantidade;
      totalAcoes += parseInt(acao.quantidade);
    });

    totalInvestidoElem.textContent = `R$ ${totalInvestido.toFixed(2)}`;
    totalAcoesElem.textContent = `${totalAcoes} ações`;
  }

  actionSelect.addEventListener("change", function () {
    const selectedOption = actionSelect.options[actionSelect.selectedIndex];
    const selectedAction = selectedOption ? selectedOption.value : null;

    if (selectedAction) {
      fetch("acoesBR.json")
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
    const selectedOption = actionSelect.options[actionSelect.selectedIndex];
    const selectedAction = selectedOption ? selectedOption.value : null;
    const quantidade = document.getElementById("actionQuantity").value;

    if (selectedAction && quantidade > 0) {
      fetch("acoesBR.json")
        .then((response) => response.json())
        .then((data) => {
          const selected = data[selectedAction];
          if (selected) {
            const total = selected.preco_atual * quantidade;

            const newAction = {
              codigo: selectedAction,
              nome: selected.nome,
              preco_atual: selected.preco_atual,
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
        .catch((error) => {
          console.error("Erro ao adicionar ação:", error);
        });
    } else {
      alert("Selecione uma ação e insira uma quantidade válida.");
    }
  });

  function closeModal() {
    const modal = document.getElementById("actionModal");
    const modalInstance = bootstrap.Modal.getInstance(modal);
    modalInstance.hide();
  }

  // Função para exibir ou ocultar as ações salvas
  verAcoesBtn.addEventListener("click", function () {
    if (
      acoesTable.style.display === "none" ||
      acoesTable.style.display === ""
    ) {
      acoesTable.style.display = "block";
      // Exibir as ações na tabela
      const tbody = acoesTable.querySelector("tbody");
      tbody.innerHTML = ""; // Limpa a tabela antes de adicionar os dados

      acoesSalvas.forEach((action) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${action.codigo}</td>
          <td>R$ ${action.preco_atual.toFixed(2)}</td>
          <td>${action.quantidade}</td>
          <td>R$ ${(action.preco_atual * action.quantidade).toFixed(2)}</td>
        `;
        tbody.appendChild(row);
      });
    } else {
      acoesTable.style.display = "none";
    }
  });
});

const toggleAcoesBtn = document.getElementById("toggleAcoesBtn");
const acoesModernasDiv = document.querySelector(".acoes-modernas");
const arrowSpan = toggleAcoesBtn.querySelector(".arrow");

toggleAcoesBtn.addEventListener("click", function () {
  const isVisible = acoesModernasDiv.classList.contains("show");

  if (isVisible) {
    acoesModernasDiv.classList.remove("show");
    toggleAcoesBtn.firstChild.textContent = "Ver Minhas Ações ";
    arrowSpan.textContent = "▼";
  } else {
    acoesModernasDiv.classList.add("show");
    toggleAcoesBtn.firstChild.textContent = "Ocultar Minhas Ações ";
    arrowSpan.textContent = "▲";
  }
});


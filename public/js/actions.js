document.addEventListener("DOMContentLoaded", function () {
  const actionSelect = document.getElementById("actionSelect");
  const incluirBtn = document.getElementById("incluirBtn");
  const minhaCarteiraElem = document.getElementById("minhaCarteira");
  const saldoPositivoElem = document.getElementById("saldoPositivo");
  const saldoNegativoElem = document.getElementById("saldoNegativo");
  const totalInvestidoElem = document.getElementById("totalInvestido");
  const totalAcoesElem = document.getElementById("totalAcoes");
  const verAcoesBtn = document.getElementById("verAcoesBtn");
  const acoesTable = document.getElementById("acoesTable");

  let acoesSalvas = [];
  let totalInvestido = 0;
  let totalAcoes = 0;
  let saldoPositivo = 0;
  let saldoNegativo = 0;
  let minhaCarteira = 0;

  if (!actionSelect || !incluirBtn || !totalInvestidoElem || !totalAcoesElem)
    return;

fetch("/json/acoesBR.json")
  .then((response) => response.json())
  .then((data) => {
    acoesData = data; // salva para usar depois
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


  fetch("/papaleguas", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.acoes && Array.isArray(data.acoes)) {
        acoesSalvas = data.acoes;
        atualizarTotais(); // vai limpar e chamar exibirAcao para cada
      }
    })
    .catch((error) => {
      console.error("Erro ao buscar ações do servidor:", error);
    });

function exibirAcao(action) {
  const container = document.querySelector(".acoes-modernas");
  if (!container) return;

  const precoAtual = parseFloat(action.valor || action.preco_atual);
  const quantidade = parseInt(action.quantidade);
  const nome = action.nome || action.codigo || action.acao || "";

  if (isNaN(precoAtual) || isNaN(quantidade)) {
    console.warn("Dados inválidos ao exibir ação:", action);
    return;
  }

  const total = precoAtual * quantidade;

  const card = document.createElement("div");
  card.className = "acao-card";
  card.innerHTML = `
    <h5>${nome}</h5>
    <p><strong>Preço Atual:</strong> R$ ${precoAtual.toFixed(2)}</p>
    <p><strong>Quantidade:</strong> ${quantidade}</p>
    <p class="valor-total"><strong>Total:</strong> R$ ${total.toFixed(2)}</p>
  `;
  container.appendChild(card);
}


function atualizarTotais() {
  totalInvestido = 0;
  totalAcoes = 0;
  saldoPositivo = 0;
  saldoNegativo = 0;
  minhaCarteira = 0;

  document.querySelector(".acoes-modernas").innerHTML = "";

  acoesSalvas.forEach(action => {
    const precoAtual = parseFloat(action.valor || action.preco_atual);
    const quantidade = parseInt(action.quantidade);
    const precoSalvo = parseFloat(action.valor);
    const nome = action.nome || action.codigo || action.acao || "";

    if (isNaN(precoAtual) || isNaN(quantidade)) return;

    const total = precoAtual * quantidade;
    totalInvestido += total;
    totalAcoes += quantidade;

    const dadosAtualizados = acoesData[nome];
    const precoAtualizado = dadosAtualizados ? parseFloat(dadosAtualizados.preco_atual) : null;
    const diferenca = (precoAtualizado && !isNaN(precoSalvo)) ? precoAtualizado - precoSalvo : 0;

    if (diferenca > 0) {
      saldoPositivo += diferenca * quantidade;
    } else {
      saldoNegativo += Math.abs(diferenca) * quantidade;
    }

    exibirAcao(action);
  });

  minhaCarteira = totalInvestido + saldoPositivo - saldoNegativo;

  totalInvestidoElem.textContent = `R$ ${totalInvestido.toFixed(2)}`;
  totalAcoesElem.textContent = `${totalAcoes} ações`;
  saldoPositivoElem.textContent = `R$ ${saldoPositivo.toFixed(2)}`;
  saldoNegativoElem.textContent = `R$ ${saldoNegativo.toFixed(2)}`;
  minhaCarteiraElem.textContent = `R$ ${minhaCarteira.toFixed(2)}`;
}


function compararPrecos(acoesSalvas, acoesData) {
  return acoesSalvas.map(acao => {
    const codigo = acao.nome;  // seu código está no campo 'nome'
    const precoSalvo = parseFloat(acao.valor);
    const dadosAtualizados = acoesData[codigo];
    const precoAtualizado = dadosAtualizados ? parseFloat(dadosAtualizados.preco_atual) : null;

    if (precoAtualizado === null || isNaN(precoSalvo)) {
      return {
        codigo,
        nome: codigo,
        precoSalvo,
        precoAtualizado: null,
        diferenca: null,
        diferencaPercentual: null,
        status: 'Preço atualizado não disponível ou preço salvo inválido'
      };
    }

    const diferenca = precoAtualizado - precoSalvo;
    const diferencaPercentual = (diferenca / precoSalvo) * 100;

    return {
      codigo,
      nome: codigo,
      precoSalvo,
      precoAtualizado,
      diferenca,
      diferencaPercentual: diferencaPercentual.toFixed(2) + '%',
      status: 'OK'
    };
  });
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
  const quantidade = parseInt(document.getElementById("actionQuantity").value);

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

            // Envia nova ação para o servidor
            fetch("/papaleguas", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(newAction)
            })
              .then(response => response.json())
              .then(result => {
                acoesSalvas.push(newAction);
                exibirAcao(newAction);
                atualizarTotais();

                document.getElementById("actionQuantity").value = "";
                actionSelect.selectedIndex = 0;
                document.getElementById("actionValue").value = "";
                closeModal();
              })
              .catch((error) => console.error("Erro ao adicionar ação:", error));
          }
        })
        .catch((error) => console.error("Erro ao buscar ação selecionada:", error));
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

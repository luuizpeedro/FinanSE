document.addEventListener("DOMContentLoaded", function () {
  const actionSelect = document.getElementById("actionSelect");
  const incluirBtn = document.getElementById("incluirBtn");
  const resultadoDiv = document.querySelector(".Actions");
  const totalInvestidoElem = document.getElementById("totalInvestido");
  const totalAcoesElem = document.getElementById("totalAcoes");
  const verAcoesBtn = document.getElementById("verAcoesBtn");
  const acoesTable = document.getElementById("acoesTable");

  // Corrigir caminho do JSON
  fetch("/json/acoesBR.json")
    .then((response) => response.json())
    .then((data) => {
      // Preencher as opções no select com os códigos das ações
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

  // Função para exibir as ações
  const acoesSalvas = JSON.parse(localStorage.getItem("acoes")) || [];

  // Exibir as ações salvas na página (se existirem)
  acoesSalvas.forEach((action) => {
    exibirAcao(action);
  });

  // Função para adicionar uma nova ação
  incluirBtn.addEventListener("click", function () {
    const codigo = actionSelect.value;
    const quantidade = parseInt(document.getElementById("quantidade").value);
    const precoAtual = parseFloat(document.getElementById("precoAtual").value);
    const nome = actionSelect.options[actionSelect.selectedIndex].text;

    if (!codigo || isNaN(quantidade) || isNaN(precoAtual)) {
      alert("Por favor, preencha todos os campos corretamente.");
      return;
    }

    const novaAcao = {
      codigo,
      nome,
      preco_atual: precoAtual,
      quantidade,
    };

    // Salvar a nova ação no localStorage
    acoesSalvas.push(novaAcao);
    localStorage.setItem("acoes", JSON.stringify(acoesSalvas));

    // Exibir a nova ação na tabela
    exibirAcao(novaAcao);

    // Atualizar os totais de investimento e ações
    atualizarTotais();
  });

  // Função para exibir a ação na tabela
  function exibirAcao(action) {
    const tbody = acoesTable.querySelector("tbody");

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${action.codigo}</td>
      <td>R$ ${action.preco_atual.toFixed(2)}</td>
      <td>${action.quantidade}</td>
      <td>R$ ${(action.preco_atual * action.quantidade).toFixed(2)}</td>
    `;

    tbody.appendChild(row);
  }

  // Função para atualizar os totais de investimento e ações
  function atualizarTotais() {
    const acoesSalvas = JSON.parse(localStorage.getItem("acoes")) || [];
    let totalInvestido = 0;
    let totalAcoes = 0;

    acoesSalvas.forEach((acao) => {
      totalInvestido += acao.preco_atual * acao.quantidade;
      totalAcoes += acao.quantidade;
    });

    totalInvestidoElem.textContent = `R$ ${totalInvestido.toFixed(2)}`;
    totalAcoesElem.textContent = totalAcoes;
  }

  // Botão "Ver Ações" que recarrega as ações na tabela
  verAcoesBtn.addEventListener("click", function () {
    acoesTable.querySelector("tbody").innerHTML = ""; // Limpa a tabela
    const acoesSalvas = JSON.parse(localStorage.getItem("acoes")) || [];
    acoesSalvas.forEach((action) => {
      exibirAcao(action);
    });
    atualizarTotais(); // Atualiza os totais após visualizar
  });
});

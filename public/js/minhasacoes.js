// Função para carregar as ações e preencher a tabela
document.addEventListener("DOMContentLoaded", function () {
  const acoesTable = document
    .getElementById("acoesTable")
    .querySelector("tbody");

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

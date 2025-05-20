const modalOverlay = document.getElementById('modalOverlay');

document.querySelector('.action-btn').addEventListener('click', () => {
    modalOverlay.style.display = 'flex';
    document.body.classList.add('modal-active');
});

function closeModal() {
    modalOverlay.style.display = 'none';
    document.body.classList.remove('modal-active');
}

document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("search");
    const dataList = document.getElementById("acoes-list");
    const incluirBtn = document.getElementById("incluirBtn");
    const resultadoDiv = document.querySelector(".Actions");

    let dadosAcoes = {}; // salvar o JSON carregado
    let acaoSelecionada = null; // guarda a ação escolhida pelo usuário

    fetch('acoesBR.json')
        .then(response => response.json())
        .then(dados => {
            dadosAcoes = dados;

            for (const codigo in dadosAcoes) {
                const option = document.createElement("option");
                option.value = codigo;
                dataList.appendChild(option);
            }

            // Atualiza a variável com a ação selecionada
            searchInput.addEventListener("input", () => {
                const codigo = searchInput.value.toUpperCase();
                if (dadosAcoes[codigo]) {
                    acaoSelecionada = { codigo, ...dadosAcoes[codigo] };
                } else {
                    acaoSelecionada = null;
                }
            });

            incluirBtn.addEventListener("click", () => {
                if (acaoSelecionada) {
                    const card = document.createElement("div");
                    card.className = "card mt-3";
                    card.innerHTML = `
                        <div class="card-body">
                            <h5 class="card-title">${acaoSelecionada.codigo} - ${acaoSelecionada.nome}</h5>
                            <p class="card-text">Preço atual: R$ ${acaoSelecionada.preco_atual.toFixed(2)}</p>
                        </div>
                    `;
                    resultadoDiv.appendChild(card);

                    searchInput.value = "";
                    acaoSelecionada = null;
                    closeModal();
                } else {
                    alert("Selecione uma ação válida antes de incluir.");
                }
            });
        })
        .catch(err => {
            console.error("Erro ao carregar JSON:", err);
            resultadoDiv.innerHTML = `<p class="text-danger">Erro ao carregar os dados das ações.</p>`;
        });
});

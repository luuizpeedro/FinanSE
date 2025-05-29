document.addEventListener("DOMContentLoaded", () => {
  carregarNavbar();
  iniciarSistema();
});

function carregarNavbar() {
  fetch('/html/navbar.html')
    .then(res => res.text())
    .then(data => {
      document.getElementById('navbar').innerHTML = data;
      if (typeof setupThemeSwitch === "function") {
        setupThemeSwitch();
      }
    });
}

let currentPage = 1;
const itemsPerPage = 6;
let dataGlobal = [];

function iniciarSistema() {
  const actionContainer = document.getElementById("actionCards");
  const searchInput = document.getElementById("searchMKT");

  fetch("/json/acoesBR.json")
    .then(res => res.json())
    .then(data => {
      dataGlobal = Object.entries(data).map(([sigla, valores]) => ({
        sigla,
        nome: valores.nome,
        preco: valores.preco_atual
      }));

      renderCards(dataGlobal, currentPage);
      renderPagination(dataGlobal);
    });

  document.querySelector("input[type=submit]").addEventListener("click", () => {
    const termo = searchInput.value.toLowerCase();
    const filtrado = dataGlobal.filter(item =>
      item.nome.toLowerCase().includes(termo) ||
      item.sigla.toLowerCase().includes(termo)
    );
    currentPage = 1;
    renderCards(filtrado, currentPage);
    renderPagination(filtrado);
  });
}

function renderCards(data, page) {
  const actionContainer = document.getElementById("actionCards");
  actionContainer.innerHTML = "";

  const start = (page - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const paginatedItems = data.slice(start, end);

  const row = document.createElement("div");
  row.className = "row";

  paginatedItems.forEach(item => {
    const col = document.createElement("div");
    col.className = "col-md-4 mb-4";

    col.innerHTML = `
      <div class="card h-100">
        <div class="card-body">
          <h5 class="card-title">${item.sigla}</h5>
          <h6 class="card-subtitle mb-2 text-muted">${item.nome}</h6>
          <p class="card-text">Preço atual: R$ ${item.preco.toFixed(2)}</p>
        </div>
      </div>
    `;
    row.appendChild(col);
  });

  actionContainer.appendChild(row);
}

function renderPagination(data) {
  const paginationContainer = document.getElementById("paginationContainer");
  paginationContainer.innerHTML = ""; // limpa paginação antiga

  const totalPages = Math.ceil(data.length / itemsPerPage);

  const pagination = document.createElement("nav");
  pagination.classList.add("mt-4");
  pagination.innerHTML = `<ul class="pagination justify-content-center" id="pagination"></ul>`;
  paginationContainer.appendChild(pagination);

  const paginationList = document.getElementById("pagination");

  const createPageItem = (i, isActive = false) => {
    const pageItem = document.createElement("li");
    pageItem.className = "page-item" + (isActive ? " active" : "");
    pageItem.innerHTML = `<a class="page-link" href="#">${i}</a>`;
    pageItem.addEventListener("click", (e) => {
      e.preventDefault();
      currentPage = i;
      renderCards(data, currentPage);
      renderPagination(data);
    });
    return pageItem;
  };

  const maxVisible = 5;
  const startPage = Math.max(2, currentPage - 2);
  const endPage = Math.min(totalPages - 1, currentPage + 2);

  // Página 1 sempre visível
  paginationList.appendChild(createPageItem(1, currentPage === 1));

  if (startPage > 2) {
    const dots = document.createElement("li");
    dots.className = "page-item disabled";
    dots.innerHTML = `<span class="page-link">...</span>`;
    paginationList.appendChild(dots);
  }

  for (let i = startPage; i <= endPage; i++) {
    paginationList.appendChild(createPageItem(i, currentPage === i));
  }

  if (endPage < totalPages - 1) {
    const dots = document.createElement("li");
    dots.className = "page-item disabled";
    dots.innerHTML = `<span class="page-link">...</span>`;
    paginationList.appendChild(dots);
  }

  if (totalPages > 1) {
    paginationList.appendChild(createPageItem(totalPages, currentPage === totalPages));
  }
}
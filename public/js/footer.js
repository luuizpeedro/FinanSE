function atualizarCarrossel() {
  Promise.all([
    fetch("/json/acoesBR.json").then(res => res.json()),
    fetch("/json/acoesBR_old.json").then(res => res.json())
  ])
  .then(([dadosAtuais, dadosAntigos]) => {
    const carousel = document.getElementById('footer-acoes');
    
    // Limpa os cards antigos antes de recriar
    carousel.innerHTML = '';

    const entries = Object.entries(dadosAtuais);
    const fullEntries = entries.concat(entries); // Animação contínua

    fullEntries.forEach(([codigo, infoAtual]) => {
      const precoAtual = infoAtual.preco_atual;
      const precoAntigo = dadosAntigos[codigo]?.preco_atual;

      let cor = 'white';
      let variacaoText = '';
      let seta = '';

      if (precoAntigo !== undefined) {
        const diferenca = precoAtual - precoAntigo;
        const variacao = ((diferenca / precoAntigo) * 100).toFixed(2);
        if (diferenca > 0) {
          cor = 'lightgreen';
          seta = '▲';
          variacaoText = `+${variacao}%`;
        } else if (diferenca < 0) {
          cor = 'red';
          seta = '▼';
          variacaoText = `${variacao}%`;
        } else {
          variacaoText = '0.00%';
        }
      }

      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <h3>${codigo}</h3>
        <p>
          R$ ${precoAtual.toFixed(2)}
          <span style="color: ${cor}; font-weight: bold; margin-left: 8px;">
            ${variacaoText} ${seta}
          </span>
        </p>
      `;
      carousel.appendChild(card);
    });
  })
  .catch(err => {
    console.error('Erro ao carregar os arquivos JSON:', err);
  });
}

// Atualiza na primeira vez
atualizarCarrossel();

// Atualiza a cada 1 minuto (60.000 ms)
setInterval(atualizarCarrossel, 20 * 60 * 1000);

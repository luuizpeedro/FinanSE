const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();
const port = 3000;

// Usar middleware para processar requisições com dados JSON
app.use(express.json());
app.use(express.static(path.join(__dirname, "public"))); // Para servir arquivos estáticos

// Função para ler o arquivo JSON de ações
function lerAcoes() {
  return new Promise((resolve, reject) => {
    fs.readFile(
      path.join(__dirname, "acoesatual.json"),
      "utf-8",
      (err, data) => {
        if (err) {
          return reject("Erro ao ler o arquivo de ações");
        }
        try {
          const acoes = JSON.parse(data);
          resolve(acoes);
        } catch (e) {
          reject("Erro ao processar o arquivo de ações");
        }
      }
    );
  });
}

// Função para salvar as ações no arquivo JSON
function salvarAcoes(acoes) {
  return new Promise((resolve, reject) => {
    const acoesString = JSON.stringify(acoes, null, 2); // Formatar como JSON
    fs.writeFile(
      path.join(__dirname, "acoesatual.json"),
      acoesString,
      (err) => {
        if (err) {
          return reject("Erro ao salvar as ações no arquivo");
        }
        resolve("Ações salvas com sucesso!");
      }
    );
  });
}

// Rota para ler as ações salvas
app.get("/ler-acoes", (req, res) => {
  lerAcoes()
    .then((acoes) => res.json(acoes))
    .catch((error) => res.status(500).json({ message: error }));
});

// Rota para salvar as ações enviadas
app.post("/salvar-acoes", (req, res) => {
  const acoes = req.body.acoes;
  salvarAcoes(acoes)
    .then((message) => res.json({ message }))
    .catch((error) => res.status(500).json({ message: error }));
});

// Iniciar o servidor na porta 3000
app.listen(port, () => {
  console.log(`Servidor rodando de forma local na porta: ${port}`);
});

const express = require("express");
const path = require("path");

const app = express();
const port = 5500;

// Serve arquivos estáticos da pasta 'public' (css, js, html)
app.use(express.static(path.join(__dirname, "public")));

// Rota para acessar o arquivo JSON
app.get("/json/acoesBR.json", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "json", "acoesBR.json"));
});

// Rota para o arquivo index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Rota para o arquivo minhasacoes.html
app.get("/minhasacoes", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "minhasacoes.html"));
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});

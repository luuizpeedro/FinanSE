import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import pg from "pg";
import session from "express-session";
import bcrypt from "bcrypt";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// PostgreSQL
const { Pool } = pg;
const connectionString = 'postgresql://neondb_owner:npg_i4scOlfmbXe7@ep-winter-cake-acwstti3-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require';
const pool = new Pool({ connectionString });

// Função para query com valores
async function query(text, values = []) {
  const client = await pool.connect();
  try {
    const res = await client.query(text, values);
    return res;
  } catch (err) {
    throw err;
  } finally {
    client.release();
  }
}

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: 'Passarinho Gorduxo',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 }
}));

app.use(express.static(path.join(__dirname, "public")));

// 🔐 Registro de Usuário
app.post('/registro', async (req, res) => {
  const { nome, email, senha } = req.body;
  if (!nome || !email || !senha) return res.status(400).json({ message: "Preencha todos os campos." });

  try {
    const hash = await bcrypt.hash(senha, 10);
    const { rows } = await query(
      `INSERT INTO usuarios (nome, email, senha) VALUES ($1, $2, $3) RETURNING *`,
      [nome, email, hash]
    );
    console.log('Usuário registrado:', rows[0]);
    res.status(200).json({ message: 'Usuário registrado com sucesso!' });
  } catch (err) {
    console.error('Erro ao registrar:', err);
    res.status(500).send('Erro ao registrar usuário');
  }
});

// 🔐 Login
app.post('/login', async (req, res) => {
  const { email, senha } = req.body;
  if (!email || !senha) return res.status(400).send("Campos obrigatórios.");

  try {
    const { rows } = await query(`SELECT * FROM usuarios WHERE email = $1`, [email]);
    const user = rows[0];
    if (!user) return res.status(401).send("Usuário não encontrado.");

    const match = await bcrypt.compare(senha, user.senha);
    if (!match) return res.status(401).send("Senha incorreta.");

    req.session.usuario = {
      id: user.id,
      nome: user.nome,
      email: user.email,
      logado: true
    };
    res.json({ sucesso: true, redirecionar: '/html/dashboard.html' });
  } catch (err) {
    console.error('Erro ao logar:', err);
    res.status(500).send('Erro interno do servidor');
  }
});

// Logout
app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Erro ao destruir sessão:', err);
      return res.status(500).send('Erro ao deslogar');
    }
    res.clearCookie('connect.sid');
    res.redirect('/index.html');
  });
});

// Verificação de sessão
app.get('/session', (req, res) => {
  if (req.session.usuario) {
    res.json({ logado: true, usuario: req.session.usuario });
  } else {
    res.json({ logado: false });
  }
});

// Rota protegida
app.get('/html/dashboard.html', (req, res) => {
  if (req.session.usuario.logado) {
    return res.sendFile(path.join(__dirname, 'public/html/dashboard.html'));
  } else {
    return res.redirect('/index.html');
  }
});

// JSON: Ler e salvar ações
function lerAcoes() {
  return new Promise((resolve, reject) => {
    fs.readFile(path.join(__dirname, "acoesatual.json"), "utf-8", (err, data) => {
      if (err) return reject("Erro ao ler o arquivo de ações");
      try {
        resolve(JSON.parse(data));
      } catch (e) {
        reject("Erro ao processar o arquivo de ações");
      }
    });
  });
}

function salvarAcoes(acoes) {
  return new Promise((resolve, reject) => {
    fs.writeFile(
      path.join(__dirname, "acoesatual.json"),
      JSON.stringify(acoes, null, 2),
      err => err ? reject("Erro ao salvar ações") : resolve("Ações salvas com sucesso!")
    );
  });
}

app.get("/ler-acoes", async (req, res) => {
  try {
    const acoes = await lerAcoes();
    res.json(acoes);
  } catch (error) {
    res.status(500).json({ message: error });
  }
});

app.post("/salvar-acoes", async (req, res) => {
  const { acoes } = req.body;
  try {
    const message = await salvarAcoes(acoes);
    res.json({ message });
  } catch (error) {
    res.status(500).json({ message: error });
  }
});

// Atualizar dados do usuário
app.post("/atualizar-usuario", async (req, res) => {
  const { nome, email, senha, oldEmail } = req.body;

  try {
    const { rows } = await query("SELECT id FROM usuarios WHERE email = $1", [oldEmail]);
    if (rows.length === 0) return res.status(404).json({ message: "Usuário não encontrado." });

    const userId = rows[0].id;

    let updateQuery = "UPDATE usuarios SET nome = $1, email = $2";
    const values = [nome, email];

    if (senha) {
      const hashedSenha = await bcrypt.hash(senha, 10);
      updateQuery += ", senha = $3";
      values.push(hashedSenha);
    }

    updateQuery += " WHERE id = $4";
    values.push(userId);

    await query(updateQuery, values);

    req.session.usuario.nome = nome;
    req.session.usuario.email = email;

    res.json({ message: "Usuário atualizado com sucesso." });
  } catch (err) {
    console.error("Erro ao atualizar usuário:", err);
    res.status(500).json({ message: "Erro ao atualizar dados." });
  }
});

// Start
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});

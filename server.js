import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import pg from "pg";
import session from "express-session";

// Configuração de caminho com ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// PostgreSQL
const { Pool } = pg;
const connectionString = 'postgresql://neondb_owner:npg_i4scOlfmbXe7@ep-winter-cake-acwstti3-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require';
const pool = new Pool({ connectionString });

async function query(q) {
  const client = await pool.connect();
  let res;
  try {
    await client.query('BEGIN');
    try {
      res = await client.query(q);
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    }
  } finally {
    client.release();
  }
  return res;
}

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Sessão
app.use(session({
  secret: 'Passarinho Gorduxo',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 } // 1 hora
}));

// Arquivos estáticos
app.use(express.static(path.join(__dirname, "public")));

// Rota de Registro
app.post('/registro', async (req, res) => {
  const { nome, email, senha } = req.body;
  try {
    const query = `
      INSERT INTO usuarios (nome, email, senha)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    const values = [nome, email, senha];
    const { rows } = await pool.query(query, values);
    console.log('Usuário inserido:', rows[0]);
    res.status(200).json({ message: 'Usuário registrado com sucesso!' });
  } catch (err) {
    console.error('Erro ao registrar:', err);
    res.status(500).send('Erro ao registrar usuário');
  }
});

// Rota de Login
app.post('/login', async (req, res) => {
  const { email, senha } = req.body;
  try {
    const query = `SELECT * FROM usuarios WHERE email = $1 AND senha = $2;`;
    const values = [email, senha];
    const { rows } = await pool.query(query, values);
    if (rows.length > 0) {
      req.session.usuario = {
        id: rows[0].id,
        nome: rows[0].nome,
        email: rows[0].email,
        logado: true
      };
      console.log('Login bem-sucedido:', req.session.usuario);
      res.json({ sucesso: true, redirecionar: '/html/dashboard.html' });
    } else {
      res.status(401).send('Credenciais inválidas.');
    }
  } catch (err) {
    console.error('Erro ao logar:', err);
    res.status(500).send('Erro interno do servidor');
  }
});

// Rota de Logout
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

// Verifica se está logado (AJAX)
app.get('/session', (req, res) => {
  if (req.session.usuario) {
    res.json({ logado: true, usuario: req.session.usuario });
  } else {
    res.json({ logado: false });
  }
});

// ⚠️ ROTA PROTEGIDA: Dashboard
app.get('/html/dashboard.html', (req, res) => {
  if (req.session.usuario && req.session.usuario.logado) {
    return res.sendFile(path.join(__dirname, 'public/html/dashboard.html'));
  } else {
    return res.redirect('/index.html');
  }
});

// JSON: Leitura de ações
function lerAcoes() {
  return new Promise((resolve, reject) => {
    fs.readFile(
      path.join(__dirname, "acoesatual.json"),
      "utf-8",
      (err, data) => {
        if (err) return reject("Erro ao ler o arquivo de ações");
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

// JSON: Salvar ações
function salvarAcoes(acoes) {
  return new Promise((resolve, reject) => {
    const acoesString = JSON.stringify(acoes, null, 2);
    fs.writeFile(path.join(__dirname, "acoesatual.json"), acoesString, (err) => {
      if (err) return reject("Erro ao salvar as ações no arquivo");
      resolve("Ações salvas com sucesso!");
    });
  });
}

// Rota para ler ações
app.get("/ler-acoes", async (req, res) => {
  try {
    const acoes = await lerAcoes();
    res.json(acoes);
  } catch (error) {
    res.status(500).json({ message: error });
  }
});

// Rota para salvar ações
app.post("/salvar-acoes", async (req, res) => {
  const { acoes } = req.body;
  try {
    const message = await salvarAcoes(acoes);
    res.json({ message });
  } catch (error) {
    res.status(500).json({ message: error });
  }
});

// Iniciar servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});

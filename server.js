import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import pg from "pg";
import session from "express-session";

// Configuração do caminho com ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// PostgreSQL
const { Pool } = pg;
const connectionString = 'postgresql://neondb_owner:npg_i4scOlfmbXe7@ep-winter-cake-acwstti3-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require';
const pool = new Pool({ connectionString });
async function query (q) {
    const client = await pool.connect();
    let res
    try {
        await client.query('BEGIN');
        try {
            res = await client.query(q)
            await client.query('COMMIT')
        } catch (err) {
            await client.query('ROLLBACK')
            throw err
        }
    } finally {
        client.release();
    }
    return res
};

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: 'Passarinho Gorduxo',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 1 } // 1 hora logado
}));

// Rota para lidar com o registro
app.post('/registro', async (req, res) => {
  const { nome, email, senha } = req.body;

  try {
    const myQuery = `
      INSERT INTO usuarios (nome, email, senha)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    const values = [nome, email, senha];
    const { rows } = await pool.query(myQuery, values);

    console.log('Usuário inserido:', rows[0]);
    res.status(200).json({ message: 'Usuário registrado com sucesso!' });
  } catch (err) {
    console.error('Erro ao inserir no banco:', err);
    res.status(500).send('Erro ao registrar usuário');
  }
});

app.post('/login', async (req, res) => {
  const { email, senha } = req.body;

  try {
    const myQuery = `
      SELECT * FROM usuarios
      WHERE email = $1 AND senha = $2;
    `;
    const values = [email, senha];
    const { rows } = await pool.query(myQuery, values);

    if (rows.length > 0) {
      const usuario = rows[0];

      // aqui salva os dados da sessão
      req.session.usuario = {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email
      };

      console.log('Login bem-sucedido:', req.session.usuario);
      res.send('Login realizado com sucesso!');
    } else {
      res.status(401).send('Credenciais inválidas.');
    }
  } catch (err) {
    console.error('Erro ao realizar login:', err);
    res.status(500).send('Erro interno do servidor');
  }
});

app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).send('Erro ao sair');
    res.clearCookie('connect.sid'); // limpa o cookie da sessão
    res.send('Logout realizado com sucesso.');
  });
});

app.get('/sessao', (req, res) => {
  if (req.session.usuario) {
    res.json(req.session.usuario);
  } else {
    res.status(401).json({ erro: 'Usuário não está logado.' });
  }
});

app.get('/dashboard', (req, res) => {
  if (!req.session.usuario) {
    return res.status(401).send('Acesso negado. Faça login.');
  }

  res.send(`Bem-vindo, ${req.session.usuario.nome}!`);
});


// JSON: Ler ações
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

// Rota para ler
app.get("/ler-acoes", async (req, res) => {
  try {
    const acoes = await lerAcoes();
    res.json(acoes);
  } catch (error) {
    res.status(500).json({ message: error });
  }
});

// Rota para salvar
app.post("/salvar-acoes", async (req, res) => {
  const { acoes } = req.body;
  try {
    const message = await salvarAcoes(acoes);
    res.json({ message });
  } catch (error) {
    res.status(500).json({ message: error });
  }
});

// Start
app.listen(port, () => {
  console.log(`Servidor rodando localmente na porta ${port}`);
});

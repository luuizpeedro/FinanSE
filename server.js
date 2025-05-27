import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import pg from "pg";
import session from "express-session";
import bcrypt from "bcrypt";
import yahooFinance from 'yahoo-finance2';


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

app.use('/protegido', (req, res, next) => {
  if (!req.session.usuario?.logado) {
    return res.redirect('/index.html');
  }
  next();
});

app.use(express.static(path.join(__dirname, "public")));

// DAQ PRA CIMA N MEXER EM NADA :D XD


// ######################################################################### //
// INICIO
// Função para extrair as ações br
async function atualizarAcoesBrasil() {
  try {
    // Obs: Yahoo finance usa ".SA" para ações da bolsa br.
    const simbolos = [
      "AALR3.SA",
      "ABCB4.SA",
      "ABEV3.SA",
      "ADHM3.SA",
      // adicionar resto das ações
    ];

    // armazena as ações
    const acoesData = {};

    // Buscar dados para cada símbolo
    for (const simbolo of simbolos) {
      try {
        const result = await yahooFinance.quoteSummary(simbolo, { modules: ['price'] });
        const price = result.price.regularMarketPrice;
        let nome = result.price.longName || result.price.shortName || simbolo; // tenta longName, se não shortName, senão símbolo

        // Limpar espaços
        nome = nome.replace(/\s+/g, ' ').trim();

        if (price !== undefined && nome) {
          const key = simbolo.replace('.SA', '');
          acoesData[key] = {
            nome,
            preco_atual: price
          };
        }
      } catch (e) {
        console.warn(`Erro ao buscar dados para ${simbolo}:`, e.message);
      }
    }

    // Salvar arquivo JSON
    await salvarAcoes(acoesData);

    console.log(`[${new Date().toLocaleString()}] Ações brasileiras atualizadas com sucesso.`);
  } catch (error) {
    console.error('Erro ao atualizar ações brasileiras:', error);
  }
}

// executa a função atualizarAcoesBrasil
atualizarAcoesBrasil();

// Agendar para rodar a cada 1 minuto
setInterval(atualizarAcoesBrasil, 10 * 60 * 100);

// get rota para executar
app.get('/acoes-brasil', async (req, res) => {
  try {
    const acoes = await lerAcoes(); // lerAcoes lê o arquivo "acoesBR.json"
    res.json(acoes);
  } catch (error) {
    res.status(500).json({ message: error });
  }
});

// FIM
// ######################################################################### //


// ######################################################################### //
// INICIO


// Verificação de sessão
app.get('/session', (req, res) => {
  if (req.session.usuario) {
    res.json({ logado: true, usuario: req.session.usuario });
  } else {
    res.json({ logado: false });
  }
});

// FIM
// ######################################################################### //


// ######################################################################### //
// INICIO

//  Registro de Usuário
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

// FIM
// ######################################################################### //

// ######################################################################### //
// INICIO

//  Login
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
    res.json({ sucesso: true, redirecionar: '/protegido/dashboard.html' });
  } catch (err) {
    console.error('Erro ao logar:', err);
    res.status(500).send('Erro interno do servidor');
  }
});

// FIM
// ######################################################################### //



// ######################################################################### //
// INICIO
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

// FIM
// ######################################################################### //


// INICIO

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

//FIM



// INICIO
function salvarAcoes(acoes) {
  return new Promise((resolve, reject) => {
    fs.writeFile(
      path.join(__dirname, 'public', 'json', "acoesBR.json"),
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



// Criar arquivo de log com data
const logFileName = `log_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.txt`;
const logFilePath = path.join(__dirname, logFileName);
const logStream = fs.createWriteStream(logFilePath, { flags: 'a' });

// Sobrescreve os métodos de console para também escrever no arquivo
const originalLog = console.log;
const originalError = console.error;
const originalWarn = console.warn;

console.log = (...args) => {
  const output = args.map(arg => typeof arg === 'string' ? arg : JSON.stringify(arg)).join(' ');
  logStream.write(`[LOG - ${new Date().toLocaleString()}] ${output}\n`);
  originalLog(...args);
};

console.error = (...args) => {
  const output = args.map(arg => typeof arg === 'string' ? arg : JSON.stringify(arg)).join(' ');
  logStream.write(`[ERROR - ${new Date().toLocaleString()}] ${output}\n`);
  originalError(...args);
};

console.warn = (...args) => {
  const output = args.map(arg => typeof arg === 'string' ? arg : JSON.stringify(arg)).join(' ');
  logStream.write(`[WARN - ${new Date().toLocaleString()}] ${output}\n`);
  originalWarn(...args);
};

// Fecha o log ao sair da aplicação
process.on('exit', () => {
  logStream.end();
});

// Start
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});

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
        'AALR3.SA', 'ABCB4.SA', 'ABEV3.SA', 'ADHM3.SA', 'AERI3.SA', 'AFLT3.SA', 'AGRO3.SA', 'AGXY3.SA', 'AHEB3.SA', 'AHEB5.SA', 'AHEB6.SA', 'ALLD3.SA', 'ALOS3.SA', 'ALPA3.SA', 'ALPA4.SA', 'ALPK3.SA', 'ALUP11.SA', 'ALUP3.SA', 'ALUP4.SA', 'AMAR3.SA', 'AMBP3.SA', 'AMER3.SA', 'AMOB3.SA', 'ANIM3.SA', 'APTI4.SA', 'ARML3.SA', 'ASAI3.SA', 'ATED3.SA', 'ATMP3.SA', 'AURA33.SA', 'AURE3.SA', 'AVLL3.SA', 'AZEV3.SA', 'AZEV4.SA', 'AZTE3.SA', 'AZUL4.SA', 'AZZA3.SA', 'B3SA3.SA', 'BALM3.SA', 'BALM4.SA', 'BAUH4.SA', 'BAZA3.SA', 'BBAS3.SA', 'BBDC3.SA', 'BBDC4.SA', 'BBSE3.SA', 'BDLL3.SA', 'BDLL4.SA', 'BEEF3.SA', 'BEES3.SA', 'BEES4.SA', 'BGIP3.SA', 'BGIP4.SA', 'BHIA3.SA', 'BIED3.SA', 'BIOM3.SA', 'BLAU3.SA', 'BMEB3.SA', 'BMEB4.SA', 'BMGB4.SA', 'BMIN3.SA', 'BMIN4.SA', 'BMKS3.SA', 'BMOB3.SA', 'BNBR3.SA', 'BOBR3.SA', 'BOBR4.SA', 'BPAC11.SA', 'BPAC3.SA', 'BPAC5.SA', 'BPAN4.SA', 'BPAR3.SA', 'BPHA3.SA', 'BRAP3.SA', 'BRAP4.SA', 'BRAV3.SA', 'BRBI11.SA', 'BRFS3.SA', 'BRGE11.SA', 'BRGE12.SA', 'BRGE3.SA', 'BRGE5.SA', 'BRGE6.SA', 'BRGE7.SA', 'BRGE8.SA', 'BRIV3.SA', 'BRIV4.SA', 'BRKM3.SA', 'BRKM5.SA', 'BRKM6.SA', 'BRPR3.SA', 'BRSR3.SA', 'BRSR5.SA', 'BRSR6.SA', 'BRST3.SA', 'BSLI3.SA', 'BSLI4.SA', 'CALI3.SA', 'CAMB3.SA', 'CAML3.SA', 'CASH3.SA', 'CASN3.SA', 'CBAV3.SA', 'CBEE3.SA', 'CCTY3.SA', 'CEAB3.SA', 'CEBR3.SA', 'CEBR5.SA', 'CEBR6.SA', 'CEDO3.SA', 'CEDO4.SA', 'CEEB3.SA', 'CEEB5.SA', 'CEED3.SA', 'CEED4.SA', 'CEGR3.SA', 'CGAS3.SA', 'CGAS5.SA', 'CGRA3.SA', 'CGRA4.SA', 'CLSC3.SA', 'CLSC4.SA', 'CMIG3.SA', 'CMIG4.SA', 'CMIN3.SA', 'COCE3.SA', 'COCE5.SA', 'COCE6.SA', 'COGN3.SA', 'CORR3.SA', 'CORR4.SA', 'CPFE3.SA', 'CPLE3.SA', 'CPLE5.SA', 'CPLE6.SA', 'CRFB3.SA', 'CRIV3.SA', 'CRIV4.SA', 'CRPG3.SA', 'CRPG5.SA', 'CRPG6.SA', 'CSAN3.SA', 'CSED3.SA', 'CSMG3.SA', 'CSNA3.SA', 'CSUD3.SA', 'CTKA3.SA', 'CTKA4.SA', 'CTNM3.SA', 'CTNM4.SA', 'CTSA3.SA', 'CTSA4.SA', 'CURY3.SA', 'CVCB3.SA', 'CXSE3.SA', 'CYRE3.SA', 'DASA3.SA', 'DESK3.SA', 'DEXP3.SA', 'DEXP4.SA', 'DIRR3.SA', 'DMFN3.SA', 'DMVF3.SA', 'DOHL3.SA', 'DOHL4.SA', 'DOTZ3.SA', 'DTCY3.SA', 'DXCO3.SA', 'EALT3.SA', 'EALT4.SA', 'ECOR3.SA', 'ECPR3.SA', 'ECPR4.SA', 'EGIE3.SA', 'EKTR3.SA', 'EKTR4.SA', 'ELET3.SA', 'ELET5.SA', 'ELET6.SA', 'ELMD3.SA', 'EMAE4.SA', 'EMBR3.SA', 'ENEV3.SA', 'ENGI11.SA', 'ENGI3.SA', 'ENGI4.SA', 'ENJU3.SA', 'ENMT3.SA', 'ENMT4.SA', 'EPAR3.SA', 'EQMA3B.SA', 'EQPA3.SA', 'EQPA5.SA', 'EQPA6.SA', 'EQPA7.SA', 'EQTL3.SA', 'ESPA3.SA', 'ESTR3.SA', 'ESTR4.SA', 'ETER3.SA', 'EUCA3.SA', 'EUCA4.SA', 'EVEN3.SA', 'EZTC3.SA', 'FESA3.SA', 'FESA4.SA', 'FHER3.SA', 'FICT3.SA', 'FIEI3.SA', 'FIGE3.SA', 'FIGE4.SA', 'FIQE3.SA', 'FLRY3.SA', 'FRAS3.SA', 'FRIO3.SA', 'GEPA3.SA', 'GEPA4.SA', 'GFSA3.SA', 'GGBR3.SA', 'GGBR4.SA', 'GGPS3.SA', 'GMAT3.SA', 'GOAU3.SA', 'GOAU4.SA', 'GOLL4.SA', 'GPAR3.SA', 'GPIV33.SA', 'GRND3.SA', 'GSHP3.SA', 'GUAR3.SA', 'HAGA3.SA', 'HAGA4.SA', 'HAPV3.SA', 'HBOR3.SA', 'HBRE3.SA', 'HBSA3.SA', 'HBTS5.SA', 'HETA3.SA', 'HETA4.SA', 'HOOT4.SA', 'HYPE3.SA', 'IFCM3.SA', 'IGTI11.SA', 'IGTI3.SA', 'INEP3.SA', 'INEP4.SA', 'INTB3.SA', 'IRBR3.SA', 'ISAE3.SA', 'ISAE4.SA', 'ITSA3.SA', 'ITSA4.SA', 'ITUB3.SA', 'ITUB4.SA', 'JALL3.SA', 'JBSS3.SA', 'JFEN3.SA', 'JHSF3.SA', 'JOPA3.SA', 'JOPA4.SA', 'JSLG3.SA', 'KEPL3.SA', 'KLBN11.SA', 'KLBN3.SA', 'KLBN4.SA', 'LAND3.SA', 'LAVV3.SA', 'LEVE3.SA', 'LIGT3.SA', 'LIPR3.SA', 'LJQQ3.SA', 'LOGG3.SA', 'LOGN3.SA', 'LPSB3.SA', 'LREN3.SA', 'LUPA3.SA', 'LUXM3.SA', 'LUXM4.SA', 'LVTC3.SA', 'LWSA3.SA', 'MAPT3.SA', 'MAPT4.SA', 'MATD3.SA', 'MBLY3.SA', 'MDIA3.SA', 'MDNE3.SA', 'MEAL3.SA', 'MELK3.SA', 'MERC3.SA', 'MERC4.SA', 'MGEL3.SA', 'MGEL4.SA', 'MGLU3.SA', 'MILS3.SA', 'MLAS3.SA', 'MMAQ3.SA', 'MMAQ4.SA', 'MNDL3.SA', 'MNPR3.SA', 'MOAR3.SA', 'MOTV3.SA', 'MOVI3.SA', 'MRFG3.SA', 'MRSA3B.SA', 'MRSA5B.SA', 'MRSA6B.SA', 'MRVE3.SA', 'MSPA3.SA', 'MSPA4.SA', 'MTRE3.SA', 'MTSA4.SA', 'MULT3.SA', 'MWET3.SA', 'MWET4.SA', 'MYPK3.SA', 'NEOE3.SA', 'NEXP3.SA', 'NGRD3.SA', 'NORD3.SA', 'NTCO3.SA', 'NUTR3.SA', 'ODER4.SA', 'ODPV3.SA', 'OFSA3.SA', 'OIBR3.SA', 'OIBR4.SA', 'ONCO3.SA', 'OPCT3.SA', 'ORVR3.SA', 'OSXB3.SA', 'PATI3.SA', 'PATI4.SA', 'PCAR3.SA', 'PDGR3.SA', 'PDTC3.SA', 'PEAB3.SA', 'PEAB4.SA', 'PETR3.SA', 'PETR4.SA', 'PETZ3.SA', 'PFRM3.SA', 'PGMN3.SA', 'PINE3.SA', 'PINE4.SA', 'PLAS3.SA', 'PLPL3.SA', 'PMAM3.SA', 'PNVL3.SA', 'POMO3.SA', 'POMO4.SA', 'PORT3.SA', 'POSI3.SA', 'PRIO3.SA', 'PRNR3.SA', 'PSSA3.SA', 'PTBL3.SA', 'PTNT3.SA', 'PTNT4.SA', 'QUAL3.SA', 'RADL3.SA', 'RAIL3.SA', 'RAIZ4.SA', 'RANI3.SA', 'RAPT3.SA', 'RAPT4.SA', 'RCSL3.SA', 'RCSL4.SA', 'RDNI3.SA', 'RDOR3.SA', 'REAG3.SA', 'RECV3.SA', 'REDE3.SA', 'RENT3.SA', 'RNEW11.SA', 'RNEW3.SA', 'RNEW4.SA', 'ROMI3.SA', 'RPAD3.SA', 'RPAD5.SA', 'RPAD6.SA', 'RPMG3.SA', 'RSID3.SA', 'RSUL4.SA', 'SANB11.SA', 'SANB3.SA', 'SANB4.SA', 'SAPR11.SA', 'SAPR3.SA', 'SAPR4.SA', 'SBFG3.SA', 'SBSP3.SA', 'SCAR3.SA', 'SEER3.SA', 'SEQL3.SA', 'SGPS3.SA', 'SHOW3.SA', 'SHUL4.SA', 'SIMH3.SA', 'SLCE3.SA', 'SLED3.SA', 'SLED4.SA', 'SMFT3.SA', 'SMTO3.SA', 'SNSY5.SA', 'SOJA3.SA', 'SOND3.SA', 'SOND5.SA', 'SOND6.SA', 'SRNA3.SA', 'STBP3.SA', 'SUZB3.SA', 'SYNE3.SA', 'TAEE11.SA', 'TAEE3.SA', 'TAEE4.SA', 'TASA3.SA', 'TASA4.SA', 'TCSA3.SA', 'TECN3.SA', 'TEKA3.SA', 'TEKA4.SA', 'TELB3.SA', 'TELB4.SA', 'TEND3.SA', 'TENE5.SA', 'TFCO4.SA', 'TGMA3.SA', 'TIMS3.SA', 'TKNO4.SA', 'TOTS3.SA', 'TPIS3.SA', 'TRAD3.SA', 'TRIS3.SA', 'TTEN3.SA', 'TUPY3.SA', 'TXRX3.SA', 'TXRX4.SA', 'UCAS3.SA', 'UGPA3.SA', 'UNIP3.SA', 'UNIP5.SA', 'UNIP6.SA', 'USIM3.SA', 'USIM5.SA', 'USIM6.SA', 'VALE3.SA', 'VAMO3.SA', 'VBBR3.SA', 'VITT3.SA', 'VIVA3.SA', 'VIVR3.SA', 'VIVT3.SA', 'VLID3.SA', 'VSPT3.SA', 'VSPT4.SA', 'VSTE3.SA', 'VTRU3.SA', 'VULC3.SA', 'VVEO3.SA', 'WEGE3.SA', 'WEST3.SA', 'WHRL3.SA', 'WHRL4.SA', 'WIZC3.SA', 'WLMM3.SA', 'WLMM4.SA', 'YDUQ3.SA', 'ZAMP3.SA'
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

// Agendar para rodar a cada 15 minuto
setInterval(atualizarAcoesBrasil, 15 * 60 * 1000);

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
    const jsonDir = path.join(__dirname, 'public', 'json');
    const atualPath = path.join(jsonDir, "acoesBR.json");
    const oldPath = path.join(jsonDir, "acoesBR_old.json");

    // Verifica se o arquivo atual existe para renomeá-lo
    fs.access(atualPath, fs.constants.F_OK, (err) => {
      if (!err) {
        // Se existir, renomeia para acoesBR_old.json (substituindo, se já existir)
        fs.rename(atualPath, oldPath, (renameErr) => {
          if (renameErr) return reject("Erro ao renomear arquivo antigo");
          escreverNovoArquivo();
        });
      } else {
        // Se o arquivo não existir, apenas escreve o novo
        escreverNovoArquivo();
      }
    });

    function escreverNovoArquivo() {
      fs.writeFile(
        atualPath,
        JSON.stringify(acoes, null, 2),
        err => err ? reject("Erro ao salvar ações") : resolve("Ações salvas com sucesso!")
      );
    }
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

app.post('/addAcao', async (req, res) => {
  const { actionSelect, actionValue, actionQuantity } = req.body;
  //console.log('req.body:', req.body);

  if (!actionSelect || !actionValue || !actionQuantity) {
    return res.status(400).send("Campos obrigatórios.");
  }

  if (!req.session.usuario?.id) {
    return res.status(401).send("Usuário não autenticado.");
  }

  const { id: userID, nome, email } = req.session.usuario;

  const agora = new Date();

  const ano = agora.getFullYear();
  const mes = String(agora.getMonth() + 1).padStart(2, '0');
  const dia = String(agora.getDate()).padStart(2, '0');

  const horas = String(agora.getHours()).padStart(2, '0');
  const minutos = String(agora.getMinutes()).padStart(2, '0');
  const segundos = String(agora.getSeconds()).padStart(2, '0');

  const dataFormatada = `${ano}-${mes}-${dia} ${horas}:${minutos}:${segundos}`;

  try {
    //console.log("Id usuário:", userID, "Nome:", nome, "E-mail:", email, "Ação:", actionSelect, "Valor:", actionValue, "Quantidade:", actionQuantity);
      const { rows } = await query(
      `INSERT INTO acoes (idusuario, acao, valor, quantidade, datacompra) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [userID, actionSelect, actionValue, actionQuantity, dataFormatada]
    );
    return res.status(200).json({ message: 'Ação adicionada com sucesso!' });
  } catch (err) {
    console.error('Erro ao adicionar ação:', err);
    res.status(500).send('Erro interno do servidor');
  }
});


app.post("/papaleguas", async (req, res) => {
  const { id: userID } = req.session.usuario;
  try {
    const { rows } = await query("SELECT * FROM acoes WHERE idusuario = $1", [userID]);

    const acoesFormatadas = rows.map(a => ({
      nome: a.acao, // "PETR4"
      valor: parseFloat(a.valor), // 33.45
      quantidade: a.quantidade,   // 10
      datacompra: a.datacompra    // opcional
    }));

    res.status(200).json({ acoes: acoesFormatadas });
  } catch (err) {
    console.error("Erro ao buscar ações:", err);
    res.status(500).json({ message: "Erro ao buscar ações." });
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

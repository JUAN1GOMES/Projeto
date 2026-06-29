const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const { engine } = require("express-handlebars");
const session = require("express-session");

const sequelize = require("./config/bd");
const Usuario = require("./models/Usuario.model");

const app = express();

app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", "./views");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

app.use(session({
  secret: "batata-secret",
  resave: false,
  saveUninitialized: true
}));

const db = new sqlite3.Database("./salas.db");

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS salas(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT,
      usuario TEXT,
      horario TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS horarios(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario TEXT,
      sala TEXT,
      entrada TEXT,
      saida TEXT,
      duracao INTEGER,
      objetivo TEXT,
      observacao TEXT
    )
  `);
});

const salasPadrao = [];

for (let i = 1; i <= 16; i++) salasPadrao.push(`Sala ${i}`);
for (let i = 1; i <= 8; i++) salasPadrao.push(`Laboratório ${i}`);

db.get("SELECT COUNT(*) total FROM salas", (err, row) => {
  if (!err && row.total === 0) {
    const stmt = db.prepare("INSERT INTO salas(nome,usuario,horario) VALUES(?, '', '')");
    salasPadrao.forEach(nome => stmt.run(nome));
    stmt.finalize();
  }
});

(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
  } catch (e) {
    console.log(e);
  }
})();

app.get("/", (req, res) => {
  res.render("cadastrarUsuario");
});

app.post("/usuarios", async (req, res) => {
  const { nome, email, idade } = req.body;
  await Usuario.create({ nome, email, idade });
  req.session.usuario = nome;
  res.redirect("/horario");
});

app.get("/usuarios", async (req, res) => {
  const usuarios = await Usuario.findAll({ raw: true });
  res.render("usuarios", { usuarios });
});

app.get("/usuarios/editar/:id", async (req, res) => {
  const usuario = await Usuario.findByPk(req.params.id, { raw: true });

  if (!usuario) {
    return res.status(404).send("Usuário não encontrado");
  }

  req.session.usuario = usuario.nome;

  res.render("editarUsuario", { usuario });
});
app.post("/usuarios/editar", async (req, res) => {
  const { id, nome, email, idade } = req.body;

  await Usuario.update(
    { nome, email, idade },
    { where: { id } }
  );
  req.session.usuario = nome;

  res.redirect("/usuarios");
});

app.post("/usuarios/remover/:id", async (req, res) => {
  await Usuario.destroy({ where: { id: req.params.id } });
  res.redirect("/usuarios");
});

app.get("/horario", (req, res) => {
  if (!req.session.usuario) return res.redirect("/");
  res.render("horario");
});

app.post("/sessao/horario", (req, res) => {
  req.session.inicio = req.body.inicio;
  req.session.fim = req.body.fim;
  res.sendStatus(200);
});

app.get("/sessao", (req, res) => {
  if (!req.session.usuario) return res.status(401).send("Sem sessão");
  res.json({
    usuario: req.session.usuario,
    inicio: req.session.inicio,
    fim: req.session.fim
  });
});

app.get("/salas", (req, res) => {
  db.all("SELECT * FROM salas ORDER BY id", (err, rows) => {
    if (err) return res.status(500).send(err.message);
    res.json(rows);
  });
});

app.post("/reservar", (req, res) => {
  const { id } = req.body;
  const usuario = req.session.usuario;
  const inicio = req.session.inicio;
  const fim = req.session.fim;

  if (!usuario || !inicio || !fim) return res.redirect("/");

  db.get("SELECT * FROM salas WHERE id=?", [id], (err, sala) => {
    if (err || !sala) return res.status(500).send("Erro");
    if (sala.usuario) return res.status(400).send("Sala ocupada");

    const horario = `${inicio} - ${fim}`;

    db.run(
      "UPDATE salas SET usuario=?,horario=? WHERE id=?",
      [usuario, horario, id],
      (err2) => {
        if (err2) return res.status(500).send(err2.message);

        db.run(
          `INSERT INTO horarios(usuario,sala,entrada,saida,duracao,objetivo,observacao)
           VALUES(?,?,?,?,?,?,?)`,
          [usuario, sala.nome, inicio, fim, 0, "Reserva", ""]
        );

        res.sendStatus(200);
      }
    );
  });
});

app.post("/liberar", (req, res) => {
  db.run(
    "UPDATE salas SET usuario='',horario='' WHERE id=?",
    [req.body.id],
    (err) => {
      if (err) return res.status(500).send(err.message);
      res.sendStatus(200);
    }
  );
});

app.get("/horarios", (req, res) => {
  db.all("SELECT * FROM horarios ORDER BY id DESC", (err, rows) => {
    if (err) return res.status(500).send(err.message);
    res.json(rows);
  });
});

app.get("/batata", (req, res) => {
  res.sendFile(__dirname + "/public/batata.html");
});

app.use((req, res) => {
  res.status(404).send("Página não encontrada.");
});

app.listen(3000, () => {
  console.log("Servidor rodando em http://localhost:3000");
});

app.get("/", (req, res) => {
  res.render("cadastrarUsuario");
});

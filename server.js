const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

const db = new sqlite3.Database('./salas.db');

db.run(`
CREATE TABLE IF NOT EXISTS salas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT,
    usuario TEXT,
    horario_fim TEXT
)
`);

const salasPadrao = [
    "Sala 1","Sala 2","Sala 3","Sala 4","Sala 5","Sala 6","Sala 7","Sala 8",
    "Sala 9","Sala 10","Sala 11","Sala 12","Sala 13","Sala 14","Sala 15","Sala 16",
    "Lab 1","Lab 2","Lab 3","Lab 4","Lab 5","Lab 6","Lab 7","Lab 8"
];

db.serialize(() => {
    db.get("SELECT COUNT(*) as total FROM salas", (err, row) => {
        if (err) return;

        if (row.total === 0) {
            const stmt = db.prepare(
                "INSERT INTO salas (nome, usuario, horario_fim) VALUES (?, '', '')"
            );

            salasPadrao.forEach(nome => stmt.run(nome));
            stmt.finalize();
        }
    });
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.get('/salas', (req, res) => {
    db.all("SELECT * FROM salas", (err, rows) => {
        if (err) return res.status(500).send(err.message);
        res.json(rows);
    });
});

app.post('/reservar', (req, res) => {
    const { id, usuario, horario_fim } = req.body;

    if (!id || !usuario || !horario_fim) {
        return res.status(400).send("Dados inválidos");
    }

    db.get(
        "SELECT * FROM salas WHERE id = ?",
        [id],
        (err, sala) => {
            if (err) return res.status(500).send(err.message);

            if (!sala) {
                return res.status(404).send("Sala não encontrada");
            }

            if (sala.usuario !== "") {
                return res.status(400).send("Sala ocupada");
            }

            db.run(
                "UPDATE salas SET usuario = ?, horario_fim = ? WHERE id = ?",
                [usuario, horario_fim, id],
                (err) => {
                    if (err) return res.status(500).send(err.message);
                    res.sendStatus(200);
                }
            );
        }
    );
});

app.post('/liberar', (req, res) => {
    const { id } = req.body;

    db.run(
        "UPDATE salas SET usuario = '', horario_fim = '' WHERE id = ?",
        [id],
        (err) => {
            if (err) return res.status(500).send(err.message);
            res.sendStatus(200);
        }
    );
});

setInterval(() => {
    const agora = new Date().toISOString();

    db.run(
        `
        UPDATE salas
        SET usuario = '',
            horario_fim = ''
        WHERE horario_fim <> ''
        AND horario_fim <= ?
        `,
        [agora]
    );
}, 60000);

app.listen(3000, () => {
    console.log("Servidor rodando em http://localhost:3000");
});
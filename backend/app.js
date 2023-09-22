const express = require('express');
const app = express();
const mysql = require('mysql2');
const cors = require('cors');

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const os = require('os');

// Configurar o middleware CORS para permitir todas as origens
app.use(cors());

// Resto da configuração do servidor...

app.use(express.json());

const connection = mysql.createConnection({
    host: 'localhost', // Endereço do servidor MySQL
    user: 'root', // Nome de usuário do MySQL
    password: 'root', // Senha do MySQL
    database: 'saveFace', // Nome do banco de dados
});

app.get("/login/:email/:password", async (req, res) => {
    const sqlQuery = `SELECT * FROM users where email = ${req.params.email} AND typeUser ='visitant'`;

    connection.query(sqlQuery, (err, results) => {
        if (err) {
            console.error('Erro na consulta SQL:', err);
            res.status(500).json({ error: 'Erro ao consultar o banco de dados.' });
        } else {
            res.json(results);
        }
    })
})

app.get("/visitant/:id", async (req, res) => {
    const sqlQuery = `SELECT * FROM users where residentId = ${req.params.id} AND typeUser ='visitant'`;

    connection.query(sqlQuery, (err, results) => {
        if (err) {
            console.error('Erro na consulta SQL:', err);
            res.status(500).json({ error: 'Erro ao consultar o banco de dados.' });
        } else {
            res.json(results);
        }
    })
})

app.get("/image/:serialNumber", async (req, res) => {
    const sqlQuery = `SELECT image FROM image where serialNumber = ${req.params.serialNumber}`;

    connection.query(sqlQuery, (err, results) => {
        if (err) {
            console.error('Erro na consulta SQL:', err);
            res.status(500).json({ error: 'Erro ao consultar o banco de dados.' });
        } else {
            res.json(results);
        }
    })
})

app.delete("/user/:id", async (req, res) => {
    const sqlQuery = `DELETE FROM users WHERE id = ${req.params.id};`;
    connection.query(sqlQuery, (err, results) => {
        if (err) {
            console.error('Erro na consulta SQL:', err);
            res.status(500).json({ error: 'Erro ao consultar o banco de dados.' });
        } else {
            res.json(results);
        }
    })
})

app.post("/visitant", async (req, res) => {
    const sqlQuery = `INSERT INTO users (residentId, name, phone, image, typeUser) VALUES (${req.body.residentId}, "${req.body.name}", "${req.body.phone}", "${req.body.image[0]}", "visitant");`;
    connection.query(sqlQuery, (err, results) => {
        if (err) {
            console.error('Erro na consulta SQL:', err);
            res.status(500).json({ error: 'Erro ao consultar o banco de dados.' });
        } else {
            res.json(results);
        }
    })
})

app.post("/img", async (req, res) => {
    const sqlQuery = `INSERT INTO image (userId, image, serialNumber) VALUES (${req.body.userId}, "${req.body.image}", "${req.body.serialNumber}");`;
    connection.query(sqlQuery, (err, results) => {
        if (err) {
            console.error('Erro na consulta SQL:', err);
            res.status(500).json({ error: 'Erro ao consultar o banco de dados.' });
        } else {
            res.json(results);
        }
    })
})

app.post("/user", async (req, res) => {
    const sqlQueryResident = `INSERT INTO users (email, address) VALUES ("${req.body.email}", "${req.body.address}");`;
    connection.query(sqlQueryResident, (err, results) => {
        if (err) {
            console.error('Erro na consulta SQL:', err);
            res.status(500).json({ error: 'Erro ao consultar o banco de dados.' });
        } else {
            //res.json(results);
            const sqlQueryUser = `INSERT INTO users (residentId, name, phone, typeUser, image) VALUES (${results.data.id}, "${req.body.name}", "${req.body.phone}", "visitant", "${req.body.image}");`;
            connection.query(sqlQueryUser, (err, results) => {
                if (err) {
                    console.error('Erro na consulta SQL:', err);
                    res.status(500).json({ error: 'Erro ao consultar o banco de dados.' });
                } else {
                    res.json(results);
                }
            })
        }
    })
})

app.post("/creat", (req, res) => {
    const downloadsPath = path.join(os.homedir(), 'Downloads');

    const pastaPai = '../faceApi/labels';
    const novaPasta = req.body.nomeUser;
    const currentDirectory = process.cwd();
    const dbUsersPath = path.join(currentDirectory, '../faceApi/labels', novaPasta);

    function createDir() {
        const caminhoCompleto = path.join(pastaPai, novaPasta);
        if (!fs.existsSync(caminhoCompleto)) {
            fs.mkdirSync(caminhoCompleto);
            console.log('Usuário(diretório) cadastrado com sucesso.');
        } else {
            console.log('Usuário(diretório) já existe.');
        }
        const json = fs.readdirSync('../faceApi/labels');
        const jsonString = JSON.stringify(json, null, 2);
        fs.writeFileSync('dados.json', jsonString);
        moveCapture();
    }

    function moveCapture() {
        const padraoNome = /^captured_image(?: \(\d+\))?\.png$/;
        const arquivosDownload = fs.readdirSync(downloadsPath);
        for (const arquivo of arquivosDownload) {
            const caminhoArquivo = path.join(downloadsPath, arquivo);
            if (fs.statSync(caminhoArquivo).isFile() && padraoNome.test(arquivo)) {
                const novoCaminho = path.join(dbUsersPath, arquivo);
                fs.renameSync(caminhoArquivo, novoCaminho);
                console.log(`Arquivo ${arquivo} movido para ${dbUsersPath}`);
            }
        }
        rename();
    }

    function rename() {
        const arquivosPng = fs.readdirSync(dbUsersPath).filter(arquivo => arquivo.endsWith('.png'));
        arquivosPng.sort();
        let contador = 1;
        for (const nomeAtual of arquivosPng) {
            if (nomeAtual !== ('1.png' && '2.png' && '3.png' && '4.png' && '5.png' && '6.png' && '7.png' && '8.png' && '9.png' && '10.png')) {
                const novoNome = `${contador}.png`;
                const caminhoAtual = path.join(dbUsersPath, nomeAtual);
                const caminhoNovo = path.join(dbUsersPath, novoNome);
                fs.renameSync(caminhoAtual, caminhoNovo);
                console.log(`Arquivo ${nomeAtual} renomeado para ${novoNome}`);
                contador++;
            }
        }
    }

    createDir();
})
app.use(express.static(path.join(__dirname, '../faceApi/labels/gu')));

app.get("/visitant", async (req, res) => {
    const label = fs.readdirSync("../faceApi/labels");
    const labelDir = path.join(__dirname, '../faceApi/labels');
    const visitant = []
    label.map(async (label) => {//retorna os descritores das pessoas a serem identificadas

        const imagePath = path.join(labelDir, label, '1.png');
        const img = fs.readFileSync(imagePath);
        visitant.push({
            name: label,
            img: img
        })
    })
    res.json(visitant);
})

app.delete("/visitant/:name", async (req, res) => {
    fs.rmdirSync(`../faceApi/labels/${req.params.name}/`, { recursive: true });
    const json = fs.readdirSync('../faceApi/labels');
    const jsonString = JSON.stringify(json, null, 2);
    fs.writeFileSync('dados.json', jsonString);
})


app.listen(8080, () => {
    console.log("Servidor iniciado na porta 8080: http://localhost:8080");
});
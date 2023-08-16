const express = require('express');
const app = express();
const mysql = require('mysql2');

const cors = require('cors');

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

app.listen(8080, () => {
    console.log("Servidor iniciado na porta 8080: http://localhost:8080");
});
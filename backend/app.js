const express = require('express');
const app = express();
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const os = require('os');

app.use(cors());

app.use(express.json());

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
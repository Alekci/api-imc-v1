const express = require('express');
const db = require('./db')
const app = express()
const port = 3000
app.use(express.json())

//Função para IMC
function calcularIMC(peso, altura) {
    const resultado = peso / (altura * altura);
    const imc = parseFloat(resultado.toFixed(2));
    let status = "";
    if (imc < 18.5) {
        status = "Abaixo do peso normal";
    } else if (imc < 25) {
        status = "Peso normal";
    } else if (imc < 30) {
        status = "Excesso de peso";
    } else {
        status = "Obesidade";
    }
    return { imc, status };
}

app.get('/', (req, res) => {
    res.send('Hello World!')
})
app.get('/teste2', (req, res) => {
    res.send('Testado com sucesso!')
})
app.get('/prontuarios', async (req, res) => {
    try {
        const [rows] = await db.execute("SELECT * FROM pacientes");
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({
            mensagem: "Erro interno do servidor!",
            detalhes: error.message
        })
    }
})
app.get('/pacientes/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await db.execute("SELECT * FROM pacientes WHERE id = ?", [id]);
        if (rows.length === 0) {
            return res.status(404).json({
                mensagem: "Pacientes não encontrado!",
                detalhes: error.message
            });
        }
        res.status(200).json(rows[0]);
    } catch (error) {
        res.status(500).json({
            mensagem: "Erro interno do servidor!",
            detalhes: error.message
        })
    }
})
app.post('/pacientes', async (req, res) => {
    const { nome, idade, altura, peso, telefone, endereco } = req.body;
    if (!nome || !idade || !telefone || !endereco || !altura || !peso) {
        return res.status(400).json({
            mensagem: "Bad Request!",
            detalhes: "Todos os campos são obrigatórios!"
        });
    }
    const { imc, status } = calcularIMC(Number(peso), Number(altura));
    try {
        const [resultado] = await db.execute("INSERT INTO pacientes (nome, idade, telefone, endereco, altura, peso, imc, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", [nome, idade, telefone, endereco, altura, peso, imc, status]);
        res.status(201).json({
            id: resultado.insertId,
            nome,
            idade,
            telefone,
            endereco,
            altura,
            peso,
            imc,
            status
        });
    } catch (error) {
        res.status(500).json({
            mensagem: "Erro interno do servidor!",
            detalhes: error.message
        })
    }
});

app.delete('/pacientes/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await db.execute("DELETE FROM pacientes WHERE id = ?", [id]);
        if (rows.affectedRows === 0) {
            return res.status(404).json({
                mensagem: "Pacientes não encontrado!",
                detalhes: error.message
            });
        }
        res.status(200).json({
            mensagem: "Pacientes removido com sucesso."
        });
    } catch (error) {
        res.status(500).json({
            mensagem: "Erro interno do servidor!",
            detalhes: error.message
        })
    }
})

app.put('/pacientes/:id', async (req, res) => {
    const { id } = req.params;
    const { nome, idade, telefone, endereco, altura, peso } = req.body;
    if (!nome || !idade || !telefone || !endereco || !altura || !peso) {
        res.status(400).json({
            mensagem: " Solicitação Inválida!",
            detalhes: error.message
        });
    }
    const { imc, status } = calcularIMC(Number(peso), Number(altura));
    try {
        const [resultado] = await db.execute("UPDATE `pacientes` SET `nome` = ?, `idade` = ?,`telefone` = ?, `endereco` = ?, `altura` = ?, `peso` = ?, `imc` = ?, `status` = ? WHERE `pacientes`.`id` = ?;", [nome, idade, telefone, endereco, altura, peso, imc, status, id]);
        if (resultado.affectedRows === 0) {
            return res.status(404).json({ mensagem: "Paciente não encontrado!" });
        }
        res.status(200).json({ mensagem: "Paciente atualizado com sucesso." })
    } catch (error) {
        res.status(500).json({
            mensagem: "Erro interno do servidor!",
            detalhes: error.message
        });
    }
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
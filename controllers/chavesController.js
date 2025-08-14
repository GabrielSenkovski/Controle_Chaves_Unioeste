// Importa o Model, que contém a lógica de negócio
const ChavesModel = require('../models/chavesModel');

// Controller para buscar dados iniciais usado em retirada.js
const getDadosIniciais = (req, res) => {
    try {
        const todasAsChaves = ChavesModel.getTodasAsChaves();
        const retiradasAtivas = ChavesModel.getEstadoAtual();
        const codigosChavesOcupadas = new Set(retiradasAtivas.map(r => r.codigoChave));

        const chavesAtualizadas = todasAsChaves.map(chave => {
            if (codigosChavesOcupadas.has(chave.id)) {
                return { ...chave, status: "Ocupada" };
            }
            return chave;
        });
        
        res.json({ chaves: chavesAtualizadas });
    } catch (error) {
        res.status(500).json({ message: "Erro ao carregar dados iniciais." });
    }
};

// Controller para buscar o estado atual (usado em devolucao.js)
const getEstado = (req, res) => {
    try {
        const retiradasAtivas = ChavesModel.getEstadoAtual();
        res.json(retiradasAtivas);
    } catch (error) {
        res.status(500).json({ message: "Erro ao buscar estado das chaves." });
    }
};

// Controller para registrar uma retirada
const registrarRetirada = (req, res) => {
    try {
        const novaRetirada = req.body;
        const retiradaCriada = ChavesModel.registrarNovaRetirada(novaRetirada);
        res.status(201).json({ message: "Retirada registrada com sucesso!", data: retiradaCriada });
    } catch (error) {
        // Erro 409 indica um conflito (ex: chave já retirada)
        res.status(409).json({ message: error.message });
    }
};

// Controller para registrar uma devolução
const registrarDevolucao = (req, res) => {
    try {
        const { codigoChave } = req.body;
        const resultado = ChavesModel.registrarNovaDevolucao(codigoChave);
        res.json(resultado);
    } catch (error) {
        // Erro 404 indica que o recurso não foi encontrado (chave não estava na lista)
        res.status(404).json({ message: error.message });
    }
};

module.exports = {
    getDadosIniciais,
    getEstado,
    registrarRetirada,
    registrarDevolucao
};
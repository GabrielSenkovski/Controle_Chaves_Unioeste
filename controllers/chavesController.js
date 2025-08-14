const ChavesModel = require('../models/chavesModel');

class ChavesController {
    // O construtor agora recebe uma instância do Model
    constructor(chavesModel) {
        this.chavesModel = chavesModel;

        // 'this' para garantir que ele funcione corretamente nas rotas do Express
        this.getDadosIniciais = this.getDadosIniciais.bind(this);
        this.getEstado = this.getEstado.bind(this);
        this.registrarRetirada = this.registrarRetirada.bind(this);
        this.registrarDevolucao = this.registrarDevolucao.bind(this);
    }

    // Cada função é um método que usa 'this.chavesModel'
    getDadosIniciais(req, res) {
        try {
            const todasAsChaves = this.chavesModel.getTodasAsChaves();
            const retiradasAtivas = this.chavesModel.getEstadoAtual();
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
    }

    getEstado(req, res) {
        try {
            const retiradasAtivas = this.chavesModel.getEstadoAtual();
            res.json(retiradasAtivas);
        } catch (error) {
            res.status(500).json({ message: "Erro ao buscar estado das chaves." });
        }
    }

    registrarRetirada(req, res) {
        try {
            const novaRetirada = req.body;
            const retiradaCriada = this.chavesModel.registrarNovaRetirada(novaRetirada);
            res.status(201).json({ message: "Retirada registrada com sucesso!", data: retiradaCriada });
        } catch (error) {
            res.status(409).json({ message: error.message });
        }
    }

    registrarDevolucao(req, res) {
        try {
            const { codigoChave } = req.body;
            const resultado = this.chavesModel.registrarNovaDevolucao(codigoChave);
            res.json(resultado);
        } catch (error) {
            res.status(404).json({ message: error.message });
        }
    }
}

// Exporta a classe inteira
module.exports = ChavesController;
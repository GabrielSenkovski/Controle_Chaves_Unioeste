const fs = require('fs');
const path = require('path');

class ChavesModel {
    constructor() {
        // O construtor define os caminhos para os arquivos de dados
        this.estadoAtualPath = path.join(__dirname, '..', 'data', 'estado_atual.json');
        this.chavesMasterPath = path.join(__dirname, '..', 'data', 'chaves_master.json');
    }

    // Funções (metodos)
    getEstadoAtual() {
        if (fs.existsSync(this.estadoAtualPath)) {
            const dados = fs.readFileSync(this.estadoAtualPath, 'utf8');
            return dados ? JSON.parse(dados) : [];
        }
        return [];
    }

    setEstadoAtual(dados) {
        const dadosString = JSON.stringify(dados, null, 2);
        fs.writeFileSync(this.estadoAtualPath, dadosString, 'utf8');
    }

    getTodasAsChaves() {
        if (fs.existsSync(this.chavesMasterPath)) {
            const dados = fs.readFileSync(this.chavesMasterPath, 'utf8');
            return JSON.parse(dados);
        }
        return [];
    }

    registrarNovaRetirada(novaRetirada) {
        // 'this' chamar outros métodos da mesma classe
        const retiradasAtivas = this.getEstadoAtual();
        const chaveJaRetirada = retiradasAtivas.some(r => r.codigoChave === novaRetirada.codigoChave);
        
        if (chaveJaRetirada) {
            throw new Error("Erro: Esta chave já está registrada como ocupada.");
        }
        
        retiradasAtivas.push(novaRetirada);
        this.setEstadoAtual(retiradasAtivas);
        return novaRetirada;
    }

    registrarNovaDevolucao(codigoChave) {
        let retiradasAtivas = this.getEstadoAtual();
        const tamanhoOriginal = retiradasAtivas.length;

        const novasRetiradasAtivas = retiradasAtivas.filter(retirada => retirada.codigoChave !== codigoChave);

        if (tamanhoOriginal === novasRetiradasAtivas.length) {
            throw new Error("Erro: Chave não encontrada na lista de retiradas ativas.");
        }

        this.setEstadoAtual(novasRetiradasAtivas);
        return { message: "Devolução registrada com sucesso!" };
    }
}

// Exporta a classe inteira
module.exports = ChavesModel;
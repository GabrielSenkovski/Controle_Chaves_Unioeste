const fs = require('fs');
const path = require('path');

// Caminhos para os arquivos de dados
const estadoAtualPath = path.join(__dirname, '..', 'data', 'estado_atual.json');
const chavesMasterPath = path.join(__dirname, '..', 'data', 'chaves_master.json');

// Função para ler o estado atual das retiradas
const getEstadoAtual = () => {
    if (fs.existsSync(estadoAtualPath)) {
        const dados = fs.readFileSync(estadoAtualPath, 'utf8');
        return dados ? JSON.parse(dados) : [];
    }
    return [];
};

// Função para escrever no estado atual
const setEstadoAtual = (dados) => {
    const dadosString = JSON.stringify(dados, null, 2);
    fs.writeFileSync(estadoAtualPath, dadosString, 'utf8');
};

// Função para ler a lista mestra de chaves
const getTodasAsChaves = () => {
    if (fs.existsSync(chavesMasterPath)) {
        const dados = fs.readFileSync(chavesMasterPath, 'utf8');
        return JSON.parse(dados);
    }
    return [];
};

// Lógica de negócio para registrar uma nova retirada
const registrarNovaRetirada = (novaRetirada) => {
    const retiradasAtivas = getEstadoAtual();
    const chaveJaRetirada = retiradasAtivas.some(r => r.codigoChave === novaRetirada.codigoChave);
    
    if (chaveJaRetirada) {
        throw new Error("Erro: Esta chave já está registrada como ocupada.");
    }
    
    retiradasAtivas.push(novaRetirada);
    setEstadoAtual(retiradasAtivas);
    return novaRetirada;
};

// Lógica de negócio para registrar uma devolução
const registrarNovaDevolucao = (codigoChave) => {
    let retiradasAtivas = getEstadoAtual();
    const tamanhoOriginal = retiradasAtivas.length;

    const novasRetiradasAtivas = retiradasAtivas.filter(retirada => retirada.codigoChave !== codigoChave);

    if (tamanhoOriginal === novasRetiradasAtivas.length) {
        throw new Error("Erro: Chave não encontrada na lista de retiradas ativas.");
    }

    setEstadoAtual(novasRetiradasAtivas);
    return { message: "Devolução registrada com sucesso!" };
};

// Exporta as funções para serem usadas pelo Controller
module.exports = {
    getEstadoAtual,
    getTodasAsChaves,
    registrarNovaRetirada,
    registrarNovaDevolucao
};
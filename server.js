// Passo 1: Importar as bibliotecas necessárias
const express = require('express'); // Para criar o servidor
const fs = require('fs');           // Para ler e escrever arquivos (File System)
const path = require('path');       // Para lidar com caminhos de arquivos de forma segura

// Passo 2: Inicializar o servidor e definir a porta
const app = express();
const PORT = 3000; // A porta em que nosso servidor vai rodar

// Caminho para o nosso "banco de dados" JSON
const dbPath = path.join(__dirname, 'estado_atual.json');

// --- Funções Auxiliares para ler e escrever no "banco de dados" ---

// Função para ler os dados do arquivo JSON
function lerBancoDeDados() {
    try {
        // Verifica se o arquivo existe
        if (fs.existsSync(dbPath)) {
            const dados = fs.readFileSync(dbPath, 'utf8');
            // Se o arquivo estiver vazio, retorna um array vazio
            return dados ? JSON.parse(dados) : [];
        }
        // Se o arquivo não existe, retorna um array vazio
        return [];
    } catch (error) {
        console.error("Erro ao ler o banco de dados:", error);
        return []; // Retorna um array vazio em caso de erro
    }
}

// Função para escrever os dados no arquivo JSON
function escreverNoBancoDeDados(dados) {
    try {
        // Converte o objeto/array JavaScript para uma string JSON formatada
        const dadosString = JSON.stringify(dados, null, 2);
        fs.writeFileSync(dbPath, dadosString, 'utf8');
    } catch (error) {
        console.error("Erro ao escrever no banco de dados:", error);
    }
}


// Passo 3: Configurar os "Middlewares"
// Middleware para o servidor entender requisições com corpo em JSON
app.use(express.json()); 
// Middleware para servir os arquivos estáticos (HTML, CSS, JS do frontend) da pasta 'public'
app.use(express.static(path.join(__dirname, 'public')));


// Passo 4: Criar as Rotas da API

// Rota GET para buscar todos os dados iniciais (chaves e solicitantes)
app.get('/api/dados-iniciais', (req, res) => {
    // 1. Esta é a nossa lista "mestra" de todas as chaves que existem.
    const todasAsChaves = [
        { id: "SALA101-A", descricao: "Sala de Aula 101 Bloco A", status: "Disponível" },
        { id: "LABINF03", descricao: "Laboratório de Informática 03", status: "Disponível" }, // Status padrão é Disponível
        { id: "AUDITORIO", descricao: "Auditório Principal", status: "Disponível" },
        { id: "SALA205-B", descricao: "Sala de Reuniões 205 Bloco B", status: "Reservada" },
        { id: "BIBLIO01", descricao: "Chave Geral Biblioteca", status: "Disponível" }
    ];

    // 2. Lemos o estado atual real do nosso "banco de dados" de retiradas.
    const retiradasAtivas = lerBancoDeDados();

    // 3. Criamos um conjunto (Set) com os códigos das chaves ativas para uma busca rápida.
    const codigosChavesOcupadas = new Set(retiradasAtivas.map(retirada => retirada.codigoChave));

    // 4. Mapeamos a lista mestra para criar uma nova lista com os status atualizados.
    const chavesAtualizadas = todasAsChaves.map(chave => {
        // Se o código da chave estiver no nosso conjunto de chaves ocupadas...
        if (codigosChavesOcupadas.has(chave.id)) {
            // ...retornamos a chave com o status "Ocupada".
            return { ...chave, status: "Ocupada" };
        }
        // ...caso contrário, retornamos a chave com seu status original.
        return chave;
    });

    // 5. Preparamos os dados finais para enviar ao frontend.
    const dados = {
        chaves: chavesAtualizadas, // Enviamos a lista com os status corretos
        solicitantes: [
            { idMatriculaSiape: "654321", nome: "Maria Souza", vinculo: "servidor", cursoSetor: "Secretaria Geral", telefone: "(45) 98877-6655" },
            { idMatriculaSiape: "123456", nome: "João da Silva", vinculo: "aluno", cursoSetor: "Engenharia da Computação", telefone: "(45) 99999-8888" }
        ]
        // Mantivemos a lista de solicitantes como estava, pois ela é estática por enquanto.
    };

    res.json(dados);
});
// Rota POST para registrar uma nova retirada
app.post('/api/retirada', (req, res) => {
    const novaRetirada = req.body;
    const retiradasAtivas = lerBancoDeDados();

    // Validação simples: verifica se a chave já foi retirada
    const chaveJaRetirada = retiradasAtivas.some(retirada => retirada.codigoChave === novaRetirada.codigoChave);
    if (chaveJaRetirada) {
        // Retorna um erro 409 (Conflito) se a chave já estiver ocupada
        return res.status(409).json({ message: "Erro: Esta chave já está registrada como ocupada." });
    }

    // Adiciona a nova retirada à lista
    retiradasAtivas.push(novaRetirada);
    escreverNoBancoDeDados(retiradasAtivas);

    // Retorna uma mensagem de sucesso 201 (Criado)
    res.status(201).json({ message: "Retirada registrada com sucesso!", data: novaRetirada });
});

// Rota POST para registrar uma devolução
app.post('/api/devolucao', (req, res) => {
    const { codigoChave } = req.body; // Pega apenas o código da chave do corpo da requisição
    let retiradasAtivas = lerBancoDeDados();

    // Filtra a lista, mantendo apenas as chaves que NÃO foram devolvidas
    const novasRetiradasAtivas = retiradasAtivas.filter(retirada => retirada.codigoChave !== codigoChave);

    // Verifica se alguma chave foi realmente removida
    if (retiradasAtivas.length === novasRetiradasAtivas.length) {
        // Retorna um erro 404 (Não Encontrado) se a chave não estava na lista de retiradas
        return res.status(404).json({ message: "Erro: Chave não encontrada na lista de retiradas ativas." });
    }

    escreverNoBancoDeDados(novasRetiradasAtivas);

    // Retorna uma mensagem de sucesso
    res.json({ message: "Devolução registrada com sucesso!" });
});


// Passo 5: Iniciar o Servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Acesse o sistema em: http://localhost:${PORT}`);
});
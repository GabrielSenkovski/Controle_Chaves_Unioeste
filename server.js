const express = require('express');
const path = require('path');
const chavesController = require('./controllers/chavesController'); // Importa o Controller

const app = express();
const PORT = 3000;

// Configuração dos Middlewares
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// --- Camada de Roteamento ---
// Define quais funções do Controller respondem a quais rotas da API
app.get('/api/dados-iniciais', chavesController.getDadosIniciais);
app.get('/api/estado', chavesController.getEstado);
app.post('/api/retirada', chavesController.registrarRetirada);
app.post('/api/devolucao', chavesController.registrarDevolucao);

// Inicia o Servidor
app.listen(PORT, () => {
    console.log(`Servidor MVC rodando na porta ${PORT}`);
    console.log(`Acesse o sistema em: http://localhost:${PORT}`);
});
const express = require('express');
const path = require('path');

// 1. Importa as CLASSES, não mais os objetos prontos
const ChavesModel = require('./models/chavesModel');
const ChavesController = require('./controllers/chavesController');

// 2. Cria as instâncias (os objetos)
const chavesModel = new ChavesModel();
// Injeta o model no construtor do controller
const chavesController = new ChavesController(chavesModel); 

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// 3. As rotas agora chamam os MÉTODOS dos objetos instanciados
app.get('/api/dados-iniciais', chavesController.getDadosIniciais);
app.get('/api/estado', chavesController.getEstado);
app.post('/api/retirada', chavesController.registrarRetirada);
app.post('/api/devolucao', chavesController.registrarDevolucao);

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta: ${PORT}`);
    console.log(`em: http://localhost:${PORT}`);
});
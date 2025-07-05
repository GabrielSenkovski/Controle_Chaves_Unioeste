class FormularioRetirada {
    // O construtor não recebe mais os dados mock, ele vai buscá-los.
    constructor(formId) {
        this.formElement = document.getElementById(formId);
        if (!this.formElement) return;

        // As listas de dados agora começam vazias.
        this.chaves = [];
        this.solicitantes = [];

        this.selecionarElementosDOM();
        this.vincularEventos();
        
        // Novo método para carregar os dados iniciais do backend.
        this.carregarDadosIniciais();
        this.definirEstadoInicial();
    }

    // O método 'selecionarElementosDOM' continua igual.
    selecionarElementosDOM() {
        this.buscarChave = document.getElementById('buscarChave');
        this.infoChaveDiv = document.getElementById('infoChaveSelecionada');
        this.codigoChaveSpan = document.getElementById('codigoChave');
        this.descricaoChaveSpan = document.getElementById('descricaoChave');
        this.statusChaveSpan = document.getElementById('statusChave');
        this.buscarSolicitanteInput = document.getElementById('buscarSolicitante');
        this.camposSolicitante = {
            nome: document.getElementById('nomeSolicitante'),
            vinculo: document.getElementById('vinculoSolicitante'),
            id: document.getElementById('idSolicitante'),
            cursoSetor: document.getElementById('cursoSetorSolicitante'),
            telefone: document.getElementById('telefoneSolicitante')
        };
        this.dataField = document.getElementById('dataRetirada');
        this.horaField = document.getElementById('horaRetirada');
        this.observacoesField = document.getElementById('observacoes');
        this.btnCancelar = document.getElementById('btnCancelar');
        this.fieldsetSolicitante = document.getElementById('fieldset-solicitante');
    }


// quando o usuário digitar o nome da chave e pressionar "Enter", a busca será executada imediatamente

vincularEventos() {
    this.formElement.addEventListener('submit', this.manipularSubmit.bind(this));
    this.btnCancelar.addEventListener('click', this.manipularCancelar.bind(this));
    
    // Evento de 'blur' (quando sai do campo) - JÁ EXISTE
    this.buscarChave.addEventListener('blur', this.manipularBuscaChave.bind(this));
    this.buscarChave.addEventListener('input', (e) => {
        if (e.target.value.trim() === "") this.limparInfoChave();
    });

    // --- CÓDIGO NOVO A SER ADICIONADO ---
    // Adiciona um evento para a tecla 'Enter' no campo de busca da chave
    this.buscarChave.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault(); // Impede que o 'Enter' envie o formulário inteiro
            this.manipularBuscaChave(event); // Roda a mesma função de busca
            this.buscarSolicitanteInput.focus(); // Move o cursor para o próximo campo, melhorando o fluxo!
        }
    });
    // --- FIM DO CÓDIGO NOVO ---

    this.buscarSolicitanteInput.addEventListener('blur', this.manipularBuscaSolicitante.bind(this));
    // ... o resto do método continua igual ...
}

    // --- NOVOS E MODIFICADOS MÉTODOS ---

    // NOVO: Carrega os dados de chaves e solicitantes do servidor quando a página abre.
    async carregarDadosIniciais() {
        try {
            const response = await fetch('/api/dados-iniciais');
            if (!response.ok) {
                throw new Error('Falha ao carregar dados do servidor.');
            }
            const dados = await response.json();
            this.chaves = dados.chaves;
            this.solicitantes = dados.solicitantes;
            console.log('Dados iniciais carregados:', this);
        } catch (error) {
            console.error(error);
            alert('Não foi possível carregar os dados do sistema. Tente recarregar a página.');
        }
    }


async manipularSubmit(event) {
    event.preventDefault();

    // --- ADICIONE ESTE BLOCO DE CÓDIGO PARA DEPURAÇÃO ---
    console.log("--- INICIANDO DEPURAÇÃO DO SUBMIT ---");
    console.log("1. Código da Chave que estou vendo:", `'${this.codigoChaveSpan.textContent}'`);
    console.log("2. Status da Chave que estou vendo:", `'${this.statusChaveSpan.textContent}'`);
    console.log("3. ID do Solicitante que estou vendo:", `'${this.camposSolicitante.id.value}'`);
    console.log("-----------------------------------------");
    // --- FIM DO BLOCO DE DEPURAÇÃO ---


    // Validação 1: Código da Chave está preenchido?
    if (!this.codigoChaveSpan.textContent) {
        alert("VALIDAÇÃO 1 FALHOU: Por favor, selecione uma chave válida.");
        return;
    }
    // Validação 2: Status da Chave é 'Disponível'?
    // Vamos tornar essa verificação mais robusta, ignorando espaços e maiúsculas/minúsculas.
    if (this.statusChaveSpan.textContent.trim().toLowerCase() !== 'disponível') {
        alert(`VALIDAÇÃO 2 FALHOU: A chave está com status '${this.statusChaveSpan.textContent}' e não pode ser retirada.`);
        return;
    }
    // Validação 3: ID do Solicitante está preenchido?
    if (!this.camposSolicitante.id.value) {
        alert("VALIDAÇÃO 3 FALHOU: Por favor, identifique o solicitante.");
        return;
    }

    // O resto do código para o fetch continua aqui...
    const dadosRetirada = { /* ... */ };
    try {
        const response = await fetch('/api/retirada', { /* ... */ });
        // ...
    } catch (error) {
        // ...
    }
}
    
    // Todos os outros métodos (definirEstadoInicial, buscarChave, exibirInfoChave, etc.) continuam os mesmos
    // pois eles agora operam nas listas this.chaves e this.solicitantes que foram preenchidas pela API.
    definirEstadoInicial() { /* ...código igual ao anterior... */ }
    buscarChave(termo) { /* ...código igual ao anterior... */ }
    exibirInfoChave(chave) { /* ...código igual ao anterior... */ }
    
    
    limparInfoChave() {
        this.codigoChaveSpan.textContent = "";
        this.descricaoChaveSpan.textContent = "";
        this.statusChaveSpan.textContent = "";
        this.infoChaveDiv.classList.add('hidden');

        // ADICIONE ESTA LINHA PARA TRAVAR NOVAMENTE A SEÇÃO
        this.fieldsetSolicitante.disabled = true;
        this.limparInfoSolicitante(); // Limpa os campos do solicitante também
    }
    buscarSolicitante(termo) { /* ...código igual ao anterior... */ }
    exibirInfoSolicitante(solicitante) { /* ...código igual ao anterior... */ }
    limparInfoSolicitante() { /* ...código igual ao anterior... */ }
    tornarCampoEditavel(event) { /* ...código igual ao anterior... */ }
    
    manipularBuscaChave(event) {
    const termoBusca = event.target.value;
    const chaveEncontrada = this.buscarChave(termoBusca);
    console.log(termoBusca);
    console.log(chaveEncontrada);

    if (chaveEncontrada) {
        this.exibirInfoChave(chaveEncontrada);
        
        // --- LÓGICA DE TRAVAR/DESTRAVAR ---
        if (chaveEncontrada.status.trim().toLowerCase() === 'disponível') {
            // Se a chave está disponível, HABILITA a seção do solicitante
            this.fieldsetSolicitante.disabled = false;
        } else {
            // Se não está disponível, DESABILITA a seção do solicitante
            this.fieldsetSolicitante.disabled = true;
            alert(`Atenção: A chave '${chaveEncontrada.id}' não está disponível.`);
        }
    } else {
        this.limparInfoChave();
    }
 }
    manipularBuscaSolicitante(event) { /* ...código igual ao anterior... */ }
    manipularCancelar() { /* ...código igual ao anterior... */ }
}

// O ponto de entrada agora não passa mais os dados mock.
document.addEventListener('DOMContentLoaded', () => {
    new FormularioRetirada('formRetiradaChave');
});
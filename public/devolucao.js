class FormularioDevolucao {
    constructor(formId) {
        this.formElement = document.getElementById(formId);
        if (!this.formElement) return;

        // Guarda a lista de retiradas ativas que vem do backend
        this.retiradasAtivas = [];
        this.retiradaSelecionada = null; // Guarda a retirada encontrada na busca

        this.selecionarElementosDOM();
        this.vincularEventos();
        this.carregarDadosAtuais();
    }

    selecionarElementosDOM() {
        this.buscarChaveInput = document.getElementById('buscarChaveOcupada');
        this.detalhesTransacaoDiv = document.getElementById('detalhesTransacao');
        
        // Spans para exibir os dados
        this.codigoChaveSpan = document.getElementById('codigoChave');
        this.descricaoChaveSpan = document.getElementById('descricaoChave');
        this.nomeSolicitanteSpan = document.getElementById('nomeSolicitante');
        // O idSolicitante (Matrícula) não existe mais no nosso novo fluxo, ficará em branco.
        this.idSolicitanteSpan = document.getElementById('idSolicitante'); 
        this.dataHoraRetiradaSpan = document.getElementById('dataHoraRetirada');
        
        // Campos de data/hora da devolução
        this.dataDevolucaoInput = document.getElementById('dataDevolucao');
        this.horaDevolucaoInput = document.getElementById('horaDevolucao');
        this.observacoesInput = document.getElementById('observacoes');
        this.btnCancelar = document.getElementById('btnCancelar');
    }

    vincularEventos() {
        this.formElement.addEventListener('submit', this.manipularSubmit.bind(this));
        this.btnCancelar.addEventListener('click', this.limparFormulario.bind(this));
        
        this.buscarChaveInput.addEventListener('blur', this.manipularBuscaChave.bind(this));
        this.buscarChaveInput.addEventListener('input', (e) => {
            // Se o campo de busca for limpo, esconde os detalhes
            if (e.target.value.trim() === "") {
                this.detalhesTransacaoDiv.classList.add('hidden');
            }
        });

        this.buscarChaveInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                this.manipularBuscaChave(event);
            }
        });
    }

    async carregarDadosAtuais() {
        try {
            // Busca o estado atual das chaves retiradas do backend
            const response = await fetch('/api/estado');
            if (!response.ok) throw new Error('Falha ao carregar retiradas ativas.');
            
            this.retiradasAtivas = await response.json();
        } catch (error) {
            console.error(error);
            alert('Não foi possível carregar os dados de chaves em uso.');
        }
    }

    buscarRetiradaAtiva(termo) {
        if (!termo) return null;
        const termoLower = termo.toLowerCase().trim();
        return this.retiradasAtivas.find(r =>
            r.codigoChave.toLowerCase().includes(termoLower) ||
            r.descricaoChave.toLowerCase().includes(termoLower)
        ) || null;
    }

    exibirInfoRetirada(retirada) {
        this.retiradaSelecionada = retirada; // Guarda a retirada encontrada

        this.codigoChaveSpan.textContent = retirada.codigoChave;
        this.descricaoChaveSpan.textContent = retirada.descricaoChave;
        this.nomeSolicitanteSpan.textContent = retirada.solicitante.nome;
        // O campo Matrícula/SIAPE não existe mais no fluxo simplificado, então ficará vazio.
        this.idSolicitanteSpan.textContent = retirada.solicitante.identificador_unico || 'N/A';
        
        // Formata a data e hora para exibição
        const dataRetirada = new Date(retirada.dataHoraRetirada);
        this.dataHoraRetiradaSpan.textContent = dataRetirada.toLocaleString('pt-BR');

        // Preenche a data e hora atuais para a devolução
        const now = new Date();
        const timezoneOffset = now.getTimezoneOffset() * 60000;
        const localNow = new Date(now.valueOf() - timezoneOffset);
        this.dataDevolucaoInput.value = localNow.toISOString().split('T')[0];
        this.horaDevolucaoInput.value = localNow.toTimeString().slice(0, 5);

        this.detalhesTransacaoDiv.classList.remove('hidden');
    }

    limparFormulario() {
        this.formElement.reset();
        this.detalhesTransacaoDiv.classList.add('hidden');
        this.retiradaSelecionada = null;
    }

    manipularBuscaChave(event) {
        const termoBusca = event.target.value;
        const retiradaEncontrada = this.buscarRetiradaAtiva(termoBusca);

        if (retiradaEncontrada) {
            this.exibirInfoRetirada(retiradaEncontrada);
        } else {
            this.detalhesTransacaoDiv.classList.add('hidden');
            if (termoBusca) {
                alert("Nenhuma retirada ativa encontrada para esta chave.");
            }
        }
    }
    
    async manipularSubmit(event) {
        event.preventDefault();

        if (!this.retiradaSelecionada) {
            alert("Por favor, busque e selecione uma chave válida para devolver.");
            return;
        }

        const dadosDevolucao = {
            codigoChave: this.retiradaSelecionada.codigoChave,
            observacoes: this.observacoesInput.value
        };

        try {
            const response = await fetch('/api/devolucao', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dadosDevolucao),
            });

            if (!response.ok) {
                const erro = await response.json();
                throw new Error(erro.message);
            }

            alert(`Devolução da chave ${dadosDevolucao.codigoChave} registrada com sucesso!`);
            this.limparFormulario();
            // Recarrega os dados para que a chave devolvida não apareça mais na busca
            this.carregarDadosAtuais();

        } catch (error) {
            console.error('Erro ao registrar devolução:', error);
            alert(`Falha ao registrar devolução: ${error.message}`);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new FormularioDevolucao('formDevolucaoChave');
});
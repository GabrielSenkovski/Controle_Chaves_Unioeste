class FormularioRetirada {
    constructor(formId) {
        this.formElement = document.getElementById(formId);
        if (!this.formElement) return;

        this.chaves = [];
        this.isBuscandoChave = false;

        this.selecionarElementosDOM();
        this.vincularEventos();
        this.carregarDadosIniciais();
        this.definirEstadoInicial();
    }

    selecionarElementosDOM() {
        // bug CORRIGIDO: Renomeado para evitar conflito com o nome do método 'buscarChave'
        this.buscarChaveInput = document.getElementById('buscarChave'); 
        this.infoChaveDiv = document.getElementById('infoChaveSelecionada');
        this.codigoChaveSpan = document.getElementById('codigoChave');
        this.descricaoChaveSpan = document.getElementById('descricaoChave');
        this.statusChaveSpan = document.getElementById('statusChave');
        this.fieldsetSolicitante = document.getElementById('fieldset-solicitante');
        
        this.camposSolicitante = {
            nome: document.getElementById('nomeSolicitante'),
            vinculo: document.getElementById('vinculoSolicitante'),
            cursoSetor: document.getElementById('cursoSetorSolicitante'),
            telefone: document.getElementById('telefoneSolicitante')
        };
        
        this.dataField = document.getElementById('dataRetirada');
        this.horaField = document.getElementById('horaRetirada');
        this.observacoesField = document.getElementById('observacoes');
        this.btnCancelar = document.getElementById('btnCancelar');
    }

    vincularEventos() {
        this.formElement.addEventListener('submit', this.manipularSubmit.bind(this));
        this.btnCancelar.addEventListener('click', this.manipularCancelar.bind(this));
        
        this.buscarChaveInput.addEventListener('blur', this.manipularBuscaChave.bind(this));
        this.buscarChaveInput.addEventListener('input', (e) => {
            if (e.target.value.trim() === "") this.limparInfoChave();
        });

        this.buscarChaveInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                const sucesso = this.manipularBuscaChave(event); 
                if (sucesso) {
                    // CORRIGIDO: Move o foco para o primeiro campo editável do solicitante
                    this.camposSolicitante.nome.focus();
                }
            }
        });

    
    }

    definirEstadoInicial() {
        const agora = new Date(); // 'agora' já contém a data e hora locais corretas

        // Formata a data para AAAA-MM-DD
        const ano = agora.getFullYear();
        const mes = String(agora.getMonth() + 1).padStart(2, '0'); // getMonth() começa em 0
        const dia = String(agora.getDate()).padStart(2, '0');
        this.dataField.value = `${ano}-${mes}-${dia}`;

        // Formata a hora para HH:MM
        const horas = String(agora.getHours()).padStart(2, '0');
        const minutos = String(agora.getMinutes()).padStart(2, '0');
        this.horaField.value = `${horas}:${minutos}`;
}

    async carregarDadosIniciais() {
        try {
            const response = await fetch('/api/dados-iniciais');
            const dados = await response.json();
            this.chaves = dados.chaves;
        } catch (error) {
            console.error(error);
            alert('Não foi possível carregar os dados do sistema.');
        }
    }

    buscarChave(termo) {
        if (!termo) return null;
        const termoLower = termo.toLowerCase().trim();
        return this.chaves.find(chave =>
            chave.id.toLowerCase().includes(termoLower) ||
            chave.descricao.toLowerCase().includes(termoLower)
        ) || null;
    }

    exibirInfoChave(chave) {
        this.codigoChaveSpan.textContent = chave.id;
        this.descricaoChaveSpan.textContent = chave.descricao;
        this.statusChaveSpan.textContent = chave.status;
        this.infoChaveDiv.classList.remove('hidden');
    }

    limparInfoChave() {
        this.codigoChaveSpan.textContent = "";
        this.descricaoChaveSpan.textContent = "";
        this.statusChaveSpan.textContent = "";
        this.infoChaveDiv.classList.add('hidden');
        this.fieldsetSolicitante.disabled = true;
        this.limparInfoSolicitante();
    }

    limparInfoSolicitante() {
        Object.values(this.camposSolicitante).forEach(campo => campo.value = "");
        // Reseta o select para a opção padrão
        this.camposSolicitante.vinculo.selectedIndex = 0;
    }
    
    manipularBuscaChave(event) {
    // Se a função já estiver rodando, não faça nada e saia imediatamente.
    if (this.isBuscandoChave) return false;

    try {
        // Ativa a trava para impedir novas execuções
        this.isBuscandoChave = true;

        const termoBusca = event.target.value;
        const chaveEncontrada = this.buscarChave(termoBusca);

        if (chaveEncontrada) {
            this.exibirInfoChave(chaveEncontrada);
            
            if (chaveEncontrada.status.trim().toLowerCase() === 'disponível') {
                this.fieldsetSolicitante.disabled = false;
                return true; // Sucesso
            } else {
                this.fieldsetSolicitante.disabled = true;
                alert(`Atenção: A chave '${chaveEncontrada.id}' não está disponível.`);
                return false; // Falha
            }
        } else {
            this.limparInfoChave();
            return false; // Falha
        }
    } finally {
        // O bloco 'finally' SEMPRE é executado no final, garantindo que a trava seja liberada
        // para que a função possa ser chamada novamente no futuro.
        // Usamos um pequeno delay para dar tempo ao navegador de resolver os eventos de foco.
        setTimeout(() => {
            this.isBuscandoChave = false;
        }, 100); 
    }
}

    manipularCancelar() {
        if (confirm("Deseja realmente cancelar?")) {
            this.formElement.reset();
            this.limparInfoChave();
        }
    }
    
    async manipularSubmit(event) {
        event.preventDefault();
        
        if (!this.codigoChaveSpan.textContent) {
            alert("Por favor, selecione uma chave válida.");
            return;
        }
        if (this.statusChaveSpan.textContent.trim().toLowerCase() !== 'disponível') {
            alert(`A chave não está disponível para retirada.`);
            return;
        }
        if (!this.camposSolicitante.nome.value || !this.camposSolicitante.vinculo.value) {
            alert("Por favor, preencha todos os dados obrigatórios do solicitante.");
            return;
        }

        const dadosRetirada = {
            codigoChave: this.codigoChaveSpan.textContent,
            descricaoChave: this.descricaoChaveSpan.textContent,
            solicitante: {
                nome: this.camposSolicitante.nome.value,
                vinculo: this.camposSolicitante.vinculo.value,
                cursoSetor: this.camposSolicitante.cursoSetor.value,
                telefone: this.camposSolicitante.telefone.value
            },
            dataHoraRetirada: new Date().toISOString()
        };

        try {
            const response = await fetch('/api/retirada', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dadosRetirada),
            });

            if (!response.ok) {
                const erro = await response.json();
                throw new Error(erro.message);
            }

            alert("Retirada registrada com sucesso!");
            
            const chaveRetirada = this.chaves.find(c => c.id === dadosRetirada.codigoChave);
            if (chaveRetirada) chaveRetirada.status = 'Ocupada';

            this.formElement.reset();
            this.limparInfoChave();

        } catch (error) {
            console.error('Erro ao registrar retirada:', error);
            alert(`Falha ao registrar: ${error.message}`);
        }
    }
}

// O ponto de entrada da aplicação 
document.addEventListener('DOMContentLoaded', () => {
    new FormularioRetirada('formRetiradaChave');
});
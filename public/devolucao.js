/**
 * Classe que gerencia todo o comportamento do formulário de devolução de chaves.
 */
class FormularioDevolucao {
    constructor(formId, dadosMock) {
        this.formElement = document.getElementById(formId);
        if (!this.formElement) return;

        this.retiradasAtivas = dadosMock.retiradasAtivas || [];
        this.selecionarElementosDOM();
        this.vincularEventos();
    }

    selecionarElementosDOM() {
        this.buscarChaveInput = document.getElementById('buscarChaveOcupada');
        this.detalhesTransacaoDiv = document.getElementById('detalhesTransacao');
        this.codigoChaveSpan = document.getElementById('codigoChave');
        this.descricaoChaveSpan = document.getElementById('descricaoChave');
        this.nomeSolicitanteSpan = document.getElementById('nomeSolicitante');
        this.idSolicitanteSpan = document.getElementById('idSolicitante');
        this.dataHoraRetiradaSpan = document.getElementById('dataHoraRetirada');
        this.dataDevolucaoInput = document.getElementById('dataDevolucao');
        this.horaDevolucaoInput = document.getElementById('horaDevolucao');
        this.btnCancelar = document.getElementById('btnCancelar');
    }

    vincularEventos() {
        this.formElement.addEventListener('submit', this.manipularSubmit.bind(this));
        this.btnCancelar.addEventListener('click', this.manipularCancelar.bind(this));
        this.buscarChaveInput.addEventListener('blur', this.manipularBuscaChave.bind(this));
        this.buscarChaveInput.addEventListener('input', (e) => {
            if (e.target.value.trim() === "") this.detalhesTransacaoDiv.classList.add('hidden');
        });
    }

    buscarRetiradaAtiva(termo) {
        if (!termo) return null;
        const termoLower = termo.toLowerCase().trim();
        return this.retiradasAtivas.find(r =>
            r.codigoChave.toLowerCase().includes(termoLower) ||
            r.descricaoChave.toLowerCase().includes(termoLower)
        ) || null;
    }

    preencherDados(transacao) {
        this.codigoChaveSpan.textContent = transacao.codigoChave;
        this.descricaoChaveSpan.textContent = transacao.descricaoChave;
        this.nomeSolicitanteSpan.textContent = transacao.solicitante.nome;
        this.idSolicitanteSpan.textContent = transacao.solicitante.idMatriculaSiape;
        this.dataHoraRetiradaSpan.textContent = `${transacao.dataRetirada} às ${transacao.horaRetirada}`;

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
    }

    manipularBuscaChave(event) {
        const termoBusca = event.target.value;
        const transacaoEncontrada = this.buscarRetiradaAtiva(termoBusca);
        if (transacaoEncontrada) {
            this.preencherDados(transacaoEncontrada);
        } else {
            this.detalhesTransacaoDiv.classList.add('hidden');
            if (termoBusca.trim() !== "") {
                alert("Nenhuma retirada ativa encontrada para esta chave.");
            }
        }
    }

    manipularCancelar() {
        if (confirm("Deseja realmente cancelar esta operação?")) {
            this.limparFormulario();
        }
    }

    manipularSubmit(event) {
        event.preventDefault();
        const codigoChaveAtual = this.codigoChaveSpan.textContent;
        if (!codigoChaveAtual) {
            alert("Erro: Nenhuma chave selecionada para devolução.");
            return;
        }

        const indexTransacao = this.retiradasAtivas.findIndex(r => r.codigoChave === codigoChaveAtual);
        if (indexTransacao > -1) {
            this.retiradasAtivas.splice(indexTransacao, 1);
            console.log(`Chave ${codigoChaveAtual} foi devolvida.`);
            console.log("Retiradas ativas restantes:", this.retiradasAtivas);
            alert(`Devolução da chave ${codigoChaveAtual} registrada com sucesso!`);
            this.limparFormulario();
        } else {
            alert("Erro: A transação para esta chave não foi encontrada.");
        }
    }
}

// Ponto de entrada da aplicação para esta página
document.addEventListener('DOMContentLoaded', () => {
    const dadosMock = {
        retiradasAtivas: [
            { transacaoId: 1, codigoChave: "LABINF03", descricaoChave: "Laboratório de Informática 03", solicitante: { idMatriculaSiape: "123456", nome: "João da Silva" }, dataRetirada: "2025-06-06", horaRetirada: "09:00" },
            { transacaoId: 2, codigoChave: "SALA205-B", descricaoChave: "Sala de Reuniões 205 Bloco B", solicitante: { idMatriculaSiape: "654321", nome: "Maria Souza" }, dataRetirada: "2025-06-05", horaRetirada: "14:30" }
        ]
    };

    new FormularioDevolucao('formDevolucaoChave', dadosMock);
});
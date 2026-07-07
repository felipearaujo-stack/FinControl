/* ==========================================================
   FINCONTROL
   CARTOES.JS - VERSÃO 7.0 DEFINITIVA
   (Integração Total com Objeto Storage, Fatura e Limite Dinâmico)
========================================================== */

let contasBancarias = [];
let contaEditando = null;

// ======================================
// 1. Injetar HTML Dinamicamente na Aba Cartões
// ======================================
function injetarTelaCartoes() {
    const secaoCartoes = document.getElementById("cartoes");
    if (secaoCartoes) {
        const panel = secaoCartoes.querySelector(".panel");
        if (panel) {
            panel.innerHTML = `
                <h2>Meus Cartões e Contas</h2>
                <br>
                <p style="color: #64748B; margin-bottom: 20px;">
                    Gerencie de forma ilimitada o saldo das suas contas (Débito/PIX) e o limite dos seus cartões (Crédito).
                </p>
                <button class="btn-primary" onclick="abrirModalConta()">
                    <i class="fa-solid fa-credit-card"></i> Adicionar Banco/Cartão
                </button>
                <br><br>
                <div id="listaCartoes" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px;"></div>
            `;
        }
    }

    // Cria o Modal de Adicionar Banco/Cartão se ele não existir no HTML
    if (!document.getElementById("modalContaBancaria")) {
        const modalHTML = `
        <div id="modalContaBancaria" class="modal" style="display:none;">
            <div class="modal-box">
                <h2>Configurar Banco / Cartão</h2>
                <br>
                <div class="campo">
                    <label>Nome do Banco</label>
                    <input type="text" id="nomeBanco" placeholder="Ex: Nubank, Itaú, Inter">
                </div>
                <div class="campo">
                    <label>Saldo Inicial da Conta (Débito)</label>
                    <input type="number" step="0.01" id="saldoDebitoInicial" placeholder="Ex: 1000.00">
                </div>
                <div class="campo">
                    <label>Limite Total do Cartão (Crédito)</label>
                    <input type="number" step="0.01" id="limiteCreditoTotal" placeholder="Ex: 20000.00">
                </div>
                <div style="display:flex; gap:15px; margin-top:10px;">
                    <button onclick="salvarContaBancaria()" class="btn-primary">Salvar Banco</button>
                    <button onclick="fecharModalConta()" class="btn-secondary">Cancelar</button>
                </div>
            </div>
        </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    // UPGRADE DO MODAL DE LANÇAMENTOS (Injeta os campos se não existirem)
    const modalLancamento = document.getElementById("modalLancamento");
    if (modalLancamento && !document.getElementById("bancoLancamento")) {
        const botaoSalvar = modalLancamento.querySelector(".btn-primary") || modalLancamento.querySelector("button");
        if (botaoSalvar && botaoSalvar.parentNode) {
            const camposExtrasHTML = `
                <div class="campo">
                    <label>Instituição Financeira (Banco)</label>
                    <select id="bancoLancamento" style="width: 100%; padding: 8px; border-radius: 4px; border: 1px solid #CBD5E1;">
                        </select>
                </div>
                <div class="campo">
                    <label>Forma de Pagamento</label>
                    <select id="formaPagamentoLancamento" style="width: 100%; padding: 8px; border-radius: 4px; border: 1px solid #CBD5E1;">
                        <option value="debito">Débito / Saldo de Conta</option>
                        <option value="pix">PIX (Dinheiro em Conta)</option>
                        <option value="credito">Cartão de Crédito</option>
                    </select>
                </div>
            `;
            botaoSalvar.parentNode.insertAdjacentHTML('beforebegin', camposExtrasHTML);
        }
    }
}

// ======================================
// 2. Carregar Dados do Banco Local (LocalStorage)
// ======================================
function carregarContasBancarias() {
    const usuario = (typeof usuarioAtual !== 'undefined' && usuarioAtual) ? usuarioAtual : "usuario_teste";
    const dadosLocais = localStorage.getItem(`fincontrol_contas_${usuario}`);
    
    if (dadosLocais) {
        contasBancarias = JSON.parse(dadosLocais);
    } else {
        contasBancarias = [
            { id: 1, nome: "Nubank", saldoInicial: 1000, limiteTotal: 20000 }
        ];
        salvarDadosContas();
    }

    atualizarVisualCartoes();
    atualizarSelectsNoLancamento();
}

function salvarDadosContas() {
    const usuario = (typeof usuarioAtual !== 'undefined' && usuarioAtual) ? usuarioAtual : "usuario_teste";
    localStorage.setItem(`fincontrol_contas_${usuario}`, JSON.stringify(contasBancarias));
}

// ======================================
// 3. Funções do Modal de Bancos
// ======================================
function abrirModalConta(id = null) {
    contaEditando = id;
    if (id) {
        const conta = contasBancarias.find(c => c.id === id);
        if (conta) {
            document.getElementById("nomeBanco").value = conta.nome;
            document.getElementById("saldoDebitoInicial").value = conta.saldoInicial;
            document.getElementById("limiteCreditoTotal").value = conta.limiteTotal;
        }
    } else {
        document.getElementById("nomeBanco").value = "";
        document.getElementById("saldoDebitoInicial").value = "";
        document.getElementById("limiteCreditoTotal").value = "";
    }
    const modal = document.getElementById("modalContaBancaria");
    if (modal) modal.style.display = "flex";
}

window.abrirModalConta = abrirModalConta;

function fecharModalConta() {
    const modal = document.getElementById("modalContaBancaria");
    if (modal) modal.style.display = "none";
}

window.fecharModalConta = fecharModalConta;

function salvarContaBancaria() {
    const nome = document.getElementById("nomeBanco").value.trim();
    const saldoInicial = parseFloat(document.getElementById("saldoDebitoInicial").value) || 0;
    const limiteTotal = parseFloat(document.getElementById("limiteCreditoTotal").value) || 0;

    if (nome === "") {
        alert("O nome do banco é obrigatório.");
        return;
    }

    if (contaEditando) {
        const index = contasBancarias.findIndex(c => c.id === contaEditando);
        if (index !== -1) {
            contasBancarias[index] = { ...contasBancarias[index], nome, saldoInicial, limiteTotal };
        }
    } else {
        contasBancarias.push({ id: Date.now(), nome, saldoInicial, limiteTotal });
    }

    salvarDadosContas();
    atualizarVisualCartoes();
    atualizarSelectsNoLancamento();
    fecharModalConta();
}

window.salvarContaBancaria = salvarContaBancaria;

function excluirConta(id) {
    if (confirm("Deseja mesmo remover este banco/cartão?")) {
        contasBancarias = contasBancarias.filter(c => c.id !== id);
        salvarDadosContas();
        atualizarVisualCartoes();
        atualizarSelectsNoLancamento();
    }
}

window.excluirConta = excluirConta;

// ======================================
// 4. Sincronizar Bancos Cadastrados com o Modal de Lançamentos
// ======================================
function atualizarSelectsNoLancamento() {
    const selectBanco = document.getElementById("bancoLancamento");
    if (!selectBanco) return;

    selectBanco.innerHTML = "";

    if (contasBancarias.length === 0) {
        selectBanco.innerHTML = `<option value="">Nenhum banco cadastrado</option>`;
        return;
    }

    contasBancarias.forEach(conta => {
        const option = document.createElement("option");
        option.value = conta.nome;
        option.textContent = conta.nome;
        selectBanco.appendChild(option);
    });
}

window.atualizarSelectsNoLancamento = atualizarSelectsNoLancamento;

// ======================================
// 5. 🧮 CALCULAR E RENDERIZAR TELA (Conectado com Storage Original)
// ======================================
function atualizarVisualCartoes() {
    const container = document.getElementById("listaCartoes");
    if (!container) return;

    container.innerHTML = "";

    const usuario = (typeof usuarioAtual !== 'undefined' && usuarioAtual) ? usuarioAtual : "usuario_teste";
    let lancamentosGerais = [];
    
    // Puxa as informações diretamente usando o seu objeto Storage padrão do sistema
    if (typeof Storage !== 'undefined' && typeof Storage.obterLancamentos === 'function') {
        lancamentosGerais = Storage.obterLancamentos(usuario) || [];
    } else {
        lancamentosGerais = JSON.parse(localStorage.getItem(`fincontrol_lancamentos_${usuario}`)) || [];
    }
    
    const formatar = (v) => Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    contasBancarias.forEach(conta => {
        let gastosCredito = 0;
        let gastosDebito = 0;
        let entradasDebito = 0;

        lancamentosGerais.forEach(item => {
            // Compara os nomes limpando espaços e ignorando maiúsculas/minúsculas
            const itemBanco = item.banco ? item.banco.trim().toLowerCase() : "";
            const contaNome = conta.nome ? conta.nome.trim().toLowerCase() : "";

            if (itemBanco === contaNome) {
                const valor = Number(item.valor) || 0;
                const formaPgto = item.formaPagamento ? item.formaPagamento.toLowerCase() : "";
                
                if (formaPgto === "credito") {
                    if (item.tipo === "despesa" || item.tipo === "gasto") gastosCredito += valor;
                    if (item.tipo === "receita") gastosCredito -= valor; 
                } 
                else if (formaPgto === "debito" || formaPgto === "pix") {
                    if (item.tipo === "despesa" || item.tipo === "gasto") gastosDebito += valor;
                    if (item.tipo === "receita") entradasDebito += valor;
                }
            }
        });

        // 🧮 Equações Finais: A fatura aparece e o limite disponível diminui
        const saldoDebitoAtual = conta.saldoInicial + entradasDebito - gastosDebito;
        const faturaAtual = gastosCredito;
        const limiteCreditoDisponivel = conta.limiteTotal - gastosCredito;
        
        // Percentual para encher a barrinha azul da fatura
        const percentualGasto = Math.max(0, Math.min(100, (gastosCredito / conta.limiteTotal) * 100));

        // Identidade Visual das marcas dos bancos
        let corBanco = '#1E293B';
        const n = conta.nome.toLowerCase();
        if (n.includes('nubank')) corBanco = '#820AD1';
        else if (n.includes('itaú') || n.includes('itau')) corBanco = '#FF6A00';
        else if (n.includes('inter')) corBanco = '#FF7A00';
        else if (n.includes('bradesco')) corBanco = '#CC092F';
        else if (n.includes('santander')) corBanco = '#EC0000';

        const cardHTML = document.createElement("div");
        cardHTML.style = `background: white; border-radius: 12px; padding: 20px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); border-left: 8px solid ${corBanco}; display: flex; flex-direction: column; gap: 15px;`;

        cardHTML.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <strong style="font-size: 18px; color: ${corBanco};"><i class="fa-solid fa-building-columns"></i> ${conta.nome}</strong>
                <div>
                    <button onclick="abrirModalConta(${conta.id})" style="background: none; border: none; color: #3B82F6; cursor: pointer; margin-right: 10px;">Editar</button>
                    <button onclick="excluirConta(${conta.id})" style="background: none; border: none; color: #EF4444; cursor: pointer;">Excluir</button>
                </div>
            </div>

            <div style="border-bottom: 1px solid #E2E8F0; padding-bottom: 15px;">
                <span style="font-size: 11px; color: #64748B; text-transform: uppercase; font-weight: bold; letter-spacing: 0.5px;">Conta Corrente (Débito/PIX)</span>
                <h3 style="color: #1E293B; margin-top: 5px; font-size: 22px; font-weight: 700;">${formatar(saldoDebitoAtual)}</h3>
            </div>

            <div>
                <span style="font-size: 11px; color: #64748B; text-transform: uppercase; font-weight: bold; letter-spacing: 0.5px;">Cartão de Crédito</span>
                
                <div style="margin-top: 8px;">
                    <small style="color: #64748B; font-size: 12px;">Fatura Atual</small>
                    <h3 style="color: #3B82F6; font-size: 20px; font-weight: 700; margin: 2px 0;">${formatar(faturaAtual)}</h3>
                </div>

                <div style="display: flex; justify-content: space-between; margin-top: 10px;">
                    <div>
                        <small style="color: #64748B; font-size: 11px;">Limite Disponível</small>
                        <p style="color: #10B981; font-size: 13px; margin: 2px 0; font-weight: 600;">${formatar(limiteCreditoDisponivel)}</p>
                    </div>
                    <div style="text-align: right;">
                        <small style="color: #64748B; font-size: 11px;">Limite Total</small>
                        <p style="color: #1E293B; font-size: 13px; margin: 2px 0; font-weight: bold;">${formatar(conta.limiteTotal)}</p>
                    </div>
                </div>
                
                <div style="width: 100%; height: 8px; background: #10B981; border-radius: 4px; margin-top: 8px; overflow: hidden; display: flex;">
                    <div style="width: ${percentualGasto}%; height: 100%; background: #3B82F6; transition: width 0.3s ease;"></div>
                </div>
            </div>
        `;
        container.appendChild(cardHTML);
    });
}

window.atualizarVisualCartoes = atualizarVisualCartoes;

// ======================================
// Inicialização
// ======================================
window.addEventListener("load", () => {
    injetarTelaCartoes();
    carregarContasBancarias();
});
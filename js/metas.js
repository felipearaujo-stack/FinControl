/* ==========================================================
   FINCONTROL
   METAS.JS (Com Caixinhas de Progresso Interativas)
========================================================== */

let metas = [];
let metaEditando = null;

// ======================================
// 1. Injetar HTML Dinamicamente
// ======================================
function injetarTelaMetas() {
    const secaoMetas = document.getElementById("metas");
    if (secaoMetas) {
        const panel = secaoMetas.querySelector(".panel");
        if (panel) {
            panel.innerHTML = `
                <h2>Metas Financeiras</h2>
                <br>
                <p style="color: #64748B; margin-bottom: 20px;">
                    Acompanhe o progresso dos seus sonhos. Clique nas caixinhas dos meses para marcar o depósito como concluído!
                </p>
                <button class="btn-primary" onclick="abrirModalMeta()">
                    <i class="fa-solid fa-bullseye"></i> Nova Meta
                </button>
                <br><br>
                <div id="listaMetas" class="lista-lancamentos"></div>
            `;
        }
    }

    if (!document.getElementById("modalMeta")) {
        const modalHTML = `
        <div id="modalMeta" class="modal" style="display:none;">
            <div class="modal-box">
                <h2>Configurar Meta</h2>
                <br>
                <div class="campo">
                    <label>Qual é o seu objetivo?</label>
                    <input type="text" id="nomeMeta" placeholder="Ex: Comprar um carro, Viagem...">
                </div>
                <div class="campo">
                    <label>Valor Total Necessário</label>
                    <input type="number" step="0.01" id="valorTotalMeta" placeholder="Ex: 50000.00">
                </div>
                <div class="campo">
                    <label>Em quantos meses você quer alcançar?</label>
                    <input type="number" id="mesesMeta" placeholder="Ex: 12">
                </div>
                <div style="display:flex; gap:15px; margin-top:10px;">
                    <button onclick="salvarMeta()" class="btn-primary">Salvar Meta</button>
                    <button onclick="fecharModalMeta()" class="btn-secondary">Cancelar</button>
                </div>
            </div>
        </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }
}

// ======================================
// 2. Carregar Metas
// ======================================
function carregarMetas() {
    const usuario = (typeof usuarioAtual !== 'undefined' && usuarioAtual) ? usuarioAtual : "usuario_teste";
    const dadosLocais = localStorage.getItem(`fincontrol_metas_${usuario}`);
    
    if (dadosLocais) {
        metas = JSON.parse(dadosLocais);
    }
    atualizarListaMetas();
}

// ======================================
// 3. Salvar Metas no Banco
// ======================================
function salvarDadosMetas() {
    const usuario = (typeof usuarioAtual !== 'undefined' && usuarioAtual) ? usuarioAtual : "usuario_teste";
    localStorage.setItem(`fincontrol_metas_${usuario}`, JSON.stringify(metas));
}

// ======================================
// 4. Modal
// ======================================
function abrirModalMeta(id = null) {
    metaEditando = id;
    
    if (id) {
        const meta = metas.find(m => m.id === id);
        if (meta) {
            document.getElementById("nomeMeta").value = meta.nome;
            document.getElementById("valorTotalMeta").value = meta.valorTotal;
            document.getElementById("mesesMeta").value = meta.meses;
        }
    } else {
        document.getElementById("nomeMeta").value = "";
        document.getElementById("valorTotalMeta").value = "";
        document.getElementById("mesesMeta").value = "";
    }

    const modal = document.getElementById("modalMeta");
    if (modal) modal.style.display = "flex";
}

function fecharModalMeta() {
    const modal = document.getElementById("modalMeta");
    if (modal) modal.style.display = "none";
}

// ======================================
// 5. Salvar e Calcular Meta
// ======================================
function salvarMeta() {
    const nome = document.getElementById("nomeMeta").value.trim();
    const valorTotal = parseFloat(document.getElementById("valorTotalMeta").value);
    const meses = parseInt(document.getElementById("mesesMeta").value);

    if (nome === "" || isNaN(valorTotal) || isNaN(meses) || valorTotal <= 0 || meses <= 0) {
        alert("Preencha todos os campos com valores válidos maiores que zero.");
        return;
    }

    const valorMensal = valorTotal / meses;

    if (metaEditando) {
        const index = metas.findIndex(m => m.id === metaEditando);
        if (index !== -1) {
            // Se mudou a quantidade de meses na edição, recria as caixinhas
            let depositos = metas[index].depositos || [];
            if (meses !== metas[index].meses) {
                depositos = new Array(meses).fill(false);
            }
            metas[index] = { ...metas[index], nome, valorTotal, meses, valorMensal, depositos };
        }
    } else {
        // Nova meta: cria um array cheio de "false" (caixas vazias)
        const depositos = new Array(meses).fill(false);
        const novaMeta = {
            id: Date.now(),
            nome: nome,
            valorTotal: valorTotal,
            meses: meses,
            valorMensal: valorMensal,
            depositos: depositos
        };
        metas.push(novaMeta);
    }

    salvarDadosMetas();
    atualizarListaMetas();
    fecharModalMeta();
}

// ======================================
// 6. Excluir Meta
// ======================================
function excluirMeta(id) {
    if (confirm("Tem certeza que deseja excluir esta meta?")) {
        metas = metas.filter(m => m.id !== id);
        salvarDadosMetas();
        atualizarListaMetas();
    }
}

// ======================================
// 7. Alternar Depósito (Marcar OK na caixa)
// ======================================
window.alternarDeposito = function(metaId, mesIndex) {
    const meta = metas.find(m => m.id === metaId);
    if (meta && meta.depositos) {
        // Inverte o valor (se tava falso, vira verdadeiro e vice-versa)
        meta.depositos[mesIndex] = !meta.depositos[mesIndex];
        salvarDadosMetas();
        atualizarListaMetas();
    }
};

// ======================================
// 8. Renderizar Tela
// ======================================
function atualizarListaMetas() {
    const lista = document.getElementById("listaMetas");
    if (!lista) return;

    lista.innerHTML = "";

    if (metas.length === 0) {
        lista.innerHTML = "<p>Nenhuma meta cadastrada ainda. Comece a sonhar grande!</p>";
        return;
    }

    const formatar = (valor) => Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    metas.forEach(meta => {
        // Previne erro em metas antigas sem o array de depósitos
        if (!meta.depositos) meta.depositos = new Array(meta.meses).fill(false);

        // Calcula quantos meses já foram pagos
        const mesesPagos = meta.depositos.filter(pago => pago === true).length;
        const valorGuardado = mesesPagos * meta.valorMensal;
        const progressoPercentual = ((mesesPagos / meta.meses) * 100).toFixed(0);

        // Gera o HTML das caixinhas
        let caixasHTML = '<div style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: 15px;">';
        meta.depositos.forEach((pago, index) => {
            const corFundo = pago ? '#10B981' : '#E2E8F0'; // Verde se pago, Cinza se não
            const corTexto = pago ? '#FFFFFF' : '#64748B';
            
            caixasHTML += `
                <div onclick="alternarDeposito(${meta.id}, ${index})"
                     style="width: 35px; height: 35px; background-color: ${corFundo}; color: ${corTexto};
                            display: flex; align-items: center; justify-content: center;
                            border-radius: 6px; font-size: 14px; cursor: pointer; font-weight: bold;
                            transition: all 0.2s ease-in-out; user-select: none;"
                     title="Mês ${index + 1} - Clique para marcar como depositado">
                    ${index + 1}
                </div>
            `;
        });
        caixasHTML += '</div>';

        const div = document.createElement("div");
        div.className = "itemLancamento";
        div.style.flexDirection = "column"; // Muda para coluna para caber as caixas embaixo
        div.style.alignItems = "flex-start";
        
        div.innerHTML = `
            <div style="display: flex; justify-content: space-between; width: 100%;">
                <div>
                    <strong style="font-size: 16px; color: #1E293B;">🎯 ${meta.nome}</strong>
                    <br>
                    <small style="color: #64748B;">
                        Objetivo: ${formatar(meta.valorTotal)} | Guardar: <strong style="color: #3B82F6;">${formatar(meta.valorMensal)}/mês</strong>
                    </small>
                </div>
                <div style="text-align: right;">
                    <strong style="color: #10B981; font-size: 16px;">${progressoPercentual}% Concluído</strong>
                    <br>
                    <small>${formatar(valorGuardado)} guardados</small>
                    <br><br>
                    <button onclick="abrirModalMeta(${meta.id})" style="margin-right: 5px;">Editar</button>
                    <button onclick="excluirMeta(${meta.id})">Excluir</button>
                </div>
            </div>
            
            ${caixasHTML}
        `;
        lista.appendChild(div);
    });
}

// ======================================
// Inicialização
// ======================================
window.addEventListener("load", () => {
    injetarTelaMetas();
    carregarMetas();
});
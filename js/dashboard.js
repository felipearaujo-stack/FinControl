/* ==========================================================
   FINCONTROL
   DASHBOARD.JS (Atualizado com Lógica de Pagamentos e Trava de Crédito)
========================================================== */

var salarioAtual = 0;
var totalReceitas = 0;
var totalDespesas = 0;
var saldoDisponivel = 0;

// ======================================
// Carregar Dashboard
// ======================================
function carregarDashboard(){
    const usuario = (typeof usuarioAtual !== 'undefined' && usuarioAtual) ? usuarioAtual : "usuario_teste";

    // Busca a configuração de salário estruturada do banco
    const configSalario = Storage.obterSalario(usuario);
    
    // Tratamento caso o salário ainda seja guardado como número puro ou objeto
    if (configSalario && typeof configSalario === 'object') {
        salarioAtual = Number(configSalario.valorTotal) || 0;
    } else {
        salarioAtual = Number(configSalario) || 0;
    }

    lancamentos = Storage.obterLancamentos(usuario) || [];

    atualizarCards();

    if(typeof atualizarListaLancamentos === "function"){
        atualizarListaLancamentos();
    }
}

// ======================================
// Atualizar Cards (Com Trava de Crédito + Dia 05 e 20)
// ======================================
function atualizarCards(){
    const usuario = (typeof usuarioAtual !== 'undefined' && usuarioAtual) ? usuarioAtual : "usuario_teste";

    // Puxa as informações do banco usando seu objeto Storage padrão
    const configSalarioRaw = Storage.obterSalario(usuario);
    let valorBaseSalario = 0;
    let regraPagamento = 'integral';

    // Se o salário já estiver salvando o objeto novo (com a regra do fluxo)
    if (configSalarioRaw && typeof configSalarioRaw === 'object') {
        valorBaseSalario = Number(configSalarioRaw.valorTotal) || 0;
        regraPagamento = configSalarioRaw.regra || 'integral';
    } else {
        // Fallback caso ainda seja o número antigo
        valorBaseSalario = Number(configSalarioRaw) || 0;
    }

    // 🧠 INTELIGÊNCIA DE DATAS: O sistema olha para o calendário
    const diaHoje = new Date().getDate();
    salarioAtual = 0; 

    if (regraPagamento === 'dividido') {
        if (diaHoje >= 5 && diaHoje < 20) {
            salarioAtual = valorBaseSalario / 2; // Libera 50% após o dia 05
        } else if (diaHoje >= 20) {
            salarioAtual = valorBaseSalario; // Libera 100% após o dia 20
        }
    } else {
        if (diaHoje >= 5) {
            salarioAtual = valorBaseSalario; // Libera integral após o dia 05
        }
    }

    const dadosLocais = Storage.obterLancamentos(usuario) || [];

    totalReceitas = 0;
    totalDespesas = 0;

    dadosLocais.forEach(item => {
        // 🎯 A TRAVA DE SEGURANÇA: Se a forma de pagamento for "credito", ele ignora e pula pro próximo!
        // Não deixa descontar do dinheiro do salário/dashboard principal
        if (item.formaPagamento === "credito" && (item.tipo === "despesa" || item.tipo === "gasto")) {
            return; 
        }

        // Soma e calcula apenas PIX, Débito e Receitas no saldo principal
        if(item.tipo === "receita"){
            totalReceitas += Number(item.valor) || 0;
        } else if (item.tipo === "despesa" || item.tipo === "gasto") {
            totalDespesas += Number(item.valor) || 0;
        }
    });

    // Saldo disponível real em conta corrente
    saldoDisponivel = salarioAtual + totalReceitas - totalDespesas;

    atualizarValoresTela();
}

// ======================================
// Atualizar valores na tela
// ======================================
function atualizarValoresTela(){
    const campoSaldo = document.getElementById("saldo");
    const campoSalario = document.getElementById("salario");
    const campoGastos = document.getElementById("gastos");
    const campoDisponivel = document.getElementById("disponivel");

    // Mantive o seu fallback inteligente de formatação
    const formatar = typeof formatarMoeda === "function" 
        ? formatarMoeda 
        : (valor) => `R$ ${Number(valor).toFixed(2).replace('.', ',')}`;

    if(campoSaldo) campoSaldo.innerHTML = formatar(saldoDisponivel);
    if(campoSalario) campoSalario.innerHTML = formatar(salarioAtual);
    if(campoGastos) campoGastos.innerHTML = formatar(totalDespesas);
    if(campoDisponivel) campoDisponivel.innerHTML = formatar(saldoDisponivel);
}

// ======================================
// Definir salário (Atualizado com Objeto e Regra)
// ======================================
function salvarSalario(){
    const campoValor = document.getElementById("novoSalario");
    const campoRegra = document.getElementById("regraPagamento");
    const usuario = (typeof usuarioAtual !== 'undefined' && usuarioAtual) ? usuarioAtual : "usuario_teste";

    if(!campoValor) return;

    // Se o input de máscara estiver ativo, limpamos a formatação antes de ler o float
    let valorTexto = campoValor.value.replace("R$ ", "").replace(/\./g, "").replace(",", ".");
    const valor = parseFloat(valorTexto);

    if(isNaN(valor) || valor < 0){
        alert("Informe um salário válido.");
        return;
    }

    // Coleta a regra do select inserido no HTML
    const regra = campoRegra ? campoRegra.value : "integral";

    // Monta a nova estrutura de configuração
    const configSalario = {
        valorTotal: valor,
        regra: regra
    };

    // Salva usando o seu método Storage padrão do sistema
    Storage.definirSalario(usuario, configSalario);

    atualizarCards();
    fecharModalSalario();
}

// ======================================
// Modal salário
// ======================================
function abrirModalSalario(){
    const modal = document.getElementById("modalSalario");
    if(modal){
        modal.style.display = "flex";
    }
}

function fecharModalSalario(){
    const modal = document.getElementById("modalSalario");
    if(modal){
        modal.style.display = "none";
    }
    const campo = document.getElementById("novoSalario");
    if(campo){
        campo.value = "";
    }
}

// ======================================
// Eventos
// ======================================
window.addEventListener("load", () => {
    const btnSalvarSalario = document.getElementById("btnSalvarSalario");
    if(btnSalvarSalario){
        btnSalvarSalario.addEventListener("click", salvarSalario);
    }

    carregarDashboard();
});

// ======================================
// Atualização automática
// ======================================
function atualizarDashboardCompleto(){
    carregarDashboard();
    if(typeof carregarLancamentos === "function"){
        carregarLancamentos();
    }
}

// ======================================
// Resumo financeiro
// ======================================
function obterResumoFinanceiro(){
    atualizarCards();
    return{
        salario: salarioAtual,
        receitas: totalReceitas,
        despesas: totalDespesas,
        saldo: saldoDisponivel
    };
}

// ======================================
// Recalcular Dashboard
// ======================================
function recalcularDashboard(){
    atualizarCards();
}

// ======================================
// Atualizações após ações
// ======================================
function atualizarAposLancamento(){
    atualizarDashboardCompleto();
}

function atualizarAposExclusao(){
    atualizarDashboardCompleto();
}

function atualizarAposEdicao(){
    atualizarDashboardCompleto();
}

function atualizarAposSalario(){
    atualizarDashboardCompleto();
}

// ======================================
// Navegação das telas (SPA)
// ======================================
document.querySelectorAll(".menu-item").forEach(item=>{
    item.addEventListener("click",()=>{
        document.querySelectorAll(".menu-item").forEach(menu=>{
            menu.classList.remove("ativo");
        });

        item.classList.add("ativo");

        document.querySelectorAll(".pagina").forEach(pagina=>{
            pagina.style.display="none";
        });

        const tela=item.getAttribute("data-tela");
        const pagina=document.getElementById(tela);

        if(pagina){
            pagina.style.display="block";
        }
    });
});

console.log("Dashboard carregado com sucesso.");
/* ==========================================================
   FINCONTROL
   UTILS.JS
   Funções utilitárias do sistema
========================================================== */

// ======================================
// Formatar moeda
// ======================================

function formatarMoeda(valor){

    valor = Number(valor) || 0;

    return valor.toLocaleString("pt-BR",{
        style:"currency",
        currency:"BRL"
    });

}

// ======================================
// Formatar data
// ======================================

function formatarData(data){

    if(!data) return "";

    const d = new Date(data);

    if(isNaN(d)) return data;

    return d.toLocaleDateString("pt-BR");

}

// ======================================
// Gerar ID único
// ======================================

function gerarId(){

    return Date.now() + Math.floor(Math.random() * 1000);

}

// ======================================
// Data atual
// ======================================

function dataAtual(){

    return new Date().toISOString();

}

// ======================================
// Mês atual (AAAA-MM)
// ======================================

function mesAtual(){

    const hoje = new Date();

    const ano = hoje.getFullYear();

    const mes = String(hoje.getMonth() + 1).padStart(2,"0");

    return `${ano}-${mes}`;

}

// ======================================
// Limpar formulário
// ======================================

function limparCampos(ids){

    ids.forEach(id=>{

        const campo = document.getElementById(id);

        if(campo){

            if(campo.tagName === "SELECT"){

                campo.selectedIndex = 0;

            }else{

                campo.value = "";

            }

        }

    });

}

// ======================================
// Validar número
// ======================================

function numeroValido(valor){

    return !isNaN(valor) && Number(valor) >= 0;

}

// ======================================
// Capitalizar texto
// ======================================

function capitalizar(texto){

    if(!texto) return "";

    return texto
        .toLowerCase()
        .replace(/\b\w/g, letra => letra.toUpperCase());

}

// ======================================
// Mostrar mensagem
// ======================================

function mostrarMensagem(texto){

    alert(texto);

}

// ======================================
// Confirmar ação
// ======================================

function confirmar(texto){

    return confirm(texto);

}

// ======================================
// Buscar elemento
// ======================================

function $(id){

    return document.getElementById(id);

}

// ======================================
// Somar receitas
// ======================================

function totalReceitas(lista){

    return lista
        .filter(item => item.tipo === "receita")
        .reduce((total,item)=> total + Number(item.valor),0);

}

// ======================================
// Somar despesas
// ======================================

function totalDespesas(lista){

    return lista
        .filter(item => item.tipo === "despesa")
        .reduce((total,item)=> total + Number(item.valor),0);

}

// ======================================
// Saldo disponível
// ======================================

function calcularSaldo(salario,lista){

    return Number(salario) + totalReceitas(lista) - totalDespesas(lista);

}

// ======================================
// Ordenar por data
// ======================================

function ordenarLancamentos(lista){

    return lista.sort((a,b)=> b.id - a.id);

}

// ======================================
// Log do sistema
// ======================================

function log(){

    console.log("[FinControl]",...arguments);

}

console.log("Utils carregado com sucesso.");
/* ==========================================================
   FINCONTROL
   APP.JS
========================================================== */

console.log("FinControl iniciado.");

// Usuário logado
let usuarioAtual = null;

// ======================================
// Inicialização
// ======================================

window.addEventListener("DOMContentLoaded", iniciarSistema);

function iniciarSistema() {

    console.log("Sistema carregado.");

    verificarUsuarioLogado();

}

// ======================================
// Verifica usuário logado
// ======================================

function verificarUsuarioLogado() {

    const usuario = Storage.obterUsuarioAtual();

    if (!usuario) {

        mostrarLogin();
        return;

    }

    usuarioAtual = usuario;

    mostrarSistema();

}

// ======================================
// Mostrar tela de login
// ======================================

function mostrarLogin() {

    const login = document.getElementById("loginScreen");
    const cadastro = document.getElementById("cadastroScreen");
    const app = document.getElementById("app");

    if (login) login.style.display = "flex";
    if (cadastro) cadastro.style.display = "none";
    if (app) app.style.display = "none";

}

// ======================================
// Mostrar sistema
// ======================================

function mostrarSistema() {

    const login = document.getElementById("loginScreen");
    const cadastro = document.getElementById("cadastroScreen");
    const app = document.getElementById("app");

    if (login) login.style.display = "none";
    if (cadastro) cadastro.style.display = "none";
    if (app) app.style.display = "flex";

    carregarUsuario();

    // Essas funções pertencem aos outros arquivos
    if (typeof carregarDashboard === "function") {
        carregarDashboard();
    }

    if (typeof carregarLancamentos === "function") {
        carregarLancamentos();
    }

}

// ======================================
// Carregar usuário
// ======================================

function carregarUsuario() {

    const dados = Storage.carregarUsuario(usuarioAtual);

    if (!dados) return;

    const nome = document.getElementById("nomeUsuario");

    if (nome) {
        nome.innerHTML = `Olá, ${dados.nome} 👋`;
    }

}

// ======================================
// Formatar moeda
// ======================================

function formatarMoeda(valor) {

    return Number(valor).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });

}
/* ==========================================================
   FINCONTROL - AUTH.JS (SESSÃO + TROCA DE TELAS SPA)
========================================================== */

const loginScreen = document.getElementById("loginScreen");
const cadastroScreen = document.getElementById("cadastroScreen");
const app = document.getElementById("app");

const btnEntrar = document.getElementById("btnEntrar");
const btnAbrirCadastro = document.getElementById("btnAbrirCadastro");
const btnSalvarCadastro = document.getElementById("btnSalvarCadastro");
const btnVoltarLogin = document.getElementById("btnVoltarLogin");

let codigoEnviadoSMS = null;

// Configurar navegação dos menus
document.addEventListener("DOMContentLoaded", () => {
    const itensMenu = document.querySelectorAll(".item-menu");
    itensMenu.forEach(item => {
        item.addEventListener("click", () => {
            const idTelaDestino = item.getAttribute("data-tela");
            navegarPara(idTelaDestino, item);
        });
    });
});

// Função que realiza a troca fluida de telas no app
function navegarPara(idTela, elementoClicado) {
    // Esconde todas as abas
    const abas = document.querySelectorAll(".view-aba");
    abas.forEach(aba => aba.style.display = "none");

    // Remove a classe ativo de todos os botões do menu
    const itensMenu = document.querySelectorAll(".item-menu");
    itensMenu.forEach(item => item.classList.remove("ativo"));

    // Mostra a tela desejada
    const telaDestino = document.getElementById(idTela);
    if (telaDestino) {
        telaDestino.style.display = "block";
    }

    // Adiciona o destaque no ícone do menu
    if (elementoClicado) {
        elementoClicado.classList.add("ativo");
    }
}

function abrirCadastro() {
    if (loginScreen) loginScreen.style.setProperty("display", "none", "important");
    if (app) app.style.setProperty("display", "none", "important");
    if (cadastroScreen) cadastroScreen.style.setProperty("display", "flex", "important");
}

function voltarLogin() {
    if (cadastroScreen) cadastroScreen.style.setProperty("display", "none", "important");
    if (app) app.style.setProperty("display", "none", "important");
    if (loginScreen) loginScreen.style.setProperty("display", "flex", "important");
}

function cadastrar() {
    const nome = document.getElementById("cadNome")?.value.trim();
    const usuario = document.getElementById("cadUsuario")?.value.trim();
    const senha = document.getElementById("cadSenha")?.value;
    const confirmar = document.getElementById("cadConfirmar")?.value;

    if (!nome || !usuario || !senha) {
        alert("Preencha todos os campos.");
        return;
    }

    if (senha !== confirmar) {
        alert("As senhas não conferem.");
        return;
    }

    if (typeof Storage !== "undefined" && Storage.usuarioExiste && Storage.usuarioExiste(usuario)) {
        alert("Usuário já cadastrado.");
        return;
    }

    if (typeof Storage !== "undefined" && Storage.salvarUsuario) {
        Storage.salvarUsuario(usuario, {
            nome,
            usuario,
            senha,
            salario: 0,
            lancamentos: []
        });
    }

    alert("Conta criada com sucesso!");
    voltarLogin();
}

function entrar() {
    const usuario = document.getElementById("loginUsuario")?.value.trim();
    const senha = document.getElementById("loginSenha")?.value;

    let dados = null;
    if (typeof Storage !== "undefined" && Storage.carregarUsuario) {
        dados = Storage.carregarUsuario(usuario);
    }

    if (!dados) {
        alert("Usuário não encontrado.");
        return;
    }

    if (dados.senha !== senha) {
        alert("Senha incorreta.");
        return;
    }

    if (typeof Storage !== "undefined" && Storage.salvarUsuarioAtual) {
        Storage.salvarUsuarioAtual(usuario);
    }

    // Esconde o login e abre o app
    if (loginScreen) loginScreen.style.setProperty("display", "none", "important");
    if (cadastroScreen) cadastroScreen.style.setProperty("display", "none", "important");
    if (app) app.style.setProperty("display", "flex", "important");

    const nome = document.getElementById("nomeUsuario");
    if (nome) nome.innerHTML = `Olá, ${dados.nome} 👋`;

    if (typeof carregarDashboard === "function") carregarDashboard();
    if (typeof carregarLancamentos === "function") carregarLancamentos();
}

function sair() {
    if (typeof Storage !== "undefined" && Storage.sair) Storage.sair();
    if (app) app.style.setProperty("display", "none", "important");
    if (cadastroScreen) cadastroScreen.style.setProperty("display", "none", "important");
    if (loginScreen) loginScreen.style.setProperty("display", "flex", "important");
}

function abrirEsqueciSenha() {
    const modal = document.getElementById("modalEsqueciSenha");
    if (modal) {
        modal.style.setProperty("display", "flex", "important");
        document.getElementById("passoTelefone").style.display = "block";
        document.getElementById("passoCodigo").style.display = "none";
    }
}

function fecharEsqueciSenha() {
    const modal = document.getElementById("modalEsqueciSenha");
    if (modal) modal.style.setProperty("display", "none", "important");
}

function enviarCodigoSMS() {
    const telefone = document.getElementById("smsTelefone")?.value.trim();

    if (!telefone) {
        alert("Por favor, digite o número do celular.");
        return;
    }

    codigoEnviadoSMS = Math.floor(100000 + Math.random() * 900000).toString();
    alert(`[SMS FINCONTROL] Código enviado para ${telefone}: ${codigoEnviadoSMS}`);

    document.getElementById("passoTelefone").style.display = "none";
    document.getElementById("passoCodigo").style.display = "block";
}

function validarEResetarSenha() {
    const codigoDig = document.getElementById("smsCodigo")?.value.trim();
    const novaSenha = document.getElementById("novaSenhaSMS")?.value;
    const usuario = document.getElementById("loginUsuario")?.value.trim();

    if (codigoDig !== codigoEnviadoSMS) {
        alert("Código de verificação incorreto!");
        return;
    }

    if (!novaSenha) {
        alert("Digite a nova senha.");
        return;
    }

    if (typeof Storage !== "undefined" && Storage.carregarUsuario) {
        const dados = Storage.carregarUsuario(usuario);
        if (dados) {
            dados.senha = novaSenha;
            Storage.salvarUsuario(usuario, dados);
            alert("Senha alterada com sucesso! Faça login com a nova senha.");
            fecharEsqueciSenha();
        } else {
            alert("Preencha o campo Username na tela de login com seu usuário antes de redefinir.");
        }
    }
}

window.addEventListener("load", () => {
    let usuarioSalvo = null;
    if (typeof Storage !== "undefined" && Storage.obterUsuarioAtual) {
        usuarioSalvo = Storage.obterUsuarioAtual();
    }

    if (!usuarioSalvo) {
        if (app) app.style.setProperty("display", "none", "important");
        if (cadastroScreen) cadastroScreen.style.setProperty("display", "none", "important");
        if (loginScreen) loginScreen.style.setProperty("display", "flex", "important");
        return;
    }

    let dados = null;
    if (typeof Storage !== "undefined" && Storage.carregarUsuario) {
        dados = Storage.carregarUsuario(usuarioSalvo);
    }

    if (!dados) {
        if (app) app.style.setProperty("display", "none", "important");
        if (cadastroScreen) cadastroScreen.style.setProperty("display", "none", "important");
        if (loginScreen) loginScreen.style.setProperty("display", "flex", "important");
        return;
    }

    if (loginScreen) loginScreen.style.setProperty("display", "none", "important");
    if (cadastroScreen) cadastroScreen.style.setProperty("display", "none", "important");
    if (app) app.style.setProperty("display", "flex", "important");

    const nome = document.getElementById("nomeUsuario");
    if (nome) nome.innerHTML = `Olá, ${dados.nome} 👋`;

    if (typeof carregarDashboard === "function") carregarDashboard();
    if (typeof carregarLancamentos === "function") carregarLancamentos();
});

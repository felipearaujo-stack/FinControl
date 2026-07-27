/* ==========================================================
   FINCONTROL - AUTH.JS
   Autenticação, Recuperação via SMS e Sessão de Usuário
========================================================== */

const loginScreen = document.getElementById("loginScreen");
const cadastroScreen = document.getElementById("cadastroScreen");
const app = document.getElementById("app");

const btnEntrar = document.getElementById("btnEntrar");
const btnAbrirCadastro = document.getElementById("btnAbrirCadastro");
const btnSalvarCadastro = document.getElementById("btnSalvarCadastro");
const btnVoltarLogin = document.getElementById("btnVoltarLogin");
const btnSair = document.getElementById("btnSair");

// Variáveis para controle da recuperação por SMS
let codigoEnviadoSMS = null;

// Eventos de Navegação das Telas
btnAbrirCadastro?.addEventListener("click", abrirCadastro);
btnVoltarLogin?.addEventListener("click", voltarLogin);
btnSalvarCadastro?.addEventListener("click", cadastrar);
btnSair?.addEventListener("click", sair);

function abrirCadastro() {
    if (loginScreen) loginScreen.style.display = "none";
    if (app) app.style.display = "none";
    if (cadastroScreen) cadastroScreen.style.display = "flex";
}

function voltarLogin() {
    if (cadastroScreen) cadastroScreen.style.display = "none";
    if (app) app.style.display = "none";
    if (loginScreen) loginScreen.style.display = "flex";
}

// ----------------------------------------------------------
// Funções de Login e Cadastro
// ----------------------------------------------------------
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

    if (Storage.usuarioExiste(usuario)) {
        alert("Usuário já cadastrado.");
        return;
    }

    Storage.salvarUsuario(usuario, {
        nome,
        usuario,
        senha,
        salario: 0,
        lancamentos: []
    });

    alert("Conta criada com sucesso!");
    voltarLogin();
}

function entrar() {
    const usuario = document.getElementById("loginUsuario")?.value.trim();
    const senha = document.getElementById("loginSenha")?.value;

    const dados = Storage.carregarUsuario(usuario);

    if (!dados) {
        alert("Usuário não encontrado.");
        return;
    }

    if (dados.senha !== senha) {
        alert("Senha incorreta.");
        return;
    }

    // Grava a sessão logada no LocalStorage
    Storage.salvarUsuarioAtual(usuario);

    // Alterna visualização das telas
    if (loginScreen) loginScreen.style.display = "none";
    if (cadastroScreen) cadastroScreen.style.display = "none";
    if (app) app.style.display = "flex";

    const nome = document.getElementById("nomeUsuario");
    if (nome) nome.innerHTML = `Olá, ${dados.nome} 👋`;

    if (typeof carregarDashboard === "function") carregarDashboard();
    if (typeof carregarLancamentos === "function") carregarLancamentos();
}

function sair() {
    Storage.sair(); // Remove sessão salva
    if (app) app.style.display = "none";
    if (cadastroScreen) cadastroScreen.style.display = "none";
    if (loginScreen) loginScreen.style.display = "flex";
}

// ----------------------------------------------------------
// Recuperação de Senha por SMS
// ----------------------------------------------------------
function abrirEsqueciSenha() {
    const modal = document.getElementById("modalEsqueciSenha");
    if (modal) {
        modal.style.display = "flex";
        document.getElementById("passoTelefone").style.display = "block";
        document.getElementById("passoCodigo").style.display = "none";
    }
}

function fecharEsqueciSenha() {
    const modal = document.getElementById("modalEsqueciSenha");
    if (modal) modal.style.display = "none";
}

function enviarCodigoSMS() {
    const telefone = document.getElementById("smsTelefone")?.value.trim();

    if (!telefone) {
        alert("Por favor, digite o número do celular.");
        return;
    }

    // Gera um código de 6 dígitos aleatórios
    codigoEnviadoSMS = Math.floor(100000 + Math.random() * 900000).toString();

    // Simulação do SMS
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

    const dados = Storage.carregarUsuario(usuario);
    if (dados) {
        dados.senha = novaSenha;
        Storage.salvarUsuario(usuario, dados);
        alert("Senha alterada com sucesso! Faça login com a nova senha.");
        fecharEsqueciSenha();
    } else {
        alert("Digite o nome de usuário no campo de login antes de redefinir.");
    }
}

// ----------------------------------------------------------
// Login Automático ao Abrir o Link
// ----------------------------------------------------------
window.addEventListener("load", () => {
    const usuarioSalvo = Storage.obterUsuarioAtual();

    if (!usuarioSalvo) {
        if (app) app.style.display = "none";
        if (cadastroScreen) cadastroScreen.style.display = "none";
        if (loginScreen) loginScreen.style.display = "flex";
        return;
    }

    const dados = Storage.carregarUsuario(usuarioSalvo);

    if (!dados) {
        if (app) app.style.display = "none";
        if (loginScreen) loginScreen.style.display = "flex";
        return;
    }

    // Se já estiver logado, exibe direto o aplicativo
    if (loginScreen) loginScreen.style.display = "none";
    if (cadastroScreen) cadastroScreen.style.display = "none";
    if (app) app.style.display = "flex";

    const nome = document.getElementById("nomeUsuario");
    if (nome) nome.innerHTML = `Olá, ${dados.nome} 👋`;

    if (typeof carregarDashboard === "function") carregarDashboard();
    if (typeof carregarLancamentos === "function") carregarLancamentos();
});

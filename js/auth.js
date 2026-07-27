/* ==========================================================
   FINCONTROL - AUTH.JS (SESSÃO SALVA + TELA ISOLADA)
========================================================== */

const loginScreen = document.getElementById("loginScreen");
const cadastroScreen = document.getElementById("cadastroScreen");
const app = document.getElementById("app");

const btnEntrar = document.getElementById("btnEntrar");
const btnAbrirCadastro = document.getElementById("btnAbrirCadastro");
const btnSalvarCadastro = document.getElementById("btnSalvarCadastro");
const btnVoltarLogin = document.getElementById("btnVoltarLogin");
const btnSair = document.getElementById("btnSair");

// Eventos dos Botões
btnAbrirCadastro?.addEventListener("click", abrirCadastro);
btnVoltarLogin?.addEventListener("click", voltarLogin);
btnSalvarCadastro?.addEventListener("click", cadastrar);
btnEntrar?.addEventListener("click", entrar);
btnSair?.addEventListener("click", sair);

function abrirCadastro(){
    if(loginScreen) loginScreen.style.display = "none";
    if(app) app.style.display = "none";
    if(cadastroScreen) cadastroScreen.style.display = "flex";
}

function voltarLogin(){
    if(cadastroScreen) cadastroScreen.style.display = "none";
    if(app) app.style.display = "none";
    if(loginScreen) loginScreen.style.display = "flex";
}

// Fazer Login
function entrar(){
    const usuario = document.getElementById("loginUsuario")?.value.trim();
    const senha = document.getElementById("loginSenha")?.value;

    const dados = Storage.carregarUsuario(usuario);

    if(!dados){
        alert("Usuário não encontrado.");
        return;
    }

    if(dados.senha !== senha){
        alert("Senha incorreta.");
        return;
    }

    // SALVA A SESSÃO NO NAVEGADOR
    Storage.salvarUsuarioAtual(usuario);

    // Oculta login e mostra o App
    if(loginScreen) loginScreen.style.display = "none";
    if(cadastroScreen) cadastroScreen.style.display = "none";
    if(app) app.style.display = "flex";

    const nome = document.getElementById("nomeUsuario");
    if(nome) nome.innerHTML = `Olá, ${dados.nome} 👋`;

    if(typeof carregarDashboard === "function") carregarDashboard();
    if(typeof carregarLancamentos === "function") carregarLancamentos();
}

// Sair da Conta
function sair(){
    Storage.sair(); // Limpa o usuário salvo
    if(app) app.style.display = "none";
    if(cadastroScreen) cadastroScreen.style.display = "none";
    if(loginScreen) loginScreen.style.display = "flex";
}

// INICIALIZAÇÃO INTELIGENTE (VERIFICA SE JÁ ESTÁ LOGADO)
window.addEventListener("load", ()=>{
    const usuarioSalvo = Storage.obterUsuarioAtual();

    if(!usuarioSalvo){
        // Se NÃO estiver logado, mostra SÓ a tela de login centralizada
        if(app) app.style.display = "none";
        if(cadastroScreen) cadastroScreen.style.display = "none";
        if(loginScreen) loginScreen.style.display = "flex";
        return;
    }

    const dados = Storage.carregarUsuario(usuarioSalvo);

    if(!dados){
        if(app) app.style.display = "none";
        if(loginScreen) loginScreen.style.display = "flex";
        return;
    }

    // Se já estiver logado, entra direto na Dashboard!
    if(loginScreen) loginScreen.style.display = "none";
    if(cadastroScreen) cadastroScreen.style.display = "none";
    if(app) app.style.display = "flex";

    const nome = document.getElementById("nomeUsuario");
    if(nome) nome.innerHTML = `Olá, ${dados.nome} 👋`;

    if(typeof carregarDashboard === "function") carregarDashboard();
    if(typeof carregarLancamentos === "function") carregarLancamentos();
});

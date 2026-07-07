/* ==========================================================
   FINCONTROL
   AUTH.JS
========================================================== */

const loginScreen = document.getElementById("loginScreen");
const cadastroScreen = document.getElementById("cadastroScreen");
const app = document.getElementById("app");

const btnEntrar = document.getElementById("btnEntrar");
const btnAbrirCadastro = document.getElementById("btnAbrirCadastro");
const btnSalvarCadastro = document.getElementById("btnSalvarCadastro");
const btnVoltarLogin = document.getElementById("btnVoltarLogin");
const btnSair = document.getElementById("btnSair");

// =========================
// Eventos
// =========================

btnAbrirCadastro?.addEventListener("click", abrirCadastro);
btnVoltarLogin?.addEventListener("click", voltarLogin);
btnSalvarCadastro?.addEventListener("click", cadastrar);
btnEntrar?.addEventListener("click", entrar);
btnSair?.addEventListener("click", sair);

// =========================
// Telas
// =========================

function abrirCadastro(){

    loginScreen.style.display = "none";
    cadastroScreen.style.display = "flex";

}

function voltarLogin(){

    cadastroScreen.style.display = "none";
    loginScreen.style.display = "flex";

}

// =========================
// Cadastro
// =========================

function cadastrar(){

    const nome = document.getElementById("cadNome").value.trim();
    const usuario = document.getElementById("cadUsuario").value.trim();
    const senha = document.getElementById("cadSenha").value;
    const confirmar = document.getElementById("cadConfirmar").value;

    if(nome === "" || usuario === "" || senha === ""){

        alert("Preencha todos os campos.");
        return;

    }

    if(senha !== confirmar){

        alert("As senhas não conferem.");
        return;

    }

    if(Storage.usuarioExiste(usuario)){

        alert("Usuário já cadastrado.");
        return;

    }

    Storage.salvarUsuario(usuario,{

        nome,
        usuario,
        senha,
        salario:0,
        lancamentos:[]

    });

    alert("Conta criada com sucesso!");

    voltarLogin();

}

// =========================
// Login
// =========================

function entrar(){

    const usuario = document.getElementById("loginUsuario").value.trim();
    const senha = document.getElementById("loginSenha").value;

    const dados = Storage.carregarUsuario(usuario);

    if(!dados){

        alert("Usuário não encontrado.");
        return;

    }

    if(dados.senha !== senha){

        alert("Senha incorreta.");
        return;

    }

    usuarioAtual = usuario;

    Storage.salvarUsuarioAtual(usuario);

    loginScreen.style.display = "none";
    cadastroScreen.style.display = "none";
    app.style.display = "flex";

    const nome = document.getElementById("nomeUsuario");

    if(nome){

        nome.innerHTML = `Olá, ${dados.nome} 👋`;

    }

    if(typeof carregarDashboard === "function"){

        carregarDashboard();

    }

    if(typeof carregarLancamentos === "function"){

        carregarLancamentos();

    }

}

// =========================
// Logout
// =========================

function sair(){

    usuarioAtual = null;

    Storage.sair();

    app.style.display = "none";
    cadastroScreen.style.display = "none";
    loginScreen.style.display = "flex";

}

// =========================
// Login automático
// =========================

window.addEventListener("load",()=>{

    const usuario = Storage.obterUsuarioAtual();

    if(!usuario) return;

    const dados = Storage.carregarUsuario(usuario);

    if(!dados) return;

    usuarioAtual = usuario;

    loginScreen.style.display = "none";
    cadastroScreen.style.display = "none";
    app.style.display = "flex";

    const nome = document.getElementById("nomeUsuario");

    if(nome){

        nome.innerHTML = `Olá, ${dados.nome} 👋`;

    }

    if(typeof carregarDashboard === "function"){

        carregarDashboard();

    }

    if(typeof carregarLancamentos === "function"){

        carregarLancamentos();

    }

});

console.log("Auth carregado com sucesso.");
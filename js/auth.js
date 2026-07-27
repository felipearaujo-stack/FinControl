/* ==========================================================
   FINCONTROL - AUTH.JS
========================================================== */

const loginScreen = document.getElementById("loginScreen");
const cadastroScreen = document.getElementById("cadastroScreen");
const app = document.getElementById("app");

let codigoEnviadoSMS = null;

// FUNÇÃO INFALÍVEL DE TROCA DE TELAS / ABAS NO APP
function mudarAba(nomeAba, elemento) {
    // 1. Esconde todas as abas da dashboard
    const abas = document.querySelectorAll('.view-aba');
    abas.forEach(aba => {
        aba.style.display = 'none';
    });

    // 2. Remove o destaque visual de todos os botões do menu
    const botoesMenu = document.querySelectorAll('.item-menu');
    botoesMenu.forEach(btn => {
        btn.classList.remove('ativo');
    });

    // 3. Exibe a aba clicada
    const abaAlvo = document.getElementById(nomeAba);
    if (abaAlvo) {
        abaAlvo.style.display = 'block';
    }

    // 4. Marca o botão atual como ativo
    if (elemento) {
        elemento.classList.add('ativo');
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
    } else {
        // Fallback direto de segurança caso o Storage do navegador não tenha carregado a classe
        dados = JSON.parse(localStorage.getItem(`user_${usuario}`));
    }

    if (!dados) {
        alert("Usuário não encontrado. Crie uma conta no link 'Criar conta'.");
        return;
    }

    if (dados.senha !== senha) {
        alert("Senha incorreta.");
        return;
    }

    localStorage.setItem("usuarioAtual", usuario);

    if (loginScreen) loginScreen.style.setProperty("display", "none", "important");
    if (cadastroScreen) cadastroScreen.style.setProperty("display", "none", "important");
    if (app) app.style.setProperty("display", "flex", "important");

    const nome = document.getElementById("nomeUsuario");
    if (nome) nome.innerHTML = `Olá, ${dados.nome || usuario} 👋`;
}

function sair() {
    localStorage.removeItem("usuarioAtual");
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

    let dados = JSON.parse(localStorage.getItem(`user_${usuario}`));

    if (dados) {
        dados.senha = novaSenha;
        localStorage.setItem(`user_${usuario}`, JSON.stringify(dados));
        alert("Senha alterada com sucesso! Faça login com a nova senha.");
        fecharEsqueciSenha();
    } else {
        alert("Preencha o campo Username com seu usuário antes de redefinir.");
    }
}

// INICIALIZAÇÃO
window.addEventListener("load", () => {
    const usuarioSalvo = localStorage.getItem("usuarioAtual");

    if (!usuarioSalvo) {
        if (app) app.style.setProperty("display", "none", "important");
        if (cadastroScreen) cadastroScreen.style.setProperty("display", "none", "important");
        if (loginScreen) loginScreen.style.setProperty("display", "flex", "important");
        return;
    }

    const dados = JSON.parse(localStorage.getItem(`user_${usuarioSalvo}`));

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
    if (nome) nome.innerHTML = `Olá, ${dados.nome || usuarioSalvo} 👋`;
});

/* ==========================================================
   FINCONTROL - AUTH.JS (SESSÃO LIMPA NA INICIALIZAÇÃO)
========================================================== */

// CONFIGURAÇÃO CONECTADA AO SEU PROJETO FIREBASE
const firebaseConfig = {
    apiKey: "AIzaSyAny6KFQqQGUqxXd1eaXJJAQHywvPktJk8",
    authDomain: "fincontrol-585a1.firebaseapp.com",
    projectId: "fincontrol-585a1",
    storageBucket: "fincontrol-585a1.firebasestorage.app",
    messagingSenderId: "5319046566",
    appId: "1:5319046566:web:b8ff86c30b404dc15e4b67",
    measurementId: "G-96GNY6VEDX"
};

// Inicializa o Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();
const db = firebase.firestore();

const loginScreen = document.getElementById("loginScreen");
const cadastroScreen = document.getElementById("cadastroScreen");
const app = document.getElementById("app");

let abaAtual = 'viewDash';
let usuarioLogadoUid = null;

// FECHA ABSOLUTAMENTE TODOS OS MODAIS DA TELA
function fecharTodosModais() {
    const ids = ["modalNovoLancamento", "modalNovoCartao", "modalNovaMeta"];
    ids.forEach(id => {
        const modal = document.getElementById(id);
        if (modal) modal.style.setProperty("display", "none", "important");
    });
}

// FORÇA A EXIBIÇÃO APENAS DA TELA DE LOGIN
function exibirLoginInicial() {
    fecharTodosModais();
    if (app) app.style.setProperty("display", "none", "important");
    if (cadastroScreen) cadastroScreen.style.setProperty("display", "none", "important");
    if (loginScreen) loginScreen.style.setProperty("display", "flex", "important");
}

// EXECUTA AO CARREGAR A PÁGINA: GARANTE LOGIN LIMPO
exibirLoginInicial();

// Helper para converter usuário em e-mail válido para o Firebase
function usuarioParaEmail(usuario) {
    const userLimpo = usuario.trim().toLowerCase().replace(/\s+/g, '');
    return `${userLimpo}@fincontrol.app`;
}

// AÇÃO DO BOTÃO FLUTUANTE (+)
function acaoBotaoAdd() {
    if (abaAtual === 'viewCartoes') {
        abrirModalCartao();
    } else if (abaAtual === 'viewMetas') {
        abrirModalMeta();
    } else {
        abrirModalLancamento();
    }
}

// CONTROLE DOS MODAIS
function abrirModalLancamento() {
    fecharTodosModais();
    const modal = document.getElementById("modalNovoLancamento");
    if (modal) modal.style.setProperty("display", "flex", "important");
}

function fecharModalLancamento() {
    const modal = document.getElementById("modalNovoLancamento");
    if (modal) modal.style.setProperty("display", "none", "important");
}

function abrirModalCartao() {
    fecharTodosModais();
    const modal = document.getElementById("modalNovoCartao");
    if (modal) modal.style.setProperty("display", "flex", "important");
}

function fecharModalCartao() {
    const modal = document.getElementById("modalNovoCartao");
    if (modal) modal.style.setProperty("display", "none", "important");
}

function abrirModalMeta() {
    fecharTodosModais();
    const modal = document.getElementById("modalNovaMeta");
    if (modal) modal.style.setProperty("display", "flex", "important");
}

function fecharModalMeta() {
    const modal = document.getElementById("modalNovaMeta");
    if (modal) modal.style.setProperty("display", "none", "important");
}

// SALVAR LANÇAMENTO
async function salvarNovoLancamento() {
    const desc = document.getElementById("lancDescricao")?.value.trim();
    const valor = parseFloat(document.getElementById("lancValor")?.value);
    const tipo = document.getElementById("lancTipo")?.value;
    const formaPagamento = document.getElementById("lancFormaPagamento")?.value;
    const categoria = document.getElementById("lancCategoria")?.value;

    if (!desc || isNaN(valor) || valor <= 0 || !usuarioLogadoUid) {
        alert("Preencha a descrição e o valor corretamente.");
        return;
    }

    try {
        const docRef = db.collection("usuarios").doc(usuarioLogadoUid);
        const docSnap = await docRef.get();
        let dados = docSnap.exists ? docSnap.data() : {};

        if (!dados.lancamentos) dados.lancamentos = [];

        dados.lancamentos.unshift({
            descricao: desc,
            valor: valor,
            tipo: tipo,
            formaPagamento: formaPagamento,
            categoria: categoria,
            data: new Date().toLocaleDateString('pt-BR')
        });

        await docRef.set(dados, { merge: true });

        document.getElementById("lancDescricao").value = "";
        document.getElementById("lancValor").value = "";
        fecharModalLancamento();

        atualizarTudo(dados);
        alert("Lançamento salvo na nuvem!");
    } catch (e) {
        alert("Erro ao salvar no Firebase: " + e.message);
    }
}

// SALVAR CARTÃO
async function salvarNovoCartao() {
    const banco = document.getElementById("cardBanco")?.value.trim();
    const tipo = document.getElementById("cardTipo")?.value;
    const saldoDebito = parseFloat(document.getElementById("cardSaldoDebito")?.value) || 0;
    const limiteCredito = parseFloat(document.getElementById("cardLimiteCredito")?.value) || 0;
    const vencimento = document.getElementById("cardVencimento")?.value || "--";

    if (!banco || !usuarioLogadoUid) {
        alert("Informe o nome do Banco ou Instituição.");
        return;
    }

    try {
        const docRef = db.collection("usuarios").doc(usuarioLogadoUid);
        const docSnap = await docRef.get();
        let dados = docSnap.exists ? docSnap.data() : {};

        if (!dados.cartoes) dados.cartoes = [];

        dados.cartoes.push({ banco, tipo, saldoDebito, limiteCredito, vencimento });

        await docRef.set(dados, { merge: true });

        document.getElementById("cardBanco").value = "";
        document.getElementById("cardSaldoDebito").value = "";
        document.getElementById("cardLimiteCredito").value = "";
        document.getElementById("cardVencimento").value = "";

        fecharModalCartao();
        atualizarTudo(dados);
        alert("Cartão salvo na nuvem!");
    } catch (e) {
        alert("Erro ao salvar cartão: " + e.message);
    }
}

// SALVAR META
async function salvarNovaMeta() {
    const nomeMeta = document.getElementById("metaNome")?.value.trim();
    const valorTotal = parseFloat(document.getElementById("metaValorTotal")?.value);
    const meses = parseInt(document.getElementById("metaMeses")?.value);

    if (!nomeMeta || isNaN(valorTotal) || isNaN(meses) || meses <= 0 || !usuarioLogadoUid) {
        alert("Preencha todos os campos da meta.");
        return;
    }

    try {
        const docRef = db.collection("usuarios").doc(usuarioLogadoUid);
        const docSnap = await docRef.get();
        let dados = docSnap.exists ? docSnap.data() : {};

        if (!dados.metas) dados.metas = [];

        dados.metas.push({ nome: nomeMeta, valorTotal, meses, guardado: 0 });

        await docRef.set(dados, { merge: true });

        document.getElementById("metaNome").value = "";
        document.getElementById("metaValorTotal").value = "";
        document.getElementById("metaMeses").value = "";

        fecharModalMeta();
        atualizarTudo(dados);
        alert("Meta salva na nuvem!");
    } catch (e) {
        alert("Erro ao salvar meta: " + e.message);
    }
}

// SALVAR SALÁRIO
async function salvarSalario() {
    const valorInput = parseFloat(document.getElementById("inputSalario")?.value);

    if (isNaN(valorInput) || valorInput <= 0 || !usuarioLogadoUid) {
        alert("Por favor, informe um valor de salário válido.");
        return;
    }

    try {
        const docRef = db.collection("usuarios").doc(usuarioLogadoUid);
        await docRef.set({ salario: valorInput }, { merge: true });

        const docSnap = await docRef.get();
        atualizarTudo(docSnap.data());
        alert(`Salário de R$ ${valorInput.toLocaleString('pt-BR', {minimumFractionDigits: 2})} salvo na nuvem!`);
    } catch (e) {
        alert("Erro ao salvar salário: " + e.message);
    }
}

// ATUALIZA A TELA COM OS DADOS NUVEM
function atualizarTudo(dados = {}) {
    const salario = dados.salario || 0;
    const lista = dados.lancamentos || [];
    const cartoes = dados.cartoes || [];
    const metas = dados.metas || [];

    let totalEntradas = salario;
    let totalSaidas = 0;

    lista.forEach(item => {
        if (item.tipo === "entrada") totalEntradas += item.valor;
        if (item.tipo === "saida") totalSaidas += item.valor;
    });

    const saldoDisponivel = totalEntradas - totalSaidas;

    const elSaldo = document.getElementById("valSaldo");
    const elEntradas = document.getElementById("valEntradas");
    const elSaidas = document.getElementById("valSaidas");
    const elInputSalario = document.getElementById("inputSalario");

    if (elSaldo) elSaldo.innerHTML = `R$ ${saldoDisponivel.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
    if (elEntradas) elEntradas.innerHTML = `R$ ${totalEntradas.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
    if (elSaidas) elSaidas.innerHTML = `R$ ${totalSaidas.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
    if (elInputSalario && salario > 0) elInputSalario.value = salario;

    // Renderiza Histórico
    const containerHist = document.getElementById("containerHistorico");
    if (containerHist) {
        if (lista.length === 0 && salario === 0) {
            containerHist.innerHTML = `<p style="color: #64748B; padding: 16px;">Nenhum lançamento cadastrado.</p>`;
        } else {
            let htmlHist = "";
            if (salario > 0) {
                htmlHist += `
                    <div class="lancamento">
                        <div><strong>Salário Base</strong><br><span style="font-size:12px; color:#94A3B8;">Fixo</span></div>
                        <span class="valor-positivo">+ R$ ${salario.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
                    </div>`;
            }
            lista.forEach(item => {
                const sinal = item.tipo === "entrada" ? "+" : "-";
                const classeCor = item.tipo === "entrada" ? "valor-positivo" : "valor-negativo";
                htmlHist += `
                    <div class="lancamento">
                        <div><strong>${item.descricao}</strong><br><span style="font-size:12px; color:#94A3B8;">${item.data} - ${item.categoria}</span></div>
                        <span class="${classeCor}">${sinal} R$ ${item.valor.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
                    </div>`;
            });
            containerHist.innerHTML = htmlHist;
        }
    }

    // Renderiza Cartões
    const containerCartoes = document.getElementById("containerCartoes");
    if (containerCartoes) {
        if (cartoes.length === 0) {
            containerCartoes.innerHTML = `<p style="color: #64748B;">Nenhum cartão cadastrado. Clique no + para adicionar.</p>`;
        } else {
            let htmlCartoes = "";
            cartoes.forEach(c => {
                htmlCartoes += `
                    <div style="background: #1E293B; padding: 16px; border-radius: 12px; margin-bottom: 12px;">
                        <strong style="color: #F59E0B; text-transform: uppercase;">${c.banco}</strong>
                        <p style="font-size: 13px; color: #94A3B8; margin-top: 4px;">Tipo: ${c.tipo}</p>
                        <p style="font-size: 15px; font-weight: 700; color: #10B981; margin-top: 6px;">Saldo Débito: R$ ${c.saldoDebito.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
                        <p style="font-size: 13px; color: #FFF; margin-top: 4px;">Limite Crédito: R$ ${c.limiteCredito.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
                    </div>`;
            });
            containerCartoes.innerHTML = htmlCartoes;
        }
    }

    // Renderiza Metas
    const containerMetas = document.getElementById("containerMetas");
    if (containerMetas) {
        if (metas.length === 0) {
            containerMetas.innerHTML = `<p style="color: #64748B;">Nenhuma meta cadastrada. Clique no + para criar.</p>`;
        } else {
            let htmlMetas = "";
            metas.forEach(m => {
                const mensalidade = m.valorTotal / m.meses;
                htmlMetas += `
                    <div style="background: #1E293B; padding: 16px; border-radius: 12px; margin-bottom: 12px;">
                        <strong>🎯 ${m.nome}</strong>
                        <p style="font-size: 13px; color: #94A3B8; margin-top: 6px;">Meta: R$ ${m.valorTotal.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
                        <p style="font-size: 13px; color: #3B82F6; margin-top: 4px;">Guardar: R$ ${mensalidade.toLocaleString('pt-BR', {minimumFractionDigits: 2})}/mês em ${m.meses}x</p>
                    </div>`;
            });
            containerMetas.innerHTML = htmlMetas;
        }
    }
}

// LOGIN E CADASTRO
async function cadastrar() {
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

    try {
        const email = usuarioParaEmail(usuario);
        const userCredential = await auth.createUserWithEmailAndPassword(email, senha);
        const user = userCredential.user;

        await db.collection("usuarios").doc(user.uid).set({
            nome: nome,
            usuario: usuario,
            salario: 0,
            lancamentos: [],
            cartoes: [],
            metas: []
        });

        alert("Conta criada com sucesso! Faça login para entrar.");
        voltarLogin();
    } catch (e) {
        alert("Erro no cadastro: " + e.message);
    }
}

async function entrar() {
    const usuario = document.getElementById("loginUsuario")?.value.trim();
    const senha = document.getElementById("loginSenha")?.value;

    if (!usuario || !senha) {
        alert("Digite seu usuário e senha.");
        return;
    }

    try {
        const email = usuarioParaEmail(usuario);
        await auth.signInWithEmailAndPassword(email, senha);
    } catch (e) {
        alert("Falha no login: Usuário ou senha incorretos.");
    }
}

function sair() {
    auth.signOut();
}

// OBSERVADOR DE AUTENTICAÇÃO DO FIREBASE
auth.onAuthStateChanged(async (user) => {
    if (user) {
        usuarioLogadoUid = user.uid;

        fecharTodosModais();
        if (loginScreen) loginScreen.style.setProperty("display", "none", "important");
        if (cadastroScreen) cadastroScreen.style.setProperty("display", "none", "important");
        if (app) app.style.setProperty("display", "flex", "important");

        const docSnap = await db.collection("usuarios").doc(user.uid).get();
        if (docSnap.exists) {
            const dados = docSnap.data();
            const elNome = document.getElementById("nomeUsuario");
            if (elNome) elNome.innerHTML = `Olá, ${dados.nome || dados.usuario} 👋`;
            atualizarTudo(dados);
        }
    } else {
        usuarioLogadoUid = null;
        exibirLoginInicial();
    }
});

function mudarAba(nomeAba, elemento) {
    fecharTodosModais();
    abaAtual = nomeAba;
    const abas = document.querySelectorAll('.view-aba');
    abas.forEach(aba => aba.style.display = 'none');

    const botoesMenu = document.querySelectorAll('.item-menu');
    botoesMenu.forEach(btn => btn.classList.remove('ativo'));

    const abaAlvo = document.getElementById(nomeAba);
    if (abaAlvo) abaAlvo.style.display = 'block';

    if (elemento) elemento.classList.add('ativo');
}

function abrirCadastro() {
    fecharTodosModais();
    if (loginScreen) loginScreen.style.setProperty("display", "none", "important");
    if (app) app.style.setProperty("display", "none", "important");
    if (cadastroScreen) cadastroScreen.style.setProperty("display", "flex", "important");
}

function voltarLogin() {
    exibirLoginInicial();
}

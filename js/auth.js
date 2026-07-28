/* ==========================================================
   FINCONTROL - AUTH.JS (SEMPRE INICIA NA TELA DE LOGIN)
========================================================== */

// 1. CONFIGURAÇÃO DO SEU PROJETO FIREBASE
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

// Configura a persistência para NENHUMA e desloga ao abrir o link
// Isso garante que SEMPRE abrirá na tela de login ao acessar o link
auth.setPersistence(firebase.auth.Auth.Persistence.NONE);
auth.signOut();

const loginScreen = document.getElementById("loginScreen");
const cadastroScreen = document.getElementById("cadastroScreen");
const app = document.getElementById("app");

let codigoEnviadoSMS = null;
let abaAtual = 'viewDash';
let usuarioLogadoUid = null;

// Helper para converter usuário em e-mail válido para o Firebase
function usuarioParaEmail(usuario) {
    const userLimpo = usuario.trim().toLowerCase().replace(/\s+/g, '');
    return `${userLimpo}@fincontrol.app`;
}

// ----------------------------------------------------------
// 1. AÇÃO INTELIGENTE DO BOTÃO FLUTUANTE (+)
// ----------------------------------------------------------
function acaoBotaoAdd() {
    if (abaAtual === 'viewCartoes') {
        abrirModalCartao();
    } else if (abaAtual === 'viewMetas') {
        abrirModalMeta();
    } else {
        abrirModalLancamento();
    }
}

// ----------------------------------------------------------
// 2. CONTROLE DOS MODAIS
// ----------------------------------------------------------
function abrirModalLancamento() {
    const modal = document.getElementById("modalNovoLancamento");
    if (modal) modal.style.setProperty("display", "flex", "important");
}

function fecharModalLancamento() {
    const modal = document.getElementById("modalNovoLancamento");
    if (modal) modal.style.setProperty("display", "none", "important");
}

function abrirModalCartao() {
    const modal = document.getElementById("modalNovoCartao");
    if (modal) modal.style.setProperty("display", "flex", "important");
}

function fecharModalCartao() {
    const modal = document.getElementById("modalNovoCartao");
    if (modal) modal.style.setProperty("display", "none", "important");
}

function abrirModalMeta() {
    const modal = document.getElementById("modalNovaMeta");
    if (modal) modal.style.setProperty("display", "flex", "important");
}

function fecharModalMeta() {
    const modal = document.getElementById("modalNovaMeta");
    if (modal) modal.style.setProperty("display", "none", "important");
}

// ----------------------------------------------------------
// 3. SALVAR NOVO LANÇAMENTO NA NUVEM
// ----------------------------------------------------------
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

// ----------------------------------------------------------
// 4. SALVAR NOVO CARTÃO NA NUVEM
// ----------------------------------------------------------
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

// ----------------------------------------------------------
// 5. SALVAR NOVA META NA NUVEM
// ----------------------------------------------------------
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

// ----------------------------------------------------------
// 6. SALVAR SALÁRIO NA NUVEM
// ----------------------------------------------------------
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

// ----------------------------------------------------------
// 7. ATUALIZAR INTERFACE COM DADOS DA NUVEM
// ----------------------------------------------------------
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
            containerHist.innerHTML = `<p style="color: #64748B;">Nenhum lançamento cadastrado.</p>`;
        } else {
            let htmlHist = "";
            if (salario > 0) {
                htmlHist += `
                    <div class="lancamento">
                        <div class="lancamento-info">
                            <strong>Salário Base</strong>
                            <span>Lançamento Fixo</span>
                        </div>
                        <span class="lancamento-valor valor-positivo">+ R$ ${salario.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
                    </div>`;
            }
            lista.forEach(item => {
                const sinal = item.tipo === "entrada" ? "+" : "-";
                const classeCor = item.tipo === "entrada" ? "valor-positivo" : "valor-negativo";
                htmlHist += `
                    <div class="lancamento">
                        <div class="lancamento-info">
                            <strong>${item.descricao}</strong>
                            <span>${item.data} - ${item.categoria} (${item.formaPagamento || 'Pix'})</span>
                        </div>
                        <span class="lancamento-valor ${classeCor}">${sinal} R$ ${item.valor.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
                    </div>`;
            });
            containerHist.innerHTML = htmlHist;
        }
    }

    // Renderiza Tabela
    const corpoTabela = document.getElementById("tabelaLancamentosCorpo");
    if (corpoTabela) {
        if (lista.length === 0 && salario === 0) {
            corpoTabela.innerHTML = `<tr><td colspan="5" style="text-align: center; color: #64748B;">Nenhum lançamento registrado.</td></tr>`;
        } else {
            let htmlTab = "";
            if (salario > 0) {
                htmlTab += `
                    <tr>
                        <td>Salário Base</td>
                        <td><span class="badge green">Depósito Fixo</span></td>
                        <td><span class="badge green">Fixo</span></td>
                        <td><span class="badge green">Receita</span></td>
                        <td class="valor-positivo"><strong>+ R$ ${salario.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</strong></td>
                    </tr>`;
            }
            lista.forEach(item => {
                const sinal = item.tipo === "entrada" ? "+" : "-";
                const classeCor = item.tipo === "entrada" ? "valor-positivo" : "valor-negativo";
                const badgeCor = item.tipo === "entrada" ? "green" : "red";
                htmlTab += `
                    <tr>
                        <td>${item.descricao}</td>
                        <td><span class="badge blue">${item.formaPagamento || 'Pix'}</span></td>
                        <td><span class="badge orange">${item.categoria}</span></td>
                        <td><span class="badge ${badgeCor}">${item.tipo === "entrada" ? "Receita" : "Despesa"}</span></td>
                        <td class="${classeCor}"><strong>${sinal} R$ ${item.valor.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</strong></td>
                    </tr>`;
            });
            corpoTabela.innerHTML = htmlTab;
        }
    }

    // Renderiza Cartões
    const containerCartoes = document.getElementById("containerCartoes");
    if (containerCartoes) {
        if (cartoes.length === 0) {
            containerCartoes.innerHTML = `
                <div class="card" style="background: linear-gradient(135deg, #1E293B, #0F172A); color: #fff;">
                    <div class="card-header">
                        <span class="card-title" style="color: #94A3B8; font-weight: 700;">NENHUM CARTÃO CADASTRADO</span>
                        <i class="fas fa-credit-card" style="font-size: 24px; color: #94A3B8;"></i>
                    </div>
                    <p style="font-size: 13px; color: #94A3B8; margin-top: 10px;">Clique no botão + abaixo para cadastrar seu primeiro banco ou cartão.</p>
                </div>`;
        } else {
            let htmlCartoes = "";
            cartoes.forEach(c => {
                htmlCartoes += `
                    <div class="card" style="background: linear-gradient(135deg, #1E293B, #0F172A); color: #fff;">
                        <div class="card-header">
                            <span class="card-title" style="color: #94A3B8; font-weight: 700; text-transform: uppercase;">${c.banco}</span>
                            <i class="fas fa-credit-card" style="font-size: 24px; color: #F59E0B;"></i>
                        </div>
                        <div style="margin: 10px 0;">
                            <span style="font-size: 11px; color: #94A3B8; text-transform: uppercase;">Função: ${c.tipo}</span>
                            <div style="font-size: 18px; font-weight: 700; color: #10B981;">Saldo Débito: R$ ${c.saldoDebito.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</div>
                        </div>
                        <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 8px; font-size: 12px;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                                <span>Limite Crédito:</span>
                                <strong>R$ ${c.limiteCredito.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</strong>
                            </div>
                            <div style="display: flex; justify-content: space-between; color: #F59E0B; font-weight: 600;">
                                <span>Vencimento da Fatura:</span>
                                <span>Dia ${c.vencimento}</span>
                            </div>
                        </div>
                    </div>`;
            });
            containerCartoes.innerHTML = htmlCartoes;
        }
    }

    // Renderiza Metas
    const containerMetas = document.getElementById("containerMetas");
    if (containerMetas) {
        if (metas.length === 0) {
            containerMetas.innerHTML = `<p style="color: #64748B;">Nenhuma meta cadastrada. Clique no botão <strong>+</strong> para criar sua primeira meta!</p>`;
        } else {
            let htmlMetas = "";
            metas.forEach(m => {
                const mensalidade = m.valorTotal / m.meses;
                htmlMetas += `
                    <div class="meta-item" style="margin-bottom: 20px;">
                        <div class="meta-header" style="margin-bottom: 6px;">
                            <strong>🎯 ${m.nome}</strong>
                            <span>Meta: R$ ${m.valorTotal.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
                        </div>
                        <p style="font-size: 12px; color: #64748B; margin-bottom: 8px;">
                            Prazo: <strong>${m.meses} meses</strong> | Economia mensal recomendada: <strong style="color: #2563EB;">R$ ${mensalidade.toLocaleString('pt-BR', {minimumFractionDigits: 2})}/mês</strong>
                        </p>
                        <div class="barra"><span style="width: 25%;"></span></div>
                    </div>`;
            });
            containerMetas.innerHTML = htmlMetas;
        }
    }
}

// ----------------------------------------------------------
// 8. AUTENTICAÇÃO FIREBASE
// ----------------------------------------------------------
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

        alert("Conta criada na nuvem com sucesso! Faça login para acessar.");
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

// OBSERVADOR DE SESSÃO DO FIREBASE
auth.onAuthStateChanged(async (user) => {
    if (user) {
        usuarioLogadoUid = user.uid;

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
        if (app) app.style.setProperty("display", "none", "important");
        if (cadastroScreen) cadastroScreen.style.setProperty("display", "none", "important");
        if (loginScreen) loginScreen.style.setProperty("display", "flex", "important");
    }
});

function mudarAba(nomeAba, elemento) {
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
    if (loginScreen) loginScreen.style.setProperty("display", "none", "important");
    if (app) app.style.setProperty("display", "none", "important");
    if (cadastroScreen) cadastroScreen.style.setProperty("display", "flex", "important");
}

function voltarLogin() {
    if (cadastroScreen) cadastroScreen.style.setProperty("display", "none", "important");
    if (app) app.style.setProperty("display", "none", "important");
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
    alert("Para redefinição real de senha na nuvem, utilize o e-mail cadastrado.");
    fecharEsqueciSenha();
}

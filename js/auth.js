/* ==========================================================
   FINCONTROL - AUTH.JS (METAS INTERATIVAS + COMPARAÇÃO DE PARCELAS)
========================================================== */

// CONFIGURAÇÃO OFICIAL DO SEU FIREBASE
const firebaseConfig = {
    apiKey: "AIzaSyANy6KfQqQGUqxXd1eaXJJAQHywvPktJk8",
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

// FECHA TODOS OS MODAIS
function fecharTodosModais() {
    const ids = ["modalNovoLancamento", "modalNovoCartao", "modalNovaMeta"];
    ids.forEach(id => {
        const modal = document.getElementById(id);
        if (modal) modal.style.setProperty("display", "none", "important");
    });
}

// GARANTE QUE A PÁGINA ABRA SEMPRE NA TELA DE LOGIN
function exibirLoginInicial() {
    fecharTodosModais();
    if (app) app.style.setProperty("display", "none", "important");
    if (cadastroScreen) cadastroScreen.style.setProperty("display", "none", "important");
    if (loginScreen) loginScreen.style.setProperty("display", "flex", "important");
}

exibirLoginInicial();

// Helper de e-mail do Firebase
function usuarioParaEmail(usuario) {
    const userLimpo = usuario.trim().toLowerCase().replace(/\s+/g, '');
    return `${userLimpo}@fincontrol.app`;
}

// AÇÃO INTELIGENTE DO BOTÃO FLUTUANTE (+)
function acaoBotaoAdd() {
    if (abaAtual === 'viewCartoes') {
        abrirModalCartao();
    } else if (abaAtual === 'viewMetas') {
        abrirModalMeta();
    } else {
        abrirModalLancamento();
    }
}

// NAVEGAÇÃO ENTRE AS ABAS
function mudarAba(nomeAba, elemento) {
    fecharTodosModais();
    abaAtual = nomeAba;

    const abas = document.querySelectorAll('.view-aba');
    abas.forEach(aba => aba.style.display = 'none');

    const botoesTab = document.querySelectorAll('.item-tab');
    botoesTab.forEach(btn => btn.classList.remove('ativo'));

    const abaAlvo = document.getElementById(nomeAba);
    if (abaAlvo) abaAlvo.style.display = 'block';

    if (elemento) elemento.classList.add('ativo');
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

// RESETAR TODOS OS DADOS DA CONTA
async function resetarDados() {
    if (!usuarioLogadoUid) return;

    const confirmacao = confirm("⚠️ ATENÇÃO: Tem certeza que deseja apagar todos os lançamentos, salário, cartões e metas? Esta ação é irreversível!");
    if (!confirmacao) return;

    try {
        const docRef = db.collection("usuarios").doc(usuarioLogadoUid);
        await docRef.set({
            salario: 0,
            lancamentos: [],
            cartoes: [],
            metas: []
        }, { merge: true });

        const docSnap = await docRef.get();
        atualizarTudo(docSnap.data());

        const elInputSalario = document.getElementById("inputSalario");
        if (elInputSalario) elInputSalario.value = "";

        alert("Suas informações financeiras foram resetadas com sucesso!");
    } catch (e) {
        alert("Erro ao resetar dados: " + e.message);
    }
}

// MARCAR OU DESMARCAR MÊS DA META
async function marcarMesMeta(indexMeta, numeroMes) {
    if (!usuarioLogadoUid) return;

    try {
        const docRef = db.collection("usuarios").doc(usuarioLogadoUid);
        const docSnap = await docRef.get();
        if (!docSnap.exists) return;

        let dados = docSnap.data();
        if (!dados.metas || !dados.metas[indexMeta]) return;

        let meta = dados.metas[indexMeta];
        let pagasAtuais = meta.pagas || 0;

        // Se clicar no mês atual já marcado, volta 1. Senão avança até ele.
        if (pagasAtuais === numeroMes) {
            meta.pagas = numeroMes - 1;
        } else {
            meta.pagas = numeroMes;
        }

        await docRef.set(dados, { merge: true });
        atualizarTudo(dados);
    } catch (e) {
        alert("Erro ao atualizar meta: " + e.message);
    }
}

// SALVAR LANÇAMENTO NA NUVEM
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

// SALVAR CARTÃO NA NUVEM
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

// SALVAR META NA NUVEM
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

        dados.metas.push({ 
            nome: nomeMeta, 
            valorTotal: valorTotal, 
            meses: meses, 
            pagas: 0 
        });

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

// SALVAR SALÁRIO NA NUVEM
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

// ATUALIZAR INTERFACE COM DADOS REAIS DO FIREBASE
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

    // Renderiza Histórico do Dashboard
    const containerHist = document.getElementById("containerHistorico");
    if (containerHist) {
        if (lista.length === 0 && salario === 0) {
            containerHist.innerHTML = `<p style="color: #64748B; font-size: 13px;">Nenhum lançamento cadastrado.</p>`;
        } else {
            let htmlHist = "";
            if (salario > 0) {
                htmlHist += `
                    <div style="display:flex; justify-content:space-between; align-items:center; padding:12px 0; border-bottom:1px solid #F1F5F9;">
                        <div><strong style="font-size:14px; color:#0F172A;">Salário Base</strong><br><span style="font-size:12px; color:#64748B;">Lançamento Fixo</span></div>
                        <span style="color:#16A34A; font-weight:700;">+ R$ ${salario.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
                    </div>`;
            }
            lista.forEach(item => {
                const sinal = item.tipo === "entrada" ? "+" : "-";
                const cor = item.tipo === "entrada" ? "#16A34A" : "#DC2626";
                htmlHist += `
                    <div style="display:flex; justify-content:space-between; align-items:center; padding:12px 0; border-bottom:1px solid #F1F5F9;">
                        <div><strong style="font-size:14px; color:#0F172A;">${item.descricao}</strong><br><span style="font-size:12px; color:#64748B;">${item.data} - ${item.categoria}</span></div>
                        <span style="color:${cor}; font-weight:700;">${sinal} R$ ${item.valor.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
                    </div>`;
            });
            containerHist.innerHTML = htmlHist;
        }
    }

    // Renderiza Tabela de Lançamentos
    const containerLanc = document.getElementById("containerLancamentosTabela");
    if (containerLanc) {
        if (lista.length === 0 && salario === 0) {
            containerLanc.innerHTML = `<p style="color: #64748B; font-size: 13px;">Nenhum lançamento registrado.</p>`;
        } else {
            let htmlTab = "";
            lista.forEach(item => {
                const sinal = item.tipo === "entrada" ? "+" : "-";
                const cor = item.tipo === "entrada" ? "#16A34A" : "#DC2626";
                htmlTab += `
                    <div style="background:#F8FAFC; padding:14px; border-radius:12px; margin-bottom:10px; border:1px solid #E2E8F0;">
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <strong style="color:#0F172A;">${item.descricao}</strong>
                            <span style="color:${cor}; font-weight:800;">${sinal} R$ ${item.valor.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
                        </div>
                        <div style="font-size:12px; color:#64748B; margin-top:6px;">
                            ${item.data} | Categoria: ${item.categoria} | Pagamento: ${item.formaPagamento || 'Pix'}
                        </div>
                    </div>`;
            });
            containerLanc.innerHTML = htmlTab;
        }
    }

    // Renderiza Cartões
    const containerCartoes = document.getElementById("containerCartoes");
    if (containerCartoes) {
        if (cartoes.length === 0) {
            containerCartoes.innerHTML = `
                <div style="background: #0F172A; color: #FFF; padding: 20px; border-radius: 16px; margin-bottom: 16px;">
                    <span style="font-size: 12px; color: #94A3B8; text-transform: uppercase; font-weight: 700;">NENHUM CARTÃO CADASTRADO</span>
                    <p style="font-size: 12px; color: #CBD5E1; margin-top: 8px;">Clique no botão + abaixo para cadastrar seu primeiro banco ou cartão.</p>
                </div>`;
        } else {
            let htmlCartoes = "";
            cartoes.forEach(c => {
                htmlCartoes += `
                    <div style="background: #0F172A; color: #FFF; padding: 20px; border-radius: 16px; margin-bottom: 16px;">
                        <span style="font-size: 14px; color: #F59E0B; text-transform: uppercase; font-weight: 800;">${c.banco}</span>
                        <p style="font-size: 12px; color: #94A3B8; margin-top: 4px;">Função: ${c.tipo}</p>
                        <div style="font-size: 18px; font-weight: 800; color: #10B981; margin-top: 10px;">Saldo Débito: R$ ${c.saldoDebito.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</div>
                        <div style="margin-top: 8px; font-size: 12px; color: #CBD5E1; display: flex; justify-content: space-between;">
                            <span>Limite Crédito: R$ ${c.limiteCredito.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
                            <span>Vencimento: Dia ${c.vencimento}</span>
                        </div>
                    </div>`;
            });
            containerCartoes.innerHTML = htmlCartoes;
        }
    }

    // Renderiza Metas (Com Caixas de Meses e Barra de Progresso)
    const containerMetas = document.getElementById("containerMetas");
    let somaPorcentagensMetas = 0;

    if (containerMetas) {
        if (metas.length === 0) {
            containerMetas.innerHTML = `<p style="color: #64748B; font-size: 13px;">Nenhuma meta cadastrada. Clique no botão + para criar sua primeira meta!</p>`;
        } else {
            let htmlMetas = "";
            metas.forEach((m, index) => {
                const mesesTotal = m.meses || 1;
                const pagas = m.pagas || 0;
                const mensalidade = m.valorTotal / mesesTotal;
                const pct = Math.min(100, Math.round((pagas / mesesTotal) * 100));
                somaPorcentagensMetas += pct;

                // Cria as caixinhas de meses/parcelas
                let caixinhasHtml = "";
                for (let i = 1; i <= mesesTotal; i++) {
                    const estaPago = i <= pagas;
                    const bg = estaPago ? "#2563EB" : "#F1F5F9";
                    const cor = estaPago ? "#FFFFFF" : "#64748B";
                    const border = estaPago ? "1px solid #2563EB" : "1px solid #CBD5E1";

                    caixinhasHtml += `
                        <button onclick="marcarMesMeta(${index}, ${i})" style="
                            background: ${bg}; 
                            color: ${cor}; 
                            border: ${border}; 
                            padding: 6px 10px; 
                            border-radius: 8px; 
                            font-size: 11px; 
                            font-weight: 700; 
                            cursor: pointer; 
                            transition: all 0.2s;
                        ">
                            ${i}º Mês ${estaPago ? '✓' : ''}
                        </button>`;
                }

                htmlMetas += `
                    <div style="background: #FFFFFF; border: 1px solid #E2E8F0; padding: 18px; border-radius: 16px; margin-bottom: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.02);">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                            <strong style="color: #0F172A; font-size: 16px;">🎯 ${m.nome}</strong>
                            <span style="font-size: 14px; font-weight: 800; color: #2563EB;">${pct}% Concluído</span>
                        </div>
                        
                        <div style="width: 100%; background: #E2E8F0; height: 10px; border-radius: 10px; overflow: hidden; margin-bottom: 12px;">
                            <div style="width: ${pct}%; background: #2563EB; height: 100%; border-radius: 10px; transition: width 0.3s ease;"></div>
                        </div>

                        <div style="font-size: 13px; color: #64748B; margin-bottom: 12px; display: flex; justify-content: space-between;">
                            <span>Meta: <strong>R$ ${m.valorTotal.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</strong></span>
                            <span>Guardar: <strong style="color: #16A34A;">R$ ${mensalidade.toLocaleString('pt-BR', {minimumFractionDigits: 2})}/mês</strong></span>
                        </div>

                        <div style="border-top: 1px solid #F1F5F9; padding-top: 12px;">
                            <span style="font-size: 12px; font-weight: 700; color: #475569; display: block; margin-bottom: 8px;">
                                Marcar Parcelas/Meses Pagos (${pagas}/${mesesTotal}):
                            </span>
                            <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                                ${caixinhasHtml}
                            </div>
                        </div>
                    </div>`;
            });
            containerMetas.innerHTML = htmlMetas;
        }
    }

    // Atualiza estatística de Metas no Dashboard
    const elMetasPct = document.getElementById("valMetasConcluidas");
    if (elMetasPct) {
        const mediaGeral = metas.length > 0 ? Math.round(somaPorcentagensMetas / metas.length) : 0;
        elMetasPct.innerHTML = `${mediaGeral}%`;
    }
}

// AUTENTICAÇÃO
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

// OBSERVADOR FIREBASE
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

function abrirCadastro() {
    fecharTodosModais();
    if (loginScreen) loginScreen.style.setProperty("display", "none", "important");
    if (app) app.style.setProperty("display", "none", "important");
    if (cadastroScreen) cadastroScreen.style.setProperty("display", "flex", "important");
}

function voltarLogin() {
    exibirLoginInicial();
}

/* ==========================================================
   FINCONTROL - AUTH.JS (SESSÃO, MODAIS CONTEXTUAIS E DADOS)
========================================================== */

const loginScreen = document.getElementById("loginScreen");
const cadastroScreen = document.getElementById("cadastroScreen");
const app = document.getElementById("app");

let codigoEnviadoSMS = null;
let abaAtual = 'viewDash'; // Controla qual aba está ativa no momento

// ----------------------------------------------------------
// 1. AÇÃO INTELIGENTE DO BOTÃO FLUTUANTE (+)
// ----------------------------------------------------------
function acaoBotaoAdd() {
    if (abaAtual === 'viewCartoes') {
        abrirModalCartao();
    } else if (abaAtual === 'viewMetas') {
        abrirModalMeta();
    } else {
        abrirModalLancamento(); // Padrão para Dashboard, Lançamentos e Categorias
    }
}

// ----------------------------------------------------------
// 2. CONTROLE DO MODAL DE LANÇAMENTOS (RECEITA/DESPESA)
// ----------------------------------------------------------
function abrirModalLancamento() {
    const modal = document.getElementById("modalNovoLancamento");
    if (modal) modal.style.setProperty("display", "flex", "important");
}

function fecharModalLancamento() {
    const modal = document.getElementById("modalNovoLancamento");
    if (modal) modal.style.setProperty("display", "none", "important");
}

function salvarNovoLancamento() {
    const desc = document.getElementById("lancDescricao")?.value.trim();
    const valor = parseFloat(document.getElementById("lancValor")?.value);
    const tipo = document.getElementById("lancTipo")?.value;
    const formaPagamento = document.getElementById("lancFormaPagamento")?.value;
    const categoria = document.getElementById("lancCategoria")?.value;

    if (!desc || isNaN(valor) || valor <= 0) {
        alert("Preencha a descrição e o valor corretamente.");
        return;
    }

    const usuarioAtual = localStorage.getItem("usuarioAtual");
    if (!usuarioAtual) return;

    let dados = JSON.parse(localStorage.getItem(`user_${usuarioAtual}`)) || {};
    if (!dados.lancamentos) dados.lancamentos = [];

    const novoItem = {
        descricao: desc,
        valor: valor,
        tipo: tipo,
        formaPagamento: formaPagamento,
        categoria: categoria,
        data: new Date().toLocaleDateString('pt-BR')
    };

    dados.lancamentos.unshift(novoItem);
    localStorage.setItem(`user_${usuarioAtual}`, JSON.stringify(dados));

    document.getElementById("lancDescricao").value = "";
    document.getElementById("lancValor").value = "";
    fecharModalLancamento();

    atualizarTudo(dados);
    alert("Lançamento cadastrado com sucesso!");
}

// ----------------------------------------------------------
// 3. CONTROLE DO MODAL DE CARTÕES / BANCOS
// ----------------------------------------------------------
function abrirModalCartao() {
    const modal = document.getElementById("modalNovoCartao");
    if (modal) modal.style.setProperty("display", "flex", "important");
}

function fecharModalCartao() {
    const modal = document.getElementById("modalNovoCartao");
    if (modal) modal.style.setProperty("display", "none", "important");
}

function salvarNovoCartao() {
    const banco = document.getElementById("cardBanco")?.value.trim();
    const tipo = document.getElementById("cardTipo")?.value;
    const saldoDebito = parseFloat(document.getElementById("cardSaldoDebito")?.value) || 0;
    const limiteCredito = parseFloat(document.getElementById("cardLimiteCredito")?.value) || 0;
    const vencimento = document.getElementById("cardVencimento")?.value || "--";

    if (!banco) {
        alert("Informe o nome do Banco ou Instituição.");
        return;
    }

    const usuarioAtual = localStorage.getItem("usuarioAtual");
    if (!usuarioAtual) return;

    let dados = JSON.parse(localStorage.getItem(`user_${usuarioAtual}`)) || {};
    if (!dados.cartoes) dados.cartoes = [];

    dados.cartoes.push({
        banco,
        tipo,
        saldoDebito,
        limiteCredito,
        vencimento
    });

    localStorage.setItem(`user_${usuarioAtual}`, JSON.stringify(dados));

    document.getElementById("cardBanco").value = "";
    document.getElementById("cardSaldoDebito").value = "";
    document.getElementById("cardLimiteCredito").value = "";
    document.getElementById("cardVencimento").value = "";

    fecharModalCartao();
    atualizarTudo(dados);
    alert("Novo Cartão / Banco cadastrado com sucesso!");
}

// ----------------------------------------------------------
// 4. CONTROLE DO MODAL DE METAS
// ----------------------------------------------------------
function abrirModalMeta() {
    const modal = document.getElementById("modalNovaMeta");
    if (modal) modal.style.setProperty("display", "flex", "important");
}

function fecharModalMeta() {
    const modal = document.getElementById("modalNovaMeta");
    if (modal) modal.style.setProperty("display", "none", "important");
}

function salvarNovaMeta() {
    const nomeMeta = document.getElementById("metaNome")?.value.trim();
    const valorTotal = parseFloat(document.getElementById("metaValorTotal")?.value);
    const meses = parseInt(document.getElementById("metaMeses")?.value);

    if (!nomeMeta || isNaN(valorTotal) || isNaN(meses) || meses <= 0) {
        alert("Preencha o objetivo, o valor e o prazo em meses corretamente.");
        return;
    }

    const usuarioAtual = localStorage.getItem("usuarioAtual");
    if (!usuarioAtual) return;

    let dados = JSON.parse(localStorage.getItem(`user_${usuarioAtual}`)) || {};
    if (!dados.metas) dados.metas = [];

    dados.metas.push({
        nome: nomeMeta,
        valorTotal: valorTotal,
        meses: meses,
        guardado: 0
    });

    localStorage.setItem(`user_${usuarioAtual}`, JSON.stringify(dados));

    document.getElementById("metaNome").value = "";
    document.getElementById("metaValorTotal").value = "";
    document.getElementById("metaMeses").value = "";

    fecharModalMeta();
    atualizarTudo(dados);
    alert("Nova Meta criada com sucesso!");
}

// ----------------------------------------------------------
// 5. SALVAR SALÁRIO E ATUALIZAR INTERFACE
// ----------------------------------------------------------
function salvarSalario() {
    const valorInput = parseFloat(document.getElementById("inputSalario")?.value);

    if (isNaN(valorInput) || valorInput <= 0) {
        alert("Por favor, informe um valor de salário válido.");
        return;
    }

    const usuarioAtual = localStorage.getItem("usuarioAtual");
    if (!usuarioAtual) return;

    let dados = JSON.parse(localStorage.getItem(`user_${usuarioAtual}`)) || {};
    dados.salario = valorInput;
    localStorage.setItem(`user_${usuarioAtual}`, JSON.stringify(dados));

    atualizarTudo(dados);
    alert(`Salário de R$ ${valorInput.toLocaleString('pt-BR', {minimumFractionDigits: 2})} salvo!`);
}

function atualizarTudo(dados) {
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

    // Atualiza Valores do Dashboard
    const elSaldo = document.getElementById("valSaldo");
    const elEntradas = document.getElementById("valEntradas");
    const elSaidas = document.getElementById("valSaidas");
    const elInputSalario = document.getElementById("inputSalario");

    if (elSaldo) elSaldo.innerHTML = `R$ ${saldoDisponivel.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
    if (elEntradas) elEntradas.innerHTML = `R$ ${totalEntradas.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
    if (elSaidas) elSaidas.innerHTML = `R$ ${totalSaidas.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
    if (elInputSalario && salario > 0) elInputSalario.value = salario;

    // 1. Renderiza Histórico na Dashboard
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

    // 2. Renderiza Tabela na Aba Lançamentos
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

    // 3. Renderiza Cartões Dinâmicos
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

    // 4. Renderiza Metas Dinâmicas
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
// 6. ALTERNÂNCIA DE ABAS DO MENU
// ----------------------------------------------------------
function mudarAba(nomeAba, elemento) {
    abaAtual = nomeAba; // Atualiza a aba ativa

    const abas = document.querySelectorAll('.view-aba');
    abas.forEach(aba => aba.style.display = 'none');

    const botoesMenu = document.querySelectorAll('.item-menu');
    botoesMenu.forEach(btn => btn.classList.remove('ativo'));

    const abaAlvo = document.getElementById(nomeAba);
    if (abaAlvo) abaAlvo.style.display = 'block';

    if (elemento) elemento.classList.add('ativo');
}

// NAVEGAÇÃO DE CADASTRO E LOGIN
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

    localStorage.setItem(`user_${usuario}`, JSON.stringify({
        nome,
        usuario,
        senha,
        salario: 0,
        lancamentos: [],
        cartoes: [],
        metas: []
    }));

    alert("Conta criada com sucesso!");
    voltarLogin();
}

function entrar() {
    const usuario = document.getElementById("loginUsuario")?.value.trim();
    const senha = document.getElementById("loginSenha")?.value;

    let dados = JSON.parse(localStorage.getItem(`user_${usuario}`));

    if (!dados) {
        dados = { nome: usuario, usuario: usuario, senha: senha, salario: 0, lancamentos: [], cartoes: [], metas: [] };
        localStorage.setItem(`user_${usuario}`, JSON.stringify(dados));
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

    atualizarTudo(dados);
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

// INICIALIZAÇÃO AUTOMÁTICA
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

    atualizarTudo(dados);
});

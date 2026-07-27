/* ==========================================================
   FINCONTROL - AUTH.JS
========================================================== */

const loginScreen = document.getElementById("loginScreen");
const cadastroScreen = document.getElementById("cadastroScreen");
const app = document.getElementById("app");

let codigoEnviadoSMS = null;

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
    const categoria = document.getElementById("lancCategoria")?.value;

    if (!desc || isNaN(valor) || valor <= 0) {
        alert("Preencha os campos de descrição e valor corretamente.");
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
        categoria: categoria,
        data: new Date().toLocaleDateString('pt-BR')
    };

    dados.lancamentos.unshift(novoItem);
    localStorage.setItem(`user_${usuarioAtual}`, JSON.stringify(dados));

    document.getElementById("lancDescricao").value = "";
    document.getElementById("lancValor").value = "";
    fecharModalLancamento();

    atualizarTudo(dados);
    alert("Lançamento adicionado com sucesso!");
}

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
                            <span>${item.data} - ${item.categoria}</span>
                        </div>
                        <span class="lancamento-valor ${classeCor}">${sinal} R$ ${item.valor.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
                    </div>`;
            });
            containerHist.innerHTML = htmlHist;
        }
    }

    const corpoTabela = document.getElementById("tabelaLancamentosCorpo");
    if (corpoTabela) {
        if (lista.length === 0 && salario === 0) {
            corpoTabela.innerHTML = `<tr><td colspan="4" style="text-align: center; color: #64748B;">Nenhum lançamento registrado.</td></tr>`;
        } else {
            let htmlTab = "";
            if (salario > 0) {
                htmlTab += `
                    <tr>
                        <td>Salário Base</td>
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
                        <td><span class="badge orange">${item.categoria}</span></td>
                        <td><span class="badge ${badgeCor}">${item.tipo === "entrada" ? "Receita" : "Despesa"}</span></td>
                        <td class="${classeCor}"><strong>${sinal} R$ ${item.valor.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</strong></td>
                    </tr>`;
            });
            corpoTabela.innerHTML = htmlTab;
        }
    }
}

function mudarAba(nomeAba, elemento) {
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
        lancamentos: []
    }));

    alert("Conta criada com sucesso!");
    voltarLogin();
}

function entrar() {
    const usuario = document.getElementById("loginUsuario")?.value.trim();
    const senha = document.getElementById("loginSenha")?.value;

    let dados = JSON.parse(localStorage.getItem(`user_${usuario}`));

    if (!dados) {
        dados = { nome: usuario, usuario: usuario, senha: senha, salario: 0, lancamentos: [] };
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

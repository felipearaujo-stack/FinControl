/* ==========================================================
   FINCONTROL
   LANCAMENTOS.JS
   VERSÃO 5.0 (Com Captura Dinâmica de Bancos e Cartões)
========================================================== */

// ======================================
// Variáveis
// ======================================
let lancamentos = [];
let lancamentoEditando = null;

// ======================================
// Elementos
// ======================================
const btnNovoLancamento = document.getElementById("btnNovoLancamento");
const btnSalvarLancamento = document.getElementById("btnSalvarLancamento");
const btnCancelarLancamento = document.getElementById("btnCancelarLancamento");

const modalLancamento = document.getElementById("modalLancamento");

const campoDescricao = document.getElementById("descricao");
const campoValor = document.getElementById("valor");
const campoCategoria = document.getElementById("categoria");
const campoTipo = document.getElementById("tipo");

// ======================================
// Eventos
// ======================================
btnNovoLancamento?.addEventListener("click", abrirModalLancamento);
btnSalvarLancamento?.addEventListener("click", salvarLancamento);
btnCancelarLancamento?.addEventListener("click", fecharModalLancamento);

// ======================================
// Carregar lançamentos
// ======================================
function carregarLancamentos(){
    const usuario = (typeof usuarioAtual !== 'undefined' && usuarioAtual) ? usuarioAtual : "usuario_teste";
    lancamentos = Storage.obterLancamentos(usuario) || [];

    atualizarListaLancamentos();

    if(typeof atualizarCards === "function"){
        atualizarCards();
    }
}

// ======================================
// Salvar
// ======================================
function salvarDados(){
    const usuario = (typeof usuarioAtual !== 'undefined' && usuarioAtual) ? usuarioAtual : "usuario_teste";
    Storage.salvarLancamentos(usuario, lancamentos);
}

// ======================================
// Modal
// ======================================
function abrirModalLancamento(){
    lancamentoEditando = null;
    limparFormulario();
    modalLancamento.style.display = "flex";
}

function fecharModalLancamento(){
    modalLancamento.style.display = "none";
    limparFormulario();
}

// ======================================
// Limpar formulário
// ======================================
function limparFormulario(){
    campoDescricao.value = "";
    campoValor.value = "";
    if(campoCategoria) campoCategoria.selectedIndex = 0;
    if(campoTipo) campoTipo.selectedIndex = 0;

    // Limpa também os campos injetados dinamicamente
    const campoBanco = document.getElementById("bancoLancamento");
    const campoForma = document.getElementById("formaPagamentoLancamento");
    if(campoBanco) campoBanco.selectedIndex = 0;
    if(campoForma) campoForma.selectedIndex = 0;
}

// ======================================
// Categoria automática
// ======================================
function descobrirCategoria(descricao){
    const texto = descricao.toLowerCase();

    if(
        texto.includes("mercado") ||
        texto.includes("supermercado") ||
        texto.includes("ifood") ||
        texto.includes("lanche") ||
        texto.includes("restaurante")
    ){
        return "Alimentação";
    }

    if(
        texto.includes("uber") ||
        texto.includes("99") ||
        texto.includes("gasolina") ||
        texto.includes("posto")
    ){
        return "Transporte";
    }

    if(
        texto.includes("farmacia") ||
        texto.includes("remedio")
    ){
        return "Saúde";
    }

    if(
        texto.includes("spotify") ||
        texto.includes("netflix") ||
        texto.includes("prime")
    ){
        return "Assinaturas";
    }

    return campoCategoria ? campoCategoria.value : "Geral";
}

// ======================================
// Salvar lançamento (AGORA COM BANCO E FORMA DE PGTO)
// ======================================
function salvarLancamento(){
    const descricao = campoDescricao.value.trim();
    const valor = Number(campoValor.value);
    const tipo = campoTipo ? campoTipo.value : "despesa";

    // 🧠 CAPTURA OS NOVOS CAMPOS DO CARTÃO/PIX
    const campoBanco = document.getElementById("bancoLancamento");
    const campoForma = document.getElementById("formaPagamentoLancamento");
    
    const bancoSelecionado = campoBanco ? campoBanco.value : "";
    const formaPagamentoSelecionada = campoForma ? campoForma.value : "debito";

    if(descricao === ""){
        alert("Informe a descrição.");
        return;
    }

    if(isNaN(valor) || valor <= 0){
        alert("Informe um valor válido.");
        return;
    }

    const novoLancamento = {
        id: lancamentoEditando || Date.now(),
        descricao: descricao,
        valor: valor,
        categoria: descobrirCategoria(descricao),
        tipo: tipo,
        data: new Date().toLocaleDateString("pt-BR"),
        banco: bancoSelecionado,               // Guarda a instituição (ex: Nubank)
        formaPagamento: formaPagamentoSelecionada // Guarda credito, debito ou pix
    };

    if(lancamentoEditando){
        const indice = lancamentos.findIndex(item => item.id === lancamentoEditando);
        if(indice !== -1){
            lancamentos[indice] = novoLancamento;
        }
    }else{
        lancamentos.push(novoLancamento);
    }

    salvarDados();
    atualizarListaLancamentos();

    // Avisa o painel principal e a tela de cartões para se recalcularem na hora!
    if(typeof atualizarCards === "function"){
        atualizarCards();
    }
    if(typeof atualizarVisualCartoes === "function"){
        atualizarVisualCartoes(); 
    }

    fecharModalLancamento();
}

// ======================================
// Atualizar lista
// ======================================
function atualizarListaLancamentos(){
    const lista = document.getElementById("listaLancamentos");

    if(!lista) return;

    lista.innerHTML = "";

    if(lancamentos.length === 0){
        lista.innerHTML = `
            <div class="lancamento">
                <div class="lancamento-info">
                    <strong>Nenhum lançamento cadastrado</strong>
                    <span>Adicione seu primeiro lançamento</span>
                </div>
            </div>
        `;
        return;
    }

    lancamentos.forEach(item=>{
        const div = document.createElement("div");
        div.className = "itemLancamento";
        
        // Melhora a visualização para mostrar a forma de pagamento
        let badgeForma = "";
        if(item.formaPagamento === "credito") badgeForma = `<span style="color:#8b5cf6; font-size:11px; font-weight:bold;">• Crédito (${item.banco})</span>`;
        if(item.formaPagamento === "pix") badgeForma = `<span style="color:#10b981; font-size:11px; font-weight:bold;">• PIX (${item.banco})</span>`;

        div.innerHTML = `
            <div>
                <strong>${item.descricao}</strong>
                <br>
                <small>${item.categoria} • ${item.data} ${badgeForma}</small>
            </div>
            <div>
                <strong>
                    ${item.tipo === "receita" ? "+" : "-"}
                    R$ ${Number(item.valor).toFixed(2).replace('.', ',')}
                </strong>
                <br><br>
                <button onclick="editarLancamento(${item.id})">Editar</button>
                <button onclick="excluirLancamento(${item.id})">Excluir</button>
            </div>
        `;
        lista.appendChild(div);
    });
}

// ======================================
// Editar lançamento
// ======================================
function editarLancamento(id){
    const item = lancamentos.find(l => l.id == id);

    if(!item){
        return;
    }

    lancamentoEditando = id;

    campoDescricao.value = item.descricao;
    campoValor.value = item.valor;
    if(campoCategoria) campoCategoria.value = item.categoria;
    if(campoTipo) campoTipo.value = item.tipo;

    // Preenche os campos dinâmicos caso existam
    const campoBanco = document.getElementById("bancoLancamento");
    const campoForma = document.getElementById("formaPagamentoLancamento");
    if(campoBanco && item.banco) campoBanco.value = item.banco;
    if(campoForma && item.formaPagamento) campoForma.value = item.formaPagamento;

    modalLancamento.style.display = "flex";
}

// ======================================
// Excluir lançamento
// ======================================
function excluirLancamento(id){
    const confirmar = confirm("Deseja excluir este lançamento?");

    if(!confirmar){
        return;
    }

    lancamentos = lancamentos.filter(item => item.id != id);

    salvarDados();
    atualizarListaLancamentos();

    if(typeof atualizarCards === "function") atualizarCards();
    if(typeof atualizarVisualCartoes === "function") atualizarVisualCartoes();
}

// ======================================
// Funções auxiliares
// ======================================
function buscarLancamento(id){
    return lancamentos.find(item => item.id == id);
}

function quantidadeLancamentos(){
    return lancamentos.length;
}

function obterUltimosLancamentos(qtd = 5){
    return [...lancamentos]
        .sort((a,b)=>b.id-a.id)
        .slice(0,qtd);
}

function recarregarLancamentos(){
    carregarLancamentos();
}

function atualizarAposLancamento(){
    carregarLancamentos();
}

function atualizarAposEdicao(){
    carregarLancamentos();
}

function atualizarAposExclusao(){
    carregarLancamentos();
}

// ======================================
// Inicialização
// ======================================
window.addEventListener("load",()=>{
    carregarLancamentos();
});

console.log("Lançamentos carregado com sucesso.");
/* ==========================================================
   FINCONTROL
   CATEGORIAS.JS (Com Injeção Automática de HTML)
========================================================== */

let categorias = [];
let categoriaEditando = null;

// ======================================
// 1. Injetar HTML Dinamicamente
// ======================================
function injetarTelaCategorias() {
    // Encontra a tela de categorias e desenha o botão nela
    const secaoCategorias = document.getElementById("categorias");
    if (secaoCategorias) {
        const panel = secaoCategorias.querySelector(".panel");
        if (panel) {
            panel.innerHTML = `
                <h2>Categorias Inteligentes</h2>
                <br>
                <p style="color: #64748B; margin-bottom: 20px;">
                    Cadastre palavras-chave para o sistema adivinhar a categoria dos seus gastos.
                </p>
                <button class="btn-primary" onclick="abrirModalCategoria()">
                    <i class="fa-solid fa-plus"></i> Nova Categoria
                </button>
                <br><br>
                <div id="listaCategorias" class="lista-lancamentos"></div>
            `;
        }
    }

    // Cria o Modal de Categoria e injeta no final da página
    if (!document.getElementById("modalCategoria")) {
        const modalHTML = `
        <div id="modalCategoria" class="modal" style="display:none;">
            <div class="modal-box">
                <h2>Nova Categoria</h2>
                <br>
                <div class="campo">
                    <label>Nome da Categoria</label>
                    <input type="text" id="nomeCategoria" placeholder="Ex: Mercado">
                </div>
                <div class="campo">
                    <label>Palavras-chave (separadas por vírgula)</label>
                    <input type="text" id="palavrasCategoria" placeholder="Ex: arroz, mentos, supermercado">
                </div>
                <div style="display:flex; gap:15px; margin-top:10px;">
                    <button onclick="salvarCategoria()" class="btn-primary">Salvar</button>
                    <button onclick="fecharModalCategoria()" class="btn-secondary">Cancelar</button>
                </div>
            </div>
        </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }
}

// ======================================
// 2. Carregar Categorias
// ======================================
function carregarCategorias() {
    const usuario = (typeof usuarioAtual !== 'undefined' && usuarioAtual) ? usuarioAtual : "usuario_teste";
    
    const dadosLocais = localStorage.getItem(`fincontrol_categorias_${usuario}`);
    
    if (dadosLocais) {
        categorias = JSON.parse(dadosLocais);
    } else {
        // Categorias iniciais de exemplo
        categorias = [
            { id: 1, nome: "Alimentação", palavras: ["lanche", "ifood", "restaurante", "padaria"] },
            { id: 2, nome: "Mercado", palavras: ["mentos", "supermercado", "compras"] },
            { id: 3, nome: "Transporte", palavras: ["uber", "99", "gasolina", "posto"] }
        ];
        salvarDadosCategorias();
    }

    atualizarListaCategorias();
    atualizarSelectFormulario();
}

// ======================================
// 3. Salvar Categorias no Banco
// ======================================
function salvarDadosCategorias() {
    const usuario = (typeof usuarioAtual !== 'undefined' && usuarioAtual) ? usuarioAtual : "usuario_teste";
    localStorage.setItem(`fincontrol_categorias_${usuario}`, JSON.stringify(categorias));
}

// ======================================
// 4. Modal
// ======================================
function abrirModalCategoria(id = null) {
    categoriaEditando = id;
    
    if (id) {
        const cat = categorias.find(c => c.id === id);
        if (cat) {
            document.getElementById("nomeCategoria").value = cat.nome;
            document.getElementById("palavrasCategoria").value = cat.palavras.join(", ");
        }
    } else {
        document.getElementById("nomeCategoria").value = "";
        document.getElementById("palavrasCategoria").value = "";
    }

    const modal = document.getElementById("modalCategoria");
    if (modal) modal.style.display = "flex";
}

function fecharModalCategoria() {
    const modal = document.getElementById("modalCategoria");
    if (modal) modal.style.display = "none";
}

// ======================================
// 5. Salvar Categoria
// ======================================
function salvarCategoria() {
    const nome = document.getElementById("nomeCategoria").value.trim();
    const palavrasInput = document.getElementById("palavrasCategoria").value;

    if (nome === "") {
        alert("O nome da categoria é obrigatório.");
        return;
    }

    const palavrasArray = palavrasInput
        .split(",")
        .map(p => p.trim().toLowerCase())
        .filter(p => p !== "");

    if (categoriaEditando) {
        const index = categorias.findIndex(c => c.id === categoriaEditando);
        if (index !== -1) {
            categorias[index].nome = nome;
            categorias[index].palavras = palavrasArray;
        }
    } else {
        const novaCategoria = {
            id: Date.now(),
            nome: nome,
            palavras: palavrasArray
        };
        categorias.push(novaCategoria);
    }

    salvarDadosCategorias();
    atualizarListaCategorias();
    atualizarSelectFormulario();
    fecharModalCategoria();
}

// ======================================
// 6. Excluir Categoria
// ======================================
function excluirCategoria(id) {
    if (confirm("Tem certeza que deseja excluir esta categoria?")) {
        categorias = categorias.filter(c => c.id !== id);
        salvarDadosCategorias();
        atualizarListaCategorias();
        atualizarSelectFormulario();
    }
}

// ======================================
// 7. Renderizar Tela
// ======================================
function atualizarListaCategorias() {
    const lista = document.getElementById("listaCategorias");
    if (!lista) return;

    lista.innerHTML = "";

    if (categorias.length === 0) {
        lista.innerHTML = "<p>Nenhuma categoria cadastrada.</p>";
        return;
    }

    categorias.forEach(cat => {
        const div = document.createElement("div");
        div.className = "itemLancamento"; 
        
        div.innerHTML = `
            <div>
                <strong>${cat.nome}</strong>
                <br>
                <small>Palavras: ${cat.palavras.length > 0 ? cat.palavras.join(", ") : "Nenhuma"}</small>
            </div>
            <div>
                <button onclick="abrirModalCategoria(${cat.id})">Editar</button>
                <button onclick="excluirCategoria(${cat.id})">Excluir</button>
            </div>
        `;
        lista.appendChild(div);
    });
}

// ======================================
// 8. Integrar com Lançamentos
// ======================================
function atualizarSelectFormulario() {
    const select = document.getElementById("categoria");
    if (!select) return;

    select.innerHTML = ""; 

    categorias.forEach(cat => {
        const option = document.createElement("option");
        option.value = cat.nome;
        option.textContent = cat.nome;
        select.appendChild(option);
    });
}

// ======================================
// Inicialização
// ======================================
window.addEventListener("load", () => {
    injetarTelaCategorias(); // Desenha o HTML primeiro
    carregarCategorias();    // Depois carrega os dados
});
/* ==========================================================
   FINCONTROL
   STORAGE.JS
   Responsável por salvar e recuperar dados do sistema
========================================================== */

const Storage = {

    // ==========================================
    // Usuário logado
    // ==========================================

    salvarUsuarioAtual(usuario){
        localStorage.setItem("fc_usuarioAtual", usuario);
    },

    obterUsuarioAtual(){
        return localStorage.getItem("fc_usuarioAtual");
    },

    sair(){
        localStorage.removeItem("fc_usuarioAtual");
    },

    // ==========================================
    // Cadastro
    // ==========================================

    usuarioExiste(usuario){
        return localStorage.getItem("fc_user_" + usuario) !== null;
    },

    salvarUsuario(usuario, dados){
        localStorage.setItem(
            "fc_user_" + usuario,
            JSON.stringify(dados)
        );
    },

    carregarUsuario(usuario){

        const dados = localStorage.getItem("fc_user_" + usuario);

        if(!dados) return null;

        return JSON.parse(dados);

    },

    atualizarUsuario(usuario, dados){

        localStorage.setItem(
            "fc_user_" + usuario,
            JSON.stringify(dados)
        );

    },

    // ==========================================
    // Salário
    // ==========================================

    definirSalario(usuario, valor){

        const dados = this.carregarUsuario(usuario);

        dados.salario = valor;

        this.atualizarUsuario(usuario, dados);

    },

    obterSalario(usuario){

        const dados = this.carregarUsuario(usuario);

        return dados.salario || 0;

    },

    // ==========================================
    // Lançamentos
    // ==========================================

    obterLancamentos(usuario){

        const dados = this.carregarUsuario(usuario);

        return dados.lancamentos || [];

    },

    salvarLancamentos(usuario, lista){

        const dados = this.carregarUsuario(usuario);

        dados.lancamentos = lista;

        this.atualizarUsuario(usuario, dados);

    },

    adicionarLancamento(usuario, lancamento){

        const dados = this.carregarUsuario(usuario);

        if(!dados.lancamentos){

            dados.lancamentos=[];

        }

        dados.lancamentos.push(lancamento);

        this.atualizarUsuario(usuario,dados);

    },

    excluirLancamento(usuario,id){

        const dados=this.carregarUsuario(usuario);

        dados.lancamentos=dados.lancamentos.filter(item=>item.id!=id);

        this.atualizarUsuario(usuario,dados);

    },

    editarLancamento(usuario,id,novo){

        const dados=this.carregarUsuario(usuario);

        dados.lancamentos=dados.lancamentos.map(item=>{

            if(item.id==id){

                return novo;

            }

            return item;

        });

        this.atualizarUsuario(usuario,dados);

    },

    // ==========================================
    // Categorias
    // ==========================================

    categoriasPadrao(){

        return [

            "Alimentação",

            "Moradia",

            "Transporte",

            "Saúde",

            "Educação",

            "Lazer",

            "Compras",

            "Assinaturas",

            "Pets",

            "Investimentos",

            "Outros"

        ];

    },

    // ==========================================
    // Backup
    // ==========================================

    exportar(usuario){

        return this.carregarUsuario(usuario);

    },

    importar(usuario,dados){

        this.salvarUsuario(usuario,dados);

    }

};
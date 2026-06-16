export class Produtos{
    #idProduto;
    #idCategoria;
    #nome;
    #descricao;
    #preco;
    #image;
    #quantidade;

    constructor (pIdCategoria, pNome, pDescricao, pPreco, pImage, pQuantidade, pIdProduto){
        this.#idCategoria = pIdCategoria;
        this.#nome = pNome;
        this.#descricao = pDescricao;
        this.#preco = pPreco;
        this.#image = pImage;
        this.#quantidade = pQuantidade;
        this.#idProduto = pIdProduto;
    }

    //metodos acessores getters e setters 
    get idProduto(){
        return this.#idProduto
    }
    set idProduto(value){
        this.#validaridProduto(value);
        this.#idProduto = value;
    }
    get idCategoria(){
        return this.#idCategoria
    }
    set idCategoria(value){
        this.#validarIdCategoria(value);
        this.#idCategoria = value
    }
    get nome(){
        return this.#nome;
    }
    set nome(value){
        this.#validarNome(value);
        this.#nome = value;
    }
    get descricao(){
        return this.#descricao
    }
    set descricao(value){
        this.#validarDescricao(value)
        this.#descricao = value
    }
    get preco(){
        return this.#preco
    }
    set preco(value){
        this.#validarPreco(value)
        this.#preco = Number(value)
    }
    get image(){
        return this.#image
    }
    set image(value){
        this.#validarPathImagem(value);
        this.#image = value;
    }
    get quantidade(){
        return this.#quantidade
    }
    set quantidade(value) {
        this.#validarQuantidade(value);
        this.#quantidade = value
    }

    //metodos auxiliares

    #validaridProduto(value){
        if(value & value <= 0){
            throw new Error ('Verifique o ID informado')
        }
    }
    #validarIdCategoria(value){
        if(value & value <= 0){
            throw new Error ('Verifique o ID da Categoria')
        }
    }
    #validarNome(value) {
        if(!value || value.trim().length < 3 || value.trim().length > 45 ){
            throw new Error ('O campo nome é obrigatório e deve ter entre 3 a 45 caracteres');           
        }
    }
    #validarDescricao(value) {
        if(value && (value.trim().length < 10 || value.trim().length > 100)){
            throw new Error ('O campo descrição e deve ter entre 10 a 100 caracteres');           
        }
    }
    #validarPreco(value) {
        if (value === undefined || value === null || isNaN(Number(value)) || Number(value) <= 0) {
            throw new Error('O campo valor é obrigatório e deve ser numérico maior que zero');
        }
    }

    #validarPathImagem(value) {
        if (!value){
            throw new Error('Impossivel enviar a imagem');
        }
    }
    #validarQuantidade(value) {
        if (!value || value <= 0) {
            throw new Error("Não foi possivel obter a quantidade");
        }
    }

    //criação de objetos usando o design patterns FACTORY mathod

    static criar(dados){
        return new Produtos(dados.idCategoria, dados.nome, dados.descricao, dados.preco, dados.image, dados.quantidade, null);
    }
    static alterar(dados, idProduto){
        
        return new Produtos(dados.idCategoria, dados.nome, dados.descricao, dados.preco, dados.image, dados.quantidade, idProduto);
    }
}
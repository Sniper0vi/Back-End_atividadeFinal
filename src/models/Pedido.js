export class Pedido{
    #id;
    #valorTotal;
    #status;
    #quantidade
    #dataCad

    //construtor

    constructor (pValorTotal, pStatus, pId){
        this.#valorTotal = pValorTotal
        this.#status = pStatus;
        this.#id = pId;
    }

    //getter
    get id (){
        return this.#id;
    }
    get valorTotal (){
        return this.#valorTotal;
    }
    get status (){
        return this.#status;
    }
    //setters
    set id(value){
        this.#validarId(value);
        this.#id = value
    }
  
    set valorTotal(value){
        this.#validarValorTotal(value);
        this.#valorTotal = value
    }
    set status(value){
        this.#status = value
    }
    //métodos auxiliares
    #validarId(value){
        if(value && value<=0){
            throw new Error("Verifique o ID informado");
        }
    } 
    #validarValorTotal(value){
        if(value && value<=0){
            throw new Error("Não foi possivel obter o subtotal");
        }
    }

    //design patterns

    static criar(dados){
        return new Pedido(dados.valorTotal, dados.status, null);
    }
    static alterar(dados, id){
        return new Pedido(dados.valorTotal, dados.status, id);
    }
}
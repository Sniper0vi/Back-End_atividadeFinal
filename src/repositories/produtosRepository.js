import { connection } from "../config/Database.js";

const produtosRepository = {

    // Criar um novo produto, inserindo seus dados na tabela de produtos
    criar:async (dados) => {
        const sql = 'INSERT INTO produtos(nome, descricao, preco, image, quantidade, idCategoria)VALUES (?, ?, ?, ?, ?, ?);';
        const values = [dados.nome, dados.descricao, dados.preco, dados.image, dados.quantidade, dados.idCategoria];
        console.log(values);
        const [rows] = await connection.execute(sql, values);
        return rows

        
    },

    // Editar um produto existente, atualizando seus campos com base no ID do produto
    editar:async (dados) => {
        const sql = 'UPDATE produtos SET  nome=?, descricao=?, preco=?, image=?, quantidade=?, idCategoria=? WHERE id = ?;'
        const values = [dados.nome, dados.descricao, dados.preco, dados.image, dados.quantidade, dados.idCategoria, dados.idProduto];
        const [rows] = await connection.execute(sql, values);
        return rows
    },

    // Deletar um produto com base no ID do produto, removendo-o da tabela de produtos
    deletar:async (id) => {
        const sql = 'DELETE FROM produtos WHERE id = ?;'
        const values = [id];
        const [rows] = await connection.execute(sql, values);
        return rows
    },

    // Selecionar todos os produtos, retornando uma lista de produtos com seus campos correspondentes
    selecionar:async () => {
        const sql = 'SELECT * FROM produtos;'
        const [rows] = await connection.execute(sql);
        return rows
    },

    // Selecionar um produto específico com base no ID do produto, retornando os campos correspondentes do produto
    selecionarId: async (id)=> {
        const sql = "SELECT * FROM produtos  WHERE id=?;";
        const values = [id];
        const [rows] = await connection.execute(sql, values);
        return rows
    }
}

export default produtosRepository
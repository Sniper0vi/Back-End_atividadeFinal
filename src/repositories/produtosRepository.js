import { connection } from "../config/Database.js";

const ProdutosRepository = {
    criar:async (dados) => {
        const sql = 'INSERT INTO Produtos(nome, descricao, preco, image, quantidade, idCategoria)VALUES (?, ?, ?, ?, ?, ?);';
        const values = [dados.nome, dados.descricao, dados.preco, dados.image, dados.quantidade, dados.idCategoria];
        console.log(values);
        const [rows] = await connection.execute(sql, values);
        return rows

        
    },
    editar:async (dados) => {
        const sql = 'UPDATE Produtos SET  nome=?, descricao=?, preco=?, image=?, quantidade=?, idCategoria=? WHERE id = ?;'
        const values = [dados.nome, dados.descricao, dados.preco, dados.image, dados.quantidade, dados.idCategoria, dados.idProduto];
        const [rows] = await connection.execute(sql, values);
        return rows
    },
    deletar:async (id) => {
        const sql = 'DELETE FROM Produtos WHERE id = ?;'
        const values = [id];
        const [rows] = await connection.execute(sql, values);
        return rows
    },
    selecionar:async () => {
        const sql = 'SELECT * FROM Produtos;'
        const [rows] = await connection.execute(sql);
        return rows
    },

    selecionarId: async (id)=> {
        const sql = "SELECT * FROM Produtos  WHERE id=?;";
        const values = [id];
        const [rows] = await connection.execute(sql, values);
        return rows
    }
}

export default ProdutosRepository
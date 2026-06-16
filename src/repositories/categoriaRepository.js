import { connection } from "../config/Database.js";

const categoriaRepository = {
    
    // Criar uma nova categoria, inserindo seus dados na tabela de categorias
    criar:async (categoria) => {
        const sql = 'INSERT INTO categorias (nome, descricao) VALUES (?, ?)'
        const values = [categoria.nome, categoria.descricao];
        const [rows] = await connection.execute(sql, values);
        return rows
    },

    // Editar uma categoria existente, atualizando seus campos com base no ID da categoria
    editar:async (categoria) => {
        const sql = 'UPDATE categorias SET nome=?, descricao=? WHERE id = ?;'
        const values = [categoria.nome, categoria.descricao, categoria.id];
        const [rows] = await connection.execute(sql, values);
        return rows
    },

    // Deletar uma categoria com base no ID da categoria, removendo-a da tabela de categorias
    deletar:async (id) => {
        const sql = 'DELETE FROM categorias WHERE id = ?;'
        const values = [id];
        const [rows] = await connection.execute(sql, values);
        return rows
    },
    // Selecionar todas as categorias, retornando uma lista de categorias com seus campos correspondentes
    selecionar:async () => {
        const sql = 'SELECT * FROM categorias;'
        const [rows] = await connection.execute(sql);
        return rows
    }
}

export default categoriaRepository
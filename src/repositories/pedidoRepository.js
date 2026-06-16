import { connection } from "../config/Database.js";
// Repositório para gerenciar Pedidos e itens de Pedidos
const pedidoRepository = {

    criar: async (pedido, itens) => {
        const conn = await connection.getConnection();

        try {
            await conn.beginTransaction();

            let valorTotal = 0;

            for (const item of itens) {
                // Buscar produto com FOR UPDATE (evita venda duplicada)
                const [produtoRows] = await conn.execute(
                    "SELECT quantidade, preco FROM Produtos WHERE id = ? FOR UPDATE",
                    [item.produtoId]
                );

                if (produtoRows.length === 0) {
                    throw new Error(`Produto ${item.produtoId} não encontrado`);
                }

                
                // Verificar se a quantidade solicitada é maior que o estoque disponível
                if (produtoRows[0].quantidade < 0) {
                    throw new Error(`Quantidade insuficiente para o produto ${item.produtoId}`);
                }
                
                valorTotal += produtoRows[0].preco * item.quantidade;

                // Atualizar o estoque do produto no banco de dados
                const [rowsPed] = await conn.execute(
                    "UPDATE Produtos SET quantidade = ? WHERE id = ?",
                    [produtoRows[0].quantidade, item.produtoId]
                ); 
            }

            const [pedidoResult] = await conn.execute(
                "INSERT INTO Pedidos(valorTotal, Status) VALUES (?, ?)",
                [valorTotal, pedido.status]
            );

            const pedidoId = pedidoResult.insertId;

            // Inserir os itens do pedido
            for (const item of itens) {
                const [produtoPreco] = await conn.execute(
                    "SELECT preco FROM Produtos WHERE id = ?",
                    [item.produtoId]
                );

                await conn.execute(
                          `INSERT INTO itens_Pedidos (pedidoId, produtoId, quantidade, valorItem)
                      VALUES (?, ?, ?, ?)`,
                    [pedidoId, item.produtoId, item.quantidade, produtoPreco[0].preco]
                );
            }

            await conn.commit();
            return { id: pedidoId, valorTotal };

        } catch (error) {
            await conn.rollback();
            console.error("Erro ao processar pedido:", error);
            throw error;
        }
        finally {
            conn.release();
        }
    },

    // Editar um pedido existente, atualizando o valor total e os itens do pedido
    editar: async (id, pedido, itens) => {
        const conn = await connection.getConnection();
        
        try {
            await conn.beginTransaction();

            let subTotal = 0;

            for (const item of itens) {
                const [produto] = await conn.execute(
                    "SELECT preco FROM Produtos WHERE id = ?",
                    [item.produtoId]
                );

                if (produto.length === 0) {
                    throw new Error(`Produto ${item.produtoId} não encontrado`);
                }
                
                const valor = produto[0].preco; 
                subTotal += valor * item.quantidade;

                
                
            }

            await conn.execute(
                "UPDATE Pedidos SET valorTotal = ?, Status = ? WHERE id = ?",
                [subTotal, pedido.status, id]
            );            

            for (const item of itens) {
                const [produto] = await conn.execute(
                    "SELECT preco FROM Produtos WHERE id = ?",
                    [item.produtoId]
                );

                const valor = produto[0].preco;

                await conn.execute(
                    `INSERT INTO itens_Pedidos (pedidoId, produtoId, quantidade, valorItem)
                     VALUES (?, ?, ?, ?)`,
                    [id, item.produtoId, item.quantidade, valor]
                );
            }

            await conn.commit();
            return { id, subTotal };

        } catch (error) {
            await conn.rollback();
            throw error;
        } finally {
            conn.release();
        }
    },

    // Deletar um pedido e seus itens associados
    deletar: async (id) => {
        const conn = await connection.getConnection();

        try {
            await conn.beginTransaction();

            await conn.execute(
                "DELETE FROM itens_Pedidos WHERE pedidoId = ?",
                [id]
            );

            await conn.execute(
                "DELETE FROM Pedidos WHERE id = ?",
                [id]
            );

            await conn.commit();
            return { id };

        } catch (error) {
            await conn.rollback();
            throw error;
        } finally {
            conn.release();
        }
    },
    // Remover um item específico de um pedido, atualizando o valor total do pedido
    removerItem: async (pedidoId, itemId) => {
        const conn = await connection.getConnection();

        try {
            await conn.beginTransaction();

            const [item] = await conn.execute(
                "SELECT * FROM itens_Pedidos WHERE id = ? AND pedidoId = ?",
                [itemId, pedidoId]
            );

            if (item.length === 0) {
                throw new Error("Item não encontrado no pedido");
            }

            await conn.execute(
                "DELETE FROM itens_Pedidos WHERE id = ?",
                [itemId]
            );

            const [itens] = await conn.execute(
                "SELECT quantidade, valorItem FROM itens_Pedidos WHERE pedidoId = ?",
                [pedidoId]
            );

            let valorTotal = 0;

            itens.forEach(i => {
                valorTotal += i.quantidade * i.valorItem;
            });

            await conn.execute(
                "UPDATE Pedidos SET valorTotal = ? WHERE id = ?",
                [valorTotal, pedidoId]
            );

            await conn.commit();

            return { pedidoId, itemId, valorTotal };

        } catch (error) {
            await conn.rollback();
            throw error;
        } finally {
            conn.release();
        }
    },

    // Selecionar todos os Pedidos com seus itens associados, ordenados por ID do pedido e ID do item
    selecionar: async () => {
        const [rows] = await connection.execute(`
            SELECT 
                p.*,
                i.id as itemId,
                i.produtoId,
                i.quantidade,
                i.valorItem
            FROM Pedidos p
            LEFT JOIN itens_Pedidos i ON i.pedidoId = p.id
            ORDER BY p.id DESC, i.id ASC
        `);

        return rows;
    },

    // Adicionar um item a um pedido existente, atualizando o valor total do pedido
    adicionarItem: async (pedidoId, item) => {
        const conn = await connection.getConnection();

        try {
            await conn.beginTransaction();

            const [produto] = await conn.execute(
                "SELECT preco FROM Produtos WHERE id = ?",
                [item.produtoId]
            );

            if (produto.length === 0) {
                throw new Error("Produto não encontrado");
            }

            const preco = produto[0].preco;

            await conn.execute(
                `INSERT INTO itens_Pedidos (pedidoId, produtoId, quantidade, valorItem)
                 VALUES (?, ?, ?, ?)`,
                [pedidoId, item.produtoId, item.quantidade, preco]
            );

            await conn.execute(
                `UPDATE Pedidos 
             SET valorTotal = valorTotal + ? 
             WHERE id = ?`,
                [preco * item.quantidade, pedidoId]
            );

            await conn.commit();

            return { pedidoId };

        } catch (error) {
            await conn.rollback();
            throw error;
        } finally {
            conn.release();
        }
    },

    // Editar um item específico de um pedido, atualizando a quantidade e o valor total do pedido
    editarItem: async (pedidoId, itemId, quantidade) => {
        const conn = await connection.getConnection();

        try {
            await conn.beginTransaction();

            if (quantidade === undefined || quantidade <= 0) {
                throw new Error("Quantidade inválida");
            }

            const [item] = await conn.execute(
                "SELECT * FROM itens_Pedidos WHERE id = ? AND pedidoId = ?",
                [itemId, pedidoId]
            );

            if (item.length === 0) {
                throw new Error("Item não encontrado no pedido");
            }

            const [produto] = await conn.execute(
                "SELECT preco FROM Produtos WHERE Id = ?",
                [item[0].produtoId]
            );

            if (!produto || produto.length === 0) {
                throw new Error("Produto não encontrado");
            }

            const subTotal = produto[0].preco;

            await conn.execute(
                `UPDATE itens_Pedidos 
             SET quantidade = ?, valorItem = ? 
             WHERE id = ?`,
                [quantidade, subTotal, itemId]
            );

            const [itens] = await conn.execute(
                "SELECT quantidade, valorItem FROM itens_Pedidos WHERE pedidoId = ?",
                [pedidoId]
            );

            let valorTotal = 0;

            itens.forEach(i => {
                valorTotal += i.quantidade * i.valorItem;
            });

            await conn.execute(
                "UPDATE Pedidos SET valorTotal = ? WHERE id = ?",
                [valorTotal, pedidoId]
            );

            await conn.commit();

            return { pedidoId, itemId, subTotal };

        } catch (error) {
            await conn.rollback();
            throw error;
        } finally {
            conn.release();
        }
    },

    // Editar o status de um pedido, garantindo que o status seja válido e que o pedido exista
    editarStatus: async (id, status) => {
        const conn = await connection.getConnection();

        try {
            await conn.beginTransaction();

            if (!status) {
                throw new Error("Status inválido");
            }

            const [pedido] = await conn.execute(
                "SELECT * FROM Pedidos WHERE id = ?",
                [id]
            );

            if (pedido.length === 0) {
                throw new Error("Pedido não encontrado");
            }

            await conn.execute(
                "UPDATE Pedidos SET Status = ? WHERE id = ?",
                [status, id]
            );

            await conn.commit();

            return { id, status };

        } catch (error) {
            await conn.rollback();
            throw error;
        } finally {
            conn.release();
        }
    }
}


export default pedidoRepository;
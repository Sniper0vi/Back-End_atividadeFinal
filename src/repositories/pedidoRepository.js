import { connection } from "../config/Database.js";
// Repositório para gerenciar pedidos e itens de pedidos
const pedidoRepository = {

    criar: async (pedido, itens) => {
        const conn = await connection.getConnection();

        try {
            await conn.beginTransaction();

            let valorTotal = 0;

            for (const item of itens) {
                // Buscar produto com FOR UPDATE (evita venda duplicada)
                const [produtoRows] = await conn.execute(
                    "SELECT quantidade, preco FROM produtos WHERE id = ? FOR UPDATE",
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
                    "UPDATE produtos SET quantidade = ? WHERE id = ?",
                    [produtoRows[0].quantidade, item.produtoId]
                ); 
            }

            const [pedidoResult] = await conn.execute(
                "INSERT INTO pedidos(valorTotal, Status) VALUES (?, ?)",
                [valorTotal, pedido.status]
            );

            const pedidoId = pedidoResult.insertId;

            // Inserir os itens do pedido
            for (const item of itens) {
                const [produtoPreco] = await conn.execute(
                    "SELECT preco FROM produtos WHERE id = ?",
                    [item.produtoId]
                );

                await conn.execute(
                    `INSERT INTO itens_pedidos (pedidoId, produtoId, quantidade, valorItem)
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

            // Calcular o valor total do pedido com base nos itens atualizados
            for (const item of itens) {
                const [produto] = await conn.execute(
                    "SELECT preco FROM produtos WHERE id = ?",
                    [item.produtoId]
                );

                if (produto.length === 0) {
                    throw new Error(`Produto ${item.produtoId} não encontrado`);
                }
                
                const valor = produto[0].preco;
                subTotal += valor * item.quantidade;

                
                
            }

            // Atualizar o valor total do pedido
            await conn.execute(
                "UPDATE pedidos SET valorTotal = ?, Status = ? WHERE id = ?",
                [subTotal, pedido.status, id]
            );            

            // Atualizar os itens do pedido
            for (const item of itens) {
                const [produto] = await conn.execute(
                    "SELECT preco FROM produtos WHERE id = ?",
                    [item.produtoId]
                );

                const valor = produto[0].preco;

                await conn.execute(
                    `INSERT INTO itens_pedidos (pedidoId, produtoId, quantidade, valorItem)
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
            // Iniciar uma transação para garantir a integridade dos dados
            await conn.beginTransaction();

            // Deletar os itens associados ao pedido
            await conn.execute(
                "DELETE FROM itens_pedidos WHERE pedidoId = ?",
                [id]
            );

            // Deletar o pedido
            await conn.execute(
                "DELETE FROM pedidos WHERE id = ?",
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
            // Iniciar uma transação para garantir a integridade dos dados
            await conn.beginTransaction();

            // Verificar se o item existe no pedido
            const [item] = await conn.execute(
                "SELECT * FROM itens_pedidos WHERE id = ? AND pedidoId = ?",
                [itemId, pedidoId]
            );

            // Se o item não existir, lançar um erro
            if (item.length === 0) {
                throw new Error("Item não encontrado no pedido");
            }

            // Deletar o item do pedido
            await conn.execute(
                "DELETE FROM itens_pedidos WHERE id = ?",
                [itemId]
            );

            // Recalcular o valor total do pedido após a remoção do item
            const [itens] = await conn.execute(
                "SELECT quantidade, valorItem FROM itens_pedidos WHERE pedidoId = ?",
                [pedidoId]
            );

            let valorTotal = 0;

            // Calcular o valor total do pedido com base nos itens restantes
            itens.forEach(i => {
                valorTotal += i.quantidade * i.valorItem;
            });

            // Atualizar o valor total do pedido no banco de dados
            await conn.execute(
                "UPDATE pedidos SET valorTotal = ? WHERE id = ?",
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

    // Selecionar todos os pedidos com seus itens associados, ordenados por ID do pedido e ID do item
    selecionar: async () => {
        const [rows] = await connection.execute(`
            SELECT 
                p.*,
                i.id as itemId,
                i.produtoId,
                i.quantidade,
                i.valorItem
            FROM pedidos p
            LEFT JOIN itens_pedidos i ON i.pedidoId = p.id
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
                "SELECT preco FROM produtos WHERE id = ?",
                [item.produtoId]
            );

            if (produto.length === 0) {
                throw new Error("Produto não encontrado");
            }

            const preco = produto[0].preco;

            // Inserir o novo item no pedido
            await conn.execute(
                `INSERT INTO itens_pedidos (pedidoId, produtoId, quantidade, valorItem)
             VALUES (?, ?, ?, ?)`,
                [pedidoId, item.produtoId, item.quantidade, preco]
            );

            // Atualizar o valor total do pedido no banco de dados
            await conn.execute(
                `UPDATE pedidos 
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
            // Iniciar uma transação para garantir a integridade dos dados
            await conn.beginTransaction();

            // Validar a quantidade do item
            if (quantidade === undefined || quantidade <= 0) {
                throw new Error("Quantidade inválida");
            }

            // Verificar se o item existe no pedido
            const [item] = await conn.execute(
                "SELECT * FROM itens_pedidos WHERE id = ? AND pedidoId = ?",
                [itemId, pedidoId]
            );

            // Se o item não existir, lançar um erro
            if (item.length === 0) {
                throw new Error("Item não encontrado no pedido");
            }

            // Buscar o preço do produto associado ao item para calcular o valor total atualizado
            const [produto] = await conn.execute(
                "SELECT preco FROM produtos WHERE idProduto = ?",
                [item[0].ProdutoId]
            );

            // Se o produto não existir, lançar um erro
            if (!produto || produto.length === 0) {
                throw new Error("Produto não encontrado");
            }

            const valor = produto[0].preco;

            // Atualizar a quantidade do item no banco de dados
            await conn.execute(
                `UPDATE itens_pedidos 
             SET quantidade = ?, valorItem = ? 
             WHERE id = ?`,
                [quantidade, valor, itemId]
            );

            // Recalcular o valor total do pedido após a atualização do item
            const [itens] = await conn.execute(
                "SELECT quantidade, valorItem FROM itens_pedidos WHERE pedidoId = ?",
                [pedidoId]
            );

            let valorTotal = 0;

            itens.forEach(i => {
                valorTotal += i.quantidade * i.valorItem;
            });

            // Atualizar o valor total do pedido no banco de dados
            await conn.execute(
                "UPDATE pedidos SET valorTotal = ? WHERE id = ?",
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
            // Iniciar uma transação para garantir a integridade dos dados
            await conn.beginTransaction();

            if (!status) {
                throw new Error("Status inválido");
            }

            const [pedido] = await conn.execute(
                "SELECT * FROM pedidos WHERE id = ?",
                [id]
            );

            if (pedido.length === 0) {
                throw new Error("Pedido não encontrado");
            }

            await conn.execute(
                "UPDATE pedidos SET Status = ? WHERE id = ?",
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
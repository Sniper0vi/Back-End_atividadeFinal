import { statusPed } from "../enums/statusPedido.js";
import { ItensPedido } from "../models/ItensPedido.js";
import { Pedido } from "../models/Pedido.js";
import pedidoRepository from "../repositories/pedidoRepository.js";

const pedidoController = {

    // Criar um novo pedido, inserindo seus dados na tabela de pedidos
    criar: async (req, res) => {
        try {
            
            const {itens} = req.body;

            if (!Array.isArray(itens) || itens.length === 0) {
                return res.status(400).json({ message: "Informe os itens do pedido" });
            }

            const itensPedido = itens.map(item =>
                ItensPedido.criar({
                    produtoId: item.produtoId,
                    quantidade: item.quantidade
                })
            );

            const valorTotal = ItensPedido.calcularSubTotalItens(itensPedido);

            const pedido = Pedido.criar({
                valorTotal,
                status: statusPed.ABERTO,
               
            });

            const result = await pedidoRepository.criar(pedido, itensPedido);
            

            return res.status(201).json(result);

        } catch (error) {
            console.error(error)
            return res.status(500).json({
                message: "Erro ao criar pedido",
                errorMessage: error.message
            });
        }
    },

    // Editar um pedido existente, atualizando seus campos com base no ID do pedido
    editar: async (req, res) => {
        try {
            const { id } = req.params;
            const {status, itens } = req.body;

            if (!id || Number(id) <= 0) {
                return res.status(400).json({ message: "ID inválido" });
            }

          

            if (!Object.values(statusPed).includes(status)) {
                return res.status(400).json({ message: "Status inválido" });
            }

            if (!Array.isArray(itens) || itens.length === 0) {
                return res.status(400).json({ message: "Informe os itens" });
            }

            const itensPedido = itens.map(item =>
                ItensPedido.alterar({
                    produtoId: item.produtoId,
                    quantidade: item.quantidade,
                    valorItem: item.valorItem
                })
            );

            const valorTotal = ItensPedido.calcularSubTotalItens(itensPedido);

            const pedido = Pedido.alterar(
                { valorTotal, status },
                id
            );
            console.log(pedido);
            
            const result = await pedidoRepository.editar(id, pedido, itensPedido);

            return res.status(200).json({
                message: "Pedido atualizado",
                data: result
            });

        } catch (error) {
            return res.status(500).json({
                message: "Erro ao editar pedido",
                errorMessage: error.message
            });
        }
    },

    // Deletar um pedido com base no ID do pedido, removendo-o da tabela de pedidos
    deletar: async (req, res) => {
        try {
            const { id } = req.params;

            if (!id || Number(id) <= 0) {
                return res.status(400).json({ message: "ID inválido" });
            }

            const result = await pedidoRepository.deletar(Number(id));

            return res.status(200).json({
                message: "Pedido deletado",
                data: result
            });

        } catch (error) {
            return res.status(500).json({
                message: "Erro ao deletar pedido",
                errorMessage: error.message
            });
        }
    },

    // Selecionar todos os pedidos, retornando uma lista de pedidos com seus campos correspondentes
    selecionar: async (req, res) => {
        try {
            const result = await pedidoRepository.selecionar();
            return res.status(200).json(result);
        } catch (error) {
            return res.status(500).json({
                message: "Erro ao buscar pedidos",
                errorMessage: error.message
            });
        }
    },

    // Selecionar um pedido específico com base no ID do pedido, retornando os campos correspondentes do pedido
    adicionarItem: async (req, res) => {
        try {
            const { id } = req.params;
            const { produtoId, quantidade } = req.body;

            if (!id || Number(id) <= 0) {
                return res.status(400).json({ message: "Pedido inválido" });
            }

            if (!produtoId || !quantidade || quantidade <= 0) {
                return res.status(400).json({ message: "Dados do item inválidos" });
            }

            const item = ItensPedido.criar({ produtoId, quantidade });

            const result = await pedidoRepository.adicionarItem(id, item);

            return res.status(200).json({
                message: "Item adicionado",
                data: result
            });

        } catch (error) {
            return res.status(500).json({
                message: "Erro ao adicionar item",
                errorMessage: error.message
            });
        }
    },

    // Editar um item específico de um pedido, atualizando seus campos com base no ID do pedido e no ID do item
    editarItem: async (req, res) => {
        try {
            const { id, itemId } = req.params;
            const { quantidade } = req.body;

            if (!quantidade || quantidade <= 0) {
                return res.status(400).json({ message: "Quantidade inválida" });
            }

            const result = await pedidoRepository.editarItem(
                Number(id),
                Number(itemId),
                quantidade
            );

            return res.status(200).json({
                message: "Item atualizado",
                data: result
            });

        } catch (error) {
            return res.status(500).json({
                message: "Erro ao editar item",
                errorMessage: error.message
            });
        }
    },

    // Remover um item específico de um pedido, deletando-o com base no ID do pedido e no ID do item
    removerItem: async (req, res) => {
        try {
            const { id, itemId } = req.params;

            if (!id || Number(id) <= 0) {
                return res.status(400).json({ message: "Pedido inválido" });
            }

            if (!itemId || Number(itemId) <= 0) {
                return res.status(400).json({ message: "Item inválido" });
            }

            const result = await pedidoRepository.removerItem(
                Number(id),
                Number(itemId)
            );

            return res.status(200).json({
                message: "Item removido",
                data: result
            });

        } catch (error) {
            return res.status(500).json({
                message: "Erro ao remover item",
                errorMessage: error.message
            });
        }
    },

    // Editar o status de um pedido, atualizando-o com base no ID do pedido
    editarStatus: async (req, res) => {
        try {
            const { id } = req.params;
            const { status } = req.body;

            if (!id || Number(id) <= 0) {
                return res.status(400).json({ message: "ID inválido" });
            }

            if (!Object.values(statusPed).includes(status)) {
                return res.status(400).json({ message: "Status inválido" });
            }

            const result = await pedidoRepository.editarStatus(
                Number(id),
                status
            );

            return res.status(200).json({
                message: "Status atualizado",
                data: result
            });

        } catch (error) {
            return res.status(500).json({
                message: "Erro ao atualizar status",
                errorMessage: error.message
            });
        }
    }
};

export default pedidoController;
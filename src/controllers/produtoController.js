import { Produtos } from "../models/Produtos.js";
import produtosRepository from "../repositories/produtosRepository.js";

const produtoController = {
    inserir: async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ message: 'Imagem não foi enviada' });
            }
            const { idCategoria, nome, preco, quantidade, descricao } = req.body;
            const image = req.file.filename;
             const produto = Produtos.criar({ idCategoria, nome, descricao, preco, image, quantidade });
            const result = await produtosRepository.criar(produto);
            res.status(201).json({ result });


        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Erro ao inserir produto', errorMessage: error.message });
        }
    },
    alterar: async (req, res) => {
        try {
            const { idCategoria, nome, preco, descricao, quantidade } = req.body;
            const idProduto = req.params.id;
            const image = req.file ? req.file.filename : null;
            const produto = Produtos.alterar({ idCategoria, nome, descricao, preco, image, quantidade }, idProduto);

            const result = await produtosRepository.editar(produto);
            res.status(200).json({ result });

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Erro ao alterar produto', errorMessage: error.message });
        }
    },
    deletar: async (req, res) => {
        try {
            const id = req.params.id;
            await produtosRepository.deletar(id);
            res.status(200).json({ message: `Produto de id: ${id} excluído com sucesso` });

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Erro ao deletar produto', errorMessage: error.message });
        }
    },
    selecionar: async (req, res) => {
        try {
            const result = await produtosRepository.selecionar();
            res.status(200).json({ result });

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Erro ao selecionar produtos', errorMessage: error.message });
        }
    },

    selecionarId: async (req, res) => {
        try {
            const id = req.params.id;
            const result = await produtosRepository.selecionarId(id);
            res.status(200).json({ result });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Erro ao selecionar produtos', errorMessage: error.message });
        }
    }

}

export default produtoController;
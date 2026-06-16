import { Categoria } from "../models/Categoria.js";
import categoriaRepository from "../repositories/categoriaRepository.js";

const categoriaController = {

    // Criar uma nova categoria, inserindo seus dados na tabela de categorias
    criar: async (req, res) => {
        try {
            const {nome, descricao} = req.body;
            const categoria = Categoria.criar({nome, descricao});
            const result = await categoriaRepository.criar(categoria); 
            res.status(201).json({result})
        } catch (error) {
            console.log(error);
            res.status(500).json({message:'Ocorreu um erro no servidor', errorMessage: error.message});
        }
    },

    // Editar uma categoria existente, atualizando seus campos com base no ID da categoria
    editar: async (req, res) => {
        try {
            const id = req.params.id;
            const {nome, descricao} = req.body;
            const categoria = Categoria.alterar({nome, descricao}, id);
            const result = await categoriaRepository.editar(categoria); 
            res.status(200).json({result})
        } catch (error) {
            console.log(error);
            res.status(500).json({message:'Ocorreu um erro no servidor', errorMessage: error.message});
        }
    },

    // Deletar uma categoria com base no ID da categoria, removendo-a da tabela de categorias
    deletar: async (req, res) => {
        try {
            const id = req.params.id;
            await categoriaRepository.deletar(id);
            res.status(200).json({message:'categoria deletada com sucesso'});
        } catch (error) {
            console.log(error);
            res.status(500).json({message:'Ocorreu um erro no servidor', errorMessage: error.message});
        }
    },

    // Selecionar todas as categorias, retornando uma lista de categorias com seus campos correspondentes
    selecionar: async (req, res) => {
        try {
            const result = await categoriaRepository.selecionar();
            res.status(200).json({result});
        } catch (error) {
            console.log(error);
            res.status(500).json({message:'Ocorreu um erro no servidor', errorMessage: error.message});
        }
    }
}

export default categoriaController
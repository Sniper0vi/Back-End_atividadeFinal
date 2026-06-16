import path from 'path';
import fs from 'fs';
import imagensRepository from "../repositories/imagensRepository.js";

const imagensController = {
    selecionar: async (req, res) => {
        try {
            const param = req.params.id;

            // Se o parâmetro parece ser um nome de arquivo (contém extensão), tenta enviar direto
            const possivelArquivo = path.join(process.cwd(), 'uploads', 'imagens', param);
            if (fs.existsSync(possivelArquivo)) {
                return res.sendFile(possivelArquivo);
            }

            // Caso contrário, trata como product id e busca o nome do arquivo no banco
            const result = await imagensRepository.selecionar(param);

            if (!result || result.length === 0 || !result[0].image) {
                return res.status(404).json({ message: 'Imagem não encontrada' });
            }

            const arquivo = result[0].image;
            const caminhoImagem = path.join(process.cwd(), 'uploads', 'imagens', arquivo);

            if (!fs.existsSync(caminhoImagem)) {
                return res.status(404).json({ message: 'Arquivo de imagem não existe no servidor' });
            }

            return res.sendFile(caminhoImagem, (err) => {
                if (err) {
                    console.error('Erro ao enviar arquivo de imagem:', err);
                    if (!res.headersSent) {
                        res.status(500).json({ message: 'Erro ao enviar imagem' });
                    }
                }
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({message:'Ocorreu um erro no servidor', errorMessage: error.message});
        }
    }
};

export default imagensController;
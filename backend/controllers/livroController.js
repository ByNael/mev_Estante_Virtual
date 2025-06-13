const livroService = require("../services/LivroService")
const errorHandler = require("../utils/errorHandler")
const Livro = require('../models/Livro');
const { EstadoEmLeitura, EstadoConcluido } = require('../models/EstadoLivro');

exports.getLivros = async (req, res) => {
  try {
    const livros = await livroService.listarLivrosPorUsuario(req.user.id)
    res.json(livros)
  } catch (error) {
    errorHandler(res, error, "Erro ao buscar livros")
  }
}

exports.getLivro = async (req, res) => {
  try {
    const livro = await livroService.buscarLivroPorId(req.params.id, req.user.id)
    res.json(livro)
  } catch (error) {
    errorHandler(res, error, "Erro ao buscar livro")
  }
}

exports.criarLivro = async (req, res) => {
  try {
    const livroCriado = await livroService.criarLivro(req.body, req.user.id)
    res.status(201).json(livroCriado)
  } catch (error) {
    errorHandler(res, error, "Erro ao criar livro")
  }
}

exports.atualizarLivro = async (req, res) => {
  try {
    const livroAtualizado = await livroService.atualizarLivro(req.params.id, req.body, req.user.id)
    res.json(livroAtualizado)
  } catch (error) {
    errorHandler(res, error, "Erro ao atualizar livro")
  }
}

exports.excluirLivro = async (req, res) => {
  try {
    await livroService.excluirLivro(req.params.id, req.user.id)
    res.json({ message: "Livro excluído com sucesso" })
  } catch (error) {
    errorHandler(res, error, "Erro ao excluir livro")
  }
}

exports.buscarLivros = async (req, res) => {
  try {
    const livros = await livroService.buscarLivrosPorTermo(req.query.termo, req.user.id)
    res.json(livros)
  } catch (error) {
    errorHandler(res, error, "Erro ao buscar livros")
  }
}

exports.atualizarStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { novoStatus } = req.body;

        const livro = await Livro.findById(id);
        if (!livro) {
            return res.status(404).json({ message: 'Livro não encontrado' });
        }

        switch (novoStatus) {
            case 'em_leitura':
                livro.setEstado(new EstadoEmLeitura());
                break;
            case 'concluido':
                livro.setEstado(new EstadoConcluido());
                break;
            default:
                return res.status(400).json({ message: 'Status inválido' });
        }

        livro.atualizar();
        await livro.save();

        res.json(livro);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

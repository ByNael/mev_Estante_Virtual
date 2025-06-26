const livroService = require("../services/livroService")
const { handleError } = require("../utils/errorHandler")
const Livro = require('../models/Livro');
const { EstadoNaoIniciado, EstadoEmLeitura, EstadoConcluido } = require('../models/EstadoLivro');
const ProgressoLeitura = require('../models/ProgressoLeitura');

exports.getLivros = async (req, res) => {
  try {
    const livros = await livroService.listarLivrosPorUsuario(req.user.id)
    res.json(livros)
  } catch (error) {
    handleError(res, error, "Erro ao buscar livros")
  }
}

exports.getLivro = async (req, res) => {
  try {
    const livro = await livroService.buscarLivroPorId(req.params.id, req.user.id)
    res.json(livro)
  } catch (error) {
    handleError(res, error, "Erro ao buscar livro")
  }
}

exports.criarLivro = async (req, res) => {
  try {
    const livroCriado = await livroService.criarLivro(req.body, req.user.id)
    res.status(201).json(livroCriado)
  } catch (error) {
    handleError(res, error, "Erro ao criar livro")
  }
}

exports.atualizarLivro = async (req, res) => {
  try {
    const livroAtualizado = await livroService.atualizarLivro(req.params.id, req.body, req.user.id)
    res.json(livroAtualizado)
  } catch (error) {
    handleError(res, error, "Erro ao atualizar livro")
  }
}

exports.excluirLivro = async (req, res) => {
  try {
    await livroService.excluirLivro(req.params.id, req.user.id)
    res.json({ message: "Livro excluído com sucesso" })
  } catch (error) {
    handleError(res, error, "Erro ao excluir livro")
  }
}

exports.buscarLivros = async (req, res) => {
  try {
    const livros = await livroService.buscarLivrosPorTermo(req.query.termo, req.user.id)
    res.json(livros)
  } catch (error) {
    handleError(res, error, "Erro ao buscar livros")
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
        // Verifica se o usuário é o dono do livro
        if (livro.usuarioId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Acesso negado' });
        }
        switch (novoStatus) {
            case 'quero_ler':
                livro.setEstado(new EstadoNaoIniciado());
                // Atualizar também o statusLeitura do progresso
                await ProgressoLeitura.updateOne(
                  { livroId: id, usuarioId: req.user.id },
                  { $set: { statusLeitura: 'quero_ler' } }
                );
                break;
            case 'em_leitura':
                livro.setEstado(new EstadoEmLeitura());
                // Atualizar também o statusLeitura do progresso
                await ProgressoLeitura.updateOne(
                  { livroId: id, usuarioId: req.user.id },
                  { $set: { statusLeitura: 'em_leitura' } }
                );
                break;
            case 'concluido':
                livro.setEstado(new EstadoConcluido());
                // Atualizar também o statusLeitura do progresso
                await ProgressoLeitura.updateOne(
                  { livroId: id, usuarioId: req.user.id },
                  { $set: { statusLeitura: 'concluido' } }
                );
                break;
            default:
                return res.status(400).json({ message: 'Status inválido. Use "quero_ler", "em_leitura" ou "concluido".' });
        }
        livro.atualizar();
        await livro.save();
        res.json({ message: 'Status atualizado com sucesso', livro });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.uploadCapa = async (req, res) => {
    try {
        const { id } = req.params;
        if (!req.file) {
            return res.status(400).json({ message: 'Nenhuma imagem enviada.' });
        }
        const livro = await Livro.findById(id);
        if (!livro) {
            return res.status(404).json({ message: 'Livro não encontrado.' });
        }
        // Atualiza o campo capa com o caminho relativo
        livro.capa = `/uploads/capas/${req.file.filename}`;
        await livro.save();
        res.json({ message: 'Capa atualizada com sucesso.', capa: livro.capa });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

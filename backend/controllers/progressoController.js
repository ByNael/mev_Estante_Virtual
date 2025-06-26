const progressoService = require("../services/progressoService")
const estatisticasService = require("../services/estatisticasService")
const { handleError } = require("../utils/errorHandler")
const ProgressoLeitura = require("../models/ProgressoLeitura")

exports.getProgressoLivro = async (req, res) => {
  try {
    const progresso = await progressoService.buscarPorLivro(req.params.livroId, req.user.id)
    if (!progresso) return res.status(404).json({ message: "Progresso de leitura não encontrado" })
    res.json(progresso)
  } catch (error) {
    handleError(res, error, "Erro ao buscar progresso de leitura")
  }
}

exports.getProgressos = async (req, res) => {
  try {
    const progressos = await progressoService.listarTodos(req.user.id)
    res.json(progressos)
  } catch (error) {
    handleError(res, error, "Erro ao buscar progressos de leitura")
  }
}

exports.atualizarProgresso = async (req, res) => {
  try {
    const progresso = await progressoService.criarOuAtualizar(
      req.params.livroId,
      req.user.id,
      req.body
    )
    res.json(progresso)
  } catch (error) {
    handleError(res, error, "Erro ao atualizar progresso de leitura")
  }
}

exports.excluirProgresso = async (req, res) => {
  try {
    const excluido = await progressoService.excluir(req.params.livroId, req.user.id)
    if (!excluido) return res.status(404).json({ message: "Progresso de leitura não encontrado" })
    res.json({ message: "Progresso de leitura excluído com sucesso" })
  } catch (error) {
    handleError(res, error, "Erro ao excluir progresso de leitura")
  }
}

exports.getEstatisticas = async (req, res) => {
  try {
    const estatisticas = await estatisticasService.gerar(req.user.id)
    res.json(estatisticas)
  } catch (error) {
    handleError(res, error, "Erro ao buscar estatísticas")
  }
}

exports.atualizarStatusLeitura = async (req, res) => {
  try {
    const { id } = req.params; // id do progresso
    const { statusLeitura } = req.body;
    const progresso = await ProgressoLeitura.findById(id);
    if (!progresso) {
      return res.status(404).json({ message: 'Progresso não encontrado' });
    }
    progresso.statusLeitura = statusLeitura;
    await progresso.save();
    res.json({ message: 'Status de leitura atualizado com sucesso', progresso });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.avaliarLivro = async (req, res) => {
  try {
    const { id } = req.params; // id do progresso
    const { avaliacao } = req.body;
    if (!avaliacao || avaliacao < 1 || avaliacao > 5) {
      return res.status(400).json({ message: 'A avaliação deve ser um número inteiro de 1 a 5.' });
    }
    const progresso = await ProgressoLeitura.findById(id);
    if (!progresso) {
      return res.status(404).json({ message: 'Progresso não encontrado' });
    }
    if (progresso.statusLeitura !== 'concluido') {
      return res.status(400).json({ message: 'Só é possível avaliar livros marcados como lido.' });
    }
    progresso.avaliacao = avaliacao;
    await progresso.save();
    res.json({ message: 'Avaliação registrada com sucesso', progresso });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMediaAvaliacao = async (req, res) => {
  try {
    const { livroId } = req.params;
    const media = await require('../services/progressoService').mediaAvaliacaoLivro(livroId);
    res.json({ media });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.salvarOuAtualizarNota = async (req, res) => {
  try {
    const { livroId } = req.params;
    const { avaliacao } = req.body;
    if (!avaliacao || avaliacao < 1 || avaliacao > 5) {
      return res.status(400).json({ message: 'A nota deve ser um número inteiro de 1 a 5.' });
    }
    // Buscar progresso do usuário para o livro
    let progresso = await ProgressoLeitura.findOne({ livroId, usuarioId: req.user.id });
    if (!progresso) {
      // Buscar o livro para pegar totalPaginas
      const livro = await require('../models/Livro').findById(livroId);
      if (!livro) {
        return res.status(404).json({ message: 'Livro não encontrado.' });
      }
      progresso = new ProgressoLeitura({
        livroId,
        usuarioId: req.user.id,
        paginaAtual: livro.totalPaginas || 1,
        totalPaginas: livro.totalPaginas || 1,
        comentario: '',
        statusLeitura: 'concluido',
        avaliacao,
        dataAtualizacao: new Date(),
      });
      await progresso.save();
      return res.json({ message: 'Nota salva e progresso criado com sucesso', avaliacao: progresso.avaliacao });
    }
    if (progresso.statusLeitura !== 'concluido') {
      return res.status(400).json({ message: 'Só é possível avaliar livros marcados como lido.' });
    }
    progresso.avaliacao = avaliacao;
    await progresso.save();
    res.json({ message: 'Nota salva com sucesso', avaliacao: progresso.avaliacao });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

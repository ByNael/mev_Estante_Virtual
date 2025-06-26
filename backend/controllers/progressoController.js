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

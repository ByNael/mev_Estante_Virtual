const progressoService = require("../services/progressoService")
const estatisticasService = require("../services/estatisticasService")
const { handleError } = require("../utils/errorHandler")

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

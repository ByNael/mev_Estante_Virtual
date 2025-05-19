const ProgressoLeitura = require("../models/ProgressoLeitura")
const Livro = require("../models/Livro")
const mongoose = require("mongoose")

// @desc    Obter progresso de leitura de um livro
// @route   GET /api/progresso/:livroId
// @access  Private
exports.getProgressoLivro = async (req, res) => {
  try {
    const progresso = await ProgressoLeitura.findOne({
      livroId: req.params.livroId,
      usuarioId: req.user.id,
    }).populate("livroId", "titulo autor")

    if (!progresso) {
      return res.status(404).json({ message: "Progresso de leitura não encontrado" })
    }

    res.json(progresso)
  } catch (error) {
    console.error("Erro ao buscar progresso de leitura:", error)
    res.status(500).json({ message: "Erro ao buscar progresso de leitura" })
  }
}

// @desc    Obter todos os progressos de leitura do usuário
// @route   GET /api/progresso
// @access  Private
exports.getProgressos = async (req, res) => {
  try {
    const progressos = await ProgressoLeitura.find({
      usuarioId: req.user.id,
    }).populate("livroId", "titulo autor capa")

    res.json(progressos)
  } catch (error) {
    console.error("Erro ao buscar progressos de leitura:", error)
    res.status(500).json({ message: "Erro ao buscar progressos de leitura" })
  }
}

// @desc    Criar ou atualizar progresso de leitura
// @route   POST /api/progresso/:livroId
// @access  Private
exports.atualizarProgresso = async (req, res) => {
  try {
    const { paginaAtual, totalPaginas, comentario } = req.body
    const livroId = req.params.livroId

    // Verificar se o livro existe e pertence ao usuário
    const livro = await Livro.findOne({
      _id: livroId,
      usuarioId: req.user.id,
    })

    if (!livro) {
      return res.status(404).json({ message: "Livro não encontrado ou acesso negado" })
    }

    // Verificar se já existe um progresso para este livro
    let progresso = await ProgressoLeitura.findOne({
      livroId,
      usuarioId: req.user.id,
    })

    if (progresso) {
      // Atualizar progresso existente
      progresso.paginaAtual = paginaAtual
      progresso.totalPaginas = totalPaginas
      progresso.comentario = comentario
      progresso.dataAtualizacao = Date.now()

      await progresso.save()
    } else {
      // Criar novo progresso
      progresso = new ProgressoLeitura({
        livroId,
        usuarioId: req.user.id,
        paginaAtual,
        totalPaginas,
        comentario,
        dataAtualizacao: Date.now(),
      })

      await progresso.save()
    }

    // Atualizar o status de leitura do livro se necessário
    if (paginaAtual === 0) {
      livro.statusLeitura = "Não iniciado"
    } else if (paginaAtual >= totalPaginas) {
      livro.statusLeitura = "Concluído"
    } else {
      livro.statusLeitura = "Em andamento"
    }

    await livro.save()

    res.json(progresso)
  } catch (error) {
    console.error("Erro ao atualizar progresso de leitura:", error)
    res.status(500).json({ message: "Erro ao atualizar progresso de leitura", error: error.message })
  }
}

// @desc    Excluir progresso de leitura
// @route   DELETE /api/progresso/:livroId
// @access  Private
exports.excluirProgresso = async (req, res) => {
  try {
    const progresso = await ProgressoLeitura.findOne({
      livroId: req.params.livroId,
      usuarioId: req.user.id,
    })

    if (!progresso) {
      return res.status(404).json({ message: "Progresso de leitura não encontrado" })
    }

    await ProgressoLeitura.findByIdAndDelete(progresso._id)

    // Atualizar o status do livro para "Não iniciado"
    await Livro.findByIdAndUpdate(req.params.livroId, {
      statusLeitura: "Não iniciado",
    })

    res.json({ message: "Progresso de leitura excluído com sucesso" })
  } catch (error) {
    console.error("Erro ao excluir progresso de leitura:", error)
    res.status(500).json({ message: "Erro ao excluir progresso de leitura" })
  }
}

// @desc    Obter estatísticas de leitura do usuário
// @route   GET /api/progresso/estatisticas
// @access  Private
exports.getEstatisticas = async (req, res) => {
  try {
    const totalLivros = await Livro.countDocuments({ usuarioId: req.user.id })

    const statusCount = await Livro.aggregate([
      { $match: { usuarioId: new mongoose.Types.ObjectId(req.user.id) } },
      { $group: { _id: "$statusLeitura", count: { $sum: 1 } } },
    ])

    const statusMap = {}
    statusCount.forEach((item) => {
      statusMap[item._id] = item.count
    })

    const progressos = await ProgressoLeitura.find({ usuarioId: req.user.id })

    let totalPaginasLidas = 0
    progressos.forEach((p) => {
      totalPaginasLidas += p.paginaAtual
    })

    res.json({
      totalLivros,
      statusLeitura: {
        naoIniciado: statusMap["Não iniciado"] || 0,
        emAndamento: statusMap["Em andamento"] || 0,
        concluido: statusMap["Concluído"] || 0,
        abandonado: statusMap["Abandonado"] || 0,
      },
      totalPaginasLidas,
    })
  } catch (error) {
    console.error("Erro ao buscar estatísticas:", error)
    res.status(500).json({ message: "Erro ao buscar estatísticas" })
  }
}

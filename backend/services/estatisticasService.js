const Livro = require("../models/Livro")
const ProgressoLeitura = require("../models/ProgressoLeitura")
const mongoose = require("mongoose")

exports.gerar = async (usuarioId) => {
  const totalLivros = await Livro.countDocuments({ usuarioId })
  const statusCount = await Livro.aggregate([
    { $match: { usuarioId: new mongoose.Types.ObjectId(usuarioId) } },
    { $group: { _id: "$statusLeitura", count: { $sum: 1 } } },
  ])

  const statusMap = Object.fromEntries(statusCount.map(s => [s._id, s.count]))

  const progressos = await ProgressoLeitura.find({ usuarioId })
  const totalPaginasLidas = progressos.reduce((acc, p) => acc + p.paginaAtual, 0)

  return {
    totalLivros,
    statusLeitura: {
      naoIniciado: statusMap["Não iniciado"] || 0,
      emAndamento: statusMap["Em andamento"] || 0,
      concluido: statusMap["Concluído"] || 0,
      abandonado: statusMap["Abandonado"] || 0,
    },
    totalPaginasLidas,
  }
}

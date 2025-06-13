const Livro = require("../models/Livro")
const ProgressoLeitura = require("../models/ProgressoLeitura")
const { atualizarStatusLeitura } = require("../utils/statusLeituraUtils")

exports.buscarPorLivro = async (livroId, usuarioId) => {
  return await ProgressoLeitura.findOne({ livroId, usuarioId }).populate("livroId", "titulo autor")
}

exports.listarTodos = async (usuarioId) => {
  return await ProgressoLeitura.find({ usuarioId }).populate("livroId", "titulo autor capa")
}

exports.criarOuAtualizar = async (livroId, usuarioId, dados) => {
  const { paginaAtual, totalPaginas, comentario } = dados

  const livro = await Livro.findOne({ _id: livroId, usuarioId })
  if (!livro) throw new Error("Livro não encontrado ou acesso negado")

  let progresso = await ProgressoLeitura.findOne({ livroId, usuarioId })

  if (progresso) {
    progresso.set({ paginaAtual, totalPaginas, comentario, dataAtualizacao: Date.now() })
  } else {
    progresso = new ProgressoLeitura({ livroId, usuarioId, paginaAtual, totalPaginas, comentario, dataAtualizacao: Date.now() })
  }

  await progresso.save()

  livro.statusLeitura = atualizarStatusLeitura(paginaAtual, totalPaginas)
  await livro.save()

  return progresso
}

exports.excluir = async (livroId, usuarioId) => {
  const progresso = await ProgressoLeitura.findOne({ livroId, usuarioId })
  if (!progresso) return false

  await progresso.deleteOne()
  await Livro.findByIdAndUpdate(livroId, { statusLeitura: "Não iniciado" })
  return true
}

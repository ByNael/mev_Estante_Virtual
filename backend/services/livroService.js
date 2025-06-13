const Livro = require("../models/Livro")
const ProgressoLeitura = require("../models/ProgressoLeitura")
const NotFoundError = require("../errors/notFoundError")
const ForbiddenError = require("../errors/forbiddenError")
const BadRequestError = require("../errors/badRequestError")

async function verificarLivroDoUsuario(livroId, usuarioId) {
  const livro = await Livro.findById(livroId)
  if (!livro) throw new NotFoundError("Livro não encontrado")
  if (livro.usuarioId.toString() !== usuarioId) throw new ForbiddenError("Acesso negado")
  return livro
}

exports.listarLivrosPorUsuario = async (usuarioId) => {
  return Livro.find({ usuarioId }).sort({ dataCadastro: -1 })
}

exports.buscarLivroPorId = async (livroId, usuarioId) => {
  return verificarLivroDoUsuario(livroId, usuarioId)
}

exports.criarLivro = async (dados, usuarioId) => {
  const { totalPaginas, ...resto } = dados
  const livro = new Livro({ ...resto, usuarioId })
  const livroSalvo = await livro.save()

  if (totalPaginas) {
    const progresso = new ProgressoLeitura({
      livroId: livroSalvo._id,
      usuarioId,
      paginaAtual: 0,
      totalPaginas,
      comentario: "Progresso inicial",
      dataAtualizacao: Date.now()
    })
    await progresso.save()
  }

  return livroSalvo
}

exports.atualizarLivro = async (livroId, dados, usuarioId) => {
  await verificarLivroDoUsuario(livroId, usuarioId)
  return Livro.findByIdAndUpdate(livroId, dados, { new: true, runValidators: true })
}

exports.excluirLivro = async (livroId, usuarioId) => {
  await verificarLivroDoUsuario(livroId, usuarioId)
  await ProgressoLeitura.deleteMany({ livroId })
  await Livro.findByIdAndDelete(livroId)
}

exports.buscarLivrosPorTermo = async (termo, usuarioId) => {
  if (!termo) throw new BadRequestError("Termo de busca é obrigatório")

  return Livro.find({
    usuarioId,
    $or: [
      { titulo: { $regex: termo, $options: "i" } },
      { autor: { $regex: termo, $options: "i" } }
    ]
  }).sort({ dataCadastro: -1 })
}

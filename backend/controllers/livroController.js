const Livro = require("../models/Livro")
const ProgressoLeitura = require("../models/ProgressoLeitura")

// @desc    Obter todos os livros do usuário
// @route   GET /api/livros
// @access  Private
exports.getLivros = async (req, res) => {
  try {
    const livros = await Livro.find({ usuarioId: req.user.id }).sort({ dataCadastro: -1 })
    res.json(livros)
  } catch (error) {
    console.error("Erro ao buscar livros:", error)
    res.status(500).json({ message: "Erro ao buscar livros" })
  }
}

// @desc    Obter um livro específico
// @route   GET /api/livros/:id
// @access  Private
exports.getLivro = async (req, res) => {
  try {
    const livro = await Livro.findById(req.params.id)

    // Verificar se o livro existe
    if (!livro) {
      return res.status(404).json({ message: "Livro não encontrado" })
    }

    // Verificar se o livro pertence ao usuário
    if (livro.usuarioId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Acesso negado" })
    }

    res.json(livro)
  } catch (error) {
    console.error("Erro ao buscar livro:", error)
    res.status(500).json({ message: "Erro ao buscar livro" })
  }
}

// @desc    Criar um novo livro
// @route   POST /api/livros
// @access  Private
exports.criarLivro = async (req, res) => {
  try {
    const { titulo, autor, genero, anoPublicacao, statusLeitura, descricao, capa, totalPaginas } = req.body

    // Criar o livro
    const novoLivro = new Livro({
      titulo,
      autor,
      genero,
      anoPublicacao,
      statusLeitura,
      descricao,
      capa,
      usuarioId: req.user.id,
    })

    const livroSalvo = await novoLivro.save()

    // Criar um progresso inicial se o total de páginas for fornecido
    if (totalPaginas) {
      const novoProgresso = new ProgressoLeitura({
        livroId: livroSalvo._id,
        usuarioId: req.user.id,
        paginaAtual: 0,
        totalPaginas,
        comentario: "Progresso inicial",
        dataAtualizacao: Date.now(),
      })

      await novoProgresso.save()
    }

    res.status(201).json(livroSalvo)
  } catch (error) {
    console.error("Erro ao criar livro:", error)
    res.status(500).json({ message: "Erro ao criar livro", error: error.message })
  }
}

// @desc    Atualizar um livro
// @route   PUT /api/livros/:id
// @access  Private
exports.atualizarLivro = async (req, res) => {
  try {
    const { titulo, autor, genero, anoPublicacao, statusLeitura, descricao, capa } = req.body

    // Verificar se o livro existe
    let livro = await Livro.findById(req.params.id)

    if (!livro) {
      return res.status(404).json({ message: "Livro não encontrado" })
    }

    // Verificar se o livro pertence ao usuário
    if (livro.usuarioId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Acesso negado" })
    }

    // Atualizar o livro
    livro = await Livro.findByIdAndUpdate(
      req.params.id,
      {
        titulo,
        autor,
        genero,
        anoPublicacao,
        statusLeitura,
        descricao,
        capa,
      },
      { new: true, runValidators: true },
    )

    res.json(livro)
  } catch (error) {
    console.error("Erro ao atualizar livro:", error)
    res.status(500).json({ message: "Erro ao atualizar livro", error: error.message })
  }
}

// @desc    Excluir um livro
// @route   DELETE /api/livros/:id
// @access  Private
exports.excluirLivro = async (req, res) => {
  try {
    // Verificar se o livro existe
    const livro = await Livro.findById(req.params.id)

    if (!livro) {
      return res.status(404).json({ message: "Livro não encontrado" })
    }

    // Verificar se o livro pertence ao usuário
    if (livro.usuarioId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Acesso negado" })
    }

    // Excluir o progresso de leitura associado
    await ProgressoLeitura.deleteMany({ livroId: req.params.id })

    // Excluir o livro
    await Livro.findByIdAndDelete(req.params.id)

    res.json({ message: "Livro excluído com sucesso" })
  } catch (error) {
    console.error("Erro ao excluir livro:", error)
    res.status(500).json({ message: "Erro ao excluir livro" })
  }
}

// @desc    Buscar livros por título ou autor
// @route   GET /api/livros/busca
// @access  Private
exports.buscarLivros = async (req, res) => {
  try {
    const { termo } = req.query

    if (!termo) {
      return res.status(400).json({ message: "Termo de busca é obrigatório" })
    }

    const livros = await Livro.find({
      usuarioId: req.user.id,
      $or: [{ titulo: { $regex: termo, $options: "i" } }, { autor: { $regex: termo, $options: "i" } }],
    }).sort({ dataCadastro: -1 })

    res.json(livros)
  } catch (error) {
    console.error("Erro ao buscar livros:", error)
    res.status(500).json({ message: "Erro ao buscar livros" })
  }
}

const mongoose = require("mongoose")
const { EstadoNaoIniciado } = require('./EstadoLivro')

const LivroSchema = new mongoose.Schema(
  {
    titulo: {
      type: String,
      required: [true, "O título do livro é obrigatório"],
      trim: true,
      maxlength: [100, "O título não pode ter mais de 100 caracteres"],
    },
    autor: {
      type: String,
      required: [true, "O autor do livro é obrigatório"],
      trim: true,
      maxlength: [100, "O nome do autor não pode ter mais de 100 caracteres"],
    },
    genero: {
      type: String,
      required: [true, "O gênero do livro é obrigatório"],
      trim: true,
    },
    anoPublicacao: {
      type: Number,
      required: [true, "O ano de publicação é obrigatório"],
      min: [1000, "Ano de publicação inválido"],
      max: [new Date().getFullYear(), "Ano de publicação não pode ser no futuro"],
    },
    descricao: {
      type: String,
      trim: true,
      maxlength: [500, "A descrição não pode ter mais de 500 caracteres"],
    },
    capa: {
      type: String,
      default: "default-book-cover.jpg",
    },
    usuarioId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    dataCadastro: {
      type: Date,
      default: Date.now,
    },
    status: { 
      type: String, 
      enum: ['quero_ler', 'em_leitura', 'concluido'],
      default: 'quero_ler' 
    },
    dataAtualizacao: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  },
)

// Índices para melhorar a performance das consultas
LivroSchema.index({ usuarioId: 1 })
LivroSchema.index({ titulo: "text", autor: "text" })

class Livro extends mongoose.Model {
  constructor() {
    super()
    this.estado = new EstadoNaoIniciado()
  }

  setEstado(estado) {
    this.estado = estado
  }

  atualizar() {
    this.estado.atualizar(this)
  }
}

LivroSchema.loadClass(Livro)
const LivroModel = mongoose.model("Livro", LivroSchema)

module.exports = LivroModel

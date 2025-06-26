const mongoose = require("mongoose")

const ProgressoLeituraSchema = new mongoose.Schema(
  {
    livroId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Livro",
      required: [true, "O ID do livro é obrigatório"],
    },
    usuarioId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "O ID do usuário é obrigatório"],
    },
    paginaAtual: {
      type: Number,
      required: [true, "A página atual é obrigatória"],
      min: [0, "A página atual não pode ser negativa"],
    },
    totalPaginas: {
      type: Number,
      required: [true, "O total de páginas é obrigatório"],
      min: [1, "O livro deve ter pelo menos uma página"],
    },
    comentario: {
      type: String,
      trim: true,
      maxlength: [500, "O comentário não pode ter mais de 500 caracteres"],
    },
    dataAtualizacao: {
      type: Date,
      default: Date.now,
    },
    percentualConcluido: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    statusLeitura: {
      type: String,
      enum: ['quero_ler', 'em_leitura', 'concluido'],
      default: 'quero_ler',
    },
  },
  {
    timestamps: true,
  },
)

// Middleware para calcular o percentual concluído antes de salvar
ProgressoLeituraSchema.pre("save", function (next) {
  if (this.paginaAtual && this.totalPaginas) {
    this.percentualConcluido = Math.min(Math.round((this.paginaAtual / this.totalPaginas) * 100), 100)
  }
  next()
})

// Índices para melhorar a performance das consultas
ProgressoLeituraSchema.index({ livroId: 1, usuarioId: 1 }, { unique: true })
ProgressoLeituraSchema.index({ usuarioId: 1 })

module.exports = mongoose.model("ProgressoLeitura", ProgressoLeituraSchema)

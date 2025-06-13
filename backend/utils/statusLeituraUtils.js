exports.atualizarStatusLeitura = (paginaAtual, totalPaginas) => {
  if (paginaAtual === 0) return "Não iniciado"
  if (paginaAtual >= totalPaginas) return "Concluído"
  return "Em andamento"
}

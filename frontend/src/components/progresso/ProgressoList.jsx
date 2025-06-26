"use client"

import { useState, useEffect } from "react"
import { Link, useLocation } from "react-router-dom"
import axios from "axios"
import StatusLivro from '../StatusLivro'

const ProgressoList = () => {
  const [progressos, setProgressos] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [estatisticas, setEstatisticas] = useState({
    totalLivros: 0,
    statusLeitura: {
      naoIniciado: 0,
      emAndamento: 0,
      concluido: 0,
      abandonado: 0,
    },
    totalPaginasLidas: 0,
  })
  const [medias, setMedias] = useState({})

  const location = useLocation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const token = localStorage.getItem("token")

        // Buscar todos os progressos
        const progressosResponse = await axios.get("http://localhost:5000/api/progresso", {
          headers: { Authorization: `Bearer ${token}` },
        })

        // Buscar estatísticas
        const estatisticasResponse = await axios.get("http://localhost:5000/api/progresso/estatisticas", {
          headers: { Authorization: `Bearer ${token}` },
        })

        setProgressos(progressosResponse.data)
        setEstatisticas(estatisticasResponse.data)

        // Buscar médias de avaliação
        const mediasObj = {};
        await Promise.all(progressosResponse.data.map(async (p) => {
          const res = await axios.get(
            `http://localhost:5000/api/progresso/media/${p.livroId._id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          mediasObj[p.livroId._id] = res.data.media;
        }));
        setMedias(mediasObj);

        setIsLoading(false)
      } catch (error) {
        setError("Erro ao carregar dados")
        setIsLoading(false)
        console.error("Erro ao buscar dados:", error)
      }
    }

    fetchData()
  }, [location])

  // Ordenar progressos por percentual concluído (decrescente)
  const progressosOrdenados = [...progressos].sort((a, b) => b.percentualConcluido - a.percentualConcluido)

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">Meu Progresso de Leitura</h2>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500">Total de Livros</h3>
          <p className="text-2xl font-bold">{estatisticas.totalLivros}</p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500">Em Andamento</h3>
          <p className="text-2xl font-bold text-blue-600">{estatisticas.statusLeitura.emAndamento}</p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500">Concluídos</h3>
          <p className="text-2xl font-bold text-green-600">{estatisticas.statusLeitura.concluido}</p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500">Páginas Lidas</h3>
          <p className="text-2xl font-bold text-purple-600">{estatisticas.totalPaginasLidas}</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : progressos.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500 text-lg">Nenhum progresso de leitura registrado.</p>
          <p className="text-gray-500 mb-4">Adicione livros e atualize seu progresso para acompanhar sua leitura.</p>
          <Link
            to="/livros"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Ver Meus Livros
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold mb-4">Livros em Andamento</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {progressosOrdenados.map((progresso) => (
              <div key={progresso._id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                <div className="p-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mr-4 flex items-center justify-center w-16 h-20 bg-gray-200 rounded">
                      {progresso.livroId.capa ? (
                        <img
                          src={`http://localhost:5000${progresso.livroId.capa}`}
                          alt={`Capa de ${progresso.livroId.titulo}`}
                          className="w-16 h-20 object-cover rounded"
                        />
                      ) : (
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <rect x="3" y="4" width="18" height="16" rx="2" ry="2" stroke="currentColor" fill="none" />
                          <circle cx="8.5" cy="9.5" r="1.5" />
                          <path d="M21 15l-5-5L5 21" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-lg mb-1">{progresso.livroId.titulo}</h4>
                      <p className="text-gray-600 text-sm mb-2">{progresso.livroId.autor}</p>

                      <div className="mt-2">
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>Progresso: {progresso.percentualConcluido}%</span>
                          <span>
                            {progresso.paginaAtual} de {progresso.totalPaginas} páginas
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div
                            className="bg-blue-600 h-2.5 rounded-full"
                            style={{ width: `${progresso.percentualConcluido}%` }}
                          ></div>
                        </div>
                      </div>

                      {progresso._id && (
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs font-medium">Status:</span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              progresso.livroId.status === "quero_ler"
                                ? "bg-gray-200 text-gray-800"
                                : progresso.livroId.status === "em_leitura"
                                ? "bg-blue-200 text-blue-800"
                                : "bg-green-200 text-green-800"
                            }`}
                          >
                            {progresso.livroId.status === "quero_ler"
                              ? "Quero Ler"
                              : progresso.livroId.status === "em_leitura"
                              ? "Lendo"
                              : "Lido"}
                          </span>
                        </div>
                      )}

                      {medias[progresso.livroId._id] && (
                        <div className="mt-2 text-xs text-yellow-700">
                          Média de avaliações: <span className="font-bold">{Number(medias[progresso.livroId._id]).toFixed(2)}</span>
                        </div>
                      )}

                      {progresso.livroId.status === 'concluido' && (
                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-xs">Sua nota:</span>
                          <select
                            value={progresso.avaliacao || ''}
                            onChange={async (e) => {
                              const nota = Number(e.target.value);
                              if (nota >= 1 && nota <= 5) {
                                try {
                                  const token = localStorage.getItem('token');
                                  await axios.put(`http://localhost:5000/api/progresso/avaliacao/${progresso.livroId._id}`, { avaliacao: nota }, {
                                    headers: { Authorization: `Bearer ${token}` },
                                  });
                                  setProgressos((prev) => prev.map((p) => p._id === progresso._id ? { ...p, avaliacao: nota } : p));
                                } catch (err) {
                                  alert('Erro ao salvar nota!');
                                }
                              }
                            }}
                            className="text-xs px-2 py-1 rounded border border-gray-300"
                          >
                            <option value="">Selecione</option>
                            {[1,2,3,4,5].map((n) => (
                              <option key={n} value={n}>{n}</option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  </div>

                  {progresso.comentario && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-md text-sm text-gray-700">
                      <p className="font-medium text-xs text-gray-500 mb-1">Anotações:</p>
                      <p>{progresso.comentario}</p>
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-200 bg-gray-50 px-4 py-3 flex justify-between">
                  <span className="text-xs text-gray-500">
                    Última atualização: {new Date(progresso.dataAtualizacao).toLocaleDateString()}
                  </span>
                  <Link
                    to={`/progresso/${progresso.livroId._id}`}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Atualizar
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default ProgressoList

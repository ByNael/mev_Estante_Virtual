"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import axios from "axios"

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
        setIsLoading(false)
      } catch (error) {
        setError("Erro ao carregar dados")
        setIsLoading(false)
        console.error("Erro ao buscar dados:", error)
      }
    }

    fetchData()
  }, [])

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
                    <div className="flex-shrink-0 mr-4">
                      <img
                        src={progresso.livroId.capa || "https://via.placeholder.com/100?text=Sem+Capa"}
                        alt={`Capa de ${progresso.livroId.titulo}`}
                        className="w-16 h-20 object-cover rounded"
                        onError={(e) => {
                          e.target.onerror = null
                          e.target.src = "https://via.placeholder.com/100?text=Sem+Capa"
                        }}
                      />
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

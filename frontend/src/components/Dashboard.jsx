"use client"

import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import axios from "axios"
import StatusLivro from "./StatusLivro"

function Dashboard() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
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
  const [livrosRecentes, setLivrosRecentes] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token")

      if (!token) {
        navigate("/login")
        return
      }

      try {
        // Buscar dados do usuário
        const userResponse = await axios.get("http://localhost:5000/api/user/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        setUser(userResponse.data)

        // Buscar estatísticas
        const estatisticasResponse = await axios.get("http://localhost:5000/api/progresso/estatisticas", {
          headers: { Authorization: `Bearer ${token}` },
        })

        setEstatisticas(estatisticasResponse.data)

        // Buscar livros recentes
        const livrosResponse = await axios.get("http://localhost:5000/api/livros", {
          headers: { Authorization: `Bearer ${token}` },
        })

        // Pegar apenas os 3 livros mais recentes
        setLivrosRecentes(livrosResponse.data.slice(0, 3))
      } catch (error) {
        console.error("Erro ao buscar dados:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl">Carregando...</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Olá, {user?.name}!</h1>
        <p className="mt-1 text-gray-600">Bem-vindo à sua Estante Virtual. Acompanhe seu progresso de leitura.</p>
      </div>

      {/* Estatísticas */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Resumo da Sua Leitura</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500">Total de Livros</h3>
            <p className="text-3xl font-bold">{estatisticas.totalLivros}</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500">Em Andamento</h3>
            <p className="text-3xl font-bold text-blue-600">{estatisticas.statusLeitura.emAndamento}</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500">Concluídos</h3>
            <p className="text-3xl font-bold text-green-600">{estatisticas.statusLeitura.concluido}</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500">Páginas Lidas</h3>
            <p className="text-3xl font-bold text-purple-600">{estatisticas.totalPaginasLidas}</p>
          </div>
        </div>
      </div>

      {/* Livros Recentes */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Livros Recentes</h2>
          <Link to="/livros" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            Ver todos
          </Link>
        </div>

        {livrosRecentes.length === 0 ? (
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 text-center">
            <p className="text-gray-500">Você ainda não adicionou nenhum livro.</p>
            <Link
              to="/livros/novo"
              className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Adicionar Livro
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {livrosRecentes.map((livro) => (
              <div key={livro._id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                <div className="flex h-40">
                  <div className="w-1/3 bg-gray-200 flex items-center justify-center h-full">
                    {livro.capa ? (
                      <img
                        src={`http://localhost:5000${livro.capa}`}
                        alt={`Capa de ${livro.titulo}`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <rect x="3" y="4" width="18" height="16" rx="2" ry="2" stroke="currentColor" fill="none" />
                        <circle cx="8.5" cy="9.5" r="1.5" />
                        <path d="M21 15l-5-5L5 21" />
                      </svg>
                    )}
                  </div>
                  <div className="w-2/3 p-4">
                    <h3 className="font-bold text-lg mb-1 truncate" title={livro.titulo}>
                      {livro.titulo}
                    </h3>
                    <p className="text-gray-600 text-sm mb-2" title={livro.autor}>
                      {livro.autor}
                    </p>
                    <p className="text-gray-500 text-xs mb-2">
                      {livro.genero} • {livro.anoPublicacao}
                    </p>
                    <StatusLivro livro={livro} onStatusChange={() => {}} />
                  </div>
                </div>
                <div className="border-t border-gray-200 bg-gray-50 px-4 py-3 flex justify-between">
                  <Link
                    to={`/progresso/${livro._id}`}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Atualizar Progresso
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Links Rápidos */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Ações Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            to="/livros/novo"
            className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:border-blue-500 transition-colors"
          >
            <h3 className="font-bold text-lg mb-2">Adicionar Novo Livro</h3>
            <p className="text-gray-600">Cadastre um novo livro na sua estante virtual.</p>
          </Link>

          <Link
            to="/progresso"
            className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:border-blue-500 transition-colors"
          >
            <h3 className="font-bold text-lg mb-2">Ver Progresso de Leitura</h3>
            <p className="text-gray-600">Acompanhe seu progresso em todos os livros.</p>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Dashboard

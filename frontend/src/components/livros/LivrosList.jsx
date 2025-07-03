"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import axios from "axios"
import StatusLivro from '../StatusLivro'

const LivrosList = () => {
  const [livros, setLivros] = useState([])
  const [livrosFiltrados, setLivrosFiltrados] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [filtroStatus, setFiltroStatus] = useState("todos") // "todos", "quero_ler", "em_leitura", "concluido"
  const navigate = useNavigate()

  useEffect(() => {
    fetchLivros()
  }, [])

  useEffect(() => {
    aplicarFiltros()
  }, [livros, searchTerm, filtroStatus])

  const aplicarFiltros = () => {
    let filtrados = [...livros]

    // Filtro por busca (título ou autor)
    if (searchTerm.trim()) {
      filtrados = filtrados.filter(livro =>
        livro.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        livro.autor.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filtro por status
    if (filtroStatus !== "todos") {
      filtrados = filtrados.filter(livro => livro.status === filtroStatus)
    }

    setLivrosFiltrados(filtrados)
  }

  const fetchLivros = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem("token")

      if (!token) {
        navigate("/login")
        return
      }

      const response = await axios.get("http://localhost:5000/api/livros", {
        headers: { Authorization: `Bearer ${token}` },
      })

      setLivros(response.data)
      setIsLoading(false)
    } catch (error) {
      setError("Erro ao carregar livros")
      setIsLoading(false)
      console.error("Erro ao buscar livros:", error)

      // Se o token for inválido, redirecionar para login
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem("token")
        navigate("/login")
      }
    }
  }

  const handleSearch = () => {
    // A busca agora é feita automaticamente pelo useEffect
    // Esta função pode ser removida ou mantida para compatibilidade
  }

  const handleDelete = async (id) => {
    if (window.confirm("Tem certeza que deseja excluir este livro?")) {
      try {
        const token = localStorage.getItem("token")

        await axios.delete(`http://localhost:5000/api/livros/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        // Atualizar a lista após exclusão
        setLivros(livros.filter((livro) => livro._id !== id))
      } catch (error) {
        setError("Erro ao excluir livro")
        console.error("Erro ao excluir:", error)
      }
    }
  }

  const handleStatusChange = (livroAtualizado) => {
    setLivros((prevLivros) => prevLivros.map((l) => l._id === livroAtualizado.livro._id ? { ...l, ...livroAtualizado.livro } : l));
  };

  const getStatusCount = (status) => {
    return livros.filter(livro => livro.status === status).length
  }

  const getStatusButtonClass = (status) => {
    const baseClass = "px-4 py-2 rounded-md text-sm font-medium transition-colors"
    const isActive = filtroStatus === status
    
    if (isActive) {
      switch (status) {
        case "todos":
          return `${baseClass} bg-gray-600 text-white`
        case "quero_ler":
          return `${baseClass} bg-gray-500 text-white`
        case "em_leitura":
          return `${baseClass} bg-blue-500 text-white`
        case "concluido":
          return `${baseClass} bg-green-500 text-white`
        default:
          return `${baseClass} bg-gray-600 text-white`
      }
    } else {
      return `${baseClass} bg-gray-200 text-gray-700 hover:bg-gray-300`
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Meus Livros</h2>
        <Link
          to="/livros/novo"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Adicionar Livro
        </Link>
      </div>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      {/* Barra de busca */}
      <div className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por título ou autor..."
            className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Filtros por status */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFiltroStatus("todos")}
            className={getStatusButtonClass("todos")}
          >
            Todos ({livros.length})
          </button>
          <button
            onClick={() => setFiltroStatus("quero_ler")}
            className={getStatusButtonClass("quero_ler")}
          >
            Quero Ler ({getStatusCount("quero_ler")})
          </button>
          <button
            onClick={() => setFiltroStatus("em_leitura")}
            className={getStatusButtonClass("em_leitura")}
          >
            Lendo ({getStatusCount("em_leitura")})
          </button>
          <button
            onClick={() => setFiltroStatus("concluido")}
            className={getStatusButtonClass("concluido")}
          >
            Lido ({getStatusCount("concluido")})
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : livrosFiltrados.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500 text-lg">
            {searchTerm || filtroStatus !== "todos" 
              ? "Nenhum livro encontrado com os filtros aplicados." 
              : "Nenhum livro encontrado."
            }
          </p>
          <p className="text-gray-500">
            {searchTerm || filtroStatus !== "todos" 
              ? "Tente ajustar os filtros ou adicione um novo livro." 
              : "Adicione seu primeiro livro clicando no botão acima."
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {livrosFiltrados.map((livro) => (
            <div key={livro._id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
              <div className="flex h-40">
                <div className="w-1/3 bg-gray-200 flex items-center justify-center h-full">
                  {livro.capa ? (
                    <img
                      src={livro.capa ? `http://localhost:5000${livro.capa}` : undefined}
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
                  <StatusLivro livro={livro} onStatusChange={handleStatusChange} />
                </div>
              </div>
              <div className="border-t border-gray-200 bg-gray-50 px-4 py-3 flex justify-between">
                <Link to={`/progresso/${livro._id}`} className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  Atualizar Progresso
                </Link>
                <div className="flex space-x-2">
                  <Link to={`/livros/editar/${livro._id}`} className="text-gray-600 hover:text-gray-800">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </Link>
                  <button onClick={() => handleDelete(livro._id)} className="text-red-600 hover:text-red-800">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default LivrosList

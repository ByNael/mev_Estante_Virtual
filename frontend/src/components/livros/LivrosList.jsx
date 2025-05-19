"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import axios from "axios"

const LivrosList = () => {
  const [livros, setLivros] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    fetchLivros()
  }, [])

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

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      fetchLivros()
      return
    }

    try {
      setIsLoading(true)
      const token = localStorage.getItem("token")

      const response = await axios.get(`http://localhost:5000/api/livros/busca?termo=${searchTerm}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      setLivros(response.data)
      setIsLoading(false)
    } catch (error) {
      setError("Erro ao buscar livros")
      setIsLoading(false)
      console.error("Erro na busca:", error)
    }
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

  const getStatusColor = (status) => {
    switch (status) {
      case "Não iniciado":
        return "bg-gray-200 text-gray-800"
      case "Em andamento":
        return "bg-blue-200 text-blue-800"
      case "Concluído":
        return "bg-green-200 text-green-800"
      case "Abandonado":
        return "bg-red-200 text-red-800"
      default:
        return "bg-gray-200 text-gray-800"
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

      <div className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por título ou autor..."
            className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
          />
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Buscar
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : livros.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500 text-lg">Nenhum livro encontrado.</p>
          <p className="text-gray-500">Adicione seu primeiro livro clicando no botão acima.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {livros.map((livro) => (
            <div key={livro._id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
              <div className="flex h-40">
                <div className="w-1/3 bg-gray-200">
                  <img
                    src={livro.capa || "https://via.placeholder.com/150?text=Sem+Capa"}
                    alt={`Capa de ${livro.titulo}`}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null
                      e.target.src = "https://via.placeholder.com/150?text=Sem+Capa"
                    }}
                  />
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
                  <span
                    className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusColor(livro.statusLeitura)}`}
                  >
                    {livro.statusLeitura}
                  </span>
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

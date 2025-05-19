"use client"

import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import axios from "axios"

const ProgressoForm = () => {
  const { livroId } = useParams()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [livro, setLivro] = useState(null)
  const [progresso, setProgresso] = useState({
    paginaAtual: 0,
    totalPaginas: 0,
    comentario: "",
    percentualConcluido: 0,
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const token = localStorage.getItem("token")

        if (!token) {
          navigate("/login")
          return
        }

        // Buscar dados do livro
        const livroResponse = await axios.get(`http://localhost:5000/api/livros/${livroId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        setLivro(livroResponse.data)

        // Buscar progresso existente
        try {
          const progressoResponse = await axios.get(`http://localhost:5000/api/progresso/${livroId}`, {
            headers: { Authorization: `Bearer ${token}` },
          })

          setProgresso(progressoResponse.data)
        } catch (err) {
          // Se não existir progresso, criar um objeto vazio
          setProgresso({
            paginaAtual: 0,
            totalPaginas: 100, // Valor padrão
            comentario: "",
            percentualConcluido: 0,
          })
        }

        setIsLoading(false)
      } catch (error) {
        setError("Erro ao carregar dados")
        setIsLoading(false)
        console.error("Erro ao buscar dados:", error)

        // Se o token for inválido, redirecionar para login
        if (error.response?.status === 401 || error.response?.status === 403) {
          localStorage.removeItem("token")
          navigate("/login")
        }
      }
    }

    fetchData()
  }, [livroId, navigate])

  const handleChange = (e) => {
    const { name, value } = e.target

    if (name === "paginaAtual") {
      const paginaAtual = Math.min(Math.max(0, Number(value)), progresso.totalPaginas)
      const percentualConcluido = Math.round((paginaAtual / progresso.totalPaginas) * 100)

      setProgresso((prev) => ({
        ...prev,
        paginaAtual,
        percentualConcluido,
      }))
    } else {
      setProgresso((prev) => ({
        ...prev,
        [name]: name === "totalPaginas" ? Number(value) : value,
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    try {
      setIsLoading(true)
      const token = localStorage.getItem("token")

      await axios.post(
        `http://localhost:5000/api/progresso/${livroId}`,
        {
          paginaAtual: progresso.paginaAtual,
          totalPaginas: progresso.totalPaginas,
          comentario: progresso.comentario,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )

      setIsLoading(false)
      navigate("/livros")
    } catch (error) {
      setError(error.response?.data?.message || "Erro ao salvar progresso")
      setIsLoading(false)
      console.error("Erro ao salvar progresso:", error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!livro) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">Livro não encontrado</div>
        <button
          onClick={() => navigate("/livros")}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Voltar para a lista
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-2">Atualizar Progresso de Leitura</h2>
      <h3 className="text-xl mb-6">
        {livro.titulo} - {livro.autor}
      </h3>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="totalPaginas" className="block text-sm font-medium text-gray-700">
            Total de Páginas
          </label>
          <input
            type="number"
            id="totalPaginas"
            name="totalPaginas"
            value={progresso.totalPaginas}
            onChange={handleChange}
            min="1"
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="paginaAtual" className="block text-sm font-medium text-gray-700">
            Página Atual
          </label>
          <input
            type="number"
            id="paginaAtual"
            name="paginaAtual"
            value={progresso.paginaAtual}
            onChange={handleChange}
            min="0"
            max={progresso.totalPaginas}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

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

        <div>
          <label htmlFor="comentario" className="block text-sm font-medium text-gray-700">
            Comentário / Anotações
          </label>
          <textarea
            id="comentario"
            name="comentario"
            value={progresso.comentario}
            onChange={handleChange}
            rows="4"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          ></textarea>
        </div>

        <div className="flex justify-between pt-4">
          <button
            type="button"
            onClick={() => navigate("/livros")}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isLoading ? "Salvando..." : "Salvar Progresso"}
          </button>
        </div>
      </form>
    </div>
  )
}

export default ProgressoForm

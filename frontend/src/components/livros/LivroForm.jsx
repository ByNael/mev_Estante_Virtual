"use client"

import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import axios from "axios"

const LivroForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [livro, setLivro] = useState({
    titulo: "",
    autor: "",
    genero: "",
    anoPublicacao: new Date().getFullYear(),
    statusLeitura: "Não iniciado",
    descricao: "",
    capa: "",
    totalPaginas: 0,
  })

  // Buscar dados do livro se for edição
  useEffect(() => {
    if (id) {
      const fetchLivro = async () => {
        try {
          setIsLoading(true)
          const token = localStorage.getItem("token")
          const response = await axios.get(`http://localhost:5000/api/livros/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          })

          // Buscar também o progresso para obter o total de páginas
          const progressoResponse = await axios.get(`http://localhost:5000/api/progresso/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          })

          setLivro({
            ...response.data,
            totalPaginas: progressoResponse.data.totalPaginas || 0,
          })
          setIsLoading(false)
        } catch (error) {
          setError("Erro ao carregar dados do livro")
          setIsLoading(false)
          console.error("Erro ao buscar livro:", error)
        }
      }

      fetchLivro()
    }
  }, [id])

  const handleChange = (e) => {
    const { name, value } = e.target
    setLivro((prevState) => ({
      ...prevState,
      [name]: name === "anoPublicacao" || name === "totalPaginas" ? Number(value) : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    try {
      setIsLoading(true)
      const token = localStorage.getItem("token")

      if (id) {
        // Atualizar livro existente
        await axios.put(`http://localhost:5000/api/livros/${id}`, livro, {
          headers: { Authorization: `Bearer ${token}` },
        })

        // Atualizar progresso se o total de páginas foi fornecido
        if (livro.totalPaginas > 0) {
          const progressoResponse = await axios.get(`http://localhost:5000/api/progresso/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          })

          await axios.post(
            `http://localhost:5000/api/progresso/${id}`,
            {
              paginaAtual: progressoResponse.data.paginaAtual || 0,
              totalPaginas: livro.totalPaginas,
              comentario: progressoResponse.data.comentario || "",
            },
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          )
        }
      } else {
        // Criar novo livro
        await axios.post("http://localhost:5000/api/livros", livro, {
          headers: { Authorization: `Bearer ${token}` },
        })
      }

      setIsLoading(false)
      navigate("/livros")
    } catch (error) {
      setError(error.response?.data?.message || "Erro ao salvar livro")
      setIsLoading(false)
      console.error("Erro ao salvar livro:", error)
    }
  }

  if (isLoading && id) {
    return <div className="flex justify-center items-center h-64">Carregando...</div>
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">{id ? "Editar Livro" : "Adicionar Novo Livro"}</h2>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="titulo" className="block text-sm font-medium text-gray-700">
            Título*
          </label>
          <input
            type="text"
            id="titulo"
            name="titulo"
            value={livro.titulo}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="autor" className="block text-sm font-medium text-gray-700">
            Autor*
          </label>
          <input
            type="text"
            id="autor"
            name="autor"
            value={livro.autor}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="genero" className="block text-sm font-medium text-gray-700">
            Gênero*
          </label>
          <input
            type="text"
            id="genero"
            name="genero"
            value={livro.genero}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="anoPublicacao" className="block text-sm font-medium text-gray-700">
              Ano de Publicação*
            </label>
            <input
              type="number"
              id="anoPublicacao"
              name="anoPublicacao"
              value={livro.anoPublicacao}
              onChange={handleChange}
              required
              min="1000"
              max={new Date().getFullYear()}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="totalPaginas" className="block text-sm font-medium text-gray-700">
              Total de Páginas*
            </label>
            <input
              type="number"
              id="totalPaginas"
              name="totalPaginas"
              value={livro.totalPaginas}
              onChange={handleChange}
              required
              min="1"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div>
          <label htmlFor="statusLeitura" className="block text-sm font-medium text-gray-700">
            Status de Leitura*
          </label>
          <select
            id="statusLeitura"
            name="statusLeitura"
            value={livro.statusLeitura}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="Não iniciado">Não iniciado</option>
            <option value="Em andamento">Em andamento</option>
            <option value="Concluído">Concluído</option>
            <option value="Abandonado">Abandonado</option>
          </select>
        </div>

        <div>
          <label htmlFor="descricao" className="block text-sm font-medium text-gray-700">
            Descrição
          </label>
          <textarea
            id="descricao"
            name="descricao"
            value={livro.descricao}
            onChange={handleChange}
            rows="3"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          ></textarea>
        </div>

        <div>
          <label htmlFor="capa" className="block text-sm font-medium text-gray-700">
            URL da Capa
          </label>
          <input
            type="url"
            id="capa"
            name="capa"
            value={livro.capa}
            onChange={handleChange}
            placeholder="https://exemplo.com/capa.jpg"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          {livro.capa && (
            <div className="mt-2">
              <img
                src={livro.capa || "/placeholder.svg"}
                alt="Capa do livro"
                className="h-32 object-cover rounded"
                onError={(e) => {
                  e.target.onerror = null
                  e.target.src = "https://via.placeholder.com/150?text=Sem+Capa"
                }}
              />
            </div>
          )}
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
            {isLoading ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </form>
    </div>
  )
}

export default LivroForm

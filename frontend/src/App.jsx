"use client"

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { useState, useEffect } from "react"
import Login from "./components/Login"
import Register from "./components/Register"
import Dashboard from "./components/Dashboard"
import LivrosList from "./components/livros/LivrosList"
import LivroForm from "./components/livros/LivroForm"
import ProgressoForm from "./components/progresso/ProgressoForm"
import ProgressoList from "./components/progresso/ProgressoList"
import Navbar from "./components/Navbar"

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Verificar se o usuário está autenticado ao carregar a página
    const token = localStorage.getItem("token")
    if (token) {
      setIsAuthenticated(true)
    }
  }, [])

  // Componente para rotas protegidas
  const ProtectedRoute = ({ children }) => {
    if (!isAuthenticated) {
      return <Navigate to="/login" />
    }
    return children
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        {isAuthenticated && <Navbar setIsAuthenticated={setIsAuthenticated} />}
        <div className={`${isAuthenticated ? "pt-16" : ""}`}>
          <Routes>
            <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
            <Route path="/register" element={<Register />} />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard setIsAuthenticated={setIsAuthenticated} />
                </ProtectedRoute>
              }
            />

            <Route
              path="/livros"
              element={
                <ProtectedRoute>
                  <LivrosList />
                </ProtectedRoute>
              }
            />

            <Route
              path="/livros/novo"
              element={
                <ProtectedRoute>
                  <LivroForm />
                </ProtectedRoute>
              }
            />

            <Route
              path="/livros/editar/:id"
              element={
                <ProtectedRoute>
                  <LivroForm />
                </ProtectedRoute>
              }
            />

            <Route
              path="/progresso"
              element={
                <ProtectedRoute>
                  <ProgressoList />
                </ProtectedRoute>
              }
            />

            <Route
              path="/progresso/:livroId"
              element={
                <ProtectedRoute>
                  <ProgressoForm />
                </ProtectedRoute>
              }
            />

            <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
          </Routes>
        </div>
      </div>
    </Router>
  )
}

export default App

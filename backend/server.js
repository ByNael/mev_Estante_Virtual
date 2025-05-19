const express = require("express")
const cors = require("cors")
const mongoose = require("mongoose")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
require("dotenv").config()

// Importar modelos
const User = require("./models/User")
const Livro = require("./models/Livro")
const ProgressoLeitura = require("./models/ProgressoLeitura")

// Importar rotas
const livroRoutes = require("./routes/livroRoutes")
const progressoRoutes = require("./routes/progressoRoutes")

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json())

// Conexão com MongoDB
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/mev_db", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Conectado ao MongoDB"))
  .catch((err) => console.error("Erro ao conectar ao MongoDB:", err))

// Middleware para verificar JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1]

  if (!token) {
    return res.status(401).json({ message: "Token de autenticação não fornecido" })
  }

  jwt.verify(token, process.env.JWT_SECRET || "sua_chave_secreta", (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Token inválido ou expirado" })
    }
    req.user = user
    next()
  })
}

// Rotas de autenticação
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body

    // Verificar se o email já está em uso
    const userExists = await User.findOne({ email })
    if (userExists) {
      return res.status(400).json({ message: "Este email já está em uso" })
    }

    // Hash da senha
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Criar novo usuário
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    })

    await newUser.save()

    res.status(201).json({
      message: "Usuário registrado com sucesso",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      },
    })
  } catch (error) {
    console.error("Erro ao registrar usuário:", error)
    res.status(500).json({ message: "Erro ao registrar usuário" })
  }
})

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body

    // Buscar usuário pelo email
    const user = await User.findOne({ email })

    if (!user) {
      return res.status(401).json({ message: "Email ou senha incorretos" })
    }

    // Verificar senha
    const validPassword = await bcrypt.compare(password, user.password)
    if (!validPassword) {
      return res.status(401).json({ message: "Email ou senha incorretos" })
    }

    // Gerar token JWT
    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET || "sua_chave_secreta", {
      expiresIn: "1h",
    })

    res.json({
      message: "Login realizado com sucesso",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    })
  } catch (error) {
    console.error("Erro ao fazer login:", error)
    res.status(500).json({ message: "Erro ao fazer login" })
  }
})

// Rota protegida para obter perfil do usuário
app.get("/api/user/profile", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password")

    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" })
    }

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
    })
  } catch (error) {
    console.error("Erro ao buscar perfil do usuário:", error)
    res.status(500).json({ message: "Erro ao buscar perfil do usuário" })
  }
})

// Usar rotas de livros e progresso
app.use("/api/livros", livroRoutes)
app.use("/api/progresso", progressoRoutes)

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`)
})

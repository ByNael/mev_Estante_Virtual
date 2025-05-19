const jwt = require("jsonwebtoken")
const User = require("../models/User")

// Middleware para verificar JWT
exports.authenticateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1]

  if (!token) {
    return res.status(401).json({ message: "Token de autenticação não fornecido" })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "sua_chave_secreta")

    // Verificar se o usuário existe
    const user = await User.findById(decoded.id).select("-password")

    if (!user) {
      return res.status(401).json({ message: "Usuário não encontrado" })
    }

    req.user = user
    next()
  } catch (error) {
    console.error("Erro na autenticação:", error)
    return res.status(403).json({ message: "Token inválido ou expirado" })
  }
}

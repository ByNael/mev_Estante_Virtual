const express = require("express")
const router = express.Router()
const livroController = require("../controllers/livroController")
const { authenticateToken } = require("../middleware/authMiddleware")

// Aplicar middleware de autenticação em todas as rotas
router.use(authenticateToken)

// Rotas para livros
router.get("/", livroController.getLivros)
router.get("/busca", livroController.buscarLivros)
router.get("/:id", livroController.getLivro)
router.post("/", livroController.criarLivro)
router.put("/:id", livroController.atualizarLivro)
router.delete("/:id", livroController.excluirLivro)
router.patch("/:id/status", livroController.atualizarStatus)

module.exports = router

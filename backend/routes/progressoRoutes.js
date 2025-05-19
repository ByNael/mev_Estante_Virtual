const express = require("express")
const router = express.Router()
const progressoController = require("../controllers/progressoController")
const { authenticateToken } = require("../middleware/authMiddleware")

// Aplicar middleware de autenticação em todas as rotas
router.use(authenticateToken)

// Rotas para progresso de leitura
router.get("/", progressoController.getProgressos)
router.get("/estatisticas", progressoController.getEstatisticas)
router.get("/:livroId", progressoController.getProgressoLivro)
router.post("/:livroId", progressoController.atualizarProgresso)
router.delete("/:livroId", progressoController.excluirProgresso)

module.exports = router

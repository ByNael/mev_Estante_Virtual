const express = require("express")
const router = express.Router()
const livroController = require("../controllers/livroController")
const { authenticateToken } = require("../middleware/authMiddleware")
const multer = require('multer');
const path = require('path');

// Aplicar middleware de autenticação em todas as rotas
router.use(authenticateToken)

// Configuração do multer para upload de imagens
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/capas/');
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${file.fieldname}${ext}`);
  }
});
const upload = multer({ storage });

// Rotas para livros
router.get("/", livroController.getLivros)
router.get("/busca", livroController.buscarLivros)
router.get("/:id", livroController.getLivro)
router.post("/", livroController.criarLivro)
router.put("/:id", livroController.atualizarLivro)
router.delete("/:id", livroController.excluirLivro)
router.patch('/:id/status', livroController.atualizarStatus)
router.post('/:id/capa', upload.single('capa'), livroController.uploadCapa)

module.exports = router

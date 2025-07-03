const express = require('express');
const router = express.Router();
const { processarMensagem } = require('../services/chatbotService');

// POST /chatbot
router.post('/', async (req, res) => {
  const { mensagem, contexto } = req.body;
  if (!mensagem) {
    return res.status(400).json({ erro: 'Mensagem não informada.' });
  }
  try {
    const resposta = await processarMensagem(mensagem, contexto);
    res.json(resposta);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao processar mensagem.' });
  }
});

module.exports = router; 
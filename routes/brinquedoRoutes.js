const express = require('express')
const router = express.Router()
const { listarDisponiveis, listarTodos, criar, atualizar, deletar } = require('../controllers/brinquedoController')
const { verificarToken, verificarAdmin } = require('../middleware/auth')
const upload = require('../config/upload')

// Cliente autenticado vê o catálogo
router.get('/', verificarToken, listarDisponiveis)

// Rotas exclusivas do admin
router.get('/todos', verificarToken, verificarAdmin, listarTodos)
router.post('/', verificarToken, verificarAdmin, upload.single('imagem'), criar)
router.put('/:id', verificarToken, verificarAdmin, upload.single('imagem'), atualizar)
router.delete('/:id', verificarToken, verificarAdmin, deletar)

module.exports = router
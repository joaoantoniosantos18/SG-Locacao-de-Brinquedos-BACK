const express = require('express')
const router = express.Router()
const { listar, criar, alternarAtivo, atualizar } = require('../controllers/funcionarioController')
const { verificarToken, verificarAdmin } = require('../middleware/auth')

router.get('/', verificarToken, verificarAdmin, listar)
router.post('/', verificarToken, verificarAdmin, criar)
router.patch('/:id/ativo', verificarToken, verificarAdmin, alternarAtivo)
router.put('/:id', verificarToken, verificarAdmin, atualizar)

module.exports = router
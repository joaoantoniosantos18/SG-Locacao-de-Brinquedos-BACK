const express = require('express')
const router = express.Router()
const {
  criarAgendamento,
  meusAgendamentos,
  listarTodos,
  atualizarStatus,
  meusEventos
} = require('../controllers/agendamentoController')
const { verificarToken, verificarAdmin, verificarCliente, verificarFuncionario } = require('../middleware/auth')

// ATENÇÃO: rotas específicas SEMPRE antes de rotas com parâmetro (:id)
router.get('/meus', verificarToken, verificarCliente, meusAgendamentos)
router.get('/meus-eventos', verificarToken, verificarFuncionario, meusEventos)
router.get('/', verificarToken, verificarAdmin, listarTodos)
router.post('/', verificarToken, verificarCliente, criarAgendamento)
router.put('/:id/status', verificarToken, verificarAdmin, atualizarStatus)

module.exports = router
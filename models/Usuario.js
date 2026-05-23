const mongoose = require('mongoose')

const usuarioSchema = new mongoose.Schema({
  // Nome completo do usuário
  nome: {
    type: String,
    required: true,
    trim: true // Remove espaços extras no início e fim
  },

  email: {
    type: String,
    required: true,
    unique: true, // Não permite dois usuários com o mesmo email
    lowercase: true, // Salva sempre em minúsculo para evitar duplicatas
    trim: true
  },

  senha: {
    type: String,
    required: true
  },

  // Define o que o usuário pode fazer no sistema
  role: {
    type: String,
    enum: ['admin', 'cliente', 'funcionario'], // Só aceita esses três valores
    default: 'cliente' // Se não informar, assume cliente
  },

  telefone: {
    type: String,
    trim: true
  },

  // Ativo/inativo — para desativar um funcionário sem deletar do banco
  ativo: {
    type: Boolean,
    default: true
  }

}, { timestamps: true })

module.exports = mongoose.model('Usuario', usuarioSchema)
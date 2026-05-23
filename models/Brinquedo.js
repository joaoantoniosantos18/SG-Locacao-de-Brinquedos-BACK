const mongoose = require('mongoose')

const brinquedoSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: true,
    trim: true
  },

  descricao: {
    type: String,
    trim: true
  },

  // Preço fixo por evento — não muda independente de nada
  preco: {
    type: Number,
    required: true,
    min: 0 // Não aceita preço negativo
  },

  // Quantas unidades físicas a empresa possui deste brinquedo
  // Ex: a empresa tem 10 pula-pulas — este campo vale 10
  quantidadeTotal: {
    type: Number,
    required: true,
    min: 1
  },

  // Se false, não aparece no catálogo e não pode ser agendado
  disponivel: {
    type: Boolean,
    default: true
  },

  // Caminho da imagem salva pelo multer
  imagem: {
    type: String
  }

}, { timestamps: true })

module.exports = mongoose.model('Brinquedo', brinquedoSchema)
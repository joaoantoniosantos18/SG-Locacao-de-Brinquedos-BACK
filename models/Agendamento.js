const mongoose = require('mongoose')

const agendamentoSchema = new mongoose.Schema({
  // Referência ao usuário cliente que fez o agendamento
  cliente: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },

  // Data do evento — guardamos só a data, o horário fica em horaInicio
  dataEvento: {
    type: Date,
    required: true
  },

  // Hora de início no formato "HH:MM" — ex: "14:00"
  // O sistema considera automaticamente que o evento termina 3 horas depois
  horaInicio: {
    type: String,
    required: true
  },

  // Endereço completo onde o evento vai acontecer
  localEvento: {
    type: String,
    required: true,
    trim: true
  },

  // Lista de brinquedos solicitados com a quantidade de cada um
  // É um array porque um evento pode ter vários brinquedos diferentes
  itens: [
    {
      brinquedo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Brinquedo',
        required: true
      },
      quantidade: {
        type: Number,
        required: true,
        min: 1
      }
    }
  ],

  // Calculado automaticamente no backend: soma de (preco * quantidade) de cada item
  valorTotal: {
    type: Number,
    required: true,
    min: 0
  },

  // Ciclo de vida do agendamento
  status: {
    type: String,
    enum: ['pendente', 'confirmado', 'recusado'],
    default: 'pendente'
  },

  // Equipe escalada pelo admin — só preenchido quando o admin confirmar o evento
  // Cada entrada guarda o funcionário e quanto ele vai receber neste evento específico
  equipe: [
    {
      funcionario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario'
      },
      remuneracao: {
        type: Number,
        min: 0
      }
    }
  ],

  // Campo livre para o admin deixar observações internas
  observacoes: {
    type: String,
    trim: true
  }

}, { timestamps: true })

module.exports = mongoose.model('Agendamento', agendamentoSchema)
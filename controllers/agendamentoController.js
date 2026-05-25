const Agendamento = require('../models/Agendamento')
const Brinquedo = require('../models/Brinquedo')

// Função auxiliar que calcula a hora de término somando 3 horas à hora de início
// Recebe "14:00" e retorna "17:00"
const calcularHoraFim = (horaInicio) => {
  const [horas, minutos] = horaInicio.split(':').map(Number)
  const horaFim = (horas + 3) % 24
  return `${String(horaFim).padStart(2, '0')}:${String(minutos).padStart(2, '0')}`
}

// Função que verifica se dois intervalos de tempo se sobrepõem
// Retorna true se houver conflito
const temConflito = (inicio1, fim1, inicio2, fim2) => {
  return inicio1 < fim2 && fim1 > inicio2
}

// Verifica disponibilidade de todos os brinquedos para uma data/hora
// Retorna null se tudo ok, ou uma mensagem de erro se houver conflito
const verificarDisponibilidade = async (dataEvento, horaInicio, itens, agendamentoIdIgnorar = null) => {
  const horaFim = calcularHoraFim(horaInicio)

  // Busca todos os agendamentos não recusados nessa mesma data
  const query = {
    dataEvento: dataEvento,
    status: { $in: ['pendente', 'confirmado'] }
  }

  // Se estiver editando um agendamento existente, ignora ele mesmo na busca
  if (agendamentoIdIgnorar) {
    query._id = { $ne: agendamentoIdIgnorar }
  }

  const agendamentosNaData = await Agendamento.find(query)

  // Para cada brinquedo solicitado, verifica quantas unidades já estão comprometidas
  for (const itemSolicitado of itens) {
    const brinquedo = await Brinquedo.findById(itemSolicitado.brinquedo)

    if (!brinquedo || !brinquedo.disponivel) {
      return `Brinquedo não encontrado ou indisponível`
    }

    if (itemSolicitado.quantidade > brinquedo.quantidadeTotal) {
      return `Quantidade solicitada de "${brinquedo.nome}" ultrapassa o estoque total`
    }

    // Soma as unidades desse brinquedo já comprometidas em horários conflitantes
    let unidadesComprometidas = 0

    for (const agendamento of agendamentosNaData) {
      const horaFimExistente = calcularHoraFim(agendamento.horaInicio)

      // Verifica se os horários se sobrepõem
      if (temConflito(horaInicio, horaFim, agendamento.horaInicio, horaFimExistente)) {
        // Busca quantas unidades desse brinquedo estão nesse agendamento conflitante
        const itemConflitante = agendamento.itens.find(
          i => i.brinquedo.toString() === itemSolicitado.brinquedo.toString()
        )
        if (itemConflitante) {
          unidadesComprometidas += itemConflitante.quantidade
        }
      }
    }

    // Verifica se ainda há unidades suficientes disponíveis
    const unidadesDisponiveis = brinquedo.quantidadeTotal - unidadesComprometidas
    if (itemSolicitado.quantidade > unidadesDisponiveis) {
      return `"${brinquedo.nome}" não tem unidades suficientes nesse horário. Disponíveis: ${unidadesDisponiveis}`
    }
  }

  return null // null significa que tudo está disponível
}

const criarAgendamento = async (req, res) => {
  try {
    const { dataEvento, horaInicio, localEvento, itens } = req.body

    // Força a data como UTC puro, sem conversão de fuso horário
    const [ano, mes, dia] = dataEvento.split('-').map(Number)
    const data = new Date(Date.UTC(ano, mes - 1, dia))

    // Não permite agendamentos no passado
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)
    if (data < hoje) {
      return res.status(400).json({ mensagem: 'Não é possível agendar para datas passadas' })
    }

    // Verifica disponibilidade antes de criar
    const erroDisponibilidade = await verificarDisponibilidade(data, horaInicio, itens)
    if (erroDisponibilidade) {
      return res.status(400).json({ mensagem: erroDisponibilidade })
    }

    // Calcula o valor total somando preco * quantidade de cada item
    let valorTotal = 0
    for (const item of itens) {
      const brinquedo = await Brinquedo.findById(item.brinquedo)
      valorTotal += brinquedo.preco * item.quantidade
    }

    const agendamento = await Agendamento.create({
      cliente: req.usuario.id,
      dataEvento: data,
      horaInicio,
      localEvento,
      itens,
      valorTotal
    })

    res.status(201).json(agendamento)
  } catch (erro) {
    res.status(500).json({ mensagem: 'Erro ao criar agendamento', erro: erro.message })
  }
}

// Cliente vê seus próprios agendamentos
const meusAgendamentos = async (req, res) => {
  try {
    const agendamentos = await Agendamento.find({ cliente: req.usuario.id })
      .populate('itens.brinquedo', 'nome preco imagem')
      .sort({ dataEvento: -1 })

    res.json(agendamentos)
  } catch (erro) {
    res.status(500).json({ mensagem: 'Erro ao buscar agendamentos', erro: erro.message })
  }
}

// Admin vê todos os agendamentos
const listarTodos = async (req, res) => {
  try {
    const agendamentos = await Agendamento.find()
      .populate('cliente', 'nome email telefone')
      .populate('itens.brinquedo', 'nome preco')
      .populate('equipe.funcionario', 'nome email telefone')
      .sort({ dataEvento: -1 })

    res.json(agendamentos)
  } catch (erro) {
    res.status(500).json({ mensagem: 'Erro ao listar agendamentos', erro: erro.message })
  }
}

// Admin confirma ou recusa + escala equipe com remuneração
const atualizarStatus = async (req, res) => {
  try {
    const { status, equipe, observacoes } = req.body

    const dadosAtualizados = { status }
    if (observacoes) dadosAtualizados.observacoes = observacoes

    // Equipe só é salva quando o admin confirma o evento
    if (status === 'confirmado' && equipe) {
      dadosAtualizados.equipe = equipe
    }

    const agendamento = await Agendamento.findByIdAndUpdate(
      req.params.id,
      dadosAtualizados,
      { new: true }
    )
      .populate('cliente', 'nome email')
      .populate('itens.brinquedo', 'nome preco')
      .populate('equipe.funcionario', 'nome email')

    if (!agendamento) {
      return res.status(404).json({ mensagem: 'Agendamento não encontrado' })
    }

    res.json(agendamento)
  } catch (erro) {
    res.status(500).json({ mensagem: 'Erro ao atualizar agendamento', erro: erro.message })
  }
}

// Funcionário vê os eventos em que foi escalado
const meusEventos = async (req, res) => {
  try {
    const agendamentos = await Agendamento.find({
      'equipe.funcionario': req.usuario.id,
      status: 'confirmado'
    })
      .populate('itens.brinquedo', 'nome')
      .populate('equipe.funcionario', 'nome')
      .sort({ dataEvento: 1 }) // Ordem crescente — próximos eventos primeiro

    res.json(agendamentos)
  } catch (erro) {
    res.status(500).json({ mensagem: 'Erro ao buscar eventos', erro: erro.message })
  }
}

module.exports = { criarAgendamento, meusAgendamentos, listarTodos, atualizarStatus, meusEventos }
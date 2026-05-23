const Brinquedo = require('../models/Brinquedo')

// Lista todos os brinquedos disponíveis — usado no catálogo do cliente
const listarDisponiveis = async (req, res) => {
  try {
    const brinquedos = await Brinquedo.find({ disponivel: true })
    res.json(brinquedos)
  } catch (erro) {
    res.status(500).json({ mensagem: 'Erro ao listar brinquedos', erro: erro.message })
  }
}

// Lista todos os brinquedos (inclusive inativos) — usado no painel do admin
const listarTodos = async (req, res) => {
  try {
    const brinquedos = await Brinquedo.find()
    res.json(brinquedos)
  } catch (erro) {
    res.status(500).json({ mensagem: 'Erro ao listar brinquedos', erro: erro.message })
  }
}

const criar = async (req, res) => {
  try {
    const { nome, descricao, preco, quantidadeTotal } = req.body

    const brinquedo = await Brinquedo.create({
      nome,
      descricao,
      preco,
      quantidadeTotal,
      // Se o multer salvou uma imagem, req.file vai existir com o nome do arquivo
      imagem: req.file ? req.file.filename : null
    })

    res.status(201).json(brinquedo)
  } catch (erro) {
    res.status(500).json({ mensagem: 'Erro ao criar brinquedo', erro: erro.message })
  }
}

const atualizar = async (req, res) => {
  try {
    const { nome, descricao, preco, quantidadeTotal, disponivel } = req.body

    // Monta o objeto de atualização dinamicamente
    const dadosAtualizados = { nome, descricao, preco, quantidadeTotal, disponivel }

    // Só atualiza a imagem se uma nova foi enviada
    if (req.file) {
      dadosAtualizados.imagem = req.file.filename
    }

    const brinquedo = await Brinquedo.findByIdAndUpdate(
      req.params.id,
      dadosAtualizados,
      { new: true } // Retorna o documento já atualizado
    )

    if (!brinquedo) {
      return res.status(404).json({ mensagem: 'Brinquedo não encontrado' })
    }

    res.json(brinquedo)
  } catch (erro) {
    res.status(500).json({ mensagem: 'Erro ao atualizar brinquedo', erro: erro.message })
  }
}

const deletar = async (req, res) => {
  try {
    const brinquedo = await Brinquedo.findByIdAndDelete(req.params.id)

    if (!brinquedo) {
      return res.status(404).json({ mensagem: 'Brinquedo não encontrado' })
    }

    res.json({ mensagem: 'Brinquedo removido com sucesso' })
  } catch (erro) {
    res.status(500).json({ mensagem: 'Erro ao deletar brinquedo', erro: erro.message })
  }
}

module.exports = { listarDisponiveis, listarTodos, criar, atualizar, deletar }
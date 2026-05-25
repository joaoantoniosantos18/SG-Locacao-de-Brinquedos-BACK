const Usuario = require('../models/Usuario')
const bcrypt = require('bcryptjs')

// Admin lista todos os funcionários
const listar = async (req, res) => {
  try {
    const funcionarios = await Usuario.find({ role: 'funcionario' }).select('-senha')
    res.json(funcionarios)
  } catch (erro) {
    res.status(500).json({ mensagem: 'Erro ao listar funcionários', erro: erro.message })
  }
}

// Admin cria funcionário
const criar = async (req, res) => {
  try {
    const { nome, email, senha, telefone } = req.body

    const existe = await Usuario.findOne({ email })
    if (existe) {
      return res.status(400).json({ mensagem: 'Email já cadastrado' })
    }

    const senhaHash = await bcrypt.hash(senha, 10)

    const funcionario = await Usuario.create({
      nome, email, senha: senhaHash, telefone, role: 'funcionario'
    })

    res.status(201).json({
      id: funcionario._id,
      nome: funcionario.nome,
      email: funcionario.email,
      telefone: funcionario.telefone
    })
  } catch (erro) {
    res.status(500).json({ mensagem: 'Erro ao criar funcionário', erro: erro.message })
  }
}

// Admin ativa ou desativa funcionário
const alternarAtivo = async (req, res) => {
  try {
    const funcionario = await Usuario.findById(req.params.id)

    if (!funcionario || funcionario.role !== 'funcionario') {
      return res.status(404).json({ mensagem: 'Funcionário não encontrado' })
    }

    funcionario.ativo = !funcionario.ativo
    await funcionario.save()

    res.json({ mensagem: `Funcionário ${funcionario.ativo ? 'ativado' : 'desativado'}`, ativo: funcionario.ativo })
  } catch (erro) {
    res.status(500).json({ mensagem: 'Erro ao alterar status', erro: erro.message })
  }
}

const atualizar = async (req, res) => {
  try {
    const { nome, email, telefone, senha } = req.body
    const dados = { nome, email, telefone }

    // Só atualiza senha se foi enviada
    if (senha) {
      const bcrypt = require('bcryptjs')
      dados.senha = await bcrypt.hash(senha, 10)
    }

    const funcionario = await Usuario.findByIdAndUpdate(
      req.params.id,
      dados,
      { new: true }
    ).select('-senha')

    if (!funcionario || funcionario.role !== 'funcionario') {
      return res.status(404).json({ mensagem: 'Funcionário não encontrado' })
    }

    res.json(funcionario)
  } catch (erro) {
    res.status(500).json({ mensagem: 'Erro ao atualizar funcionário', erro: erro.message })
  }
}

module.exports = { listar, criar, alternarAtivo, atualizar }

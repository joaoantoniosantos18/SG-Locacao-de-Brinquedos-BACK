const Usuario = require('../models/Usuario')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const cadastrar = async (req, res) => {
  try {
    const { nome, email, senha, telefone, role } = req.body

    // Verifica se já existe usuário com esse email
    const usuarioExistente = await Usuario.findOne({ email })
    if (usuarioExistente) {
      return res.status(400).json({ mensagem: 'Email já cadastrado' })
    }

    // Gera o hash da senha — nunca salvamos a senha pura no banco
    const senhaHash = await bcrypt.hash(senha, 10)

    const novoUsuario = await Usuario.create({
      nome,
      email,
      senha: senhaHash,
      telefone,
      // Se não informar role, o model já define 'cliente' como padrão
      // Mas bloqueamos a criação de admin via API pública
      role: role === 'funcionario' ? 'funcionario' : 'cliente'
    })

    res.status(201).json({
      mensagem: 'Usuário cadastrado com sucesso',
      usuario: {
        id: novoUsuario._id,
        nome: novoUsuario.nome,
        email: novoUsuario.email,
        role: novoUsuario.role
      }
    })
  } catch (erro) {
    res.status(500).json({ mensagem: 'Erro ao cadastrar usuário', erro: erro.message })
  }
}

const login = async (req, res) => {
  try {
    const { email, senha } = req.body

    // Busca o usuário pelo email
    const usuario = await Usuario.findOne({ email })
    if (!usuario) {
      return res.status(401).json({ mensagem: 'Email ou senha incorretos' })
    }

    // Verifica se a conta está ativa
    if (!usuario.ativo) {
      return res.status(403).json({ mensagem: 'Conta desativada. Entre em contato com o administrador' })
    }

    // Compara a senha digitada com o hash salvo no banco
    const senhaCorreta = await bcrypt.compare(senha, usuario.senha)
    if (!senhaCorreta) {
      return res.status(401).json({ mensagem: 'Email ou senha incorretos' })
    }

    // Gera o token JWT com os dados essenciais do usuário
    const token = jwt.sign(
      { id: usuario._id, nome: usuario.nome, email: usuario.email, role: usuario.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({
      token,
      usuario: {
        id: usuario._id,
        nome: usuario.nome,
        email: usuario.email,
        role: usuario.role
      }
    })
  } catch (erro) {
    res.status(500).json({ mensagem: 'Erro ao fazer login', erro: erro.message })
  }
}

module.exports = { cadastrar, login }
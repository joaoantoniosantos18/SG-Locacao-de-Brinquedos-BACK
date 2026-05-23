const jwt = require('jsonwebtoken')

// Verifica se o token JWT é válido
// Esse middleware é usado em todas as rotas protegidas
const verificarToken = (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ mensagem: 'Token não fornecido' })
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.usuario = decoded // Injeta os dados do usuário na requisição
    next()
  } catch (erro) {
    return res.status(401).json({ mensagem: 'Token inválido ou expirado' })
  }
}

// Só deixa passar se for admin
const verificarAdmin = (req, res, next) => {
  if (req.usuario.role !== 'admin') {
    return res.status(403).json({ mensagem: 'Acesso restrito ao administrador' })
  }
  next()
}

// Só deixa passar se for cliente
const verificarCliente = (req, res, next) => {
  if (req.usuario.role !== 'cliente') {
    return res.status(403).json({ mensagem: 'Acesso restrito ao cliente' })
  }
  next()
}

// Só deixa passar se for funcionário
const verificarFuncionario = (req, res, next) => {
  if (req.usuario.role !== 'funcionario') {
    return res.status(403).json({ mensagem: 'Acesso restrito ao funcionário' })
  }
  next()
}

module.exports = { verificarToken, verificarAdmin, verificarCliente, verificarFuncionario }
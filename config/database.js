const mongoose = require('mongoose')
const dns = require('dns')

// Força o Node a usar IPv4 e o DNS do Google
// Necessário porque alguns roteadores domésticos bloqueiam a resolução do MongoDB Atlas
dns.setDefaultResultOrder('ipv4first')
dns.setServers(['8.8.8.8', '8.8.4.4'])

const conectarBancoDeDados = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('✅ MongoDB conectado com sucesso!')
  } catch (erro) {
    console.error('❌ Erro ao conectar:', erro.message)
    process.exit(1)
  }
}

module.exports = conectarBancoDeDados
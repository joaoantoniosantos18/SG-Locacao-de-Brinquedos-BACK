require('dotenv').config()

const express = require('express')
const cors = require('cors')
const conectarBancoDeDados = require('./config/database')

const authRoutes = require('./routes/authRoutes')

const app = express()

conectarBancoDeDados()

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}))

app.use(express.json())

// Serve as imagens uploadadas como arquivos estáticos
app.use('/uploads', express.static('uploads'))

app.use('/api/auth', authRoutes)

app.get('/', (req, res) => {
  res.json({ mensagem: '✅ API do Sistema de Locação funcionando!' })
})

const PORTA = process.env.PORT || 3000

app.listen(PORTA, () => {
  console.log(`🚀 Servidor rodando na porta ${PORTA}`)
})
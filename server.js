// A primeira coisa que o arquivo faz é carregar as variáveis de ambiente do .env
// Isso precisa vir ANTES de qualquer outra coisa, porque o resto do código depende dessas variáveis
require('dotenv').config()

const express = require('express')
const cors = require('cors')
const conectarBancoDeDados = require('./config/database')

// Cria a aplicação Express
const app = express()

// Conecta ao MongoDB antes de qualquer coisa
conectarBancoDeDados()

// Configura o CORS — só aceita requisições da URL do frontend definida no .env
// Em desenvolvimento vai ser http://localhost:5173
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}))

// Permite que o Express leia o corpo das requisições em formato JSON
app.use(express.json())

// Rota de teste para confirmar que o servidor está rodando
app.get('/', (req, res) => {
  res.json({ mensagem: '✅ API do Sistema de Locação funcionando!' })
})

// Define a porta — usa a do .env ou 3000 como padrão
const PORTA = process.env.PORT || 3000

app.listen(PORTA, () => {
  console.log(`🚀 Servidor rodando na porta ${PORTA}`)
})
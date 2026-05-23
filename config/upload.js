const multer = require('multer')
const path = require('path')

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/')
  },
  filename: (req, file, cb) => {
    // Gera nome único usando timestamp para evitar conflito de nomes
    const nomeUnico = Date.now() + path.extname(file.originalname)
    cb(null, nomeUnico)
  }
})

// Aceita apenas imagens
const fileFilter = (req, file, cb) => {
  const tiposPermitidos = /jpeg|jpg|png|webp/
  const valido = tiposPermitidos.test(path.extname(file.originalname).toLowerCase())
  if (valido) {
    cb(null, true)
  } else {
    cb(new Error('Apenas imagens são permitidas'), false)
  }
}

const upload = multer({ storage, fileFilter })

module.exports = upload
const express = require('express')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const secp256k1 = require('secp256k1')
const { Keccak } = require('sha3')

function handleError (req, res, err) {

  console.log(err)

  return res.status(400).json({ error: err.message })
}

const app = express()

app.use(morgan('tiny'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.route('/recover').post(async (req, res) => {
  try {
    const { hash, signature } = req.body

    const signatureBuffer = Buffer.from(signature, 'hex')
    const hashBuffer = Buffer.from(hash, 'hex')

    const publicKey = secp256k1.recover(hashBuffer, signatureBuffer, 0)

    return res.json({
      publicKey: publicKey.toString('hex')
    })
  } catch (err) {
    return handleError(req, res, err)
  }
})

app.route('/verify').post(async (req, res) => {
  try {
    const { data, publicKey, signature } = req.body

    const signatureBuffer = Buffer.from(signature, 'hex')
    const publicKeyBuffer = Buffer.from(publicKey, 'hex')

    const hash = new Keccak(256)

    hash.update(data)

    const valid = secp256k1.verify(hash.digest(), signatureBuffer, publicKeyBuffer)

    return res.json({ valid })
  } catch (err) {
    return handleError(req, res, err)
  }
})

app.get('*', function (req, res) {
  return res.send('Internal Server Error', 502)
})

app.use(function (err, req, res, next) {

  console.log(err)

  res.status(500).json({
    error: err.message
  })
})

const server = app.listen(process.env.API_PORT, async err => {
  if (err) {
    console.log(err)
    process.exit(1)
  }
})

process
  .on('unhandledRejection', (err, p) => {
    console.log(err, p)
  })
  .on('uncaughtException', async err => {
    console.log(err)
    process.exit(1)
  })

module.exports = {
  app,
  server
}

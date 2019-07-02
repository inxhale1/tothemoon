const { describe, it, after } = require('mocha')
const chai = require('chai')
const expect = chai.expect

const chaiHttp = require('chai-http')

const fixture = require('./fixture')

chai.use(chaiHttp)

const { app, server } = require('../main')

after(() => {
  server.close()
})

describe('test', () => {
  it('recover', () => {
    return chai.request(app)
      .post('/recover')
      .send({
        hash: fixture[0].hash,
        signature: fixture[0].signature
      })
      .then(res => {
        expect(res).to.have.status(200)
        expect(res.body).to.be.a('object')
        expect(res.body.publicKey).to.be.a('string')
        expect(res.body.publicKey).to.equal(fixture[0].publicKey)
      })
  })

  it('verify', () => {
    return chai.request(app)
      .post('/verify')
      .send({
        data: fixture[0].message,
        publicKey: fixture[0].publicKey,
        signature: fixture[0].signature
      })
      .then(res => {
        expect(res).to.have.status(200)
        expect(res.body).to.be.a('object')
        expect(res.body.valid).to.be.true
      })
  })

  it('false verify', () => {
    return chai.request(app)
      .post('/verify')
      .send({
        data: fixture[1].message,
        publicKey: fixture[1].publicKey,
        signature: fixture[1].signature
      })
      .then(res => {
        expect(res).to.have.status(400)
        expect(res.body.error).to.be.a('string')
        expect(res.body.error).to.equal('the public key could not be parsed or is invalid')
      })
  })

  it('wrong verify', () => {
    return chai.request(app)
      .post('/verify')
      .send({
        data: fixture[2].message,
        publicKey: fixture[2].publicKey,
        signature: fixture[2].signature
      })
      .then(res => {
        expect(res).to.have.status(200)
        expect(res.body.valid).to.be.false
      })
  })

})

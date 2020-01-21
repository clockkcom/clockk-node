const path = require('path')

// POST /oauth/token?client_id=07557b420f3dc959992821a1a17bc16baeb886e5134f3d925193625665005a5c&client_secret=01f62d57360b7def4ee9b8224d7a16f2a39e10fc474117ef47fae2a388485cdf&grant_type=authorization_code&code=3d2e5b7c3295c18e999421cf791b58b3d2587e8157be35b24ba676957ee71ea9&redirect_uri=https://eric-clockk-xero.ngrok.io/install/clockk

// host: eric-clockk.ngrok.io
// content-length: 0
// connection: close

module.exports = function (req, res) {
  res.statusCode = 200

  res.setHeader('cache-control', 'max-age=0, private, must-revalidate')
  res.setHeader('connection', 'close')
  res.setHeader('content-length', '252')
  res.setHeader('date', 'Wed, 15 Jan 2020 21:19:28 GMT')
  res.setHeader('server', 'Cowboy')
  res.setHeader('x-request-id', 'FeosJ8fxQ2SYbpIAABnB')

  res.setHeader('x-node-vcr-tape', path.basename(__filename, '.js'))

  res.write(Buffer.from(`eyJhY2Nlc3NfdG9rZW4iOiIzNGQ3ZWJhMTg4NjQ2NGQ3NmMwMTQ3OGZkNDJmZjQ5MGI5OGFkZTAzOTA3ZTcyN2ViNjM3MGEwYzU2ZmRiMTZkIiwiY3JlYXRlZF9hdCI6IjIwMjAtMDEtMTVUMjA6MTM6MTQiLCJleHBpcmVzX2luIjo3MjAwLCJyZWZyZXNoX3Rva2VuIjoiN2NmYWIzMjFjNWNhZjU1Njc5MGM0MTQ1NjA3OGU1YTdlMmRlN2U4NGNkODc0Y2UyMmEyNWRiYTA1NGZhMmQ3NiIsInNjb3BlIjoiIiwidG9rZW5fdHlwZSI6ImJlYXJlciJ9`, 'base64'))
  res.end()

  return __filename
}

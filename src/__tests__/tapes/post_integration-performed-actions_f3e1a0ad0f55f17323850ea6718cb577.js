const path = require('path')

// POST /api/v1/2f8bc45f-3018-478b-9219-82f2dee6009c/integration-performed-actions

// authorization: 34d7eba1886464d76c01478fd42ff490b98ade03907e727eb6370a0c56fdb16d
// content-type: application/vnd.api+json
// host: eric-clockk.ngrok.io
// content-length: 235
// connection: close

module.exports = function (req, res) {
  res.statusCode = 201

  res.setHeader('cache-control', 'max-age=0, private, must-revalidate')
  res.setHeader('connection', 'close')
  res.setHeader('content-length', '281')
  res.setHeader('content-type', 'application/vnd.api+json; charset=utf-8')
  res.setHeader('date', 'Tue, 21 Jan 2020 17:06:03 GMT')
  res.setHeader('server', 'Cowboy')
  res.setHeader('x-request-id', 'Fev1zwi5MmjOobMAACyB')

  res.setHeader('x-node-vcr-tape', path.basename(__filename, '.js'))

  res.write(Buffer.from(`eyJkYXRhIjp7ImF0dHJpYnV0ZXMiOnsiYWN0aW9uLWNvZGUiOiJMSU5LX1BST0pFQ1RfVE9fSEFSVkVTVCIsImlkIjoiZWQzYjUyN2QtN2ZkYS00MjYxLTgyZGYtZDE3ZWFhNmNlMzEyIiwibWV0YWRhdGEiOnsibmFtZSI6IlRlc3QgWGVybyBwcm9qZWN0Iiwic3RhdHVzIjoiSU5QUk9HUkVTUyJ9fSwiaWQiOiJlZDNiNTI3ZC03ZmRhLTQyNjEtODJkZi1kMTdlYWE2Y2UzMTIiLCJ0eXBlIjoiaW50ZWdyYXRpb24tcGVyZm9ybWVkLWFjdGlvbiJ9LCJqc29uYXBpIjp7InZlcnNpb24iOiIxLjAifX0=`, 'base64'))
  res.end()

  return __filename
}

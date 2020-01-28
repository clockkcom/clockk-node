const path = require('path');

// GET /oauth/me

// authorization: 34d7eba1886464d76c01478fd42ff490b98ade03907e727eb6370a0c56fdb16d
// host: eric-clockk.ngrok.io
// connection: close

module.exports = function(req, res) {
  res.statusCode = 200;

  res.setHeader('cache-control', 'max-age=0, private, must-revalidate');
  res.setHeader('connection', 'close');
  res.setHeader('content-length', '179');
  res.setHeader('content-type', 'application/vnd.api+json; charset=utf-8');
  res.setHeader('date', 'Thu, 16 Jan 2020 16:29:48 GMT');
  res.setHeader('server', 'Cowboy');
  res.setHeader('x-request-id', 'Fepq7b6S5cHmgEQAAD1B');

  res.setHeader('x-node-vcr-tape', path.basename(__filename, '.js'));

  res.write(
    Buffer.from(
      `eyJkYXRhIjp7ImF0dHJpYnV0ZXMiOnsiaWQiOiIyZjhiYzQ1Zi0zMDE4LTQ3OGItOTIxOS04MmYyZGVlNjAwOWMiLCJuYW1lIjoiQ2xvY2trIERldiJ9LCJpZCI6IjJmOGJjNDVmLTMwMTgtNDc4Yi05MjE5LTgyZjJkZWU2MDA5YyIsInR5cGUiOiJjdXN0b21lciJ9LCJqc29uYXBpIjp7InZlcnNpb24iOiIxLjAifX0=`,
      'base64',
    ),
  );
  res.end();

  return __filename;
};

import { Clockk } from '../index';
const crypto = require('crypto');
const http = require('http');
const nodeVcr = require('node-vcr');
const path = require('path');
const _ = require('lodash');

const proxyTarget = 'https://eric-clockk.ngrok.io';
const dirname = path.join(__dirname, './tapes');
const port = 8888;

const hash = (req: any, body: any) => {
  const action = `${req.method.toLowerCase()}_${_.last(req.url.split('/'))}`;
  const content = body.toString();
  const md5sum = crypto.createHash('md5');

  return `${action}_${md5sum.update(content).digest('hex')}`;
};

const handler = nodeVcr(proxyTarget, {
  dirname,
  hash,
});

describe('With VCR', () => {
  const server = http.createServer(handler);
  const token = {
    access_token: '34d7eba1886464d76c01478fd42ff490b98ade03907e727eb6370a0c56fdb16d',
    created_at: '2020-01-15T20:13:14',
    expires_in: 7200,
    refresh_token: '7cfab321c5caf556790c41456078e5a7e2de7e84cd874ce22a25dba054fa2d76',
    scope: '',
    token_type: 'bearer',
  };

  beforeAll(done => {
    server.listen(port, done);
  });

  afterAll(done => {
    server.close(done);
  });

  let clockk = new Clockk({
    api_url: 'http://localhost:8888',
    customer_id: '2f8bc45f-3018-478b-9219-82f2dee6009c',
    client_id: '07557b420f3dc959992821a1a17bc16baeb886e5134f3d925193625665005a5c',
    client_secret: '01f62d57360b7def4ee9b8224d7a16f2a39e10fc474117ef47fae2a388485cdf',
    redirect_uri: 'https://eric-clockk-xero.ngrok.io/install/clockk',
  });

  test('exchange code for access token', async () => {
    const token = await clockk.exchangeCodeForToken('3d2e5b7c3295c18e999421cf791b58b3d2587e8157be35b24ba676957ee71ea9');

    expect(token.access_token).toBe('34d7eba1886464d76c01478fd42ff490b98ade03907e727eb6370a0c56fdb16d');
  });

  test('get customer object from Clockk', async () => {
    const customer: any = await clockk.getCustomer();

    expect(customer.id).toBe('2f8bc45f-3018-478b-9219-82f2dee6009c');
  });

  test('get projects from Clockk', async () => {
    const projects: any = await clockk.getProjects();

    expect(projects[0].id).toBe('5494472f-f50a-47d3-90cc-5b4cc8ecdb1b');
  });

  test('create integration performed action', async () => {
    const ipa: any = await clockk.createIntegrationPerformedAction(
      'LINK_PROJECT_TO_HARVEST',
      {
        id: '5494472f-f50a-47d3-90cc-5b4cc8ecdb1b',
        color: '#DF3333',
      },
      {
        name: 'Test Xero project',
        status: 'INPROGRESS',
      },
    );

    expect(ipa['action-code']).toBe('LINK_PROJECT_TO_HARVEST');
  });
});

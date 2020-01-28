# clockk-node
Clockk SDK for Node.js

Easily build integrations for [Clockk](https://www.clockk.com)

## Install

`npm install clockk-node --save`

## Quickstart

```javascript
var { Clockk } = require('clockk-node');

// Initialize the Clockk object with your OAuth credentials
let clockk = new Clockk({
  // The api_url is an optional parameter for if you have Clockk API development environment (only available to Clockk devs)
  api_url: process.env.CLOCKK_API,
  client_id: process.env.CLOCKK_CLIENT_ID,
  client_secret: process.env.CLOCKK_CLIENT_SECRET,
  redirect_uri: process.env.CLOCKK_REDIRECT_URI
})

// In your redirect handler, you will want to exchange a code for a token
router.get('/install/clockk', function(req, res, next) {
  let token = await clockk.exchangeCodeForToken(req.query.code);
  
  // get customer data for authenticated user
  let customer = await clockk.getCustomer();
  ...
  // Store this token somewhere for making future requests with this SDK
});
```

## Options for constructor
`client_id` : Required

`client_secret` : Required

`redirect_uri` : Required

`token` : Optional

required for all functions that attempt to access resources from the API. This is automatically set by exchangeCodeForToken(code)

`customer_id` : Optional

required for all functions that attempt to access resources from the API.

Note: This is not required for the `getCustomer()` function, which can be used to get the customer_id for functions which require it.

`api_url` : Optional

Sets the api url that the SDK will use to communicate with

## Refreshing token
`exchangeCodeForToken(code)` initiallizes the token on the clockk object. When you would like to utilize the SDK
with an existing token, you can set that in the constructor, or simply directly update `clockk.options.token`

```javascript
// Get the token from whatever persistent storage mechanism you are using.
const token = getTokenFromStorage();

// Initiallize the Clockk object with the token
let clockk = new Clockk({token: token});

// Also, you can directly update the clockk token on a Clockk object.
clockk.options.token = token;

// Now that a token is set on the Clockk object, you can call the refresh fuction.
let newToken = await clockk.refreshToken();

// And you will probably want to update the persisted token with this new token.
```

const { Client } = require('pg');
const cred = require('./config.js');

const client = new Client ({connectionString: cred.credentials})

client.connect();
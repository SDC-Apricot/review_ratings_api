const { Client } = require('pg');
const cred = require('./config.js');

const client = new Client ({connectionString: cred.credentials})


var connect = async () => {
  await client.connect((err) => {
      if (err) {
          console.log(err);
      } else {
          console.log('connected!');
      }
  });
};
connect();

module.exports.client = client;
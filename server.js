const express = require('express');
const app = express();


app.get('/', (req, res) => {
  console.log('This is just the setup!');
});

const port = 3001;

app.listen(port, () => {
  console.log(`listening on port ${port}...`);
});

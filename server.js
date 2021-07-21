const express = require('express');
const app = express();


app.get('/reviews', (req, res) => {
  console.log('Getting the reviews');
});

app.post('/reviews', (req, res) => {
  console.log('Posting the reviews')
})

const port = 3001;

app.listen(port, () => {
  console.log(`listening on port ${port}...`);
});

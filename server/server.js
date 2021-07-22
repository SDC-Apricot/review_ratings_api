const express = require('express');
const app = express();
const port = 3001;
const router = require('./routes.js')

//routes the requests through server routers
app.use('/', router);

app.listen(port, () => {
  console.log(`listening on port ${port}...`);
});

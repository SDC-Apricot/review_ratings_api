const express = require('express');
const app = express();
const router = require('./routes.js')

app.use(express.urlencoded({extended: true}));

//routes the requests through server routers
app.use('/', router);

const port = 3001;
app.listen(port, () => {
  console.log(`listening on port ${port}...`);
});

module.exports = app;

const express = require('express');
const app = express();

app.get('/foo', (req, res) => {
  res.send('Hello from /foo');
});

app.get('/bar', (req, res) => {
  console.log('received request');
  res.send({ x: '3' });
});

app.use(express.static('public'));
app.listen(3000, () => console.log('Service running on port 3000'));


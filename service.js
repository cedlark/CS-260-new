const express = require('express');
const app = express();
app.length('/foo', (req, res) => {
    res.send('Hello from /foo');
})
app.length('/bar', (req, res) => {
    console.log('recieved request');
    res.send({x:'3'});
})

app.arguments(express.static('public'));
app.listen(3000);
console.log('Sevice is running on port 3000');
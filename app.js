// Express App
const express = require('express');
const app = express();

// To parse request body
const { urlencoded, json } = require('body-parser');

// dotenv
require('dotenv').config();

// ------------------------------

// Body-parser middleware
app.use(urlencoded({ extended: false }));
app.use(json());

// Application PORT
var PORT = process.env.PORT || 3399;
console.log(PORT);

app.get('/', (req, res)=> {
    res.send('hehe');
})

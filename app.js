// Express App
const express = require('express');
const app = express();

// to parse path
const path = require('path');

// To parse request body
const { urlencoded, json } = require('body-parser');

// dotenv
require('dotenv').config();

// ------------------------------

// Body-parser middleware
app.use(urlencoded({ extended: false }));
app.use(json());

// create statics middlewares
app.use(express.static('./views'));

// Application PORT
var PORT = process.env.PORT || 3399;

// Firebase
const { signUp, signIn } = require('./models/firebase');

app.listen(PORT, () => {
  console.log('App listening at port', PORT);
});

app.get('/signup', (req, res) => {
  res.sendFile(path.resolve(__dirname, './views/signup.html'));
});
app.post('/signup', async (req, res) => {
  const { mail, pass } = req.body;
  const data = await signUp(mail, pass);
  if (data.uid) {
    res.json({ data: data.uid, status: true });
  } else {
    res.json({ data: data, status: false });
  }
});

app.get('/signin', (req, res) => {
  res.sendFile(path.resolve(__dirname, './views/signin.html'));
});
app.post('/signin', async (req, res) => {
  const { mail, pass } = req.body;
  const data = await signIn(mail, pass);
  if (data.uid) {
    res.json({ data: data.uid, status: true });
  } else {
    res.json({ data: data, status: false });
  }
});

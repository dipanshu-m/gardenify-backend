// ------IMPORTS-----------

// Express App
const express = require('express');
const app = express();

// to parse path
const path = require('path');

// To parse request body
const { urlencoded, json } = require('body-parser');

// Setup Firebase
const {
  signUp,
  signIn,
  createNewUser,
  getPlant,
} = require('./models/firebase');

// dotenv
require('dotenv').config();

// -----------SERVER------------------

// Application PORT
var PORT = process.env.PORT || 3399;

// server init
app.listen(PORT, () => {
  console.log('App listening at port', PORT);
});

// --------MIDDLEWARES----------------

// Body-parser middleware
app.use(urlencoded({ extended: false }));
app.use(json());

// create statics middlewares
app.use(express.static('./views'));

// ----------REQUESTS-----------------
// signUp
app.post('/signup', (req, res) => {
  const { name, mail, pass, latitude, longitude } = req.body;
  if (
    latitude == null ||
    longitude == null ||
    latitude > 90 ||
    longitude > 180 ||
    latitude < -90 ||
    longitude < -180
  ) {
    res.json({ data: 'invalid-coordinates', success: false });
  } else {
    let uid;
    signUp(mail, pass)
      .then((data) => {
        if (data.uid) {
          uid = data.uid;
        } else {
          throw data;
        }
      })
      .then(async () => {
        createNewUser(uid, latitude, longitude, name)
          .then((data) => {
            res.json(data);
          })
          .catch((err) => {
            console.log(err);
            // TODO: Call firestore db by id and delete it.
            res.json({ err, success: false });
          });
      })
      .catch((err) => {
        // console.log('ERROR IN SIGNUP: ', err);
        res.json({ data: err, success: false });
      });
  }
});

// signIn
app.post('/signin', (req, res) => {
  const { mail, pass } = req.body;
  signIn(mail, pass)
    .then((data) => {
      if (data.uid) {
        res.json({ data: data.uid, success: true });
      } else {
        res.json({ data: data, success: false });
      }
    })
    .catch((err) => {
      console.log('FATAL ERROR: ', err);
      res.json({ data: err, success: false });
    });
});

// get plant
app.get('/plant', async (req, res) => {
  const data = await getPlant();
  res.json(data);
});
app.get('*', (req, res) => {
  res.json({ data: '404' });
});

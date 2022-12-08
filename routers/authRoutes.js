const { Router } = require('express');
const router = Router();

const { signUp, signIn } = require('../controller/authController');
const { createNewUser } = require('../controller/userController');

// signUp
router.post('/signup', (req, res) => {
  const { name, mail, pass, latitude, longitude } = req.body;

  const lat = Number(latitude);
  const lng = Number(longitude);
  if (
    lat == null ||
    lng == null ||
    lat > 90 ||
    lng > 180 ||
    lat < -90 ||
    lng < -180
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
        createNewUser(uid, lat, lng, name)
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
router.post('/signin', (req, res) => {
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

module.exports = router;

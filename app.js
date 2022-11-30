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
  getUserDetails,
  getNearbyPlants,
  createNewPlant,
  getPlantDetails,
  updatePlantCurrentStatus,
  updatePlantImage,
  updatePlantIDisease,
  increasePoints,
  updatePlantArrayOfUser,
  getNearbyUsers,
} = require('./models/firebase');

// dotenv
require('dotenv').config();

// admin ui for socket.io
// const { instrument } = require('@socket.io/admin-ui');

// -----------SERVER------------------

// Application PORT
var PORT = process.env.PORT || 3399;

// server init
const server = app.listen(PORT, () => {
  console.log('App listening at port', PORT);
});

// -----------SOCKET------------------
const io = require('socket.io')(server, {
  cors: {
    origin: '*',
  },
});

// console.log(;
// const customIO = io.of('/sockets/');
io.on('connection', (socket) => {
  // socket listeners

  socket.on('join-room', (id) => {
    socket.join(id);
  });
  // socket emmiters
  // --------MIDDLEWARES----------------

  // for parsing application/json
  app.use(json());
  // // for parsing application/x-www-form-urlencoded
  app.use(urlencoded({ extended: false }));

  // create statics middlewares
  app.use(express.static('./views'));

  // ----------REQUESTS-----------------
  // signUp
  app.post('/signup', (req, res) => {
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
              // Joins room: UserID  which will listen to updates on plants
              socket.join(uid);
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
          // Joins room: UserID which will listen to updates on plants
          socket.join(data.uid);
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

  // USER
  // get user details
  app.get('/user/:id', async (req, res) => {
    const userID = req.params.id;
    const data = await getUserDetails(userID);
    res.json(data);
  });
  // update user points
  app.put('/user/update/points/', async (req, res) => {
    const { userID, increment } = req.body;
    const point = Number(increment);
    if (userID == null || point == null)
      res.json({ data: 'error', success: false });
    else {
      const data = await increasePoints(userID, point);
      res.json(data);
    }
  });

  // PLANT
  // get plant details
  app.get('/plant/:id', async (req, res) => {
    const plantID = req.params.id;
    const data = await getPlantDetails(plantID);
    res.json(data);
  });

  // update plant status
  app.put('/plant/update/status/', async (req, res) => {
    const { plantID, status } = req.body;
    if (plantID == null || status == null)
      res.json({ data: 'error', success: false });
    else {
      const data = await updatePlantCurrentStatus(plantID, status);
      res.json(data);
    }
  });
  // update plant image
  app.put('/plant/update/image/', async (req, res) => {
    const { plantID, image } = req.body;
    if (plantID == null || image == null)
      res.json({ data: 'error', success: false });
    else {
      const data = await updatePlantImage(plantID, image);
      res.json(data);
    }
  });

  // update plant disease
  app.put('/plant/update/disease/', async (req, res) => {
    const { plantID, isDiseased } = req.body;
    const disease = Boolean(isDiseased);
    if (plantID == null || disease == null)
      res.json({ data: 'error', success: false });
    else {
      const data = await updatePlantIDisease(plantID, isDiseased);
      res.json(data);
    }
  });

  // add a new plant
  app.post('/plant', async (req, res) => {
    const { ownerID, latitude, longitude, image, name } = req.body;

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
      createNewPlant(ownerID, lat, lng, image, name)
        .then(async (data) => {
          if (data.data.id) {
            // get nearby users of the plant
            const nearbyUsers = await getNearbyUsers(lat, lng);
            // notify nearby users that a new plant has been added.
            nearbyUsers.map((val) => {
              socket.to(val.id).emit('new-plant', data.data.id);
            });
            const d = await updatePlantArrayOfUser(ownerID, data.data.id);
            res.json(d);
          } else {
            throw data;
          }
        })
        .catch((err) => {
          res.json(err);
        });
    }
  });

  // get plant geolocation vals
  app.get('/plants/latitude=:lat&longitude=:long', async (req, res) => {
    const lat = Number(req.params.lat);
    const lng = Number(req.params.long);
    //   const data = await getUserDetails(userID);
    const data = await getNearbyPlants(lat, lng);
    res.json(data);
  });
});

// ------IMPORTS-----------

// Express App
const express = require('express');
const app = express();

// to parse path
const path = require('path');

// To parse request body
const { urlencoded, json } = require('body-parser');

const socketController = require('./controller/socketController');

// dotenv
require('dotenv').config();

// Routes
const authRoutes = require('./routers/authRoutes');
const userRoutes = require('./routers/userRoutes');
const plantRoutes = require('./routers/plantRoutes');

// -----------SERVER------------------

// Application PORT
var PORT = process.env.PORT || 4000;

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

io.on('connection', (socket) => socketController(socket));

// --------MIDDLEWARES----------------

// for parsing application/json
app.use(json());

// // for parsing application/x-www-form-urlencoded
app.use(urlencoded({ extended: false }));

// create statics middlewares
app.use(express.static('./views'));

// ----------REQUESTS-----------------

// Auth
app.use(authRoutes);

app.use('/user', userRoutes);

app.use('/plant', plantRoutes);

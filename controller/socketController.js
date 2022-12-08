// // ------IMPORTS-----------

const { getNearbyUsers } = require('../models/firebaseConfig');

module.exports = (socket) => {
  // socket listeners
  // upon signup/signin, join room to listen to updates on plants
  socket.on('join-room', (id) => {
    socket.join(id);
  });

  // when a new plant is added
  socket.on('new-plant', async (lat, lng) => {
    // fetch nearby users of the plant
    const nearbyUsers = await getNearbyUsers(lat, lng);
    // notify nearby users that a new plant has been added.
    nearbyUsers.map((val) => {
      socket.to(val.id).emit('new-plant', data.data.id);
    });
  });

  // when a plant detail has been updated
  socket.on('update-plant', async (lat, lng) => {
    // fetch nearby users of the plant
    const nearbyUsers = await getNearbyUsers(lat, lng);
    // notify nearby users that a plant detail has been updated.
    nearbyUsers.map((val) => {
      socket.to(val.id).emit('update-plant', data.data.id);
    });
  });
};

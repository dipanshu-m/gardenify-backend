const { Router } = require('express');
const router = Router();

const {
    getUserDetails,
    leaderboards,
    increasePoints,
    updateUserLocation,
  } = require('../controller/userController');
// USER
// get user details
router.get('/:id', async (req, res) => {
  const userID = req.params.id;
  const data = await getUserDetails(userID);
  res.json(data);
});

// get user leaderboards
router.get('/leaderboards', async (req, res) => {
  const data = await leaderboards();
  res.json(data);
});

// update user points
router.put('/update/points', async (req, res) => {
  const { userID, increment } = req.body;
  const point = Number(increment);
  if (userID == null || point == null)
    res.json({ data: 'error', success: false });
  else {
    const data = await increasePoints(userID, point);
    res.json(data);
  }
});
// update user geolocation
router.put('/update/location', async (req, res) => {
  const { userID, latitude, longitude } = req.body;
  const lat = Number(latitude);
  const lng = Number(longitude);
  if (userID == null || lat == null || lng == null)
    res.json({ data: 'invalid-data', success: false });
  else {
    const data = await updateUserLocation(userID, lat, lng);
    res.json(data);
  }
});

module.exports = router;

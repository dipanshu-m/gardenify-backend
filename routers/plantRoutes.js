const { Router } = require('express');
const router = Router();

const { updatePlantArrayOfUser } = require('../controller/userController');
const {
  getPlantDetails,
  updatePlantCurrentStatus,
  updatePlantImage,
  updatePlantIDisease,
  getNearbyPlants,
  createNewPlant,
} = require('../controller/plantController');

// PLANT
// get plant details
router.get('/:id', async (req, res) => {
  const plantID = req.params.id;
  const data = await getPlantDetails(plantID);
  res.json(data);
});

// update plant status
router.put('/update/status/', async (req, res) => {
  const { plantID, status } = req.body;
  if (plantID == null || status == null)
    res.json({ data: 'error', success: false });
  else {
    const data = await updatePlantCurrentStatus(plantID, status);
    res.json(data);
  }
});
// update plant image
router.put('/update/image/', async (req, res) => {
  const { plantID, image } = req.body;
  if (plantID == null || image == null)
    res.json({ data: 'error', success: false });
  else {
    const data = await updatePlantImage(plantID, image);
    res.json(data);
  }
});

// update plant disease
router.put('/update/disease', async (req, res) => {
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
router.post('/', async (req, res) => {
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
router.get('/latitude=:lat&longitude=:long', async (req, res) => {
  const lat = Number(req.params.lat);
  const lng = Number(req.params.long);
  const data = await getNearbyPlants(lat, lng);
  res.json(data);
});

module.exports = router;

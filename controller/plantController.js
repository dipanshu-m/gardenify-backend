const {
  doc,
  setDoc,
  updateDoc,
  getDoc,
  collection,
  orderBy,
  startAt,
  endAt,
  query,
  getDocs,
  addDoc,
} = require('firebase/firestore');

// to geohash for queries
const {
  geohashForLocation,
  geohashQueryBounds,
  distanceBetween,
} = require('geofire-common');
const calculateDateRightNow = require('../models/calculateDateRightNow');
const { db } = require('../models/firebaseConfig');
const { PLANTS_COL } = require('../models/vars');

// COLLECTIONS: PLANTS

// Get Plant Details by ID
module.exports.getPlantDetails = async function (plantID = null) {
  try {
    if (plantID == null) {
      throw { data: 'empty', success: false };
    } else {
      const docRef = doc(db, PLANTS_COL, plantID);
      const docSnap = await getDoc(docRef);
      const data = docSnap.data();
      if (data) return { data: docSnap.data(), success: true };
      else {
        throw 'no-plant-found';
      }
    }
  } catch (error) {
    console.log(error);
    return { data: error, success: false };
  }
};
// create a new plant by ownerID
module.exports.createNewPlant = async function (
  ownerID,
  lat,
  lng,
  imageLink,
  plantName = 'Plant'
) {
  try {
    // compute date
    const date = calculateDateRightNow();
    // creating a new geopoint to set it to latitudes, and longitudes
    // Compute the GeoHash for a lat/lng point
    const hash = geohashForLocation([Number(lat), Number(lng)]);

    // Adding the hash and the lat/lng to the document to use the hash
    // for queries and the lat/lng for distance comparisons.
    const docData = {
      curentStatus: 0,
      isDiseased: false,
      ownerID: ownerID,
      name: plantName,
      accountCreationDate: date,
      image: imageLink,
      lastUpdated: date,
      geohash: hash,
      latitude: Number(lat),
      longitude: Number(lng),
      statusHistory: [0],
      statusHistoryDate: [date],
    };
    const res = await addDoc(collection(db, PLANTS_COL), docData);
    const docRef = doc(db, PLANTS_COL, res.id);
    const docSnap = await getDoc(docRef);
    await setDoc(docRef, {
      ...docSnap.data(),
      plantID: res.id,
    });
    return { data: { id: res.id }, success: true };
  } catch (error) {
    return { data: 'error', success: false };
  }
};

// update plant status
module.exports.updatePlantCurrentStatus = async (plantID, status) => {
  try {
    const docRef = doc(db, PLANTS_COL, plantID);
    const docSnap = await getDoc(docRef);
    status = Number(status);
    const date = calculateDateRightNow();
    if (docSnap.exists()) {
      var updatedStatusHistory = [...docSnap.data().statusHistory, status];
      var updatedStatusHistoryDate = [
        ...docSnap.data().statusHistoryDate,
        date,
      ];
      await updateDoc(docRef, {
        curentStatus: status,
        lastUpdated: date,
        statusHistory: updatedStatusHistory,
        statusHistoryDate: updatedStatusHistoryDate,
      });
      return { data: { id: plantID }, success: true };
    } else {
      throw { data: 'no-such-plant', success: false };
    }
  } catch (error) {
    return error;
  }
};

// update plant image
module.exports.updatePlantImage = async (plantID, imageLink) => {
  try {
    const docRef = doc(db, PLANTS_COL, plantID);
    const docSnap = await getDoc(docRef);
    const date = calculateDateRightNow();
    if (docSnap.exists()) {
      await updateDoc(docRef, { image: imageLink, lastUpdated: date });
      return { data: { id: plantID }, success: true };
    } else {
      throw { data: 'no-such-plant', success: false };
    }
  } catch (error) {
    return error;
  }
};

// update plant disease
module.exports.updatePlantIDisease = async (plantID, isDiseased) => {
  try {
    const docRef = doc(db, PLANTS_COL, plantID);
    const docSnap = await getDoc(docRef);
    isDiseased = Boolean(isDiseased);
    const date = calculateDateRightNow();
    if (docSnap.exists()) {
      await updateDoc(docRef, { isDiseased: isDiseased, lastUpdated: date });
      return { data: { id: plantID }, success: true };
    } else {
      throw { data: 'no-such-plant', success: false };
    }
  } catch (error) {
    return error;
  }
};

// Get Nearby Plants:
module.exports.getNearbyPlants = async (lat, lng, dist = 1) => {
  // Find cities within dist km of [lat, lng]
  const center = [Number(lat), Number(lng)];
  const radiusInM = dist * 1000;

  // Each item in 'bounds' represents a startAt/endAt pair. We have to issue
  // a separate query for each pair. There can be up to 9 pairs of bounds
  // depending on overlap, but in most cases there are 4.
  const bounds = geohashQueryBounds(center, radiusInM);

  const promises = [];
  for (const b of bounds) {
    const q = query(
      collection(db, PLANTS_COL),
      orderBy('geohash'),
      startAt(b[0]),
      endAt(b[1])
    );
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      // doc.data() is never undefined for query doc snapshots
      promises.push(doc.data());
    });
  }

  var finalResult = [];

  // Collect all the query results together into a single list
  await Promise.all(promises)
    .then((snapshots) => {
      const matchingDocs = [];

      for (const snap of snapshots) {
        // We have to filter out a few false positives due to GeoHash
        // accuracy, but most will match
        const lat = Number(snap.latitude);
        const lng = Number(snap.longitude);
        const distanceInKm = distanceBetween([lat, lng], center);
        const distanceInM = distanceInKm * 1000;
        if (distanceInM <= radiusInM) {
          matchingDocs.push(snap);
        }
      }
      return matchingDocs;
    })
    .then((matchingDocs) => {
      // --operations
      finalResult = matchingDocs;
      // return matchingDocs;
    });
  return finalResult;
};

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
} = require('firebase/firestore');

// to geohash for queries
const {
  geohashForLocation,
  geohashQueryBounds,
  distanceBetween,
} = require('geofire-common');
const calculateDateRightNow = require('../models/calculateDateRightNow');

const { db } = require('../models/firebaseConfig');

const { USERS_COL } = require('../models/vars');

// COLLECTIONS: USERS
// get: plants
module.exports.getPlant = async function (userID = null) {
  try {
    if (userID != null) {
      throw { data: 'no id', success: false };
    } else {
      const docRef = doc(db, USERS_COL, userID);
      const docSnap = await getDoc(docRef);
      return docSnap;
    }
  } catch (error) {
    console.log(error);
  }
};
module.exports.getUserDetails = async function (userID = null) {
  try {
    if (userID == null) {
      throw { data: 'empty', success: false };
    } else {
      const docRef = doc(db, USERS_COL, userID);
      const docSnap = await getDoc(docRef);
      const data = docSnap.data();
      if (data) return { data: docSnap.data(), success: true };
      else {
        throw 'no-user-found';
      }
    }
  } catch (error) {
    console.log(error);
    return { data: error, success: false };
  }
};

// GET

// leaderboards
module.exports.leaderboards = async () => {
  const points = [];
  const q = query(collection(db, USERS_COL), orderBy('points'));
  const querySnapshot = await getDocs(q);
  console.log(querySnapshot);
  querySnapshot.forEach((doc) => {
    console.log(doc.data());
    // doc.data() is never undefined for query doc snapshots
    points.push({ name: doc.data().name, points: doc.data().points });
  });
  let ans = points.sort().reverse();
  if (ans.length > 10) {
    ans = ans.slice(0, 10);
  }
  return ans;
};

// Nearby users
module.exports.getNearbyUsers = async (lat, lng, dist = 1) => {
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
      collection(db, USERS_COL),
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
  console.log(finalResult);
  return finalResult;
};

// POST

// new user
module.exports.createNewUser = async function (
  userID,
  lat,
  lng,
  name = 'User'
) {
  try {
    // compute date
    const date = calculateDateRightNow();
    // creating a new geopoint to set it to latitudes, and longitudes
    // Compute the GeoHash for a lat/lng point
    const latitude = Number(lat);
    const longitude = Number(lng);
    const hash = geohashForLocation([latitude, longitude]);

    // Adding the hash and the lat/lng to the document to use the hash
    // for queries and the lat/lng for distance comparisons.
    let docData = {
      id: userID,
      name: name,
      accountCreationDate: date,
      geohash: hash,
      latitude: latitude,
      longitude: longitude,
      points: 0,
      plants: [],
    };
    await setDoc(doc(db, USERS_COL, userID), docData);
    // const newData = { id: userID, docData };
    return { data: docData, success: true };
  } catch (error) {
    return { data: error, success: false };
  }
};

// UPDATE

// location
module.exports.updateUserLocation = async (userID, lat, lng) => {
  try {
    const docRef = doc(db, USERS_COL, userID);
    const docSnap = await getDoc(docRef);
    const hash = geohashForLocation([Number(lat), Number(lng)]);
    if (docSnap.exists()) {
      await updateDoc(docRef, {
        latitude: lat,
        longitude: lng,
        geohash: hash,
      });
      return { data: userID, success: true };
    } else {
      throw { data: 'no-such-user', success: false };
    }
  } catch (error) {
    console.log(error);
    return error;
  }
};

// points
module.exports.increasePoints = async function (userID, point) {
  try {
    const docRef = doc(db, USERS_COL, userID);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      // convert points to number
      const pointNumber = Number(point);
      const updatedPoints = Number(pointNumber + docSnap.data().points);
      await updateDoc(docRef, { points: updatedPoints });
      return { data: userID, success: true };
    } else {
      throw { data: 'no-such-user', success: false };
    }
  } catch (error) {
    return error;
  }
};

// plants array
module.exports.updatePlantArrayOfUser = async function (userID, plantID) {
  try {
    const docRef = doc(db, USERS_COL, userID);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      var updatedList = [...docSnap.data().plants, plantID];
      await updateDoc(docRef, { plants: updatedList });
      return { data: plantID, success: true };
    } else {
      throw { data: 'no-such-user', success: false };
    }
  } catch (error) {
    return error;
  }
};

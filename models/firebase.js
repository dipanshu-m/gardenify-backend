// Import the functions you need from the SDKs you need
const { initializeApp } = require('firebase/app');

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
const {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} = require('firebase/auth');

const {
  getFirestore,
  doc,
  setDoc,
  updateDoc,
  Timestamp,
  getDoc,
  // get,
} = require('firebase/firestore');

// to geohash for queries
const { geohashForLocation } = require('geofire-common');

// variables(stores static values to prevent issues if renamed)
const { USERS_COL, PLANTS_COL } = require('./vars');

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyCBROFj2bMG8Al9Q8C6rFZ07mEvs7DdMfc',
  authDomain: 'gardenify-backend.firebaseapp.com',
  projectId: 'gardenify-backend',
  storageBucket: 'gardenify-backend.appspot.com',
  messagingSenderId: '489389278087',
  appId: '1:489389278087:web:6f285263006c6d2ace0922',
  measurementId: 'G-PZQY5K4MF5',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialise Auth
const auth = getAuth();

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

// -----Member functions-----------
function calculateDateRightNow() {
  // Compute date and split into DD, MM, YYYY
  const d = new Date();
  const month = d.getMonth() + 1; // +1 because JS returns 0-indexed, and firebase returns 1-indexed
  const year = d.getFullYear();
  const day = d.getDate();
  // Format the date data to be parsed by fb and return
  const dateFormatted = Timestamp.fromDate(
    new Date(`${month} ${day}, ${year}`)
  );
  return dateFormatted;
}

// ------AUTH FUNCTIONS------

// signup user
module.exports.signUp = async function (email, password) {
  return await createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Signed in
      const user = userCredential.user;
      // ...
      return user;
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      // ..
      return errorCode;
    });
};

// signin user
module.exports.signIn = async function (email, password) {
  return await signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Signed in
      user = userCredential.user;
      // ...
      return user;
    })
    .catch((error) => {
      errorCode = error.code;
      const errorMessage = error.message;
      // ...
      return errorCode;
    });
};

// COLLECTIONS: USERS

// get: plants
module.exports.getPlant = async function (userID = null) {
  try {
    if (userID != null) {
      throw { data: 'no id', success: false };
    } else {
      const docRef = doc(db, USERS_COL, userID);
      const docSnap = await getDoc(docRef);
      console.log(docSnap.data());
    }
  } catch (error) {
    console.log(error);
  }
};

// create
module.exports.createNewUser = async function (
  userID,
  latitude = 89.5074,
  longitude = 90.5074,
  name = 'User'
) {
  try {
    // compute date
    const date = calculateDateRightNow();

    // creating a new geopoint to set it to latitudes, and longitudes
    // Compute the GeoHash for a lat/lng point
    const lng = Number(longitude);
    const lat = Number(latitude);
    const hash = geohashForLocation([lat, lng]);

    // Adding the hash and the lat/lng to the document to use the hash
    // for queries and the lat/lng for distance comparisons.
    let docData = {
      id: userID,
      name: name,
      accountCreationDate: date,
      geohash: hash,
      lat: lat,
      lng: lng,
      points: 0,
      plants: [],
    };
    const res = await setDoc(doc(db, USERS_COL, userID), docData);
    // const newData = { id: userID, docData };
    return { data: docData, success: true };
  } catch (error) {
    return { data: error, success: false };
  }
};

// // update-plants list
// module.exports.updatePlant = async function (userID) {
//   try {
//     const cityRef = db.collection(USERS_COL).doc(userID);

//     // Set the 'capital' field of the city
//     const res = await cityRef.update({ capital: true });
//   } catch (error) {
//     return error;
//   }
// };

// COLLECTIONS: PLANTS

// create
module.exports.createNewPlant = async function (
  userID = null,
  lat = 51.5074,
  lng = 0.1278,
  plantName = 'Plant'
) {
  try {
    // If userID is not mentioned
    if (lat > 90 || lng > 180 || lat < -90 || lng < -180) {
      throw { data: 'invalid-coordinates' };
    }
    if (userID == null || lat == null || lng == null) {
      throw { data: 'data-not-provided' };
    } else {
      // compute date
      const date = calculateDateRightNow();
      // creating a new geopoint to set it to latitudes, and longitudes
      // Compute the GeoHash for a lat/lng point
      const hash = geohashForLocation([lat, lng]);

      // Adding the hash and the lat/lng to the document to use the hash
      // for queries and the lat/lng for distance comparisons.
      const docData = {
        curentStatus: 'good',
        isDiseased: false,
        ownerID: userID,
        name: plantName,
        accountCreationDate: date,
        lastUpdated: Timestamp.fromDate(new Date(`${month} ${day}, ${year}`)),
        geohash: hash,
        lat: lat,
        lng: lng,
      };
      const res = await db.collection(PLANTS_COL).add(docData);
      return { res, success: true };
    }
  } catch (error) {
    return { data: error, success: false };
  }
};

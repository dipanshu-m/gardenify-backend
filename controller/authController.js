// imports
const { auth } = require('../models/firebaseConfig');
const {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} = require('firebase/auth');

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
      //   const errorMessage = error.message;
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
      //   const errorMessage = error.message;
      // ...
      return errorCode;
    });
};

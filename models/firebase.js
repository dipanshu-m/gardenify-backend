// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

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
const analytics = getAnalytics(app);

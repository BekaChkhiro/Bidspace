// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDyrQwCo_U2l70hvJvj_1pyK4t3Eqxb41Y",
  authDomain: "bidspace-cc967.firebaseapp.com",
  projectId: "bidspace-cc967",
  storageBucket: "bidspace-cc967.firebasestorage.app",
  messagingSenderId: "1054946622736",
  appId: "1:1054946622736:web:e65c407f068fdb91607995",
  measurementId: "G-FWG21ZQ9RC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
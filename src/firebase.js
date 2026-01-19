// // Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
// // TODO: Add SDKs for Firebase products that you want to use
// // https://firebase.google.com/docs/web/setup#available-libraries

// // Your web app's Firebase configuration
// // For Firebase JS SDK v7.20.0 and later, measurementId is optional
// const firebaseConfig = {
//   apiKey: "AIzaSyBFbwY7zETdKHIU86bPiisOeQv-OghgkHg",
//   authDomain: "invoice-generator-69f6a.firebaseapp.com",
//   projectId: "invoice-generator-69f6a",
//   storageBucket: "invoice-generator-69f6a.firebasestorage.app",
//   messagingSenderId: "720949691225",
//   appId: "1:720949691225:web:3e1b65b367df690ab68248",
//   measurementId: "G-F65B40VNLB"
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);


// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";       // Add this for Login
import { getFirestore } from "firebase/firestore"; // Add this for Database

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBFbwY7zETdKHIU86bPiisOeQv-OghgkHg",
  authDomain: "invoice-generator-69f6a.firebaseapp.com",
  projectId: "invoice-generator-69f6a",
  storageBucket: "invoice-generator-69f6a.firebasestorage.app",
  messagingSenderId: "720949691225",
  appId: "1:720949691225:web:3e1b65b367df690ab68248",
  measurementId: "G-F65B40VNLB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services and Export them
export const auth = getAuth(app);
export const db = getFirestore(app);
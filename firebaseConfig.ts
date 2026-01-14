// firebaseConfig.js
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/storage';


const firebaseConfig = {
    apiKey: "AIzaSyBp4xXM_52Lu4W8NyxTn1aGo9US_JKF4XA",
    authDomain: "bmsdb-b39a2.firebaseapp.com",
    projectId: "bmsdb-b39a2",
    storageBucket: "bmsdb-b39a2.firebasestorage.app",
    messagingSenderId: "58518396073",
    appId: "1:58518396073:web:c42ce146d444ba38f5ddb8",
    measurementId: "G-76HH2H00BN"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);

// Initialize services
const auth = firebase.auth();
const db = firebase.firestore();

// Apply settings to force long polling, which fixes "Backend didn't respond within 10 seconds" errors
// in environments where WebSockets are restricted or unstable.
db.settings({ experimentalForceLongPolling: true });

const storage = firebase.storage();

// Disable persistence temporarily to rule out initialization locks in flaky environments
// db.enablePersistence().catch((err) => {
//     if (err.code == 'failed-precondition') {
//         console.log('Multiple tabs open, persistence can only be enabled in one tab at a time.');
//     } else if (err.code == 'unimplemented') {
//         console.log('The current browser doesn\'t support persistence.');
//     }
// });

export { auth, db, storage, firebase, firebaseConfig };
export default app;
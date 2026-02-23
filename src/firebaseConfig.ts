
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
const storage = firebase.storage();



export { auth, db, storage, firebase, firebaseConfig };
export default app;

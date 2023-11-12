// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDaOYVgfKdCaHOKQTP4imTqp_8Pu9of-o0",
  authDomain: "face-compare-app.firebaseapp.com",
  projectId: "face-compare-app",
  storageBucket: "face-compare-app.appspot.com",
  messagingSenderId: "135835579940",
  appId: "1:135835579940:web:b10e64fcc69e0a994b4ab1",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

export { db, storage };

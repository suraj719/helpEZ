import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBmm1S4Pbpppai7rWuCpF5h0T0rv1phJXg",
  authDomain: "helpez.firebaseapp.com",
  projectId: "helpez",
  storageBucket: "helpez.appspot.com",
  messagingSenderId: "43832184547",
  appId: "1:43832184547:web:82090a664e7d4e47acffd6"
};

const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
const storage = getStorage(app);

export { app, firestore,storage };

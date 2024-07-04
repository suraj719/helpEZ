import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB8AeV3cpg866uTcWJsKlMDMXmgj7XqHOE",
  authDomain: "rnapp-31ba4.firebaseapp.com",
  projectId: "rnapp-31ba4",
  storageBucket: "rnapp-31ba4.appspot.com",
  messagingSenderId: "533636340743",
  appId: "1:533636340743:web:a0e38fd2f7c78ebdb59ea2",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
export default app;

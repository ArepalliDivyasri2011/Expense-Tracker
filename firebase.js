import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDa7AhYbeVJiRmQ9EzI0sT20MhRAEIGL_E",
  authDomain: "expense-tracker-640a0.firebaseapp.com",
  projectId: "expense-tracker-640a0",
  appId: "1:28746301301:web:58995c090b7db8d4bbdd3c"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export {
  auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
};
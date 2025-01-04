// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAadRo8N9YvV-nW_f0bzN6S7KDHMC9oV2k",
  authDomain: "agora-job-board.firebaseapp.com",
  projectId: "agora-job-board",
  storageBucket: "agora-job-board.firebaseapp.com",
  messagingSenderId: "672034564989",
  appId: "1:672034564989:web:336f20c1f0fb657dbafa14",
  measurementId: "G-2PW1EEEF8B",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app); 
export const db = getFirestore(app);
export default app;

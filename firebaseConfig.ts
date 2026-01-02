import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// =================================================================
// TODO: Replace the following with your app's Firebase project configuration.
// This configuration can be found in your Firebase project settings.
// Visit https://firebase.google.com/docs/web/setup#available-libraries for more info.
// =================================================================
const firebaseConfig = {
  apiKey: "AIzaSyB9xGvu6qiIb1IlpgDiByHv610ol2uqyDI",
  authDomain: "aaadd-b3101.firebaseapp.com",
  projectId: "aaadd-b3101",
  storageBucket: "aaadd-b3101.firebasestorage.app",
  messagingSenderId: "907911646761",
  appId: "1:907911646761:web:2928956930417b0e245638",
  measurementId: "G-QPZY7R3KN0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };

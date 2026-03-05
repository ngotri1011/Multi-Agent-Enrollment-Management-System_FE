import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBaqXywjGI77XP54z4BUhSEtBhBe8ZZA9Y",
  authDomain: "capstone-ddc58.firebaseapp.com",
  projectId: "capstone-ddc58",
  storageBucket: "capstone-ddc58.firebasestorage.app",
  messagingSenderId: "313081942434",
  appId: "1:313081942434:web:9bee2a61b5fe4596d5a2fb",
  measurementId: "G-4ZDHZ51ZFQ"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

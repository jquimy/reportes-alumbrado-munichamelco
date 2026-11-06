import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAenoTLhfaRJ4pAS8ESZF7ImuNgN0MbO0E",
  authDomain: "reportes-alumbrado.firebaseapp.com",
  projectId: "reportes-alumbrado",
  storageBucket: "reportes-alumbrado.firebasestorage.app",
  messagingSenderId: "814651952813",
  appId: "1:814651952813:web:3f78d57785030c40388024",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app); // la base de datos
export const auth = getAuth(app); // el login (lo usaremos en el Paso 6)
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-database.js";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBXG8v7UzzGv_UT7ZaO_RMKbvh17Kmy7lU",
  authDomain: "compyle-f584b.firebaseapp.com",
  databaseURL: "https://compyle-f584b-default-rtdb.firebaseio.com",
  projectId: "compyle-f584b",
  storageBucket: "compyle-f584b.firebasestorage.app",
  messagingSenderId: "530949114306",
  appId: "1:530949114306:web:c475476274050a5d1f6e5b",
  measurementId: "G-KWSR49792B"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Function to save a banned IP
async function banIP(ip) {
    try {
        // Ensure that the IP address is safe to store by replacing '.' with '_'
        const safeIP = ip.replace(/\./g, '_');
        
        await set(ref(database, "bannedIPs/" + safeIP), true);
        console.log(`IP ${ip} has been banned.`);
    } catch (error) {
        console.error("Error banning IP:", error);
    }
}

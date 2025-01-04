import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-database.js";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  databaseURL: "YOUR_DATABASE_URL",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
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

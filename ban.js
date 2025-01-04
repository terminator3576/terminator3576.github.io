// Import and configure Firebase (for ES6+ projects)
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, get, child } from "firebase/database";

// Your Firebase configuration (replace with your own)
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
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
        await set(ref(database, 'bannedIPs/' + ip), true);
        console.log(`IP ${ip} has been banned.`);
    } catch (error) {
        console.error('Error banning IP:', error);
    }
}

// Function to check if an IP is banned
async function isIPBanned(ip) {
    try {
        const dbRef = ref(database);
        const snapshot = await get(child(dbRef, `bannedIPs/${ip}`));
        return snapshot.exists();
    } catch (error) {
        console.error('Error checking IP:', error);
        return false;
    }
}

// Function to get the user's IP address
async function getUserIP() {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip;
    } catch (error) {
        console.error('Error fetching user IP:', error);
        return null;
    }
}

// Example usage
async function checkAndBanIP() {
    const userIP = await getUserIP();

    if (!userIP) {
        console.error("Failed to fetch user IP.");
        return;
    }

    console.log(`User IP: ${userIP}`);

    // Check if the IP is banned
    const banned = await isIPBanned(userIP);
    if (banned) {
        alert("Your IP is banned.");
        // Disable functionality or redirect
        document.getElementById('runButton').disabled = true;
        document.getElementById('output').textContent = 'Your IP is banned.';
    } else {
        console.log("IP is not banned.");
        // Optionally ban the IP
        await banIP(userIP);
    }
}

// Call the function on page load
window.addEventListener('DOMContentLoaded', checkAndBanIP);

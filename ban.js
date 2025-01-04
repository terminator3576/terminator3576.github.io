// Firebase Initialization Using CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getDatabase, ref, set, get, child } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-database.js";

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

// Utility to sanitize IP address for Firebase paths
function sanitizeIP(ip) {
  return ip.replaceAll('.', '_');
}

// Function to save a banned IP
async function banIP(ip) {
  try {
    const sanitizedIP = sanitizeIP(ip);
    const bannedIPsRef = ref(database, `bannedIPs/${sanitizedIP}`);
    await set(bannedIPsRef, { banned: true, timestamp: new Date().toISOString() });
    console.log(`IP ${ip} (sanitized: ${sanitizedIP}) has been banned.`);
  } catch (error) {
    console.error("Error banning IP:", error);
  }
}

// Function to check if an IP is banned
async function isIPBanned(ip) {
  try {
    const sanitizedIP = sanitizeIP(ip);
    const dbRef = ref(database);
    const snapshot = await get(child(dbRef, `bannedIPs/${sanitizedIP}`));
    if (snapshot.exists() && snapshot.val().banned) {
      console.log("IP is banned:", snapshot.val());
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error checking IP:", error);
    return false;
  }
}

// Example usage
async function checkAndBanIP() {
  const userIP = await getUserIP(); // Dynamically fetch user's IP

  // Check if the IP is banned
  const banned = await isIPBanned(userIP);
  if (banned) {
    alert("Your IP is banned.");
    document.getElementById("runButton").disabled = true;
    document.getElementById("output").textContent = "Your IP is banned.";
  } else {
    console.log("IP is not banned.");
    // Ban the IP as an example (remove if unnecessary)
    await banIP(userIP);
  }
}

// Fetch user's IP using an external API
async function getUserIP() {
  try {
    const response = await fetch("https://api.ipify.org?format=json");
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.error("Error fetching IP address:", error);
    return null;
  }
}

// Call the function on page load
window.addEventListener("DOMContentLoaded", checkAndBanIP);

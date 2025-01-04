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

// Function to save a banned IP
async function banIP(ip) {
  try {
    await set(ref(database, "bannedIPs/" + ip), true);
    console.log(`IP ${ip} has been banned.`);
  } catch (error) {
    console.error("Error banning IP:", error);
  }
}

// Function to check if an IP is banned
async function isIPBanned(ip) {
  try {
    const dbRef = ref(database);
    const snapshot = await get(child(dbRef, `bannedIPs/${ip}`));
    return snapshot.exists();
  } catch (error) {
    console.error("Error checking IP:", error);
    return false;
  }
}

// Example usage
async function checkAndBanIP() {
  const userIP = "123.45.67.89"; // Replace with dynamic IP fetching

  // Check if the IP is banned
  const banned = await isIPBanned(userIP);
  if (banned) {
    alert("Your IP is banned.");
    document.getElementById("runButton").disabled = true;
    document.getElementById("output").textContent = "Your IP is banned.";
  } else {
    console.log("IP is not banned.");
    await banIP(userIP);
  }
}

// Call the function on page load
window.addEventListener("DOMContentLoaded", checkAndBanIP);

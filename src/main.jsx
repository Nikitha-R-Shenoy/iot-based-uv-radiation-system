import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles.css';

// --- 1. Import Firebase SDK functions ---
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
// ----------------------------------------


// --- 2. Your Firebase Configuration Object ---
// Use the exact config data you retrieved from the Firebase console
const firebaseConfig = {
    apiKey: "AIzaSyCOGp_Z6UMgsuL5vyNDNe0ZOqxDnCaI2Z4",
    authDomain: "mini-project-754ff.firebaseapp.com",
    databaseURL: "https://mini-project-754ff-default-rtdb.firebaseio.com",
    projectId: "mini-project-754ff",
    storageBucket: "mini-project-754ff.firebasestorage.app",
    messagingSenderId: "311695524219",
    appId: "1:311695524219:web:42bce530aa84b007957dde",
    measurementId: "G-H4XBXW6MF4"
};
// ---------------------------------------------


// --- 3. Initialize Firebase App and Database ---
// This must happen before rendering the root component.
const app = initializeApp(firebaseConfig);
// CRITICAL: Get the database reference handle
const database = getDatabase(app);

// DEBUG: Log Firebase connection details
console.log('🔥 Firebase initialized:', {
    databaseURL: firebaseConfig.databaseURL,
    projectId: firebaseConfig.projectId,
    database: database ? 'Connected' : 'Failed'
}); 
// -----------------------------------------------


// --- 4. Render App and Pass Database ---
// CRITICAL: Pass the 'database' object as a prop to the App component.
createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App database={database} /> 
  </React.StrictMode>
);
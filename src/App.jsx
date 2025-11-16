import React, { useEffect, useState } from 'react';
// Import necessary Firebase functions, including 'query' and 'limitToLast'
import { ref, onValue, query, limitToLast } from 'firebase/database'; 

// Import your custom components
import Header from './components/Header';
import RealtimeChart from './components/RealtimeChart';
import ReadingsTable from './components/ReadingsTable';

// The component receives the 'database' object as a prop from main.js
export default function App({ database }) {
    // State for the dashboard chart/table data
    const [readings, setReadings] = useState([]);
    // State for the critical alert status display
    const [alertStatus, setAlertStatus] = useState("Awaiting Classification...");

    useEffect(() => {
        console.log('🚀 App useEffect triggered, database:', database ? 'Connected' : 'Missing');
        
        if (!database) {
            console.error("❌ Firebase database connection is missing.");
            return; 
        }
        
        console.log('✅ Database connection confirmed');

        // --- 1. Listener for Real-Time Alerts (Status Display) ---
        const alertsQuery = query(
            ref(database, 'classified-alerts'), 
            limitToLast(1)
        );
        
        const unsubscribeAlerts = onValue(alertsQuery, (snapshot) => {
            const alertsList = snapshot.val();
            
            if (alertsList) {
                const latestAlert = Object.values(alertsList)[0];
                
                if (latestAlert && latestAlert.status) {
                    // Normalize status to uppercase for clean display
                    setAlertStatus(latestAlert.status.toUpperCase()); 
                } else {
                    setAlertStatus("Data format error - missing status");
                }
            } else {
                setAlertStatus("No data received yet.");
            }
        }, (error) => {
            console.error("❌ Error reading from classified-alerts:", error);
            setAlertStatus("Connection error - check console");
        });


        // --- 2. Listener for Charts & Tables (Historical Data) ---
        // Data is stored in 'uvData' path in Firebase
        const readingsRef = ref(database, 'uvData'); 
        
        console.log('🔌 Setting up Firebase listener for uvData...');

        const unsubscribeReadings = onValue(readingsRef, (snapshot) => {
            const data = snapshot.val();
            
            if (!data) {
                console.log('📡 No data in Firebase snapshot');
                setReadings([]);
                return;
            }
            
            // Firebase structure: { "-pushId1": {...}, "-pushId2": {...} }
            // Simply get all values - Firebase push IDs as keys
            const readingsArray = Object.values(data);
            
            if (readingsArray.length === 0) {
                console.log('📡 Firebase data is empty object');
                setReadings([]);
                return;
            }
            
            // Map to component format - SIMPLE AND DIRECT
            const mappedReadings = readingsArray.map(item => {
                // Get the actual field names that exist (handle any case)
                const keys = Object.keys(item);
                
                // Find UV field - check lowercase for flexibility
                let uv = null;
                for (const key of keys) {
                    const lower = key.toLowerCase();
                    if (lower.includes('uv_intensity')) {
                        uv = item[key];
                        break;
                    }
                }
                
                // Voltage - exact match
                const voltage = item.voltage || null;
                
                // Timestamp
                const timestamp = item.timestamp || Date.now() / 1000;
                
                return {
                    timestamp,
                    uv_index: uv,
                    voltage
                };
            });
            
            // Reverse to show newest first
            setReadings(mappedReadings.reverse());
            
            console.log('✅ Loaded', mappedReadings.length, 'readings from Firebase');
        }, (error) => {
            console.error("❌ Error reading readings data:", error);
            console.error("❌ Error details:", error.message);
            console.error("❌ Error code:", error.code);
            console.error("❌ Error stack:", error.stack);
            
            // Check for common error types
            if (error.code === 'PERMISSION_DENIED') {
                console.error("🔒 PERMISSION DENIED: Check Firebase Realtime Database rules!");
                console.error("🔒 Make sure rules allow read access to 'uvData' path");
            }
            
            setReadings([]);
        });


        // Cleanup function to detach both listeners when the component unmounts
        return () => {
            unsubscribeAlerts();
            unsubscribeReadings();
        };
    }, [database]); 
    

    return (
        <div className="app">
            <Header />
            <div className="layout">
                <div>
                    <div className="card charts">
                        <RealtimeChart readings={readings} />
                    </div>

                    <div className="card table" style={{ marginTop: 16 }}>
                        <ReadingsTable readings={readings.slice(0, 30)} />
                    </div>
                </div>

                <div>
                    <div className="card" style={{ marginBottom: 12 }}>
                        <h3>Device Info</h3>
                        <p><strong>ID:</strong> device-001</p>
                        <p><strong>Location:</strong> Bangalore (Realtime)</p>
                        <p>
                            <strong>Last update:</strong> 
                            {/* Final date formatting fix */}
                            {readings[0] 
                                ? new Date(readings[0].timestamp * 1000).toLocaleString() 
                                : '—'
                            }
                        </p>
                    </div>

                    <div className="card">
                        <h3>Alerts</h3>
                        <p style={{ fontWeight: 'bold', color: alertStatus === "UNSAFE" ? 'red' : 'green' }}>
                            {alertStatus}
                        </p>
                        <small>Status provided by Edge AI classification.</small>
                    </div>
                </div>
            </div>
        </div>
    );
}

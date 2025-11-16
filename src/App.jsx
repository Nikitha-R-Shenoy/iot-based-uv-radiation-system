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
            console.log('📡 Firebase snapshot received:', data ? 'Data exists' : 'No data');
            
            if (data) {
                const historicalReadings = Object.values(data);
                console.log('📊 Total readings from Firebase:', historicalReadings.length);
                
                // DEBUG: Log raw Firebase data structure (first item only)
                if (historicalReadings.length > 0) {
                    const firstItem = historicalReadings[0];
                    console.log('📊 Raw Firebase data sample:', firstItem);
                    console.log('📊 Raw data keys:', Object.keys(firstItem));
                    console.log('📊 Looking for uv_intensity_mw_cm2:', firstItem.uv_intensity_mw_cm2);
                    console.log('📊 Looking for voltage:', firstItem.voltage);
                    console.log('📊 All field names in Firebase:', Object.keys(firstItem).join(', '));
                }
                
                // Map only the values received from Raspberry Pi: timestamp, uv_intensity_mw_cm2, voltage
                const mappedReadings = historicalReadings.map(item => {
                    // UV Intensity from Raspberry Pi (uv_intensity_mw_cm2)
                    // Check explicitly for existence, not just truthiness (0 is a valid value)
                    const uv = item.uv_intensity_mw_cm2 !== undefined ? item.uv_intensity_mw_cm2 :
                              item.uv !== undefined ? item.uv :
                              item.UV !== undefined ? item.UV :
                              item.uv_index !== undefined ? item.uv_index :
                              null;
                    
                    // Voltage from Raspberry Pi - check explicitly
                    const voltage = item.voltage !== undefined ? item.voltage : null;
                    
                    const mapped = {
                        // Timestamp in seconds (Firebase stores Unix timestamp)
                        timestamp: item.timestamp || Date.now() / 1000,
                        // UV Intensity (mW/cm²) from Raspberry Pi (null if not found)
                        uv_index: uv,
                        // Voltage from Raspberry Pi (null if not found)
                        voltage: voltage
                    };
                    
                    // DEBUG: Log the raw item and what we extracted
                    console.log('🔍 Mapping item:', {
                        raw: item,
                        extracted_uv: uv,
                        extracted_voltage: voltage,
                        mapped: mapped
                    });
                    
                    // DEBUG: Log if required fields are missing
                    if (uv === null || uv === undefined) {
                        console.warn('⚠️ UV intensity missing from Raspberry Pi - field not found in:', Object.keys(item));
                    }
                    if (voltage === null || voltage === undefined) {
                        console.warn('⚠️ Voltage missing from Raspberry Pi - field not found in:', Object.keys(item));
                    }
                    
                    return mapped;
                });
                
                // DEBUG: Log final mapped readings
                console.log('✅ Mapped readings count:', mappedReadings.length);
                if (mappedReadings.length > 0) {
                    console.log('📈 First mapped reading:', mappedReadings[0]);
                }
                
                // Reverse and set the final data
                console.log('💾 Setting readings state with', mappedReadings.length, 'items');
                setReadings(mappedReadings.slice().reverse()); 
            } else {
                console.warn('⚠️ No data received from Firebase - setting empty array');
                setReadings([]);
            }
        }, (error) => {
            console.error("❌ Error reading readings data:", error);
            console.error("❌ Error details:", error.message, error.code);
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

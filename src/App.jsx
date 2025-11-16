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
            console.log('📡 Firebase onValue callback triggered');
            console.log('📡 Snapshot exists:', snapshot.exists());
            console.log('📡 Snapshot key:', snapshot.key);
            
            const data = snapshot.val();
            console.log('📡 Firebase snapshot received:', data ? 'Data exists' : 'No data');
            console.log('📡 Data type:', typeof data);
            console.log('📡 Data value:', data);
            
            if (data && typeof data === 'object') {
                // Handle Firebase Realtime Database structure
                // Firebase stores data as: { "-pushId1": {...}, "-pushId2": {...} }
                // OR as a single object: { timestamp: ..., uv_intensity_mw_cm2: ... }
                
                let historicalReadings = [];
                
                try {
                    // Check if data is an array
                    if (Array.isArray(data)) {
                        historicalReadings = data;
                        console.log('📊 Data is an array');
                    } 
                    // Check if data has keys (object with multiple entries)
                    else if (Object.keys(data).length > 0) {
                        const firstKey = Object.keys(data)[0];
                        const firstValue = data[firstKey];
                        
                        // If first value is an object with timestamp/uv/voltage, it's push IDs
                        if (typeof firstValue === 'object' && firstValue !== null && 
                            ('timestamp' in firstValue || 'uv_intensity_mw_cm2' in firstValue || 'uv_intensity_mW_cm2' in firstValue || 'voltage' in firstValue)) {
                            // Structure: { "-abc123": {...}, "-def456": {...} }
                            historicalReadings = Object.values(data);
                            console.log('📊 Data is object with push IDs, extracted', historicalReadings.length, 'readings');
                        }
                        // If data itself has sensor fields, it's a single reading
                        else if ('timestamp' in data || 'uv_intensity_mw_cm2' in data || 'uv_intensity_mW_cm2' in data || 'voltage' in data) {
                            historicalReadings = [data];
                            console.log('📊 Data is a single reading object');
                        }
                        // Fallback: try Object.values anyway
                        else {
                            historicalReadings = Object.values(data).filter(item => item && typeof item === 'object');
                            console.log('📊 Using fallback: extracted', historicalReadings.length, 'readings from object values');
                        }
                    }
                    
                    console.log('📊 Total readings extracted:', historicalReadings.length);
                    console.log('📊 Data keys:', Object.keys(data).slice(0, 5).join(', '));
                } catch (error) {
                    console.error('❌ Error processing Firebase data structure:', error);
                    console.error('❌ Data:', data);
                    setReadings([]);
                    return;
                }
                
                // Check if we got any readings
                if (historicalReadings.length === 0) {
                    console.warn('⚠️ No readings extracted from Firebase data');
                    console.warn('⚠️ Data structure:', data);
                    console.warn('⚠️ Data keys:', Object.keys(data || {}));
                    setReadings([]);
                    return;
                }
                
                // DEBUG: Log raw Firebase data structure (first item only)
                const firstItem = historicalReadings[0];
                console.log('📊 Raw Firebase data sample:', firstItem);
                console.log('📊 Raw data keys:', Object.keys(firstItem));
                console.log('📊 All field names in Firebase:', Object.keys(firstItem).join(', '));
                
                // Try all variations
                console.log('📊 Checking uv_intensity_mw_cm2:', firstItem.uv_intensity_mw_cm2);
                console.log('📊 Checking uv_intensity_mW_cm2:', firstItem.uv_intensity_mW_cm2);
                console.log('📊 Checking voltage:', firstItem.voltage);
                
                // Map only the values received from Raspberry Pi: timestamp, uv_intensity_mw_cm2, voltage
                // CRITICAL: Check for case variations (uv_intensity_mw_cm2 vs uv_intensity_mW_cm2)
                const mappedReadings = historicalReadings.map((item, index) => {
                    // Get all keys to check for case variations
                    const keys = Object.keys(item);
                    
                    // Find UV field - check actual keys that exist (case-insensitive matching)
                    // Try all possible variations of uv_intensity field names
                    let uv = null;
                    
                    // Check for uv_intensity variations (case-sensitive)
                    for (const key of keys) {
                        const lowerKey = key.toLowerCase();
                        if (lowerKey.includes('uv_intensity') || lowerKey === 'uv' || lowerKey === 'uv_index') {
                            uv = item[key];
                            break; // Found it, stop searching
                        }
                    }
                    
                    // Voltage - straightforward (exact match)
                    const voltage = 'voltage' in item ? item.voltage : null;
                    
                    // Timestamp - handle both Unix timestamp and other formats
                    let timestamp = item.timestamp;
                    if (!timestamp) {
                        timestamp = Date.now() / 1000; // Fallback to current time
                    }
                    
                    const mapped = {
                        timestamp: timestamp,
                        uv_index: uv,
                        voltage: voltage
                    };
                    
                    // Log only first few items and errors to reduce console spam
                    if (index < 3) {
                        console.log(`🔍 Item ${index}:`, {
                            keys: keys,
                            found_uv: uv,
                            found_voltage: voltage,
                            mapped: mapped
                        });
                    }
                    
                    // Warn only if critical fields are missing (for first item only)
                    if (index === 0) {
                        if (uv === null || uv === undefined) {
                            console.error('❌ UV intensity NOT FOUND! Available keys:', keys.join(', '));
                        }
                        if (voltage === null || voltage === undefined) {
                            console.error('❌ Voltage NOT FOUND! Available keys:', keys.join(', '));
                        }
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

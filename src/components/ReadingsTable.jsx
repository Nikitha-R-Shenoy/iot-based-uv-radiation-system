import React from 'react';

export default function ReadingsTable({ readings = [] }) {
  console.log('📋 ReadingsTable received readings:', readings.length, readings);
  
  return (
    <div>
      <h3>Latest readings</h3>
      {readings.length === 0 ? (
        <p>No readings available. Waiting for data from Firebase...</p>
      ) : (
        <table>
          <thead>
            <tr><th>Time</th><th>UV Intensity (mW/cm²)</th><th>Voltage</th></tr>
          </thead>
          <tbody>
            {readings.map(r => {
            // Display only values received from Raspberry Pi
            const uv = (r.uv_index !== undefined && r.uv_index !== null) ? 
                      r.uv_index.toFixed(6) : '-';
            const voltage = (r.voltage !== undefined && r.voltage !== null) ? 
                           r.voltage.toFixed(6) : '-';
            // Handle timestamp in seconds or milliseconds
            const ts = typeof r.timestamp === 'number' ? (r.timestamp > 1e12 ? r.timestamp : r.timestamp * 1000) : r.timestamp;
            return (
              <tr key={r._id ?? r.timestamp}>
                <td>{new Date(ts).toLocaleString()}</td>
                <td>{uv}</td>
                <td>{voltage}</td>
              </tr>
            );
          })}
          </tbody>
        </table>
      )}
    </div>
  );
}

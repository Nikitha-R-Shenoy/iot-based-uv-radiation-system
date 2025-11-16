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
            <tr><th>Time</th><th>Gamma</th><th>UV</th><th>EMF (mT)</th><th>Class</th></tr>
          </thead>
          <tbody>
            {readings.map(r => {
            const gamma = r.gamma_cpm ?? (r.sensors && r.sensors.gamma_cpm) ?? '-';
            const uv = r.uv_index ?? (r.sensors && r.sensors.uv_index) ?? '-';
            const emf = r.emf_mT ?? (r.sensors && r.sensors.emf_mT) ?? '-';
            const cls = r.classification ?? r.status?.toLowerCase() ?? 'unknown';
            // Handle timestamp in seconds or milliseconds
            const ts = typeof r.timestamp === 'number' ? (r.timestamp > 1e12 ? r.timestamp : r.timestamp * 1000) : r.timestamp;
            return (
              <tr key={r._id ?? r.timestamp}>
                <td>{new Date(ts).toLocaleString()}</td>
                <td>{gamma}</td>
                <td>{uv}</td>
                <td>{emf}</td>
                <td>
                  <span className={`badge ${cls === 'unsafe' ? 'unsafe' : 'safe'}`}>{cls}</span>
                </td>
              </tr>
            );
          })}
          </tbody>
        </table>
      )}
    </div>
  );
}

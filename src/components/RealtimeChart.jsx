import React, { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  TimeScale,
  LinearScale,
  PointElement,
  LineElement,
  Legend,
  Tooltip,
  CategoryScale
} from 'chart.js';

ChartJS.register(TimeScale, LinearScale, PointElement, LineElement, Legend, Tooltip, CategoryScale);

export default function RealtimeChart({ readings = [] }) {
  // prepare series (reverse so oldest -> newest)
  const latest = readings.slice(0, 120).reverse();
  // Handle timestamp in seconds or milliseconds
  const labels = latest.map(r => {
    const ts = typeof r.timestamp === 'number' ? (r.timestamp > 1e12 ? r.timestamp : r.timestamp * 1000) : r.timestamp;
    return new Date(ts).toLocaleTimeString();
  });
  // Only show values received from Raspberry Pi: UV and Voltage
  const uv = latest.map(r => r.uv_index || 0);
  const voltage = latest.map(r => r.voltage || 0);

  const data = useMemo(() => ({
    labels,
    datasets: [
      { 
        label: 'UV Intensity (mW/cm²)', 
        data: uv, 
        tension: 0.3, 
        borderWidth: 2, 
        fill: false,
        borderColor: 'rgb(255, 99, 132)'
      },
      { 
        label: 'Voltage', 
        data: voltage, 
        tension: 0.3, 
        borderWidth: 2, 
        fill: false,
        borderColor: 'rgb(54, 162, 235)'
      }
    ]
  }), [labels, uv, voltage]);

  return (
    <div>
      <h3>Realtime</h3>
      <Line data={data} />
    </div>
  );
}

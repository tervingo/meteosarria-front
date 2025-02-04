import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import { BACKEND_URI  }  from './constants';

const PressChart = ({ timeRange }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          BACKEND_URI+'/api/meteo-data',
          {
            params: { timeRange }, // Pass timeRange as a query parameter
          }
        );
        const fetchedData = response.data;

        // Process the data with outlier handling
        let lastValidPressure = null;
        const formattedData = fetchedData.map(entry => {
          const [datePart, timePart] = entry.timestamp.split(' ');
          const [day, month, year] = datePart.split('-');
          const formattedDate = `${year}-${month}-${day}T${timePart}`;
          const dateObj = new Date(formattedDate);

          // Get the current pressure
          let currentPress = Number(entry.pressure);

          // Check if current pressure is valid
          if (currentPress <= 1100) {
            lastValidPressure = currentPress;
          } else {
            // If invalid, use last valid pressure
            currentPress = lastValidPressure !== null ? lastValidPressure : null;
            console.log(`Replaced anomalous pressure (${entry.pressure}) with last valid pressure: ${currentPress}`);
          }

          return {
            fullTimestamp: entry.timestamp,
            dateTime: dateObj,
            pressure: currentPress
          };
        })
        // Filter out any null pressures (in case the first readings were invalid)
        .filter(item => item.pressure !== null);

        // Sort data by dateTime
        const sortedData = formattedData
          .filter(item => !isNaN(item.dateTime))
          .sort((a, b) => a.dateTime - b.dateTime);

        console.log('Final data for chart:', sortedData);
        setData(sortedData);
      } catch (error) {
        console.error('Error fetching pressure data:', error);
      }
    };

    fetchData();
    const intervalId = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, [timeRange]); // Add timeRange to the dependency array

  const chart = useMemo(() => {
    if (data.length === 0) {
      return <div className="text-center p-4">Loading...</div>;
    }

    // Calculate min and max pressures with padding
    const absMinPress = Math.min(...data.map(d => d.pressure));
    const absMaxPress = Math.max(...data.map(d => d.pressure));
    const minPress = Math.floor(absMinPress);
    const maxPress = Math.ceil(absMaxPress);
    const padding = 1; // Padding for pressure

    // Find the timestamps of min and max pressures
    const minPressData = data.find(d => d.pressure === absMinPress);
    const maxPressData = data.find(d => d.pressure === absMaxPress);
    const minPressTime = minPressData ? minPressData.fullTimestamp : 'N/A';
    const maxPressTime = maxPressData ? maxPressData.fullTimestamp : 'N/A';

    return (
      <LineChart
        width={500}
        height={300}
        data={data}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 40
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="fullTimestamp"
          tickFormatter={(timeStr) => {
            const [datePart, timePart] = timeStr.split(' ');
            if (timeRange === '7d') {
              const [day, month] = datePart.split('-');
              return `${day}/${month}`; // Format as DD/MM for 7 days
            } else {
              return timePart; // Format as HH:MM for 24h and 48h
            }
          }}
          angle={-45}
          textAnchor="end"
          height={60}
          interval="preserveStartEnd"
        />
        <YAxis
          domain={[minPress - padding, maxPress + padding]}
          label={{
            value: 'Presión (hPa)',
            angle: -90,
            position: 'insideLeft',
            offset: 10
          }}
        />
        <ReferenceLine y={maxPress} label={{ value: `${absMaxPress} (el ${maxPressTime})`,  fill: 'azure' }} stroke="red" strokeDasharray="1 1" />
        <ReferenceLine y={minPress} label={{ value: `${absMinPress} (el ${minPressTime})`,  fill: 'azure' }} stroke="blue" strokeDasharray="1 1" />
        <Tooltip formatter={(value) => [`${value}hPa`, 'Pressure']} />
        <Legend verticalAlign="top" height={36} />
        <Line
          type="monotone"
          dataKey="pressure"
          stroke="orangered"
          name="Presión"
          dot={false}
          strokeWidth={2}
        />
      </LineChart>
    );
  }, [data, timeRange]); // Add timeRange to the dependency array

  return (
    <div style={{
      width: '500px',
      height: '300px',
      margin: '0 auto'
    }}>
      {chart}
    </div>
  );
};

export default PressChart;
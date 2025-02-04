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

const RadChart = ({ timeRange }) => {
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
        let lastValidRadiation = null;
        const formattedData = fetchedData.map(entry => {
          const [datePart, timePart] = entry.timestamp.split(' ');
          const [day, month, year] = datePart.split('-');
          const formattedDate = `${year}-${month}-${day}T${timePart}`;
          const dateObj = new Date(formattedDate);

          // Get the current radiation
          let currentRad = Number(entry.solar_radiation);

          // Check if current radiation is valid
          if (currentRad <= 2000) {
            lastValidRadiation = currentRad;
          } else {
            // If invalid, use last valid radiation
            currentRad = lastValidRadiation !== null ? lastValidRadiation : null;
            console.log(`Replaced anomalous radiation (${entry.solar_radiation}) with last valid radiation: ${currentRad}`);
          }

          return {
            fullTimestamp: entry.timestamp,
            dateTime: dateObj,
            solar_radiation: currentRad
          };
        })
        // Filter out any null radiations (in case the first readings were invalid)
        .filter(item => item.solar_radiation !== null);

        // Sort data by dateTime
        const sortedData = formattedData
          .filter(item => !isNaN(item.dateTime))
          .sort((a, b) => a.dateTime - b.dateTime);

        console.log('Final data for rad chart:', sortedData);
        setData(sortedData);
      } catch (error) {
        console.error('Error fetching radiation data:', error);
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

    // Calculate min and max radiations with padding
    const absMinRad = Math.min(...data.map(d => d.solar_radiation));
    const absMaxRad = Math.max(...data.map(d => d.solar_radiation));
    const minRad = Math.floor(absMinRad);
    const maxRad = Math.ceil(absMaxRad);
    const padding = 1; // Padding for radiation

    // Find the timestamps of min and max radiations

    const maxRadData = data.find(d => d.solar_radiation === absMaxRad);
    const maxRadTime = maxRadData ? maxRadData.fullTimestamp : 'N/A';

    return (
      <LineChart
        width={500}
        height={300}
        data={data}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 60
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
          domain={[minRad - padding, maxRad + padding]}
          label={{
            value: 'Radiación solar (W/m2)',
            angle: -90,
            position: 'insideLeft',
            offset: 10
          }}
        />
        <ReferenceLine y={maxRad} label={{ value: `${absMaxRad} (el ${maxRadTime})`,  fill: 'azure' }} stroke="red" strokeDasharray="1 1" /> 
        <Tooltip formatter={(value) => [`${value}`, 'Radiation']} />
        <Legend verticalAlign="top" height={36} />
        <Line
          type="monotone"
          dataKey="solar_radiation"
          stroke="gold"
          name="Radiación solar"
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

export default RadChart;
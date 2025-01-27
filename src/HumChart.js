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

const HumChart = ({ timeRange }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          'https://meteosarria-back.onrender.com/api/meteo-data',
          {
            params: { timeRange }, // Pass timeRange as a query parameter
          }
        );
        const fetchedData = response.data;

        // Process the data with outlier handling
        let lastValidHumidity = null;
        const formattedData = fetchedData.map(entry => {
          const [datePart, timePart] = entry.timestamp.split(' ');
          const [day, month, year] = datePart.split('-');
          const formattedDate = `${year}-${month}-${day}T${timePart}`;
          const dateObj = new Date(formattedDate);

          // Get the current humidity
          let currentHum = Number(entry.humidity);

          // Check if current humidity is valid
          if (currentHum < 100) {
            lastValidHumidity = currentHum;
          } else {
            // If invalid, use last valid humidity
            currentHum = lastValidHumidity !== null ? lastValidHumidity : null;
            console.log(`Replaced anomalous humidity (${entry.humidity}) with last valid humidity: ${currentHum}`);
          }

          return {
            fullTimestamp: entry.timestamp,
            dateTime: dateObj,
            humidity: currentHum
          };
        })
        // Filter out any null humidities (in case the first readings were invalid)
        .filter(item => item.humidity !== null);

        // Sort data by dateTime
        const sortedData = formattedData
          .filter(item => !isNaN(item.dateTime))
          .sort((a, b) => a.dateTime - b.dateTime);

        console.log('Final data for chart:', sortedData);
        setData(sortedData);
      } catch (error) {
        console.error('Error fetching humidity data:', error);
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

    // Calculate min and max humidities with padding
    const absMinHum = Math.min(...data.map(d => d.humidity));
    const absMaxHum = Math.max(...data.map(d => d.humidity));
    const minHum = Math.floor(absMinHum);
    const maxHum = Math.ceil(absMaxHum);
    const padding = 10; // Increased padding for humidity

    // Find the timestamps of min and max humidities
    const minHumData = data.find(d => d.humidity === absMinHum);
    const maxHumData = data.find(d => d.humidity === absMaxHum);
    const minHumTime = minHumData ? minHumData.fullTimestamp.split(' ')[1] : 'N/A';
    const maxHumTime = maxHumData ? maxHumData.fullTimestamp.split(' ')[1] : 'N/A';

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
          domain={[minHum - padding, 100]} // Upper limit fixed at 100%
          label={{
            value: 'Humedad (%)',
            angle: -90,
            position: 'insideLeft',
            offset: 10
          }}
        />
        <ReferenceLine y={maxHum} label={`${absMaxHum}% at ${maxHumTime}`} stroke="red" strokeDasharray="1 1" />
        <ReferenceLine y={minHum} label={`${absMinHum}% at ${minHumTime}`} stroke="blue" strokeDasharray="1 1" />
        <Tooltip formatter={(value) => [`${value}%`, 'Humidity']} />
        <Legend verticalAlign="top" height={36} />
        <Line
          type="monotone"
          dataKey="humidity"
          stroke="darkBlue"
          name="Humedad"
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

export default HumChart;
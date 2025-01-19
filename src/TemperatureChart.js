import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const TemperatureChart = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('https://meteosarria-back.onrender.com/api/temperature-data');
        const fetchedData = response.data;
        
        // Convert the timestamp format and ensure temperature is a number
        const formattedData = fetchedData.map(entry => {
          const [datePart, timePart] = entry.timestamp.split(' ');
          return {
            time: timePart, // Keep original time string for X-axis
            external_temperature: Number(entry.external_temperature)
          };
        }).sort((a, b) => {
          // Sort by time string
          return a.time.localeCompare(b.time);
        });

        setData(formattedData);
      } catch (error) {
        console.error('Error fetching temperature data:', error);
      }
    };

    fetchData();
    const intervalId = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, []);

  if (data.length === 0) {
    return <div>Loading...</div>;
  }

  console.log('Sample of data being rendered:', {
    firstPoint: data[0],
    lastPoint: data[data.length - 1],
    numberOfPoints: data.length,
    yRange: {
      min: Math.min(...data.map(d => d.external_temperature)),
      max: Math.max(...data.map(d => d.external_temperature))
    }
  });

  return (
    <div style={{ width: '100%', height: '400px' }}>
      <ResponsiveContainer>
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 25,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="time"
            interval={Math.floor(data.length / 10)} // Show ~10 ticks
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis
            type="number"
            domain={['auto', 'auto']}
            label={{
              value: 'Temperature (°C)',
              angle: -90,
              position: 'insideLeft',
              offset: -5
            }}
          />
          <Tooltip
            formatter={(value) => [`${value}°C`, 'Temperature']}
          />
          <Legend verticalAlign="top" />
          <Line
            type="monotone"
            dataKey="external_temperature"
            name="External Temperature"
            stroke="#8884d8"
            dot={false}
            activeDot={{ r: 6 }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TemperatureChart;
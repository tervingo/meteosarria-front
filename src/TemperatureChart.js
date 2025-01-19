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
        
        console.log('Raw data from API:', fetchedData);

        // Process the data
        const formattedData = fetchedData
          .map(entry => ({
            timestamp: entry.timestamp,
            external_temperature: Number(entry.external_temperature)
          }))
          .sort((a, b) => {
            // Sort by parsing the timestamp strings directly
            const dateA = new Date(a.timestamp.split(' ')[0].split('-').reverse().join('-') + 'T' + a.timestamp.split(' ')[1]);
            const dateB = new Date(b.timestamp.split(' ')[0].split('-').reverse().join('-') + 'T' + b.timestamp.split(' ')[1]);
            return dateA - dateB;
          });

        setData(formattedData);
      } catch (error) {
        console.error('Error fetching temperature data:', error);
      }
    };

    // Fetch data initially
    fetchData();

    // Optional: Set up periodic refresh every 5 minutes
    const intervalId = setInterval(fetchData, 5 * 60 * 1000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []); // Empty dependency array to run only on mount

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart
        data={data}
        margin={{
          top: 5, right: 30, left: 20, bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="timestamp"
          type="category"
          tickFormatter={(value) => {
            const time = value.split(' ')[1];
            return time;
          }}
          interval="preserveStartEnd"
        />
        <YAxis 
          domain={['auto', 'auto']}
          label={{ value: 'Temperature (°C)', angle: -90, position: 'insideLeft' }}
        />
        <Tooltip 
          formatter={(value) => [`${value}°C`, 'Temperature']}
        />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="external_temperature" 
          name="External Temperature"
          stroke="#8884d8" 
          dot={false}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default TemperatureChart;
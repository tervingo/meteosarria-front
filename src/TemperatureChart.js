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

        // Format the data with proper date parsing
        const formattedData = fetchedData.map(entry => {
          // Split the date and time
          const [date, time] = entry.timestamp.split(' ');
          // Split the date components
          const [day, month, year] = date.split('-');
          // Create a proper ISO date string
          const isoDate = `${year}-${month}-${day}T${time}`;
          
          return {
            ...entry,
            timestamp: new Date(isoDate).getTime()
          };
        }).sort((a, b) => a.timestamp - b.timestamp); // Sort by timestamp

        setData(formattedData);
      } catch (error) {
        console.error('Error fetching temperature data:', error);
      }
    };

    fetchData();
  }, []);

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
          type="number"
          scale="time"
          domain={['auto', 'auto']}
          tickFormatter={(unixTime) => {
            const date = new Date(unixTime);
            return date.toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            });
          }}
        />
        <YAxis 
          domain={[-10, 40]} 
          label={{ value: 'Temperature (°C)', angle: -90, position: 'insideLeft' }}
        />
        <Tooltip 
          labelFormatter={(unixTime) => {
            const date = new Date(unixTime);
            return date.toLocaleString([], {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit'
            });
          }}
          formatter={(value) => [`${value}°C`, 'Temperature']}
        />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="external_temperature" 
          name="External Temperature"
          stroke="#8884d8" 
          dot={false} // Remove dots for cleaner look with many data points
          activeDot={{ r: 6 }} 
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default TemperatureChart;
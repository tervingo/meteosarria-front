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

        const formattedData = fetchedData.map(entry => {
          // Split the date and time
          const [date, time] = entry.timestamp.split(' ');
          // Split the date components
          const [day, month, year] = date.split('-');
          // Create a proper ISO date string
          const isoDate = `${year}-${month}-${day}T${time}`;
          
          const formatted = {
            ...entry,
            timestamp: new Date(isoDate).getTime()
          };
          
          console.log('Formatted entry:', {
            original: entry.timestamp,
            isoDate,
            timestamp: formatted.timestamp,
            temp: formatted.external_temperature
          });
          
          return formatted;
        }).sort((a, b) => a.timestamp - b.timestamp);

        console.log('Final formatted data:', formattedData);
        setData(formattedData);
      } catch (error) {
        console.error('Error fetching temperature data:', error);
      }
    };

    fetchData();
  }, []);

  // Let's also log what data is being used for rendering
  console.log('Data being rendered:', data);

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
          domain={['dataMin', 'dataMax']}
          tickFormatter={(unixTime) => {
            const date = new Date(unixTime);
            return date.toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            });
          }}
        />
        <YAxis 
          domain={['dataMin', 'dataMax']} 
          label={{ value: 'Temperature (°C)', angle: -90, position: 'insideLeft' }}
        />
        <Tooltip 
          labelFormatter={(unixTime) => {
            return new Date(unixTime).toLocaleString();
          }}
          formatter={(value) => [`${value}°C`, 'Temperature']}
        />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="external_temperature" 
          name="External Temperature"
          stroke="#8884d8" 
          dot={true}  // Temporarily enable dots for debugging
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default TemperatureChart;
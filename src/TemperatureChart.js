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
          // Convert DD-MM-YYYY HH:mm to YYYY-MM-DD HH:mm for proper date parsing
          const [datePart, timePart] = entry.timestamp.split(' ');
          const [day, month, year] = datePart.split('-');
          return {
            timestamp: new Date(`${year}-${month}-${day} ${timePart}`).getTime(),
            external_temperature: Number(entry.external_temperature)
          };
        });

        // Sort data by timestamp
        const sortedData = formattedData.sort((a, b) => a.timestamp - b.timestamp);
        
        console.log('Data range:', {
          start: new Date(sortedData[0]?.timestamp).toLocaleString(),
          end: new Date(sortedData[sortedData.length - 1]?.timestamp).toLocaleString(),
          tempRange: {
            min: Math.min(...sortedData.map(d => d.external_temperature)),
            max: Math.max(...sortedData.map(d => d.external_temperature))
          }
        });

        console.log('Sorted and formatted data:', sortedData.slice(0, 3)); // Log first 3 entries for debugging
        setData(sortedData);
      } catch (error) {
        console.error('Error fetching temperature data:', error);
      }
    };

    fetchData();
    const intervalId = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart
        data={data}
        margin={{
          top: 5, right: 30, left: 20, bottom: 25,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="timestamp"
          type="number"
          scale="time"
          domain={['dataMin', 'dataMax']}
          tickFormatter={(timestamp) => {
            return new Date(timestamp).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            });
          }}
          angle={-45}
          textAnchor="end"
          height={60}
        />
        <YAxis 
          domain={['auto', 'auto']}
          label={{ 
            value: 'Temperature (°C)', 
            angle: -90, 
            position: 'insideLeft',
            offset: -5
          }}
        />
        <Tooltip 
          labelFormatter={(timestamp) => {
            return new Date(timestamp).toLocaleString([], {
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
          dot={false}
          activeDot={{ r: 6 }}
          isAnimationActive={false}  // Disable animation for better initial render
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default TemperatureChart;
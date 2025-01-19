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
        
        console.log('Number of records fetched:', fetchedData.length);

        // Convert the timestamp format and ensure temperature is a number
        const formattedData = fetchedData.map(entry => {
          // Convert DD-MM-YYYY HH:mm to YYYY-MM-DD HH:mm for proper date parsing
          const [datePart, timePart] = entry.timestamp.split(' ');
          const [day, month, year] = datePart.split('-');
          const dateObj = new Date(`${year}-${month}-${day} ${timePart}`);
          
          return {
            timestamp: dateObj.getTime(),
            external_temperature: Number(entry.external_temperature)
          };
        }).sort((a, b) => b.timestamp - a.timestamp); // Sort in descending order (newest first)

        console.log('Full formatted data length:', formattedData.length);
        console.log('First few records:', formattedData.slice(0, 3));
        console.log('Last few records:', formattedData.slice(-3));

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

  const minTemp = Math.floor(Math.min(...data.map(d => d.external_temperature)));
  const maxTemp = Math.ceil(Math.max(...data.map(d => d.external_temperature)));
  const paddedMin = minTemp - 1;
  const paddedMax = maxTemp + 1;

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
          domain={['dataMin', 'dataMax']}
          scale="time"
          tickFormatter={(timestamp) => {
            return new Date(timestamp).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            });
          }}
          angle={-45}
          textAnchor="end"
          height={60}
          minTickGap={50}
        />
        <YAxis 
          domain={[paddedMin, paddedMax]}
          label={{ 
            value: 'Temperature (°C)', 
            angle: -90, 
            position: 'insideLeft',
            offset: -5
          }}
          ticks={Array.from({ length: paddedMax - paddedMin + 1 }, (_, i) => paddedMin + i)}
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
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default TemperatureChart;
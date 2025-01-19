import React, { useEffect, useState, useMemo } from 'react';
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
        
        // Convert timestamp to proper date objects for sorting
        const formattedData = fetchedData.map(entry => {
          const [datePart, timePart] = entry.timestamp.split(' ');
          const [day, month, year] = datePart.split('-');
          return {
            fullTimestamp: entry.timestamp,
            dateTime: new Date(`${year}-${month}-${day}T${timePart}`),
            external_temperature: Number(entry.external_temperature)
          };
        });

        // Sort by dateTime
        formattedData.sort((a, b) => a.dateTime - b.dateTime);
        
        setData(formattedData);
      } catch (error) {
        console.error('Error fetching temperature data:', error);
      }
    };

    fetchData();
    const intervalId = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, []);

  // Memoize the chart to prevent unnecessary re-renders
  const chart = useMemo(() => {
    if (data.length === 0) {
      return <div>Loading...</div>;
    }
    console.log('Data structure check:', {
      firstPoint: data[0]?.dateTime?.toISOString(),
      lastPoint: data[data.length-1]?.dateTime?.toISOString(),
      totalPoints: data.length
    });

    return (
      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 65,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="dateTime"
            type="number"
            scale="time"
            domain={['dataMin', 'dataMax']}
            tickFormatter={(timeStr) => {
              return new Date(timeStr).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
              });
            }}
            angle={-45}
            textAnchor="end"
            height={60}
            tickCount={8}
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
            labelFormatter={(value) => {
              return new Date(value).toLocaleString([], {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
              });
            }}
            formatter={(value) => [`${value}°C`, 'Temperature']}
          />
          <Legend verticalAlign="top" height={36}/>
          <Line
            type="monotone"
            dataKey="external_temperature"
            name="External Temperature"
            stroke="#8884d8"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 6 }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  }, [data]);

  return (
    <div style={{ width: '100%', height: '400px', padding: '20px' }}>
      {chart}
    </div>
  );
};

export default TemperatureChart;
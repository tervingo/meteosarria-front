import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

const TemperatureChart = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('https://meteosarria-back.onrender.com/api/temperature-data');
        const fetchedData = response.data;
        
        // Process the data with outlier handling
        let lastValidTemperature = null;
        const formattedData = fetchedData.map(entry => {
          const [datePart, timePart] = entry.timestamp.split(' ');
          const [day, month, year] = datePart.split('-');
          const formattedDate = `${year}-${month}-${day}T${timePart}`;
          const dateObj = new Date(formattedDate);
          
          // Get the current temperature
          let currentTemp = Number(entry.external_temperature);
          
          // Check if current temperature is valid
          if (currentTemp <= 45) {
            lastValidTemperature = currentTemp;
          } else {
            // If invalid, use last valid temperature
            currentTemp = lastValidTemperature !== null ? lastValidTemperature : null;
            console.log(`Replaced anomalous temperature (${entry.external_temperature}) with last valid temperature: ${currentTemp}`);
          }
          
          return {
            fullTimestamp: entry.timestamp,
            dateTime: dateObj,
            external_temperature: currentTemp
          };
        })
        // Filter out any null temperatures (in case the first readings were invalid)
        .filter(item => item.external_temperature !== null);
        
        const sortedData = formattedData
          .filter(item => !isNaN(item.dateTime))
          .sort((a, b) => a.dateTime - b.dateTime);
        
        console.log('Final data for chart:', sortedData);
        setData(sortedData);
      } catch (error) {
        console.error('Error fetching temperature data:', error);
      }
    };

    fetchData();
    const intervalId = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, []);

  const chart = useMemo(() => {
    if (data.length === 0) {
      return <div className="text-center p-4">Loading...</div>;
    }

    // Calculate min and max temperatures with a small padding
    const minTemp = Math.floor(Math.min(...data.map(d => d.external_temperature)));
    const maxTemp = Math.ceil(Math.max(...data.map(d => d.external_temperature)));
    const padding = 1;


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
            const [, timePart] = timeStr.split(' ');
            return timePart;
          }}
          angle={-45}
          textAnchor="end"
          height={60}
          interval="preserveStartEnd"
        />
        <YAxis
          domain={[minTemp - padding, maxTemp + padding]}
          label={{
            value: 'Temperature (°C)',
            angle: -90,
            position: 'insideLeft',
            offset: 10
          }}
        />
        <Tooltip
          formatter={(value) => [`${value}°C`, 'Temperature']}
        />
        <Legend verticalAlign="top" height={36} />
        <Line
          type="monotone"
          dataKey="external_temperature"
          stroke="red"
          name="Temperature"
          dot={false}
          strokeWidth={2}
        />
      </LineChart>
    );
  }, [data]);

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

export default TemperatureChart;
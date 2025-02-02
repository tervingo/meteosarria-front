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

const TemperatureChart = ({ timeRange }) => {
  const [data, setData] = useState([]);
  console.log('Time range:', timeRange);

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

        // Sort data by dateTime
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
  }, [timeRange]); // Add timeRange to the dependency array

  const chart = useMemo(() => {
    if (data.length === 0) {
      return <div className="text-center p-4">Loading...</div>;
    }

    // Calculate min and max temperatures with a small padding
    const absMinTemp = Math.min(...data.map(d => d.external_temperature));
    const absMaxTemp = Math.max(...data.map(d => d.external_temperature));
    const minTemp = Math.floor(absMinTemp);
    const maxTemp = Math.ceil(absMaxTemp);
    const padding = 1;

    // Find the timestamps of min and max temperatures
    const minTempData = data.find(d => d.external_temperature === absMinTemp);
    const maxTempData = data.find(d => d.external_temperature === absMaxTemp);
    const minTempTime = minTempData ? minTempData.fullTimestamp.split(' ')[1] : 'N/A';
    const maxTempTime = maxTempData ? maxTempData.fullTimestamp.split(' ')[1] : 'N/A';

    return (
      <LineChart
        width={500}
        height={300}
        data={data}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 40,
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
          domain={[minTemp - padding, maxTemp + padding]}
          label={{
            value: 'Temperatura (°C)',
            angle: -90,
            position: 'insideLeft',
            offset: 10,
          }}
        />
        <ReferenceLine y={maxTemp} label={`${absMaxTemp}°C at ${maxTempTime}`} stroke="red" strokeDasharray="1 1" />
        <ReferenceLine y={minTemp} label={`${absMinTemp}°C at ${minTempTime}`} stroke="blue" strokeDasharray="1 1" />
        <Tooltip formatter={(value) => [`${value}°C`, 'Temperature']} />
        <Legend verticalAlign="top" height={36} />
        <Line
          type="monotone"
          dataKey="external_temperature"
          stroke="red"
          name="Temperatura"
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
      margin: '0 auto',
    }}>
      {chart}
    </div>
  );
};

export default TemperatureChart;
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
  ReferenceLine, // Import ReferenceLine
} from 'recharts';

const PressChart = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('https://meteosarria-back.onrender.com/api/meteo-data');
        const fetchedData = response.data;
        
        // Process the data with outlier handling
        let lastValidPressure = null;
        const formattedData = fetchedData.map(entry => {
          const [datePart, timePart] = entry.timestamp.split(' ');
          const [day, month, year] = datePart.split('-');
          const formattedDate = `${year}-${month}-${day}T${timePart}`;
          const dateObj = new Date(formattedDate);
          
          // Get the current temperature
          let currentPress = Number(entry.pressure);
          
          // Check if current temperature is valid
          if (currentPress <= 1100) {
            lastValidPressure = currentPress;
          } else {
            // If invalid, use last valid temperature
            currentPress = lastValidPressure !== null ? lastValidPressure : null;
            console.log(`Replaced anomalous pressure (${entry.pressure}) with last valid pressure: ${currentPress}`);
          }
          
          return {
            fullTimestamp: entry.timestamp,
            dateTime: dateObj,
            pressure: currentPress
          };
        })
        // Filter out any null temperatures (in case the first readings were invalid)
        .filter(item => item.pressure !== null);
        
        const sortedData = formattedData
          .filter(item => !isNaN(item.dateTime))
          .sort((a, b) => a.dateTime - b.dateTime);
        
        console.log('Final data for chart:', sortedData);
        setData(sortedData);
      } catch (error) {
        console.error('Error fetching pressure data:', error);
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

    const absMinPress = (Math.min(...data.map(d => d.pressure)));
    const absMaxPress = (Math.max(...data.map(d => d.pressure)));
    const minPress = Math.floor(absMinPress);
    const maxPress = Math.ceil(absMaxPress);
    const padding = 1;

    // Find the timestamps of min and max temperatures
    const minPressData = data.find(d => d.pressure === absMinPress);
    const maxPressData = data.find(d => d.pressure === absMaxPress);
    const minPressTime = minPressData ? minPressData.fullTimestamp.split(' ')[1] : 'N/A';
    const maxPressTime = maxPressData ? maxPressData.fullTimestamp.split(' ')[1] : 'N/A';

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
          domain={[minPress - padding, maxPress + padding]}
          label={{
            value: 'Pressure (hPa)',
            angle: -90,
            position: 'insideLeft',
            offset: 10
          }}
        />
        <ReferenceLine y={maxPress} label={`${absMaxPress}hPa at ${maxPressTime}`}  stroke="red" strokeDasharray="1 1" />
        <ReferenceLine y={minPress} label={`${absMinPress}hPa at ${minPressTime}`} stroke="blue" strokeDasharray="1 1" />

        <Tooltip
          formatter={(value) => [`${value}hPa`, 'Pressure']}
        />
        <Legend verticalAlign="top" height={36} />
        <Line
          type="monotone"
          dataKey="pressure"
          stroke="salmon"
          name="Pressure"
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

export default PressChart;
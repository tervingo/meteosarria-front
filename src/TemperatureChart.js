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

        // Convert timestamp to Date object for recharts
        const formattedData = fetchedData.map(entry => ({
          ...entry,
          timestamp: new Date(entry.timestamp.split('-').reverse().join('-')) // Convert "DD-MM-YYYY hh:mm" to "YYYY-MM-DD hh:mm"
        }));

        console.log('Formatted data:', formattedData); // Log the formatted data
        console.log('timestamp: ', timestamp); // Log the timestamp values
        setData(formattedData);
      } catch (error) {
        console.error('Error fetching temperature data:', error);
      }
    };

    fetchData();
  }, []);

  const domain = ['dataMin', 'dataMax'];
  console.log('Domain:', domain); // Log the domain values

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
          domain={domain}
          tickFormatter={(tick) => new Date(tick).toLocaleTimeString()}
        />
        <YAxis domain={[-10, 40]} />
        <Tooltip labelFormatter={(label) => new Date(label).toLocaleString()} />
        <Legend />
        <Line type="monotone" dataKey="external_temperature" stroke="#8884d8" activeDot={{ r: 8 }} />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default TemperatureChart;
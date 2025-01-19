import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Plot from 'react-plotly.js';

const TemperatureChart = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('https://meteosarria-back.onrender.com/api/temperature-data');
        const fetchedData = response.data;

        // Convert timestamp to Unix timestamp for Plotly
        const formattedData = fetchedData.map(entry => {
          const dateParts = entry.timestamp.split(' ');
          const date = dateParts[0].split('-').reverse().join('-');
          const time = dateParts[1];
          const dateTime = `${date}T${time}:00`;
          const timestamp = new Date(dateTime).getTime();
          return {
            ...entry,
            timestamp
          };
        });

        console.log('Formatted data:', formattedData); // Log the formatted data
        setData(formattedData);
      } catch (error) {
        console.error('Error fetching temperature data:', error);
      }
    };

    fetchData();
  }, []);

  // Extract data for Plotly
  const timestamps = data.map(entry => new Date(entry.timestamp));
  const temperatures = data.map(entry => entry.external_temperature);

  return (
    <Plot
      data={[
        {
          x: timestamps,
          y: temperatures,
          type: 'scatter',
          mode: 'lines+markers',
          marker: { color: 'blue' },
        },
      ]}
      layout={{
        title: 'Temperature Over Time',
        xaxis: {
          title: 'Time',
          type: 'date',
        },
        yaxis: {
          title: 'Temperature (°C)',
          range: [-10, 40],
        },
      }}
      style={{ width: '100%', height: '400px' }}
    />
  );
};

export default TemperatureChart;
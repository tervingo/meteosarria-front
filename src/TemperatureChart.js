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
  ResponsiveContainer
} from 'recharts';
import { useMediaQuery } from '@mui/material';
import { BACKEND_URI } from './constants';
import GetTempColour from './GetTempColour';

const TemperatureChart = ({ timeRange }) => {
  const [data, setData] = useState([]);
  
  // Add breakpoints for different screen sizes
  const isMobile = useMediaQuery('(max-width:600px)');
  const isTablet = useMediaQuery('(min-width:601px) and (max-width:960px)');

  // Data fetching logic remains the same
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(BACKEND_URI + '/api/meteo-data', {
          params: { timeRange },
        });
        const fetchedData = response.data;

        let lastValidTemperature = null;
        const formattedData = fetchedData.map((entry) => {
          const [datePart, timePart] = entry.timestamp.split(' ');
          const [day, month, year] = datePart.split('-');
          const formattedDate = `${year}-${month}-${day}T${timePart}`;
          const dateObj = new Date(formattedDate);

          let currentTemp = Number(entry.external_temperature);

          if (currentTemp <= 45) {
            lastValidTemperature = currentTemp;
          } else {
            currentTemp = lastValidTemperature !== null ? lastValidTemperature : null;
          }

          return {
            fullTimestamp: entry.timestamp,
            dateTime: dateObj,
            external_temperature: currentTemp,
          };
        }).filter((item) => item.external_temperature !== null);

        const sortedData = formattedData
          .filter((item) => !isNaN(item.dateTime))
          .sort((a, b) => a.dateTime - b.dateTime);

        setData(sortedData);
      } catch (error) {
        console.error('Error fetching temperature data:', error);
      }
    };

    fetchData();
    const intervalId = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, [timeRange]);

  const chart = useMemo(() => {
    if (data.length === 0) {
      return <div className="text-center p-4">Loading...</div>;
    }

    const absMinTemp = Math.min(...data.map((d) => d.external_temperature));
    const absMaxTemp = Math.max(...data.map((d) => d.external_temperature));
    const minTemp = Math.floor(absMinTemp);
    const maxTemp = Math.ceil(absMaxTemp);
    const padding = 1;

    const minTempData = data.find((d) => d.external_temperature === absMinTemp);
    const maxTempData = data.find((d) => d.external_temperature === absMaxTemp);
    const minTempTime = minTempData ? minTempData.fullTimestamp : 'N/A';
    const maxTempTime = maxTempData ? maxTempData.fullTimestamp : 'N/A';

    // Responsive configurations
    const getFontSize = () => {
      if (isMobile) return '10px';
      if (isTablet) return '12px';
      return '14px';
    };

    const getMargin = () => ({
      top: isMobile ? 10 : 20,
      right: isMobile ? 15 : 30,
      left: isMobile ? 5 : 20,
      bottom: isMobile ? 60 : 40,
    });

    const getTickInterval = () => {
      if (isMobile) return Math.ceil(data.length / 4);
      if (isTablet) return Math.ceil(data.length / 6);
      return 'preserveStartEnd';
    };

    return (
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={getMargin()}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="fullTimestamp"
            tickFormatter={(timeStr) => {
              const [datePart, timePart] = timeStr.split(' ');
              if (timeRange === '7d') {
                const [day, month] = datePart.split('-');
                return `${day}/${month}`;
              }
              return timePart;
            }}
            angle={-45}
            textAnchor="end"
            height={60}
            interval={getTickInterval()}
            tick={{ fontSize: getFontSize() }}
          />
          <YAxis
            domain={[minTemp - padding, maxTemp + padding]}
            label={{
              value: 'Temperatura (°C)',
              angle: -90,
              position: 'insideLeft',
              offset: isMobile ? 0 : 10,
              style: { fontSize: getFontSize() }
            }}
            tick={{ fontSize: getFontSize() }}
          />
          <ReferenceLine
            y={maxTemp}
            label={{ 
              value: isMobile ? `${absMaxTemp}°` : `${absMaxTemp}° (${maxTempTime})`,
              fill: 'azure',
              fontSize: getFontSize()
            }}
            stroke="red"
            strokeDasharray="1 1"
          />
          <ReferenceLine
            y={minTemp}
            label={{ 
              value: isMobile ? `${absMinTemp}°` : `${absMinTemp}° (${minTempTime})`,
              fill: 'azure',
              fontSize: getFontSize()
            }}
            stroke="blue"
            strokeDasharray="1 1"
          />
          <Tooltip 
            formatter={(value) => [`${value}°C`, 'Temperature']}
            contentStyle={{ fontSize: getFontSize() }}
          />
          <Legend 
            verticalAlign="top" 
            height={36}
            wrapperStyle={{ fontSize: getFontSize() }}
          />
          <Line
            type="monotone"
            dataKey="external_temperature"
            name="Temperatura"
            strokeWidth={isMobile ? 0.3 : 0.5}
            dot={(props) => {
              const { cx, cy, payload } = props;
              const color = GetTempColour(payload.external_temperature);
              const radius = isMobile ? 0.5 : 1;

              return (
                <circle cx={cx} cy={cy} r={radius} fill={color} stroke={color} />
              );
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  }, [data, timeRange, isMobile, isTablet]);

  return (
    <div
      style={{
        width: '100%',
        height: isMobile ? '250px' : isTablet ? '300px' : '350px',
        maxWidth: '1200px',
        margin: '0 auto',
        padding: isMobile ? '10px' : '20px',
      }}
    >
      {chart}
    </div>
  );
};

export default TemperatureChart;
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
import { BACKEND_URI, WIDTH_PC, WIDTH_MOBILE, WIDTH_TABLET, HEIGHT_PC, HEIGHT_MOBILE, HEIGHT_TABLET } from './constants';

const PressChart = ({ timeRange }) => {
  const [data, setData] = useState([]);
  
  // Add breakpoints for different screen sizes
  const isMobile = useMediaQuery('(max-width:600px)');
  const isTablet = useMediaQuery('(min-width:601px) and (max-width:960px)');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          BACKEND_URI+'/api/meteo-data',
          {
            params: { timeRange },
          }
        );
        const fetchedData = response.data;

        let lastValidPressure = null;
        const formattedData = fetchedData.map(entry => {
          const [datePart, timePart] = entry.timestamp.split(' ');
          const [day, month, year] = datePart.split('-');
          const formattedDate = `${year}-${month}-${day}T${timePart}`;
          const dateObj = new Date(formattedDate);

          let currentPress = Number(entry.pressure);

          if (currentPress <= 1100) {
            lastValidPressure = currentPress;
          } else {
            currentPress = lastValidPressure !== null ? lastValidPressure : null;
          }

          return {
            fullTimestamp: entry.timestamp,
            dateTime: dateObj,
            pressure: currentPress
          };
        })
        .filter(item => item.pressure !== null);

        const sortedData = formattedData
          .filter(item => !isNaN(item.dateTime))
          .sort((a, b) => a.dateTime - b.dateTime);

        setData(sortedData);
      } catch (error) {
        console.error('Error fetching pressure data:', error);
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

    const absMinPress = Math.min(...data.map(d => d.pressure));
    const absMaxPress = Math.max(...data.map(d => d.pressure));
    const minPress = Math.floor(absMinPress);
    const maxPress = Math.ceil(absMaxPress);
    const padding = 1;

    const minPressData = data.find(d => d.pressure === absMinPress);
    const maxPressData = data.find(d => d.pressure === absMaxPress);
    const minPressTime = minPressData ? minPressData.fullTimestamp : 'N/A';
    const maxPressTime = maxPressData ? maxPressData.fullTimestamp : 'N/A';

    // Responsive configurations
    const getFontSize = () => {
      if (isMobile) return '10px';
      if (isTablet) return '12px';
      return '14px';
    };

    const getMargin = () => ({
      top: isMobile ? 10 : 10,
      right: isMobile ? 15 : 30,
      left: isMobile ? 5 : 20,
      bottom: isMobile ? 60 : 20,
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
            tick={{ fontSize: getFontSize(), fill: 'silver' }}
          />
          <YAxis
            domain={[minPress - padding, maxPress + padding]}
            label={{
              value: 'Presión (hPa)',
              angle: -90,
              position: 'insideLeft',
              offset: isMobile ? 0 : 10,
              style: { fontSize: getFontSize(), fill: 'silver' }
            }}
            tick={{ fontSize: getFontSize(), fill: 'silver' }}
          />
          <ReferenceLine
            y={maxPress}
            label={{ 
              value: isMobile ? `${absMaxPress}` : `${absMaxPress} (${maxPressTime})`,
              fill: 'azure',
              fontSize: getFontSize()
            }}
            stroke="red"
            strokeDasharray="1 1"
          />
          <ReferenceLine
            y={minPress}
            label={{ 
              value: isMobile ? `${absMinPress}` : `${absMinPress} (${minPressTime})`,
              fill: 'azure',
              fontSize: getFontSize()
            }}
            stroke="blue"
            strokeDasharray="1 1"
          />
          <Tooltip 
            formatter={(value) => [`${value}hPa`, 'Presión']}
            contentStyle={{ fontSize: getFontSize() }}
          />
          <Legend 
            verticalAlign="top" 
            height={36}
            wrapperStyle={{ fontSize: getFontSize() }}
          />
          <Line
            type="monotone"
            dataKey="pressure"
            stroke="orangered"
            name="Presión"
            dot={false}
            strokeWidth={isMobile ? 1 : 2}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  }, [data, timeRange, isMobile, isTablet]);

  return (
    <div
      style={{
        width: isMobile ? WIDTH_MOBILE : isTablet ? WIDTH_TABLET : WIDTH_PC,
        height: isMobile ? HEIGHT_MOBILE : isTablet ? HEIGHT_TABLET : HEIGHT_PC,
        maxWidth: '1200px',
        margin: '0 auto',
        padding: isMobile ? '10px' : '10px',
      }}
    >
      {chart}
    </div>
  );
};

export default PressChart;
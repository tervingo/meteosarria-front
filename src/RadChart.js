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
  ReferenceArea,
  ResponsiveContainer
} from 'recharts';
import { useMediaQuery } from '@mui/material';
import { BACKEND_URI, MAX_VALUE_RAD_X, MAX_VALUE_RAD_Y, MAX_TIME_RAD_X, MAX_TIME_RAD_Y } from './constants';

const RadChart = ({ timeRange }) => {
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

        let lastValidRadiation = null;
        const formattedData = fetchedData.map(entry => {
          const [datePart, timePart] = entry.timestamp.split(' ');
          const [day, month, year] = datePart.split('-');
          const formattedDate = `${year}-${month}-${day}T${timePart}`;
          const dateObj = new Date(formattedDate);

          let currentRad = Number(entry.solar_radiation);

          if (currentRad <= 2000) {
            lastValidRadiation = currentRad;
          } else {
            currentRad = lastValidRadiation !== null ? lastValidRadiation : null;
          }

          return {
            fullTimestamp: entry.timestamp,
            dateTime: dateObj,
            solar_radiation: currentRad
          };
        })
        .filter(item => item.solar_radiation !== null);

        const sortedData = formattedData
          .filter(item => !isNaN(item.dateTime))
          .sort((a, b) => a.dateTime - b.dateTime);

        setData(sortedData);
      } catch (error) {
        console.error('Error fetching radiation data:', error);
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

    const absMinRad = Math.min(...data.map(d => d.solar_radiation));
    const absMaxRad = Math.max(...data.map(d => d.solar_radiation));
    const minRad = Math.floor(absMinRad);
    const maxRad = Math.ceil(absMaxRad);
    const padding = 50;

    const maxRadData = data.find(d => d.solar_radiation === absMaxRad);
    const maxRadTime = maxRadData ? maxRadData.fullTimestamp : 'N/A';

    const getFechaHora = (fecha) => {
      const [DatePart] = fecha.split(' ');
      const [day, month] = DatePart.split('-');
      const hora = fecha.split(' ')[1];
      return day + '/' + month + ' ' + hora;
    }
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
          <ReferenceArea 
            y1={0}
            y2={maxRad + padding}
            fill="gold"
            fillOpacity={0.2}
          />
          
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
            domain={[minRad, maxRad + padding]}
            label={{
              value: 'Radiación solar (W/m²)',
              angle: -90,
              position: 'insideLeft',
              offset: isMobile ? 0 : 10,
              style: { fontSize: getFontSize(), fill: 'silver' }
            }}
            tick={{ fontSize: getFontSize(), fill: 'silver' }}
          />
            {/* Etiquetas de extremos */}
              <text
              x = {MAX_VALUE_RAD_X}
              y = {MAX_VALUE_RAD_Y}
              fill="azure"
              fontSize={getFontSize()}
              textAnchor="end"
            >
              {`Rmáx = ${absMaxRad}%`}
            </text>
            <text
              x = {MAX_TIME_RAD_X}
              y = {MAX_TIME_RAD_Y}
              fill="azure"
              fontSize={getFontSize()}
              textAnchor="end"
            >
              {`(${getFechaHora(maxRadTime)})`}
            </text>
          <Tooltip 
            formatter={(value) => [`${value} W/m²`, 'Radiación solar']}
            contentStyle={{ fontSize: getFontSize() }}
          />
          <Legend 
            verticalAlign="top" 
            height={36}
            wrapperStyle={{ fontSize: getFontSize() }}
          />
          <Line
            type="monotone"
            dataKey="solar_radiation"
            stroke="gold"
            name="Radiación solar"
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
        width: '100%',
        height: '100%',
        maxWidth: '1200px',
        margin: '0 auto',
        padding: isMobile ? '10px' : '10px',
      }}
    >
      {chart}
    </div>
  );
};

export default RadChart;
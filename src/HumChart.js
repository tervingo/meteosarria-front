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
import { BACKEND_URI, WIDTH_PC, WIDTH_MOBILE, WIDTH_TABLET, HEIGHT_PC, HEIGHT_MOBILE, HEIGHT_TABLET, MAX_VALUE_X, MAX_VALUE_Y, MAX_TIME_X, MAX_TIME_Y, MIN_VALUE_X, MIN_VALUE_Y, MIN_TIME_X, MIN_TIME_Y } from './constants';

const HumChart = ({ timeRange }) => {
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

        let lastValidHumidity = null;
        const formattedData = fetchedData.map(entry => {
          const [datePart, timePart] = entry.timestamp.split(' ');
          const [day, month, year] = datePart.split('-');
          const formattedDate = `${year}-${month}-${day}T${timePart}`;
          const dateObj = new Date(formattedDate);

          let currentHum = Number(entry.humidity);

          if (currentHum < 100) {
            lastValidHumidity = currentHum;
          } else {
            currentHum = lastValidHumidity !== null ? lastValidHumidity : null;
          }

          return {
            fullTimestamp: entry.timestamp,
            dateTime: dateObj,
            humidity: currentHum
          };
        })
        .filter(item => item.humidity !== null);

        const sortedData = formattedData
          .filter(item => !isNaN(item.dateTime))
          .sort((a, b) => a.dateTime - b.dateTime);

        setData(sortedData);
      } catch (error) {
        console.error('Error fetching humidity data:', error);
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

    const absMinHum = Math.min(...data.map(d => d.humidity));
    const absMaxHum = Math.max(...data.map(d => d.humidity));
    const minHum = Math.floor(absMinHum);
 

    const minHumData = data.find(d => d.humidity === absMinHum);
    const maxHumData = data.find(d => d.humidity === absMaxHum);
    const minHumTime = minHumData ? minHumData.fullTimestamp : 'N/A';
    const maxHumTime = maxHumData ? maxHumData.fullTimestamp : 'N/A';

    const getFechaHora = (fecha) => {
      const [DatePart] = fecha.split(' ');
      const [day, month] = DatePart.split('-');
      const hora = fecha.split(' ')[1];
      return day + '/' + month + ' ' + hora;
    }

    // Generar ticks en múltiplos de 20
    const generateTicks = (min, max) => {
      const ticks = [];
      for (let i = min; i <= max; i += 20) {
        ticks.push(i);
      }
      return ticks;
    };


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

    const humidityRanges =  [
      { start: 0, end: 20 },
      { start: 20, end: 40 },
      { start: 40, end: 60 },
      { start: 60, end: 80 },
      { start: 80, end: 100 }
     ];

     const GetHumColour = (humidity) => {
      let color;
      if (humidity >= 0 && humidity < 20) {
        color = 'orangered'; 
      } else if (humidity >= 20 && humidity < 40) {
        color = 'gold'; 
      } else if (humidity >= 40 && humidity < 60) {
        color = 'chartreuse'; 
      } else if (humidity >= 60 && humidity < 80) {
        color = 'dodgerblue';
      } else if (humidity >= 80) {
        color = 'navy';
      } else {
        color = 'white'; // Default to white if out of range
      }
        return color;
      }; 

      const getMinLevel = (minHum) => {
        return Math.floor(minHum/20) * 20 -20;

      }

    return (
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={getMargin()}
        >
          {/* Franjas de humedad */}
          {humidityRanges.map((range) => (
            <ReferenceArea
              key={`${range.start}-${range.end}`}
              y1={range.start}
              y2={range.end}
              fill={GetHumColour(range.start)}
              fillOpacity={0.2}
            />
          ))}
            

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
            domain={[getMinLevel(minHum), 100]}
            label={{
              value: 'Humedad (%)',
              angle: -90,
              position: 'insideLeft',
              offset: isMobile ? 0 : 10,
              style: { fontSize: getFontSize(), fill: 'silver' }
            }}
            tick={{ fontSize: getFontSize(), fill: 'silver' }}
            ticks={generateTicks(getMinLevel(minHum), 100)}
          />
          {/* Etiquetas de extremos */}
            <text
            x = {MAX_VALUE_X}
            y = {MAX_VALUE_Y}
            fill="azure"
            fontSize={getFontSize()}
            textAnchor="end"
          >
            {`Hmáx = ${absMaxHum}%`}
          </text>
          <text
            x = {MAX_TIME_X}
            y = {MAX_TIME_Y}
            fill="azure"
            fontSize={getFontSize()}
            textAnchor="end"
          >
            {`(${getFechaHora(maxHumTime)})`}
          </text>
          <text
            x = {MIN_VALUE_X}
            y = {MIN_VALUE_Y}
            fill="azure"
            fontSize={getFontSize()}
            textAnchor="end"
          >
            {`Hmin = ${absMinHum}%`}
          </text>
          <text
            x = {MIN_TIME_X}
            y = {MIN_TIME_Y}
            fill="azure"
            fontSize={getFontSize()}
            textAnchor="end"
          >
            {`(${getFechaHora(minHumTime)})`}
          </text>

          <Tooltip 
            formatter={(value) => [`${value}%`, 'Humedad']}
            contentStyle={{ fontSize: getFontSize() }}
          />
          <Legend 
            verticalAlign="top" 
            height={36}
            wrapperStyle={{ fontSize: getFontSize() }}
          />
          <Line
            type="monotone"
            dataKey="humidity"
            stroke="cyan"
            name="Humedad"
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

export default HumChart;
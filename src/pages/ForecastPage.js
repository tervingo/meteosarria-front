import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useMediaQuery } from '@mui/material';
import ForecastComparisonTable from '../components/ForecastComparisonTable';

const CONFIG = {
  burgos: { label: 'Burgos' },
  barcelona: { label: 'Barcelona (Sarrià)' },
};

const miniStyles = { resumen: { color: '#aaa', fontSize: '0.85rem', maxWidth: '600px' } };

const getDate = (date) => {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
};

const getTime = (date) => {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

const ForecastPage = () => {
  const { city } = useParams();
  const isMobile = useMediaQuery('(max-width:600px)');
  const info = CONFIG[city];
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timerId = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timerId);
  }, []);

  if (!info) {
    return (
      <div style={s.page}>
        <Link to="/" style={s.back}>← Inicio</Link>
        <p>Ciudad no encontrada.</p>
      </div>
    );
  }

  return (
    <div style={s.page}>
      <Helmet><title>Predicción {info.label} – Meteosarria</title></Helmet>

      <div style={s.header}>
        <Link to="/" style={s.back}>← Inicio</Link>
        <h1 style={s.title}>Predicción — {info.label}</h1>
        <span style={s.clock}>{getDate(currentTime)} · {getTime(currentTime)}</span>
      </div>

      <section style={s.section}>
        <h2 style={s.sectionTitle}>Comparativa de previsiones (Open-Meteo + IA, AEMET, ECMWF, GFS, ICON)</h2>
        <ForecastComparisonTable city={city} styles={miniStyles} isMobile={isMobile} />
      </section>
    </div>
  );
};

export default ForecastPage;

const s = {
  page: {
    minHeight: '100vh', background: '#0f1117', color: '#e0e0e0',
    padding: 16, boxSizing: 'border-box',
    display: 'flex', flexDirection: 'column', gap: 20,
    fontFamily: 'sans-serif',
  },
  header: { display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' },
  back: { color: '#90EE90', textDecoration: 'none', fontSize: '0.95rem', whiteSpace: 'nowrap' },
  title: { margin: 0, fontSize: '1.5rem', fontWeight: 700, color: '#fff' },
  clock: { color: '#ff8c00', fontSize: '1.2rem', whiteSpace: 'nowrap' },
  section: {
    background: '#1a1d27', borderRadius: 8, padding: '16px',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
  },
  sectionTitle: { margin: 0, alignSelf: 'flex-start', fontSize: '1.1rem', color: '#90EE90' },
};

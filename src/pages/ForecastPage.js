import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useMediaQuery } from '@mui/material';
import AiForecastTable from '../components/AiForecastTable';
import AemetForecastTable from '../components/AemetForecastTable';

const CONFIG = {
  burgos: { label: 'Burgos', windyLat: 42.343926001, windyLon: -3.696977 },
  barcelona: { label: 'Barcelona (Sarrià)', windyLat: 41.3950387, windyLon: 2.1225328 },
};

const miniStyles = { resumen: { color: '#aaa', fontSize: '0.85rem', maxWidth: '600px' } };

const ForecastPage = () => {
  const { city } = useParams();
  const isMobile = useMediaQuery('(max-width:600px)');
  const info = CONFIG[city];

  if (!info) {
    return (
      <div style={s.page}>
        <Link to="/" style={s.back}>← Inicio</Link>
        <p>Ciudad no encontrada.</p>
      </div>
    );
  }

  const windySrc = `https://embed.windy.com/embed.html?type=forecast&location=coordinates&detail=true&detailLat=${info.windyLat}&detailLon=${info.windyLon}&metricTemp=°C&metricRain=mm&metricWind=km/h`;

  return (
    <div style={s.page}>
      <Helmet><title>Predicción {info.label} – Meteosarria</title></Helmet>

      <div style={s.header}>
        <Link to="/" style={s.back}>← Inicio</Link>
        <h1 style={s.title}>Predicción — {info.label}</h1>
      </div>

      <section style={s.section}>
        <h2 style={s.sectionTitle}>Modelos numéricos (Open-Meteo) + comentario IA</h2>
        <AiForecastTable city={city} styles={miniStyles} isMobile={isMobile} />
      </section>

      <section style={s.section}>
        <h2 style={s.sectionTitle}>Windy</h2>
        <iframe
          width="100%"
          height="187"
          style={{ maxWidth: '500px', border: 0 }}
          src={windySrc}
          title={`Predicción Windy ${info.label}`}
        />
      </section>

      <section style={s.section}>
        <h2 style={s.sectionTitle}>AEMET</h2>
        <AemetForecastTable city={city} styles={miniStyles} isMobile={isMobile} />
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
  header: { display: 'flex', alignItems: 'center', gap: 20 },
  back: { color: '#90EE90', textDecoration: 'none', fontSize: '0.95rem', whiteSpace: 'nowrap' },
  title: { margin: 0, fontSize: '1.5rem', fontWeight: 700, color: '#fff' },
  section: {
    background: '#1a1d27', borderRadius: 8, padding: '16px',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
  },
  sectionTitle: { margin: 0, alignSelf: 'flex-start', fontSize: '1.1rem', color: '#90EE90' },
};

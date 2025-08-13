import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Cell, LabelList } from 'recharts';
import { BACKEND_URI } from './constants';
import './Dashboard.css';

const BurgosStatsPage = () => {
  const [burgosData, setBurgosData] = useState({
    recordsAbsolutos: null,
    recordsPorDecada: null,
    tempMediaPorDecada: null,
    diasCalurososAnual: null,
    diasTorridosAnual: null,
    rachasCalurosasAnual: null,
    rachasTorridasAnual: null,
    nochesTropicalesAnual: null
  });
  const [lastRecordDate, setLastRecordDate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBurgosData = useCallback(async () => {
    try {
      setLoading(true);
      
      const responses = await Promise.all([
        axios.get(BACKEND_URI + '/api/burgos-estadisticas/records-absolutos'),
        axios.get(BACKEND_URI + '/api/burgos-estadisticas/records-por-decada'),
        axios.get(BACKEND_URI + '/api/burgos-estadisticas/temperatura-media-decada'),
        axios.get(BACKEND_URI + '/api/burgos-estadisticas/dias-calurosos-anual'),
        axios.get(BACKEND_URI + '/api/burgos-estadisticas/dias-torridos-anual'),
        axios.get(BACKEND_URI + '/api/burgos-estadisticas/rachas-calurosas-anual'),
        axios.get(BACKEND_URI + '/api/burgos-estadisticas/rachas-torridas-anual'),
        axios.get(BACKEND_URI + '/api/burgos-estadisticas/noches-tropicales-anual'),
        axios.get(BACKEND_URI + '/api/burgos-estadisticas/ultimo-registro')
      ]);

      setBurgosData({
        recordsAbsolutos: responses[0].data,
        recordsPorDecada: responses[1].data,
        tempMediaPorDecada: responses[2].data,
        diasCalurososAnual: responses[3].data,
        diasTorridosAnual: responses[4].data,
        rachasCalurosasAnual: responses[5].data,
        rachasTorridasAnual: responses[6].data,
        nochesTropicalesAnual: responses[7].data
      });

      setLastRecordDate(responses[8].data.ultimaFecha);
      setError(null);
    } catch (error) {
      console.error('Error fetching Burgos data:', error);
      setError('Error cargando datos de Burgos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBurgosData();
  }, [fetchBurgosData]);

  const formatTemperature = (temp) => {
    return temp !== null ? `${temp}°C` : 'N/A';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const formatDateDDMMYYYY = (dateString) => {
    if (!dateString) return new Date().getFullYear();
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const monthNames = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const getTemperatureColor = (temp) => {
    if (temp === null) return '#999';
    if (temp < 0) return '#0066cc';
    if (temp < 10) return '#4da6ff';
    if (temp < 20) return '#66b3ff';
    if (temp < 25) return '#80d0ff';
    if (temp < 30) return '#ffcc66';
    if (temp < 35) return '#ff9933';
    return '#ff3300';
  };

  const MetricCard = ({ title, value, subtitle, icon, color = '#2563eb' }) => (
    <div className="metric-card">
      <div className="metric-header">
        <span className="metric-icon">{icon}</span>
        <h3 className="metric-title">{title}</h3>
      </div>
      <div className="metric-value" style={{ color }}>
        {value}
      </div>
      {subtitle && (
        <div className="metric-subtitle">
          {subtitle}
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="dashboard-container">
        <Helmet>
          <title>Estadísticas de Burgos - Meteo Sarria</title>
        </Helmet>
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Cargando estadísticas de Burgos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="error-message">
          <p>{error}</p>
          <button onClick={fetchBurgosData} className="retry-button">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const { recordsAbsolutos, recordsPorDecada, tempMediaPorDecada, diasCalurososAnual, diasTorridosAnual, rachasCalurosasAnual, rachasTorridasAnual, nochesTropicalesAnual } = burgosData;

  return (
    <div className="dashboard-container">
      <Helmet>
        <title>Estadísticas Históricas de Burgos - Meteo Sarria</title>
        <meta name="description" content="Estadísticas meteorológicas históricas de Burgos (Villafría) desde 1970" />
      </Helmet>

      {/* Header */}
      <header className="dashboard-header">
        <Link to="/" className="back-link">← Volver</Link>
        <div className="header-content">
          <h1>📊 Estadísticas de Burgos (Villafría)</h1>
          <p>Datos meteorológicos históricos - 1 ene 1970 - {formatDateDDMMYYYY(lastRecordDate)}</p>
        </div>
      </header>

      {/* Récords Absolutos */}
      <section className="dashboard-section">
        <h2>🌡️ Valores Extremos Absolutos (1970-2025)</h2>
        {recordsAbsolutos && (
          <div className="metrics-grid">
            <MetricCard
              title="Temperatura máxima absoluta"
              value={formatTemperature(recordsAbsolutos.temp_max_absoluta?.valor)}
              subtitle={formatDate(recordsAbsolutos.temp_max_absoluta?.fecha)}
              icon="🔥"
              color={getTemperatureColor(recordsAbsolutos.temp_max_absoluta?.valor)}
            />
            <MetricCard
              title="Temperatura mínima absoluta"
              value={formatTemperature(recordsAbsolutos.temp_min_absoluta?.valor)}
              subtitle={formatDate(recordsAbsolutos.temp_min_absoluta?.fecha)}
              icon="🧊"
              color="#2563eb"
            />
          </div>
        )}
      </section>

      {/* Récords por Década */}
      <section className="dashboard-section">
        <h2>📅 Valores Extremos por Década</h2>
        {recordsPorDecada && recordsPorDecada.length > 0 && (
          <div className="chart-container">
            <div className="decade-records">
              {recordsPorDecada.map((decada) => (
                <div key={decada.decada} className="decade-card">
                  <h3>{decada.decada}s</h3>
                  <div className="decade-temps">
                    <div className="temp-record">
                      <span className="temp-label">Máx:</span>
                      <span className="temp-value" style={{ color: getTemperatureColor(decada.temp_max) }}>
                        {formatTemperature(decada.temp_max)}
                      </span>
                      <span className="temp-date">{formatDate(decada.fecha_max)}</span>
                    </div>
                    <div className="temp-record">
                      <span className="temp-label">Mín:</span>
                      <span className="temp-value" style={{ color: '#2563eb' }}>
                        {formatTemperature(decada.temp_min)}
                      </span>
                      <span className="temp-date">{formatDate(decada.fecha_min)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Temperatura Media por Década */}
      <section className="dashboard-section">
        <h2>📈 Temperatura Media por Década</h2>
        {tempMediaPorDecada && tempMediaPorDecada.length > 0 && (
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={tempMediaPorDecada}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="decada" />
                <YAxis 
                  label={{ value: 'Temperatura (°C)', angle: -90, position: 'insideLeft' }}
                  domain={['dataMin - 1', 'dataMax + 1']}
                />
                <Tooltip 
                  formatter={(value) => [`${value}°C`, 'Temperatura Media']}
                />
                <Bar dataKey="temp_media" barSize={60}>
                  {tempMediaPorDecada.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getTemperatureColor(entry.temp_media)} />
                  ))}
                  <LabelList 
                    dataKey="temp_media" 
                    position="top" 
                    style={{ fontSize: '12px', fill: '#374151', fontWeight: 'bold' }}
                    formatter={(value) => `${value}°C`}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      {/* Días Calurosos por Año */}
      <section className="dashboard-section">
        <h2>🔥 Días con Temperatura Máxima > 30°C por Año</h2>
        {diasCalurososAnual && diasCalurososAnual.length > 0 && (
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={diasCalurososAnual}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="año" />
                <YAxis 
                  label={{ value: 'Número de días', angle: -90, position: 'insideLeft' }}
                  allowDecimals={false}
                />
                <Tooltip 
                  formatter={(value) => [`${value} días`, 'Días > 30°C']}
                  labelFormatter={(año) => `Año ${año}`}
                />
                <Line
                  type="monotone"
                  dataKey="dias_max_gt_30"
                  stroke="#ff6b6b"
                  strokeWidth={2}
                  dot={{ fill: '#ff6b6b', strokeWidth: 2, r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      {/* Días Tórridos por Año */}
      <section className="dashboard-section">
        <h2>🌡️ Días con Temperatura Máxima > 35°C por Año</h2>
        {diasTorridosAnual && diasTorridosAnual.length > 0 && (
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={diasTorridosAnual}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="año" />
                <YAxis 
                  label={{ value: 'Número de días', angle: -90, position: 'insideLeft' }}
                  allowDecimals={false}
                />
                <Tooltip 
                  formatter={(value) => [`${value} días`, 'Días > 35°C']}
                  labelFormatter={(año) => `Año ${año}`}
                />
                <Line
                  type="monotone"
                  dataKey="dias_max_gt_35"
                  stroke="#ff3300"
                  strokeWidth={2}
                  dot={{ fill: '#ff3300', strokeWidth: 2, r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      {/* Rachas Calurosas por Año */}
      <section className="dashboard-section">
        <h2>🔥 Días Consecutivos con Temp Máx > 30°C por Año</h2>
        {rachasCalurosasAnual && rachasCalurosasAnual.length > 0 && (
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={rachasCalurosasAnual}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="año" />
                <YAxis 
                  label={{ value: 'Días consecutivos', angle: -90, position: 'insideLeft' }}
                  allowDecimals={false}
                />
                <Tooltip 
                  formatter={(value) => [`${value} días`, 'Racha > 30°C']}
                  labelFormatter={(año) => `Año ${año}`}
                />
                <Line
                  type="monotone"
                  dataKey="racha_max_gt_30"
                  stroke="#ff9933"
                  strokeWidth={2}
                  dot={{ fill: '#ff9933', strokeWidth: 2, r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      {/* Rachas Tórridas por Año */}
      <section className="dashboard-section">
        <h2>🌡️ Días Consecutivos con Temp Máx > 35°C por Año</h2>
        {rachasTorridasAnual && rachasTorridasAnual.length > 0 && (
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={rachasTorridasAnual}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="año" />
                <YAxis 
                  label={{ value: 'Días consecutivos', angle: -90, position: 'insideLeft' }}
                  allowDecimals={false}
                />
                <Tooltip 
                  formatter={(value) => [`${value} días`, 'Racha > 35°C']}
                  labelFormatter={(año) => `Año ${año}`}
                />
                <Line
                  type="monotone"
                  dataKey="racha_max_gt_35"
                  stroke="#ff0000"
                  strokeWidth={2}
                  dot={{ fill: '#ff0000', strokeWidth: 2, r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      {/* Noches Tropicales por Año */}
      <section className="dashboard-section">
        <h2>🌙 Noches con Temperatura Mínima > 20°C por Año</h2>
        {nochesTropicalesAnual && nochesTropicalesAnual.length > 0 && (
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={nochesTropicalesAnual}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="año" />
                <YAxis 
                  label={{ value: 'Número de noches', angle: -90, position: 'insideLeft' }}
                  allowDecimals={false}
                />
                <Tooltip 
                  formatter={(value) => [`${value} noches`, 'Noches > 20°C']}
                  labelFormatter={(año) => `Año ${año}`}
                />
                <Line
                  type="monotone"
                  dataKey="noches_min_gt_20"
                  stroke="#ff6600"
                  strokeWidth={2}
                  dot={{ fill: '#ff6600', strokeWidth: 2, r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="dashboard-footer">
        <p>Datos históricos de Burgos (Villafría) desde 1970 • Fuente: AEMET</p>
        <Link to="/" className="home-link">🏠 Volver al inicio</Link>
      </footer>
    </div>
  );
};

export default BurgosStatsPage;
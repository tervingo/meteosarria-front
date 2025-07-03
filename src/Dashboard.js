import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { BACKEND_URI } from './constants';
import './Dashboard.css';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    records: null,
    tendenciaAnual: null,
    comparativaAño: null,
    heatmap: null,
    estadisticas: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchDashboardData();
  }, [selectedYear]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Llamadas separadas: datos actuales + datos históricos
      const [liveDataResponse, ...dashboardResponses] = await Promise.all([
        axios.get(BACKEND_URI + '/api/live'),  // Datos actuales
        axios.get(BACKEND_URI + '/api/dashboard/records'),
        axios.get(BACKEND_URI + '/api/dashboard/tendencia-anual'),
        axios.get(BACKEND_URI + `/api/dashboard/comparativa-año/${selectedYear}`),
        axios.get(BACKEND_URI + '/api/dashboard/heatmap'),
        axios.get(BACKEND_URI + '/api/dashboard/estadisticas')
      ]);
  
      const liveData = liveDataResponse.data;
      const resumenData = dashboardResponses[0].data;
  
      // Combinar datos actuales con resumen histórico
      const resumenCompleto = {
        ...resumenData,
        temperatura_actual: liveData.external_temperature,
        humedad_actual: liveData.humidity,
        timestamp_actual: liveData.timestamp
      };
  
      setDashboardData({
        records: dashboardResponses[0].data,
        tendenciaAnual: dashboardResponses[1].data,
        comparativaAño: dashboardResponses[2].data,
        heatmap: dashboardResponses[3].data,
        estadisticas: dashboardResponses[4].data
      });
  
      setError(null);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Error cargando datos del dashboard');
    } finally {
      setLoading(false);
    }
  };

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

  const getTrendIcon = (tendencia) => {
    switch (tendencia) {
      case 'ascendente': return '📈';
      case 'descendente': return '📉';
      default: return '➡️';
    }
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

  const HeatmapCell = ({ year, month, temp, minTemp, maxTemp }) => {
    const intensity = temp ? (temp - minTemp) / (maxTemp - minTemp) : 0;
    const backgroundColor = temp ? 
      `rgb(${Math.round(255 * intensity)}, ${Math.round(255 * (1 - intensity) * 0.5)}, ${Math.round(255 * (1 - intensity))})` : 
      '#f0f0f0';
    
    return (
      <div 
        className="heatmap-cell" 
        style={{ backgroundColor }}
        title={`${year}-${month}: ${formatTemperature(temp)}`}
      >
        {temp ? Math.round(temp) : ''}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <Helmet>
          <title>Estadísticas - Meteo Sarria</title>
        </Helmet>
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="error-message">
          <p>{error}</p>
          <button onClick={fetchDashboardData} className="retry-button">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const { records, tendenciaAnual, comparativaAño, heatmap, estadisticas } = dashboardData;

  return (
    <div className="dashboard-container">
      <Helmet>
        <title>Estadísticas Históricas - Meteo Sarria</title>
        <meta name="description" content="Estadísticas meteorológicas históricas de Sarria desde 2009" />
      </Helmet>

      {/* Header */}
      <header className="dashboard-header">
        <Link to="/" className="back-link">← Volver</Link>
        <div className="header-content">
          <h1>📊 Estadísticas Históricas</h1>
          <p>Datos meteorológicos de Sarria • 2009-{new Date().getFullYear()}</p>
        </div>
      </header>

      {/* Resumen Actual */}
      <section className="dashboard-section">
        <h2>🌡️ Valores Extremos (2009-2025)</h2>
        <div className="metrics-grid">
          <MetricCard
            title="Máxima más alta histórica"
            value={formatTemperature(records?.maxima_masalta_historica?.valor)}
            subtitle={formatDate(records?.maxima_masalta_historica?.fecha)}
            icon="🔥"
            color={getTemperatureColor(records?.maxima_masalta_historica?.valor)}
          />
          <MetricCard
            title="Máxima más baja histórica"
            value={formatTemperature(records?.maxima_masbaja_historica?.valor)}
            subtitle={formatDate(records?.maxima_masbaja_historica?.fecha)}
            icon="🌡️"
            color={getTemperatureColor(records?.maxima_masbaja_historica?.valor)}
          />
          <MetricCard
            title="Mínima más baja histórica"
            value={formatTemperature(records?.minima_masbaja_historica?.valor)}
            subtitle={formatDate(records?.minima_masbaja_historica?.fecha)}
            icon="🧊"
            color="#2563eb"
          />
          <MetricCard
            title="Mínima más alta histórica"
            value={formatTemperature(records?.minima_masalta_historica?.valor)}
            subtitle={formatDate(records?.minima_masalta_historica?.fecha)}
            icon="🧊"
            color="#2563eb"
          />

        </div>
      </section>

      {/* Tendencia Anual */}
      <section className="dashboard-section">
        <h2>📈 Evolución Anual de Temperaturas</h2>
        {tendenciaAnual && (
          <div className="chart-container">
            <div className="chart-info">
              <p>
                {getTrendIcon(tendenciaAnual.tendencia)} 
                Tendencia: <strong>{tendenciaAnual.tendencia}</strong>
                {tendenciaAnual.incremento_decada !== 0 && (
                  <span> ({tendenciaAnual.incremento_decada > 0 ? '+' : ''}{tendenciaAnual.incremento_decada}°C por década)</span>
                )}
              </p>
            </div>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={tendenciaAnual.años.map((año, idx) => ({
                año,
                media: tendenciaAnual.temperaturas_medias[idx],
                maxima: tendenciaAnual.temperaturas_maximas[idx],
                minima: tendenciaAnual.temperaturas_minimas[idx]
              }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="año" />
                <YAxis label={{ value: 'Temperatura (°C)', angle: -90, position: 'insideLeft' }} />
                <Tooltip 
                  formatter={(value, name) => [`${value}°C`, 
                    name === 'media' ? 'Media' : name === 'maxima' ? 'Máxima' : 'Mínima'
                  ]}
                  labelFormatter={(año) => `Año ${año}`}
                />
                <Area type="monotone" dataKey="maxima" stackId="1" stroke="#ff6b6b" fill="#ffebee" />
                <Area type="monotone" dataKey="minima" stackId="2" stroke="#42a5f5" fill="#e3f2fd" />
                <Line type="monotone" dataKey="media" stroke="#2e7d32" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      {/* Comparativa Año Actual */}
      <section className="dashboard-section">
        <h2>📅 {selectedYear} vs Promedio Histórico</h2>
        <div className="year-selector">
          <label>Año a comparar: </label>
          <select 
            value={selectedYear} 
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          >
            {Array.from({length: new Date().getFullYear() - 2009 + 1}, (_, i) => 2009 + i)
              .reverse()
              .map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
          </select>
        </div>
        
        {comparativaAño && (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={comparativaAño.meses.map((mes, idx) => ({
              mes,
              actual: comparativaAño.año_actual[idx],
              historico: comparativaAño.promedio_historico[idx],
              diferencia: comparativaAño.diferencias[idx]
            }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis label={{ value: 'Temperatura (°C)', angle: -90, position: 'insideLeft' }} />
              <Tooltip 
                formatter={(value, name) => [
                  value !== null ? `${value}°C` : 'N/A', 
                  name === 'actual' ? `${selectedYear}` : 'Promedio histórico'
                ]}
              />
              <Bar dataKey="historico" fill="#94a3b8" name="historico" />
              <Bar dataKey="actual" fill="#3b82f6" name="actual" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </section>

      {/* Mapa de Calor */}
      <section className="dashboard-section">
        <h2>🗓️ Mapa de Calor Mensual (Últimos 6 años)</h2>
        {heatmap && heatmap.data && (
          <div className="heatmap-container">
            <div className="heatmap-grid">
              <div className="heatmap-header">
                <div></div>
                {['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'].map(mes => (
                  <div key={mes} className="month-label">{mes}</div>
                ))}
              </div>
              {heatmap.años.map(año => (
                <div key={año} className="heatmap-row">
                  <div className="year-label">{año}</div>
                  {Array.from({length: 12}, (_, mes) => {
                    const data = heatmap.data.find(d => d.año === año && d.mes === mes + 1);
                    return (
                      <HeatmapCell
                        key={`${año}-${mes}`}
                        year={año}
                        month={mes + 1}
                        temp={data?.temperatura}
                        minTemp={heatmap.rango_temperaturas.min}
                        maxTemp={heatmap.rango_temperaturas.max}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
            <div className="heatmap-legend">
              <span>Frío</span>
              <div className="legend-gradient"></div>
              <span>Calor</span>
            </div>
          </div>
        )}
      </section>

      {/* Estadísticas Destacadas */}
      <section className="dashboard-section">
      <h2>🏆 Estadísticas del Mes</h2>
      {estadisticas && (
        <div className="stats-grid">
          <div className="stat-group">
            <h3>{estadisticas.mes_pasado.nombre_mes} {estadisticas.mes_pasado.año}</h3>
            <div className="stat-items">
              <div className="stat-item">
                <span className="stat-label">Días >25°C:</span>
                <span className="stat-value">{estadisticas.mes_pasado.dias_calor_25}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Días >30°C:</span>
                <span className="stat-value">{estadisticas.mes_pasado.dias_calor_30}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Días helada:</span>
                <span className="stat-value">{estadisticas.mes_pasado.dias_helada}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Temp. media:</span>
                <span className="stat-value">{formatTemperature(estadisticas.mes_pasado.temperatura_media)}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Temp. máxima:</span>
                <span className="stat-value">{formatTemperature(estadisticas.mes_pasado.temperatura_maxima)}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Temp. mínima:</span>
                <span className="stat-value">{formatTemperature(estadisticas.mes_pasado.temperatura_minima)}</span>
              </div>
              {estadisticas.mes_pasado.record_mes && (
                <div className="stat-item record">
                  <span className="stat-label">🏆 Récord mensual!</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="stat-group">
            <h3>Rachas actuales</h3>
            <div className="stat-items">
              <div className="stat-item">
                <span className="stat-label">Sin heladas:</span>
                <span className="stat-value">{estadisticas.rachas.sin_heladas} días</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Días >20°C:</span>
                <span className="stat-value">{estadisticas.rachas.dias_sobre_20} días</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>

      {/* Footer */}
      <footer className="dashboard-footer">
        <p>Datos históricos desde abril 2009 • Actualizado cada 30 minutos</p>
        <Link to="/" className="home-link">🏠 Volver al inicio</Link>
      </footer>
    </div>
  );
};

export default Dashboard;
import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Clock, Thermometer, AlertCircle, Play, Pause } from 'lucide-react';
import { BACKEND_URI } from '../constants';

const WeatherComparison = () => {
  const [currentWeather, setCurrentWeather] = useState(null);
  const [weatherHistory, setWeatherHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [nextUpdate, setNextUpdate] = useState(0);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [schedulerStatus, setSchedulerStatus] = useState({ running: true, status: 'running' });
  const [schedulerLoading, setSchedulerLoading] = useState(false);

  const API_BASE = `${BACKEND_URI}/api`;

  const fetchCurrentWeather = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/weather/current`);
      const result = await response.json();
      
      if (result.success) {
        setCurrentWeather(result.data);
        setLastUpdate(new Date(result.data.timestamp));
        setError(null);
      } else {
        setError(result.error || 'Error al obtener datos actuales');
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
      console.error('Error fetching current weather:', err);
    }
  }, [API_BASE]);

  const fetchWeatherHistory = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/weather/history`);
      const result = await response.json();
      
      if (result.success) {
        setWeatherHistory(result.data);
      } else {
        console.error('Error fetching weather history:', result.error);
      }
    } catch (err) {
      console.error('Error fetching weather history:', err);
    }
  }, [API_BASE]);

  const fetchSchedulerStatus = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/weather/scheduler/status`);
      const result = await response.json();
      
      if (result.success) {
        setSchedulerStatus(result.status);
      }
    } catch (err) {
      console.error('Error fetching scheduler status:', err);
    }
  }, [API_BASE]);

  const toggleScheduler = async () => {
    setSchedulerLoading(true);
    try {
      const endpoint = schedulerStatus.running ? 'stop' : 'start';
      const response = await fetch(`${API_BASE}/weather/scheduler/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const result = await response.json();
      
      if (result.success) {
        setSchedulerStatus(result.status);
        setError(null);
      } else {
        setError(result.error || 'Error al controlar el recolector automático');
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
      console.error('Error toggling scheduler:', err);
    } finally {
      setSchedulerLoading(false);
    }
  };

  const manualRefresh = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/weather/collect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const result = await response.json();
      
      if (result.success) {
        setCurrentWeather(result.data);
        setLastUpdate(new Date(result.data.timestamp));
        await fetchWeatherHistory();
        setError(null);
      } else {
        setError(result.error || 'Error al actualizar datos');
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
      console.error('Error manual refresh:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const calculateNextUpdate = useCallback(() => {
    if (lastUpdate) {
      const nextUpdateTime = new Date(lastUpdate.getTime() + 10 * 60 * 1000);
      const now = new Date();
      const diff = Math.max(0, Math.floor((nextUpdateTime - now) / 1000));
      return diff;
    }
    return 0;
  }, [lastUpdate]);

  const formatCountdown = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchCurrentWeather();
      await fetchWeatherHistory();
      await fetchSchedulerStatus();
      setLoading(false);
    };

    loadData();
  }, [fetchCurrentWeather, fetchWeatherHistory, fetchSchedulerStatus]);

  useEffect(() => {
    const interval = setInterval(() => {
      setNextUpdate(calculateNextUpdate());
    }, 1000);

    return () => clearInterval(interval);
  }, [calculateNextUpdate]);

  useEffect(() => {
    const interval = setInterval(async () => {
      await fetchCurrentWeather();
      await fetchWeatherHistory();
    }, 10 * 60 * 1000);

    return () => clearInterval(interval);
  }, [fetchCurrentWeather, fetchWeatherHistory]);

  if (loading && !currentWeather) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="animate-spin mx-auto mb-4" size={48} />
          <p className="text-gray-600">Cargando datos meteorológicos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Datos Meteorológicos Burgos Centro
        </h1>
        <p className="text-gray-600">
          Google Weather API • Lat: {42.34106}° Lon: {-3.70184}°
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="text-red-500" size={20} />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {/* Datos Actuales */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
            <Thermometer className="text-blue-500" />
            Temperatura Actual
          </h2>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleScheduler}
              disabled={schedulerLoading}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 ${
                schedulerStatus.running
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {schedulerStatus.running ? (
                <Pause className={schedulerLoading ? 'animate-spin' : ''} size={16} />
              ) : (
                <Play className={schedulerLoading ? 'animate-spin' : ''} size={16} />
              )}
              {schedulerStatus.running ? 'Pausar' : 'Reanudar'} Recolección
            </button>
            <button
              onClick={manualRefresh}
              disabled={loading}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <RefreshCw className={loading ? 'animate-spin' : ''} size={16} />
              Actualizar
            </button>
          </div>
        </div>

        {currentWeather && currentWeather.google_weather_burgos_center && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-700 mb-2">Temperatura</h3>
              <div className="text-4xl font-bold text-blue-600">
                {currentWeather.google_weather_burgos_center?.temperature ? 
                  `${currentWeather.google_weather_burgos_center.temperature}°C` : 
                  'No disponible'}
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-green-700 mb-2">Humedad</h3>
              <div className="text-4xl font-bold text-green-600">
                {currentWeather.google_weather_burgos_center?.humidity ? 
                  `${currentWeather.google_weather_burgos_center.humidity}%` : 
                  'No disponible'}
              </div>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-purple-700 mb-2">Presión</h3>
              <div className="text-4xl font-bold text-purple-600">
                {currentWeather.google_weather_burgos_center?.pressure ? 
                  `${Math.round(currentWeather.google_weather_burgos_center.pressure)} hPa` : 
                  'No disponible'}
              </div>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-orange-700 mb-2">Viento</h3>
              <div className="text-2xl font-bold text-orange-600">
                {currentWeather.google_weather_burgos_center?.wind_speed ? 
                  `${Math.round(currentWeather.google_weather_burgos_center.wind_speed * 3.6)} km/h` : 
                  'No disponible'}
              </div>
              {currentWeather.google_weather_burgos_center?.wind_direction && (
                <div className="text-sm text-orange-500 mt-1">
                  {Math.round(currentWeather.google_weather_burgos_center.wind_direction)}°
                </div>
              )}
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Nubes</h3>
              <div className="text-4xl font-bold text-gray-600">
                {currentWeather.google_weather_burgos_center?.clouds !== undefined ? 
                  `${Math.round(currentWeather.google_weather_burgos_center.clouds)}%` : 
                  'No disponible'}
              </div>
            </div>

            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-indigo-700 mb-2">Descripción</h3>
              <div className="text-lg font-semibold text-indigo-600">
                {currentWeather.google_weather_burgos_center?.weather_description || 
                  'Google Weather'}
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Clock size={16} />
              <span>
                Última actualización: {lastUpdate ? formatTime(lastUpdate.toISOString()) : 'Nunca'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${schedulerStatus.running ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span>
                Recolección automática: {schedulerStatus.running ? 'Activa' : 'Pausada'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <RefreshCw size={16} />
            <span>
              {schedulerStatus.running ? `Próxima actualización en: ${formatCountdown(nextUpdate)}` : 'Recolección pausada'}
            </span>
          </div>
        </div>
      </div>

      {/* Historial */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          Historial (Últimas 30 actualizaciones)
        </h2>

        {weatherHistory.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Fecha</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Hora</th>
                  <th className="text-center py-3 px-4 font-semibold text-blue-700">Temperatura</th>
                  <th className="text-center py-3 px-4 font-semibold text-green-700">Humedad</th>
                  <th className="text-center py-3 px-4 font-semibold text-purple-700">Presión</th>
                  <th className="text-center py-3 px-4 font-semibold text-orange-700">Viento</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Nubes</th>
                </tr>
              </thead>
              <tbody>
                {weatherHistory.map((record, index) => {
                  const burgosData = record.google_weather_burgos_center;
                  
                  return (
                    <tr key={record._id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="py-3 px-4">{formatDate(record.timestamp)}</td>
                      <td className="py-3 px-4">{formatTime(record.timestamp)}</td>
                      <td className="py-3 px-4 text-center text-blue-600 font-semibold">
                        {burgosData?.temperature ? `${burgosData.temperature}°C` : '-'}
                      </td>
                      <td className="py-3 px-4 text-center text-green-600 font-semibold">
                        {burgosData?.humidity ? `${burgosData.humidity}%` : '-'}
                      </td>
                      <td className="py-3 px-4 text-center text-purple-600 font-semibold">
                        {burgosData?.pressure ? `${Math.round(burgosData.pressure)} hPa` : '-'}
                      </td>
                      <td className="py-3 px-4 text-center text-orange-600 font-semibold">
                        {burgosData?.wind_speed ? `${Math.round(burgosData.wind_speed * 3.6)} km/h` : '-'}
                      </td>
                      <td className="py-3 px-4 text-center text-gray-600 font-semibold">
                        {burgosData?.clouds !== undefined ? `${Math.round(burgosData.clouds)}%` : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No hay datos históricos disponibles</p>
        )}
      </div>
    </div>
  );
};

export default WeatherComparison;
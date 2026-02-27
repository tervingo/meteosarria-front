import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { MapContainer, TileLayer } from 'react-leaflet';
import axios from 'axios';
import { BACKEND_URI } from '../constants';
import 'leaflet/dist/leaflet.css';

// ─── Constantes ────────────────────────────────────────────────────────────────

const IBERIA_CENTER = [40.0, -3.0];
const IBERIA_BOUNDS = [[35.5, -9.5], [44.5, 4.5]];
const POLL_MS = 5000;

const VARIABLES = {
  t2m:  { label: 'Temperatura 2m', unit: '°C',  color: '#e74c3c' },
  tp:   { label: 'Precipitación',  unit: 'mm',  color: '#2980b9' },
  wind: { label: 'Viento 10m',     unit: 'm/s', color: '#27ae60' },
};

const PALETTES = {
  t2m:  'linear-gradient(to right,#0000FF,#00FFFF,#00FF00,#FFFF00,#FF8000,#FF0000)',
  tp:   'linear-gradient(to right,#FFFFFF,#ADD8E6,#0000FF,#00008B,#800080)',
  wind: 'linear-gradient(to right,#FFFFFF,#FFFF00,#FF8000,#FF0000,#8B0000)',
};

const LEGEND_TICKS = {
  t2m:  ['-10°C', '0°C', '15°C', '30°C', '45°C'],
  tp:   ['0mm',   '12mm', '25mm', '38mm', '50mm'],
  wind: ['0m/s',  '8m/s', '16m/s', '23m/s', '30m/s'],
};

const STATE_UI = {
  idle:        { text: 'Sin datos',       color: '#888' },
  downloading: { text: 'Descargando…',    color: '#f39c12' },
  processing:  { text: 'Procesando…',     color: '#8e44ad' },
  ready:       { text: 'Listo',           color: '#27ae60' },
  error:       { text: 'Error',           color: '#e74c3c' },
};

// ─── Componente ───────────────────────────────────────────────────────────────

export default function GraphcastPage() {
  const [status, setStatus] = useState({
    state: 'idle', message: '', last_run: null,
    run_date: null, run_time: null, available_steps: {},
  });
  const [selectedVar,  setSelectedVar]  = useState('t2m');
  const [selectedStep, setSelectedStep] = useState(24);
  const [launching,    setLaunching]    = useState(false);
  const [playing,      setPlaying]      = useState(false);

  const pollRef = useRef(null);
  const playRef = useRef(null);

  // ── Polling de estado ──────────────────────────────────────────────────────

  const fetchStatus = useCallback(async () => {
    try {
      const { data } = await axios.get(`${BACKEND_URI}/api/graphcast/status`);
      setStatus(data);
      if (['ready', 'error', 'idle'].includes(data.state)) {
        stopPolling();
        if (data.state === 'ready') setLaunching(false);
      }
    } catch (err) {
      console.error('Error consultando estado GraphCast:', err);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const startPolling = useCallback(() => {
    if (pollRef.current) return;
    pollRef.current = setInterval(fetchStatus, POLL_MS);
  }, [fetchStatus]);

  const stopPolling = () => {
    clearInterval(pollRef.current);
    pollRef.current = null;
  };

  useEffect(() => {
    fetchStatus();
    return stopPolling;
  }, [fetchStatus]);

  // ── Lanzar pipeline ────────────────────────────────────────────────────────

  const handleLaunch = async () => {
    if (launching) return;
    setLaunching(true);
    try {
      await axios.post(`${BACKEND_URI}/api/graphcast/run-pipeline`);
      startPolling();
    } catch (err) {
      const msg = err.response?.data?.error || err.message;
      setStatus(prev => ({ ...prev, state: 'error', message: msg }));
      setLaunching(false);
    }
  };

  // ── Play automático ────────────────────────────────────────────────────────

  const stopPlay = useCallback(() => {
    clearInterval(playRef.current);
    playRef.current = null;
    setPlaying(false);
  }, []);

  const handlePlay = useCallback(() => {
    if (playing) { stopPlay(); return; }

    // Si ya está al final, reinicia desde el principio
    setSelectedStep(prev => prev >= 240 ? 24 : prev);
    setPlaying(true);

    playRef.current = setInterval(() => {
      setSelectedStep(prev => {
        if (prev >= 240) { stopPlay(); return prev; }
        return prev + 24;
      });
    }, 5000);
  }, [playing, stopPlay]);

  // Limpieza al desmontar
  useEffect(() => () => clearInterval(playRef.current), []);

  // ── Derivados ──────────────────────────────────────────────────────────────

  const isRunning = ['downloading', 'processing'].includes(status.state);
  const stateUI   = STATE_UI[status.state] ?? STATE_UI.idle;

  const availableSteps = status.available_steps?.[selectedVar] ?? [];
  const effectiveStep  = availableSteps.includes(selectedStep)
    ? selectedStep
    : (availableSteps[0] ?? selectedStep);

  // URL de tiles: Leaflet sustituye {z}/{x}/{y}; los query params son JS
  const tileUrl = status.state === 'ready'
    ? `${BACKEND_URI}/api/graphcast/tiles/{z}/{x}/{y}?var=${selectedVar}&step=${effectiveStep}`
    : null;

  const runLabel = () => {
    if (!status.run_date || !status.run_time) return '—';
    const d = status.run_date;
    return `${d.slice(0,4)}-${d.slice(4,6)}-${d.slice(6,8)} ${status.run_time}`;
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div style={s.page}>
      <Helmet><title>AIFS – Meteosarria</title></Helmet>

      {/* Cabecera */}
      <div style={s.header}>
        <Link to="/" style={s.back}>← Inicio</Link>
        <div>
          <h1 style={s.title}>Predicción AIFS 10 días</h1>
          <p style={s.subtitle}>ECMWF AI Forecast System · Open Data · Península Ibérica · 0.25°</p>
        </div>
      </div>

      {/* Controles */}
      <div style={s.controls}>
        {/* Variables */}
        <div style={s.ctrlGroup}>
          <span style={s.ctrlLabel}>Variable</span>
          <div style={s.tabs}>
            {Object.entries(VARIABLES).map(([key, cfg]) => (
              <button
                key={key}
                onClick={() => setSelectedVar(key)}
                style={{
                  ...s.tab,
                  ...(selectedVar === key
                    ? { borderColor: cfg.color, color: cfg.color,
                        background: `${cfg.color}18` }
                    : {}),
                }}
              >
                {cfg.label}
              </button>
            ))}
          </div>
        </div>

        {/* Slider */}
        <div style={s.ctrlGroup}>
          <span style={s.ctrlLabel}>
            Horizonte:&nbsp;
            <strong style={{ color: '#fff' }}>+{effectiveStep}h</strong>
            <span style={{ color: '#90EE90', marginLeft: 6, fontSize: '0.8rem' }}>
              (día {effectiveStep / 24})
            </span>
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <input
              type="range" min={24} max={240} step={24}
              value={effectiveStep}
              onChange={e => { stopPlay(); setSelectedStep(Number(e.target.value)); }}
              style={{ ...s.slider, flex: 1 }}
              disabled={status.state !== 'ready'}
            />
            <button
              onClick={handlePlay}
              disabled={status.state !== 'ready'}
              title={playing ? 'Pausar' : 'Reproducir pronóstico día a día'}
              style={{
                ...s.playBtn,
                ...(status.state !== 'ready' ? s.playBtnOff : {}),
                ...(playing ? s.playBtnActive : {}),
              }}
            >
              {playing ? '⏸' : '▶'}
            </button>
          </div>
          <div style={s.sliderLbls}>
            <span>+1 día</span><span>+5 días</span><span>+10 días</span>
          </div>
        </div>
      </div>

      {/* Mapa */}
      <div style={s.mapWrap}>
        <MapContainer
          center={IBERIA_CENTER}
          zoom={6}
          maxBounds={IBERIA_BOUNDS}
          style={s.map}
          scrollWheelZoom
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          {tileUrl && (
            <TileLayer
              key={tileUrl}          // fuerza remontaje al cambiar var/step
              url={tileUrl}
              opacity={0.75}
              attribution="ECMWF GraphCast"
            />
          )}
        </MapContainer>

        {isRunning && (
          <div style={s.overlay}>
            <div style={s.spinner} />
            <span>{status.message || 'Procesando…'}</span>
          </div>
        )}

        {status.state === 'idle' && (
          <div style={{ ...s.overlay, background: 'rgba(15,17,23,0.55)',
                        pointerEvents: 'none', color: '#aaa', fontSize: '0.9rem' }}>
            Lanza el pipeline para ver las predicciones
          </div>
        )}
      </div>

      {/* Panel inferior */}
      <div style={s.bottom}>
        {/* Estado */}
        <div style={s.statusRow}>
          <span style={{ ...s.dot, background: stateUI.color }} />
          <span style={{ color: stateUI.color, fontWeight: 600 }}>{stateUI.text}</span>
          {status.message && (
            <span style={s.statusMsg}>{status.message}</span>
          )}
        </div>

        {/* Meta */}
        <div style={s.metaRow}>
          <span style={s.meta}>Último run: <strong>{runLabel()}</strong></span>
          {status.last_run && (
            <span style={s.meta}>
              Actualizado: <strong>
                {new Date(status.last_run).toLocaleString('es-ES')}
              </strong>
            </span>
          )}
        </div>

        {/* Botón */}
        <button
          onClick={handleLaunch}
          disabled={isRunning || launching}
          style={{ ...s.btn, ...(isRunning || launching ? s.btnOff : {}) }}
        >
          {isRunning || launching ? '⏳ Pipeline en curso…' : '🚀 Lanzar Pipeline'}
        </button>

        {/* Leyenda */}
        <div style={s.legend}>
          <span style={s.legendTitle}>
            {VARIABLES[selectedVar]?.label} — escala de colores
          </span>
          <div style={{ ...s.legendBar, background: PALETTES[selectedVar] }} />
          <div style={s.legendTicks}>
            {(LEGEND_TICKS[selectedVar] ?? []).map((lbl, i) => (
              <span key={i} style={s.legendTick}>{lbl}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const s = {
  page: {
    minHeight: '100vh', background: '#0f1117', color: '#e0e0e0',
    display: 'flex', flexDirection: 'column',
    fontFamily: 'sans-serif', padding: 16, boxSizing: 'border-box', gap: 12,
  },
  header: { display: 'flex', alignItems: 'flex-start', gap: 20 },
  back:   { color: '#90EE90', textDecoration: 'none', fontSize: '0.95rem',
            whiteSpace: 'nowrap', marginTop: 4 },
  title:  { margin: 0, fontSize: '1.5rem', fontWeight: 700, color: '#fff' },
  subtitle: { margin: '4px 0 0', fontSize: '0.85rem', color: '#aaa' },

  controls: { background: '#1a1d27', borderRadius: 8, padding: '14px 16px',
              display: 'flex', flexDirection: 'column', gap: 12 },
  ctrlGroup:{ display: 'flex', flexDirection: 'column', gap: 6 },
  ctrlLabel:{ fontSize: '0.78rem', color: '#aaa', textTransform: 'uppercase',
              letterSpacing: '0.05em' },
  tabs:     { display: 'flex', gap: 8, flexWrap: 'wrap' },
  tab: {
    background: 'transparent', border: '1px solid #444', color: '#aaa',
    borderRadius: 6, padding: '6px 14px', cursor: 'pointer',
    fontSize: '0.9rem', transition: 'all 0.15s',
  },
  slider:   { width: '100%', accentColor: '#90EE90', cursor: 'pointer' },
  sliderLbls:{ display: 'flex', justifyContent: 'space-between',
               fontSize: '0.72rem', color: '#555' },

  mapWrap:  { position: 'relative', flex: 1, minHeight: 400,
              borderRadius: 8, overflow: 'hidden', border: '1px solid #333' },
  map:      { width: '100%', height: '100%', minHeight: 400 },
  overlay:  {
    position: 'absolute', inset: 0, zIndex: 1000,
    background: 'rgba(15,17,23,0.78)',
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    gap: 12, color: '#fff', fontSize: '0.95rem',
  },
  spinner:  {
    width: 36, height: 36, borderRadius: '50%',
    border: '3px solid #333', borderTop: '3px solid #90EE90',
    animation: 'gc-spin 0.8s linear infinite',
  },

  bottom:   { background: '#1a1d27', borderRadius: 8,
              padding: '14px 16px', display: 'flex',
              flexDirection: 'column', gap: 10 },
  statusRow:{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  dot:      { width: 10, height: 10, borderRadius: '50%', flexShrink: 0 },
  statusMsg:{ color: '#aaa', fontSize: '0.85rem' },
  metaRow:  { display: 'flex', gap: 24, flexWrap: 'wrap' },
  meta:     { fontSize: '0.82rem', color: '#888' },
  btn: {
    background: '#27ae60', color: '#fff', border: 'none',
    borderRadius: 8, padding: '10px 24px', fontSize: '1rem',
    fontWeight: 600, cursor: 'pointer', alignSelf: 'flex-start',
  },
  btnOff: { background: '#444', cursor: 'not-allowed' },

  playBtn: {
    background: '#1a1d27', border: '1px solid #555', color: '#90EE90',
    borderRadius: 6, width: 36, height: 36, fontSize: '1rem',
    cursor: 'pointer', display: 'flex', alignItems: 'center',
    justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s',
  },
  playBtnOff:    { color: '#444', borderColor: '#333', cursor: 'not-allowed' },
  playBtnActive: { background: '#2c1a3a', borderColor: '#8e44ad', color: '#c39bd3' },

  legend:      { display: 'flex', flexDirection: 'column', gap: 4 },
  legendTitle: { fontSize: '0.78rem', color: '#aaa' },
  legendBar:   { height: 14, borderRadius: 4, width: '100%', maxWidth: 360 },
  legendTicks: {
    display: 'flex', justifyContent: 'space-between',
    width: '100%', maxWidth: 360,
    fontSize: '0.72rem', color: '#888',
  },
  legendTick:  { flex: 1, textAlign: 'center' },
};

// Inyectar keyframe del spinner una sola vez
if (typeof document !== 'undefined' && !document.getElementById('gc-spin-kf')) {
  const el = document.createElement('style');
  el.id = 'gc-spin-kf';
  el.textContent = '@keyframes gc-spin{to{transform:rotate(360deg)}}';
  document.head.appendChild(el);
}

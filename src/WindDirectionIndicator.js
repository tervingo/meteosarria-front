import React from 'react';
import { Typography } from '@mui/material';
import './App.css';

const WindDirectionIndicator = ({ direction }) => {
  const angleInRadians = (direction * Math.PI) / 180;
  const radius = 100; // Radius of the circle
  const triangleSize = 5; // Size of the triangle

  const x = radius + radius * Math.cos(angleInRadians) - triangleSize / 2;
  const y = radius + radius * Math.sin(angleInRadians) - triangleSize / 2;

  return (
    <div className='wind-direction-container'>
        <div className="wind-direction-indicator">
        <div className="circle">
            <div className="label north">N</div>
            <div className="label east">E</div>
            <div className="label south">S</div>
            <div className="label west">W</div>
            <div
            className="triangle"
            style={{
                top: `${y}px`,
                left: `${x}px`,
            }}
            ></div>
            <Typography variant="h4" className="center-label">
            {direction}°
            </Typography>
        </div>
        </div>
    </div>
  );
};

export default WindDirectionIndicator;
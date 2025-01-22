import React from 'react';
import { Typography } from '@mui/material';
import './App.css';

const WindDirectionIndicator = ({ direction, speed, rose }) => {
  const angleInRadians = (direction * Math.PI) / 180;
  const radius = 100; // Radius of the circle
  const triangleSize = 10; // Size of the triangle

  const x = radius + radius * Math.sin(angleInRadians) - triangleSize / 2;
  const y = radius - radius * Math.cos(angleInRadians) - triangleSize / 2;
  const circleRadius = 10; // Radius of the inner circle

  return (
    <div className='wind-direction-container'>
      <div className="wind-direction-indicator">
        <div className="circle">
          <div className="label north">N</div>
          <div className="label east">E</div>
          <div className="label south">S</div>
          <div className="label west">W</div>
          <div 
            className="circle-indicator" 
            style={{
              top: `${y}px`,
              left: `${x}px`,
              width: `${2 * circleRadius}px`, // Set width and height for circle
              height: `${2 * circleRadius}px`,
            }} 
          />
          <div className="center-labels">
            <Typography variant="h5">
              {speed} km/h
            </Typography>
            <Typography variant="h5">
              {direction}°
            </Typography>
            <Typography variant="h5">
              {rose}
            </Typography>           
          </div>
        </div>
      </div>
    </div>
  );
};

export default WindDirectionIndicator;
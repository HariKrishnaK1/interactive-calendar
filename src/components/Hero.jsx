import React from 'react';
import './Hero.css';

const Hero = ({ currentMonth, imageSrc }) => {
  const monthName = currentMonth.toLocaleString('default', { month: 'long' }).toUpperCase();
  const year = currentMonth.getFullYear();

  return (
    <div className="hero-container">
      {/* Background Image. Changes based on the Image Theme cycle */}
      <img 
        src={imageSrc} 
        alt="Theme Anchor" 
        className="hero-image"
      />
      
      {/* The blue zigzag overlay */}
      <div className="hero-overlay"></div>

      <div className="hero-text-container">
        <span className="hero-year">{year}</span>
        <span className="hero-month">{monthName}</span>
      </div>
    </div>
  );
};

export default Hero;

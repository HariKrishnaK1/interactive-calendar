import React, { useState, useEffect } from 'react';
import { Sun, Moon, Image as ImageIcon } from 'lucide-react';
import Hero from './components/Hero';
import DateGrid from './components/DateGrid';
import Notes from './components/Notes';
import './App.css';

// 🎨 Theme changes based on image
const IMAGE_THEMES = [
  {
    src: "https://images.unsplash.com/photo-1522163182402-834f871fd851?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    color: "#0EA5E9" // Blue (Mountain)
  },
  {
    src: "https://images.unsplash.com/photo-1448375240586-882707db888b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    color: "#10B981" // Green (Forest)
  },
  {
    src: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    color: "#F59E0B" // Amber (Sunset/Nature)
  }
];

function App() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedStartDate, setSelectedStartDate] = useState(null);
  const [selectedEndDate, setSelectedEndDate] = useState(null);
  
  // 🌙 Dark/light mode state
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [themeIndex, setThemeIndex] = useState(0);

  // Apply dark mode and theme colors to the document root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
    document.documentElement.style.setProperty('--primary', IMAGE_THEMES[themeIndex].color);
    
    // adjust primary-light contextually
    if(isDarkMode) {
      document.documentElement.style.setProperty('--primary-light', `${IMAGE_THEMES[themeIndex].color}33`); // 20% opacity
    } else {
      document.documentElement.style.setProperty('--primary-light', `${IMAGE_THEMES[themeIndex].color}26`); // 15% opacity
    }
  }, [isDarkMode, themeIndex]);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);
  
  const cycleTheme = () => {
    setThemeIndex((prev) => (prev + 1) % IMAGE_THEMES.length);
  };

  return (
    <div className="app-container">
      {/* Utility Toolbar for the bonus features */}
      <div className="toolbar">
        <button onClick={toggleDarkMode} className="tool-btn" aria-label="Toggle Dark Mode">
          {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <button onClick={cycleTheme} className="tool-btn" aria-label="Change Image Theme">
          <ImageIcon size={18} />
        </button>
      </div>

      {/* Visual spiral rings for physical calendar effect */}
      <div className="spiral-rings">
        {[...Array(30)].map((_, i) => (
          <div key={i} className="spiral-ring"></div>
        ))}
      </div>

      <Hero currentMonth={currentMonth} imageSrc={IMAGE_THEMES[themeIndex].src} />
      
      <div className="bottom-panel">
        <div className="notes-section">
          <Notes 
            selectedStartDate={selectedStartDate}
            selectedEndDate={selectedEndDate}
            currentMonth={currentMonth}
          />
        </div>
        <div className="calendar-section">
          <DateGrid 
            currentMonth={currentMonth}
            setCurrentMonth={setCurrentMonth}
            selectedStartDate={selectedStartDate}
            setSelectedStartDate={setSelectedStartDate}
            selectedEndDate={selectedEndDate}
            setSelectedEndDate={setSelectedEndDate}
          />
        </div>
      </div>
    </div>
  );
}

export default App;

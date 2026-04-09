import React, { useState, useEffect } from 'react';
import { Sun, Moon, Image as ImageIcon, User as UserIcon, LogOut } from 'lucide-react';
import Hero from './components/Hero';
import DateGrid from './components/DateGrid';
import Notes from './components/Notes';
import AuthModal from './components/AuthModal';
import { api } from './services/api';
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

  // 👤 User state
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('calendar_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [notesList, setNotesList] = useState([]);

  // Apply dark mode and theme colors
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

  const fetchNotes = async () => {
    if (user) {
      try {
        const data = await api.getNotes(user.id);
        setNotesList(data);
      } catch (err) {
        console.error("Failed to fetch notes:", err);
      }
    } else {
      const localNotes = JSON.parse(localStorage.getItem('local_calendar_notes') || '[]');
      setNotesList(localNotes);
    }
  };

  // Fetch API Notes Side-Effect on Login
  useEffect(() => {
    fetchNotes();
  }, [user]);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem('calendar_user', JSON.stringify(userData));
    setShowAuthModal(false);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('calendar_user');
  };

  return (
    <div className="app-container">
      <div className="toolbar">
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          {user ? (
            <>
              <span style={{ 
                fontSize: '1.05em', 
                color: '#FFFFFF', 
                fontWeight: '600',
                textShadow: '0px 2px 4px rgba(0,0,0,0.8)' 
              }}>
                Hi, {user.username}
              </span>
            </>
          ) : (
            <button onClick={() => setShowAuthModal(true)} className="text-btn">
              <UserIcon size={16} /> Login / Signup
            </button>
          )}
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => setIsDarkMode(!isDarkMode)} className="tool-btn" aria-label="Toggle Dark Mode">
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button onClick={() => setThemeIndex((prev) => (prev + 1) % IMAGE_THEMES.length)} className="tool-btn" aria-label="Change Image Theme">
            <ImageIcon size={18} />
          </button>
          {user && (
            <button onClick={handleLogout} className="tool-btn" aria-label="Logout" style={{ marginLeft: '5px' }}>
              <LogOut size={18} />
            </button>
          )}
        </div>

      </div>

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
            user={user}
            notesList={notesList}
            onNotesSaved={fetchNotes}
            openAuth={() => setShowAuthModal(true)}
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

      {showAuthModal && (
        <AuthModal 
          onClose={() => setShowAuthModal(false)} 
          onLoginSuccess={handleLoginSuccess} 
        />
      )}
    </div>
  );
}

export default App;

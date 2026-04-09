import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import './Notes.css';

const Notes = ({ selectedStartDate, selectedEndDate, currentMonth, user, notesList, onNotesSaved, openAuth }) => {
  const [localText, setLocalText] = useState('');
  const [currentNoteId, setCurrentNoteId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const debounceRef = useRef(null);

  // Generate ISO date strings safely
  const startStr = selectedStartDate ? selectedStartDate.toISOString() : null;
  const endStr = selectedEndDate ? selectedEndDate.toISOString() : null;
  const monthFallback = `month_${currentMonth.getFullYear()}_${currentMonth.getMonth()}`;

  // Find the relevant note from the backend notes list
  useEffect(() => {
    if (!user) {
      setLocalText('');
      setCurrentNoteId(null);
      return;
    }

    // Try finding exact match for date criteria
    let foundNote = null;
    if (startStr && endStr) {
      foundNote = notesList.find(n => n.startDate === startStr && n.endDate === endStr);
    } else if (startStr) {
      foundNote = notesList.find(n => n.startDate === startStr && !n.endDate);
    } else {
      foundNote = notesList.find(n => n.startDate === monthFallback);
    }

    if (foundNote) {
      setLocalText(foundNote.note);
      setCurrentNoteId(foundNote.id);
    } else {
      setLocalText('');
      setCurrentNoteId(null);
    }
  }, [startStr, endStr, monthFallback, notesList, user]);

  // Handle User Input with Debounce to API
  const handleTextChange = (e) => {
    const newText = e.target.value;
    setLocalText(newText);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Debounce pushing save to backend by 1 second
    debounceRef.current = setTimeout(async () => {
      // Don't save empty notes if we don't have one existing
      if (!newText.trim() && !currentNoteId) return;

      setIsSaving(true);
      try {
        const payload = {
          userId: user.id,
          startDate: startStr || monthFallback,
          endDate: endStr || null,
          note: newText
        };
        // Attach ID if we are updating an existing note
        if (currentNoteId) {
          payload.id = currentNoteId;
        }

        const savedNote = await api.saveNote(payload);
        if (!currentNoteId && savedNote.id) {
            setCurrentNoteId(savedNote.id);
        }
        
        onNotesSaved(); // Refresh parent list
      } catch (err) {
        console.error("Error saving note:", err);
      } finally {
        setIsSaving(false);
      }
    }, 1000);
  };

  if (!user) {
    return (
      <div className="notes-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', height: '100%' }}>
        <h3 className="notes-title" style={{ marginBottom: '15px' }}>Personal Notes</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '0.9em' }}>
          Please log in to save personalized notes, goals, or reminders attached to specific dates.
        </p>
        <button onClick={openAuth} style={{ backgroundColor: 'var(--primary)', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
          Log in or Sign up
        </button>
      </div>
    );
  }

  return (
    <div className="notes-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <h3 className="notes-title" style={{ margin: 0 }}>Notes</h3>
        {isSaving && <span style={{ fontSize: '0.7em', color: 'var(--text-secondary)' }}>Saving...</span>}
      </div>
      <div className="notes-paper">
        <textarea
          className="notes-textarea"
          value={localText}
          onChange={handleTextChange}
          placeholder="Write down specifics..."
          spellCheck="false"
        />
      </div>
    </div>
  );
};

export default Notes;

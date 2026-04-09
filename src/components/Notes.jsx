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
  useEffect(() => {    // Try finding exact match for date criteria
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
          userId: user ? user.id : 'local',
          startDate: startStr || monthFallback,
          endDate: endStr || null,
          note: newText
        };
        // Attach ID if we are updating an existing note
        if (currentNoteId) {
          payload.id = currentNoteId;
        }

        if (user) {
          const savedNote = await api.saveNote(payload);
          if (!currentNoteId && savedNote.id) {
              setCurrentNoteId(savedNote.id);
          }
        } else {
          const localNotes = JSON.parse(localStorage.getItem('local_calendar_notes') || '[]');
          
          if (currentNoteId) {
             const exactIndex = localNotes.findIndex(n => n.id === currentNoteId);
             if (exactIndex >= 0) {
                 localNotes[exactIndex].note = newText;
             } else {
                 localNotes.push({ ...payload, id: currentNoteId });
             }
          } else {
             const newId = Date.now().toString();
             localNotes.push({ ...payload, id: newId });
             setCurrentNoteId(newId);
          }
          localStorage.setItem('local_calendar_notes', JSON.stringify(localNotes));
        }
        
        onNotesSaved(); // Refresh parent list
      } catch (err) {
        console.error("Error saving note:", err);
      } finally {
        setIsSaving(false);
      }
    }, 1000);
  };

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

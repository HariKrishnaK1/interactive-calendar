import React, { useState, useEffect } from 'react';
import './Notes.css';

const Notes = ({ selectedStartDate, selectedEndDate, currentMonth }) => {
  const [note, setNote] = useState('');

  // Determine the key for local storage based on selection
  const getStorageKey = () => {
    if (selectedStartDate && selectedEndDate) {
      return `notes_range_${selectedStartDate.toISOString()}_${selectedEndDate.toISOString()}`;
    } else if (selectedStartDate) {
      return `notes_date_${selectedStartDate.toISOString()}`;
    } else {
      return `notes_month_${currentMonth.getFullYear()}_${currentMonth.getMonth()}`;
    }
  };

  const storageKey = getStorageKey();

  // Load notes when the key changes
  useEffect(() => {
    const savedNote = localStorage.getItem(storageKey);
    setNote(savedNote || '');
  }, [storageKey]);

  // Save notes on change
  const handleNoteChange = (e) => {
    const newNote = e.target.value;
    setNote(newNote);
    localStorage.setItem(storageKey, newNote);
  };

  return (
    <div className="notes-container">
      <h3 className="notes-title">Notes</h3>
      <div className="notes-paper">
        <textarea
          className="notes-textarea"
          value={note}
          onChange={handleNoteChange}
          placeholder="Write down specifics..."
          spellCheck="false"
        />
      </div>
    </div>
  );
};

export default Notes;

import React from 'react';
import { 
  format, 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  isAfter, 
  isBefore,
  addMonths,
  subMonths,
  setMonth,
  setYear,
  isToday
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './DateGrid.css';

const DateGrid = ({ 
  currentMonth, 
  setCurrentMonth, 
  selectedStartDate, 
  setSelectedStartDate, 
  selectedEndDate, 
  setSelectedEndDate 
}) => {

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const dateFormat = "d";
  const daysInGrid = eachDayOfInterval({
      start: startDate,
      end: endDate
  });

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const onDateClick = (day) => {
    if (!selectedStartDate) {
      setSelectedStartDate(day);
      setSelectedEndDate(null);
    } else if (selectedStartDate && !selectedEndDate) {
      if (isAfter(day, selectedStartDate)) {
        setSelectedEndDate(day);
      } else if (isSameDay(day, selectedStartDate)) {
        // Deselect if clicking the same day
        setSelectedStartDate(null);
      } else {
        // clicked earlier date, make it the new start
        setSelectedStartDate(day);
      }
    } else if (selectedStartDate && selectedEndDate) {
      // both selected, reset
      setSelectedStartDate(day);
      setSelectedEndDate(null);
    }
  };

  const getDayClass = (day) => {
    let classes = ["day-cell"];

    if (!isSameMonth(day, monthStart)) {
      classes.push("disabled-text");
    }

    if (isToday(day)) {
      classes.push("today-highlight");
    }

    let isSelected = false;

    if (selectedStartDate && isSameDay(day, selectedStartDate)) {
      classes.push("selected-start");
      isSelected = true;
    }
    
    if (selectedEndDate && isSameDay(day, selectedEndDate)) {
      classes.push("selected-end");
      isSelected = true;
    }

    if (selectedStartDate && selectedEndDate && isAfter(day, selectedStartDate) && isBefore(day, selectedEndDate)) {
      classes.push("selected-range");
    }

    // Color weekends (Sat, Sun are index 5, 6 in our 0-indexed mapped grid where weekStartsOn: 1)
    // Wait, let's just use getDay(), 0 is Sun, 6 is Sat
    const dayOfWeek = day.getDay();
    if (!isSelected && (dayOfWeek === 0 || dayOfWeek === 6)) {
      classes.push("weekend-text");
    }

    // Check for Holiday highlights bonus feature
    const holidays = {
      '1-1': 'New Year',
      '1-23': 'Netaji Jayanti',
      '1-26': 'Republic Day (India)',
      '2-14': 'Valentine\'s Day',
      '3-8': 'International Women\'s Day',
      '3-23': 'Shaheed Diwas',
      '4-14': 'Ambedkar Jayanti',
      '5-1': 'Labour Day',
      '6-21': 'International Yoga Day',
      '7-1': 'Doctor\'s Day (India)',
      '7-26': 'Kargil Vijay Diwas',
      '8-15': 'Independence Day (India)',
      '9-5': 'Teachers\' Day',
      '10-2': 'Gandhi Jayanti',
      '10-31': 'Halloween',
      '11-14': 'Children\'s Day',
      '12-25': 'Christmas',
      '12-31': 'New Year\'s Eve'
    };
    const holidayName = holidays[`${day.getMonth() + 1}-${day.getDate()}`];

    if (holidayName) {
      classes.push("holiday-date");
    }

    return { 
      className: classes.join(" "), 
      holidayName: holidayName 
    };
  };

  const dayNames = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

  const handleMonthChange = (e) => {
    setCurrentMonth(setMonth(currentMonth, parseInt(e.target.value)));
  };

  const handleYearChange = (e) => {
    setCurrentMonth(setYear(currentMonth, parseInt(e.target.value)));
  };

  const jumpToToday = () => {
    setCurrentMonth(new Date());
    setSelectedStartDate(null);
    setSelectedEndDate(null);
  };

  return (
    <div className="calendar-grid-container">
      {/* Top Controller for navigating months manually */}
      <div className="calendar-header">
        <button className="nav-btn" onClick={prevMonth} aria-label="Previous Month">
          <ChevronLeft size={20} />
        </button>
        <div className="current-month-display">
          <select 
            className="month-select" 
            value={currentMonth.getMonth()} 
            onChange={handleMonthChange}
          >
            {Array.from({ length: 12 }).map((_, i) => (
              <option key={i} value={i}>{format(new Date(2000, i, 1), 'MMMM')}</option>
            ))}
          </select>
          <select 
            className="year-select" 
            value={currentMonth.getFullYear()} 
            onChange={handleYearChange}
          >
            {Array.from({ length: 21 }).map((_, i) => {
              const yearValue = currentMonth.getFullYear() - 10 + i;
              return <option key={yearValue} value={yearValue}>{yearValue}</option>
            })}
          </select>
        </div>
        <button className="nav-btn" onClick={nextMonth} aria-label="Next Month">
          <ChevronRight size={20} />
        </button>
        <button className="btn-today-nav" onClick={jumpToToday} aria-label="Jump to Today">
          Today
        </button>
      </div>

      <div className="days-row">
        {dayNames.map((dayName, idx) => (
          <div key={idx} className={`day-name ${idx >= 5 ? 'weekend-text' : ''}`}>
            {dayName}
          </div>
        ))}
      </div>

      <div className="cells-grid">
        {daysInGrid.map((day, i) => {
          const dayMeta = getDayClass(day);
          return (
            <div 
              key={day.toString()} 
              className="cell-wrapper"
              onClick={() => onDateClick(day)}
            >
              <div className={dayMeta.className}>
                {format(day, dateFormat)}
                {dayMeta.holidayName && (
                  <>
                    <div className="holiday-dot"></div>
                    <span className="holiday-tooltip">{dayMeta.holidayName}</span>
                  </>
                )}
              </div>
              {/* Range connector behind the day number */}
            {selectedStartDate && selectedEndDate && isSameDay(day, selectedStartDate) && (
              <div className="range-connector start-connector" />
            )}
            {selectedStartDate && selectedEndDate && isSameDay(day, selectedEndDate) && (
              <div className="range-connector end-connector" />
            )}
            {selectedStartDate && selectedEndDate && isAfter(day, selectedStartDate) && isBefore(day, selectedEndDate) && (
              <div className="range-connector mid-connector" />
            )}
          </div>
          );
        })}
      </div>
    </div>
  );
};

export default DateGrid;

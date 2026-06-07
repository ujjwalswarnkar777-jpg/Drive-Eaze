/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight, Check } from 'lucide-react';

interface DateTimePickerProps {
  label: string;
  value: string; // ISO String or YYYY-MM-DDTHH:MM
  onChange: (newValue: string) => void;
  minDate?: string; // YYYY-MM-DD
  idPrefix?: string;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS_OF_WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export default function DateTimePicker({ label, value, onChange, minDate, idPrefix = 'dt' }: DateTimePickerProps) {
  // Parse the initial value
  const initialDateObj = value ? new Date(value) : new Date();
  
  // Local state for picker interface
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // States for calendar calculation
  const [currentYear, setCurrentYear] = useState(initialDateObj.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(initialDateObj.getMonth()); // 0-indexed

  // Internal chosen states
  const [selectedDayStr, setSelectedDayStr] = useState(''); // YYYY-MM-DD
  const [selectedHour, setSelectedHour] = useState('10'); // '01' to '12'
  const [selectedMin, setSelectedMin] = useState('00'); // '00', '15', '30', '45'
  const [selectedAmpm, setSelectedAmpm] = useState('AM');

  // Parse state from the parent prop changes
  useEffect(() => {
    if (!value) return;
    const date = new Date(value);
    if (!isNaN(date.getTime())) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      setSelectedDayStr(`${year}-${month}-${day}`);

      // Convert 24h to 12h
      let rawHour = date.getHours();
      const ampm = rawHour >= 12 ? 'PM' : 'AM';
      let displayHour = rawHour % 12;
      if (displayHour === 0) displayHour = 12;
      
      setSelectedHour(String(displayHour).padStart(2, '0'));
      
      // Nearest 15-minute slot
      const mins = date.getMinutes();
      let nearestMin = '00';
      if (mins >= 45) nearestMin = '45';
      else if (mins >= 30) nearestMin = '30';
      else if (mins >= 15) nearestMin = '15';
      
      setSelectedMin(nearestMin);
      setSelectedAmpm(ampm);
    }
  }, [value]);

  // Click outside to close helper
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Recalculate combined date and send it up to state handler
  const emitChange = (dayStr: string, hr: string, min: string, ampm: string) => {
    if (!dayStr) return;
    let hourNum = parseInt(hr, 10);
    if (isNaN(hourNum)) hourNum = 12;

    if (ampm === 'PM' && hourNum < 12) {
      hourNum += 12;
    } else if (ampm === 'AM' && hourNum === 12) {
      hourNum = 0;
    }

    const formattedHour = String(hourNum).padStart(2, '0');
    const formattedMin = String(min).padStart(2, '0');
    
    onChange(`${dayStr}T${formattedHour}:${formattedMin}`);
  };

  // Calendar render helpers
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayIndex = getFirstDayOfMonth(currentYear, currentMonth);

  // Month navigation
  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const selectDay = (day: number) => {
    const formattedMonth = String(currentMonth + 1).padStart(2, '0');
    const formattedDay = String(day).padStart(2, '0');
    const newDayStr = `${currentYear}-${formattedMonth}-${formattedDay}`;
    
    // Check minDate constraint
    if (minDate && newDayStr < minDate) {
      return; // Do nothing if earlier than minDate
    }

    setSelectedDayStr(newDayStr);
    emitChange(newDayStr, selectedHour, selectedMin, selectedAmpm);
  };

  // Human readable display text on the button trigger
  const getReadableDisplay = () => {
    if (!selectedDayStr) return 'Select Date & Time';
    const [year, month, day] = selectedDayStr.split('-');
    
    const d = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    if (isNaN(d.getTime())) return 'Select Date & Time';
    
    const formattedDate = d.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });

    return `${formattedDate}  •  ${selectedHour}:${selectedMin} ${selectedAmpm}`;
  };

  // Generate calendar cells (days of previous month, current, and next for grid perfection)
  const calendarCells = [];
  
  // Previous month padding
  const prevMonthIdx = currentMonth === 0 ? 11 : currentMonth - 1;
  const prevYearIdx = currentMonth === 0 ? currentYear - 1 : currentYear;
  const daysInPrevMonth = getDaysInMonth(prevYearIdx, prevMonthIdx);
  
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i;
    calendarCells.push({
      day: d,
      isCurrentMonth: false,
      dateString: `${prevYearIdx}-${String(prevMonthIdx + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    });
  }

  // Current month active cells
  for (let d = 1; d <= daysInMonth; d++) {
    calendarCells.push({
      day: d,
      isCurrentMonth: true,
      dateString: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    });
  }

  // Next month padding to fill out a 6-row layout grid
  const totalCellsNeeded = 42; // 6 rows * 7 columns
  const nextMonthIdx = currentMonth === 11 ? 0 : currentMonth + 1;
  const nextYearIdx = currentMonth === 11 ? currentYear + 1 : currentYear;
  let rawNextDay = 1;
  while (calendarCells.length < totalCellsNeeded) {
    calendarCells.push({
      day: rawNextDay,
      isCurrentMonth: false,
      dateString: `${nextYearIdx}-${String(nextMonthIdx + 1).padStart(2, '0')}-${String(rawNextDay).padStart(2, '0')}`
    });
    rawNextDay++;
  }

  return (
    <div className="relative w-full text-left" ref={containerRef} id={`${idPrefix}-picker-wrapper`}>
      <label className="text-xs font-mono font-medium text-gray-400 block mb-1.5 uppercase tracking-wide">
        {label} <span className="text-[#dfb15b]">*</span>
      </label>

      {/* Primary trigger button */}
      <button
        type="button"
        id={`${idPrefix}-trigger-btn`}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-[#0d0d0d] border hover:border-[#dfb15b]/60 p-3.5 rounded-lg flex items-center justify-between text-left transition-all cursor-pointer ${
          isOpen ? 'border-[#dfb15b] shadow-[0_0_12px_rgba(223,177,91,0.15)]' : 'border-[#222]'
        }`}
      >
        <div className="flex items-center gap-3">
          <CalendarIcon size={14} className="text-[#dfb15b]" />
          <span className="font-display font-bold text-xs text-white">
            {getReadableDisplay()}
          </span>
        </div>
        <Clock size={13} className="text-[#888] shrink-0" />
      </button>

      {/* Popover Card dropdown with elegant glassmorphism and slide-down transition */}
      {isOpen && (
        <div 
          className="absolute left-0 mt-2 w-full sm:w-[350px] bg-[#111111] border border-[#dfb15b]/30 rounded-xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200 backdrop-blur-md"
          id={`${idPrefix}-popover-dropdown`}
        >
          {/* TAB / REGION SELECTOR */}
          <div className="space-y-4">
            
            {/* MONTH SELECTOR BAR */}
            <div className="flex items-center justify-between border-b border-[#222] pb-2">
              <button
                type="button"
                onClick={prevMonth}
                className="p-1 hover:bg-[#222] text-gray-400 hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="font-display font-extrabold text-xs text-white tracking-widest uppercase">
                {MONTHS[currentMonth]} {currentYear}
              </span>
              <button
                type="button"
                onClick={nextMonth}
                className="p-1 hover:bg-[#222] text-gray-400 hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {/* DAY NAME LABELS */}
            <div className="grid grid-cols-7 gap-1 text-center">
              {DAYS_OF_WEEK.map((day) => (
                <span key={day} className="text-[10px] font-mono text-gray-500 font-bold uppercase">
                  {day}
                </span>
              ))}
            </div>

            {/* THE MONTH CALENDAR DAYS GRID */}
            <div className="grid grid-cols-7 gap-1 text-center">
              {calendarCells.map((cell, idx) => {
                const isSelected = selectedDayStr === cell.dateString;
                const isDisabled = minDate && cell.dateString < minDate;
                
                return (
                  <button
                    key={`${cell.dateString}-${idx}`}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => selectDay(cell.day)}
                    className={`h-7 text-[10px] font-mono rounded-md flex items-center justify-center transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#dfb15b] text-black font-extrabold shadow-md'
                        : isDisabled
                        ? 'text-gray-800 line-through opacity-30 cursor-not-allowed'
                        : cell.isCurrentMonth
                        ? 'text-gray-300 hover:bg-[#222]'
                        : 'text-gray-600 hover:bg-[#222] opacity-40'
                    }`}
                  >
                    {cell.day}
                  </button>
                );
              })}
            </div>

            {/* 12-HOUR TIME SLOTS DRAWER ACCORDION */}
            <div className="border-t border-[#222] pt-3.5 space-y-2.5">
              <span className="text-[10px] uppercase font-mono tracking-widest text-[#dfb15b] font-bold block text-left">
                [ TIME CODES ]
              </span>

              <div className="grid grid-cols-3 gap-1.5">
                {/* Hours Selection */}
                <div className="space-y-1">
                  <span className="text-[8px] font-mono text-gray-500 uppercase block text-left">Hour</span>
                  <select
                    value={selectedHour}
                    onChange={(e) => {
                      setSelectedHour(e.target.value);
                      emitChange(selectedDayStr, e.target.value, selectedMin, selectedAmpm);
                    }}
                    className="w-full bg-[#181818] border border-[#222] text-white text-[11px] font-mono p-1.5 px-2 rounded-lg cursor-pointer focus:outline-none focus:border-[#dfb15b]"
                  >
                    {['12', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11'].map((h) => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>

                {/* Minute Selection */}
                <div className="space-y-1">
                  <span className="text-[8px] font-mono text-gray-500 uppercase block text-left">Minute</span>
                  <select
                    value={selectedMin}
                    onChange={(e) => {
                      setSelectedMin(e.target.value);
                      emitChange(selectedDayStr, selectedHour, e.target.value, selectedAmpm);
                    }}
                    className="w-full bg-[#181818] border border-[#222] text-white text-[11px] font-mono p-1.5 px-2 rounded-lg cursor-pointer focus:outline-none focus:border-[#dfb15b]"
                  >
                    {['00', '15', '30', '45'].map((m) => (
                      <option key={m} value={m}>{m}m</option>
                    ))}
                  </select>
                </div>

                {/* AM/PM Switcher Toggle buttons */}
                <div className="space-y-1">
                  <span className="text-[8px] font-mono text-gray-500 uppercase block text-left">Period</span>
                  <div className="grid grid-cols-2 bg-[#181818] border border-[#222] rounded-lg p-0.5">
                    {['AM', 'PM'].map((p) => {
                      const isActive = selectedAmpm === p;
                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => {
                            setSelectedAmpm(p);
                            emitChange(selectedDayStr, selectedHour, selectedMin, p);
                          }}
                          className={`text-[9px] font-mono p-1 rounded-md transition-all cursor-pointer ${
                            isActive
                              ? 'bg-[#dfb15b] text-black font-extrabold'
                              : 'text-gray-400 hover:text-white'
                          }`}
                        >
                          {p}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Set Selection CTA */}
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-full mt-2 py-2 bg-[#1a1a1a] hover:bg-[#dfb15b] text-[#dfb15b] hover:text-black font-display font-black text-[10px] uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer"
            >
              <Check size={11} /> Confirm Pick
            </button>

          </div>
        </div>
      )}
    </div>
  );
}

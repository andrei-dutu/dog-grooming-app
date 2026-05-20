import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MonthCalendarProps {
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
}

export function MonthCalendar({ selectedDate, onSelectDate }: MonthCalendarProps) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = React.useState(today.getMonth());
  const [currentYear, setCurrentYear] = React.useState(today.getFullYear());

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const maxDate = new Date(today);
  maxDate.setDate(maxDate.getDate() + 30);

  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const isDateAvailable = (day: number) => {
    const date = new Date(currentYear, currentMonth, day);
    return date >= today && date <= maxDate;
  };

  const isToday = (day: number) => {
    return day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
  };

  const isSelected = (day: number) => {
    if (!selectedDate) return false;
    return day === selectedDate.getDate() && currentMonth === selectedDate.getMonth() && currentYear === selectedDate.getFullYear();
  };

  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  return (
    <div className="w-full max-w-md">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={goToPreviousMonth}
          className="p-2 hover:bg-[var(--color-primary-light)] rounded-full transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="font-extrabold">
          {monthNames[currentMonth]} {currentYear}
        </div>
        <button
          type="button"
          onClick={goToNextMonth}
          className="p-2 hover:bg-[var(--color-primary-light)] rounded-full transition-colors"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Day Labels */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-xs font-bold" style={{ color: 'var(--color-text-secondary)' }}>
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((day, index) => {
          if (!day) {
            return <div key={`empty-${index}`} />;
          }

          const available = isDateAvailable(day);
          const todayDate = isToday(day);
          const selected = isSelected(day);

          return (
            <button
              key={day}
              type="button"
              onClick={() => {
                if (available) {
                  onSelectDate(new Date(currentYear, currentMonth, day));
                }
              }}
              disabled={!available}
              className={`aspect-square rounded-full flex items-center justify-center font-bold transition-all ${
                selected
                  ? 'bg-[var(--color-primary)] text-white'
                  : todayDate
                  ? 'bg-[var(--color-accent)] text-[var(--color-accent-dark)]'
                  : available
                  ? 'hover:bg-[var(--color-primary-light)] hover:border-[var(--color-primary)] border border-transparent'
                  : 'text-gray-400 cursor-not-allowed opacity-40'
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Add React import at the top
import React from 'react';

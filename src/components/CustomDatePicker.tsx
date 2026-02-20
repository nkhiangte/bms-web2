
import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, CalendarDaysIcon } from '@/components/Icons';

interface CustomDatePickerProps {
    label?: string;
    name: string;
    value: string;
    onChange: (e: any) => void;
    required?: boolean;
    className?: string;
    placeholder?: string;
    minYear?: number;
    maxYear?: number;
}

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const CustomDatePicker: React.FC<CustomDatePickerProps> = ({ 
    label, 
    name, 
    value, 
    onChange, 
    required = false, 
    className = "",
    placeholder = "DD/MM/YYYY",
    minYear = 1960,
    maxYear = new Date().getFullYear() + 5
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    
    // Parse initial value or default to today
    const parseDate = (val: string) => {
        if (!val) return new Date();
        const d = new Date(val);
        return isNaN(d.getTime()) ? new Date() : d;
    };

    const [currentDate, setCurrentDate] = useState(parseDate(value)); // The date currently being viewed in calendar
    const [selectedDate, setSelectedDate] = useState<string>(value); // The actual selected value

    useEffect(() => {
        if (value) {
            setSelectedDate(value);
            setCurrentDate(parseDate(value));
        }
    }, [value]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const handleDateClick = (day: number) => {
        const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        // Adjust for timezone offset to ensure YYYY-MM-DD format is correct locally
        const offset = newDate.getTimezoneOffset();
        const adjustedDate = new Date(newDate.getTime() - (offset*60*1000));
        const dateString = adjustedDate.toISOString().split('T')[0];
        
        setSelectedDate(dateString);
        setIsOpen(false);
        
        // Mimic a native event object for compatibility with existing handleChange functions
        onChange({
            target: {
                name: name,
                value: dateString,
                type: 'date'
            }
        });
    };

    const changeMonth = (offset: number) => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
    };

    const handleYearSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newYear = parseInt(e.target.value);
        setCurrentDate(new Date(newYear, currentDate.getMonth(), 1));
    };

    const handleMonthSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newMonth = parseInt(e.target.value);
        setCurrentDate(new Date(currentDate.getFullYear(), newMonth, 1));
    };

    // Generate years for dropdown
    const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => maxYear - i);

    // Format display value (DD/MM/YYYY)
    const getDisplayValue = () => {
        if (!selectedDate) return "";
        const [y, m, d] = selectedDate.split('-');
        return `${d}/${m}/${y}`;
    };

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            {label && (
                <label className="block text-sm font-bold text-slate-800 mb-1">
                    {label} {required && <span className="text-red-600">*</span>}
                </label>
            )}
            <div className="relative group">
                <div 
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center justify-between w-full px-4 py-2 border border-slate-300 rounded-md shadow-sm bg-white cursor-pointer hover:border-sky-500 focus-within:ring-2 focus-within:ring-sky-500 transition-colors h-[42px]"
                >
                    <span className={selectedDate ? "text-slate-900" : "text-slate-400"}>
                        {getDisplayValue() || placeholder}
                    </span>
                    <CalendarDaysIcon className="w-5 h-5 text-slate-500" />
                </div>
            </div>

            {isOpen && (
                <div className="absolute z-50 mt-1 w-72 bg-white rounded-xl shadow-2xl border border-slate-200 p-4 animate-fade-in left-0 sm:left-auto">
                    {/* Header: Month/Year Selectors */}
                    <div className="flex gap-2 mb-4">
                        <select 
                            value={currentDate.getMonth()} 
                            onChange={handleMonthSelect}
                            className="w-1/2 p-1 text-sm border-slate-300 rounded focus:ring-sky-500 focus:border-sky-500 font-semibold text-slate-700 cursor-pointer"
                        >
                            {MONTHS.map((m, i) => <option key={m} value={i}>{m}</option>)}
                        </select>
                        <select 
                            value={currentDate.getFullYear()} 
                            onChange={handleYearSelect}
                            className="w-1/2 p-1 text-sm border-slate-300 rounded focus:ring-sky-500 focus:border-sky-500 font-semibold text-slate-700 cursor-pointer"
                        >
                            {years.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>

                    {/* Navigation Arrows (Optional visual aid) */}
                    <div className="flex justify-between items-center mb-2 px-1">
                        <button type="button" onClick={() => changeMonth(-1)} className="p-1 hover:bg-slate-100 rounded-full text-slate-600"><ChevronLeftIcon className="w-4 h-4"/></button>
                        <span className="text-xs font-medium text-slate-500">
                            {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
                        </span>
                        <button type="button" onClick={() => changeMonth(1)} className="p-1 hover:bg-slate-100 rounded-full text-slate-600"><ChevronRightIcon className="w-4 h-4"/></button>
                    </div>

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-1 text-center mb-2">
                        {DAYS.map(d => (
                            <div key={d} className="text-xs font-bold text-slate-400 py-1">{d}</div>
                        ))}
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center">
                        {Array.from({ length: getFirstDayOfMonth(currentDate.getFullYear(), currentDate.getMonth()) }).map((_, i) => (
                            <div key={`empty-${i}`} />
                        ))}
                        {Array.from({ length: getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth()) }).map((_, i) => {
                            const day = i + 1;
                            const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                            const isSelected = dateStr === selectedDate;
                            const isToday = dateStr === new Date().toISOString().split('T')[0];

                            return (
                                <button
                                    key={day}
                                    type="button"
                                    onClick={() => handleDateClick(day)}
                                    className={`
                                        h-8 w-8 text-sm rounded-full flex items-center justify-center transition-colors
                                        ${isSelected ? 'bg-sky-600 text-white font-bold' : 'hover:bg-sky-100 text-slate-700'}
                                        ${isToday && !isSelected ? 'border border-sky-600 font-semibold text-sky-600' : ''}
                                    `}
                                >
                                    {day}
                                </button>
                            );
                        })}
                    </div>
                    
                    {/* Footer Actions */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between">
                         <button 
                            type="button"
                            onClick={() => {
                                const today = new Date().toISOString().split('T')[0];
                                setSelectedDate(today);
                                setCurrentDate(new Date());
                                onChange({ target: { name, value: today, type: 'date' } });
                                setIsOpen(false);
                            }}
                            className="text-xs font-bold text-sky-600 hover:underline"
                        >
                            Today
                        </button>
                        <button 
                            type="button"
                            onClick={() => {
                                setSelectedDate('');
                                onChange({ target: { name, value: '', type: 'date' } });
                                setIsOpen(false);
                            }}
                            className="text-xs font-bold text-red-500 hover:underline"
                        >
                            Clear
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomDatePicker;

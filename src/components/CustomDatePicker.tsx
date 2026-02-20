
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
const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

type ViewMode = 'day' | 'year' | 'decade';

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
    const [viewMode, setViewMode] = useState<ViewMode>('day');
    const containerRef = useRef<HTMLDivElement>(null);

    const parseDate = (val: string) => {
        if (!val) return new Date();
        const d = new Date(val);
        return isNaN(d.getTime()) ? new Date() : d;
    };

    const [currentDate, setCurrentDate] = useState(parseDate(value));
    const [selectedDate, setSelectedDate] = useState<string>(value);

    const [yearWindowStart, setYearWindowStart] = useState(
        Math.floor(parseDate(value).getFullYear() / 12) * 12
    );
    const [decadeWindowStart, setDecadeWindowStart] = useState(
        Math.floor(parseDate(value).getFullYear() / 100) * 100
    );

    useEffect(() => {
        if (value) {
            const parsed = parseDate(value);
            setSelectedDate(value);
            setCurrentDate(parsed);
            setYearWindowStart(Math.floor(parsed.getFullYear() / 12) * 12);
            setDecadeWindowStart(Math.floor(parsed.getFullYear() / 100) * 100);
        }
    }, [value]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setViewMode('day');
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const handleDateClick = (day: number) => {
        const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        const offset = newDate.getTimezoneOffset();
        const adjustedDate = new Date(newDate.getTime() - (offset * 60 * 1000));
        const dateString = adjustedDate.toISOString().split('T')[0];
        setSelectedDate(dateString);
        setIsOpen(false);
        setViewMode('day');
        onChange({ target: { name, value: dateString, type: 'date' } });
    };

    const handlePrev = () => {
        if (viewMode === 'day') {
            setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
        } else if (viewMode === 'year') {
            setYearWindowStart(y => Math.max(minYear, y - 12));
        } else {
            setDecadeWindowStart(d => Math.max(Math.floor(minYear / 100) * 100, d - 100));
        }
    };

    const handleNext = () => {
        if (viewMode === 'day') {
            setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
        } else if (viewMode === 'year') {
            setYearWindowStart(y => y + 12);
        } else {
            setDecadeWindowStart(d => d + 100);
        }
    };

    const handleYearClick = (year: number) => {
        if (year < minYear || year > maxYear) return;
        setCurrentDate(new Date(year, currentDate.getMonth(), 1));
        setYearWindowStart(Math.floor(year / 12) * 12);
        setViewMode('day');
    };

    const handleDecadeClick = (startYear: number) => {
        if (startYear + 9 < minYear || startYear > maxYear) return;
        setYearWindowStart(startYear);
        setViewMode('year');
    };

    const cycleView = () => {
        if (viewMode === 'day') setViewMode('year');
        else if (viewMode === 'year') setViewMode('decade');
        else setViewMode('day');
    };

    const getDisplayValue = () => {
        if (!selectedDate) return "";
        const [y, m, d] = selectedDate.split('-');
        return `${d}/${m}/${y}`;
    };

    const getHeaderLabel = () => {
        if (viewMode === 'day') return `${MONTHS_SHORT[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
        if (viewMode === 'year') return `${yearWindowStart} – ${yearWindowStart + 11}`;
        return `${decadeWindowStart}s – ${decadeWindowStart + 90}s`;
    };

    const yearRows = Array.from({ length: 12 }, (_, i) => yearWindowStart + i);
    const decadeRows = Array.from({ length: 10 }, (_, i) => decadeWindowStart + i * 10);
    const todayStr = new Date().toISOString().split('T')[0];

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            {label && (
                <label className="block text-sm font-bold text-slate-800 mb-1">
                    {label} {required && <span className="text-red-600">*</span>}
                </label>
            )}

            <div
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between w-full px-4 py-2 border border-slate-300 rounded-md shadow-sm bg-white cursor-pointer hover:border-sky-500 focus-within:ring-2 focus-within:ring-sky-500 transition-colors h-[42px]"
            >
                <span className={selectedDate ? "text-slate-900" : "text-slate-400"}>
                    {getDisplayValue() || placeholder}
                </span>
                <CalendarDaysIcon className="w-5 h-5 text-slate-500" />
            </div>

            {isOpen && (
                <div className="absolute z-50 mt-1 bg-white rounded-xl shadow-2xl border border-slate-200 p-3 animate-fade-in left-0" style={{ width: 288 }}>

                    {/* Header */}
                    <div className="flex items-center gap-1 mb-3">
                        <button
                            type="button"
                            onClick={handlePrev}
                            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors flex-shrink-0 w-9 h-9 flex items-center justify-center"
                        >
                            {viewMode === 'decade'
                                ? <span className="text-base font-bold">«</span>
                                : <ChevronLeftIcon className="w-4 h-4" />
                            }
                        </button>

                        <button
                            type="button"
                            onClick={cycleView}
                            className="flex-1 text-sm font-bold text-sky-700 hover:bg-sky-50 rounded-lg py-1.5 px-2 transition-colors text-center"
                        >
                            {getHeaderLabel()}
                        </button>

                        <button
                            type="button"
                            onClick={handleNext}
                            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors flex-shrink-0 w-9 h-9 flex items-center justify-center"
                        >
                            {viewMode === 'decade'
                                ? <span className="text-base font-bold">»</span>
                                : <ChevronRightIcon className="w-4 h-4" />
                            }
                        </button>
                    </div>

                    {/* DAY VIEW */}
                    {viewMode === 'day' && (
                        <>
                            <div className="grid grid-cols-7 gap-1 text-center mb-1">
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
                                    const isToday = dateStr === todayStr;
                                    return (
                                        <button
                                            key={day}
                                            type="button"
                                            onClick={() => handleDateClick(day)}
                                            className={`
                                                h-8 w-8 text-sm rounded-full flex items-center justify-center mx-auto transition-colors
                                                ${isSelected ? 'bg-sky-600 text-white font-bold' : 'hover:bg-sky-100 text-slate-700'}
                                                ${isToday && !isSelected ? 'border border-sky-600 font-semibold text-sky-600' : ''}
                                            `}
                                        >
                                            {day}
                                        </button>
                                    );
                                })}
                            </div>
                        </>
                    )}

                    {/* YEAR VIEW */}
                    {viewMode === 'year' && (
                        <div className="grid grid-cols-3 gap-1.5">
                            {yearRows.map(y => {
                                const disabled = y < minYear || y > maxYear;
                                const isCurrent = y === currentDate.getFullYear();
                                return (
                                    <button
                                        key={y}
                                        type="button"
                                        onClick={() => handleYearClick(y)}
                                        disabled={disabled}
                                        className={`
                                            py-2 text-sm rounded-lg font-medium transition-colors
                                            ${isCurrent ? 'bg-sky-600 text-white font-bold' : ''}
                                            ${!isCurrent && !disabled ? 'bg-slate-100 hover:bg-sky-100 text-slate-700 cursor-pointer' : ''}
                                            ${disabled ? 'text-slate-300 cursor-not-allowed' : ''}
                                        `}
                                    >
                                        {y}
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {/* DECADE VIEW */}
                    {viewMode === 'decade' && (
                        <div className="grid grid-cols-2 gap-1.5">
                            {decadeRows.map(startY => {
                                const endY = startY + 9;
                                const disabled = endY < minYear || startY > maxYear;
                                const isCurrent = currentDate.getFullYear() >= startY && currentDate.getFullYear() <= endY;
                                return (
                                    <button
                                        key={startY}
                                        type="button"
                                        onClick={() => handleDecadeClick(startY)}
                                        disabled={disabled}
                                        className={`
                                            py-2.5 text-sm rounded-lg font-medium transition-colors
                                            ${isCurrent ? 'bg-sky-600 text-white font-bold' : ''}
                                            ${!isCurrent && !disabled ? 'bg-slate-100 hover:bg-sky-100 text-slate-700 cursor-pointer' : ''}
                                            ${disabled ? 'text-slate-300 cursor-not-allowed' : ''}
                                        `}
                                    >
                                        {startY}s–{endY}
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {/* Hint */}
                    <p className="text-center text-xs text-slate-400 mt-3 mb-0 leading-tight">
                        {viewMode === 'day' && 'Tap header to jump to year or decade'}
                        {viewMode === 'year' && '‹ › to shift years · Tap header for decades'}
                        {viewMode === 'decade' && '« » to navigate · Tap decade for years'}
                    </p>

                    {/* Footer */}
                    <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between">
                        <button
                            type="button"
                            onClick={() => {
                                const today = new Date().toISOString().split('T')[0];
                                setSelectedDate(today);
                                setCurrentDate(new Date());
                                setViewMode('day');
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
                                setViewMode('day');
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

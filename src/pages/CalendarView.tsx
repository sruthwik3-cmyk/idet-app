import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    addMonths,
    subMonths
} from 'date-fns';
import { ChevronLeft, ChevronRight, X, Calendar as CalendarIcon, Calendar } from 'lucide-react';
import { generateCalendarUrl } from '../utils/calendarUtils';

const getCategoryColor = (cat: string) => {
    const colors: Record<string, string> = {
        'Passport': '#c084fc',
        'Aadhaar Card': '#60a5fa',
        'PAN Card': '#60a5fa',
        'Life Insurance': '#34d399',
        'Driving License': '#a855f7',
        'Health Insurance Policy': '#f87171',
        'Vehicle Insurance (Car/Bike)': '#fbbf24',
        'Driving License Renewal': '#818cf8',
        'Debit/Credit Card': '#2dd4bf',
        'Other': '#94a3b8'
    };
    return colors[cat] || '#e879f9'; // Pink for Custom
};

const CalendarView: React.FC = () => {
    const { documents } = useApp();
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedDocs, setSelectedDocs] = useState<any[]>([]);

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const calendarDays = eachDayOfInterval({
        start: startDate,
        end: endDate,
    });

    const getDocumentsForDay = (date: Date) => {
        return documents.filter(doc => isSameDay(new Date(doc.expiryDate), date));
    };

    const handleDayClick = (day: Date) => {
        const docs = getDocumentsForDay(day);
        if (docs.length > 0) {
            setSelectedDate(day);
            setSelectedDocs(docs);
        } else {
            setSelectedDate(null);
            setSelectedDocs([]);
        }
    };

    return (
        <div className="animate-fade-in calendar-wrapper" style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div className="page-header" style={{ marginBottom: 0, alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 className="page-title" style={{ marginBottom: '0.5rem' }}>Calendar View</h1>
                    <p style={{ color: 'var(--text-dim)', margin: 0, fontSize: '0.95rem' }}>
                        Visualize document expiry dates across the timeline
                    </p>
                </div>

                <div className="calendar-nav-bar" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    background: 'rgba(255,255,255,0.03)',
                    padding: '0.75rem 1.25rem',
                    borderRadius: '14px',
                    border: '1px solid rgba(255,255,255,0.08)',
                    backdropFilter: 'blur(10px)'
                }}>
                    <button onClick={prevMonth} className="nav-btn">
                        <ChevronLeft size={20} />
                    </button>
                    <h2 style={{ margin: 0, fontSize: '1.1rem', minWidth: '160px', textAlign: 'center', fontWeight: 800, color: 'white', letterSpacing: '-0.02em' }}>
                        {format(currentMonth, 'MMMM yyyy').toUpperCase()}
                    </h2>
                    <button onClick={nextMonth} className="nav-btn">
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            <div className="card glass-panel calendar-card" style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', minHeight: '600px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem', marginBottom: '1rem' }}>
                    {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
                        <div key={day} className="calendar-day-header" style={{ textAlign: 'center', fontWeight: 800, fontSize: '0.75rem', color: 'var(--text-dim)', letterSpacing: '0.1em', padding: '0.5rem 0' }}>
                            {day}
                        </div>
                    ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem', flex: 1, gridAutoRows: '1fr' }}>
                    {calendarDays.map((day, idx) => {
                        const docs = getDocumentsForDay(day);
                        const isCurrentMonth = isSameMonth(day, monthStart);
                        const isToday = isSameDay(day, new Date());
                        const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;

                        return (
                            <div
                                key={idx}
                                className={`calendar-day ${!isCurrentMonth ? 'other-month' : ''} ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
                                onClick={() => handleDayClick(day)}
                                style={{
                                    background: isCurrentMonth ? 'rgba(255,255,255,0.02)' : 'transparent',
                                    border: '1px solid rgba(255,255,255,0.05)',
                                    borderRadius: '14px',
                                    padding: '1rem',
                                    minHeight: '110px',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s var(--spring)',
                                    opacity: isCurrentMonth ? 1 : 0.3,
                                    position: 'relative',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '0.5rem'
                                }}
                            >
                                <span style={{
                                    fontSize: '1rem',
                                    fontWeight: isToday ? 900 : 500,
                                    color: isToday ? 'var(--primary)' : 'white',
                                    textAlign: 'right'
                                }}>
                                    {format(day, 'd')}
                                </span>

                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: 'auto' }}>
                                    {docs.map(doc => (
                                        <div
                                            key={doc.id}
                                            style={{
                                                width: '8px',
                                                height: '8px',
                                                borderRadius: '50%',
                                                backgroundColor: getCategoryColor(doc.category),
                                                boxShadow: `0 0 8px ${getCategoryColor(doc.category)}`
                                            }}
                                            title={doc.name}
                                        />
                                    ))}
                                </div>

                                {docs.length > 0 && (
                                    <div style={{
                                        fontSize: '0.65rem',
                                        fontWeight: 800,
                                        color: 'var(--text-dim)',
                                        marginTop: '2px'
                                    }}>
                                        {docs.length} DOC{docs.length > 1 ? 'S' : ''}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Event Overlay */}
            {selectedDocs.length > 0 && (
                <div className="modal-overlay" onClick={() => setSelectedDate(null)} style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(10, 0, 40, 0.85)',
                    backdropFilter: 'blur(12px)',
                    zIndex: 1000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    animation: 'fadeIn 0.3s ease'
                }}>
                    <div className="card glass-panel" style={{
                        width: '100%', maxWidth: '500px',
                        padding: '2.5rem',
                        border: '1px solid var(--primary-glow)',
                        boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                        animation: 'fadeInUp 0.4s var(--bounce)'
                    }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>Events Detected</h3>
                                <p style={{ margin: '0.2rem 0 0', color: 'var(--text-dim)', fontSize: '0.9rem' }}>{format(selectedDate!, 'MMMM do, yyyy')}</p>
                            </div>
                            <button onClick={() => setSelectedDate(null)} className="nav-btn"><X size={20} /></button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            {selectedDocs.map(doc => {
                                const color = getCategoryColor(doc.category);
                                return (
                                    <div key={doc.id} style={{
                                        padding: '1.5rem',
                                        borderRadius: '16px',
                                        background: 'rgba(255,255,255,0.03)',
                                        border: `1px solid ${color}33`,
                                        display: 'flex',
                                        gap: '1rem',
                                        alignItems: 'center'
                                    }}>
                                        <div style={{
                                            width: '44px', height: '44px',
                                            borderRadius: '12px',
                                            background: `${color}22`,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            color: color,
                                            boxShadow: `0 0 15px ${color}22`
                                        }}>
                                            <CalendarIcon size={22} />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>{doc.name}</h4>
                                            <p style={{ margin: '0.2rem 0 0', color: 'var(--text-dim)', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>
                                                {doc.category} • {doc.priority}
                                            </p>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const url = generateCalendarUrl(doc.name, doc.expiryDate, doc.priority);
                                                window.open(url, '_blank');
                                            }}
                                            style={{
                                                background: 'rgba(255,255,255,0.05)',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                color: 'var(--primary)',
                                                padding: '0.75rem',
                                                borderRadius: '10px',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                transition: 'all 0.2s'
                                            }}
                                            title="Add to Google Calendar"
                                        >
                                            <Calendar size={20} />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .nav-btn {
                    background: transparent;
                    border: none;
                    color: white;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 0.5rem;
                    border-radius: 8px;
                    transition: all 0.2s;
                }
                .nav-btn:hover {
                    background: rgba(255,255,255,0.1);
                    transform: scale(1.1);
                }
                .calendar-day:hover {
                    background: rgba(255,255,255,0.08) !important;
                    transform: translateY(-4px);
                    border-color: rgba(255,255,255,0.2) !important;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
                }
                .calendar-day.today {
                    border-color: var(--primary) !important;
                    background: rgba(124, 58, 237, 0.05) !important;
                }
                .calendar-day.selected {
                    border-color: var(--primary) !important;
                    background: rgba(124, 58, 237, 0.1) !important;
                }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            `}</style>
        </div>
    );
};

export default CalendarView;

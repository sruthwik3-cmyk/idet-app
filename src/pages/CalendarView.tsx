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
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

const getCategoryColor = (cat: string) => {
    const colors: Record<string, string> = {
        'Personal': '#60a5fa',
        'Medical': '#f87171',
        'Legal': '#fbbf24',
        'Education': '#a78bfa',
        'Vehicle': '#fb923c',
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

    const dayStyle = (day: Date, isSelected: boolean) => {
        const isCurrentMonth = isSameMonth(day, monthStart);
        // const docs = getDocumentsForDay(day); // Removed unused variable
        // const hasDocs = docs.length > 0; // Removed unused variable

        let bg = isCurrentMonth ? 'rgba(255, 255, 255, 0.03)' : 'transparent';
        let color = isCurrentMonth ? 'var(--text-primary)' : 'var(--text-secondary)';
        let border = '1px solid rgba(255, 255, 255, 0.05)';

        if (isSelected) {
            bg = 'rgba(129, 140, 248, 0.15)';
            border = '1px solid var(--primary)';
        }

        return {
            backgroundColor: bg,
            color: color,
            border: border,
            minHeight: '100px',
            padding: '0.5rem',
            cursor: 'pointer',
            position: 'relative' as const,
            borderRadius: '8px',
            transition: 'all 0.2s'
        };
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
        <div className="animate-fade-in" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div className="page-header">
                <h1 className="page-title">Calendar View</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(255,255,255,0.05)', padding: '0.5rem 1rem', borderRadius: 'var(--radius)' }}>
                    <button onClick={prevMonth} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                        <ChevronLeft size={20} />
                    </button>
                    <h2 style={{ margin: 0, fontSize: '1.25rem', width: '150px', textAlign: 'center', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {format(currentMonth, 'MMMM yyyy')}
                    </h2>
                    <button onClick={nextMonth} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            <div className="card" style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'auto', padding: '0.75rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(100px, 1fr))', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} style={{ textAlign: 'center', fontWeight: 600, padding: '0.5rem', color: 'var(--text-secondary)' }}>
                            {day}
                        </div>
                    ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(100px, 1fr))', gap: '0.5rem', flex: 1 }}>
                    {calendarDays.map((day, idx) => {
                        const docs = getDocumentsForDay(day);
                        const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;

                        return (
                            <div
                                key={idx}
                                style={dayStyle(day, isSelected)}
                                onClick={() => handleDayClick(day)}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ fontWeight: isSameDay(day, new Date()) ? 700 : 400, color: isSameDay(day, new Date()) ? 'var(--primary)' : 'inherit' }}>
                                        {format(day, 'd')}
                                    </span>
                                    {docs.length > 0 && (
                                        <span className="badge badge-warning" style={{ fontSize: '0.6rem', padding: '0.1rem 0.3rem' }}>
                                            {docs.length}
                                        </span>
                                    )}
                                </div>
                                <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                    {docs.map(doc => {
                                        // Define category colors
                                        const getCategoryColor = (cat: string) => {
                                            const colors: Record<string, string> = {
                                                'Personal': '#60a5fa', // Blue
                                                'Medical': '#f87171', // Red
                                                'Legal': '#fbbf24', // Amber
                                                'Education': '#a78bfa', // Purple
                                                'Vehicle': '#fb923c', // Orange
                                            };
                                            return colors[cat] || '#e879f9'; // Pink for Custom
                                        };

                                        const catColor = getCategoryColor(doc.category);

                                        return (
                                            <div key={doc.id} style={{
                                                fontSize: '0.7rem',
                                                backgroundColor: `${catColor}33`, // 20% opacity
                                                color: catColor,
                                                border: `1px solid ${catColor}66`, // 40% opacity
                                                padding: '0.1rem 0.25rem',
                                                borderRadius: '4px',
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis'
                                            }}>
                                                {doc.name}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Modal for Event Details */}
            {selectedDocs.length > 0 && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }} onClick={() => setSelectedDate(null)}>
                    <div className="card" style={{ width: '100%', maxWidth: '450px', maxHeight: '85vh', overflowY: 'auto', border: '1px solid var(--primary)', boxShadow: 'var(--shadow-lg)' }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>Expiry Events <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 400 }}>({format(selectedDate!, 'MMM d, yyyy')})</span></h3>
                            <button onClick={() => setSelectedDate(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}><X size={20} /></button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {selectedDocs.map(doc => (
                                <div key={doc.id} style={{ padding: '1rem', border: `1px solid ${getCategoryColor(doc.category)}44`, borderRadius: 'var(--radius)', backgroundColor: 'rgba(255,255,255,0.03)' }}>
                                    <h4 style={{ margin: '0 0 0.5rem 0', color: getCategoryColor(doc.category) }}>{doc.name}</h4>
                                    <div style={{ fontSize: '0.875rem', display: 'grid', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                                        <div><strong style={{ color: 'var(--text-primary)' }}>Category:</strong> {doc.category}</div>
                                        <div><strong style={{ color: 'var(--text-primary)' }}>Priority:</strong> {doc.priority}</div>
                                        {doc.notes && <div><strong style={{ color: 'var(--text-primary)' }}>Notes:</strong> {doc.notes}</div>}
                                        <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px dashed var(--border)' }}>
                                            <div className="badge badge-success" style={{ background: 'rgba(52, 211, 153, 0.1)', color: '#34d399' }}>Google Calendar Event: {doc.alerts.calendarEventId}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CalendarView;

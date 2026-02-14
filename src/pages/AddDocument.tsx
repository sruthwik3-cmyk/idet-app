import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Calendar, CheckCircle, Bell } from 'lucide-react';

const AddDocument: React.FC = () => {
    const { addDocument, updateDocument, documents } = useApp();
    const navigate = useNavigate();
    const location = useLocation();

    // Check if we are in Edit Mode
    const editDoc = location.state?.document;
    const isEditMode = !!editDoc;

    // Smart Categories: Extract unique custom categories from existing documents
    const existingCustomCategories = Array.from(new Set(
        documents
            .map((d: any) => d.category)
            .filter((c: string) => !['Personal', 'Financial', 'Medical', 'Legal', 'Education', 'Vehicle'].includes(c))
    ));

    const [formData, setFormData] = useState({
        name: editDoc?.name || '',
        category: 'Personal',
        expiryDate: editDoc?.expiryDate || '',
        priority: (editDoc?.priority as 'Critical' | 'Important' | 'Optional') || 'Important',
        notes: editDoc?.notes || '',
        userGroup: (editDoc?.userGroup as 'Self' | 'Family' | 'Organization') || 'Self'
    });

    const [customCategory, setCustomCategory] = useState('');
    const [calendarUrl, setCalendarUrl] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);

    // Check for Voice Command Data
    const voiceData = location.state?.voiceData;

    // Initialize category logic for Edit Mode or Voice Mode
    useEffect(() => {
        if (editDoc) {
            const standardCategories = ['Personal', 'Financial', 'Medical', 'Legal', 'Education', 'Vehicle'];
            if (standardCategories.includes(editDoc.category)) {
                setFormData(prev => ({ ...prev, category: editDoc.category }));
            } else {
                setFormData(prev => ({ ...prev, category: 'Custom' }));
                setCustomCategory(editDoc.category);
            }
        } else if (voiceData) {
            // Auto-fill from Voice Command
            setFormData(prev => ({
                ...prev,
                name: voiceData.name,
                category: voiceData.category,
                expiryDate: voiceData.expiryDate
            }));
            if (voiceData.category === 'Custom') {
                setCustomCategory(voiceData.customCategory);
            }
        }
    }, [editDoc, voiceData]);

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const finalCategory = formData.category === 'Custom' ? customCategory : formData.category;
        const docPayload = { ...formData, category: finalCategory };

        if (isEditMode) {
            updateDocument(editDoc.id, docPayload);
            navigate('/dashboard');
        } else {
            addDocument(docPayload);
            // Generate Google Calendar Web Intent URL
            const startDate = new Date(formData.expiryDate).toISOString().replace(/-|:|\.\d\d\d/g, "");
            const endDate = new Date(new Date(formData.expiryDate).getTime() + 60 * 60 * 1000).toISOString().replace(/-|:|\.\d\d\d/g, "");
            const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`Expiry: ${formData.name}`)}&dates=${startDate}/${endDate}&details=${encodeURIComponent(`Document Category: ${finalCategory}\nNotes: ${formData.notes}\nPriority: ${formData.priority}`)}&sf=true&output=xml`;
            setCalendarUrl(url);
            setShowSuccess(true);
            window.open(url, '_blank');
        }
    };

    const getSuccessMessage = () => {
        const now = new Date();
        const todayUTC = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
        const expiry = new Date(formData.expiryDate);
        const expiryUTC = Date.UTC(expiry.getFullYear(), expiry.getMonth(), expiry.getDate());
        const diffDays = Math.floor((expiryUTC - todayUTC) / (1000 * 60 * 60 * 24));

        if (diffDays > 30) {
            return (
                <>
                    Reminders will activate once your document is within 30 days of expiry.<br />
                    We've opened Google Calendar to save your primary deadline.
                </>
            );
        }
        return (
            <>
                We've automated 30-day and 7-day Gmail reminders for you.<br />
                We've also opened Google Calendar to save your final deadline.
            </>
        );
    };

    if (showSuccess) {
        return (
            <div className="animate-fade-in" style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                <CheckCircle size={64} color="var(--success)" style={{ marginBottom: '1rem' }} />
                <h1>Document Saved!</h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>{getSuccessMessage()}</p>

                <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', maxWidth: '400px' }}>
                    <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', border: '1px solid var(--success)', textAlign: 'left', background: 'rgba(52, 211, 153, 0.05)' }}>
                        <Bell size={24} color="var(--success)" />
                        <div>
                            <strong style={{ display: 'block' }}>Gmail Alerts Active</strong>
                            <small style={{ color: 'var(--text-secondary)' }}>30-day and 7-day reminders are scheduled.</small>
                        </div>
                    </div>

                    <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', cursor: 'pointer', border: '1px solid var(--primary)', textAlign: 'left' }} onClick={() => window.open(calendarUrl, '_blank')}>
                        <Calendar size={24} color="var(--primary)" />
                        <div>
                            <strong style={{ display: 'block' }}>Add to Google Calendar</strong>
                            <small style={{ color: 'var(--text-secondary)' }}>Click to save the deadline to your schedule.</small>
                        </div>
                    </div>

                    <button className="btn-primary-full" onClick={() => navigate('/dashboard')} style={{ marginTop: '1rem' }}>
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <h1 className="page-title">{isEditMode ? 'Edit Document' : 'Add New Document'}</h1>
            </div>

            <div className="card" style={{ maxWidth: '600px', margin: '0 auto', border: '1px solid rgba(255,255,255,0.05)' }}>
                <form onSubmit={handleFormSubmit}>
                    <div className="input-group">
                        <label>Document Name</label>
                        <input
                            type="text"
                            className="input-field"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g. Passport, Insurance Policy"
                            style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'var(--border)' }}
                        />
                    </div>

                    <div className="grid-cols-3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                        <div className="input-group">
                            <label>Category</label>
                            <select
                                className="input-field"
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                            >
                                <option value="Personal" style={{ color: 'black' }}>Personal</option>
                                <option value="Financial" style={{ color: 'black' }}>Financial</option>
                                <option value="Medical" style={{ color: 'black' }}>Medical</option>
                                <option value="Legal" style={{ color: 'black' }}>Legal</option>
                                <option value="Education" style={{ color: 'black' }}>Education</option>
                                <option value="Vehicle" style={{ color: 'black' }}>Vehicle</option>
                                <option value="Custom" style={{ color: 'black', fontWeight: 'bold' }}>+ Custom Type</option>
                            </select>
                        </div>

                        <div className="input-group">
                            <label>Priority</label>
                            <select
                                className="input-field"
                                value={formData.priority}
                                onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                                style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                            >
                                <option value="Critical" style={{ color: 'black' }}>Critical</option>
                                <option value="Important" style={{ color: 'black' }}>Important</option>
                                <option value="Optional" style={{ color: 'black' }}>Optional</option>
                            </select>
                        </div>

                        <div className="input-group">
                            <label>User Group</label>
                            <select
                                className="input-field"
                                value={formData.userGroup}
                                onChange={(e) => setFormData({ ...formData, userGroup: e.target.value as any })}
                                style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                            >
                                <option value="Self" style={{ color: 'black' }}>Self</option>
                                <option value="Family" style={{ color: 'black' }}>Family</option>
                                <option value="Organization" style={{ color: 'black' }}>Organization</option>
                            </select>
                        </div>
                    </div>

                    {formData.category === 'Custom' && (
                        <div className="input-group animate-fade-in">
                            <label>Custom Category Name</label>
                            <input
                                type="text"
                                className="input-field"
                                required
                                value={customCategory}
                                onChange={(e) => setCustomCategory(e.target.value)}
                                placeholder="Enter custom category (e.g. Pet Records, Warranty)"
                                list="custom-category-suggestions"
                                style={{ background: 'rgba(129, 140, 248, 0.05)', borderColor: 'var(--primary)' }}
                            />
                            <datalist id="custom-category-suggestions">
                                {existingCustomCategories.map((cat: string, idx: number) => (
                                    <option key={idx} value={cat} />
                                ))}
                            </datalist>
                        </div>
                    )}

                    <div className="input-group">
                        <label>Expiry Date</label>
                        <input
                            type="date"
                            className="input-field"
                            required
                            value={formData.expiryDate}
                            onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                            style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'var(--border)', colorScheme: 'dark' }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.25rem' }}>
                            <small style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <CheckCircle size={12} color="var(--success)" />
                                Alerts scheduled for 7 days before expiry
                            </small>
                            {formData.expiryDate && (
                                <small style={{ color: 'var(--primary)', fontWeight: 'bold' }}>
                                    {new Date(formData.expiryDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </small>
                            )}
                        </div>
                    </div>

                    <div className="input-group">
                        <label>Notes (Optional)</label>
                        <textarea
                            className="input-field"
                            rows={3}
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'var(--border)' }}
                        />
                    </div>

                    <button type="submit" className="btn-primary-full" style={{ marginTop: '1rem' }}>
                        {isEditMode ? 'Update Document' : 'Save Document & Schedule Alerts'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddDocument;

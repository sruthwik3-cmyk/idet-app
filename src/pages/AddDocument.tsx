import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

const AddDocument: React.FC = () => {
    const { addDocument, updateDocument } = useApp();
    const navigate = useNavigate();
    const location = useLocation();

    // Check if we are in Edit Mode
    const editDoc = location.state?.document;
    const isEditMode = !!editDoc;


    const [formData, setFormData] = useState({
        name: editDoc?.name || '',
        category: 'Personal',
        expiryDate: editDoc?.expiryDate || '',
        priority: (editDoc?.priority as 'Low' | 'Medium' | 'High' | 'Critical') || 'Medium',
        notes: editDoc?.notes || '',
        userGroup: (editDoc?.userGroup as 'Self' | 'Family' | 'Organization') || 'Self'
    });

    const [customCategory, setCustomCategory] = useState('');

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

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const finalCategory = formData.category === 'Custom' ? customCategory : formData.category;
        const docPayload = { ...formData, category: finalCategory };

        if (isEditMode) {
            await updateDocument(editDoc.id, docPayload);
        } else {
            await addDocument(docPayload);
        }
        navigate('/dashboard');
    };


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

                    <div className="grid-cols-2" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="input-group">
                            <label>Category</label>
                            <select
                                className="input-field"
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                            >
                                <option value="Personal" style={{ color: 'black' }}>Personal</option>
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
                                <option value="High" style={{ color: 'black' }}>High</option>
                                <option value="Medium" style={{ color: 'black' }}>Medium</option>
                                <option value="Low" style={{ color: 'black' }}>Low</option>
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
                                style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'var(--border)' }}
                            />
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

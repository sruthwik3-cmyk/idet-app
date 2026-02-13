import React, { useState } from 'react';
import { useApp, Document } from '../context/AppContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, Shield, ArrowLeft, Zap } from 'lucide-react';

const AddDocument: React.FC = () => {
    const { addDocument, updateDocument } = useApp();
    const navigate = useNavigate();
    const location = useLocation();

    // Check if we are editing an existing document
    const editingDoc = location.state?.document as Document | undefined;

    const [formData, setFormData] = useState({
        name: editingDoc?.name || '',
        category: editingDoc?.category || 'Passport',
        expiryDate: editingDoc?.expiryDate || '',
        priority: editingDoc?.priority || 'Important',
        notes: editingDoc?.notes || '',
        userGroup: editingDoc?.userGroup || 'Self',
        customCategory: ''
    });

    const categories = [
        'Passport',
        'Aadhaar Card',
        'PAN Card',
        'Life Insurance',
        'Driving License',
        'Health Insurance Policy',
        'Vehicle Insurance (Car/Bike)',
        'Driving License Renewal',
        'Debit/Credit Card',
        'Other',
        'Custom'
    ];
    const priorities: ('Critical' | 'Important' | 'Optional')[] = ['Optional', 'Important', 'Critical'];

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const finalCategory = formData.category === 'Custom' ? formData.customCategory : formData.category;

        const submissionData = {
            name: formData.name,
            category: finalCategory,
            expiryDate: formData.expiryDate,
            priority: formData.priority as 'Critical' | 'Important' | 'Optional',
            notes: formData.notes,
            userGroup: formData.userGroup as 'Self' | 'Family' | 'Organization'
        };

        if (editingDoc) {
            await updateDocument(editingDoc.id, submissionData);
        } else {
            await addDocument(submissionData);
        }

        navigate('/dashboard');
    };

    return (
        <div className="animate-fade-in add-doc-wrapper">
            <div className="page-header">
                <div>
                    <h1 className="page-title">{editingDoc ? 'Refine Document' : 'Secure New Document'}</h1>
                    <p style={{ color: 'var(--text-dim)', margin: '0.5rem 0 0', fontSize: '1rem' }}>
                        {editingDoc ? 'Update the details for your existing security asset.' : 'Add your sensitive documents to the IDET vault for monitoring.'}
                    </p>
                </div>
                <button
                    className="btn-secondary"
                    onClick={() => navigate(-1)}
                    style={{ padding: '0.75rem 1.25rem', borderRadius: '14px', gap: '0.6rem' }}
                >
                    <ArrowLeft size={18} /> BACK
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '3rem', alignItems: 'start' }}>
                <div className="card glass-panel" style={{ padding: '3rem' }}>
                    <form onSubmit={handleFormSubmit}>
                        <div className="input-group">
                            <label>Document Name</label>
                            <input
                                type="text"
                                className="input-field"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g. Passport, Driver License"
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <div className="input-group">
                                <label>Category</label>
                                <select
                                    className="input-field"
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                >
                                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>

                            <div className="input-group">
                                <label>Expiry Date</label>
                                <input
                                    type="date"
                                    className="input-field"
                                    required
                                    value={formData.expiryDate}
                                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                                />
                            </div>
                        </div>

                        {formData.category === 'Custom' && (
                            <div className="input-group animate-fade-in">
                                <label>Custom Category Name</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    required
                                    value={formData.customCategory}
                                    onChange={(e) => setFormData({ ...formData, customCategory: e.target.value })}
                                    placeholder="Enter your custom category"
                                />
                            </div>
                        )}

                        <div className="input-group">
                            <label>Priority Protocol</label>
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                {priorities.map(p => (
                                    <button
                                        key={p}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, priority: p })}
                                        style={{
                                            flex: 1,
                                            padding: '0.75rem',
                                            borderRadius: '12px',
                                            border: '1px solid',
                                            borderColor: formData.priority === p ? 'var(--primary)' : 'rgba(255,255,255,0.08)',
                                            background: formData.priority === p ? 'var(--primary-soft)' : 'rgba(255,255,255,0.03)',
                                            color: formData.priority === p ? '#c084fc' : 'var(--text-dim)',
                                            fontWeight: 700,
                                            fontSize: '0.8rem',
                                            transition: 'all 0.3s var(--spring)',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {p.toUpperCase()}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="input-group">
                            <label>Security Notes (Optional)</label>
                            <textarea
                                className="input-field"
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                placeholder="Add additional details or security context..."
                                rows={4}
                            />
                        </div>

                        <button type="submit" className="btn-primary-full" style={{ marginTop: '1rem', height: '56px', fontSize: '1.1rem' }}>
                            {editingDoc ? 'REINFORCE DOCUMENT' : 'SECURE IN VAULT'}
                        </button>
                    </form>
                </div>

                <div className="card" style={{ padding: '2.5rem', background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.05) 0%, transparent 100%)' }}>
                    <div style={{
                        width: '60px',
                        height: '60px',
                        background: 'var(--primary-soft)',
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '1.5rem',
                        color: '#c084fc',
                        border: '1px solid var(--primary-glow)',
                        boxShadow: '0 0 15px var(--primary-soft)'
                    }}>
                        <Shield size={32} />
                    </div>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '1rem', letterSpacing: '-0.02em' }}>Vault Security Protocol</h3>
                    <p style={{ color: 'var(--text-dim)', fontSize: '0.95rem', lineHeight: 1.7, marginBottom: '2rem' }}>
                        IDET uses high-grade encryption and real-time monitoring to ensure your documents never slip through the cracks.
                    </p>

                    <ul style={{ padding: 0, margin: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        {[
                            '30-Day Early Warning System',
                            '7-Day Critical Alert Cycle',
                            'Google Calendar Synchronization',
                            'Instant Expiry Notifications',
                            'Secure Cloud Storage'
                        ].map((text, i) => (
                            <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontWeight: 600, fontSize: '0.9rem' }}>
                                <div style={{ color: 'var(--success)' }}><CheckCircle size={18} /></div>
                                {text}
                            </li>
                        ))}
                    </ul>

                    <div style={{
                        marginTop: '3rem',
                        padding: '1.5rem',
                        background: 'rgba(251, 191, 36, 0.05)',
                        border: '1px solid rgba(251, 191, 36, 0.2)',
                        borderRadius: '16px',
                        display: 'flex',
                        gap: '1rem',
                        alignItems: 'flex-start'
                    }}>
                        <Zap size={20} color="#fbbf24" style={{ marginTop: '2px' }} />
                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#fbbf24', fontWeight: 600, lineHeight: 1.5 }}>
                            IDET will automatically notify your registered email when any document enters a critical expiry window.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddDocument;

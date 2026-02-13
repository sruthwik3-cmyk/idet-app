import React, { useState } from 'react';
import { useApp, Document } from '../context/AppContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, Shield, ArrowLeft, Calendar as CalendarIcon, Info } from 'lucide-react';
import { format, parse, isValid } from 'date-fns';
import { generateCalendarUrl } from '../utils/calendarUtils';

const AddDocument: React.FC = () => {
    const { addDocument, updateDocument } = useApp();
    const navigate = useNavigate();
    const location = useLocation();

    // Check if we are editing an existing document
    const editingDoc = location.state?.document as Document | undefined;

    // Internal state for the date input string (dd-mm-yyyy)
    const [dateInput, setDateInput] = useState(
        editingDoc?.expiryDate ? format(new Date(editingDoc.expiryDate), 'dd-MM-yyyy') : ''
    );

    const [formData, setFormData] = useState({
        name: editingDoc?.name || '',
        category: editingDoc?.category || 'Passport',
        priority: editingDoc?.priority || 'Important',
        notes: editingDoc?.notes || '',
        userGroup: editingDoc?.userGroup || 'Self',
        customCategory: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

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

    // Handle date input formatting (dd-mm-yyyy mask)
    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value.replace(/\D/g, ''); // Remove non-digits
        if (val.length > 8) val = val.slice(0, 8);

        let masked = '';
        if (val.length > 0) {
            masked += val.slice(0, 2);
            if (val.length > 2) {
                masked += '-' + val.slice(2, 4);
                if (val.length > 4) {
                    masked += '-' + val.slice(4, 8);
                }
            }
        }

        setDateInput(masked);
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Parse dd-mm-yyyy back to yyyy-mm-dd for storage
        const parsedDate = parse(dateInput, 'dd-MM-yyyy', new Date());
        if (!isValid(parsedDate)) {
            alert('Please enter a valid date in DD-MM-YYYY format');
            setIsSubmitting(false);
            return;
        }

        const finalExpiryDate = format(parsedDate, 'yyyy-MM-dd');
        const finalCategory = formData.category === 'Custom' ? formData.customCategory : formData.category;

        const submissionData = {
            name: formData.name,
            category: finalCategory,
            expiryDate: finalExpiryDate,
            priority: formData.priority as 'Critical' | 'Important' | 'Optional',
            notes: formData.notes,
            userGroup: formData.userGroup as 'Self' | 'Family' | 'Organization'
        };

        try {
            let resultDoc = null;
            if (editingDoc) {
                const success = await updateDocument(editingDoc.id, submissionData);
                if (success) resultDoc = { ...submissionData, id: editingDoc.id };
            } else {
                resultDoc = await addDocument(submissionData);
            }

            if (resultDoc) {
                // AUTOMATIC GOOGLE CALENDAR OPEN
                // This works for ALL cases (whether it's <30 or >30 days)
                const calUrl = generateCalendarUrl(submissionData.name, submissionData.expiryDate, submissionData.priority);
                window.open(calUrl, '_blank');

                navigate('/dashboard');
            } else {
                setIsSubmitting(false);
            }
        } catch (err) {
            console.error(err);
            setIsSubmitting(false);
        }
    };

    return (
        <div className="animate-fade-in add-doc-wrapper" style={{ perspective: '1000px' }}>
            <div className="page-header" style={{ marginBottom: '3rem' }}>
                <div style={{ animation: 'slideInLeft 0.8s var(--spring)' }}>
                    <h1 className="page-title" style={{ fontSize: '3.5rem', marginBottom: '0.5rem', fontWeight: 900 }}>
                        {editingDoc ? 'Refine Asset' : 'Secure New Asset'}
                    </h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-dim)', background: 'rgba(139, 92, 246, 0.05)', padding: '0.5rem 1rem', borderRadius: '12px', border: '1px solid rgba(139, 92, 246, 0.1)', width: 'fit-content' }}>
                        <Shield size={16} color="var(--primary)" />
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Authenticated Vault Entry Zone</span>
                    </div>
                </div>
                <button
                    className="btn-secondary"
                    onClick={() => navigate(-1)}
                    style={{
                        padding: '1rem 2rem',
                        borderRadius: '20px',
                        gap: '0.75rem',
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        letterSpacing: '0.1em'
                    }}
                >
                    <ArrowLeft size={18} /> RETURN
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)', gap: '4rem', alignItems: 'start' }}>
                <div
                    className="card glass-panel"
                    style={{
                        padding: '3.5rem',
                        animation: 'fadeInUpStagger 0.8s 0.1s var(--spring) both',
                        border: '1px solid rgba(139, 92, 246, 0.2)',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                        position: 'relative'
                    }}
                >
                    {/* Decorative glow */}
                    <div style={{ position: 'absolute', top: 0, right: 0, width: '100px', height: '100px', background: 'radial-gradient(circle, var(--primary-soft) 0%, transparent 70%)', opacity: 0.5 }}></div>

                    <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <div className="input-group" style={{ animation: 'revealIn 0.8s 0.2s var(--spring) both' }}>
                            <label style={{ color: 'var(--primary)', marginBottom: '0.75rem', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 800 }}>Asset Label</label>
                            <input
                                type="text"
                                className="input-field"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Enter document name (e.g. My Indian Passport)"
                                style={{ fontSize: '1.2rem', padding: '1.5rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(139, 92, 246, 0.1)' }}
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem' }}>
                            <div className="input-group" style={{ animation: 'revealIn 0.8s 0.3s var(--spring) both' }}>
                                <label style={{ color: 'var(--primary)', marginBottom: '0.75rem', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 800 }}>Category</label>
                                <select
                                    className="input-field"
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    style={{ padding: '1.5rem', fontSize: '1.1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(139, 92, 246, 0.1)' }}
                                >
                                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>

                            <div className="input-group" style={{ animation: 'revealIn 0.8s 0.4s var(--spring) both' }}>
                                <label style={{ color: 'var(--primary)', marginBottom: '0.75rem', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 800 }}>Vital Expiry (DD-MM-YYYY)</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type="text"
                                        className="input-field"
                                        required
                                        autoComplete="off"
                                        value={dateInput}
                                        onChange={handleDateChange}
                                        placeholder="26-01-2030"
                                        style={{ padding: '1.5rem 1.5rem 1.5rem 3.8rem', fontSize: '1.2rem', letterSpacing: '0.08em', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(139, 92, 246, 0.1)' }}
                                    />
                                    <CalendarIcon
                                        size={22}
                                        style={{
                                            position: 'absolute',
                                            left: '1.4rem',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            color: 'var(--primary)',
                                            opacity: 0.8
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        {formData.category === 'Custom' && (
                            <div className="input-group animate-fade-in" style={{ animation: 'revealIn 0.5s var(--spring) both' }}>
                                <label style={{ color: 'var(--primary)', marginBottom: '0.75rem', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 800 }}>Custom Asset Group</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    required
                                    value={formData.customCategory}
                                    onChange={(e) => setFormData({ ...formData, customCategory: e.target.value })}
                                    placeholder="Define your custom category..."
                                    style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(139, 92, 246, 0.1)' }}
                                />
                            </div>
                        )}

                        <div className="input-group" style={{ animation: 'revealIn 0.8s 0.5s var(--spring) both' }}>
                            <label style={{ color: 'var(--primary)', marginBottom: '1rem', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 800 }}>Priority Protocol</label>
                            <div style={{ display: 'flex', gap: '1.25rem' }}>
                                {priorities.map((p) => (
                                    <button
                                        key={p}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, priority: p })}
                                        style={{
                                            flex: 1,
                                            padding: '1.2rem',
                                            borderRadius: '20px',
                                            border: '1px solid',
                                            borderColor: formData.priority === p ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                                            background: formData.priority === p ? 'rgba(139, 92, 246, 0.2)' : 'rgba(255,255,255,0.02)',
                                            color: formData.priority === p ? '#fff' : 'var(--text-dim)',
                                            fontWeight: 800,
                                            fontSize: '0.9rem',
                                            transition: 'all 0.5s var(--spring)',
                                            cursor: 'pointer',
                                            boxShadow: formData.priority === p ? '0 15px 30px -10px rgba(139, 92, 246, 0.4)' : 'none',
                                            transform: formData.priority === p ? 'scale(1.05) translateY(-5px)' : 'scale(1)'
                                        }}
                                    >
                                        {p.toUpperCase()}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="input-group" style={{ animation: 'revealIn 0.8s 0.6s var(--spring) both' }}>
                            <label style={{ color: 'var(--primary)', marginBottom: '0.75rem', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 800 }}>Security Notes (Optional)</label>
                            <textarea
                                className="input-field"
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                placeholder="Add confidential notes about this document..."
                                rows={5}
                                style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(139, 92, 246, 0.1)', fontSize: '1.1rem' }}
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn-primary-full btn-pulse"
                            disabled={isSubmitting}
                            style={{
                                marginTop: '1.5rem',
                                height: '72px',
                                fontSize: '1.4rem',
                                fontWeight: 900,
                                letterSpacing: '0.1em',
                                filter: isSubmitting ? 'grayscale(1)' : 'none',
                                opacity: isSubmitting ? 0.7 : 1,
                                textShadow: '0 2px 10px rgba(0,0,0,0.5)',
                                borderRadius: '24px'
                            }}
                        >
                            {isSubmitting ? 'ENCRYPTING...' : editingDoc ? 'UPDATE SECURITY ASSET' : 'INITIALIZE VAULT ENTRY'}
                        </button>
                    </form>
                </div>

                <div
                    style={{
                        padding: '1rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '3rem',
                        animation: 'fadeInUpStagger 0.8s 0.2s var(--spring) both'
                    }}
                >
                    <div className="card" style={{ padding: '3.5rem', background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, transparent 100%)', border: '1px solid rgba(139, 92, 246, 0.15)', borderRadius: '32px' }}>
                        <div style={{
                            width: '80px',
                            height: '80px',
                            background: 'rgba(139, 92, 246, 0.15)',
                            borderRadius: '24px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '2rem',
                            color: 'var(--primary-hover)',
                            boxShadow: '0 0 40px rgba(139, 92, 246, 0.2)',
                            border: '1px solid rgba(139, 92, 246, 0.2)'
                        }}>
                            <Shield size={42} />
                        </div>
                        <h3 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '1.5rem', letterSpacing: '-0.04em', background: 'linear-gradient(to right, #fff, var(--primary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Elite Vault Security</h3>
                        <p style={{ color: 'var(--text-dim)', fontSize: '1.1rem', lineHeight: 1.8, marginBottom: '2.5rem', fontWeight: 500 }}>
                            IDET uses high-grade cryptographic protocols to ensure your sensitive identification assets are monitored with absolute precision.
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            {[
                                { text: 'Localized DD-MM-YYYY Date Interface', active: true },
                                { text: 'Identity Mapping (Aadhaar/PAN/Voter)', active: true },
                                { text: 'Mission-Critical Expiry Monitoring', active: true },
                                { text: 'Nano-Sonic Notification Feedback', active: true }
                            ].map((item, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', fontWeight: 600, fontSize: '1rem' }}>
                                    <div style={{
                                        color: '#10b981',
                                        background: 'rgba(16, 185, 129, 0.1)',
                                        padding: '8px',
                                        borderRadius: '12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        border: '1px solid rgba(16, 185, 129, 0.2)'
                                    }}>
                                        <CheckCircle size={20} />
                                    </div>
                                    <span style={{ color: item.active ? 'var(--text)' : 'var(--text-dim)', letterSpacing: '0.02em' }}>{item.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={{
                        padding: '2.5rem',
                        background: 'rgba(59, 130, 246, 0.05)',
                        border: '1px solid rgba(59, 130, 246, 0.15)',
                        borderRadius: '32px',
                        display: 'flex',
                        gap: '2rem',
                        alignItems: 'center',
                        animation: 'floatSoft 8s ease-in-out infinite',
                        boxShadow: '0 20px 40px -15px rgba(0,0,0,0.3)'
                    }}>
                        <div style={{
                            background: 'rgba(59, 130, 246, 0.15)',
                            padding: '16px',
                            borderRadius: '20px',
                            color: '#60a5fa',
                            border: '1px solid rgba(59, 130, 246, 0.2)'
                        }}>
                            <Info size={32} />
                        </div>
                        <div>
                            <p style={{ margin: 0, fontSize: '1.1rem', color: '#60a5fa', fontWeight: 800, marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Pro Security Tip</p>
                            <p style={{ margin: 0, fontSize: '1rem', color: 'var(--text-dim)', lineHeight: 1.6, fontWeight: 500 }}>
                                Set your <strong style={{ color: '#fff' }}>priority protocols</strong> correctly to trigger the appropriate alert sequence.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .add-doc-wrapper {
                    overflow-y: auto;
                    height: calc(100vh - 4rem);
                    padding-bottom: 6rem;
                    scrollbar-width: none;
                }
                .add-doc-wrapper::-webkit-scrollbar {
                    display: none;
                }
                .input-field {
                    transition: all 0.4s var(--spring) !important;
                }
                .input-field:focus {
                    transform: scale(1.01) translateY(-2px);
                    background: rgba(139, 92, 246, 0.05) !important;
                    box-shadow: 0 10px 30px -10px rgba(139, 92, 246, 0.3) !important;
                }
                .input-field::placeholder {
                    color: rgba(148, 163, 184, 0.3);
                    font-size: 0.95rem;
                }
                .btn-primary-full:active {
                    transform: scale(0.95) !important;
                }
            `}</style>
        </div>
    );
};

export default AddDocument;

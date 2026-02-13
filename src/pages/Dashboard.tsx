import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
    LayoutDashboard,
    Search,
    Pencil,
    Trash2,
    Download,
    Zap,
    Calendar as CalendarIcon,
    User,
    Clock,
    AlertTriangle
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { SkeletonDashboard } from '../components/SkeletonCards';
import { generateCalendarUrl } from '../utils/calendarUtils';

const Dashboard: React.FC = () => {
    const { stats, documents, deleteDocument, loading } = useApp();
    const navigate = useNavigate();
    const location = useLocation();

    const [searchTerm, setSearchTerm] = useState(location.state?.searchQuery || '');
    const [selectedCategory, setSelectedCategory] = useState<string>('All');

    if (loading) {
        return <SkeletonDashboard />;
    }

    const categories = ['All', 'Critical', ...Array.from(new Set(documents.filter(d => d.category).map(d => d.category)))];

    const filteredDocs = documents
        .filter(doc => {
            const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (doc.category && doc.category.toLowerCase().includes(searchTerm.toLowerCase()));

            const matchesCategory = selectedCategory === 'All'
                ? true
                : selectedCategory === 'Critical'
                    ? doc.priority === 'Critical'
                    : doc.category === selectedCategory;

            return matchesSearch && matchesCategory;
        })
        .sort((a, b) => {
            if (a.priority === 'Critical' && b.priority !== 'Critical') return -1;
            if (a.priority !== 'Critical' && b.priority === 'Critical') return 1;
            return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
        });

    const handleDelete = async (id: string, name: string) => {
        if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
            deleteDocument(id);
        }
    };

    const handleEdit = (doc: any) => {
        navigate('/add-document', { state: { document: doc } });
    };

    const handleExport = () => {
        const headers = ["Name", "Category", "Expiry Date", "Priority", "Notes"];
        const rows = documents.map(doc => [
            `"${doc.name}"`,
            `"${doc.category}"`,
            `"${doc.expiryDate}"`,
            `"${doc.priority}"`,
            `"${doc.notes || ''}"`
        ]);

        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `my_documents_export_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const StatCard = ({ title, value, icon: Icon, color, bg }: any) => (
        <div style={{
            background: 'rgba(255,255,255,0.03)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '16px',
            padding: '1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
            position: 'relative' as const,
            overflow: 'hidden',
            cursor: 'default'
        }}
            onMouseEnter={e => {
                const el = e.currentTarget;
                el.style.transform = 'translateY(-4px)';
                el.style.borderColor = color;
                el.style.boxShadow = `0 12px 30px -10px ${bg}, 0 0 20px ${bg}`;
            }}
            onMouseLeave={e => {
                const el = e.currentTarget;
                el.style.transform = 'translateY(0)';
                el.style.borderColor = 'rgba(255,255,255,0.08)';
                el.style.boxShadow = 'none';
            }}
        >
            <div>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.82rem', fontWeight: 500, textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>{title}</p>
                <h3 style={{ margin: '0.5rem 0 0', fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>{value}</h3>
            </div>
            <div style={{
                padding: '0.85rem',
                borderRadius: '14px',
                background: `linear-gradient(135deg, ${bg}, transparent)`,
                color: color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 0 20px ${bg}`,
                border: `1px solid ${color}22`
            }}>
                <Icon size={24} />
            </div>
        </div>
    );

    return (
        <div className="animate-fade-in">
            <style>{`
                .filter-chip {
                    padding: 0.4rem 1.1rem;
                    border-radius: 999px;
                    font-size: 0.8rem;
                    cursor: pointer;
                    background: rgba(255, 255, 255, 0.04);
                    border: 1px solid rgba(255,255,255,0.08);
                    color: var(--text-secondary);
                    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                    font-weight: 500;
                    backdrop-filter: blur(8px);
                }
                .filter-chip:hover {
                    background: rgba(124, 58, 237, 0.12);
                    border-color: rgba(124, 58, 237, 0.3);
                    color: #c084fc;
                    transform: translateY(-1px);
                }
                .filter-chip.active {
                    background: linear-gradient(135deg, var(--primary), #a855f7);
                    color: white;
                    border-color: transparent;
                    box-shadow: 0 4px 15px rgba(124, 58, 237, 0.35);
                    font-weight: 600;
                }
                .doc-item {
                    background: rgba(255, 255, 255, 0.02);
                    backdrop-filter: blur(12px);
                    border: 1px solid rgba(255,255,255,0.06);
                    border-radius: 14px;
                    padding: 1.25rem 1.5rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
                    position: relative;
                    overflow: hidden;
                }
                .doc-item::before {
                    content: '';
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 3px;
                    height: 100%;
                    background: linear-gradient(180deg, var(--primary), transparent);
                    opacity: 0;
                    transition: all 0.3s ease;
                }
                .doc-item:hover {
                    border-color: rgba(124, 58, 237, 0.25);
                    background: rgba(255, 255, 255, 0.04);
                    transform: translateX(4px);
                    box-shadow: 0 4px 20px rgba(0,0,0,0.2);
                }
                .doc-item:hover::before { opacity: 1; }
                .doc-item.critical {
                    border-color: rgba(244, 63, 94, 0.25);
                    background: linear-gradient(90deg, rgba(244, 63, 94, 0.06) 0%, transparent 60%);
                }
                .doc-item.critical::before {
                    background: linear-gradient(180deg, #f43f5e, transparent);
                    opacity: 1;
                }
                .btn-action {
                    background: rgba(255, 255, 255, 0.04);
                    backdrop-filter: blur(8px);
                    border: 1px solid rgba(255,255,255,0.08);
                    border-radius: 10px;
                    padding: 0.5rem;
                    color: var(--text-secondary);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .btn-action:hover {
                    color: var(--text-primary);
                    background: rgba(255, 255, 255, 0.1);
                    transform: translateY(-2px) scale(1.05);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                    border-color: rgba(255,255,255,0.15);
                }
                .btn-action:active {
                    transform: scale(0.95);
                }
                .quick-action-card {
                    background: rgba(255, 255, 255, 0.03);
                    backdrop-filter: blur(20px) saturate(180%);
                    -webkit-backdrop-filter: blur(20px) saturate(180%);
                    border: 1px solid rgba(255,255,255,0.08);
                    border-radius: 18px;
                    padding: 1.75rem 1.25rem;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 0.85rem;
                    cursor: pointer;
                    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                    text-align: center;
                    position: relative;
                    overflow: hidden;
                }
                .quick-action-card::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 3px;
                    background: linear-gradient(90deg, var(--primary), #a855f7, var(--accent));
                    background-size: 200% auto;
                    opacity: 0;
                    transition: opacity 0.3s ease;
                }
                .quick-action-card:hover {
                    background: rgba(255, 255, 255, 0.06);
                    border-color: rgba(124, 58, 237, 0.3);
                    transform: translateY(-6px) scale(1.02);
                    box-shadow: 0 12px 30px rgba(0,0,0,0.3), 0 0 25px rgba(124, 58, 237, 0.12);
                }
                .quick-action-card:hover::before { opacity: 1; }
                .quick-action-card:active {
                    transform: translateY(-2px) scale(0.98);
                }
                .quick-action-icon {
                    padding: 1rem;
                    border-radius: 14px;
                    background: rgba(255, 255, 255, 0.04);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
                    border: 1px solid rgba(255,255,255,0.05);
                }
                .quick-action-card:hover .quick-action-icon {
                    transform: scale(1.1);
                    background: rgba(255, 255, 255, 0.07);
                }
                .glass-panel {
                    background: rgba(255, 255, 255, 0.02);
                    backdrop-filter: blur(20px) saturate(180%);
                    -webkit-backdrop-filter: blur(20px) saturate(180%);
                    border: 1px solid rgba(255,255,255,0.06);
                    border-radius: 20px;
                    padding: 2rem;
                    position: relative;
                    overflow: hidden;
                    transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .glass-panel:hover {
                    border-color: rgba(124, 58, 237, 0.15);
                    box-shadow: 0 8px 30px rgba(0,0,0,0.2);
                }
                .glass-panel::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 3px;
                    background: linear-gradient(90deg, var(--primary), #a855f7, var(--accent));
                    background-size: 200% auto;
                    opacity: 0;
                    transition: opacity 0.3s ease;
                }
                .glass-panel:hover::before { opacity: 1; }
                .search-input {
                    background: rgba(0,0,0,0.25);
                    backdrop-filter: blur(8px);
                    border: 1px solid rgba(255,255,255,0.08);
                    border-radius: 50px;
                    padding: 0.55rem 1rem 0.55rem 2.5rem;
                    color: white;
                    width: 240px;
                    font-size: 0.88rem;
                    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .search-input:focus {
                    outline: none;
                    border-color: var(--primary);
                    box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.15), 0 0 20px rgba(124, 58, 237, 0.08);
                    background: rgba(0,0,0,0.35);
                    width: 280px;
                }
                @keyframes staggerIn {
                    from { opacity: 0; transform: translateY(12px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>

            <div className="page-header" style={{ marginBottom: '2rem' }}>
                <div>
                    <h1 className="page-title" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Dashboard</h1>
                    <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.95rem' }}>Welcome back, overview of your documents.</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button
                        onClick={handleExport}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            padding: '0.65rem 1.25rem', borderRadius: '12px',
                            background: 'rgba(255,255,255,0.04)',
                            backdropFilter: 'blur(8px)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            color: 'var(--text-secondary)',
                            cursor: 'pointer',
                            fontWeight: 500, fontSize: '0.9rem',
                            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                            e.currentTarget.style.borderColor = 'rgba(124, 58, 237, 0.3)';
                            e.currentTarget.style.color = '#c084fc';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                            e.currentTarget.style.color = 'var(--text-secondary)';
                            e.currentTarget.style.transform = 'translateY(0)';
                        }}
                    >
                        <Download size={18} /> Export CSV
                    </button>
                    <button
                        className="btn-primary-full"
                        style={{ width: 'auto', marginBottom: 0, padding: '0.65rem 1.5rem', borderRadius: '12px', fontWeight: 600 }}
                        onClick={() => navigate('/add-document')}
                    >
                        + Add New
                    </button>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid-cols-4" style={{ marginBottom: '2.5rem', gap: '1.25rem' }}>
                <StatCard title="Total Documents" value={stats.total} icon={LayoutDashboard} color="#a5b4fc" bg="rgba(165, 180, 252, 0.15)" />
                <StatCard title="Active" value={stats.active} icon={Clock} color="#34d399" bg="rgba(52, 211, 153, 0.15)" />
                <StatCard title="Expiring Soon" value={stats.expiringSoon} icon={AlertTriangle} color="#fbbf24" bg="rgba(251, 191, 36, 0.15)" />
                <StatCard title="Expired" value={stats.expired} icon={AlertTriangle} color="#f87171" bg="rgba(248, 113, 113, 0.15)" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2rem' }}>
                {/* Left Column: Documents */}
                <div className="glass-panel">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, letterSpacing: '-0.01em' }}>Your Documents</h3>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="text"
                                className="search-input"
                                placeholder="Search documents..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.4, color: '#a1a1aa' }} />
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
                        {categories.map(cat => (
                            <div key={cat} className={`filter-chip ${selectedCategory === cat ? 'active' : ''}`} onClick={() => setSelectedCategory(cat)}>
                                {cat}
                            </div>
                        ))}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {filteredDocs.length > 0 ? filteredDocs.map((doc, idx) => {
                            const expiry = new Date(doc.expiryDate);
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                            const isExpired = diffDays < 0;
                            const isCritical = doc.priority === 'Critical' || isExpired;

                            return (
                                <div key={doc.id} className={`doc-item ${isCritical ? 'critical' : ''}`}
                                    style={{ animation: `staggerIn 0.4s ${idx * 0.06}s cubic-bezier(0.16, 1, 0.3, 1) both` }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
                                            <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1.05rem' }}>{doc.name}</span>
                                            {doc.priority === 'Critical' && (
                                                <span style={{
                                                    background: 'linear-gradient(135deg, rgba(244, 63, 94, 0.2), rgba(244, 63, 94, 0.1))',
                                                    color: '#fb7185',
                                                    padding: '3px 10px',
                                                    borderRadius: '8px',
                                                    fontSize: '0.68rem',
                                                    fontWeight: 700,
                                                    textTransform: 'uppercase' as const,
                                                    letterSpacing: '0.06em',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '4px',
                                                    border: '1px solid rgba(244, 63, 94, 0.2)',
                                                    boxShadow: '0 0 10px rgba(244, 63, 94, 0.15)'
                                                }}>
                                                    <Zap size={10} /> Critical
                                                </span>
                                            )}
                                        </div>
                                        <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                                            <span style={{
                                                color: isExpired ? '#f43f5e' : diffDays <= 7 ? '#fbbf24' : '#34d399',
                                                fontWeight: 600
                                            }}>
                                                {isExpired ? `Expired ${Math.abs(diffDays)} days ago` : `Expires in ${diffDays} days`}
                                            </span>
                                            <span style={{ opacity: 0.2 }}>•</span>
                                            <span>({new Date(doc.expiryDate).toLocaleDateString()})</span>
                                            <span style={{ opacity: 0.2 }}>•</span>
                                            <span style={{
                                                background: 'rgba(255, 255, 255, 0.05)',
                                                padding: '2px 10px',
                                                borderRadius: '6px',
                                                fontSize: '0.72rem',
                                                border: '1px solid rgba(255,255,255,0.06)'
                                            }}>{doc.category}</span>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                                        <button
                                            className="btn-action"
                                            title="Add to Google Calendar"
                                            onClick={() => window.open(generateCalendarUrl(doc.name, doc.expiryDate, doc.priority), '_blank')}
                                            style={{
                                                fontSize: '0.78rem', padding: '0.4rem 0.85rem', gap: '0.4rem',
                                                background: 'rgba(99, 102, 241, 0.1)', color: '#818cf8',
                                                borderColor: 'rgba(99, 102, 241, 0.2)',
                                                fontWeight: 600
                                            }}
                                        >
                                            Cal Event
                                        </button>
                                        <button onClick={() => handleEdit(doc)} className="btn-action" title="Edit"><Pencil size={17} /></button>
                                        <button onClick={() => handleDelete(doc.id, doc.name)} className="btn-action" style={{ color: '#f87171' }} title="Delete"><Trash2 size={17} /></button>
                                    </div>
                                </div>
                            );
                        }) : (
                            <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-secondary)' }}>
                                <LayoutDashboard size={48} style={{ opacity: 0.08, marginBottom: '1rem' }} />
                                <p style={{ fontSize: '0.95rem' }}>No documents found.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Quick Actions — Glossy Container */}
                <div className="glass-panel">
                    <h3 style={{ margin: '0 0 1.5rem', fontSize: '1.2rem', fontWeight: 700, letterSpacing: '-0.01em' }}>Quick Actions</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.85rem' }}>
                        <div className="quick-action-card" onClick={() => navigate('/calendar')}
                            style={{ animation: 'staggerIn 0.4s 0.1s cubic-bezier(0.16, 1, 0.3, 1) both' }}>
                            <div className="quick-action-icon" style={{ color: '#818cf8', boxShadow: '0 0 15px rgba(129, 140, 248, 0.1)' }}>
                                <CalendarIcon size={24} />
                            </div>
                            <span style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--text-primary)' }}>Calendar</span>
                        </div>
                        <div className="quick-action-card" onClick={() => navigate('/alerts')}
                            style={{ animation: 'staggerIn 0.4s 0.15s cubic-bezier(0.16, 1, 0.3, 1) both' }}>
                            <div className="quick-action-icon" style={{ color: '#fbbf24', boxShadow: '0 0 15px rgba(251, 191, 36, 0.1)' }}>
                                <AlertTriangle size={24} />
                            </div>
                            <span style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--text-primary)' }}>Alerts</span>
                        </div>
                        <div className="quick-action-card" onClick={() => navigate('/profile')}
                            style={{ animation: 'staggerIn 0.4s 0.2s cubic-bezier(0.16, 1, 0.3, 1) both' }}>
                            <div className="quick-action-icon" style={{ color: '#34d399', boxShadow: '0 0 15px rgba(52, 211, 153, 0.1)' }}>
                                <User size={24} />
                            </div>
                            <span style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--text-primary)' }}>Profile</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;

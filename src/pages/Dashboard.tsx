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
        <div className="card stat-card-premium" style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            cursor: 'pointer'
        }}>
            <div>
                <p style={{ margin: 0, color: 'var(--text-dim)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</p>
                <h3 style={{ margin: '0.4rem 0 0', fontSize: '2.2rem', fontWeight: 900, color: 'white', letterSpacing: '-0.03em' }}>{value}</h3>
            </div>
            <div className="stat-icon-wrapper" style={{
                padding: '0.9rem',
                borderRadius: '14px',
                background: `linear-gradient(135deg, ${bg}, transparent)`,
                color: color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 0 20px ${bg}`,
                border: `1px solid ${color}33`,
                animation: 'float 3s ease-in-out infinite'
            }}>
                <Icon size={26} />
            </div>
        </div>
    );

    return (
        <div className="animate-fade-in dashboard-wrapper">
            <div className="page-header" style={{ marginBottom: '2.5rem' }}>
                <div>
                    <h1 className="page-title">Dashboard</h1>
                    <p style={{ color: 'var(--text-dim)', margin: '0.5rem 0 0', fontSize: '1rem', fontWeight: 500 }}>
                        Elevate your document management with IDET.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        onClick={handleExport}
                        className="btn-secondary"
                        style={{ padding: '0.75rem 1.5rem', borderRadius: '14px' }}
                    >
                        <Download size={18} /> <span>Export CSV</span>
                    </button>
                    <button
                        className="btn-primary-full"
                        style={{ width: 'auto', marginBottom: 0, padding: '0.75rem 1.75rem', borderRadius: '14px' }}
                        onClick={() => navigate('/add-document')}
                    >
                        + Add Document
                    </button>
                </div>
            </div>

            {/* Stat Cards Section */}
            <div className="grid-cols-4" style={{ marginBottom: '3rem', gap: '1.5rem' }}>
                <StatCard title="Total Vault" value={stats.total} icon={LayoutDashboard} color="#a5b4fc" bg="rgba(165, 180, 252, 0.15)" />
                <StatCard title="Active Guards" value={stats.active} icon={Clock} color="#34d399" bg="rgba(52, 211, 153, 0.15)" />
                <StatCard title="Critical Alert" value={stats.expiringSoon} icon={Zap} color="#fbbf24" bg="rgba(251, 191, 36, 0.15)" />
                <StatCard title="Security Breach" value={stats.expired} icon={AlertTriangle} color="#f87171" bg="rgba(248, 113, 113, 0.15)" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2.5rem' }}>
                {/* Documents Vault */}
                <div className="card glass-panel" style={{ padding: '2.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.02em' }}>Document Vault</h3>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="text"
                                className="input-field search-input"
                                placeholder="Search vault..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{
                                    borderRadius: '50px',
                                    paddingLeft: '2.8rem',
                                    width: '280px',
                                    fontSize: '0.9rem'
                                }}
                            />
                            <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
                        {categories.map(cat => (
                            <div key={cat} className={`filter-chip ${selectedCategory === cat ? 'active' : ''}`} onClick={() => setSelectedCategory(cat)}>
                                {cat}
                            </div>
                        ))}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {filteredDocs.length > 0 ? filteredDocs.map((doc) => {
                            const expiry = new Date(doc.expiryDate);
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                            const isExpired = diffDays < 0;
                            const isCritical = doc.priority === 'Critical' || isExpired;

                            return (
                                <div key={doc.id} className={`doc-item ${isCritical ? 'critical' : ''}`}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.6rem' }}>
                                            <span style={{ fontWeight: 800, color: 'white', fontSize: '1.1rem' }}>{doc.name}</span>
                                            {doc.priority === 'Critical' && (
                                                <span className="badge badge-danger">
                                                    <Zap size={10} /> CRITICAL
                                                </span>
                                            )}
                                        </div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                                            <span style={{
                                                color: isExpired ? '#f43f5e' : diffDays <= 7 ? '#fbbf24' : '#34d399',
                                                fontWeight: 700,
                                                letterSpacing: '0.02em'
                                            }}>
                                                {isExpired ? `EXPIRED ${Math.abs(diffDays)}d AGO` : `EXPIRES IN ${diffDays}d`}
                                            </span>
                                            <span style={{ opacity: 0.3 }}>•</span>
                                            <span style={{ fontWeight: 500 }}>{new Date(doc.expiryDate).toLocaleDateString()}</span>
                                            <span style={{ opacity: 0.3 }}>•</span>
                                            <span style={{
                                                background: 'rgba(255, 255, 255, 0.06)',
                                                padding: '3px 12px',
                                                borderRadius: '6px',
                                                fontSize: '0.75rem',
                                                border: '1px solid rgba(255,255,255,0.08)',
                                                fontWeight: 600,
                                                textTransform: 'uppercase'
                                            }}>{doc.category}</span>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center' }}>
                                        <button
                                            className="btn-action"
                                            title="Sync with Calendar"
                                            onClick={() => window.open(generateCalendarUrl(doc.name, doc.expiryDate, doc.priority), '_blank')}
                                            style={{
                                                fontSize: '0.8rem', padding: '0.5rem 1rem', gap: '0.4rem',
                                                background: 'rgba(124, 58, 237, 0.15)', color: '#c084fc',
                                                borderColor: 'rgba(124, 58, 237, 0.3)',
                                                fontWeight: 700
                                            }}
                                        >
                                            CAL SYNC
                                        </button>
                                        <button onClick={() => handleEdit(doc)} className="btn-action" title="Edit Vault"><Pencil size={18} /></button>
                                        <button onClick={() => handleDelete(doc.id, doc.name)} className="btn-action" style={{ color: '#f87171' }} title="Remove"><Trash2 size={18} /></button>
                                    </div>
                                </div>
                            );
                        }) : (
                            <div style={{ textAlign: 'center', padding: '5rem 2rem', color: 'var(--text-dim)' }}>
                                <LayoutDashboard size={64} style={{ opacity: 0.05, marginBottom: '1.5rem' }} />
                                <p style={{ fontSize: '1.1rem', fontWeight: 500 }}>No documents secured in vault.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Access Central */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div className="card glass-panel" style={{ padding: '2rem' }}>
                        <h3 style={{ margin: '0 0 1.5rem', fontSize: '1.3rem', fontWeight: 800, letterSpacing: '-0.02em' }}>Quick Access</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                            <div className="quick-action-card" onClick={() => navigate('/calendar')}>
                                <div className="quick-action-icon" style={{ color: '#818cf8', background: 'rgba(129, 140, 248, 0.1)' }}>
                                    <CalendarIcon size={24} />
                                </div>
                                <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>CALENDAR</span>
                            </div>
                            <div className="quick-action-card" onClick={() => navigate('/alerts')}>
                                <div className="quick-action-icon" style={{ color: '#fbbf24', background: 'rgba(251, 191, 36, 0.1)' }}>
                                    <AlertTriangle size={24} />
                                </div>
                                <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>ALERTS</span>
                            </div>
                            <div className="quick-action-card" onClick={() => navigate('/profile')}>
                                <div className="quick-action-icon" style={{ color: '#34d399', background: 'rgba(52, 211, 153, 0.1)' }}>
                                    <User size={24} />
                                </div>
                                <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>PROFILE</span>
                            </div>
                        </div>
                    </div>

                    <div className="card" style={{ padding: '2rem', background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.1), transparent)' }}>
                        <h4 style={{ margin: '0 0 1rem', fontSize: '1.1rem', fontWeight: 700 }}>System Status</h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--success)', fontSize: '0.9rem', fontWeight: 600 }}>
                            <div style={{ width: '8px', height: '8px', background: 'var(--success)', borderRadius: '50%', boxShadow: '0 0 10px var(--success)' }}></div>
                            ALL PROTOCOLS ACTIVE
                        </div>
                        <p style={{ margin: '0.75rem 0 0', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                            IDET is monitoring your documents for upcoming expiry dates.
                        </p>
                    </div>
                </div>
            </div>
            <style>{`
                .dashboard-wrapper {
                    padding-bottom: 4rem;
                }
                .filter-chip {
                    padding: 0.5rem 1.25rem;
                    border-radius: 999px;
                    font-size: 0.85rem;
                    cursor: pointer;
                    background: rgba(255, 255, 255, 0.04);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    color: var(--text-dim);
                    transition: all 0.3s var(--spring);
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.03em;
                }
                .filter-chip:hover {
                    background: rgba(124, 58, 237, 0.15);
                    border-color: rgba(124, 58, 237, 0.3);
                    color: white;
                    transform: translateY(-2px);
                }
                .filter-chip.active {
                    background: linear-gradient(135deg, var(--primary), #a855f7);
                    color: white;
                    border-color: transparent;
                    box-shadow: 0 4px 20px rgba(124, 58, 237, 0.4);
                    transform: translateY(-2px);
                }
                .doc-item {
                    background: rgba(255, 255, 255, 0.02);
                    border: 1px solid rgba(255, 255, 255, 0.06);
                    border-radius: 16px;
                    padding: 1.5rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    transition: all 0.4s var(--spring);
                    position: relative;
                    overflow: hidden;
                }
                .doc-item::before {
                    content: '';
                    position: absolute;
                    left: 0; top: 0;
                    width: 4px; height: 100%;
                    background: var(--primary);
                    opacity: 0;
                    transition: all 0.3s ease;
                }
                .doc-item:hover {
                    background: rgba(255, 255, 255, 0.05);
                    border-color: rgba(124, 58, 237, 0.2);
                    transform: translateX(6px);
                    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
                }
                .doc-item:hover::before { opacity: 1; }
                .doc-item.critical {
                    border-color: rgba(244, 63, 94, 0.2);
                    background: linear-gradient(90deg, rgba(244, 63, 94, 0.06) 0%, transparent 100%);
                }
                .doc-item.critical::before { background: var(--accent); opacity: 1; }
                
                .btn-action {
                    background: rgba(255, 255, 255, 0.04);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 12px;
                    padding: 0.6rem;
                    color: var(--text-dim);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.25s var(--spring);
                }
                .btn-action:hover {
                    color: white;
                    background: rgba(255, 255, 255, 0.1);
                    transform: translateY(-2px);
                    border-color: rgba(255, 255, 255, 0.15);
                }
                .quick-action-card {
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.07);
                    border-radius: 16px;
                    padding: 1.5rem 1rem;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 0.75rem;
                    cursor: pointer;
                    transition: all 0.4s var(--spring);
                    text-align: center;
                }
                .quick-action-card:hover {
                    background: rgba(255, 255, 255, 0.06);
                    border-color: var(--primary);
                    transform: translateY(-6px);
                    box-shadow: 0 12px 30px rgba(0,0,0,0.3);
                }
                .quick-action-icon {
                    padding: 1rem;
                    border-radius: 14px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.3s var(--bounce);
                }
                .quick-action-card:hover .quick-action-icon {
                    transform: scale(1.15) rotate(5deg);
                }
            `}</style>
        </div>
    );
};

export default Dashboard;

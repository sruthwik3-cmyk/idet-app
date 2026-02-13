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
        <div className="card" style={{
            background: 'var(--card-bg)',
            border: '1px solid var(--border)',
            padding: '1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
        }}>
            <div>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500 }}>{title}</p>
                <h3 style={{ margin: '0.5rem 0 0', fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>{value}</h3>
            </div>
            <div style={{
                padding: '0.75rem',
                borderRadius: '12px',
                background: bg || 'rgba(255,255,255,0.03)',
                color: color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <Icon size={24} />
            </div>
        </div>
    );

    return (
        <div className="animate-fade-in">
            <style>{`
                .filter-chip {
                    padding: 0.35rem 1rem;
                    border-radius: 999px;
                    font-size: 0.8rem;
                    cursor: pointer;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid var(--border);
                    color: var(--text-secondary);
                    transition: all 0.2s ease;
                }
                .filter-chip:hover {
                    background: rgba(255, 255, 255, 0.1);
                }
                .filter-chip.active {
                    background: var(--primary);
                    color: white;
                    border-color: var(--primary);
                }
                .doc-item {
                    background: rgba(255, 255, 255, 0.02);
                    border: 1px solid var(--border);
                    border-radius: 12px;
                    padding: 1.25rem;
                    display: flex;
                    justify-content: space-between;
                    alignItems: center;
                    transition: all 0.2s ease;
                }
                .doc-item:hover {
                    border-color: var(--primary);
                    background: rgba(255, 255, 255, 0.04);
                }
                .doc-item.critical {
                    border-color: rgba(244, 63, 94, 0.3);
                    background: linear-gradient(90deg, rgba(244, 63, 94, 0.05) 0%, rgba(244, 63, 94, 0) 100%);
                }
                .btn-action {
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid var(--border);
                    border-radius: 8px;
                    padding: 0.5rem;
                    color: var(--text-secondary);
                    cursor: pointer;
                    display: flex;
                    alignItems: center;
                    justifyContent: center;
                    transition: all 0.2s ease;
                }
                .btn-action:hover {
                    color: var(--text-primary);
                    background: rgba(255, 255, 255, 0.1);
                }
                .quick-action-card {
                    background: rgba(255, 255, 255, 0.02);
                    border: 1px solid var(--border);
                    border-radius: 16px;
                    padding: 1.5rem;
                    display: flex;
                    flex-direction: column;
                    alignItems: center;
                    justifyContent: center;
                    gap: 0.75rem;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    text-align: center;
                }
                .quick-action-card:hover {
                    background: rgba(255, 255, 255, 0.05);
                    border-color: var(--primary);
                    transform: translateY(-2px);
                }
                .quick-action-icon {
                    padding: 1rem;
                    border-radius: 12px;
                    background: rgba(255, 255, 255, 0.03);
                    display: flex;
                    alignItems: center;
                    justifyContent: center;
                }
            `}</style>

            <div className="page-header" style={{ marginBottom: '2rem' }}>
                <div>
                    <h1 className="page-title" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Dashboard</h1>
                    <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Welcome back, overview of your documents.</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button
                        className="btn-secondary"
                        onClick={handleExport}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.25rem', borderRadius: '10px' }}
                    >
                        <Download size={18} /> Export CSV
                    </button>
                    <button
                        className="btn-primary-full"
                        style={{ width: 'auto', marginBottom: 0, padding: '0.6rem 1.5rem', borderRadius: '10px', fontWeight: 600 }}
                        onClick={() => navigate('/add-document')}
                    >
                        + Add New
                    </button>
                </div>
            </div>

            <div className="grid-cols-4" style={{ marginBottom: '2.5rem', gap: '1.25rem' }}>
                <StatCard title="Total Documents" value={stats.total} icon={LayoutDashboard} color="#a5b4fc" bg="rgba(165, 180, 252, 0.1)" />
                <StatCard title="Active" value={stats.active} icon={Clock} color="#34d399" bg="rgba(52, 211, 153, 0.1)" />
                <StatCard title="Expiring Soon" value={stats.expiringSoon} icon={AlertTriangle} color="#fbbf24" bg="rgba(251, 191, 36, 0.1)" />
                <StatCard title="Expired" value={stats.expired} icon={AlertTriangle} color="#f87171" bg="rgba(248, 113, 113, 0.1)" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '2rem' }}>
                {/* Left Column: Documents */}
                <div className="card" style={{ padding: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Your Documents</h3>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="text"
                                placeholder="Search documents..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{
                                    background: 'rgba(0, 0, 0, 0.2)',
                                    border: '1px solid var(--border)',
                                    borderRadius: '50px',
                                    padding: '0.5rem 1rem',
                                    paddingLeft: '2.5rem',
                                    color: 'white',
                                    width: '240px',
                                    fontSize: '0.9rem'
                                }}
                            />
                            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
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
                        {filteredDocs.length > 0 ? filteredDocs.map(doc => {
                            const expiry = new Date(doc.expiryDate);
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                            const isExpired = diffDays < 0;
                            const isCritical = doc.priority === 'Critical' || isExpired;

                            return (
                                <div key={doc.id} className={`doc-item ${isCritical ? 'critical' : ''}`}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.4rem' }}>
                                            <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '1.05rem' }}>{doc.name}</span>
                                            {doc.priority === 'Critical' && (
                                                <span style={{
                                                    background: 'rgba(244, 63, 94, 0.2)',
                                                    color: '#fb7185',
                                                    padding: '2px 8px',
                                                    borderRadius: '6px',
                                                    fontSize: '0.7rem',
                                                    fontWeight: 700,
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.05em',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '4px'
                                                }}>
                                                    <Zap size={10} /> Critical
                                                </span>
                                            )}
                                        </div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <span style={{ color: isExpired ? '#f43f5e' : diffDays <= 7 ? '#fbbf24' : '#34d399' }}>
                                                {isExpired ? `Expired ${Math.abs(diffDays)} days ago` : `Expires in ${diffDays} days`}
                                            </span>
                                            <span style={{ opacity: 0.3 }}>•</span>
                                            <span>({new Date(doc.expiryDate).toLocaleDateString()})</span>
                                            <span style={{ opacity: 0.3 }}>•</span>
                                            <span style={{
                                                background: 'rgba(255, 255, 255, 0.05)',
                                                padding: '2px 8px',
                                                borderRadius: '4px',
                                                fontSize: '0.75rem'
                                            }}>{doc.category}</span>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                        <button
                                            className="btn-action"
                                            title="Add to Google Calendar"
                                            onClick={() => window.open(generateCalendarUrl(doc.name, doc.expiryDate, doc.priority), '_blank')}
                                            style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem', gap: '0.4rem', background: 'rgba(99, 102, 241, 0.1)', color: '#818cf8', borderColor: 'rgba(99, 102, 241, 0.2)' }}
                                        >
                                            Cal Event
                                        </button>
                                        <button onClick={() => handleEdit(doc)} className="btn-action" title="Edit"><Pencil size={18} /></button>
                                        <button onClick={() => handleDelete(doc.id, doc.name)} className="btn-action" style={{ color: 'var(--danger)' }} title="Delete"><Trash2 size={18} /></button>
                                    </div>
                                </div>
                            );
                        }) : (
                            <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-secondary)' }}>
                                <LayoutDashboard size={48} style={{ opacity: 0.1, marginBottom: '1rem' }} />
                                <p>No documents found matching your criteria.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Quick Actions */}
                <div>
                    <h3 style={{ margin: '0 0 1.5rem', fontSize: '1.25rem' }}>Quick Actions</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                        <div className="quick-action-card" onClick={() => navigate('/calendar')}>
                            <div className="quick-action-icon" style={{ color: '#818cf8' }}>
                                <CalendarIcon size={24} />
                            </div>
                            <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>Calendar</span>
                        </div>
                        <div className="quick-action-card" onClick={() => navigate('/alerts')}>
                            <div className="quick-action-icon" style={{ color: '#fbbf24' }}>
                                <AlertTriangle size={24} />
                            </div>
                            <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>Alerts</span>
                        </div>
                        <div className="quick-action-card" onClick={() => navigate('/profile')}>
                            <div className="quick-action-icon" style={{ color: '#34d399' }}>
                                <User size={24} />
                            </div>
                            <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>Profile</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;

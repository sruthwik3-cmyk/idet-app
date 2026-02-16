import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { FileText, Clock, AlertTriangle, CheckCircle, Trash2, Pencil, Siren, Download, RefreshCw, Volume2 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { SkeletonDashboard } from '../components/SkeletonCards';
import { unlockAudioContext } from '../utils/soundUtils';

const Dashboard: React.FC = () => {
    const { stats, documents, deleteDocument, loading, refreshAlerts } = useApp();
    const navigate = useNavigate();
    const location = useLocation();

    // Initialize search from Voice Command if present
    const [searchTerm, setSearchTerm] = useState(location.state?.searchQuery || '');
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [audioUnlocked, setAudioUnlocked] = useState(false);

    // Unlock audio on mount
    useEffect(() => {
        const handleClick = async () => {
            await unlockAudioContext();
            setAudioUnlocked(true);
            console.log('[Dashboard] Audio context unlocked');
        };
        
        // Try to unlock on first click
        document.addEventListener('click', handleClick, { once: true });
        
        return () => {
            document.removeEventListener('click', handleClick);
        };
    }, []);


    if (loading) {
        return <SkeletonDashboard />;
    }

    // Get unique categories for filters
    const categories = ['All', 'Critical', ...Array.from(new Set(documents.map(d => d.category)))];

    // Show documents that match search and filter
    const filteredDocs = documents
        .filter(doc => {
            const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                doc.category.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesCategory = selectedCategory === 'All'
                ? true
                : selectedCategory === 'Critical'
                    ? doc.priority === 'Critical'
                    : doc.category === selectedCategory;

            return matchesSearch && matchesCategory;
        })
        .sort((a, b) => {
            // Critical items always on top
            if (a.priority === 'Critical' && b.priority !== 'Critical') return -1;
            if (a.priority !== 'Critical' && b.priority === 'Critical') return 1;
            // Then by date
            return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
        })
        .slice(0, 10); // Show up to 10 recent/upcoming docs

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

    const StatCard = ({ title, value, icon: Icon, color, gradient }: any) => (
        <div className="card" style={{
            background: 'var(--card-bg)',
            border: '1px solid rgba(255,255,255,0.05)',
            position: 'relative',
            overflow: 'hidden'
        }}>
            <div style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '60px',
                height: '60px',
                background: gradient,
                filter: 'blur(40px)',
                opacity: 0.2
            }}></div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
                <div>
                    <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{title}</p>
                    <h3 style={{ margin: '0.5rem 0 0', fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>{value}</h3>
                </div>
                <div style={{
                    padding: '0.75rem',
                    borderRadius: '12px',
                    background: 'rgba(255,255,255,0.05)',
                    color: color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <Icon size={24} />
                </div>
            </div>
        </div>
    );

    return (
        <div className="animate-fade-in">
            <style>{`
                @keyframes pulse-red {
                    0% { box-shadow: 0 0 0 0 rgba(248, 113, 113, 0.4); border-color: rgba(248, 113, 113, 0.4); }
                    70% { box-shadow: 0 0 0 6px rgba(248, 113, 113, 0); border-color: rgba(248, 113, 113, 0.8); }
                    100% { box-shadow: 0 0 0 0 rgba(248, 113, 113, 0); border-color: rgba(248, 113, 113, 0.4); }
                }
                .high-alert {
                    animation: pulse-red 2s infinite;
                    background: linear-gradient(90deg, rgba(248, 113, 113, 0.05) 0%, rgba(0,0,0,0) 100%);
                }
                .recent-alert-badge {
                    background: rgba(248, 113, 113, 0.2);
                    color: #f87171;
                    padding: 2px 6px;
                    border-radius: 4px;
                    font-size: 0.7rem;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    border: 1px solid rgba(248, 113, 113, 0.3);
                }
                .filter-chip {
                    padding: 0.25rem 0.75rem;
                    border-radius: 20px;
                    font-size: 0.8rem;
                    cursor: pointer;
                    background: rgba(255,255,255,0.05);
                    border: 1px solid rgba(255,255,255,0.1);
                    color: var(--text-secondary);
                    transition: all 0.2s;
                    user-select: none;
                }
                .filter-chip.active {
                    background: var(--primary);
                    color: white;
                    border-color: var(--primary);
                }
                .filter-chip:hover:not(.active) {
                    background: rgba(255,255,255,0.1);
                }
            `}</style>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Dashboard</h1>
                    {!audioUnlocked && (
                        <p style={{ color: 'var(--warning)', fontSize: '0.875rem', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Volume2 size={16} /> Click anywhere to enable sound alerts
                        </p>
                    )}
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        className="btn-secondary"
                        onClick={refreshAlerts}
                        title="Check for due alerts now"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}
                    >
                        <RefreshCw size={16} /> Sync Alerts
                    </button>
                    <button
                        className="btn-secondary"
                        onClick={handleExport}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}
                    >
                        <Download size={16} /> Export CSV
                    </button>
                    <button className="btn-primary-full btn-pulse" style={{ width: 'auto', marginBottom: 0 }} onClick={() => navigate('/add-document')}>
                        + Add New
                    </button>
                </div>
            </div>

            <div className="grid-cols-4" style={{ marginBottom: '2rem' }}>
                <StatCard
                    title="Total Documents"
                    value={stats.total}
                    icon={FileText}
                    color="#818cf8"
                    gradient="linear-gradient(135deg, #818cf8 0%, #c084fc 100%)"
                />
                <StatCard
                    title="Active"
                    value={stats.active}
                    icon={Clock}
                    color="#34d399"
                    gradient="linear-gradient(135deg, #34d399 0%, #6ee7b7 100%)"
                />
                <StatCard
                    title="Expiring Soon"
                    value={stats.expiringSoon}
                    icon={AlertTriangle}
                    color="#fbbf24"
                    gradient="linear-gradient(135deg, #fbbf24 0%, #fcd34d 100%)"
                />
                <StatCard
                    title="Expired"
                    value={stats.expired}
                    icon={AlertTriangle}
                    color="#f87171"
                    gradient="linear-gradient(135deg, #f87171 0%, #fca5a5 100%)"
                />
            </div>

            <div className="grid-cols-2">
                <div className="card" style={{ border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>Your Documents</h3>
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
                                    fontSize: '0.875rem',
                                    outline: 'none',
                                    width: '200px',
                                    transition: 'all 0.2s'
                                }}
                            />
                            <div style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                        {categories.map(cat => (
                            <div
                                key={cat}
                                className={`filter-chip ${selectedCategory === cat ? 'active' : ''}`}
                                onClick={() => setSelectedCategory(cat)}
                            >
                                {cat}
                            </div>
                        ))}
                    </div>

                    {filteredDocs.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {filteredDocs.map(doc => {
                                // Also update visual display loop to match strict logic for consistency if needed, 
                                // but existing Math.ceil is usually fine. 
                                // Let's try to match the strict logic for the visual label too.
                                const expiryDate = new Date(doc.expiryDate);
                                const todayDate = new Date();
                                const expiryUTC = Date.UTC(expiryDate.getFullYear(), expiryDate.getMonth(), expiryDate.getDate());
                                const todayUTC = Date.UTC(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate());
                                const strictDaysLeft = Math.floor((expiryUTC - todayUTC) / (1000 * 60 * 60 * 24));

                                const isCritical = doc.priority === 'Critical';

                                return (
                                    <div key={doc.id} style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '1rem',
                                        backgroundColor: 'rgba(255,255,255,0.03)',
                                        borderRadius: 'var(--radius)',
                                        border: isCritical ? '1px solid #f87171' : '1px solid rgba(255,255,255,0.05)',
                                        transition: 'all 0.2s'
                                    }} className={`doc-item ${isCritical ? 'high-alert' : ''}`}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                                            <div>
                                                <div style={{ fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    {doc.name}
                                                    {isCritical && (
                                                        <span className="badge" style={{
                                                            background: '#f87171',
                                                            color: 'white',
                                                            fontSize: '0.7rem',
                                                            fontWeight: 'bold',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '4px',
                                                            animation: 'none'
                                                        }}>
                                                            <Siren size={12} /> CRITICAL
                                                        </span>
                                                    )}
                                                    {strictDaysLeft <= 7 && strictDaysLeft >= 0 && (
                                                        <span className="recent-alert-badge">
                                                            <AlertTriangle size={10} /> Expiring Soon
                                                        </span>
                                                    )}
                                                </div>
                                                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                                                    <span style={{ color: strictDaysLeft <= 30 ? '#f87171' : '#34d399', fontWeight: strictDaysLeft <= 30 ? 'bold' : 'normal' }}>
                                                        {strictDaysLeft < 0 ? `Expired ${Math.abs(strictDaysLeft)} days ago` : `Expires in ${strictDaysLeft} days`}
                                                        <span style={{ opacity: 0.6, fontWeight: 'normal', marginLeft: '4px', color: 'var(--text-secondary)' }}>
                                                            ({new Date(doc.expiryDate).toLocaleDateString('en-GB')})
                                                        </span>
                                                    </span>
                                                    <span>•</span>
                                                    {(() => {
                                                        const getCategoryColor = (cat: string) => {
                                                            const colors: Record<string, string> = {
                                                                'Personal': '#60a5fa',
                                                                'Financial': '#34d399',
                                                                'Medical': '#f87171',
                                                                'Legal': '#fbbf24',
                                                                'Education': '#a78bfa',
                                                                'Vehicle': '#fb923c',
                                                            };
                                                            return colors[cat] || '#e879f9';
                                                        };
                                                        const catColor = getCategoryColor(doc.category);
                                                        return (
                                                            <span style={{
                                                                fontSize: '0.75rem',
                                                                padding: '2px 8px',
                                                                borderRadius: '4px',
                                                                backgroundColor: `${catColor}33`,
                                                                color: catColor,
                                                                border: `1px solid ${catColor}66`
                                                            }}>
                                                                {doc.category}
                                                            </span>
                                                        );
                                                    })()}
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                                                {doc.alerts.emailSent30 && <span className="badge badge-success" style={{ fontSize: '0.7rem', background: 'rgba(52, 211, 153, 0.1)', color: '#34d399', border: '1px solid rgba(52, 211, 153, 0.2)' }}>30d Alert</span>}
                                                {doc.alerts.emailSent7 && <span className="badge badge-success" style={{ fontSize: '0.7rem', background: 'rgba(52, 211, 153, 0.1)', color: '#34d399', border: '1px solid rgba(52, 211, 153, 0.2)' }}>7d Alert</span>}
                                                <span className="badge badge-success" style={{ fontSize: '0.7rem', background: 'rgba(96, 165, 250, 0.1)', color: '#60a5fa', border: '1px solid rgba(96, 165, 250, 0.2)' }}>Cal Event</span>
                                            </div>

                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleEdit(doc); }}
                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '4px', borderRadius: '4px', transition: 'background 0.2s' }}
                                                    className="action-btn"
                                                    title="Edit Document"
                                                >
                                                    <Pencil size={16} />
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleDelete(doc.id, doc.name); }}
                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f87171', padding: '4px', borderRadius: '4px', transition: 'background 0.2s' }}
                                                    className="action-btn"
                                                    title="Delete Document"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius)' }}>
                            <CheckCircle size={48} style={{ marginBottom: '1rem', opacity: 0.2 }} />
                            <p>No documents found.</p>
                        </div>
                    )}
                </div>

                <div className="card" style={{ border: '1px solid rgba(255,255,255,0.05)' }}>
                    <h3 style={{ marginTop: 0, marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Quick Actions</h3>
                    <div className="grid-cols-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                        <div
                            className="card"
                            onClick={() => navigate('/calendar')}
                            style={{
                                padding: '1.5rem',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '1rem',
                                cursor: 'pointer',
                                background: 'linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
                                border: '1px solid rgba(255,255,255,0.05)',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            <div style={{
                                padding: '12px',
                                borderRadius: '12px',
                                background: 'rgba(129, 140, 248, 0.15)',
                                color: '#818cf8',
                                marginBottom: '0.5rem'
                            }}>
                                <Clock size={24} />
                            </div>
                            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Calendar</span>
                        </div>

                        <div
                            className="card"
                            onClick={() => navigate('/alerts')}
                            style={{
                                padding: '1.5rem',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '1rem',
                                cursor: 'pointer',
                                background: 'linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
                                border: '1px solid rgba(255,255,255,0.05)',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            <div style={{
                                padding: '12px',
                                borderRadius: '12px',
                                background: 'rgba(251, 191, 36, 0.15)',
                                color: '#fbbf24',
                                marginBottom: '0.5rem'
                            }}>
                                <AlertTriangle size={24} />
                            </div>
                            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Alerts</span>
                        </div>

                        <div
                            className="card"
                            onClick={() => navigate('/profile')}
                            style={{
                                padding: '1.5rem',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '1rem',
                                cursor: 'pointer',
                                background: 'linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
                                border: '1px solid rgba(255,255,255,0.05)',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            <div style={{
                                padding: '12px',
                                borderRadius: '12px',
                                background: 'rgba(52, 211, 153, 0.15)',
                                color: '#34d399',
                                marginBottom: '0.5rem'
                            }}>
                                <FileText size={24} />
                            </div>
                            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Profile</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;

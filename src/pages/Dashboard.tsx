import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { LayoutDashboard, Bell, Search, Pencil, Trash2, Download, Zap, ShieldCheck } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { SkeletonDashboard } from '../components/SkeletonCards';

const Dashboard: React.FC = () => {
    const { stats, documents, deleteDocument, loading } = useApp();
    const navigate = useNavigate();
    const location = useLocation();

    const [searchTerm, setSearchTerm] = useState(location.state?.searchQuery || '');
    const [selectedCategory, setSelectedCategory] = useState<string>('All');

    if (loading) {
        return <SkeletonDashboard />;
    }

    const categories = ['All', 'Critical', ...Array.from(new Set(documents.map(d => d.category)))];

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
            if (a.priority === 'Critical' && b.priority !== 'Critical') return -1;
            if (a.priority !== 'Critical' && b.priority === 'Critical') return 1;
            return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
        })
        .slice(0, 10);

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
        <div className="card">
            <div style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '80px',
                height: '80px',
                background: gradient,
                filter: 'blur(50px)',
                opacity: 0.3
            }}></div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
                <div>
                    <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 500 }}>{title}</p>
                    <h3 style={{ margin: '0.5rem 0 0', fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>{value}</h3>
                </div>
                <div style={{
                    padding: '1rem',
                    borderRadius: '16px',
                    background: 'rgba(255,255,255,0.03)',
                    color: color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.05)'
                }}>
                    <Icon size={28} />
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
                    background: linear-gradient(90deg, rgba(248, 113, 113, 0.05) 0%, rgba(0, 0, 0, 0) 100%);
                }
                .filter-chip {
                    padding: 0.4rem 1rem;
                    border-radius: 999px;
                    font-size: 0.85rem;
                    cursor: pointer;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid var(--border);
                    color: var(--text-secondary);
                    transition: var(--transition);
                }
                .filter-chip.active {
                    background: var(--primary);
                    color: white;
                    border-color: var(--primary);
                }
            `}</style>

            <div className="page-header">
                <div>
                    <h1 className="page-title">Dashboard</h1>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
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
                <StatCard title="Total" value={stats.total} icon={LayoutDashboard} color="#818cf8" gradient="linear-gradient(135deg, #818cf8 0%, #c084fc 100%)" />
                <StatCard title="Active" value={stats.active} icon={ShieldCheck} color="#34d399" gradient="linear-gradient(135deg, #34d399 0%, #6ee7b7 100%)" />
                <StatCard title="Expiring" value={stats.expiringSoon} icon={Bell} color="#fbbf24" gradient="linear-gradient(135deg, #fbbf24 0%, #fcd34d 100%)" />
                <StatCard title="Expired" value={stats.expired} icon={Zap} color="#f87171" gradient="linear-gradient(135deg, #f87171 0%, #fca5a5 100%)" />
            </div>



            <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>Recent Documents</h3>
                    <div style={{ position: 'relative' }}>
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                background: 'rgba(0, 0, 0, 0.2)',
                                border: '1px solid var(--border)',
                                borderRadius: '50px',
                                padding: '0.5rem 1rem',
                                paddingLeft: '2.5rem',
                                color: 'white',
                                width: '240px'
                            }}
                        />
                        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                    {categories.map(cat => (
                        <div key={cat} className={`filter-chip ${selectedCategory === cat ? 'active' : ''}`} onClick={() => setSelectedCategory(cat)}>
                            {cat}
                        </div>
                    ))}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {filteredDocs.map(doc => {
                        const expiry = new Date(doc.expiryDate);
                        const daysLeft = Math.ceil((expiry.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                        const isCritical = doc.priority === 'Critical';

                        return (
                            <div key={doc.id} className={`card ${isCritical ? 'high-alert' : ''}`} style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{doc.name}</div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                                        <span style={{ color: daysLeft <= 7 ? 'var(--danger)' : daysLeft <= 30 ? 'var(--warning)' : 'var(--success)' }}>
                                            {daysLeft < 0 ? 'Expired' : `Expires in ${daysLeft} days`}
                                        </span>
                                        <span style={{ margin: '0 0.5rem' }}>•</span>
                                        {doc.category}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button onClick={() => handleEdit(doc)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}><Pencil size={18} /></button>
                                    <button onClick={() => handleDelete(doc.id, doc.name)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)' }}><Trash2 size={18} /></button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;

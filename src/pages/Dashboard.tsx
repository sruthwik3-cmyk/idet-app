import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { FileText, Clock, AlertTriangle, CheckCircle, Trash2, Pencil, Siren, Download, RefreshCw, Volume2, Upload, ExternalLink } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { SkeletonDashboard } from '../components/SkeletonCards';
import { unlockAudioContext } from '../utils/soundUtils';

const Dashboard: React.FC = () => {
    const { stats, documents, deleteDocument, loading, refreshAlerts, addDocument, showNotification } = useApp();
    const navigate = useNavigate();
    const location = useLocation();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Initialize search from Voice Command if present
    const [searchTerm, setSearchTerm] = useState(location.state?.searchQuery || '');
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [audioUnlocked, setAudioUnlocked] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [importResults, setImportResults] = useState<{ success: number; errors: string[] } | null>(null);

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

    const handleImport = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!file.name.endsWith('.csv')) {
            showNotification('Please upload a CSV file', 'error');
            return;
        }

        setIsImporting(true);
        setImportResults(null);

        try {
            const text = await file.text();
            const lines = text.split('\n').filter(line => line.trim());
            
            if (lines.length < 2) {
                showNotification('CSV file is empty', 'error');
                setIsImporting(false);
                return;
            }

            const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
            const errors: string[] = [];
            let successCount = 0;

            // Validate headers
            const requiredHeaders = ['Name', 'Category', 'Expiry Date', 'Priority'];
            const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
            
            if (missingHeaders.length > 0) {
                showNotification(`Missing required columns: ${missingHeaders.join(', ')}`, 'error');
                setIsImporting(false);
                return;
            }

            // Process each row
            for (let i = 1; i < lines.length; i++) {
                const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
                const row: any = {};
                
                headers.forEach((header, index) => {
                    row[header] = values[index] || '';
                });

                // Validate required fields
                if (!row['Name'] || !row['Category'] || !row['Expiry Date'] || !row['Priority']) {
                    errors.push(`Row ${i + 1}: Missing required fields`);
                    continue;
                }

                // Parse and validate date - accept multiple formats
                let parsedDate = '';
                const dateStr = row['Expiry Date'].trim();
                
                // Try YYYY-MM-DD format first
                const isoRegex = /^\d{4}-\d{2}-\d{2}$/;
                if (isoRegex.test(dateStr)) {
                    parsedDate = dateStr;
                } else {
                    // Try M/D/YYYY or MM/DD/YYYY format
                    const slashRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
                    const slashMatch = dateStr.match(slashRegex);
                    
                    if (slashMatch) {
                        const month = slashMatch[1].padStart(2, '0');
                        const day = slashMatch[2].padStart(2, '0');
                        const year = slashMatch[3];
                        parsedDate = `${year}-${month}-${day}`;
                    } else {
                        // Try DD/MM/YYYY format
                        const ddmmRegex = /^(\d{1,2})-(\d{1,2})-(\d{4})$/;
                        const ddmmMatch = dateStr.match(ddmmRegex);
                        
                        if (ddmmMatch) {
                            const day = ddmmMatch[1].padStart(2, '0');
                            const month = ddmmMatch[2].padStart(2, '0');
                            const year = ddmmMatch[3];
                            parsedDate = `${year}-${month}-${day}`;
                        } else {
                            errors.push(`Row ${i + 1}: Invalid date format (use YYYY-MM-DD, MM/DD/YYYY, or M/D/YYYY)`);
                            continue;
                        }
                    }
                }

                // Validate the parsed date is valid
                const testDate = new Date(parsedDate);
                if (isNaN(testDate.getTime())) {
                    errors.push(`Row ${i + 1}: Invalid date value`);
                    continue;
                }

                // Validate priority
                if (!['Critical', 'Important', 'Optional'].includes(row['Priority'])) {
                    errors.push(`Row ${i + 1}: Invalid priority (use Critical, Important, or Optional)`);
                    continue;
                }

                // Import document
                try {
                    await addDocument({
                        name: row['Name'],
                        category: row['Category'],
                        expiryDate: parsedDate,
                        priority: row['Priority'] as 'Critical' | 'Important' | 'Optional',
                        notes: row['Notes'] || '',
                        userGroup: 'Self'
                    });
                    successCount++;
                } catch (error) {
                    errors.push(`Row ${i + 1}: Failed to import - ${error}`);
                }
            }

            setImportResults({ success: successCount, errors });
            
            if (successCount > 0) {
                showNotification(`Successfully imported ${successCount} document${successCount > 1 ? 's' : ''}!`, 'success');
            }
            
            if (errors.length > 0) {
                showNotification(`${errors.length} row${errors.length > 1 ? 's' : ''} had errors`, 'error');
            }

        } catch (error) {
            showNotification('Failed to read CSV file', 'error');
            console.error('Import error:', error);
        } finally {
            setIsImporting(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
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
            <div className="page-header" style={{ marginBottom: '2rem', alignItems: 'flex-start' }}>
                <div>
                    <h1 className="page-title" style={{ marginBottom: '0.5rem' }}>Dashboard</h1>
                    {!audioUnlocked && (
                        <p style={{ color: 'var(--warning)', fontSize: '0.875rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Volume2 size={16} /> Click anywhere to enable sound alerts
                        </p>
                    )}
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <button
                        className="btn-secondary"
                        onClick={refreshAlerts}
                        title="Check for due alerts now"
                    >
                        <RefreshCw size={16} /> Sync Alerts
                    </button>
                    <button
                        className="btn-secondary"
                        onClick={handleImport}
                        disabled={isImporting}
                        title="Import documents from CSV file"
                    >
                        <Upload size={16} /> {isImporting ? 'Importing...' : 'Import CSV'}
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv"
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                    />
                    <button
                        className="btn-secondary"
                        onClick={handleExport}
                    >
                        <Download size={16} /> Export
                    </button>
                    <button className="btn-primary-full btn-pulse" style={{ width: 'auto', marginBottom: 0, padding: '0.75rem 1.5rem' }} onClick={() => navigate('/add-document')}>
                        + Add Document
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

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                                {doc.alerts.emailSent30 && (
                                                    <span className="badge badge-success" style={{ fontSize: '0.7rem', background: 'rgba(52, 211, 153, 0.1)', color: '#34d399', border: '1px solid rgba(52, 211, 153, 0.2)' }}>
                                                        30d Alert
                                                    </span>
                                                )}
                                                {doc.alerts.emailSent7 && (
                                                    <span className="badge badge-success" style={{ fontSize: '0.7rem', background: 'rgba(52, 211, 153, 0.1)', color: '#34d399', border: '1px solid rgba(52, 211, 153, 0.2)' }}>
                                                        7d Alert
                                                    </span>
                                                )}
                                            </div>

                                            <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '0.5rem' }}>
                                                {doc.fileUrl && (
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); window.open(doc.fileUrl, '_blank'); }}
                                                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--success)', padding: '6px', borderRadius: '6px', transition: 'all 0.2s' }}
                                                        className="action-btn"
                                                        title="View/Download File"
                                                    >
                                                        <ExternalLink size={16} />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleEdit(doc); }}
                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '6px', borderRadius: '6px', transition: 'all 0.2s' }}
                                                    className="action-btn"
                                                    title="Edit Document"
                                                >
                                                    <Pencil size={16} />
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleDelete(doc.id, doc.name); }}
                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f87171', padding: '6px', borderRadius: '6px', transition: 'all 0.2s' }}
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

            {/* Import Results Modal */}
            {importResults && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.8)',
                    backdropFilter: 'blur(8px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    padding: '1rem'
                }} onClick={() => setImportResults(null)}>
                    <div className="card" style={{
                        maxWidth: '600px',
                        width: '100%',
                        maxHeight: '80vh',
                        overflow: 'auto',
                        padding: '2rem'
                    }} onClick={(e) => e.stopPropagation()}>
                        <h2 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <CheckCircle size={28} color="var(--success)" />
                            Import Results
                        </h2>
                        
                        <div style={{ marginBottom: '1.5rem' }}>
                            <p style={{ fontSize: '1.1rem', margin: '0.5rem 0' }}>
                                <strong style={{ color: 'var(--success)' }}>{importResults.success}</strong> document{importResults.success !== 1 ? 's' : ''} imported successfully
                            </p>
                            {importResults.errors.length > 0 && (
                                <p style={{ fontSize: '1.1rem', margin: '0.5rem 0' }}>
                                    <strong style={{ color: 'var(--danger)' }}>{importResults.errors.length}</strong> error{importResults.errors.length !== 1 ? 's' : ''}
                                </p>
                            )}
                        </div>

                        {importResults.errors.length > 0 && (
                            <div style={{
                                background: 'rgba(239, 68, 68, 0.1)',
                                border: '1px solid rgba(239, 68, 68, 0.2)',
                                borderRadius: '12px',
                                padding: '1rem',
                                marginBottom: '1.5rem'
                            }}>
                                <h3 style={{ marginTop: 0, fontSize: '1rem', color: 'var(--danger)' }}>Errors:</h3>
                                <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
                                    {importResults.errors.map((error, index) => (
                                        <li key={index} style={{ marginBottom: '0.5rem', fontSize: '0.9rem' }}>{error}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <button
                            className="btn-primary-full"
                            onClick={() => setImportResults(null)}
                            style={{ marginBottom: 0 }}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { FileText, Download, ExternalLink, Search, Filter } from 'lucide-react';

const DocumentFiles: React.FC = () => {
    const { documents } = useApp();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('All');

    // Filter documents that have files
    const documentsWithFiles = documents.filter(doc => doc.fileUrl);

    // Get unique categories
    const categories = ['All', ...Array.from(new Set(documentsWithFiles.map(d => d.category)))];

    // Apply filters
    const filteredDocs = documentsWithFiles.filter(doc => {
        const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || doc.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const getFileExtension = (url: string) => {
        const parts = url.split('.');
        return parts[parts.length - 1].toUpperCase();
    };

    const getFileIcon = (url: string) => {
        const ext = getFileExtension(url).toLowerCase();
        if (ext === 'pdf') return '📄';
        if (['jpg', 'jpeg', 'png', 'webp'].includes(ext)) return '🖼️';
        return '📎';
    };

    return (
        <div className="animate-fade-in">
            <div className="page-header" style={{ marginBottom: '2rem' }}>
                <div>
                    <h1 className="page-title">Document Files</h1>
                    <p style={{ color: 'var(--text-secondary)', margin: '0.5rem 0 0' }}>
                        View and download all your uploaded document files
                    </p>
                </div>
            </div>

            {/* Search and Filter */}
            <div className="card" style={{ marginBottom: '2rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <div style={{ position: 'relative', flex: '1', minWidth: '250px' }}>
                        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                        <input
                            type="text"
                            placeholder="Search files..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.75rem 1rem 0.75rem 2.5rem',
                                background: 'rgba(0, 0, 0, 0.2)',
                                border: '1px solid var(--border)',
                                borderRadius: '8px',
                                color: 'white',
                                fontSize: '0.875rem',
                                outline: 'none'
                            }}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                        <Filter size={16} style={{ color: 'var(--text-secondary)' }} />
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                style={{
                                    padding: '0.5rem 1rem',
                                    borderRadius: '20px',
                                    fontSize: '0.875rem',
                                    cursor: 'pointer',
                                    background: selectedCategory === cat ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                                    border: selectedCategory === cat ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.1)',
                                    color: selectedCategory === cat ? 'white' : 'var(--text-secondary)',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="card" style={{ marginBottom: '2rem', border: '1px solid rgba(255,255,255,0.05)', background: 'linear-gradient(135deg, rgba(52, 211, 153, 0.1) 0%, rgba(129, 140, 248, 0.1) 100%)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ padding: '1rem', background: 'rgba(52, 211, 153, 0.2)', borderRadius: '12px' }}>
                        <FileText size={32} color="#34d399" />
                    </div>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '2rem', color: 'var(--text-primary)' }}>{documentsWithFiles.length}</h2>
                        <p style={{ margin: '0.25rem 0 0', color: 'var(--text-secondary)' }}>Files Uploaded</p>
                    </div>
                </div>
            </div>

            {/* Files Grid */}
            {filteredDocs.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                    {filteredDocs.map(doc => (
                        <div
                            key={doc.id}
                            className="card animate-fade-in"
                            style={{
                                border: '1px solid rgba(255,255,255,0.05)',
                                transition: 'all 0.3s ease',
                                cursor: 'pointer'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-4px)';
                                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.3)';
                                e.currentTarget.style.borderColor = 'var(--primary)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
                            }}
                        >
                            {/* File Icon */}
                            <div style={{
                                width: '100%',
                                height: '150px',
                                background: 'linear-gradient(135deg, rgba(129, 140, 248, 0.1) 0%, rgba(52, 211, 153, 0.1) 100%)',
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '4rem',
                                marginBottom: '1rem'
                            }}>
                                {getFileIcon(doc.fileUrl!)}
                            </div>

                            {/* Document Info */}
                            <div>
                                <h3 style={{ margin: '0 0 0.5rem', fontSize: '1rem', color: 'var(--text-primary)' }}>
                                    {doc.name}
                                </h3>
                                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                                    <span style={{
                                        fontSize: '0.75rem',
                                        padding: '2px 8px',
                                        borderRadius: '4px',
                                        background: 'rgba(129, 140, 248, 0.2)',
                                        color: '#818cf8',
                                        border: '1px solid rgba(129, 140, 248, 0.3)'
                                    }}>
                                        {doc.category}
                                    </span>
                                    <span style={{
                                        fontSize: '0.75rem',
                                        padding: '2px 8px',
                                        borderRadius: '4px',
                                        background: 'rgba(52, 211, 153, 0.2)',
                                        color: '#34d399',
                                        border: '1px solid rgba(52, 211, 153, 0.3)'
                                    }}>
                                        {getFileExtension(doc.fileUrl!)}
                                    </span>
                                </div>

                                {/* Action Buttons */}
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button
                                        onClick={() => window.open(doc.fileUrl, '_blank')}
                                        style={{
                                            flex: 1,
                                            padding: '0.75rem',
                                            background: 'var(--primary)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '0.5rem',
                                            fontSize: '0.875rem',
                                            fontWeight: '500',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = '#6366f1';
                                            e.currentTarget.style.transform = 'scale(1.05)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = 'var(--primary)';
                                            e.currentTarget.style.transform = 'scale(1)';
                                        }}
                                    >
                                        <ExternalLink size={16} />
                                        View
                                    </button>
                                    <button
                                        onClick={() => {
                                            const link = document.createElement('a');
                                            link.href = doc.fileUrl!;
                                            link.download = doc.name;
                                            link.click();
                                        }}
                                        style={{
                                            padding: '0.75rem',
                                            background: 'rgba(52, 211, 153, 0.2)',
                                            color: '#34d399',
                                            border: '1px solid rgba(52, 211, 153, 0.3)',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = 'rgba(52, 211, 153, 0.3)';
                                            e.currentTarget.style.transform = 'scale(1.1)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = 'rgba(52, 211, 153, 0.2)';
                                            e.currentTarget.style.transform = 'scale(1)';
                                        }}
                                        title="Download"
                                    >
                                        <Download size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="card" style={{ textAlign: 'center', padding: '3rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <FileText size={64} style={{ margin: '0 auto 1rem', opacity: 0.2, color: 'var(--text-secondary)' }} />
                    <h3 style={{ margin: '0 0 0.5rem', color: 'var(--text-primary)' }}>No Files Found</h3>
                    <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
                        {documentsWithFiles.length === 0
                            ? 'Upload files when adding documents to see them here'
                            : 'No files match your search criteria'}
                    </p>
                </div>
            )}
        </div>
    );
};

export default DocumentFiles;

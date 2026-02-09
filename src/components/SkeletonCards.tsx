import React from 'react';

export const SkeletonCard: React.FC = () => {
    return (
        <div className="card" style={{ height: '140px', position: 'relative', overflow: 'hidden' }}>
            <div className="skeleton-pulse" style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)',
                transform: 'translateX(-100%)',
                animation: 'shimmer 1.5s infinite'
            }}></div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ width: '60%', height: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}></div>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)' }}></div>
            </div>
            <div style={{ width: '40%', height: '2rem', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', marginTop: '1rem' }}></div>
        </div>
    );
};

export const SkeletonDashboard: React.FC = () => {
    return (
        <div className="animate-fade-in">
            <style>{`
                @keyframes shimmer {
                    100% { transform: translateX(100%); }
                }
            `}</style>
            <div className="page-header">
                <div>
                    <div style={{ width: '200px', height: '2.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', marginBottom: '0.5rem' }}></div>
                    <div style={{ width: '300px', height: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}></div>
                </div>
            </div>

            <div className="grid-cols-4" style={{ marginBottom: '2rem' }}>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
            </div>

            <div className="grid-cols-2">
                <div className="card" style={{ height: '400px', border: '1px solid rgba(255,255,255,0.05)' }}></div>
                <div className="card" style={{ height: '400px', border: '1px solid rgba(255,255,255,0.05)' }}></div>
            </div>
        </div>
    );
};

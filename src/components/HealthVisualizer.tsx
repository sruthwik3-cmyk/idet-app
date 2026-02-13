import React from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, ShieldCheck, AlertCircle, Heart } from 'lucide-react';

const HealthVisualizer: React.FC = () => {
    const { stats } = useApp();
    const { healthScore, insights } = stats;

    const getScoreColor = () => {
        if (healthScore >= 90) return 'var(--success)';
        if (healthScore >= 70) return 'var(--warning)';
        return 'var(--danger)';
    };

    const getScoreAnimation = () => {
        if (healthScore >= 90) return 'pulse-glow';
        return 'none';
    };

    return (
        <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-primary)' }}>
                    <ShieldCheck size={24} color="var(--primary)" /> Vault Health
                </h3>
                <div className={`badge ${healthScore >= 90 ? 'badge-success' : healthScore >= 70 ? 'badge-warning' : 'badge-danger'}`} style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}>
                    {healthScore}% Secure
                </div>
            </div>

            <div style={{ position: 'relative', height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {/* Visual health indicator (Ring) */}
                <svg width="160" height="160" viewBox="0 0 160 160">
                    <circle
                        cx="80"
                        cy="80"
                        r="70"
                        fill="none"
                        stroke="rgba(255,255,255,0.05)"
                        strokeWidth="12"
                    />
                    <circle
                        cx="80"
                        cy="80"
                        r="70"
                        fill="none"
                        stroke={getScoreColor()}
                        strokeWidth="12"
                        strokeDasharray={440}
                        strokeDashoffset={440 - (440 * healthScore) / 100}
                        strokeLinecap="round"
                        style={{ transition: 'stroke-dashoffset 1s ease-out' }}
                    />
                </svg>
                <div style={{ position: 'absolute', textAlign: 'center' }}>
                    <Heart size={40} color={getScoreColor()} className={getScoreAnimation()} />
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.5rem' }}>{healthScore}%</div>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Sparkles size={16} color="var(--primary)" /> AI Insights
                </p>
                {insights.map((insight, idx) => (
                    <div key={idx} style={{
                        display: 'flex',
                        gap: '0.75rem',
                        padding: '0.75rem',
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(255,255,255,0.05)',
                        borderRadius: '12px'
                    }}>
                        <div style={{ marginTop: '0.2rem' }}>
                            {insight.startsWith('Critical') ? <AlertCircle size={16} color="var(--danger)" /> : <ShieldCheck size={16} color="var(--primary)" />}
                        </div>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                            {insight}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default HealthVisualizer;

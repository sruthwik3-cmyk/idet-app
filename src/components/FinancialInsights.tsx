import React from 'react';
import { useApp } from '../context/AppContext';
import { TrendingUp, DollarSign, PieChart, Info } from 'lucide-react';

const FinancialInsights: React.FC = () => {
    const { stats, documents } = useApp();
    const { totalCost } = stats;

    // Calculate monthly breakdown
    const monthlyRenewal = totalCost / 12;

    // Categorize spending
    const categorySpending = documents.reduce((acc: Record<string, number>, doc) => {
        const cat = doc.category || 'Other';
        acc[cat] = (acc[cat] || 0) + (doc.cost || 0);
        return acc;
    }, {});

    const topCategory = Object.entries(categorySpending).sort(([, a], [, b]) => b - a)[0];

    return (
        <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-primary)' }}>
                    <TrendingUp size={24} color="var(--success)" /> Financial Insights
                </h3>
                <div style={{ color: 'var(--success)', fontWeight: 700, fontSize: '1.25rem' }}>
                    ${totalCost.toLocaleString()}
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginLeft: '4px', fontWeight: 500 }}>/yr</span>
                </div>
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{
                    padding: '1.25rem',
                    background: 'rgba(52, 211, 153, 0.05)',
                    borderRadius: '16px',
                    border: '1px solid rgba(52, 211, 153, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem'
                }}>
                    <div style={{ padding: '0.75rem', background: 'rgba(52, 211, 153, 0.1)', borderRadius: '12px', color: 'var(--success)' }}>
                        <DollarSign size={24} />
                    </div>
                    <div>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Avg. Monthly Renewal</p>
                        <h4 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary)' }}>${monthlyRenewal.toFixed(2)}</h4>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <PieChart size={14} /> Spending Highlights
                    </p>
                    {topCategory ? (
                        <div style={{
                            padding: '1rem',
                            background: 'rgba(255, 255, 255, 0.02)',
                            borderRadius: '12px',
                            border: '1px solid var(--border)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>Top: <strong>{topCategory[0]}</strong></span>
                            <span style={{ fontWeight: 600, color: 'var(--success)' }}>${topCategory[1].toLocaleString()}</span>
                        </div>
                    ) : (
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', padding: '0.5rem' }}>No financial data yet. Add renewal costs to documents.</p>
                    )}
                </div>

                <div style={{
                    marginTop: 'auto',
                    padding: '0.75rem',
                    background: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: '10px',
                    display: 'flex',
                    gap: '0.75rem'
                }}>
                    <Info size={16} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                        Costs are calculated based on the custom "Renewal Cost" field in your documents.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default FinancialInsights;

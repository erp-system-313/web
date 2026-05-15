import { useEffect, useState } from 'react';
import { Spin, Tag, Empty } from 'antd';
import { crmService } from '../../../services/crmService';

interface Stage { id: number; name: string; sequence: number }
interface Opp { id: number; leadId?: number; stageId: number; stageName: string; company: string; revenue: number; probability: number; expectedCloseDate: string }

export const Pipeline: React.FC = () => {
  const [stages, setStages] = useState<Stage[]>([]);
  const [opps, setOpps] = useState<Opp[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let m = true;
    Promise.all([
      crmService.getPipelineStages().catch(() => []),
      crmService.getOpportunities().catch(() => []),
    ]).then(([s, o]) => {
      if (!m) return;
      setStages(s as Stage[]);
      setOpps(o as Opp[]);
      setLoading(false);
    });
    return () => { m = false; };
  }, []);

  if (loading) return <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>;
  if (!stages.length) return <div style={{ textAlign: 'center', padding: 80 }}><Empty description="No pipeline stages found" /></div>;

  return (
    <div style={{ padding: 16 }}>
      <h3>Pipeline</h3>
      <div style={{ display: 'flex', gap: 16, overflowX: 'auto', minHeight: '60vh' }}>
        {stages.map(stage => {
          const cards = opps.filter(o => Number(o.stageId) === Number(stage.id));
          return (
            <div key={stage.id} style={{
              background: '#f5f5f5', borderRadius: 8, minWidth: 260, maxWidth: 300,
              flex: 1, padding: 12,
            }}>
              <div style={{
                fontWeight: 600, textAlign: 'center', padding: '8px 12px',
                background: '#fff', borderRadius: 6, marginBottom: 12,
              }}>
                {stage.name} <Tag>{cards.length}</Tag>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {cards.map(opp => (
                  <div key={opp.id} style={{
                    background: '#fff', borderRadius: 6, padding: 12,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  }}>
                    <div style={{ fontWeight: 500, marginBottom: 6 }}>{opp.company}</div>
                    <div style={{ fontSize: 12, color: '#666' }}>${Number(opp.revenue || 0).toLocaleString()}</div>
                    <div style={{ fontSize: 12, color: '#666' }}>{opp.probability ?? 0}%</div>
                    <div style={{ fontSize: 12, color: '#666' }}>
                      {opp.expectedCloseDate ? new Date(opp.expectedCloseDate).toLocaleDateString() : 'N/A'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Pipeline;

import { useEffect, useState } from 'react';
import { Spin, Alert, Button, Tag, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { crmService } from '../../../services/crmService';
import type { Lead, LeadStatus } from '../../../types/crm';

type PipelineColumn = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'PROPOSAL' | 'NEGOTIATION' | 'WIN' | 'LOSS';

const COLUMNS: PipelineColumn[] = ['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WIN', 'LOSS'];

const BACKEND_STATUS_MAP: Record<PipelineColumn, LeadStatus> = {
  NEW: 'NEW',
  CONTACTED: 'CONTACTED',
  QUALIFIED: 'QUALIFIED',
  PROPOSAL: 'QUALIFIED',
  NEGOTIATION: 'QUALIFIED',
  WIN: 'CONVERTED',
  LOSS: 'LOST',
};

const COLUMN_COLORS: Record<PipelineColumn, string> = {
  NEW: 'blue',
  CONTACTED: 'orange',
  QUALIFIED: 'green',
  PROPOSAL: 'cyan',
  NEGOTIATION: 'gold',
  WIN: 'purple',
  LOSS: 'red',
};

const columnForLead = (lead: Lead, override: Record<number, PipelineColumn>): PipelineColumn => {
  if (override[lead.id]) return override[lead.id];
  if (lead.status === 'CONVERTED') return 'WIN';
  if (lead.status === 'LOST') return 'LOSS';
  return lead.status as PipelineColumn;
};

export const Pipeline: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [columnOverride, setColumnOverride] = useState<Record<number, PipelineColumn>>({});
  const navigate = useNavigate();

  const loadLeads = async () => {
    setLoading(true);
    try {
      const result = await crmService.getLeads({ page: 0, size: 100 });
      setLeads(Array.isArray(result.data) ? result.data : []);
    } catch {
      setLeads([]);
    }
    setLoading(false);
  };

  useEffect(() => { loadLeads(); }, []);

  const updateLeadStatus = async (leadId: number, backendStatus: LeadStatus, column: PipelineColumn) => {
    try {
      await crmService.updateLead(leadId, { status: backendStatus });
      setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: backendStatus } : l));
      setColumnOverride(prev => ({ ...prev, [leadId]: column }));
      message.success(`Lead moved to ${column}`);
    } catch {
      message.error('Failed to update lead status');
    }
  };

  const handleDragStart = (e: React.DragEvent, leadId: number) => {
    e.dataTransfer.setData('leadId', String(leadId));
    (e.currentTarget as HTMLElement).style.opacity = '0.4';
  };

  const handleDragEnd = (e: React.DragEvent) => {
    (e.currentTarget as HTMLElement).style.opacity = '1';
  };

  const handleDrop = async (e: React.DragEvent, column: PipelineColumn) => {
    e.preventDefault();
    const leadId = Number(e.dataTransfer.getData('leadId'));
    if (!leadId) return;
    const backendStatus = BACKEND_STATUS_MAP[column];
    await updateLeadStatus(leadId, backendStatus, column);
  };

  if (loading) return <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>;

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ margin: 0 }}>Pipeline ({leads.length} leads)</h3>
        <Button onClick={loadLeads}>Refresh</Button>
      </div>

      {leads.length === 0 && (
        <Alert
          type="info"
          message="No leads found"
          description="Create a lead first, then it will appear here grouped by its status."
          style={{ marginBottom: 16 }}
          showIcon
          action={<Button size="small" onClick={() => navigate('/crm/leads')}>View Leads</Button>}
        />
      )}

      <div style={{ display: 'flex', gap: 16, overflowX: 'auto', minHeight: '70vh' }}>
        {COLUMNS.map(column => {
          const cards = leads.filter(l => columnForLead(l, columnOverride) === column);
          return (
            <div
              key={column}
              style={{ background: '#f5f5f5', borderRadius: 8, minWidth: 220, maxWidth: 260, flex: 1, padding: 12 }}
              onDragOver={e => e.preventDefault()}
              onDrop={e => handleDrop(e, column)}
            >
              <div style={{ fontWeight: 600, textAlign: 'center', padding: '8px', background: '#fff', borderRadius: 6, marginBottom: 12 }}>
                <Tag color={COLUMN_COLORS[column]}>{column}</Tag>
                <span style={{ marginLeft: 4, fontSize: 13 }}>{cards.length}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minHeight: 200 }}>
                {cards.length === 0 && (
                  <div style={{ padding: '24px 12px', textAlign: 'center', border: '1px dashed #d9d9d9', borderRadius: 6, color: '#999', fontSize: 13 }}>
                    Drop here
                  </div>
                )}
                {cards.map(lead => (
                  <div
                    key={lead.id}
                    draggable
                    onDragStart={e => handleDragStart(e, lead.id)}
                    onDragEnd={handleDragEnd}
                    onClick={() => navigate(`/crm/leads/${lead.id}`)}
                    style={{
                      background: '#fff', borderRadius: 6, padding: 10,
                      cursor: 'grab', boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    }}
                  >
                    <div style={{ fontWeight: 500, marginBottom: 4 }}>{lead.name}</div>
                    <div style={{ fontSize: 12, color: '#666' }}>{lead.company}</div>
                    <div style={{ fontSize: 11, color: '#999', marginTop: 4 }}>{lead.email}</div>
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

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, Tag, Button, Space, Spin, Typography, message } from 'antd';
import { ArrowLeftOutlined, EditOutlined, SwapOutlined } from '@ant-design/icons';
import type { Lead } from '../../../types/crm';
import { crmService } from '../../../services/crmService';
import styles from './LeadDetails.module.css';

const { Title } = Typography;

const statusColors: Record<string, string> = {
  NEW: 'blue',
  CONTACTED: 'orange',
  QUALIFIED: 'green',
  CONVERTED: 'purple',
  LOST: 'red',
};

export const LeadDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    crmService.getLead(Number(id))
      .then(setLead)
      .catch(() => setLead(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handleConvert = async () => {
    if (!id) return;
    try {
      await crmService.convertLead(Number(id));
      message.success('Lead converted to customer');
      if (lead) setLead({ ...lead, status: 'CONVERTED' });
    } catch {
      message.error('Failed to convert lead');
    }
  };

  if (loading) {
    return <div className={styles.loading}><Spin size="large" /></div>;
  }

  if (!lead) {
    return <div className={styles.notFound}><Title level={4}>Lead not found</Title><Button onClick={() => navigate('/crm/leads')}>Back to Leads</Button></div>;
  }

  return (
    <div>
      <div className={styles.header}>
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/crm/leads')}>Back</Button>
          <Title level={3} style={{ margin: 0 }}>{lead.name}</Title>
        </Space>
        <Space>
          <Button icon={<EditOutlined />}>Edit</Button>
          {lead.status !== 'CONVERTED' && (
            <Button type="primary" icon={<SwapOutlined />} onClick={handleConvert}>
              Convert to Customer
            </Button>
          )}
        </Space>
      </div>

      <Card>
        <Descriptions column={2}>
          <Descriptions.Item label="Email">{lead.email}</Descriptions.Item>
          <Descriptions.Item label="Phone">{lead.phone}</Descriptions.Item>
          <Descriptions.Item label="Company">{lead.company}</Descriptions.Item>
          <Descriptions.Item label="Status"><Tag color={statusColors[lead.status]}>{lead.status}</Tag></Descriptions.Item>
          <Descriptions.Item label="Source">{lead.source || '-'}</Descriptions.Item>
          <Descriptions.Item label="Assigned To">{lead.assignedTo || '-'}</Descriptions.Item>
          <Descriptions.Item label="Created">{new Date(lead.createdAt).toLocaleDateString()}</Descriptions.Item>
          <Descriptions.Item label="Last Updated">{new Date(lead.updatedAt).toLocaleDateString()}</Descriptions.Item>
          <Descriptions.Item label="Notes" span={2}>{lead.notes || '-'}</Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  );
};

export default LeadDetails;

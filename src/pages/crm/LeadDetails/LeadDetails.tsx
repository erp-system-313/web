import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, Tag, Button, Space, Spin, Typography, message, Modal, Input, Select, Form } from 'antd';
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
  const [editing, setEditing] = useState(false);
  const [form] = Form.useForm();

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
      message.success('Lead converted');
      if (lead) setLead({ ...lead, status: 'CONVERTED' });
    } catch {
      message.error('Failed to convert lead');
    }
  };

  const handleEdit = () => {
    if (!lead) return;
    form.setFieldsValue(lead);
    setEditing(true);
  };

  const handleSave = async () => {
    if (!id) return;
    try {
      const values = await form.validateFields();
      await crmService.updateLead(Number(id), values);
      setLead({ ...lead!, ...values });
      message.success('Lead updated');
      setEditing(false);
    } catch {
      message.error('Failed to update lead');
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
          <Button icon={<EditOutlined />} onClick={handleEdit}>Edit</Button>
          <Button type="primary" icon={<SwapOutlined />} onClick={handleConvert}>
            Convert to Lead
          </Button>
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
      <Modal
        title="Edit Lead"
        open={editing}
        onOk={handleSave}
        onCancel={() => setEditing(false)}
        okText="Save"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="Phone">
            <Input />
          </Form.Item>
          <Form.Item name="company" label="Company" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="status" label="Status">
            <Select>
              <Select.Option value="NEW">New</Select.Option>
              <Select.Option value="CONTACTED">Contacted</Select.Option>
              <Select.Option value="QUALIFIED">Qualified</Select.Option>
              <Select.Option value="LOST">Lost</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="source" label="Source">
            <Input />
          </Form.Item>
          <Form.Item name="notes" label="Notes">
            <Input.TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default LeadDetails;

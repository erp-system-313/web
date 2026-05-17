import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Input, Select, Space, Modal, Form, Card, Typography } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import type { LeadStatus, CreateLeadDto } from '../../../types/crm';
import { useLeads } from '../../../hooks/useCRM';
import styles from './LeadsList.module.css';

const { Title } = Typography;

const statusColors: Record<LeadStatus, string> = {
  NEW: 'blue',
  CONTACTED: 'orange',
  QUALIFIED: 'green',
  CONVERTED: 'purple',
  LOST: 'red',
};

export const LeadsList: React.FC = () => {
  const navigate = useNavigate();
  const { leads, total, loading, fetchLeads, createLead } = useLeads();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<LeadStatus | ''>('');
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm<CreateLeadDto>();

  useEffect(() => {
    fetchLeads({ search, status: statusFilter || undefined });
  }, [search, statusFilter]);

  const handleCreate = async () => {
    try {
      setSubmitting(true);
      const values = await form.validateFields();
      await createLead(values);
      setModalOpen(false);
      form.resetFields();
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name', render: (_: string, r: any) => <a onClick={() => navigate(`/crm/leads/${r.id}`)}>{r.name}</a> },
    { title: 'Company', dataIndex: 'company', key: 'company' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Phone', dataIndex: 'phone', key: 'phone' },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (s: LeadStatus) => <span style={{ color: statusColors[s] }}>{s}</span> },
    { title: 'Assigned To', dataIndex: 'assignedTo', key: 'assignedTo' },
    { title: 'Created', dataIndex: 'createdAt', key: 'createdAt', render: (v: string) => new Date(v).toLocaleDateString() },
  ];

  return (
    <div>
      <div className={styles.header}>
        <Title level={3} style={{ margin: 0 }}>Leads</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>Add Lead</Button>
      </div>

      <Card className={styles.filters}>
        <Space>
          <Input placeholder="Search leads..." prefix={<SearchOutlined />} value={search} onChange={e => setSearch(e.target.value)} allowClear style={{ width: 250 }} />
          <Select placeholder="Filter by status" value={statusFilter || undefined} onChange={v => setStatusFilter(v || '')} allowClear style={{ width: 160 }}>
            <Select.Option value="NEW">NEW</Select.Option>
            <Select.Option value="CONTACTED">CONTACTED</Select.Option>
            <Select.Option value="QUALIFIED">QUALIFIED</Select.Option>
            <Select.Option value="CONVERTED">CONVERTED</Select.Option>
            <Select.Option value="LOST">LOST</Select.Option>
          </Select>
        </Space>
      </Card>

      <Table dataSource={leads} rowKey="id" loading={loading} columns={columns} pagination={{ total, pageSize: 20 }}
        onRow={r => ({ onClick: () => navigate(`/crm/leads/${r.id}`), style: { cursor: 'pointer' } })} />

      <Modal title="Add Lead" open={modalOpen} onOk={handleCreate} onCancel={() => { setModalOpen(false); form.resetFields(); }} confirmLoading={submitting}>
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Name" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}><Input /></Form.Item>
          <Form.Item name="phone" label="Phone"><Input /></Form.Item>
          <Form.Item name="company" label="Company" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="source" label="Source"><Input /></Form.Item>
          <Form.Item name="assignedTo" label="Assigned To"><Input /></Form.Item>
          <Form.Item name="notes" label="Notes"><Input.TextArea rows={3} /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default LeadsList;

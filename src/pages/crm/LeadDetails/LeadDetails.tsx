import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, Tag, Button, Space, Spin, Typography, message, Modal, Input, Select, Form, InputNumber, DatePicker, Divider } from 'antd';
import dayjs from 'dayjs';
import { ArrowLeftOutlined, EditOutlined, SwapOutlined } from '@ant-design/icons';
import type { Lead, Opportunity } from '../../../types/crm';
import { crmService } from '../../../services/crmService';
import { formatPhone } from '../../../utils/format';
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
  const [convertModalOpen, setConvertModalOpen] = useState(false);
  const [converting, setConverting] = useState(false);
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [stages, setStages] = useState<{ id: number; name: string }[]>([]);
  const [form] = Form.useForm();
  const [convertForm] = Form.useForm();

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    crmService.getLead(Number(id))
      .then(setLead)
      .catch(() => setLead(null))
      .finally(() => setLoading(false));
    crmService.getPipelineStages()
      .then(setStages)
      .catch(() => {});
  }, [id]);

  const handleConvert = async () => {
    if (!id) return;
    setConverting(true);
    try {
      const values = await convertForm.validateFields();
      const closeDate = values.closeDate
        ? (typeof values.closeDate === 'string' ? values.closeDate : values.closeDate.format('YYYY-MM-DD'))
        : undefined;
      const payload = {
        stageId: values.stageId,
        revenue: values.revenue ?? undefined,
        probability: values.probability ?? undefined,
        closeDate,
      };
      const opp = await crmService.convertLead(Number(id), payload);
      setOpportunity(opp);
      if (lead) setLead({ ...lead, status: 'CONVERTED' });
      message.success('Lead converted to opportunity');
      setConvertModalOpen(false);
      convertForm.resetFields();
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'errorFields' in err) return;
      message.error('Failed to convert lead');
    } finally {
      setConverting(false);
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
      const values = await form.validateFields() as Record<string, unknown>;
      if (values.status === 'PROPOSAL' || values.status === 'NEGOTIATION') {
        values.status = 'QUALIFIED';
      }
      await crmService.updateLead(Number(id), values as any);
      setLead({ ...lead!, ...values } as any);
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
          {lead.status !== 'CONVERTED' && (
            <Button type="primary" icon={<SwapOutlined />} onClick={() => setConvertModalOpen(true)}>
              Convert to Opportunity
            </Button>
          )}
        </Space>
      </div>

      <Card>
        <Descriptions column={2}>
          <Descriptions.Item label="Email">{lead.email}</Descriptions.Item>
          <Descriptions.Item label="Phone">{formatPhone(lead.phone)}</Descriptions.Item>
          <Descriptions.Item label="Company">{lead.company}</Descriptions.Item>
          <Descriptions.Item label="Status"><Tag color={statusColors[lead.status]}>{lead.status}</Tag></Descriptions.Item>
          <Descriptions.Item label="Source">{lead.source || '-'}</Descriptions.Item>
          <Descriptions.Item label="Assigned To">{lead.assignedTo || '-'}</Descriptions.Item>
          <Descriptions.Item label="Created">{new Date(lead.createdAt).toLocaleDateString()}</Descriptions.Item>
          <Descriptions.Item label="Last Updated">{new Date(lead.updatedAt).toLocaleDateString()}</Descriptions.Item>
          <Descriptions.Item label="Notes" span={2}>{lead.notes || '-'}</Descriptions.Item>
        </Descriptions>
      </Card>

      {opportunity && (
        <>
          <Divider />
          <Title level={4}>Converted Opportunity</Title>
          <Card
            style={{ cursor: 'pointer' }}
            onClick={() => navigate('/crm/pipeline')}
          >
            <Descriptions column={2}>
              <Descriptions.Item label="Company">{opportunity.company}</Descriptions.Item>
              <Descriptions.Item label="Stage"><Tag color="blue">{opportunity.stageName}</Tag></Descriptions.Item>
              <Descriptions.Item label="Revenue">${(opportunity.revenue ?? 0).toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label="Probability">{opportunity.probability ?? 0}%</Descriptions.Item>
              <Descriptions.Item label="Expected Close">
                {opportunity.expectedCloseDate ? new Date(opportunity.expectedCloseDate).toLocaleDateString() : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Created">{new Date(opportunity.createdAt).toLocaleDateString()}</Descriptions.Item>
            </Descriptions>
          </Card>
        </>
      )}

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
          <Form.Item name="phone" label="Phone" rules={[{
            validator: (_, value) => {
              if (!value) return Promise.resolve();
              const digits = value.replace(/\D/g, '');
              const valid = (digits.length === 11 && /^01[0125]\d{8}$/.test(digits)) ||
                            (digits.length === 12 && /^201[0125]\d{8}$/.test(digits));
              if (!valid) return Promise.reject(new Error('Must be an Egyptian mobile (+20 1X XXXXXXXX)'));
              return Promise.resolve();
            },
          }]}>
            <Input placeholder="+20 12 78753670" />
          </Form.Item>
          <Form.Item name="company" label="Company" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="status" label="Status">
            <Select>
              <Select.Option value="NEW">New</Select.Option>
              <Select.Option value="CONTACTED">Contacted</Select.Option>
              <Select.Option value="QUALIFIED">Qualified</Select.Option>
              <Select.Option value="PROPOSAL">Proposal</Select.Option>
              <Select.Option value="NEGOTIATION">Negotiation</Select.Option>
              <Select.Option value="CONVERTED">Win</Select.Option>
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

      <Modal
        title="Convert to Opportunity"
        open={convertModalOpen}
        onOk={handleConvert}
        onCancel={() => { setConvertModalOpen(false); convertForm.resetFields(); }}
        confirmLoading={converting}
        okText="Convert"
      >
        <Form form={convertForm} layout="vertical">
          <Form.Item name="stageId" label="Pipeline Stage" rules={[{ required: true, message: 'Select a stage' }]}>
            <Select placeholder="Select stage">
              {stages.map(s => (
                <Select.Option key={s.id} value={s.id}>{s.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="revenue" label="Expected Revenue">
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              step={1000}
              prefix="$"
              placeholder="0"
            />
          </Form.Item>
          <Form.Item name="probability" label="Probability (%)">
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              max={100}
              formatter={v => `${v ?? ''}%`}
              parser={v => Number(v?.replace('%', '') ?? 0) as 0 | 100}
              placeholder="0"
            />
          </Form.Item>
          <Form.Item name="closeDate" label="Expected Close Date">
            <DatePicker style={{ width: '100%' }} disabledDate={d => d && d.isBefore(dayjs(), 'day')} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default LeadDetails;

import { useState, useEffect } from 'react';
import { Card, Table, Button, Input, Select, Space, Modal, Form, message, Tag, DatePicker, Empty } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useProjects } from '../../../hooks/useProjects';
import { projectService } from '../../../services/projectService';
import { apiClient } from '../../../api/client';
import { PROJECT_STATE_LABELS, PROJECT_STATE_COLORS } from '../../../types/project';
import type { ProjectState, CreateProjectRequest } from '../../../types/project';
import styles from './ProjectList.module.css';

export const ProjectList: React.FC = () => {
  const [page, setPage] = useState(0);
  const [size] = useState(20);
  const [search, setSearch] = useState('');
  const [stateFilter, setStateFilter] = useState<ProjectState | undefined>();
  const [modalOpen, setModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [customers, setCustomers] = useState<{ id: number; name: string }[]>([]);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  useEffect(() => {
    apiClient.get('/v1/customers').then((res) => {
      const data = res.data.data?.content ?? res.data.data ?? [];
      setCustomers(data.map((c: any) => ({ id: c.id, name: c.name || c.companyName })));
    }).catch((err) => {
      console.error("Failed to load customers", err);
    });
  }, []);

  const { data, total, loading, refetch } = useProjects(page, size, stateFilter, search || undefined);

  const handleCreate = async (values: CreateProjectRequest) => {
    setCreating(true);
    try {
      const payload: CreateProjectRequest = {
        ...values,
        dateStart: values.dateStart ? String((values.dateStart as any).format?.('YYYY-MM-DD') ?? values.dateStart) : null,
        dateEnd: values.dateEnd ? String((values.dateEnd as any).format?.('YYYY-MM-DD') ?? values.dateEnd) : null,
      };
      await projectService.create(payload);
      message.success('Project created successfully');
      setModalOpen(false);
      form.resetFields();
      refetch();
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Failed to create project');
    } finally {
      setCreating(false);
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: { id: number }) => (
        <a onClick={() => navigate(`/projects/${record.id}`)}>{name}</a>
      ),
    },
    {
      title: 'State',
      dataIndex: 'state',
      key: 'state',
      width: 120,
      render: (state: ProjectState) => (
        <Tag color={PROJECT_STATE_COLORS[state]}>{PROJECT_STATE_LABELS[state]}</Tag>
      ),
    },
    {
      title: 'Start Date',
      dataIndex: 'dateStart',
      key: 'dateStart',
      width: 120,
    },
    {
      title: 'End Date',
      dataIndex: 'dateEnd',
      key: 'dateEnd',
      width: 120,
    },
    {
      title: 'Budget',
      dataIndex: 'budget',
      key: 'budget',
      width: 120,
      render: (budget: number | null) => (budget ? `$${budget.toLocaleString()}` : '-'),
    },
  ];

  return (
    <div className={styles.container}>
      <Card>
        <div className={styles.header}>
          <Space>
            <Input
              placeholder="Search projects..."
              prefix={<SearchOutlined />}
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              style={{ width: 250 }}
              allowClear
            />
            <Select
              placeholder="Filter by state"
              value={stateFilter}
              onChange={(val) => { setStateFilter(val); setPage(0); }}
              allowClear
              style={{ width: 150 }}
              options={Object.entries(PROJECT_STATE_LABELS).map(([key, label]) => ({
                value: key,
                label,
              }))}
            />
          </Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
            New Project
          </Button>
        </div>

        {data.length === 0 && !loading ? (
          <Empty description="No projects found" />
        ) : (
        <Table
          dataSource={data}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{
            current: page + 1,
            pageSize: size,
            total,
            onChange: (p) => setPage(p - 1),
            showSizeChanger: false,
          }}
          onRow={(record) => ({
            onClick: () => navigate(`/projects/${record.id}`),
            style: { cursor: 'pointer' },
          })}
        />
        )}
      </Card>

      <Modal
        title="New Project"
        open={modalOpen}
        onCancel={() => { setModalOpen(false); form.resetFields(); }}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item name="name" label="Project Name" rules={[{ required: true, message: 'Name is required' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="dateStart" label="Start Date">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="dateEnd" label="End Date">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="customerId" label="Customer">
            <Select
              options={customers.map((c) => ({ value: c.id, label: c.name }))}
              placeholder="Select customer"
              allowClear
              showSearch
              filterOption={(input, option) =>
                (option?.label as string ?? '').toLowerCase().includes(input.toLowerCase())
              }
            />
          </Form.Item>
          <Form.Item name="budget" label="Budget">
            <Input type="number" prefix="$" min={0} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={creating} block>
              Create Project
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProjectList;

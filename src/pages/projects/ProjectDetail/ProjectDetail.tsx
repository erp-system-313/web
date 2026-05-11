import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, Tag, Button, Space, Spin, Table, Modal, Form, Input, DatePicker, message, Popconfirm } from 'antd';
import { ArrowLeftOutlined, BarChartOutlined, PlusOutlined } from '@ant-design/icons';
import { useProject, useProjectTasks } from '../../../hooks/useProjects';
import { projectService } from '../../../services/projectService';
import { PROJECT_STATE_LABELS, PROJECT_STATE_COLORS } from '../../../types/project';
import type { ProjectState, CreateTaskRequest } from '../../../types/project';
import styles from './ProjectDetail.module.css';

const STATE_TRANSITIONS: Record<ProjectState, ProjectState[]> = {
  PLANNING: ['IN_PROGRESS'],
  IN_PROGRESS: ['ON_HOLD', 'COMPLETED'],
  ON_HOLD: ['IN_PROGRESS', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
};

export const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const projectId = id ? Number(id) : null;
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form] = Form.useForm();

  const { data: project, loading, refetch: refetchProject } = useProject(projectId);
  const { data: tasks, loading: tasksLoading, refetch: refetchTasks } = useProjectTasks(projectId);

  const handleStateChange = async (newState: ProjectState) => {
    if (!projectId) return;
    try {
      await projectService.updateState(projectId, newState);
      message.success(`Project state updated to ${PROJECT_STATE_LABELS[newState]}`);
      refetchProject();
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Failed to update state');
    }
  };

  const handleCreateTask = async (values: CreateTaskRequest) => {
    if (!projectId) return;
    setCreating(true);
    try {
      const payload: CreateTaskRequest = {
        ...values,
        dueDate: values.dueDate ? String((values.dueDate as any).format?.('YYYY-MM-DD') ?? values.dueDate) : null,
      };
      await projectService.createTask(projectId, payload);
      message.success('Task created successfully');
      setTaskModalOpen(false);
      form.resetFields();
      refetchTasks();
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Failed to create task');
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!project) {
    return <div style={{ padding: 24 }}>Project not found</div>;
  }

  const availableTransitions = STATE_TRANSITIONS[project.state] || [];

  const taskColumns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    {
      title: 'Stage',
      dataIndex: 'stageName',
      key: 'stageName',
      render: (name: string | null) => name || '-',
    },
    { title: 'Due Date', dataIndex: 'dueDate', key: 'dueDate', render: (d: string | null) => d || '-' },
    {
      title: 'Est. Hours',
      dataIndex: 'estimatedHours',
      key: 'estimatedHours',
      render: (h: number | null) => h ?? '-',
    },
    {
      title: 'Actual Hours',
      dataIndex: 'actualHours',
      key: 'actualHours',
      render: (h: number | null) => h ?? '-',
    },
  ];

  return (
    <div className={styles.container}>
      <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/projects')} style={{ marginBottom: 16 }}>
        Back to Projects
      </Button>

      <Card
        title={project.name}
        extra={
          <Space>
            {availableTransitions.map((state) => (
              <Popconfirm
                key={state}
                title={`Move to ${PROJECT_STATE_LABELS[state]}?`}
                onConfirm={() => handleStateChange(state)}
              >
                <Button size="small">Move to {PROJECT_STATE_LABELS[state]}</Button>
              </Popconfirm>
            ))}
            <Button
              icon={<BarChartOutlined />}
              onClick={() => navigate(`/projects/${projectId}/gantt`)}
            >
              Gantt View
            </Button>
          </Space>
        }
      >
        <Descriptions column={2}>
          <Descriptions.Item label="State">
            <Tag color={PROJECT_STATE_COLORS[project.state]}>{PROJECT_STATE_LABELS[project.state]}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Budget">{project.budget ? `$${project.budget.toLocaleString()}` : '-'}</Descriptions.Item>
          <Descriptions.Item label="Start Date">{project.dateStart || '-'}</Descriptions.Item>
          <Descriptions.Item label="End Date">{project.dateEnd || '-'}</Descriptions.Item>
          <Descriptions.Item label="Created">{project.createdAt ? new Date(project.createdAt).toLocaleDateString() : '-'}</Descriptions.Item>
        </Descriptions>
      </Card>

      <Card
        title="Tasks"
        style={{ marginTop: 16 }}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setTaskModalOpen(true)}>
            Add Task
          </Button>
        }
      >
        <Table
          dataSource={tasks}
          columns={taskColumns}
          rowKey="id"
          loading={tasksLoading}
          pagination={false}
        />
      </Card>

      <Modal
        title="New Task"
        open={taskModalOpen}
        onCancel={() => { setTaskModalOpen(false); form.resetFields(); }}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateTask}>
          <Form.Item name="name" label="Task Name" rules={[{ required: true, message: 'Name is required' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="dueDate" label="Due Date">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="estimatedHours" label="Estimated Hours">
            <Input type="number" min={0} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={creating} block>
              Create Task
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProjectDetail;

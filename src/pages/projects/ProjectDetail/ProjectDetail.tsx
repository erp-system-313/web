import { useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import {
  Card,
  Descriptions,
  Tag,
  Button,
  Space,
  Spin,
  Table,
  Modal,
  Form,
  Input,
  DatePicker,
  message,
  Popconfirm,
  Select,
  Empty,
} from "antd";
import {
  ArrowLeftOutlined,
  BarChartOutlined,
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
} from "@ant-design/icons";
import {
  useProject,
  useProjectTasks,
  useProjectStages,
} from "../../../hooks/useProjects";
import { projectService } from "../../../services/projectService";
import { AuthContext } from "../../../contexts/AuthContext";
import {
  PROJECT_STATE_LABELS,
  PROJECT_STATE_COLORS,
} from "../../../types/project";
import type {
  ProjectState,
  CreateTaskRequest,
  UpdateTaskRequest,
  ProjectTask,
} from "../../../types/project";
import styles from "./ProjectDetail.module.css";

const STATE_TRANSITIONS: Record<ProjectState, ProjectState[]> = {
  PLANNING: ["ACTIVE"],
  ACTIVE: ["ON_HOLD", "COMPLETED"],
  ON_HOLD: ["ACTIVE", "CANCELLED"],
  COMPLETED: ["ACTIVE"],
  CANCELLED: [],
};

export const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const authContext = useContext(AuthContext);
  const userRole = (authContext?.user?.role || "STAFF").toLowerCase();
  const isAdminOrManager = userRole === "admin" || userRole === "manager";
  const projectId = id ? Number(id) : null;
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form] = Form.useForm();

  const [editingTask, setEditingTask] = useState<ProjectTask | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editForm] = Form.useForm();
  const [updatingStage, setUpdatingStage] = useState<number | null>(null);

  const {
    data: project,
    loading,
    refetch: refetchProject,
  } = useProject(projectId);
  const {
    data: tasks,
    loading: tasksLoading,
    refetch: refetchTasks,
  } = useProjectTasks(projectId);
  const { data: stages } = useProjectStages(projectId);

  const handleStateChange = async (newState: ProjectState) => {
    if (!projectId) return;
    try {
      await projectService.updateState(projectId, newState);
      message.success(
        `Project state updated to ${PROJECT_STATE_LABELS[newState]}`,
      );
      refetchProject();
    } catch (err) {
      message.error(
        err instanceof Error ? err.message : "Failed to update state",
      );
    }
  };

  const handleDeleteProject = async () => {
    if (!projectId) return;
    try {
      await projectService.delete(projectId);
      message.success("Project deleted successfully");
      navigate("/projects");
    } catch (err) {
      message.error(
        err instanceof Error ? err.message : "Failed to delete project",
      );
    }
  };

  const handleEditTask = async (values: UpdateTaskRequest) => {
    if (!editingTask) return;
    try {
      const payload: UpdateTaskRequest = {
        ...values,
        startDate: values.startDate
          ? String(
              (values.startDate as any).format?.("YYYY-MM-DD") ??
                values.startDate,
            )
          : null,
        dueDate: values.dueDate
          ? String(
              (values.dueDate as any).format?.("YYYY-MM-DD") ?? values.dueDate,
            )
          : null,
        estimatedHours:
          values.estimatedHours != null && values.estimatedHours !== ""
            ? Number(values.estimatedHours)
            : null,
        actualHours:
          values.actualHours != null && values.actualHours !== ""
            ? Number(values.actualHours)
            : null,
      };
      await projectService.updateTask(editingTask.id, payload);
      message.success("Task updated successfully");
      setEditModalOpen(false);
      setEditingTask(null);
      editForm.resetFields();
      refetchTasks();
    } catch (err) {
      message.error(
        err instanceof Error ? err.message : "Failed to update task",
      );
    }
  };

  const handleUpdateTaskStage = async (taskId: number, stageId: number) => {
    setUpdatingStage(taskId);
    try {
      await projectService.updateTask(taskId, { stageId });
      message.success("Task stage updated");
      refetchTasks();
    } catch (err) {
      message.error(
        err instanceof Error ? err.message : "Failed to update task stage",
      );
    } finally {
      setUpdatingStage(null);
    }
  };

  const openEditModal = (task: ProjectTask) => {
    setEditingTask(task);
    editForm.setFieldsValue({
      name: task.name,
      description: task.description,
      startDate: task.startDate ? dayjs(task.startDate) : null,
      dueDate: task.dueDate ? dayjs(task.dueDate) : null,
      estimatedHours: task.estimatedHours,
      actualHours: task.actualHours,
      stageId: task.stageId,
    });
    setEditModalOpen(true);
  };

  const handleCreateTask = async (values: CreateTaskRequest) => {
    if (!projectId) return;
    setCreating(true);
    try {
      const payload: CreateTaskRequest = {
        ...values,
        startDate: values.startDate
          ? String(
              (values.startDate as any).format?.("YYYY-MM-DD") ??
                values.startDate,
            )
          : null,
        dueDate: values.dueDate
          ? String(
              (values.dueDate as any).format?.("YYYY-MM-DD") ?? values.dueDate,
            )
          : null,
        estimatedHours:
          values.estimatedHours != null && values.estimatedHours !== ""
            ? Number(values.estimatedHours)
            : null,
        actualHours:
          values.actualHours != null && values.actualHours !== ""
            ? Number(values.actualHours)
            : null,
      };
      await projectService.createTask(projectId, payload);
      message.success("Task created successfully");
      setTaskModalOpen(false);
      form.resetFields();
      refetchTasks();
    } catch (err) {
      message.error(
        err instanceof Error ? err.message : "Failed to create task",
      );
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: 80 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!project) {
    return <div style={{ padding: 24 }}>Project not found</div>;
  }

  const availableTransitions = STATE_TRANSITIONS[project.state] || [];

  const taskColumns = [
    { title: "Name", dataIndex: "name", key: "name" },
    {
      title: "Stage",
      key: "stage",
      width: 160,
      render: (_: unknown, record: ProjectTask) => {
        const stageOptions = (stages || []).map((s) => ({
          value: s.id,
          label: s.name,
        }));
        const currentStageId = record.stageId;
        return (
          <Select
            value={currentStageId}
            options={stageOptions}
            onChange={(val) => handleUpdateTaskStage(record.id, val)}
            loading={updatingStage === record.id}
            size="small"
            style={{ width: 130 }}
            placeholder="Set stage"
          />
        );
      },
    },
    {
      title: "Start Date",
      dataIndex: "startDate",
      key: "startDate",
      render: (d: string | null) => d || "-",
    },
    {
      title: "Due Date",
      dataIndex: "dueDate",
      key: "dueDate",
      render: (d: string | null) => d || "-",
    },
    {
      title: "Est. Hours",
      dataIndex: "estimatedHours",
      key: "estimatedHours",
      render: (h: number | null) => h ?? "-",
    },
    {
      title: "Actual Hours",
      dataIndex: "actualHours",
      key: "actualHours",
      render: (h: number | null) => h ?? "-",
    },
    {
      title: "Actions",
      key: "actions",
      width: 80,
      render: (_: unknown, record: ProjectTask) => (
        <Button
          type="link"
          icon={<EditOutlined />}
          onClick={() => openEditModal(record)}
        />
      ),
    },
  ];

  return (
    <div className={styles.container}>
      <Space style={{ marginBottom: 16 }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/projects")}
        >
          Back to Projects
        </Button>
        {isAdminOrManager && (
          <Popconfirm
            title="Delete this project?"
            onConfirm={handleDeleteProject}
          >
            <Button danger icon={<DeleteOutlined />}>
              Delete Project
            </Button>
          </Popconfirm>
        )}
      </Space>

      <Card
        title={project.name}
        extra={
          <Space>
            {isAdminOrManager &&
              availableTransitions.map((state) => (
                <Popconfirm
                  key={state}
                  title={`Move to ${PROJECT_STATE_LABELS[state]}?`}
                  onConfirm={() => handleStateChange(state)}
                >
                  <Button size="small">
                    Move to {PROJECT_STATE_LABELS[state]}
                  </Button>
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
            <Tag color={PROJECT_STATE_COLORS[project.state]}>
              {PROJECT_STATE_LABELS[project.state]}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Budget">
            {project.budget ? `$${project.budget.toLocaleString()}` : "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Start Date">
            {project.dateStart || "-"}
          </Descriptions.Item>
          <Descriptions.Item label="End Date">
            {project.dateEnd || "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Created">
            {project.createdAt
              ? new Date(project.createdAt).toLocaleDateString()
              : "-"}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card
        title="Tasks"
        style={{ marginTop: 16 }}
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              const defaultStage = stages?.find((s) => s.isDefault);
              if (defaultStage) form.setFieldValue("stageId", defaultStage.id);
              setTaskModalOpen(true);
            }}
          >
            Add Task
          </Button>
        }
      >
        {tasks.length === 0 && !tasksLoading ? (
          <Empty description="No tasks yet" />
        ) : (
          <Table
            dataSource={tasks}
            columns={taskColumns}
            rowKey="id"
            loading={tasksLoading}
            pagination={false}
          />
        )}
      </Card>

      <Modal
        title="New Task"
        open={taskModalOpen}
        onCancel={() => {
          setTaskModalOpen(false);
          form.resetFields();
        }}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateTask}>
          <Form.Item
            name="name"
            label="Task Name"
            rules={[{ required: true, message: "Name is required" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="startDate" label="Start Date">
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="dueDate" label="Due Date">
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="estimatedHours" label="Estimated Hours">
            <Input type="number" min={0} />
          </Form.Item>
          <Form.Item name="stageId" label="Stage">
            <Select
              options={(stages || []).map((s) => ({
                value: s.id,
                label: s.name,
              }))}
              placeholder="Select stage"
              defaultValue={stages?.find((s) => s.isDefault)?.id}
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={creating} block>
              Create Task
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Edit Task"
        open={editModalOpen}
        onCancel={() => {
          setEditModalOpen(false);
          setEditingTask(null);
          editForm.resetFields();
        }}
        footer={null}
      >
        <Form form={editForm} layout="vertical" onFinish={handleEditTask}>
          <Form.Item
            name="name"
            label="Task Name"
            rules={[{ required: true, message: "Name is required" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="startDate" label="Start Date">
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="dueDate" label="Due Date">
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="estimatedHours" label="Estimated Hours">
            <Input type="number" min={0} />
          </Form.Item>
          <Form.Item name="actualHours" label="Actual Hours">
            <Input type="number" min={0} />
          </Form.Item>
          <Form.Item name="stageId" label="Stage">
            <Select
              options={(stages || []).map((s) => ({
                value: s.id,
                label: s.name,
              }))}
              placeholder="Select stage"
              allowClear
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Update Task
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProjectDetail;

import { useState } from "react";
import {
  Table,
  Card,
  Typography,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  message,
  Spin,
} from "antd";
import { PlusOutlined, DeleteOutlined, UploadOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import { useEmployees, useDepartments, useJobPositions } from "../../../hooks";
import { ImportModal } from "../../../components/common/ImportModal";
import { hrService } from "../../../services/hrService";
import type { Employee } from "../../../types/hr";
import type { ImportFieldMapping } from "../../../utils/csv";
import styles from "./EmployeesList.module.css";

const { Title } = Typography;
const { Option } = Select;

export const EmployeesList: React.FC = () => {
  const {
    data: employees,
    loading,
    total,
    refetch,
    createEmployee,
    deleteEmployee,
  } = useEmployees();
  const { data: departments } = useDepartments();
  const { data: positions } = useJobPositions();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [creating, setCreating] = useState(false);
  const [form] = Form.useForm();
  const [importOpen, setImportOpen] = useState(false);

  const handleImport = async (data: Record<string, string>[], mappings: ImportFieldMapping[]) => {
    let success = 0;
    let errors = 0;
    for (const row of data) {
      try {
        const payload: Record<string, unknown> = {};
        mappings.forEach((m) => {
          payload[m.entityField] = row[m.csvColumn];
        });
        if (payload.hireDate) {
          payload.hireDate = new Date(payload.hireDate as string).toISOString().split("T")[0];
        }
        await hrService.employees.create(payload as any);
        success++;
      } catch {
        errors++;
      }
    }
    refetch();
    return { successCount: success, errorCount: errors };
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setCreating(true);

      const employeeData = {
        ...values,
        hireDate: values.hireDate
          ? values.hireDate.format("YYYY-MM-DD")
          : undefined,
      };

      await createEmployee(employeeData);
      message.success("Employee created successfully");
      setIsModalOpen(false);
      form.resetFields();
      setEditingEmployee(null);
      refetch();
    } catch (error) {
      message.error("Failed to create employee");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: number) => {
    Modal.confirm({
      title: "Delete Employee",
      content: "Are you sure you want to delete this employee?",
      onOk: async () => {
        try {
          await deleteEmployee(id);
          message.success("Employee deleted successfully");
          refetch();
        } catch (error) {
          message.error("Failed to delete employee");
        }
      },
    });
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "firstName",
      key: "name",
      render: (_: unknown, record: Employee) =>
        `${record.firstName} ${record.lastName}`,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Department",
      dataIndex: "departmentName",
      key: "departmentName",
      render: (v: string) => v || "-",
    },
    {
      title: "Position",
      dataIndex: "positionName",
      key: "positionName",
      render: (v: string) => v || "-",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: unknown, record: Employee) => (
        <Space>
          <Link to={`/hr/employees/${record.id}`}>View</Link>
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          />
        </Space>
      ),
    },
  ];

  return (
    <Card>
      <div className={styles.header}>
        <Title level={3}>Employee List</Title>
        <Space>
          <Button icon={<UploadOutlined />} onClick={() => setImportOpen(true)}>Import CSV</Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingEmployee(null);
              form.resetFields();
              setIsModalOpen(true);
            }}
          >
            Add Employee
          </Button>
        </Space>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 40 }}>
          <Spin />
        </div>
      ) : (
        <Table
          dataSource={employees}
          columns={columns}
          rowKey="id"
          pagination={{
            total,
            pageSize: 10,
          }}
        />
      )}

      <Modal
        title={editingEmployee ? "Edit Employee" : "Add Employee"}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
          setEditingEmployee(null);
        }}
        confirmLoading={creating}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="firstName"
            label="First Name"
            rules={[{ required: true, message: "Please enter first name" }]}
          >
            <Input placeholder="Enter first name" />
          </Form.Item>
          <Form.Item
            name="lastName"
            label="Last Name"
            rules={[{ required: true, message: "Please enter last name" }]}
          >
            <Input placeholder="Enter last name" />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Please enter email" },
              { type: "email", message: "Please enter valid email" },
            ]}
          >
            <Input placeholder="Enter email" />
          </Form.Item>
          <Form.Item
            name="departmentId"
            label="Department"
            rules={[{ required: true, message: "Please select department" }]}
          >
            <Select placeholder="Select department">
              {departments.map((d) => (
                <Option key={d.id} value={d.id}>{d.name}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="positionId"
            label="Position"
            rules={[{ required: true, message: "Please select position" }]}
          >
            <Select placeholder="Select position">
              {positions.map((p) => (
                <Option key={p.id} value={p.id}>{p.title}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="phone" label="Phone">
            <Input placeholder="Enter phone number" />
          </Form.Item>
          <Form.Item
            name="hireDate"
            label="Hire Date"
            rules={[{ required: true, message: "Please select hire date" }]}
          >
            <DatePicker
              style={{ width: "100%" }}
              placeholder="Select hire date"
            />
          </Form.Item>
        </Form>
      </Modal>

      <ImportModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        title="Employees"
        entityType="employees"
        fields={[
          { label: "First Name", value: "firstName", required: true },
          { label: "Last Name", value: "lastName", required: true },
          { label: "Email", value: "email", required: true },
          { label: "Phone", value: "phone" },
          { label: "Hire Date", value: "hireDate" },
        ]}
        onImport={handleImport}
      />
    </Card>
  );
};

export default EmployeesList;

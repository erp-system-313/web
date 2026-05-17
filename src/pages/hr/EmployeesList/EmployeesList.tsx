import { useState, useEffect } from "react";
import {
  Table,
  Card,
  Tag,
  Typography,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Checkbox,
  Alert,
  message,
  Spin,
} from "antd";
import { PlusOutlined, DeleteOutlined, UploadOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import { useEmployees, useDepartments, useJobPositions } from "../../../hooks";
import { ImportModal } from "../../../components/common/ImportModal";
import { hrService } from "../../../services/hrService";
import { usersService } from "../../../services/usersService";
import { adminService } from "../../../services/adminService";
import type { Employee, EmployeeStatus } from "../../../types/hr";
import type { ImportFieldMapping } from "../../../utils/csv";
import styles from "./EmployeesList.module.css";

const { Title } = Typography;
const { Option } = Select;

export const EmployeesList: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const {
    data: employees,
    loading,
    total,
    refetch,
    createEmployee,
    deleteEmployee,
  } = useEmployees({ status: statusFilter });
  const { data: departments } = useDepartments();
  const { data: positions } = useJobPositions();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [creating, setCreating] = useState(false);
  const [form] = Form.useForm();
  const watchedDept = Form.useWatch("departmentId", form);
  const emailVal = Form.useWatch("email", form);
  const userIdVal = Form.useWatch("userId", form);
  const [importOpen, setImportOpen] = useState(false);
  const [createAccount, setCreateAccount] = useState(false);
  const [roles, setRoles] = useState<{ id: number; name: string }[]>([]);
  const [userAccounts, setUserAccounts] = useState<{ id: number; fullName: string; email: string }[]>([]);
  const [selectedUserEmail, setSelectedUserEmail] = useState<string | null>(null);

  useEffect(() => {
    if (isModalOpen) {
      usersService.getAll({ page: 0, size: 200, isActive: true }).then((res) => {
        setUserAccounts(
          (res.content ?? []).map((u) => ({ id: u.id, fullName: u.fullName, email: u.email }))
        );
      }).catch(() => setUserAccounts([]));
      adminService.roles.getAll().then((res) => {
        setRoles(res.map((r: { id: number; name: string }) => ({ id: r.id, name: r.name })));
      }).catch(() => setRoles([]));
      setSelectedUserEmail(null);
    }
  }, [isModalOpen]);

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
      await form.validateFields();
    } catch {
      message.error("Please fix the validation errors before submitting");
      return;
    }
    try {
      setCreating(true);
      const values = form.getFieldsValue();

      const employeeData: Record<string, any> = {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phone: values.phone,
        address: values.address,
        departmentId: values.departmentId,
        positionId: values.positionId,
        hireDate: values.hireDate
          ? values.hireDate.format("YYYY-MM-DD")
          : undefined,
      };
      if (!values._createAccount && values.userId) {
        employeeData.userId = values.userId;
      }

      const newEmployee = await createEmployee(employeeData as any);

      if (values._createAccount) {
        await usersService.create({
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          roleId: values._roleId,
          password: values._password,
          employeeId: newEmployee.id,
        });
      }

      message.success("Employee created successfully");
      setIsModalOpen(false);
      form.resetFields();
      setEditingEmployee(null);
      setCreateAccount(false);
      refetch();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to create employee";
      message.error(msg);
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
        } catch (err) {
          const msg = err instanceof Error ? err.message : "Failed to delete employee";
          message.error(msg);
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
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (v: EmployeeStatus) => {
        const colorMap: Record<EmployeeStatus, string> = {
          ACTIVE: "green",
          INACTIVE: "default",
          ON_LEAVE: "orange",
          TERMINATED: "red",
        };
        return <Tag color={colorMap[v] || "default"}>{v?.replace("_", " ")}</Tag>;
      },
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
          <Select
            style={{ width: 160 }}
            value={statusFilter}
            onChange={(v) => setStatusFilter(v)}
            options={[
              { value: "ALL", label: "All Statuses" },
              { value: "ACTIVE", label: "Active" },
              { value: "INACTIVE", label: "Inactive" },
              { value: "ON_LEAVE", label: "On Leave" },
              { value: "TERMINATED", label: "Terminated" },
            ]}
          />
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
              {positions
                .filter((p) => !watchedDept || p.departmentId === watchedDept)
                .map((p) => (
                  <Option key={p.id} value={p.id}>{p.title}</Option>
                ))}
            </Select>
          </Form.Item>
          <Form.Item name="phone" label="Phone" rules={[{ pattern: /^[0-9+\-() ]+$/, message: "Only numbers and phone symbols allowed" }]}>
            <Input placeholder="Enter phone number" maxLength={15} />
          </Form.Item>
          <Form.Item name="address" label="Address">
            <Input placeholder="Enter address" />
          </Form.Item>
          <Form.Item name="userId" label="User Account">
            <Select
              placeholder="Link to existing user (optional)"
              allowClear
              showSearch
              disabled={createAccount}
              filterOption={(input, option) =>
                (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
              }
              onChange={(val) => {
                const user = userAccounts.find((u) => u.id === val);
                setSelectedUserEmail(user?.email ?? null);
                if (user?.email && !form.getFieldValue("email")) {
                  form.setFieldValue("email", user.email);
                }
              }}
              options={userAccounts.map((u) => ({
                value: u.id,
                label: `${u.fullName} (${u.email})`,
              }))}
            />
          </Form.Item>
          {selectedUserEmail && emailVal && selectedUserEmail !== emailVal && (
            <Alert
              type="warning"
              showIcon
              message={`Linked user uses "${selectedUserEmail}" but employee email is "${emailVal}". ` +
                `The employee email is used for HR communication; the user email is used for login.`}
              style={{ marginBottom: 16 }}
            />
          )}
          <Form.Item name="_createAccount" valuePropName="checked">
            <Checkbox
              disabled={!!userIdVal}
              onChange={(e) => {
                setCreateAccount(e.target.checked);
                if (e.target.checked) {
                  form.setFieldValue("userId", undefined);
                  setSelectedUserEmail(null);
                }
              }}
            >
              Create user account for this employee
            </Checkbox>
          </Form.Item>
          {createAccount && (
            <>
              <Form.Item
                name="_roleId"
                label="Account Role"
                rules={[{ required: true, message: "Please select a role" }]}
              >
                <Select placeholder="Select role">
                  {roles.map((r) => (
                    <Option key={r.id} value={r.id}>{r.name}</Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                name="_password"
                label="Account Password"
                rules={[
                  { required: true, message: "Please enter a password" },
                  { min: 6, message: "Password must be at least 6 characters" },
                ]}
              >
                <Input.Password placeholder="Enter password" />
              </Form.Item>
            </>
          )}
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

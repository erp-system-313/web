import { useState } from 'react';
import { Table, Card, Typography, Button, Space, Modal, Form, Input, DatePicker, message, Spin } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useEmployees } from '../../../hooks';
import type { Employee } from '../../../services/hrService';
import dayjs from 'dayjs';
import styles from './EmployeesList.module.css';

const { Title } = Typography;

export const EmployeesList: React.FC = () => {
  const { data: employees, loading, total, refetch, createEmployee, deleteEmployee } = useEmployees();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [creating, setCreating] = useState(false);
  const [form] = Form.useForm();

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setCreating(true);
      
      const employeeData = {
        ...values,
        hireDate: values.hireDate ? values.hireDate.format('YYYY-MM-DD') : undefined,
      };
      
      await createEmployee(employeeData);
      message.success('Employee created successfully');
      setIsModalOpen(false);
      form.resetFields();
      setEditingEmployee(null);
      refetch();
    } catch (error) {
      message.error('Failed to create employee');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: number) => {
    Modal.confirm({
      title: 'Delete Employee',
      content: 'Are you sure you want to delete this employee?',
      onOk: async () => {
        try {
          await deleteEmployee(id);
          message.success('Employee deleted successfully');
          refetch();
        } catch (error) {
          message.error('Failed to delete employee');
        }
      },
    });
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'firstName',
      key: 'name',
      render: (_: unknown, record: Employee) =>
        `${record.firstName} ${record.lastName}`,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Department',
      dataIndex: 'department',
      key: 'department',
    },
    {
      title: 'Position',
      dataIndex: 'position',
      key: 'position',
    },
    {
      title: 'Actions',
      key: 'actions',
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
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}>
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
        title={editingEmployee ? 'Edit Employee' : 'Add Employee'}
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
            rules={[{ required: true, message: 'Please enter first name' }]}
          >
            <Input placeholder="Enter first name" />
          </Form.Item>
          <Form.Item
            name="lastName"
            label="Last Name"
            rules={[{ required: true, message: 'Please enter last name' }]}
          >
            <Input placeholder="Enter last name" />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please enter email' },
              { type: 'email', message: 'Please enter valid email' }
            ]}
          >
            <Input placeholder="Enter email" />
          </Form.Item>
          <Form.Item
            name="department"
            label="Department"
            rules={[{ required: true, message: 'Please enter department' }]}
          >
            <Input placeholder="Enter department" />
          </Form.Item>
          <Form.Item
            name="position"
            label="Position"
            rules={[{ required: true, message: 'Please enter position' }]}
          >
            <Input placeholder="Enter position" />
          </Form.Item>
          <Form.Item
            name="phone"
            label="Phone"
          >
            <Input placeholder="Enter phone number" />
          </Form.Item>
          <Form.Item
            name="hireDate"
            label="Hire Date"
            rules={[{ required: true, message: 'Please select hire date' }]}
          >
            <DatePicker style={{ width: '100%' }} placeholder="Select hire date" />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default EmployeesList;

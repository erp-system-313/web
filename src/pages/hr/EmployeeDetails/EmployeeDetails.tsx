import { Form, Input, Select, InputNumber, Card, Typography, Button, Space, Divider } from 'antd';
import { mockEmployees } from '../../../data/mockEmployees';
import type { Employee, EmployeeStatus } from '../../../types/hr';
import styles from './EmployeeDetails.module.css';

const { Title } = Typography;
const { Option } = Select;

export const EmployeeDetails: React.FC = () => {
  const [form] = Form.useForm();
  const employee = mockEmployees[0];

  const onFinish = (values: unknown) => {
    console.log('Form values:', values);
  };

  return (
    <div className={styles.container}>
      <Card>
        <Title level={3}>Employee Details</Title>
        <Divider />

        <Form
          form={form}
          layout="vertical"
          initialValues={{
            firstName: employee.firstName,
            lastName: employee.lastName,
            email: employee.email,
            phone: employee.phone,
            department: employee.department,
            position: employee.position,
            hireDate: employee.hireDate,
            salary: employee.salary,
            status: employee.status,
          }}
          onFinish={onFinish}
        >
          <div className={styles.formGrid}>
            <Form.Item
              label="First Name"
              name="firstName"
              rules={[{ required: true, message: 'First name is required' }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Last Name"
              name="lastName"
              rules={[{ required: true, message: 'Last name is required' }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: 'Email is required' },
                { type: 'email', message: 'Please enter a valid email' },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item label="Phone" name="phone">
              <Input />
            </Form.Item>

            <Form.Item label="Department" name="department">
              <Input />
            </Form.Item>

            <Form.Item label="Position" name="position">
              <Input />
            </Form.Item>

            <Form.Item label="Hire Date" name="hireDate">
              <Input disabled />
            </Form.Item>

            <Form.Item label="Salary" name="salary">
              <InputNumber
                style={{ width: '100%' }}
                prefix="$"
                disabled
              />
            </Form.Item>

            <Form.Item label="Status" name="status">
              <Select>
                <Option value="ACTIVE">Active</Option>
                <Option value="INACTIVE">Inactive</Option>
                <Option value="TERMINATED">Terminated</Option>
              </Select>
            </Form.Item>
          </div>

          <Divider />

          <Space>
            <Button type="primary" htmlType="submit">
              Save Changes
            </Button>
            <Button>
              Cancel
            </Button>
          </Space>
        </Form>
      </Card>
    </div>
  );
};

export default EmployeeDetails;

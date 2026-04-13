import { Table, Card, Typography } from 'antd';
import { mockEmployees } from '../../data/mockEmployees';
import type { Employee } from '../../types/models/employee';

const { Title } = Typography;

const EmployeeList = () => {
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
      render: (_: unknown, _record: Employee) => (
        <span>
          <a href={`/hr/employees/${_record.id}`}>View</a>
          {' | '}
          <a href={`/hr/employees/${_record.id}/edit`}>Edit</a>
        </span>
      ),
    },
  ];

  return (
    <Card>
      <Title level={3}>Employee List</Title>
      <Table
        dataSource={mockEmployees}
        columns={columns}
        rowKey="id"
      />
    </Card>
  );
};

export default EmployeeList;

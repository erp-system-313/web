import { Table, Card, Typography } from 'antd';
import { Link } from 'react-router-dom';
import { useEmployees } from '../../../hooks';
import type { Employee } from '../../../types/hr';

const { Title } = Typography;

export const EmployeesList: React.FC = () => {
  const { data: employees, loading, total, refetch } = useEmployees();
  
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
        <span>
          <Link to={`/hr/employees/${record.id}`}>View</Link>
        </span>
      ),
    },
  ];

  return (
    <Card>
      <Title level={3}>Employee List</Title>
      <Table
        dataSource={employees}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{
          total,
          pageSize: 10,
        }}
      />
    </Card>
  );
};

export default EmployeesList;

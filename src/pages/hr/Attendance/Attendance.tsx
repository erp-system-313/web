import { useState } from 'react';
import { Card, Typography, Table, Button, Space, Tag, message } from 'antd';
import { ClockCircleOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useAttendance, useClockIn, useClockOut } from '../../../hooks';
import styles from './Attendance.module.css';

const { Title } = Typography;

export const AttendancePage: React.FC = () => {
  const { data: records, loading, refetch } = useAttendance();
  const { clockIn, loading: clockingIn } = useClockIn();
  const { clockOut, loading: clockingOut } = useClockOut();
  const [todayCheckedIn, setTodayCheckedIn] = useState(false);

  const handleClockIn = async () => {
    try {
      await clockIn();
      setTodayCheckedIn(true);
      message.success('Clocked in successfully');
      refetch();
    } catch {
      message.error('Failed to clock in');
    }
  };

  const handleClockOut = async () => {
    try {
      await clockOut();
      setTodayCheckedIn(false);
      message.success('Clocked out successfully');
      refetch();
    } catch {
      message.error('Failed to clock out');
    }
  };

  const columns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: 'Employee ID',
      dataIndex: 'employeeId',
      key: 'employeeId',
    },
    {
      title: 'Check In',
      dataIndex: 'checkIn',
      key: 'checkIn',
      render: (checkIn: string) => checkIn || '-',
    },
    {
      title: 'Check Out',
      dataIndex: 'checkOut',
      key: 'checkOut',
      render: (checkOut: string) => checkOut || '-',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const color = status === 'PRESENT' ? 'green' : status === 'LATE' ? 'orange' : 'red';
        return <Tag color={color}>{status}</Tag>;
      },
    },
  ];

  return (
    <div className={styles.container}>
      <Card>
        <Title level={3}>Attendance</Title>

        <div className={styles.clockSection}>
          <Space size="large">
            <Button
              type="primary"
              icon={<ClockCircleOutlined />}
              onClick={handleClockIn}
              loading={clockingIn}
              disabled={todayCheckedIn}
              size="large"
            >
              Clock In
            </Button>
            <Button
              type="primary"
              danger
              icon={<CheckCircleOutlined />}
              onClick={handleClockOut}
              loading={clockingOut}
              disabled={!todayCheckedIn}
              size="large"
            >
              Clock Out
            </Button>
          </Space>
        </div>

        <div className={styles.tableSection}>
          <Title level={5}>Attendance Records</Title>
          <Table
            dataSource={records}
            columns={columns}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} records`,
            }}
          />
        </div>
      </Card>
    </div>
  );
};

export default AttendancePage;

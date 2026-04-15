import { useState } from 'react';
import { Card, Typography, Table, Button, Space, Tag, Modal, message, Select, Input, DatePicker } from 'antd';
import { PlusOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { useLeaveRequests, useLeaveBalances, useCreateLeaveRequest, useApproveLeaveRequest, useRejectLeaveRequest } from '../../../hooks';
import type { LeaveRequest, LeaveStatus, LeaveType } from '../../../types/hr';
import styles from './LeaveRequests.module.css';

const { Title } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { TextArea } = Input;

export const LeaveRequests: React.FC = () => {
  const { data: requests, loading, refetch } = useLeaveRequests();
  const { data: balances } = useLeaveBalances();
  const { create, loading: creating } = useCreateLeaveRequest();
  const { approve, loading: approving } = useApproveLeaveRequest();
  const { reject, loading: rejecting } = useRejectLeaveRequest();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [leaveType, setLeaveType] = useState<LeaveType | undefined>();
  const [reason, setReason] = useState('');
  const [dateRange, setDateRange] = useState<[string, string] | null>(null);

  const handleSubmit = async () => {
    if (!leaveType || !dateRange || !reason) {
      message.error('Please fill in all fields');
      return;
    }

    try {
      await create({
        startDate: dateRange[0],
        endDate: dateRange[1],
        type: leaveType,
        reason,
      });
      message.success('Leave request submitted');
      setIsModalOpen(false);
      setLeaveType(undefined);
      setReason('');
      setDateRange(null);
      refetch();
    } catch {
      message.error('Failed to submit leave request');
    }
  };

  const handleApprove = async (id: number) => {
    try {
      await approve(id);
      message.success('Leave request approved');
      refetch();
    } catch {
      message.error('Failed to approve');
    }
  };

  const handleReject = async (id: number) => {
    try {
      await reject(id);
      message.success('Leave request rejected');
      refetch();
    } catch {
      message.error('Failed to reject');
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Employee ID',
      dataIndex: 'employeeId',
      key: 'employeeId',
    },
    {
      title: 'Start Date',
      dataIndex: 'startDate',
      key: 'startDate',
    },
    {
      title: 'End Date',
      dataIndex: 'endDate',
      key: 'endDate',
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: LeaveType) => <Tag color="blue">{type}</Tag>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: LeaveStatus) => {
        const color = status === 'APPROVED' ? 'green' : status === 'REJECTED' ? 'red' : 'orange';
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: 'Reason',
      dataIndex: 'reason',
      key: 'reason',
      ellipsis: true,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: unknown, record: LeaveRequest) => (
        <Space>
          {record.status === 'PENDING' && (
            <>
              <Button
                type="link"
                icon={<CheckOutlined />}
                onClick={() => handleApprove(record.id)}
                loading={approving}
              >
                Approve
              </Button>
              <Button
                type="link"
                danger
                icon={<CloseOutlined />}
                onClick={() => handleReject(record.id)}
                loading={rejecting}
              >
                Reject
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className={styles.container}>
      <Card>
        <div className={styles.header}>
          <Title level={3}>Leave Requests</Title>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
            New Request
          </Button>
        </div>

        {balances && balances.length > 0 && (
          <div className={styles.balanceSection}>
            <Title level={5}>Leave Balance</Title>
            <div className={styles.balanceCards}>
              {balances.map((balance) => (
                <Card key={balance.type} size="small" className={styles.balanceCard}>
                  <div className={styles.balanceType}>{balance.type}</div>
                  <div className={styles.balanceRemaining}>{balance.remainingDays} days</div>
                  <div className={styles.balanceUsed}>
                    Used: {balance.usedDays} / {balance.totalDays}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        <Table
          dataSource={requests}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} requests`,
          }}
        />

        <Modal
          title="New Leave Request"
          open={isModalOpen}
          onOk={handleSubmit}
          onCancel={() => setIsModalOpen(false)}
          confirmLoading={creating}
        >
          <div className={styles.formFields}>
            <div className={styles.field}>
              <label>Leave Type</label>
              <Select
                placeholder="Select leave type"
                value={leaveType}
                onChange={setLeaveType}
                style={{ width: '100%' }}
              >
                <Option value="ANNUAL">Annual Leave</Option>
                <Option value="SICK">Sick Leave</Option>
                <Option value="PERSONAL">Personal Leave</Option>
                <Option value="UNPAID">Unpaid Leave</Option>
              </Select>
            </div>
            <div className={styles.field}>
              <label>Date Range</label>
              <DatePicker.RangePicker
                onChange={(dates) => {
                  if (dates && dates[0] && dates[1]) {
                    setDateRange([
                      dates[0].format('YYYY-MM-DD'),
                      dates[1].format('YYYY-MM-DD'),
                    ]);
                  }
                }}
                style={{ width: '100%' }}
              />
            </div>
            <div className={styles.field}>
              <label>Reason</label>
              <TextArea
                rows={4}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Enter reason for leave"
              />
            </div>
          </div>
        </Modal>
      </Card>
    </div>
  );
};

export default LeaveRequests;

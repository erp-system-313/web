import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Card, Typography, Table, Button, Space, Tag, Modal, message } from 'antd';
import { PlusOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { useLeaveRequests, useLeaveBalances, useCreateLeaveRequest, useApproveLeaveRequest, useRejectLeaveRequest } from '../../../hooks';
import type { LeaveRequest, LeaveStatus, LeaveType } from '../../../types/hr';
import styles from './LeaveRequests.module.css';

const { Title, Text } = Typography;

interface LeaveFormData {
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
}

export const LeaveRequests: React.FC = () => {
  const { data: requests, loading, refetch } = useLeaveRequests();
  const { data: balances } = useLeaveBalances();
  const { create, loading: creating } = useCreateLeaveRequest();
  const { approve, loading: approving } = useApproveLeaveRequest();
  const { reject, loading: rejecting } = useRejectLeaveRequest();
  
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LeaveFormData>();

  const onSubmit = async (data: LeaveFormData) => {
    try {
      await create({
        startDate: data.startDate,
        endDate: data.endDate,
        type: data.leaveType,
        reason: data.reason,
      });
      message.success('Leave request submitted');
      setIsModalOpen(false);
      reset();
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
          onCancel={() => { setIsModalOpen(false); reset(); }}
          footer={null}
        >
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className={styles.formFields}>
              <div className={styles.field}>
                <label>Leave Type *</label>
                <select 
                  {...register('leaveType', { required: 'Please select a leave type' })}
                  style={{ width: '100%', padding: '8px', height: '40px' }}
                >
                  <option value="">Select leave type</option>
                  <option value="ANNUAL">Annual Leave</option>
                  <option value="SICK">Sick Leave</option>
                  <option value="PERSONAL">Personal Leave</option>
                  <option value="UNPAID">Unpaid Leave</option>
                </select>
                {errors.leaveType && (
                  <Text type="danger" style={{ fontSize: 12 }}>{errors.leaveType.message}</Text>
                )}
              </div>
              
              <div className={styles.field}>
                <label>Start Date *</label>
                <input 
                  type="date"
                  {...register('startDate', { required: 'Start date is required' })}
                  style={{ width: '100%', padding: '8px', height: '40px' }}
                />
                {errors.startDate && (
                  <Text type="danger" style={{ fontSize: 12 }}>{errors.startDate.message}</Text>
                )}
              </div>
              
              <div className={styles.field}>
                <label>End Date *</label>
                <input 
                  type="date"
                  {...register('endDate', { required: 'End date is required' })}
                  style={{ width: '100%', padding: '8px', height: '40px' }}
                />
                {errors.endDate && (
                  <Text type="danger" style={{ fontSize: 12 }}>{errors.endDate.message}</Text>
                )}
              </div>
              
              <div className={styles.field}>
                <label>Reason *</label>
                <textarea 
                  {...register('reason', { 
                    required: 'Reason is required',
                    minLength: { value: 10, message: 'Please provide more details' }
                  })}
                  rows={4}
                  placeholder="Enter reason for leave"
                  style={{ width: '100%', padding: '8px' }}
                />
                {errors.reason && (
                  <Text type="danger" style={{ fontSize: 12 }}>{errors.reason.message}</Text>
                )}
              </div>
            </div>
            
            <div style={{ marginTop: 16, textAlign: 'right' }}>
              <Button onClick={() => { setIsModalOpen(false); reset(); }} style={{ marginRight: 8 }}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" loading={creating}>
                Submit Request
              </Button>
            </div>
          </form>
        </Modal>
      </Card>
    </div>
  );
};

export default LeaveRequests;

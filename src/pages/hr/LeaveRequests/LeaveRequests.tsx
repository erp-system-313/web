import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Card,
  Typography,
  Table,
  Button,
  Space,
  Tag,
  Modal,
  message,
  Input,
} from "antd";
import {
  PlusOutlined,
  CheckOutlined,
  CloseOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import {
  useLeaveRequests,
  useLeaveBalances,
  useCreateLeaveRequest,
  useApproveLeaveRequest,
  useRejectLeaveRequest,
} from "../../../hooks";
import type { LeaveRequest, LeaveStatus, LeaveType } from "../../../types/hr";
import styles from "./LeaveRequests.module.css";
import formStyles from "../../../components/common/FormCard/FormCard.module.css";

const { Title } = Typography;

interface LeaveFormData {
  type: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
}

export const LeaveRequests: React.FC = () => {
  const { data: requests, loading, refetch } = useLeaveRequests();
  const { data: balances } = useLeaveBalances();
  const { create, loading: creating } = useCreateLeaveRequest();
  const { approve } = useApproveLeaveRequest();
  const { reject } = useRejectLeaveRequest();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rejectModal, setRejectModal] = useState<{
    id: number;
    open: boolean;
    reason: string;
  }>({
    id: 0,
    open: false,
    reason: "",
  });
  const [reasonModal, setReasonModal] = useState<{
    open: boolean;
    reason: string;
  }>({
    open: false,
    reason: "",
  });
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LeaveFormData>();

  const onSubmit = async (data: LeaveFormData) => {
    try {
      await create({
        employeeId: 0,
        startDate: data.startDate,
        endDate: data.endDate,
        type: data.type,
        reason: data.reason,
      });
      message.success("Leave request submitted");
      setIsModalOpen(false);
      reset();
      refetch();
    } catch {
      message.error("Failed to submit leave request");
    }
  };

  const handleApprove = async (id: number) => {
    setActionLoading(id);
    try {
      await approve(id);
      message.success("Leave request approved");
      refetch();
    } catch {
      message.error("Failed to approve");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: number, reason: string) => {
    setActionLoading(id);
    try {
      await reject(id, reason);
      message.success("Leave request rejected");
      refetch();
    } catch {
      message.error("Failed to reject");
    } finally {
      setActionLoading(null);
    }
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Employee ID",
      dataIndex: "employeeId",
      key: "employeeId",
    },
    {
      title: "Start Date",
      dataIndex: "startDate",
      key: "startDate",
    },
    {
      title: "End Date",
      dataIndex: "endDate",
      key: "endDate",
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      render: (type: LeaveType) => <Tag color="blue">{type}</Tag>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: LeaveStatus) => {
        const color =
          status === "APPROVED"
            ? "green"
            : status === "REJECTED"
              ? "red"
              : "orange";
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: "Reason",
      dataIndex: "reason",
      key: "reason",
      ellipsis: true,
    },
    {
      title: "Actions",
      key: "actions",
      width: 200,
      align: "center",
      render: (_: unknown, record: LeaveRequest) => (
        <Space>
          {record.status === "PENDING" && (
            <>
              <Button
                type="link"
                icon={<CheckOutlined />}
                onClick={() => handleApprove(record.id)}
                loading={actionLoading === record.id}
              >
                Approve
              </Button>
              <Button
                type="link"
                danger
                icon={<CloseOutlined />}
                onClick={() =>
                  setRejectModal({ id: record.id, open: true, reason: "" })
                }
                loading={actionLoading === record.id}
              >
                Reject
              </Button>
            </>
          )}
          {record.status === "REJECTED" && record.rejectionReason && (
            <Button
              type="link"
              icon={<EyeOutlined />}
              onClick={() =>
                setReasonModal({ open: true, reason: record.rejectionReason! })
              }
            >
              View Reason
            </Button>
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
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsModalOpen(true)}
          >
            New Request
          </Button>
        </div>

        {balances && balances.length > 0 && (
          <div className={styles.balanceSection}>
            <Title level={5}>Leave Balance</Title>
            <div className={styles.balanceCards}>
              {balances.map((balance) => (
                <Card
                  key={balance.type}
                  size="small"
                  className={styles.balanceCard}
                >
                  <div className={styles.balanceType}>{balance.type}</div>
                  <div className={styles.balanceRemaining}>
                    {balance.remainingDays} days
                  </div>
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
          onCancel={() => {
            setIsModalOpen(false);
            reset();
          }}
          footer={null}
        >
          <form onSubmit={handleSubmit(onSubmit)}>
            <div>
              <div className={formStyles.formItem}>
                <label>Leave Type *</label>
                <select
                  {...register("type", {
                    required: "Please select a leave type",
                  })}
                  style={{ width: "100%" }}
                >
                  <option value="">Select leave type</option>
                  <option value="ANNUAL">Annual Leave</option>
                  <option value="SICK">Sick Leave</option>
                  <option value="PERSONAL">Personal Leave</option>
                  <option value="UNPAID">Unpaid Leave</option>
                  <option value="MATERNITY">Maternity Leave</option>
                  <option value="PATERNITY">Paternity Leave</option>
                </select>
                {errors.type && (
                  <span className={formStyles.error}>
                    {errors.type.message}
                  </span>
                )}
              </div>

              <div className={formStyles.formItem}>
                <label>Start Date *</label>
                <input
                  type="date"
                  {...register("startDate", {
                    required: "Start date is required",
                  })}
                  style={{ width: "100%" }}
                />
                {errors.startDate && (
                  <span className={formStyles.error}>
                    {errors.startDate.message}
                  </span>
                )}
              </div>

              <div className={formStyles.formItem}>
                <label>End Date *</label>
                <input
                  type="date"
                  {...register("endDate", { required: "End date is required" })}
                  style={{ width: "100%" }}
                />
                {errors.endDate && (
                  <span className={formStyles.error}>
                    {errors.endDate.message}
                  </span>
                )}
              </div>

              <div className={formStyles.formItem}>
                <label>Reason *</label>
                <textarea
                  {...register("reason", {
                    required: "Reason is required",
                    minLength: {
                      value: 10,
                      message: "Please provide more details",
                    },
                  })}
                  rows={4}
                  placeholder="Enter reason for leave"
                  style={{ width: "100%" }}
                />
                {errors.reason && (
                  <span className={formStyles.error}>
                    {errors.reason.message}
                  </span>
                )}
              </div>
            </div>

            <div className={formStyles.actions}>
              <Button
                onClick={() => {
                  setIsModalOpen(false);
                  reset();
                }}
              >
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" loading={creating}>
                Submit Request
              </Button>
            </div>
          </form>
        </Modal>

        <Modal
          title="Reject Leave Request"
          open={rejectModal.open}
          onCancel={() => setRejectModal({ ...rejectModal, open: false })}
          onOk={async () => {
            await handleReject(rejectModal.id, rejectModal.reason);
            setRejectModal({ id: 0, open: false, reason: "" });
          }}
          confirmLoading={actionLoading === rejectModal.id}
          okText="Reject"
          okButtonProps={{ danger: true }}
        >
          <div style={{ marginTop: 16 }}>
            <label>Reason for rejection</label>
            <Input.TextArea
              rows={4}
              placeholder="Enter rejection reason..."
              value={rejectModal.reason}
              onChange={(e) =>
                setRejectModal({ ...rejectModal, reason: e.target.value })
              }
              style={{ marginTop: 8 }}
            />
          </div>
        </Modal>

        <Modal
          title="Rejection Reason"
          open={reasonModal.open}
          onCancel={() => setReasonModal({ open: false, reason: "" })}
          footer={
            <Button onClick={() => setReasonModal({ open: false, reason: "" })}>
              Close
            </Button>
          }
        >
          <p style={{ marginTop: 16 }}>{reasonModal.reason}</p>
        </Modal>
      </Card>
    </div>
  );
};

export default LeaveRequests;

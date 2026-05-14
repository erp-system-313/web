import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Descriptions,
  Tag,
  Button,
  Select,
  Space,
  Typography,
  List,
  Input,
  message,
  Spin,
  Modal,
} from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useTicket } from "../../../hooks/useSupport";
import { supportService } from "../../../services/supportService";
import type { TicketPriority, TicketStatus } from "../../../types/support";
import styles from "./TicketDetails.module.css";

const { Title, Text } = Typography;
const { TextArea } = Input;

const priorityColors: Record<TicketPriority, string> = {
  LOW: "green",
  MEDIUM: "blue",
  HIGH: "orange",
  URGENT: "red",
};

const statusColors: Record<TicketStatus, string> = {
  OPEN: "default",
  IN_PROGRESS: "processing",
  RESOLVED: "success",
  CLOSED: "default",
};

export const TicketDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const ticketId = Number(id);
  const { data: ticket, loading, error, refetch } = useTicket(ticketId);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editingStatus, setEditingStatus] = useState(false);
  const [editingPriority, setEditingPriority] = useState(false);

  if (loading) {
    return (
      <div className={styles.loading}>
        <Spin size="large" />
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className={styles.loading}>
        <Text type="danger">{error || "Ticket not found"}</Text>
        <br />
        <Button onClick={() => navigate("/support/tickets")}>
          Back to Tickets
        </Button>
      </div>
    );
  }

  const handleStatusChange = async (newStatus: TicketStatus) => {
    try {
      await supportService.update(ticketId, { status: newStatus });
      message.success("Status updated");
      setEditingStatus(false);
      refetch();
    } catch {
      message.error("Failed to update status");
    }
  };

  const handlePriorityChange = async (newPriority: TicketPriority) => {
    try {
      await supportService.update(ticketId, { priority: newPriority });
      message.success("Priority updated");
      setEditingPriority(false);
      refetch();
    } catch {
      message.error("Failed to update priority");
    }
  };

  const handleAddComment = async () => {
    if (!comment.trim()) return;
    setSubmitting(true);
    try {
      await supportService.update(ticketId, { description: comment });
      message.success("Comment added");
      setComment("");
      refetch();
    } catch {
      message.error("Failed to add comment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = () => {
    Modal.confirm({
      title: "Delete Ticket",
      content: "Are you sure you want to delete this ticket?",
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          await supportService.delete(ticketId);
          message.success("Ticket deleted");
          navigate("/support/tickets");
        } catch {
          message.error("Failed to delete ticket");
        }
      },
    });
  };

  return (
    <div>
      <Space className={styles.backButton}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/support/tickets")}
        >
          Back to Tickets
        </Button>
      </Space>

      <Card
        title={
          <Title level={4} style={{ margin: 0 }}>
            {ticket.title}
          </Title>
        }
        extra={
          <Space>
            <Button danger onClick={handleDelete}>
              Delete
            </Button>
          </Space>
        }
      >
        <Descriptions column={2} bordered size="small">
          <Descriptions.Item label="Customer">
            {ticket.customerName || `#${ticket.customerId}`}
          </Descriptions.Item>
          <Descriptions.Item label="Description">
            {ticket.description || "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Status">
            {editingStatus ? (
              <Select
                defaultValue={ticket.status}
                style={{ width: 140 }}
                onSelect={handleStatusChange}
                onBlur={() => setEditingStatus(false)}
                autoFocus
                options={[
                  { value: "OPEN", label: "Open" },
                  { value: "IN_PROGRESS", label: "In Progress" },
                  { value: "RESOLVED", label: "Resolved" },
                  { value: "CLOSED", label: "Closed" },
                ]}
              />
            ) : (
              <Tag
                color={statusColors[ticket.status]}
                style={{ cursor: "pointer" }}
                onClick={() => setEditingStatus(true)}
              >
                {ticket.status.replace("_", " ")}
              </Tag>
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Priority">
            {editingPriority ? (
              <Select
                defaultValue={ticket.priority}
                style={{ width: 140 }}
                onSelect={handlePriorityChange}
                onBlur={() => setEditingPriority(false)}
                autoFocus
                options={[
                  { value: "LOW", label: "Low" },
                  { value: "MEDIUM", label: "Medium" },
                  { value: "HIGH", label: "High" },
                  { value: "URGENT", label: "Urgent" },
                ]}
              />
            ) : (
              <Tag
                color={priorityColors[ticket.priority]}
                style={{ cursor: "pointer" }}
                onClick={() => setEditingPriority(true)}
              >
                {ticket.priority}
              </Tag>
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Assigned To">
            {ticket.assignedToName || "Unassigned"}
          </Descriptions.Item>
          <Descriptions.Item label="Created">
            {new Date(ticket.createdAt).toLocaleString()}
          </Descriptions.Item>
          <Descriptions.Item label="Updated">
            {new Date(ticket.updatedAt).toLocaleString()}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="Comments" className={styles.commentsSection}>
        {ticket.comments.length > 0 ? (
          <List
            dataSource={ticket.comments}
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta
                  title={<Text strong>{item.authorName}</Text>}
                  description={
                    <Space direction="vertical" size={0}>
                      <Text>{item.message}</Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {new Date(item.createdAt).toLocaleString()}
                      </Text>
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        ) : (
          <Text type="secondary">No comments yet.</Text>
        )}

        <div className={styles.addComment}>
          <TextArea
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add a comment..."
          />
          <Button
            type="primary"
            loading={submitting}
            disabled={!comment.trim()}
            onClick={handleAddComment}
            style={{ marginTop: 8 }}
          >
            Add Comment
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default TicketDetails;

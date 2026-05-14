import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Tag,
  Button,
  Select,
  Typography,
  Input,
  message,
  Spin,
  Modal,
  Avatar,
  Divider,
} from "antd";
import {
  ArrowLeftOutlined,
  DeleteOutlined,
  UserOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
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

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

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
      await supportService.addComment(ticketId, { message: comment });
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
    <div className={styles.container}>
      <div className={styles.toolbar}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/support/tickets")}
        >
          Back to Tickets
        </Button>
        <Button danger icon={<DeleteOutlined />} onClick={handleDelete}>
          Delete
        </Button>
      </div>

      <div className={styles.post}>
        <div className={styles.postHeader}>
          <Avatar size={40} icon={<UserOutlined />} className={styles.avatar} />
          <div className={styles.headerMeta}>
            <Text strong>
              {ticket.createdByName || ticket.customerName || "Unknown"}
            </Text>
            <Text type="secondary" className={styles.timestamp}>
              <ClockCircleOutlined /> {timeAgo(ticket.createdAt)}
            </Text>
          </div>
        </div>

        <Title level={4} className={styles.title}>
          #{ticket.id} - {ticket.title}
        </Title>

        {ticket.description && (
          <div className={styles.description}>
            <Text>{ticket.description}</Text>
          </div>
        )}

        <div className={styles.metadata}>
          <div className={styles.metaItem}>
            <Text type="secondary" className={styles.metaLabel}>
              Status
            </Text>
            {editingStatus ? (
              <Select
                defaultValue={ticket.status}
                size="small"
                style={{ width: 130 }}
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
                className={styles.editableTag}
                onClick={() => setEditingStatus(true)}
              >
                {ticket.status.replace("_", " ")}
              </Tag>
            )}
          </div>
          <div className={styles.metaItem}>
            <Text type="secondary" className={styles.metaLabel}>
              Priority
            </Text>
            {editingPriority ? (
              <Select
                defaultValue={ticket.priority}
                size="small"
                style={{ width: 120 }}
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
                className={styles.editableTag}
                onClick={() => setEditingPriority(true)}
              >
                {ticket.priority}
              </Tag>
            )}
          </div>
          <div className={styles.metaItem}>
            <Text type="secondary" className={styles.metaLabel}>
              Customer
            </Text>
            <Text>{ticket.customerName || `#${ticket.customerId}`}</Text>
          </div>
          <div className={styles.metaItem}>
            <Text type="secondary" className={styles.metaLabel}>
              Assigned To
            </Text>
            <Text>{ticket.assignedToName || "Unassigned"}</Text>
          </div>
          <div className={styles.metaItem}>
            <Text type="secondary" className={styles.metaLabel}>
              Created
            </Text>
            <Text>{new Date(ticket.createdAt).toLocaleDateString()}</Text>
          </div>
          <div className={styles.metaItem}>
            <Text type="secondary" className={styles.metaLabel}>
              Updated
            </Text>
            <Text>{new Date(ticket.updatedAt).toLocaleDateString()}</Text>
          </div>
        </div>

        <Divider />

        <div className={styles.commentsSection}>
          <Title level={5} className={styles.commentsHeading}>
            Comments ({ticket.comments.length})
          </Title>

          {ticket.comments.length > 0 ? (
            <div className={styles.commentsList}>
              {ticket.comments.map((c) => (
                <div key={c.id} className={styles.comment}>
                  <Avatar
                    size={32}
                    icon={<UserOutlined />}
                    className={styles.commentAvatar}
                  />
                  <div className={styles.commentBody}>
                    <div className={styles.commentMeta}>
                      <Text strong>{c.authorName}</Text>
                      <Text type="secondary" className={styles.timestamp}>
                        <ClockCircleOutlined /> {timeAgo(c.createdAt)}
                      </Text>
                    </div>
                    <Text className={styles.commentMessage}>{c.message}</Text>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Text type="secondary" className={styles.noComments}>
              No comments yet.
            </Text>
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
              className={styles.commentButton}
            >
              Comment
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDetails;

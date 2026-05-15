import React, { useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Form,
  Input,
  Select,
  Button,
  Typography,
  message,
  Space,
  Spin,
} from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useTicket, useUpdateTicket } from "../../../hooks/useSupport";
import { hrService } from "../../../services/hrService";
import type { UpdateTicketDto } from "../../../types/support";
import type { Employee } from "../../../types/hr";
import styles from "./EditTicket.module.css";

const { Title } = Typography;
const { TextArea } = Input;

export const EditTicket: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const ticketId = Number(id);
  const { data: ticket, loading: fetching } = useTicket(ticketId);
  const { updateTicket, loading: saving } = useUpdateTicket();
  const [form] = Form.useForm<UpdateTicketDto>();
  const [employeeOptions, setEmployeeOptions] = useState<
    { value: number; label: string }[]
  >([]);
  const [searching, setSearching] = useState(false);

  const handleEmployeeSearch = useCallback(async (query: string) => {
    if (!query) {
      setEmployeeOptions([]);
      return;
    }
    setSearching(true);
    try {
      const result = await hrService.employees.getAll({
        search: query,
        size: 20,
      });
      const employees: Employee[] = result.content || [];
      setEmployeeOptions(
        employees.map((e) => ({
          value: e.id,
          label: `${e.fullName} (${e.department})`,
        })),
      );
    } catch {
      setEmployeeOptions([]);
    } finally {
      setSearching(false);
    }
  }, []);

  if (fetching) {
    return (
      <div className={styles.loading}>
        <Spin size="large" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className={styles.loading}>
        <Typography.Text type="danger">Ticket not found</Typography.Text>
        <br />
        <Button onClick={() => navigate("/support/tickets")}>
          Back to Tickets
        </Button>
      </div>
    );
  }

  const handleSubmit = async (values: UpdateTicketDto) => {
    try {
      await updateTicket(ticketId, values);
      message.success("Ticket updated");
      navigate(`/support/tickets/${ticketId}`);
    } catch {
      message.error("Failed to update ticket");
    }
  };

  return (
    <div>
      <Space className={styles.backButton}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(`/support/tickets/${ticketId}`)}
        >
          Back to Ticket
        </Button>
      </Space>

      <Card>
        <Title level={4}>Edit Ticket #{ticket.id}</Title>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            title: ticket.title,
            description: ticket.description,
            priority: ticket.priority,
            assignedTo: ticket.assignedToId,
          }}
          style={{ maxWidth: 600 }}
        >
          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: "Please enter a title" }]}
          >
            <Input placeholder="Ticket title" />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <TextArea
              rows={4}
              placeholder="Detailed description of the issue"
            />
          </Form.Item>

          <Form.Item name="assignedTo" label="Assigned To">
            <Select
              showSearch
              placeholder="Search employee..."
              filterOption={false}
              onSearch={handleEmployeeSearch}
              options={employeeOptions}
              loading={searching}
              allowClear
              notFoundContent={null}
            />
          </Form.Item>

          <Form.Item
            name="priority"
            label="Priority"
            rules={[{ required: true, message: "Please select a priority" }]}
          >
            <Select
              options={[
                { value: "LOW", label: "Low" },
                { value: "MEDIUM", label: "Medium" },
                { value: "HIGH", label: "High" },
                { value: "URGENT", label: "Urgent" },
              ]}
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={saving}>
                Save Changes
              </Button>
              <Button onClick={() => navigate(`/support/tickets/${ticketId}`)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default EditTicket;

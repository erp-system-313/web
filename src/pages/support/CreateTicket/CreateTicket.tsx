import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Form,
  Input,
  Select,
  Button,
  Typography,
  message,
  Space,
} from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useCreateTicket } from "../../../hooks/useSupport";
import { salesService } from "../../../services/salesService";
import { hrService } from "../../../services/hrService";
import type { CreateTicketDto } from "../../../types/support";
import type { Customer } from "../../../types/sales";
import type { Employee } from "../../../types/hr";
import styles from "./CreateTicket.module.css";

const { Title } = Typography;
const { TextArea } = Input;

export const CreateTicket: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm<CreateTicketDto>();
  const { createTicket, loading } = useCreateTicket();
  const [customerOptions, setCustomerOptions] = useState<
    { value: number; label: string }[]
  >([]);
  const [searching, setSearching] = useState(false);
  const [employeeOptions, setEmployeeOptions] = useState<
    { value: number; label: string }[]
  >([]);
  const [searchingEmployee, setSearchingEmployee] = useState(false);

  const handleCustomerSearch = useCallback(async (query: string) => {
    if (!query) {
      setCustomerOptions([]);
      return;
    }
    setSearching(true);
    try {
      const result = await salesService.customers.getAll({
        search: query,
        size: 20,
      });
      setCustomerOptions(
        (result.items as Customer[]).map((c) => ({
          value: c.id,
          label: `${c.name} (ID: ${c.id})`,
        })),
      );
    } catch {
      setCustomerOptions([]);
    } finally {
      setSearching(false);
    }
  }, []);

  const handleEmployeeSearch = useCallback(async (query: string) => {
    if (!query) {
      setEmployeeOptions([]);
      return;
    }
    setSearchingEmployee(true);
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
      setSearchingEmployee(false);
    }
  }, []);

  const handleSubmit = async (values: CreateTicketDto) => {
    try {
      const ticket = await createTicket(values);
      message.success("Ticket created");
      navigate(`/support/tickets/${ticket.id}`);
    } catch {
      message.error("Failed to create ticket");
    }
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

      <Card>
        <Title level={4}>Create New Ticket</Title>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ priority: "MEDIUM" }}
          style={{ maxWidth: 600 }}
        >
          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: "Please enter a title" }]}
          >
            <Input placeholder="Brief description of the issue" />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <TextArea
              rows={4}
              placeholder="Detailed description of the issue"
            />
          </Form.Item>

          <Form.Item
            name="customerId"
            label="Customer"
            rules={[{ required: true, message: "Please select a customer" }]}
          >
            <Select
              showSearch
              placeholder="Search customer by name..."
              filterOption={false}
              onSearch={handleCustomerSearch}
              options={customerOptions}
              loading={searching}
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

          <Form.Item name="assignedTo" label="Assigned To">
            <Select
              showSearch
              placeholder="Search employee..."
              filterOption={false}
              onSearch={handleEmployeeSearch}
              options={employeeOptions}
              loading={searchingEmployee}
              allowClear
              notFoundContent={null}
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                Submit
              </Button>
              <Button onClick={() => navigate("/support/tickets")}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default CreateTicket;

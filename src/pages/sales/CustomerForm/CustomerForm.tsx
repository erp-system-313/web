import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, Button, Input, Select, InputNumber, message, Spin } from "antd";
import { ArrowLeftOutlined, SaveOutlined } from "@ant-design/icons";
import { salesService } from "../../../services/salesService";
import styles from "./CustomerForm.module.css";

export const CustomerForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [creditLimit, setCreditLimit] = useState<number>(0);
  const [paymentTerms, setPaymentTerms] = useState<string>("NET_30");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEditMode);
  const [nameError, setNameError] = useState("");

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const customer = await salesService.customers.getById(Number(id));
        if (customer) {
          setName(customer.name);
          setEmail(customer.email || "");
          setPhone(customer.phone || "");
          setAddress(customer.address || "");
          setCreditLimit(customer.creditLimit);
          setPaymentTerms(customer.paymentTerms);
        }
      } catch {
        message.error("Failed to load customer");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setNameError("Customer name is required");
      return;
    }
    setNameError("");

    setSaving(true);
    try {
      const data = {
        name: name.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        address: address.trim() || undefined,
        creditLimit,
        paymentTerms: paymentTerms as "NET_30" | "NET_60" | "IMMEDIATE",
      };

      if (isEditMode) {
        await salesService.customers.update(Number(id), data);
        message.success("Customer updated successfully");
      } else {
        await salesService.customers.create(data);
        message.success("Customer created successfully");
      }
      navigate("/sales/customers");
    } catch {
      message.error(
        isEditMode ? "Failed to update customer" : "Failed to create customer",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Spin size="large" style={{ display: "block", margin: "40px auto" }} />
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/sales/customers")}
        >
          Back
        </Button>
        <h1>{isEditMode ? "Edit Customer" : "New Customer"}</h1>
      </div>

      <Card className={styles.card}>
        <form onSubmit={handleSubmit}>
          <div className={styles.formItem}>
            <label>Customer Name *</label>
            <Input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setNameError("");
              }}
              placeholder="Enter customer name"
              status={nameError ? "error" : undefined}
            />
            {nameError && <span className={styles.error}>{nameError}</span>}
          </div>

          <div className={styles.formItem}>
            <label>Email</label>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email address"
            />
          </div>

          <div className={styles.formItem}>
            <label>Phone</label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter phone number"
              maxLength={20}
            />
          </div>

          <div className={styles.formItem}>
            <label>Address</label>
            <Input.TextArea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={3}
              placeholder="Enter address"
            />
          </div>

          <div className={styles.formItem}>
            <label>Credit Limit</label>
            <InputNumber
              value={creditLimit}
              onChange={(val) => setCreditLimit(val ?? 0)}
              prefix="$"
              style={{ width: "100%" }}
              min={0}
              precision={2}
              placeholder="0.00"
            />
          </div>

          <div className={styles.formItem}>
            <label>Payment Terms</label>
            <Select
              value={paymentTerms}
              onChange={setPaymentTerms}
              style={{ width: "100%" }}
              options={[
                { value: "NET_30", label: "Net 30" },
                { value: "NET_60", label: "Net 60" },
                { value: "IMMEDIATE", label: "Immediate" },
              ]}
            />
          </div>

          <div className={styles.actions}>
            <Button onClick={() => navigate("/sales/customers")}>Cancel</Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              htmlType="submit"
              loading={saving}
            >
              {isEditMode ? "Update Customer" : "Create Customer"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default CustomerForm;

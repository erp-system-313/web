import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Spin, Typography, Button, Modal, Form, Input, InputNumber, Select, message } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useRecruitmentStages } from "../../../hooks/useRecruitment";
import { useJobOpenings } from "../../../hooks";
import styles from "./Pipeline.module.css";

const { Title } = Typography;
const { Option } = Select;

export const RecruitmentPipeline: React.FC = () => {
  const navigate = useNavigate();
  const { stages, applicants, loading, moveApplicant, createApplicant } = useRecruitmentStages();
  const { data: openings } = useJobOpenings();
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  const defaultStageId = stages.length > 0 ? stages[0].id : undefined;

  const getCards = (stageId: number) =>
    applicants.filter((a) => a.stageId === stageId);

  const handleDragStart = (e: React.DragEvent, appId: number) => {
    e.dataTransfer.setData("appId", String(appId));
  };

  const handleDrop = async (e: React.DragEvent, stageId: number) => {
    e.preventDefault();
    const appId = Number(e.dataTransfer.getData("appId"));
    try {
      await moveApplicant(appId, stageId);
      message.success("Applicant moved");
    } catch {
      message.error("Failed to move applicant");
    }
  };

  const handleCreateApplicant = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      await createApplicant(values);
      message.success("Applicant added");
      setModalOpen(false);
      form.resetFields();
    } catch {
      message.error("Failed to add applicant");
    } finally {
      setSubmitting(false);
    }
  };

  const getStageColor = (name: string) => {
    const stageColors: Record<string, string> = {
      "New": "#1890ff",
      "Contacted": "#722ed1",
      "Interview": "#fa8c16",
      "Offer": "#52c41a",
      "Hired": "#13c2c2",
      "Archived": "#8c8c8c",
    };
    return stageColors[name] || "#1890ff";
  };

  if (loading) {
    return <div className={styles.loading}><Spin size="large" /></div>;
  }

  return (
    <div>
      <div className={styles.header}>
        <Title level={3}>Recruitment Pipeline</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { form.resetFields(); setModalOpen(true); }}>
          Add Applicant
        </Button>
      </div>
      <div className={styles.board}>
        {stages.map((stage) => (
          <div
            key={stage.id}
            className={styles.column}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, stage.id)}
          >
            <div className={styles.columnHeader} style={{ borderTopColor: getStageColor(stage.name) }}>
              {stage.name}
              <span className={styles.count}>{getCards(stage.id).length}</span>
            </div>
            <div className={styles.cards}>
              {getCards(stage.id).map((app) => (
                <div
                  key={app.id}
                  className={styles.card}
                  draggable
                  onDragStart={(e) => handleDragStart(e, app.id)}
                  onClick={() => navigate(`/recruitment/applicants/${app.id}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className={styles.cardName}>{app.name}</div>
                  <div className={styles.cardInfo}>{app.email}</div>
                  {app.jobOpeningTitle && (
                    <div className={styles.cardInfo}>
                      <span className={styles.label}>Job:</span> {app.jobOpeningTitle}
                    </div>
                  )}
                  {app.salaryExpected && (
                    <div className={styles.cardInfo}>
                      <span className={styles.label}>Expected:</span> ${app.salaryExpected.toLocaleString()}
                    </div>
                  )}
                  {app.sourceName && (
                    <div className={styles.cardSource}>{app.sourceName}</div>
                  )}
                </div>
              ))}
              {getCards(stage.id).length === 0 && (
                <div className={styles.empty}>No applicants</div>
              )}
            </div>
          </div>
        ))}
      </div>

      <Modal
        title="Add Applicant"
        open={modalOpen}
        onOk={handleCreateApplicant}
        onCancel={() => { setModalOpen(false); form.resetFields(); }}
        confirmLoading={submitting}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Name" rules={[{ required: true, message: "Required" }]}>
            <Input placeholder="Applicant name" />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, message: "Required" }, { type: "email", message: "Invalid email" }]}>
            <Input placeholder="Email" />
          </Form.Item>
          <Form.Item name="phone" label="Phone">
            <Input placeholder="Phone number" />
          </Form.Item>
          <Form.Item name="jobOpeningId" label="Job Opening" rules={[{ required: true, message: "Required" }]}>
            <Select placeholder="Select job opening">
              {openings.filter((o) => o.status === "OPEN").map((o) => (
                <Option key={o.id} value={o.id}>{o.title}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="stageId" label="Stage" initialValue={defaultStageId} rules={[{ required: true, message: "Required" }]}>
            <Select placeholder="Select stage">
              {stages.map((s) => (
                <Option key={s.id} value={s.id}>{s.name}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="salaryExpected" label="Expected Salary">
            <InputNumber min={0} style={{ width: "100%" }} prefix="$" />
          </Form.Item>
          <Form.Item name="notes" label="Notes">
            <Input.TextArea rows={3} placeholder="Notes" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RecruitmentPipeline;

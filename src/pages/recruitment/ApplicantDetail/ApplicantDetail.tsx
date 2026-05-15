import { useParams, useNavigate } from "react-router-dom";
import { Card, Typography, Button, Descriptions, Tag, Spin, Space, Divider } from "antd";
import { ArrowLeftOutlined, PhoneOutlined, MailOutlined } from "@ant-design/icons";
import { useApplicant } from "../../../hooks/useRecruitment";
import styles from "./ApplicantDetail.module.css";

const { Title, Text } = Typography;

export const ApplicantDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const applicantId = id ? parseInt(id, 10) : null;
  const { data: applicant, loading } = useApplicant(applicantId);

  if (loading) {
    return <div className={styles.loading}><Spin size="large" /></div>;
  }

  if (!applicant) {
    return (
      <Card>
        <Title level={4}>Applicant not found</Title>
        <Button type="primary" onClick={() => navigate("/recruitment/pipeline")}>Back to Pipeline</Button>
      </Card>
    );
  }

  return (
    <div>
      <Button type="link" icon={<ArrowLeftOutlined />} onClick={() => navigate("/recruitment/pipeline")} style={{ padding: 0, marginBottom: 16 }}>
        Back to Pipeline
      </Button>
      <Card>
        <div className={styles.header}>
          <div>
            <Title level={3}>{applicant.name}</Title>
            <Space>
              <Text><MailOutlined /> {applicant.email}</Text>
              {applicant.phone && <Text><PhoneOutlined /> {applicant.phone}</Text>}
            </Space>
          </div>
          <Space>
            {applicant.stageName && <Tag color="blue">{applicant.stageName}</Tag>}
            {applicant.sourceName && <Tag>{applicant.sourceName}</Tag>}
          </Space>
        </div>
        <Divider />
        <Descriptions column={2} bordered>
          {applicant.jobOpeningTitle && (
            <Descriptions.Item label="Applied For">{applicant.jobOpeningTitle}</Descriptions.Item>
          )}
          {applicant.salaryExpected && (
            <Descriptions.Item label="Expected Salary">${applicant.salaryExpected.toLocaleString()}</Descriptions.Item>
          )}
          {applicant.resumeUrl && (
            <Descriptions.Item label="Resume">
              <a href={applicant.resumeUrl} target="_blank" rel="noreferrer">View Resume</a>
            </Descriptions.Item>
          )}
          <Descriptions.Item label="Applied On">{new Date(applicant.createdAt).toLocaleDateString()}</Descriptions.Item>
        </Descriptions>
        {applicant.notes && (
          <>
            <Divider />
            <Title level={5}>Notes</Title>
            <Text>{applicant.notes}</Text>
          </>
        )}
      </Card>
    </div>
  );
};

export default ApplicantDetail;

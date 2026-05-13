import { useNavigate } from 'react-router-dom';
import { Card, Row, Col, Statistic, Table, Button, Typography, Spin } from 'antd';
import { PlusOutlined, ApartmentOutlined, TeamOutlined, DollarOutlined, RiseOutlined } from '@ant-design/icons';
import { useCRMDashboard } from '../../../hooks/useCRM';
import styles from './Dashboard.module.css';

const { Title } = Typography;

export const CRMDashboard: React.FC = () => {
  const { stats, loading } = useCRMDashboard();
  const navigate = useNavigate();

  if (loading || !stats) {
    return <div className={styles.loading}><Spin size="large" /></div>;
  }

  const recentColumns = [
    { title: 'Type', dataIndex: 'type', key: 'type', width: 100 },
    { title: 'Description', dataIndex: 'description', key: 'description' },
    { title: 'Time', dataIndex: 'timestamp', key: 'timestamp', render: (v: string) => new Date(v).toLocaleString() },
  ];

  return (
    <div>
      <div className={styles.header}>
        <Title level={3} style={{ margin: 0 }}>CRM Dashboard</Title>
        <div className={styles.actions}>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/crm/leads')}>
            Add Lead
          </Button>
          <Button icon={<ApartmentOutlined />} onClick={() => navigate('/crm/pipeline')}>
            View Pipeline
          </Button>
        </div>
      </div>

      <Row gutter={[16, 16]} className={styles.statsRow}>
        <Col xs={24} sm={12} lg={6}>
          <Card><Statistic title="Total Leads" value={stats.totalLeads} prefix={<TeamOutlined />} /></Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card><Statistic title="Conversion Rate" value={stats.conversionRate} suffix="%" prefix={<RiseOutlined />} /></Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card><Statistic title="Pipeline Value" value={stats.pipelineValue} prefix={<DollarOutlined />} precision={2} /></Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card><Statistic title="Won This Month" value={stats.wonThisMonth} prefix={<RiseOutlined />} /></Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Pipeline Stages">
            <Table
              dataSource={stats.stageSummaries}
              rowKey="stageId"
              pagination={false}
              columns={[
                { title: 'Stage', dataIndex: 'stageName', key: 'stageName' },
                { title: 'Deals', dataIndex: 'count', key: 'count' },
                { title: 'Value', dataIndex: 'value', key: 'value', render: (v: number) => `$${v.toLocaleString()}` },
              ]}
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Recent Activity">
            <Table dataSource={stats.recentActivity} rowKey="id" pagination={false} columns={recentColumns} />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CRMDashboard;

import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Spin, Tag, Typography } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useGanttData, useProject } from '../../../hooks/useProjects';
import styles from './Gantt.module.css';

const { Text } = Typography;

const STAGE_COLORS: Record<string, string> = {
  'To Do': '#1890ff',
  'In Progress': '#faad14',
  'Done': '#52c41a',
  'Review': '#722ed1',
  'Testing': '#13c2c2',
};

const getStageColor = (stageName: string | null): string => {
  if (!stageName) return '#d9d9d9';
  return STAGE_COLORS[stageName] || '#d9d9d9';
};

export const Gantt: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const projectId = id ? Number(id) : null;

  const { data: project } = useProject(projectId);
  const { data: ganttItems, loading } = useGanttData(projectId);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
        <Spin size="large" />
      </div>
    );
  }

  const sortedItems = [...ganttItems].sort((a, b) => {
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  const stageNames = [...new Set(sortedItems.map((i) => i.stageName).filter(Boolean))] as string[];

  return (
    <div className={styles.container}>
      <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(`/projects/${projectId}`)} style={{ marginBottom: 16 }}>
        Back to Project
      </Button>

      <Card title={`Gantt Chart${project ? ` - ${project.name}` : ''}`}>
        {sortedItems.length === 0 ? (
          <div className={styles.emptyState}>
            <Text type="secondary">No tasks found for this project.</Text>
          </div>
        ) : (
          <>
            <div className={styles.timeline}>
              <div className={styles.headerRow}>
                <div className={styles.taskNameCol}>Task</div>
                <div className={styles.barCol}>Timeline</div>
              </div>
              {sortedItems.map((item) => (
                <div key={item.id} className={styles.taskRow}>
                  <div className={styles.taskNameCol}>
                    <Text strong>{item.name}</Text>
                    {item.stageName && (
                      <Tag color={getStageColor(item.stageName)} style={{ marginLeft: 8 }}>
                        {item.stageName}
                      </Tag>
                    )}
                  </div>
                  <div className={styles.barCol}>
                    <div className={styles.barTrack}>
                      <div
                        className={styles.taskBar}
                        style={{ backgroundColor: getStageColor(item.stageName) }}
                      />
                    </div>
                    {item.dueDate && (
                      <Text type="secondary" className={styles.dateLabel}>{item.dueDate}</Text>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.legend}>
              <Text type="secondary" style={{ marginRight: 12 }}>Legend:</Text>
              {stageNames.map((name) => (
                <Tag key={name} color={getStageColor(name)}>{name}</Tag>
              ))}
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

export default Gantt;

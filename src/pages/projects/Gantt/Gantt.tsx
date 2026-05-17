import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Spin, Tag, Typography } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useGanttData, useProject } from '../../../hooks/useProjects';
import type { GanttItem } from '../../../types/project';
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

  const { sortedItems, totalDays, dateAxis, maxHours } = useMemo(() => {
    if (!ganttItems || !project) return { sortedItems: [], totalDays: 0, dateAxis: [], maxHours: 1 };

    const sorted = [...ganttItems].sort((a, b) => {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });

    const start = dayjs(project.dateStart);
    const end = dayjs(project.dateEnd);
    const days = end.diff(start, 'day') || 1;

    const axis: string[] = [];
    for (let i = 0; i <= days; i++) {
      axis.push(start.add(i, 'day').format('MMM D'));
    }

    const maxEst = Math.max(...sorted.map((t) => t.estimatedHours || 0), 1);

    return { sortedItems: sorted, totalDays: days, dateAxis: axis, maxHours: maxEst };
  }, [ganttItems, project]);

  const stageNames = [...new Set(sortedItems.map((i) => i.stageName).filter(Boolean))] as string[];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
        <Spin size="large" />
      </div>
    );
  }

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
            <div className={styles.timelineWrapper}>
              <div className={styles.taskNameCol}>Task</div>
              <div className={styles.timelineArea}>
                <div className={styles.dateAxis}>
                  {dateAxis.map((d, i) => (
                    <div key={i} className={styles.dateTick} style={{ left: `${(i / totalDays) * 100}%` }}>
                      {d}
                    </div>
                  ))}
                </div>
                <div className={styles.rows}>
                  {sortedItems.map((item) => {
                    const pos = item.dueDate && project?.dateStart
                      ? dayjs(item.dueDate).diff(dayjs(project.dateStart), 'day')
                      : 0;
                    const leftPct = Math.max(0, (pos / totalDays) * 100);
                    const widthPct = Math.max(8, ((item.estimatedHours || 1) / maxHours) * 60);

                    return (
                      <div key={item.id} className={styles.taskRow}>
                        <div className={styles.taskNameCol}>
                          <Text strong ellipsis>{item.name}</Text>
                          {item.stageName && (
                            <Tag color={getStageColor(item.stageName)} style={{ marginLeft: 4, fontSize: 11 }}>
                              {item.stageName}
                            </Tag>
                          )}
                        </div>
                        <div className={styles.barCol}>
                          <div className={styles.barTrack}>
                            <div
                              className={styles.taskBar}
                              style={{
                                left: `${Math.max(0, leftPct - widthPct)}%`,
                                width: `${Math.min(widthPct, leftPct)}%`,
                                backgroundColor: getStageColor(item.stageName),
                              }}
                            />
                          </div>
                          {item.dueDate && (
                            <Text type="secondary" className={styles.dateLabel}>{item.dueDate}</Text>
                          )}
                          {item.estimatedHours && (
                            <Text type="secondary" className={styles.hoursLabel}>{item.estimatedHours}h</Text>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
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

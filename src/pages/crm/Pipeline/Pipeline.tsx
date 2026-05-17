import { Spin, Typography } from 'antd';
import { usePipelineStages } from '../../../hooks/useCRM';
import styles from './Pipeline.module.css';

const { Title } = Typography;

export const Pipeline: React.FC = () => {
  const { stages, opportunities, loading, moveOpportunity } = usePipelineStages();

  const getCards = (stageId: number) =>
    opportunities.filter(o => o.stageId === stageId);

  const handleDragStart = (e: React.DragEvent, oppId: number) => {
    e.dataTransfer.setData('oppId', String(oppId));
  };

  const handleDrop = async (e: React.DragEvent, stageId: number) => {
    e.preventDefault();
    const oppId = Number(e.dataTransfer.getData('oppId'));
    await moveOpportunity(oppId, stageId);
  };

  if (loading) {
    return <div className={styles.loading}><Spin size="large" /></div>;
  }

  return (
    <div>
      <Title level={3}>Pipeline</Title>
      <div className={styles.board}>
        {stages.map(stage => (
          <div
            key={stage.id}
            className={styles.column}
            onDragOver={e => e.preventDefault()}
            onDrop={e => handleDrop(e, stage.id)}
          >
            <div className={styles.columnHeader}>{stage.name}</div>
            <div className={styles.cards}>
              {getCards(stage.id).map(opp => (
                <div
                  key={opp.id}
                  className={styles.card}
                  draggable
                  onDragStart={e => handleDragStart(e, opp.id)}
                >
                  <div className={styles.cardTitle}>{opp.company}</div>
                  <div className={styles.cardInfo}>${opp.revenue.toLocaleString()}</div>
                  <div className={styles.cardInfo}>{opp.probability}% probability</div>
                  <div className={styles.cardInfo}>
                    Close: {new Date(opp.expectedCloseDate).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Pipeline;

import { Empty } from 'antd';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  action?: ReactNode;
  image?: ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No data found',
  description,
  action,
  image,
}) => {
  return (
    <div style={{ padding: 48, textAlign: 'center' }}>
      <Empty
        image={image || Empty.PRESENTED_IMAGE_SIMPLE}
        description={
          <div>
            <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 8 }}>{title}</div>
            {description && <div style={{ color: '#999' }}>{description}</div>}
          </div>
        }
      >
        {action && (
          <div style={{ marginTop: 16 }}>
            {action}
          </div>
        )}
      </Empty>
    </div>
  );
};

export default EmptyState;

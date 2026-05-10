import { Spin } from 'antd';
import type { SpinProps } from 'antd';

interface LoadingStateProps extends SpinProps {
  tip?: string;
  fullPage?: boolean;
}

const LoadingState: React.FC<LoadingStateProps> = ({ tip = 'Loading...', fullPage = false, ...spinProps }) => {
  if (fullPage) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" tip={tip} {...spinProps}>
          <div style={{ padding: 50 }} />
        </Spin>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 48 }}>
      <Spin size="large" tip={tip} {...spinProps}>
        <div style={{ padding: 50 }} />
      </Spin>
    </div>
  );
};

export default LoadingState;

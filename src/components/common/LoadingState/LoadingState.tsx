import { Spin, Typography } from "antd";
import type { SpinProps } from "antd";
import styles from "./LoadingState.module.css";

interface LoadingStateProps extends SpinProps {
  tip?: string;
  fullPage?: boolean;
}

const LoadingState: React.FC<LoadingStateProps> = ({
  tip = "Loading...",
  fullPage = false,
  ...spinProps
}) => {
  return (
    <div className={fullPage ? styles.fullPage : styles.centered}>
      <Spin size="large" {...spinProps}>
        <Typography.Text className={styles.tip}>{tip}</Typography.Text>
      </Spin>
    </div>
  );
};

export default LoadingState;

import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, Button } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import styles from "./FormCard.module.css";

interface FormCardProps {
  title: string;
  backPath?: string;
  onBack?: () => void;
  children: React.ReactNode;
}

export const FormCard: React.FC<FormCardProps> = ({
  title,
  backPath,
  onBack,
  children,
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (backPath) {
      navigate(backPath);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Button icon={<ArrowLeftOutlined />} onClick={handleBack}>
          Back
        </Button>
        <h1>{title}</h1>
      </div>
      <Card className={styles.card}>{children}</Card>
    </div>
  );
};

export default FormCard;

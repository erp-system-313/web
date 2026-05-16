import { useState, useCallback } from "react";
import { Tag, message } from "antd";
import { projectService } from "../../../services/projectService";
import type { ProjectTask, TaskStage } from "../../../types/project";
import styles from "./TaskKanban.module.css";

interface Props {
  tasks: ProjectTask[];
  stages: TaskStage[];
  employees: { id: number; name: string }[];
  onTaskUpdated: () => void;
}

export const TaskKanban: React.FC<Props> = ({
  tasks,
  stages,
  employees,
  onTaskUpdated,
}) => {
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<number | null>(null);

  const getTasksByStage = useCallback(
    (stageId: number) => tasks.filter((t) => t.stageId === stageId),
    [tasks],
  );

  const handleDragStart = (taskId: number) => {
    setDraggingId(taskId);
  };

  const handleDragOver = (e: React.DragEvent, stageId: number) => {
    e.preventDefault();
    setDragOverColumn(stageId);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = async (stageId: number) => {
    setDragOverColumn(null);
    if (draggingId === null) return;

    const task = tasks.find((t) => t.id === draggingId);
    if (!task || task.stageId === stageId) {
      setDraggingId(null);
      return;
    }

    try {
      await projectService.updateTask(draggingId, { stageId });
      message.success("Task moved");
      onTaskUpdated();
    } catch {
      message.error("Failed to move task");
    } finally {
      setDraggingId(null);
    }
  };

  const handleDragEnd = () => {
    setDraggingId(null);
    setDragOverColumn(null);
  };

  if (!stages || stages.length === 0) {
    return <div>No stages configured for this project.</div>;
  }

  return (
    <div className={styles.board}>
      {stages
        .sort((a, b) => a.sequence - b.sequence)
        .map((stage) => {
          const stageTasks = getTasksByStage(stage.id);
          return (
            <div
              key={stage.id}
              className={styles.column}
              onDragOver={(e) => handleDragOver(e, stage.id)}
              onDragLeave={handleDragLeave}
              onDrop={() => handleDrop(stage.id)}
              style={
                dragOverColumn === stage.id
                  ? { background: "#e6f7ff" }
                  : undefined
              }
            >
              <div className={styles.columnHeader}>
                <span>{stage.name}</span>
                <span className={styles.taskCount}>{stageTasks.length}</span>
              </div>
              <div className={styles.taskList}>
                {stageTasks.length === 0 ? (
                  <div className={styles.emptyColumn}>Drop tasks here</div>
                ) : (
                  stageTasks.map((task) => {
                    const emp = employees.find(
                      (e) => e.id === task.assignedTo,
                    );
                    return (
                      <div
                        key={task.id}
                        className={`${styles.taskCard} ${
                          draggingId === task.id
                            ? styles.taskCardDragging
                            : ""
                        }`}
                        draggable
                        onDragStart={() => handleDragStart(task.id)}
                        onDragEnd={handleDragEnd}
                      >
                        <div className={styles.taskName}>{task.name}</div>
                        <div className={styles.taskMeta}>
                          <span>
                            {task.dueDate ? (
                              <Tag
                                color={
                                  new Date(task.dueDate) < new Date()
                                    ? "red"
                                    : "default"
                                }
                                style={{ fontSize: 10, margin: 0 }}
                              >
                                {task.dueDate}
                              </Tag>
                            ) : (
                              "No due date"
                            )}
                          </span>
                          <span>{emp ? emp.name : "Unassigned"}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
    </div>
  );
};

export default TaskKanban;

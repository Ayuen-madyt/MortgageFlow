import React from 'react';
import { Draggable, Droppable } from 'react-beautiful-dnd';
import { Box, Title, Group, Text } from '@mantine/core';
import classes from './Column.module.css';
import TaskCard from './TaskCard';
import { Stage } from '@/utils/types';
import RotateColumn from './RotateColumn';

type Props = {
  id: string;
  tasks: Stage;
  index: number;
  stageId: number;
};

export default function Column({ id, tasks, index, stageId }: Props) {
  const { main_tasks, ...other } = tasks;

  return (
    <Draggable draggableId={id?.toString()} index={index}>
      {(provided) => (
        <div
          className={classes.column_card}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          ref={provided.innerRef}
        >
          {/* rendering droppable main tasks */}
          <Droppable droppableId={index.toString()} type="card">
            {(provided, snapShot) => (
              <Box
                {...provided.droppableProps}
                ref={provided.innerRef}
                className={`${classes.main_task} ${
                  snapShot.isDraggingOver ? classes.main_task_bg : classes.main_task_bg_white
                }`}
              >
                {main_tasks?.length > 0 ? (
                  <Box>
                    <Title order={6}>{id}</Title>
                    {main_tasks.map((task, index) => (
                      <Draggable
                        key={task.main_task_id}
                        draggableId={task.main_task_id.toString()}
                        index={index}
                      >
                        {(provided) => (
                          <TaskCard
                            task={task}
                            task_id={task.main_task_id}
                            index={index}
                            innerRef={provided.innerRef}
                            draggableProps={provided.draggableProps}
                            dragHandleProps={provided.dragHandleProps}
                          />
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </Box>
                ) : (
                  <RotateColumn text={id} number={index} />
                )}
              </Box>
            )}
          </Droppable>
        </div>
      )}
    </Draggable>
  );
}

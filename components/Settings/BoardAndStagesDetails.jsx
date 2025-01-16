'use client';
import cx from 'clsx';
import React, { useState, useEffect, Fragment } from 'react';
import { Box, Title, Flex, Divider, TextInput, Select, Paper } from '@mantine/core';
import fetcher from '@/utils/fetcher';
import useSWR from 'swr';
import classes from '../../components/mainTask/Task.module.css';
import { axiosInstance, setAuthorizationToken } from '@/utils/axiosInstance';
import DndListHandle from './DndListHandle.jsx';

export default function BoardAndStagesDetails({ boardId, goBack, mutateBoards }) {
  const [stages, setStages] = useState([]);
  const [activeStage, setActiveStage] = useState(null);
  const [selectedBoardType, setSelectedBoardType] = useState('');
  const [boardTitle, setBoardTitle] = useState('');

  const [selectedStage, setSelectedStage] = useState({
    stage_id: '',
    board_id: parseInt(boardId),
    title: '',
    stage_name: '',
    stage_mapping: '',
    show_days_stage_indicator: false,
    stage_due_days: null,
    turn_amber: null,
    turn_red: null,
    add_stage_due_to_task: false,
    include_in_duration_metric: false,
  });

  const { data: boardTypes, mutate } = useSWR('/board/get/board-types', fetcher);

  useEffect(() => {
    if (boardId) {
      axiosInstance
        .get(`/board/fetch/${boardId}`)
        .then((res) => {
          setStages(res.data);
          setBoardTitle(res.data.board);
          setSelectedStage({
            stage_id: res.data.stages[0].stage_id,
            board_id: parseInt(boardId),
            title: res.data.stages[0].stage_title,
            stage_name: res.data.stages[0].stage_name,
            stage_mapping: res.data.stages[0].stage_mapping,
            show_days_stage_indicator: res.data.stages[0].show_days_stage_indicator,
            stage_due_days: res.data.stages[0].stage_due_days,
            turn_amber: res.data.stages[0].turn_amber,
            turn_red: res.data.stages[0].turn_red,
            add_stage_due_to_task: res.data.stages[0].add_stage_due_to_task,
            include_in_duration_metric: res.data.stages[0].include_in_duration_metric,
          });
          setActiveStage(res.data.stages[0]);
          setSelectedBoardType(res.data.board_type.board_type_id);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, [boardId]);
  return (
    <Box>
      <Paper mt="md">
        <Title ml="sm" order={5}>
          Board Details
        </Title>
        <Divider mt="sm" />
        <Flex justify="flex-start" gap="sm" p="sm">
          <TextInput
            value={boardTitle}
            onChange={(event) => setBoardTitle(event.currentTarget.value)}
            label="Title"
            placeholder="board title"
          />

          <Flex justify="flex-start" gap="sm">
            <Select
              value={selectedBoardType.toString()}
              label="Board Type"
              placeholder="Pick value"
              data={boardTypes?.map((boardType) => ({
                value: `${boardType.board_type_id}`,
                label: `${boardType.title}`,
              }))}
              onChange={(value) => setSelectedBoardType(value)}
            />
          </Flex>
        </Flex>
      </Paper>

      {stages?.stages?.length > 0 && (
        <DndListHandle
          stageData={stages}
          boardId={boardId}
          stageActive={activeStage}
          stageSelected={selectedStage}
          mutateBoards={mutateBoards}
          goBack={goBack}
          boardTitle={boardTitle}
          selectedBoardType={selectedBoardType}
        />
      )}
    </Box>
  );
}

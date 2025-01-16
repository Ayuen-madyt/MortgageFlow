'use client';

import React, { useState, useEffect, Fragment } from 'react';
import {
  Box,
  Title,
  Card,
  Text,
  Flex,
  rem,
  Divider,
  TextInput,
  Select,
  Paper,
  Collapse,
  Input,
  FileInput,
  Textarea,
  Button,
  Anchor,
  Grid,
  Switch,
} from '@mantine/core';
import { IconArrowNarrowLeft, IconAt, IconChevronRight, IconTrash } from '@tabler/icons-react';
import fetcher from '@/utils/fetcher';
import useSWR from 'swr';
import classes from '../../components/mainTask/Task.module.css';
import axiosInstance from '@/utils/axiosInstance';
import { notifications } from '@mantine/notifications';
import BoardAndStagesDetails from './BoardAndStagesDetails';
import { useParams, useRouter } from 'next/navigation';
import AddBoardStages from './AddBoardStages';

export default function BoardAndStages() {
  const [boardId, setBoardId] = useState();
  const [showDetails, setShowDetails] = useState(false);
  const [showBoards, setShowBoards] = useState(true);
  const [showAddBoard, setShowAddBoard] = useState(false);
  const [back, setBack] = useState(false);
  const [token, setToken] = useState('');

  useEffect(() => {
    const access_token =
      typeof localStorage !== 'undefined' ? localStorage.getItem('broker_access_token') : null;

    setToken(access_token);
  }, []);

  // const token =
  //   typeof localStorage !== 'undefined' ? localStorage.getItem('broker_access_token') || null : '';

  const { data: boards, mutate } = useSWR(['/board/fetch', token], ([url, token]) =>
    fetcher(url, token)
  );

  // const { data: boards, mutate } = useSWR('/board/fetch', fetcher);

  const router = useRouter();

  const handleBoardClick = (board_id) => {
    setBoardId(board_id);
    setShowDetails(true);
    setShowBoards(false);
    setShowAddBoard(false);
    setBack(true);
  };

  const handleAddBoard = () => {
    setShowAddBoard(true);
    setShowDetails(false);
    setShowBoards(false);
    setBack(true);
  };
  const goBack = () => {
    setShowBoards(true);
    setShowDetails(false);
    setShowAddBoard(false);
    setShowAddBoard(false);
    setBack(false);
  };

  return (
    <Box>
      {back && (
        <Flex justify="flex-start" align="center" style={{ color: '#0275d8' }}>
          <IconArrowNarrowLeft
            onClick={goBack}
            stroke={1.5}
            style={{
              width: rem(16),
              height: rem(16),
              cursor: 'pointer',
            }}
          />
          <Text onClick={goBack} style={{ cursor: 'pointer' }} size="sm">
            Go back
          </Text>
        </Flex>
      )}
      <Card withBorder radius="md" bg="var(--mantine-color-body)" style={{ padding: 0, margin: 0 }}>
        {showBoards && (
          <Fragment>
            <Flex justify="space-between" align="center">
              <Title p="xs" order={4} className={classes.customGray}>
                Boards & Stages
              </Title>
              <Button onClick={handleAddBoard} mr="sm">
                Add Board
              </Button>
            </Flex>
            <Divider />
            <Paper p="sm">
              {boards?.map((board, index) => (
                <Flex
                  justify="flex-start"
                  gap="xs"
                  key={board.board_id}
                  style={{ cursor: 'pointer' }}
                  mb="sm"
                  styles={{ hover: 'primar' }}
                  onClick={() => handleBoardClick(board.board_id)}
                >
                  <Title c="blue" order={6}>
                    {`${index + 1}. `}{' '}
                  </Title>
                  <Anchor>
                    {' '}
                    <Title order={6}>{board.title}</Title>
                  </Anchor>
                </Flex>
              ))}
            </Paper>
          </Fragment>
        )}

        {showDetails && (
          <BoardAndStagesDetails boardId={boardId} goBack={goBack} mutateBoards={mutate} />
        )}
        {showAddBoard && <AddBoardStages goBack={goBack} mutateBoards={mutate} />}
      </Card>
    </Box>
  );
}

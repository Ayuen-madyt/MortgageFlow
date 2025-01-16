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
  Button,
  Anchor,
  Grid,
  Switch,
  Tooltip,
  Modal,
  Loader,
} from '@mantine/core';
import fetcher from '@/utils/fetcher';
import useSWR from 'swr';
import classes from '../../components/mainTask/Task.module.css';
import { axiosInstance, setAuthorizationToken } from '@/utils/axiosInstance';
import { notifications } from '@mantine/notifications';
import { IconTrash } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';

export default function AddBoardAndStages({ goBack, mutateBoards }) {
  const [opened, { open, close }] = useDisclosure(false);
  const [selectedBoardType, setSelectedBoardType] = useState('');
  const [boardTitle, setBoardTitle] = useState('');
  const [boardType, setBoardType] = useState('');
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState('');

  useEffect(() => {
    const access_token =
      typeof localStorage !== 'undefined' ? localStorage.getItem('broker_access_token') : null;

    setToken(access_token);
  }, []);

  const { data: boardTypes, mutate } = useSWR(['/board/get/board-types', token], ([url, token]) =>
    fetcher(url, token)
  );

  const [stages, setStages] = useState({
    board: {
      title: boardTitle || '',
      board_type_id: selectedBoardType || '',
    },
    stages: [
      {
        stage_id: 1,
        position: 0,
        title: '',
        stage_name: 'Stage 1',
        stage_mapping: '',
        show_days_stage_indicator: false,
        stage_due_days: null,
        turn_amber: null,
        turn_red: null,
        add_stage_due_to_task: false,
        include_in_duration_metric: false,
        subStages: [],
      },
    ],
  });

  const [selectedStage, setSelectedStage] = useState(stages?.stages[0]);
  const [stageDetailsArray, setStageDetailsArray] = useState({
    board: {
      title: boardTitle || '',
      board_type_id: selectedBoardType || '',
    },
    stages: [
      {
        stage_id: 1,
        position: 0,
        title: selectedStage?.stage_name,
        stage_name: selectedStage?.stage_name,
        stage_mapping: '',
        show_days_stage_indicator: false,
        stage_due_days: null,
        turn_amber: null,
        turn_red: null,
        add_stage_due_to_task: false,
        include_in_duration_metric: false,
        subStages: [],
      },
    ],
  });

  const handleAddStage = () => {
    const maxPosition = Math.max(...stageDetailsArray?.stages?.map((stage) => stage?.position));
    const newPosition = maxPosition + 1;

    const newStageNumber = stageDetailsArray.stages.length + 1;
    const newStageDetails = {
      stage_id: newStageNumber,
      position: newPosition,
      title: selectedStage?.stage_name || '',
      stage_name: `Stage ${newStageNumber}` || '',
      stage_mapping: '',
      show_days_stage_indicator: false,
      stage_due_days: null,
      turn_amber: null,
      turn_red: null,
      add_stage_due_to_task: false,
      include_in_duration_metric: false,
      subStages: [],
    };

    setStageDetailsArray((prevDetails) => {
      const updatedStages = [...prevDetails.stages, newStageDetails];
      return { ...prevDetails, stages: updatedStages };
    });

    setSelectedStage(newStageDetails);
  };

  const handleStageClick = (stage) => {
    setSelectedStage(stage);
  };

  const handleStageNameChange = (field, value) => {
    setStageDetailsArray((prevDetails) => {
      const updatedStages = prevDetails?.stages?.map((stageDetail) =>
        stageDetail?.stage_id === selectedStage?.stage_id
          ? {
              ...stageDetail,
              [field]: value,
              title: value,
            }
          : stageDetail
      );
      return { ...prevDetails, stages: updatedStages };
    });

    setSelectedStage((prevSelectedStage) =>
      prevSelectedStage?.stage_id === selectedStage?.stage_id
        ? {
            ...prevSelectedStage,
            [field]: value,
            title: value,
          }
        : prevSelectedStage
    );
  };

  const handleInputChange = (field, value) => {
    setStageDetailsArray((prevDetails) => {
      const updatedStages = prevDetails.stages.map((stageDetail) =>
        stageDetail?.stage_id === selectedStage?.stage_id
          ? {
              ...stageDetail,
              [field]: value,
            }
          : stageDetail
      );
      return { ...prevDetails, stages: updatedStages };
    });

    setSelectedStage((prevSelectedStage) =>
      prevSelectedStage?.stage_id === selectedStage?.stage_id
        ? {
            ...prevSelectedStage,
            [field]: value,
          }
        : prevSelectedStage
    );
  };

  const handleBoardTitle = (value) => {
    setBoardTitle(value);
    setStageDetailsArray((prevDetails) => ({
      ...prevDetails,
      board: {
        ...prevDetails.board,
        title: value,
      },
    }));
    setSelectedStage((prevSelectedStage) => ({
      ...prevSelectedStage,
      board: {
        ...prevSelectedStage?.board,
        title: value,
      },
    }));
  };

  const handleBoardType = (value) => {
    setSelectedBoardType(value);
    setStageDetailsArray((prevDetails) => ({
      ...prevDetails,
      board: {
        ...prevDetails.board,
        board_type_id: parseInt(value),
      },
    }));
    setSelectedStage((prevSelectedStage) => ({
      ...prevSelectedStage,
      board: {
        ...prevSelectedStage?.board,
        board_type_id: parseInt(value),
      },
    }));
  };

  const removeStage = (stage_id) => {
    setStageDetailsArray((prevDetails) => ({
      ...prevDetails,
      stages: prevDetails?.stages.filter((stageDetail) => stageDetail?.stage_id !== stage_id),
    }));
  };

  const addBoardType = () => {
    const data = { title: boardType };
    setLoading(true);
    axiosInstance
      .post('/board/add/board-type', data)
      .then((res) => {
        console.log(res);
        setLoading(false);
        close();
        mutate();

        notifications.show({
          title: 'Success',
          color: 'teal',
          message: 'Board type added ',
        });
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
        notifications.show({
          title: 'Error',
          color: 'red',
          message: 'Error adding board type',
        });
      });
  };

  const addBoard = () => {
    console.log('stage arrays:', stageDetailsArray);
    setLoading(true);
    axiosInstance
      .post('/board/add', stageDetailsArray)
      .then((res) => {
        console.log(res);
        setLoading(false);
        mutateBoards();
        goBack();
        notifications.show({
          title: 'Success',
          color: 'teal',
          message: 'Board added successfully',
        });
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
        notifications.show({
          title: 'Error',
          color: 'red',
          message: 'Error adding board',
        });
      });
  };

  return (
    <Box>
      <Paper mt="md">
        <Title ml="sm" order={5}>
          Add Board
        </Title>
        <Divider mt="sm" />
        <Flex justify="flex-start" gap="sm" p="sm">
          <TextInput
            label="Title"
            placeholder="board title"
            value={boardTitle || ''}
            onChange={(event) => handleBoardTitle(event.target.value)}
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
              onChange={(value) => handleBoardType(parseInt(value))}
            />

            <Button onClick={open} size="compact-lg" mt={25}>
              Add
            </Button>
          </Flex>
        </Flex>
      </Paper>

      {/* stages */}
      <Paper mt="md">
        <Title ml="sm" order={4}>
          Stages
        </Title>
        <Divider mt="sm" />
        <Grid p="sm">
          <Grid.Col span={{ base: 12, xs: 4 }} style={{ borderRight: '0.5px solid grey' }} p="md">
            {stageDetailsArray?.stages?.map((stage, index) => (
              <Card
                key={index}
                withBorder
                radius="md"
                padding="sm"
                mb="sm"
                onClick={() => handleStageClick(stage)}
                style={{
                  cursor: 'pointer',
                  backgroundColor: selectedStage === stage ? '#f5f6f7' : '',
                }}
              >
                <Flex justify="space-between" align="center">
                  <Flex justify="flex-start" gap="sm">
                    <Title order={6}>{`${index + 1}. `}</Title>
                    <Title order={6}>{stage.stage_name}</Title>
                  </Flex>
                  {stage.stage_id != 1 && (
                    <Tooltip label="Delete Stage Group">
                      <IconTrash
                        onClick={() => removeStage(stage.stage_id)}
                        size={15}
                        style={{ cursor: 'pointer', color: 'red' }}
                      />
                    </Tooltip>
                  )}
                </Flex>
              </Card>
            ))}
            <Button onClick={handleAddStage}>Add Stage</Button>
          </Grid.Col>
          <Grid.Col span={{ base: 12, xs: 8 }} p="md">
            <Fragment>
              <Box>
                <Title order={5} p="xs">
                  Stage Details
                </Title>
                <TextInput
                  label="Stage Name"
                  placeholder="stage name"
                  value={selectedStage?.stage_name || ''}
                  onChange={(event) => handleStageNameChange('stage_name', event.target.value)}
                />

                <Select
                  label="Stage Mapping"
                  placeholder="Pick value"
                  data={[
                    'Custom',
                    'New Lead',
                    'Appointment Booked',
                    'Interview Held',
                    'Loan Strategy Report',
                    'Presentation Held',
                    'Warm Prospects',
                    'Hot Prospects',
                    'Lost Opps(Last 2 weeks)',
                    'On Hold',
                    'Get Supporting Docs',
                    'Prepare Deal For AIP',
                    'Sent For AIP',
                    'AIP Issued',
                  ]}
                  value={selectedStage?.stage_mapping || ''}
                  onChange={(value) => handleInputChange('stage_mapping', value)}
                />
              </Box>
              {/* card details */}
              <Box mt="md">
                <Title order={5} p="xs">
                  Card Details
                </Title>
                <Paper mt="sm">
                  <Switch
                    label="Show Days-In-Stage Indicator"
                    checked={selectedStage?.show_days_stage_indicator || ''}
                    onChange={(event) =>
                      handleInputChange('show_days_stage_indicator', event.currentTarget.checked)
                    }
                  />
                  <TextInput
                    label="Stage Due Days"
                    type="number"
                    value={selectedStage?.stage_due_days || ''}
                    onChange={(event) =>
                      handleInputChange('stage_due_days', parseInt(event.target.value))
                    }
                  />
                  <TextInput
                    label="Turn Amber"
                    type="number"
                    value={selectedStage?.turn_amber || ''}
                    onChange={(event) =>
                      handleInputChange('turn_amber', parseInt(event.target.value))
                    }
                  />
                  <TextInput
                    label="Turn Red"
                    type="number"
                    value={selectedStage?.turn_red || ''}
                    onChange={(event) =>
                      handleInputChange('turn_red', parseInt(event.target.value))
                    }
                  />
                  <Switch
                    label="Add Stage Due Task"
                    mt="sm"
                    checked={selectedStage?.add_stage_due_to_task || ''}
                    onChange={(event) =>
                      handleInputChange('add_stage_due_to_task', event.currentTarget.checked)
                    }
                  />
                  <Switch
                    label="Include In Duration Metrics"
                    mt="sm"
                    checked={selectedStage?.include_in_duration_metric || ''}
                    onChange={(event) =>
                      handleInputChange('include_in_duration_metric', event.currentTarget.checked)
                    }
                  />
                </Paper>
              </Box>
            </Fragment>
          </Grid.Col>
        </Grid>
        <Divider />
        <Flex justify="flex-end" m="md">
          <Button onClick={addBoard}>
            {loading ? <Loader color="white" size="sm" /> : 'Save Board'}
          </Button>
        </Flex>
      </Paper>

      {/* modal for adding board type*/}
      <Modal opened={opened} onClose={close} withCloseButton={false}>
        {/* Modal content */}
        <Title order={5}>Add Board Type</Title>
        <Divider />
        <TextInput
          label="Board Type"
          placeholder="name"
          mt="sm"
          onChange={(event) => setBoardType(event.target.value)}
        />
        <Flex justify="flex-end" mt="md">
          <Button onClick={addBoardType}>Save</Button>
        </Flex>
      </Modal>
    </Box>
  );
}

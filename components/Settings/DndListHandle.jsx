import cx from 'clsx';
import { useState, Fragment, useEffect } from 'react';
import {
  Box,
  Title,
  Card,
  Flex,
  Divider,
  TextInput,
  Select,
  Paper,
  Button,
  Grid,
  Switch,
  Tooltip,
  Loader,
  rem,
  Text,
} from '@mantine/core';
import { useListState } from '@mantine/hooks';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { IconGripVertical, IconTrash } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { axiosInstance, setAuthorizationToken } from '@/utils/axiosInstance';
import classes from '../../components/mainTask/Task.module.css';

export default function DndListHandle({
  stageData,
  boardId,
  stageActive,
  stageSelected,
  mutateBoards,
  goBack,
  boardTitle,
  selectedBoardType,
}) {
  const [stages, setStages] = useState(stageData?.stages || []);
  const [state, handlers] = useListState(stages);
  const [activeStage, setActiveStage] = useState(stageActive || null);
  const [loading, setLoading] = useState(false);
  const [boardDelete, setBoardDelete] = useState(false);
  const [newStage, setNewStage] = useState(false);

  const [selectedStage, setSelectedStage] = useState({
    stage_id: stageSelected?.stage_id || '',
    board_id: parseInt(boardId),
    title: stageSelected?.title || '',
    stage_name: stageSelected?.stage_name || '',
    stage_mapping: stageSelected?.stage_mapping || '',
    show_days_stage_indicator: stageSelected?.show_days_stage_indicator || false,
    stage_due_days: stageSelected?.stage_due_days || null,
    turn_amber: stageSelected?.turn_amber || null,
    turn_red: stageSelected?.turn_red || null,
    add_stage_due_to_task: stageSelected?.add_stage_due_to_task || false,
    include_in_duration_metric: stageSelected?.include_in_duration_metric || false,
  });

  const handleCardClick = (stage) => {
    setSelectedStage({
      stage_id: stage?.stage_id,
      board_id: parseInt(boardId),
      title: stage?.stage_title,
      stage_name: stage?.stage_name,
      stage_mapping: stage?.stage_mapping,
      show_days_stage_indicator: stage?.show_days_stage_indicator,
      stage_due_days: stage?.stage_due_days,
      turn_amber: stage?.turn_amber,
      turn_red: stage?.turn_red,
      add_stage_due_to_task: stage?.add_stage_due_to_task,
      include_in_duration_metric: stage?.include_in_duration_metric,
    });
    setActiveStage(stage);
  };

  const handleAddStage = () => {
    if (newStage) {
      notifications.show({
        title: 'Error',
        color: 'red',
        message: 'Save stage to add new one',
      });
    } else {
      setNewStage(true);
      const newStageNumber = stages?.length + 1;
      const newPosition = stages[stages.length - 1].position + 1;
      const newStageDetails = {
        stage_id: newStageNumber,
        position: newPosition,
        board_id: parseInt(boardId),
        title: selectedStage?.stage_name || '',
        stage_name: `Stage ${newStageNumber}` || '',
        stage_mapping: '',
        show_days_stage_indicator: false,
        stage_due_days: '',
        turn_amber: '',
        turn_red: '',
        add_stage_due_to_task: false,
        include_in_duration_metric: false,
      };

      setStages((prevStages) => [...prevStages, newStageDetails]);

      setActiveStage(newStageDetails);
      setSelectedStage(newStageDetails);
    }
  };

  useEffect(() => {
    handlers.setState(stages);
  }, [stages]);

  const handleSetStageName = (event) => {
    const updatedStages = stages?.map((stage) => {
      if (stage.stage_id === selectedStage.stage_id) {
        return {
          ...stage,
          stage_name: event.target.value,
        };
      }
      return stage;
    });

    setStages(updatedStages);
    setSelectedStage((prevSelectedStage) => ({
      ...prevSelectedStage,
      stage_name: event.target.value,
    }));
  };

  const saveStageDetails = () => {
    const boardDetails = {
      board_type_id: parseInt(selectedBoardType),
      title: boardTitle,
    };

    setLoading(true);
    if (newStage) {
      const addStagePromise = axiosInstance.post(`/board/add/stage`, selectedStage);
      const updateBoardPromise = axiosInstance.put(`/board/update/${boardId}`, boardDetails);

      Promise.all([addStagePromise, updateBoardPromise])
        .then((responses) => {
          notifications.show({
            title: 'Success',
            color: 'teal',
            message: 'Board updated',
          });

          setLoading(false);
          setNewStage(false);
        })
        .catch((errors) => {
          setLoading(false);
          setNewStage(false);
          console.log(errors);
          notifications.show({
            title: 'Error',
            color: 'red',
            message: 'Failed to add/update stages',
          });
        });
    } else {
      const updateStagePromise = axiosInstance.put(
        `/board/update/stage/${selectedStage.stage_id}`,
        selectedStage
      );
      const updateBoardPromise = axiosInstance.put(`/board/update/${boardId}`, boardDetails);
      Promise.all([updateStagePromise, updateBoardPromise])
        .then((responses) => {
          notifications.show({
            title: 'Success',
            color: 'teal',
            message: 'Board updated',
          });

          setLoading(false);
          setNewStage(false);
        })
        .catch((errors) => {
          setLoading(false);
          setNewStage(false);
          console.log(errors);
          notifications.show({
            title: 'Error',
            color: 'red',
            message: 'Failed to add/update stages',
          });
        });
    }
  };

  const deleteBoard = () => {
    setBoardDelete(true);
    axiosInstance
      .delete(`/board/delete/${boardId}`)
      .then((res) => {
        setBoardDelete(false);
        mutateBoards();
        goBack();
        notifications.show({
          title: 'Deletion',
          color: 'red',
          message: 'Board Deleted',
        });
      })
      .catch((err) => {
        console.log(err);
        setBoardDelete(false);
        notifications.show({
          title: 'Error',
          color: 'red',
          message: 'Error deleting board',
        });
      });
  };

  const deleteStage = (stage_id) => {
    axiosInstance
      .delete(`board/delete/stage/${stage_id}`)
      .then((res) => {
        setNewStage(false);
        setStages((prevStages) => prevStages.filter((stage) => stage.stage_id !== stage_id));
        notifications.show({
          title: 'Deletion',
          color: 'red',
          message: 'Stage Deleted',
        });
      })
      .catch((err) => {
        console.log(err);
        notifications.show({
          title: 'Error',
          color: 'red',
          message: 'Error deleting board',
        });
      });
  };

  const rearrangeStages = (source, destination) => {
    if (!destination) return;

    const items = Array.from(stages);
    const [reorderedStage] = items.splice(source.index, 1);
    items.splice(destination.index, 0, reorderedStage);

    setStages(items);

    axiosInstance
      .post('/board/rearrange/stages', items)
      .then((res) => {})
      .catch((err) => {
        console.log(err);
        notifications.show({
          title: 'Error',
          color: 'red',
          message: 'Error rearranging stages',
        });
      });
  };

  const items = state?.map((stage, index) => (
    <Draggable key={stage?.stage_id} index={index} draggableId={stage?.stage_name}>
      {(provided, snapshot) => (
        <div
          className={cx(classes.item, { [classes.itemDragging]: snapshot.isDragging })}
          ref={provided.innerRef}
          {...provided.draggableProps}
          onClick={() => handleCardClick(stage)}
        >
          <div {...provided.dragHandleProps} className={classes.dragHandle}>
            <IconGripVertical style={{ width: rem(18), height: rem(18) }} stroke={1.5} />
          </div>
          <Text c={activeStage === stage ? 'blue' : ''} className={classes.symbol}>
            {index + 1}. {stage?.stage_name}
          </Text>
          <div>
            <Tooltip label="Delete Stage Group">
              <IconTrash
                onClick={() => deleteStage(stage?.stage_id)}
                color={activeStage === stage ? 'red' : 'grey'}
                size={15}
                style={{ cursor: 'pointer' }}
              />
            </Tooltip>
          </div>
        </div>
      )}
    </Draggable>
  ));

  return (
    <Paper mt="md">
      <Title ml="sm" order={4}>
        Stages
      </Title>
      <Divider mt="sm" />
      <Grid p="sm">
        <Grid.Col span={{ base: 12, xs: 6 }} style={{ borderRight: '0.5px solid grey' }} p="md">
          <Fragment>
            <DragDropContext
              onDragEnd={({ destination, source }) => {
                rearrangeStages(source, destination);
                handlers.reorder({ from: source.index, to: destination?.index });
              }}
            >
              <Droppable droppableId="dnd-list" direction="vertical">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef}>
                    {items}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
            <Button onClick={() => handleAddStage()}>Add Stage</Button>
          </Fragment>
        </Grid.Col>
        <Grid.Col span={{ base: 12, xs: 6 }} p="md">
          <Box>
            <Title order={5} className={classes.brandSection} p="xs">
              Stage Details
            </Title>
            <TextInput
              label="Stage Name"
              placeholder="stage name"
              value={selectedStage?.stage_name}
              onChange={(event) => handleSetStageName(event)}
            />
            <Select
              label="Stage Mapping"
              placeholder="Pick value"
              value={selectedStage?.stage_mapping}
              data={[
                'Custom',
                'New Lead',
                'Appointment Booked',
                'Interview Held',
                'Loan Strategy Report',
                'Presentation Held',
                'Warm Prospects',
                'Hot Prospects',
                'Lost Opps(Last 2 weeks',
                'On Hold',
                'Get Supporting Docs',
                'Prepare Deal For AIP',
                'Sent For AIP',
                'AIP Issued',
              ]}
              onChange={(value) =>
                setSelectedStage((prevSelectedStage) => ({
                  ...prevSelectedStage,
                  stage_mapping: value,
                }))
              }
            />
          </Box>
          {/* card details */}
          <Box mt="md">
            <Title order={5} className={classes.brandSection} p="xs">
              Card Details
            </Title>
            <Paper mt="sm">
              <Switch
                defaultChecked
                label="Show Days-In-Stage Indicator"
                checked={selectedStage?.show_days_stage_indicator == 0 ? false : true}
                onChange={(event) =>
                  setSelectedStage((prevSelectedStage) => ({
                    ...prevSelectedStage,
                    show_days_stage_indicator: event.currentTarget.checked,
                  }))
                }
              />
              <TextInput
                label="Stage Due Days"
                type="number"
                value={selectedStage?.stage_due_days || ''}
                onChange={(event) =>
                  setSelectedStage((prevSelectedStage) => ({
                    ...prevSelectedStage,
                    stage_due_days: parseInt(event.target.value),
                  }))
                }
              />
              <TextInput
                label="Turn Amber"
                type="number"
                value={selectedStage?.turn_amber || ''}
                onChange={(event) =>
                  setSelectedStage((prevSelectedStage) => ({
                    ...prevSelectedStage,
                    turn_amber: parseInt(event.target.value),
                  }))
                }
              />
              <TextInput
                label="Turn Red"
                type="number"
                value={selectedStage?.turn_red || ''}
                onChange={(event) =>
                  setSelectedStage((prevSelectedStage) => ({
                    ...prevSelectedStage,
                    turn_red: parseInt(event.target.value),
                  }))
                }
              />
              <Switch
                label="Add Stage Due Task"
                mt="sm"
                checked={selectedStage?.add_stage_due_to_task == 0 ? false : true}
                onChange={(event) =>
                  setSelectedStage((prevSelectedStage) => ({
                    ...prevSelectedStage,
                    add_stage_due_to_task: event.currentTarget.checked,
                  }))
                }
              />
              <Switch
                defaultChecked
                label="Include In Duration Metrics"
                mt="sm"
                checked={selectedStage?.include_in_duration_metric == 0 ? false : true}
                onChange={(event) =>
                  setSelectedStage((prevSelectedStage) => ({
                    ...prevSelectedStage,
                    include_in_duration_metric: event.currentTarget.checked,
                  }))
                }
              />
            </Paper>
          </Box>
        </Grid.Col>
      </Grid>
      <Divider />
      <Flex justify="flex-end" m="md" gap="md">
        <Button onClick={saveStageDetails}>
          {loading ? <Loader color="white" size="sm" /> : 'Save Board'}
        </Button>
        <Button onClick={deleteBoard} color="red">
          {boardDelete ? <Loader color="white" size="sm" /> : 'Delete Board'}
        </Button>
      </Flex>
    </Paper>
  );
}

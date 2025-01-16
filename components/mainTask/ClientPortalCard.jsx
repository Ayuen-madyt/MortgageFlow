'use client';

import { useEffect, useState } from 'react';
import {
  Text,
  Flex,
  Button,
  Card,
  rem,
  Title,
  Modal,
  TextInput,
  Loader,
  Select,
  Tooltip,
  Popover,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconTrash, IconEdit, IconArrowMoveRight } from '@tabler/icons-react';
import classes from './Task.module.css';
import { axiosInstance, setAuthorizationToken } from '@/utils/axiosInstance';
import useSWR from 'swr';
import fetcher from '@/utils/fetcher';
import { notifications } from '@mantine/notifications';
import { useRouter } from 'next/navigation';
import { AssignAdminCard } from './AssignAdmin';

export function ClientPortalCard({ main_task, mutate }) {
  const router = useRouter();
  const [opened, { open, close }] = useDisclosure(false);
  const [confirmDeletion, setConfirmDeletion] = useState(false);
  const [mainTaskName, setMainTaskName] = useState(main_task?.task_name || '');
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState('');
  const [selectedStage, setSelectedStage] = useState(main_task?.stage?.stage_id.toString() || '');

  useEffect(() => {
    const access_token =
      typeof localStorage !== 'undefined' ? localStorage.getItem('broker_access_token') : null;

    setToken(access_token);
    setAuthorizationToken(access_token);
  }, []);

  const { data: singleBoard } = useSWR(
    [`/board/fetch/${main_task?.board_id}`, token],
    ([url, token]) => fetcher(url, token)
  );

  const { data: boards } = useSWR([`/board/fetch/boards-and-stages`, token], ([url, token]) =>
    fetcher(url, token)
  );

  const editMainTask = () => {
    const newData = {
      task_name: mainTaskName,
    };
    if (main_task?.main_task_id) {
      setLoading(true);
      axiosInstance
        .put(`/main/task/update/title/${main_task?.main_task_id}`, newData)
        .then((res) => {
          setLoading(false);
          mutate();
          close();
          notifications.show({
            title: 'Success',
            color: 'teal',
            message: `${singleBoard?.board} updated`,
          });
        })
        .catch((error) => {
          console.log(error);
          setLoading(false);
          notifications.show({
            title: 'Error',
            color: 'red',
            message: 'Error updating',
          });
        });
    }
  };

  const handleSelectChange = (value) => {
    setSelectedStage(value);

    const selectedBoard = boards?.find((board) => {
      const isStageFound = board?.stages?.some((stage) => stage?.stage_id?.toString() === value);
      return isStageFound;
    });

    const oldBoard = boards?.find((board) => board?.board_id === main_task?.board_id);

    const stageMovedTo = selectedBoard?.stages?.find(
      (stage) => stage?.stage_id?.toString() === value
    );

    const moveData = {
      stage_id: value,
      board_id: selectedBoard?.board_id,
      stage_moved_from: main_task?.stage?.stage_name,
      board_moved_from: oldBoard?.board,
      stage_moved_to: stageMovedTo?.stage_name,
      board_moved_to: selectedBoard?.board,
    };

    if (moveData) {
      axiosInstance
        .put(`/main/task/move/${main_task?.main_task_id}`, moveData)
        .then(() => {
          notifications.show({
            title: 'Success',
            color: 'teal',
            message: 'Task moved',
          });
        })
        .catch((error) => {
          console.log(error);
          notifications.show({
            title: 'Error',
            color: 'red',
            message: 'Error moving task',
          });
        });
    }
  };

  const deleteMainTask = () => {
    setLoading(true);
    axiosInstance
      .delete(`/main/task/delete/${main_task?.main_task_id}`)
      .then((res) => {
        setLoading(false);
        notifications.show({
          title: 'Success',
          color: 'teal',
          message: `${singleBoard?.board} deleted`,
        });

        router.push(`/board/single-board/${main_task?.board_id}`);
      })
      .catch((error) => {
        console.log(error);
        setLoading(false);
        notifications.show({
          title: 'Error',
          color: 'red',
          message: 'Error deleting',
        });
      });
  };
  useEffect(() => {
    if (main_task) {
      setSelectedStage(main_task?.stage?.stage_id?.toString() || '');
    }
  }, [main_task]);

  return (
    <Card withBorder mb="sm" radius="md" padding="sm" bg="var(--mantine-color-body)">
      <Flex justify="space-between" align="center" wrap="wrap" rowGap="sm">
        <Text
          style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}
          className={classes.customGray}
          fz="sm"
          tt="uppercase"
          fw={700}
          pr="xs"
        >
          {main_task?.task_name}
          <Tooltip label={`Delete deal`}>
            {loading ? (
              <Loader size="sm" color="white" />
            ) : (
              <IconTrash
                onClick={() => setConfirmDeletion(true)}
                size={20}
                color="grey"
                style={{ cursor: 'pointer', marginLeft: 10 }}
              />
            )}
          </Tooltip>
        </Text>
      </Flex>
      <Flex mt="md" justify="flex-start" align="center" gap="md">
        <Tooltip label={`Edit deal`}>
          <Button size="compact-xs" onClick={open}>
            {`Edit deal`}
            <IconEdit
              style={{
                width: rem(16),
                height: rem(16),
                marginLeft: '5px',
              }}
              stroke={1.5}
            />
          </Button>
        </Tooltip>

        <Popover position="bottom" withArrow shadow="md">
          <Popover.Target>
            <Tooltip label={`Move deal to admin `}>
              <Button size="compact-xs">
                {`Move deal to admin`}
                <IconArrowMoveRight
                  style={{
                    width: rem(25),
                    height: rem(25),
                    marginLeft: '5px',
                  }}
                  stroke={1.5}
                />
              </Button>
            </Tooltip>
          </Popover.Target>
          <Popover.Dropdown>
            <AssignAdminCard
              main_task_id={main_task?.main_task_id}
              assignedAdmin={main_task?.assigned_admin}
            />
          </Popover.Dropdown>
        </Popover>
      </Flex>
      {/* {boards && (
        <Select
          label={`Move deal`}
          placeholder="Pick value"
          value={selectedStage}
          data={boards?.map((board) => ({
            group: board?.board,
            items: board?.stages?.map((stage) => ({
              value: `${stage?.stage_id?.toString()}`,
              label: `${stage?.stage_name}`,
            })),
          }))}
          onChange={handleSelectChange}
          mt="sm"
        />
      )} */}

      {boards?.map((board) =>
        board?.stages
          .filter((stage) => stage.stage_id.toString() === selectedStage.toString())
          .map((stage) => (
            <Select
              key={stage.stage_id}
              label={`Move deal`}
              placeholder="Pick value"
              value={selectedStage}
              data={boards?.map((board) => ({
                group: board?.board,
                items: board?.stages?.map((stage) => ({
                  value: `${stage?.stage_id?.toString()}`,
                  label: `${stage?.stage_name}`,
                })),
              }))}
              onChange={handleSelectChange}
              mt="sm"
            />
          ))
      )}

      <Modal opened={opened} onClose={close} withCloseButton={false}>
        <Title order={5}> {`Edit deal`} </Title>

        <TextInput
          mt="sm"
          value={mainTaskName}
          onChange={(event) => setMainTaskName(event.currentTarget.value)}
          label={`deal Name`}
        />
        <Flex justify="flex-end" mt="sm">
          <Button onClick={editMainTask}>
            {loading ? <Loader size="sm" color="white" /> : 'Save'}
          </Button>
        </Flex>
      </Modal>

      <Modal
        opened={confirmDeletion}
        onClose={() => setConfirmDeletion(false)}
        withCloseButton={false}
      >
        <Title order={5}>Are you sure you want delete this deal?</Title>

        <Flex justify="flex-start" gap={10} mt="md">
          <Button onClick={() => setConfirmDeletion(false)} color="red">
            Cancel
          </Button>
          <Button onClick={deleteMainTask}> Confirm</Button>
        </Flex>
      </Modal>
    </Card>
  );
}

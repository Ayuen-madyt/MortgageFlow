import { useEffect, useState } from 'react';
import { Box, Paper, Divider, Text, Title, Flex, Modal, Tooltip } from '@mantine/core';
import {
  IconUserCircle,
  IconCalendar,
  IconTrash,
  IconEdit,
  IconCircleCheck,
} from '@tabler/icons-react';
import classes from './Task.module.css';
import fetcher from '@/utils/fetcher';
import useSWR from 'swr';
import { axiosInstance, setAuthorizationToken } from '@/utils/axiosInstance';
import { useDisclosure } from '@mantine/hooks';
import SingleTask from './SingleTask';
import { notifications } from '@mantine/notifications';
import { useAppContext } from '@/ContextAPI/ContextAPI';

export default function Tasks({ task_id }) {
  const [opened, { open, close }] = useDisclosure(false);
  const [taskId, setTaskId] = useState();
  const [token, setToken] = useState('');

  const { dispatch, state } = useAppContext();
  const { refetch_tasks } = state;

  useEffect(() => {
    const access_token =
      typeof localStorage !== 'undefined' ? localStorage.getItem('broker_access_token') : null;

    setToken(access_token);
    setAuthorizationToken(access_token);
  }, []);

  const { data: tasks, mutate } = useSWR([`/task/get/${task_id}`, token], ([url, token]) =>
    fetcher(url, token)
  );

  const { data: singleTask } = useSWR([`/task/get/single-task/${taskId}`, token], ([url, token]) =>
    fetcher(url, token)
  );

  const editTask = (task_id) => {
    setTaskId(task_id);
    open();
  };

  const completeTask = (task_id) => {
    axiosInstance
      .put(`/task/complete`, { task_ids: [parseInt(task_id)], is_complete: true })
      .then(() => {
        dispatch({ type: 'SET_REFETCH_ACTIVITY_FEED', payload: true });
        const updatedData = tasks?.filter((task) => task.task_id !== task_id);

        mutate(updatedData, false);
      })
      .catch((err) => {
        console.error('Error completing task:', err);
      });
  };

  const deleteTask = (task_id) => {
    const filtered = tasks.filter((task) => task.task_id !== task_id);
    mutate(filtered, false);
    axiosInstance
      .delete(
        `/task/delete/`,
        { data: { task_ids: [parseInt(task_id)] } },
        {
          headers: {
            Authorization: `Bearer ${
              typeof localStorage !== 'undefined'
                ? localStorage.getItem('broker_access_token') ||
                  localStorage.getItem('access_token')
                : null
            }`,
          },
        }
      )
      .then(() => {
        const updatedData = tasks?.filter((task) => task.task_id !== task_id);
        mutate(updatedData, false);
        notifications.show({
          title: 'Deletion',
          color: 'red',
          message: 'Task deleted!',
        });
      })
      .catch((err) => {
        console.error('Error deleting task:', err);
        notifications.show({
          title: 'Error',
          color: 'red',
          message: err,
        });
      });
  };

  useEffect(() => {
    if (refetch_tasks) {
      mutate([`/task/get/${task_id}`, token]);
      dispatch({ type: 'SET_REFETCH_TASKS', payload: false });
    }
  }, [refetch_tasks, task_id, token]);

  return (
    <div className={classes.root}>
      <Title order={5} className={classes.customGray}>
        UPCOMING ACTIVITIES
      </Title>
      {tasks &&
        tasks?.map((data) => (
          <Paper withBorder mt="sm" p="md" radius="md" key={data?.task_id}>
            <Flex justify="space-between" gap="xs">
              <Box>
                <Title order={6} className={classes.customGray}>
                  {data?.task_name}
                </Title>

                <Text fz="sm" c="dimmed" mt={7}>
                  {`Created by ${data?.owner?.user_first_name} ${
                    data?.owner?.user_last_name
                  } • ${new Date(data?.timestamp).toDateString()}`}
                </Text>
              </Box>
              <Flex justify="space-between" gap={5}>
                <Tooltip label="Mark as done">
                  <IconCircleCheck
                    onClick={() => completeTask(data?.task_id)}
                    color="teal"
                    size={16}
                    style={{ cursor: 'pointer' }}
                  />
                </Tooltip>

                <Tooltip label="Edit">
                  <IconEdit
                    onClick={() => editTask(data?.task_id)}
                    color="#0275d8"
                    size={16}
                    style={{ cursor: 'pointer' }}
                  />
                </Tooltip>
                <Tooltip label="Delete">
                  <IconTrash
                    onClick={() => deleteTask(data?.task_id)}
                    color="red"
                    size={16}
                    style={{ cursor: 'pointer' }}
                  />
                </Tooltip>
              </Flex>
            </Flex>
            <Divider mt="md" />

            <Flex justify="flex-start" align="center" gap="xs">
              <IconUserCircle size={15} color="teal" style={{ marginTop: 5 }} />
              <Text fz="md" c="dimmed" mt={7}>
                {`Assigned to: ${data?.assignee?.assignee_first_name} ${data?.assignee?.assignee_last_name}`}
              </Text>
            </Flex>
            <Flex justify="flex-start" align="center" gap="xs">
              <IconCalendar size={15} color="teal" style={{ marginTop: 5 }} />
              <Text fz="sm" c="dimmed" mt={7}>
                {`Due Date: ${new Date(data?.due_date).toDateString()}`}
              </Text>
            </Flex>
          </Paper>
        ))}
      <Modal
        opened={opened}
        onClose={close}
        withCloseButton={false}
        title={singleTask && singleTask?.task_name}
        styles={{
          title: {
            fontSize: 20,
            fontWeight: 600,
          },
        }}
        centered
      >
        {singleTask && <SingleTask task={singleTask} close={close} />}
      </Modal>
    </div>
  );
}

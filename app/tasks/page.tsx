'use client';
import React, { Fragment, useState, useEffect } from 'react';
import SideBarLayout from '@/components/SidebarLayout/SideBarLayout';
import cx from 'clsx';
import {
  Table,
  Checkbox,
  ScrollArea,
  Group,
  Popover,
  Text,
  rem,
  Card,
  TextInput,
  Box,
  ActionIcon,
  useMantineTheme,
  Button,
  Flex,
  Badge,
  Anchor,
  Title,
  Modal,
  Drawer,
  Center,
  Loader,
  Tooltip,
  Pagination as MantinePagination,
  Select,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import classes from '../../components/mainTask/Task.module.css';
import {
  IconSearch,
  IconCircleCheck,
  IconPlus,
  IconTrash,
  IconArrowRight,
} from '@tabler/icons-react';
import fetcher from '@/utils/fetcher';
import useSWR from 'swr';
import { axiosInstance, setAuthorizationToken } from '@/utils/axiosInstance';
import { Task, Lender, Pagination } from '@/utils/types';
import { notifications } from '@mantine/notifications';
import TaskDetail from './TaskDetail';
import AddTask from './AddTask';

interface LendersResponse {
  lenders: Lender[];
  pagination: Pagination;
}
interface Tasks {
  tasks: Task[];
  pagination: Pagination;
}

export default function page() {
  const theme = useMantineTheme();
  const [opened, { open, close }] = useDisclosure(false);
  const [openModal, { open: openModalTask, close: closeModalTask }] = useDisclosure(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedID, setSelectedID] = useState<string[]>([]);
  const [highPriority, setHighPriority] = useState(false);
  const [criticalPriority, setCriticalPriority] = useState(false);
  const [mediumPriority, setMediumPriority] = useState(false);
  const [lowPriority, setLowPriority] = useState(false);
  const [filteredData, setFilteredData] = useState<Tasks>();
  const [allTasks, setAllTasks] = useState();
  const [taskId, setTaskId] = useState<Number>();
  const [disableButton, setDisableButton] = useState(true);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [activePage, setActivePage] = useState(1);
  const [filterActivePage, setFilterActivePage] = useState<number | null>();
  const [token, setToken] = useState<string | null>('');
  const [lenderId, setLenderId] = useState<string | null>();
  const [dueDate, setDueDate] = useState<Date | null>();
  const pageSize = 15;

  useEffect(() => {
    const access_token: string | null =
      typeof localStorage !== 'undefined' ? localStorage.getItem('broker_access_token') : null;

    setToken(access_token);
  }, []);

  useEffect(() => {
    if (token) {
      axiosInstance
        .get(`task/all?page=${activePage}&pageSize=${pageSize}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          setAllTasks(response.data);
        })
        .catch((error) => {
          console.error('Error fetching tasks:', error);
        });
    }
  }, [token, activePage, pageSize]);

  const {
    data: tasks,
    mutate,
    isLoading,
  } = useSWR([`task/all?page=${activePage}&pageSize=${pageSize}`, token], ([url, token]) =>
    fetcher(url, token as string)
  );
  const { data: lenders } = useSWR<LendersResponse>(['/lender/all', token], ([url, token]) =>
    fetcher(url, token as string)
  );

  const toggleRow = (id: string) => {
    setDisableButton(!disableButton);
    setSelectedID((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  };

  const toggleAll = () => {
    setDisableButton(!disableButton);
    setSelectedID((current) =>
      current?.length === tasks?.tasks?.length
        ? []
        : tasks?.tasks?.map((task: Task) => task?.task_id.toString())
    );
  };

  const handleTaskId = (taskId: number) => {
    open();
    setTaskId(taskId);
  };

  const completeTask = () => {
    const selectedTaskIds = selectedID.map((id) => parseInt(id, 10));
    const updatedTasks = tasks?.tasks?.filter(
      (task: Task) => !selectedTaskIds.includes(task.task_id)
    );

    axiosInstance
      .put(`/task/complete`, { task_ids: selectedTaskIds, is_complete: true })
      .then(() => {
        setFilteredData(updatedTasks);
        mutate();
        notifications.show({
          title: 'Success',
          color: 'teal',
          message: 'Task completed',
        });
      })
      .catch((err) => {
        console.error('Error completing tasks:', err);
        notifications.show({
          title: 'Error',
          color: 'red',
          message: 'Error completing task',
        });
      });
  };

  const handleSearch = () => {
    setAuthorizationToken(token);
    setLoadingSearch(true);
    axiosInstance
      .get(`/task/search?q=${searchTerm}`, {
        headers: {
          Authorization: `Bearer ${
            typeof localStorage !== 'undefined'
              ? localStorage.getItem('broker_access_token') || localStorage.getItem('access_token')
              : null
          }`,
        },
      })
      .then((response) => {
        setLoadingSearch(false);
        setFilteredData(response.data);
      })
      .catch((error) => {
        console.error('Search error:', error);
        setLoadingSearch(false);
      });
  };

  const handleChange = (event: any) => {
    setSearchTerm(event.target.value);
  };

  const deleteTask = () => {
    const selectedTaskIds = selectedID.map((id) => parseInt(id, 10));

    const updatedTasks = tasks?.tasks?.filter(
      (task: Task) => !selectedTaskIds.includes(task.task_id)
    );

    axiosInstance
      .delete(`/task/delete`, { data: { task_ids: selectedTaskIds } })
      .then((res) => {
        setFilteredData(updatedTasks);
        mutate();
        notifications.show({
          title: 'Deletion',
          color: 'red',
          message: 'Task deleted!',
        });
      })
      .catch((err) => {
        console.error('Error deleting tasks:', err);
        notifications.show({
          title: 'Error',
          color: 'red',
          message: 'Error deleting task',
        });
      });
  };

  useEffect(() => {
    if (
      highPriority ||
      criticalPriority ||
      lowPriority ||
      mediumPriority ||
      lenderId ||
      dueDate ||
      filterActivePage
    ) {
      const params = new URLSearchParams({
        due_date: dueDate ? `${dueDate}` : '',
        lender_id: lenderId ? `${lenderId}` : '',
        high: highPriority ? 'high' : '',
        critical: criticalPriority ? 'critical' : '',
        medium: mediumPriority ? 'medium' : '',
        low: lowPriority ? 'low' : '',
        page: `${filterActivePage}`,
        pageSize: `${pageSize}`,
      }).toString();

      axiosInstance
        .get(`/task/filter-tasks?${params}`, {
          headers: {
            Authorization: `Bearer ${
              typeof localStorage !== 'undefined'
                ? localStorage.getItem('broker_access_token') ||
                  localStorage.getItem('access_token')
                : null
            }`,
          },
        })
        .then((res) => {
          console.log('paginated data:', res.data);
          setFilteredData(res.data);
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      setFilteredData(tasks);
    }
  }, [
    highPriority,
    criticalPriority,
    lowPriority,
    mediumPriority,
    lenderId,
    tasks,
    dueDate,
    filterActivePage,
  ]);

  const rows = (filteredData?.tasks || tasks?.tasks || []).map((task: Task) => {
    const selected = selectedID.includes(task.task_id.toString());
    return (
      <Table.Tr key={task.task_id} className={cx({ [classes.rowSelected]: selected })}>
        <Table.Td>
          <Checkbox
            checked={selectedID.includes(task.task_id.toString())}
            onChange={() => toggleRow(task.task_id.toString())}
          />
        </Table.Td>
        <Table.Td>
          <Anchor onClick={() => handleTaskId(task.task_id)} component="button" fz="sm">
            {task.task_name}
          </Anchor>
        </Table.Td>

        <Table.Td c={new Date(task?.due_date) < new Date() ? 'red' : 'teal'}>
          {new Date(task.due_date).toDateString()}
        </Table.Td>
        <Table.Td>
          {task?.assignee
            ? `${task?.assignee?.assignee_first_name ?? '-'} ${
                task?.assignee?.assignee_last_name ?? '-'
              }`
            : '-'}
        </Table.Td>
        <Table.Td>{task?.broker ? `${task.broker}` : '--'}</Table.Td>
        <Table.Td>{task?.applicant == 'null null' ? '--' : `${task?.applicant}`}</Table.Td>
        <Table.Td>{task?.lender ? `${task?.lender}` : '--'}</Table.Td>
        <Table.Td
          c={
            task.task_priority === 'high'
              ? 'orange'
              : task.task_priority === 'critical'
                ? 'red'
                : task.task_priority === 'medium'
                  ? 'blue'
                  : 'grey'
          }
        >
          {task?.task_priority.toUpperCase()}
        </Table.Td>
      </Table.Tr>
    );
  });

  return (
    <SideBarLayout title="Tasks" showButton={false} showBgWhite={false} broker="">
      {isLoading ? (
        <Center>
          <Loader size="lg" mt={100} />
        </Center>
      ) : (
        <Fragment>
          {' '}
          {tasks?.length === 0 || tasks === undefined ? (
            <Center>
              <Title order={3} mt={150} c="dimmed">
                No Tasks
              </Title>
            </Center>
          ) : (
            <Card withBorder mt="sm" radius="md" padding="sm" bg="var(--mantine-color-body)">
              <Flex justify="space-between">
                <TextInput
                  radius="md"
                  size="md"
                  placeholder="Search"
                  rightSectionWidth={42}
                  leftSection={
                    <IconSearch style={{ width: rem(18), height: rem(18) }} stroke={1.5} />
                  }
                  onChange={handleChange}
                  value={searchTerm}
                  rightSection={
                    <ActionIcon
                      onClick={handleSearch}
                      size={32}
                      radius="xl"
                      color={theme.primaryColor}
                      variant="filled"
                    >
                      {loadingSearch ? (
                        <Loader color="white" size="xs" />
                      ) : (
                        <IconArrowRight style={{ width: rem(18), height: rem(18) }} stroke={1.5} />
                      )}
                    </ActionIcon>
                  }
                />
                <Flex justify="space-between" gap="xs">
                  <Fragment>
                    {' '}
                    <Tooltip label="Complete Task">
                      <Button
                        disabled={disableButton}
                        onClick={completeTask}
                        color="teal"
                        size="compact-sm"
                      >
                        <IconCircleCheck size={15} />
                      </Button>
                    </Tooltip>
                    <Button
                      disabled={disableButton}
                      onClick={deleteTask}
                      color="red"
                      size="compact-sm"
                    >
                      <IconTrash size={15} />
                    </Button>
                    <Tooltip label="Add Task">
                      <Button size="compact-sm" onClick={() => openModalTask()}>
                        <IconPlus size={15} />
                      </Button>
                    </Tooltip>
                  </Fragment>

                  <Popover width={300} trapFocus position="bottom" withArrow shadow="md">
                    <Popover.Target>
                      <Button size="compact-sm">Filter</Button>
                    </Popover.Target>
                    <Popover.Dropdown>
                      <Box>
                        <Title order={6}>Filter By Lender</Title>
                        <Select
                          placeholder="Lender"
                          data={lenders?.lenders?.map((lender) => ({
                            value: `${lender.lender_id}`,
                            label: ` ${lender.lender_name} `,
                          }))}
                          defaultValue={lenderId ? lenderId : ''}
                          onChange={setLenderId}
                          clearable
                        />
                      </Box>
                      <Box mt="md">
                        <Title order={6}>Filter By Priority</Title>
                        <Checkbox
                          checked={criticalPriority}
                          onChange={(event) => setCriticalPriority(event.currentTarget.checked)}
                          mt="sm"
                          label="Critical"
                        />
                        <Checkbox
                          checked={highPriority}
                          onChange={(event) => setHighPriority(event.currentTarget.checked)}
                          mt="sm"
                          label="High"
                        />
                        <Checkbox
                          checked={mediumPriority}
                          onChange={(event) => setMediumPriority(event.currentTarget.checked)}
                          mt="sm"
                          label="Medium"
                        />
                        <Checkbox
                          checked={lowPriority}
                          onChange={(event) => setLowPriority(event.currentTarget.checked)}
                          mt="sm"
                          label="Low"
                        />
                      </Box>
                      <Box mt="md">
                        <Title order={6}>Filter By Due Date</Title>
                        <TextInput
                          id="due_date"
                          type="date"
                          onChange={(event) => setDueDate(event.currentTarget.valueAsDate)}
                          value={dueDate ? dueDate.toISOString().split('T')[0] : undefined}
                        />
                      </Box>
                    </Popover.Dropdown>
                  </Popover>
                </Flex>
              </Flex>
              <ScrollArea>
                <Table miw={800} verticalSpacing="sm">
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th style={{ width: rem(40) }}>
                        <Checkbox
                          onChange={toggleAll}
                          checked={selectedID?.length === tasks?.length}
                          indeterminate={
                            selectedID?.length > 0 && selectedID?.length !== tasks?.length
                          }
                        />
                      </Table.Th>
                      <Table.Th>Task</Table.Th>
                      <Table.Th>Due Date</Table.Th>
                      <Table.Th>Assignee</Table.Th>
                      <Table.Th>Owner</Table.Th>
                      <Table.Th>Client</Table.Th>
                      <Table.Th>Lender</Table.Th>
                      <Table.Th>Priority</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>{rows}</Table.Tbody>
                </Table>
              </ScrollArea>
            </Card>
          )}
          {filteredData ? (
            <MantinePagination
              total={filteredData?.pagination?.totalPages}
              value={filteredData?.pagination?.page}
              onChange={setFilterActivePage}
              mt="sm"
            />
          ) : (
            <MantinePagination
              total={tasks?.tasks?.length > 0 && tasks?.pagination?.totalPages}
              value={tasks?.tasks?.length > 0 && tasks?.pagination?.page}
              onChange={setActivePage}
              mt="sm"
            />
          )}
        </Fragment>
      )}

      <Drawer opened={opened} onClose={close} position="right">
        {/* Modal content */}
        <TaskDetail task_id={taskId} mutate={mutate} />
      </Drawer>

      <Modal opened={openModal} onClose={closeModalTask} withCloseButton={false}>
        <AddTask mutate={mutate} closeModalTask={closeModalTask} />
      </Modal>
    </SideBarLayout>
  );
}

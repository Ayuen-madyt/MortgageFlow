'use client';

import React, { useState, useRef, useEffect, Fragment } from 'react';
import {
  Button,
  Text,
  Modal,
  Box,
  Title,
  TextInput,
  CloseButton,
  ScrollArea,
  Popover,
  rem,
  Flex,
  Divider,
  Paper,
  Tooltip,
  Checkbox,
} from '@mantine/core';
import Link from 'next/link';
import {
  IconSearch,
  IconRecordMail,
  IconBell,
  IconNote,
  IconArrowRight,
  IconTicket,
  IconArrowBack,
} from '@tabler/icons-react';
import 'react-datepicker/dist/react-datepicker.css';
import { axiosInstance, setAuthorizationToken } from '@/utils/axiosInstance';
import useSWR from 'swr';
import fetcher from '@/utils/fetcher';
import classes from './Task.module.css';
import { useDisclosure } from '@mantine/hooks';
import NoteDetails from './NoteDetails';
import { useAppContext } from '@/ContextAPI/ContextAPI';
import { useParams } from 'next/navigation';

export function ActivityFeedsCard() {
  const scrollAreaRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredActivityFeed, setFilteredActivityFeed] = useState([]);
  const [token, setToken] = useState('');
  const [opened, { open, close }] = useDisclosure(false);
  const [noteID, setNoteID] = useState('');
  const [note, setNote] = useState(false);
  const [task, setTask] = useState(false);
  const [email, setEmail] = useState(false);
  const [loanEven, setLoanEven] = useState(false);

  const { task_id } = useParams();

  const { state, dispatch } = useAppContext();
  const { refetch_activity_feed } = state;

  useEffect(() => {
    const access_token =
      typeof localStorage !== 'undefined' ? localStorage.getItem('broker_access_token') : null;

    setToken(access_token);
    setAuthorizationToken(access_token);
  }, []);

  const { data, mutate, isLoading } = useSWR([`/main/task/get/${task_id}`, token], ([url, token]) =>
    fetcher(url, token)
  );

  const { data: activityFeed, mutate: mutateFeeds } = useSWR(
    [`/main/task/get/activity-feed/${task_id}`, token],
    ([url, token]) => fetcher(url, token)
  );

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    if (!data) return;

    const filteredData = activityFeed.filter((activity) =>
      activity?.activity_details?.toLowerCase()?.includes(searchTerm?.toLowerCase())
    );

    setFilteredActivityFeed(filteredData);
  };

  const markTasAsIncomplete = (task_id) => {
    axiosInstance
      .put(`/task/incomplete/${task_id}`)
      .then(() => {
        dispatch({ type: 'SET_REFETCH_ACTIVITY_FEED', payload: true });
        dispatch({ type: 'SET_REFETCH_TASKS', payload: true });
      })
      .catch((err) => {
        console.error('Error completing task:', err);
      });
  };

  useEffect(() => {
    if (note || task || email || loanEven) {
      const params = new URLSearchParams({
        note: note ? 'Note' : '',
        task: task ? 'Task' : '',
        loanEven: loanEven ? 'Loan-Even' : '',
        email: email ? 'Email' : '',
        task_id,
      }).toString();

      axiosInstance
        .get(`/main/task/filter/activity-feed?${params}`, task_id)
        .then((res) => {
          setFilteredActivityFeed(res.data);
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      setFilteredActivityFeed(activityFeed);
    }
  }, [note, task, loanEven, email]);

  useEffect(() => {
    const resizeScrollArea = () => {
      const scrollArea = scrollAreaRef.current;

      if (scrollArea) {
        const windowHeight = window.innerHeight;
        const scrollAreaTop = scrollArea.getBoundingClientRect().top;
        const scrollAreaHeight = windowHeight - scrollAreaTop;
        scrollArea.style.height = `${scrollAreaHeight}px`;
      }
    };

    window.addEventListener('resize', resizeScrollArea);
    resizeScrollArea();

    return () => {
      window.removeEventListener('resize', resizeScrollArea);
    };
  }, [data]);

  useEffect(() => {
    if (refetch_activity_feed) {
      mutateFeeds([`/main/task/get/activity-feed/${task_id}`, token]);
      dispatch({ type: 'SET_REFETCH_ACTIVITY_FEED', payload: false });
    }
  }, [refetch_activity_feed, task_id, token]);

  return (
    <Fragment>
      <Flex justify="flex-start" align="center" gap="xs" p="xs">
        <TextInput
          mb="xs "
          radius="md"
          value={searchTerm}
          onChange={(e) => handleSearch(e)}
          size="xs"
          placeholder="Search activity"
          rightSectionWidth={42}
          leftSection={<IconSearch style={{ width: rem(15), height: rem(18) }} stroke={1.5} />}
          rightSection={
            <CloseButton
              aria-label="Clear input"
              onClick={() => {
                setSearchTerm('');
                setFilteredActivityFeed([]);
              }}
              style={{ display: searchTerm ? undefined : 'none' }}
            />
          }
          p="xs"
        />
        <Popover width={300} trapFocus position="bottom" withArrow shadow="md">
          <Popover.Target>
            <Button size="compact-sm">Filter Feeds</Button>
          </Popover.Target>
          <Popover.Dropdown>
            <Box>
              <Title order={6}>Filter By:</Title>

              <Checkbox
                mt="sm"
                checked={note}
                onChange={(event) => setNote(event.currentTarget.checked)}
                label="Note"
              />
              <Checkbox
                mt="sm"
                checked={task}
                onChange={(event) => setTask(event.currentTarget.checked)}
                label="Task"
              />
              <Checkbox
                mt="sm"
                checked={email}
                onChange={(event) => setEmail(event.currentTarget.checked)}
                label="Email"
              />

              <Checkbox
                mt="sm"
                checked={loanEven}
                onChange={(event) => setLoanEven(event.currentTarget.checked)}
                label="Event"
              />
            </Box>
          </Popover.Dropdown>
        </Popover>
      </Flex>
      <ScrollArea ref={scrollAreaRef} style={{ width: '100%', overflow: 'auto' }}>
        {filteredActivityFeed?.length > 0
          ? filteredActivityFeed?.map((data) => {
              if (data?.activity_type === 'Task') {
                const activityDetails = JSON.parse(data?.activity_details);
                return (
                  <Box key={data?.activity_id}>
                    <Divider size={0.1} />
                    <Paper p="xs">
                      <Flex justify="space-between" align="center">
                        <Flex justify="flex-start" align="center">
                          <IconTicket style={{ color: 'teal' }} size={15} />
                          <Title pl="xs" order={6} className={classes.customGray}>
                            Task completed
                          </Title>
                        </Flex>
                        <Tooltip label="Undo (Mark as incomplete)">
                          <IconArrowBack
                            onClick={() => {
                              markTasAsIncomplete(activityDetails?.task_id);
                            }}
                            style={{ color: 'teal', cursor: 'pointer' }}
                            size={15}
                          />
                        </Tooltip>
                      </Flex>
                      <Text className={classes.customGray} fz="sm" c="dimmed" mt={4}>
                        {`By ${activityDetails.completed_by} • ${new Date(
                          data?.timestamp
                        ).toDateString()}`}
                      </Text>
                      <Box mt="xs">
                        <Flex gap="sm">
                          <Text siz="sm">{activityDetails.task_name}</Text>
                        </Flex>
                      </Box>
                    </Paper>
                    <Divider size={0.1} />
                  </Box>
                );
              }

              if (data?.activity_type == 'Email') {
                const activityDetails = JSON.parse(data?.activity_details);

                return (
                  <Box key={data?.activity_id}>
                    <Divider size={0.1} />
                    <Paper p="xs">
                      <Flex justify="flex-start" align="center">
                        <IconRecordMail style={{ color: 'teal' }} size={20} />
                        <Title pl="xs" order={6} className={classes.customGray}>
                          Email Added
                        </Title>
                      </Flex>
                      <Text className={classes.customGray} fz="sm" c="dimmed" mt={4}>
                        {new Date(data?.timestamp).toDateString()}
                      </Text>
                      <Box mt="xs" style={{ cursor: 'pointer' }}>
                        <Flex gap="sm">
                          <Text className={classes.customGray} size="sm" fw={500}>
                            From:
                          </Text>
                          <Link
                            className={classes.relatedPartyLink}
                            href=""
                            style={{ textDecoration: 'none' }}
                          >
                            <Title order={6}>{activityDetails?.email_from}</Title>
                          </Link>
                        </Flex>
                        <Flex gap="sm">
                          <Text className={classes.customGray} size="sm" fw={500}>
                            Subject:
                          </Text>
                          <Text className={classes.customGray} size="sm">
                            {activityDetails?.email_subject}
                          </Text>
                        </Flex>
                      </Box>
                    </Paper>
                    <Divider size={0.1} />
                  </Box>
                );
              }
              if (data?.activity_type === 'Note') {
                const activityDetails = JSON.parse(data?.activity_details);

                return (
                  <Box key={data?.activity_id}>
                    <Divider size={0.1} />
                    <Paper p="xs">
                      <Flex justify="flex-start" align="center">
                        <IconNote style={{ color: 'teal' }} size={15} />
                        <Title pl="xs" order={6} className={classes.customGray}>
                          Note Added
                        </Title>
                      </Flex>
                      <Text className={classes.customGray} fz="sm" c="dimmed" mt={4}>
                        {`By ${activityDetails.created_by} • ${new Date(
                          data?.timestamp
                        ).toDateString()}`}
                      </Text>
                      {activityDetails?.user_email && (
                        <Flex gap="sm" mt="xs">
                          <Link
                            className={classes.relatedPartyLink}
                            href=""
                            style={{ textDecoration: 'none' }}
                          >
                            <Title order={6}>{activityDetails?.user_email}</Title>
                          </Link>
                        </Flex>
                      )}
                      <div style={{ maxHeight: '120px', overflowY: 'auto' }}>
                        <div
                          className={classes.customGray}
                          size="sm"
                          style={{ cursor: 'pointer' }}
                          mt="xs"
                          onClick={() => {
                            setNoteID(activityDetails.note_id);
                            open();
                          }}
                          dangerouslySetInnerHTML={{ __html: activityDetails?.note_content }}
                        />
                      </div>
                    </Paper>
                    <Divider size={0.1} />
                  </Box>
                );
              }
              if (data?.activity_type == 'Loan-Even') {
                const activityDetails = JSON.parse(data?.activity_details);
                return (
                  <Box key={data?.activity_id}>
                    <Divider size={0.1} />
                    <Paper p="xs">
                      <Flex justify="flex-start" align="center">
                        <IconBell style={{ color: 'teal' }} size={15} />
                        <Title pl="xs" order={6} className={classes.customGray}>
                          Loan Event
                        </Title>
                      </Flex>
                      <Text className={classes.customGray} fz="sm" c="dimmed" mt={4}>
                        {`By ${activityDetails?.moved_by} • ${new Date(
                          data?.timestamp
                        ).toDateString()}`}
                      </Text>
                      {activityDetails?.user_email && (
                        <Flex gap="sm" mt="xs">
                          <Link
                            className={classes.relatedPartyLink}
                            href=""
                            style={{ textDecoration: 'none' }}
                          >
                            <Title order={6}>{activityDetails.user_email}</Title>
                          </Link>
                        </Flex>
                      )}
                      <Flex justify="space-between" mt="xs">
                        <Text className={classes.customGray} size="sm">
                          {activityDetails?.stage_moved_from}
                          <Text c="dimmed" size="xs">
                            {`(${activityDetails?.board_moved_from})`}
                          </Text>
                        </Text>
                        <IconArrowRight style={{ marginRight: '20px' }} color="gray" />
                        <Text className={classes.customGray} size="sm">
                          {activityDetails?.stage_moved_to}
                          <Text c="dimmed" size="xs">
                            {`(${activityDetails?.board_moved_to})`}
                          </Text>
                        </Text>
                      </Flex>
                    </Paper>
                    <Divider size={0.1} />
                  </Box>
                );
              }
            })
          : activityFeed?.map((data) => {
              if (data?.activity_type === 'Task') {
                const activityDetails = JSON.parse(data?.activity_details);
                return (
                  <Box key={data?.activity_id}>
                    <Divider size={0.1} />
                    <Paper p="xs">
                      <Flex justify="space-between" align="center">
                        <Flex justify="flex-start" align="center">
                          <IconTicket style={{ color: 'teal' }} size={15} />
                          <Title pl="xs" order={6} className={classes.customGray}>
                            Task completed
                          </Title>
                        </Flex>
                        <Tooltip label="Undo (Mark as incomplete)">
                          <IconArrowBack
                            onClick={() => {
                              markTasAsIncomplete(activityDetails?.task_id);
                            }}
                            style={{ color: 'teal', cursor: 'pointer' }}
                            size={15}
                          />
                        </Tooltip>
                      </Flex>
                      <Text className={classes.customGray} fz="sm" c="dimmed" mt={4}>
                        {`By ${activityDetails.completed_by} • ${new Date(
                          data?.timestamp
                        ).toDateString()}`}
                      </Text>
                      <Box mt="xs">
                        <Flex gap="sm">
                          <Text siz="sm">{activityDetails.task_name}</Text>
                        </Flex>
                      </Box>
                    </Paper>
                    <Divider size={0.1} />
                  </Box>
                );
              }

              if (data?.activity_type == 'Email') {
                const activityDetails = JSON.parse(data?.activity_details);

                return (
                  <Box key={data?.activity_id}>
                    <Divider size={0.1} />
                    <Paper p="xs">
                      <Flex justify="flex-start" align="center">
                        <IconRecordMail style={{ color: 'teal' }} size={20} />
                        <Title pl="xs" order={6} className={classes.customGray}>
                          Email Added
                        </Title>
                      </Flex>
                      <Text className={classes.customGray} fz="sm" c="dimmed" mt={4}>
                        {new Date(data?.timestamp).toDateString()}
                      </Text>
                      <Box mt="xs" style={{ cursor: 'pointer' }}>
                        <Flex gap="sm">
                          <Text className={classes.customGray} size="sm" fw={500}>
                            From:
                          </Text>
                          <Link
                            className={classes.relatedPartyLink}
                            href=""
                            style={{ textDecoration: 'none' }}
                          >
                            <Title order={6}>{activityDetails?.email_from}</Title>
                          </Link>
                        </Flex>
                        <Flex gap="sm">
                          <Text className={classes.customGray} size="sm" fw={500}>
                            Subject:
                          </Text>
                          <Text className={classes.customGray} size="sm">
                            {activityDetails?.email_subject}
                          </Text>
                        </Flex>
                      </Box>
                    </Paper>
                    <Divider size={0.1} />
                  </Box>
                );
              }
              if (data?.activity_type === 'Note') {
                const activityDetails = JSON.parse(data?.activity_details);
                return (
                  <Box key={data?.activity_id}>
                    <Divider size={0.1} />
                    <Paper p="xs">
                      <Flex justify="flex-start" align="center">
                        <IconNote style={{ color: 'teal' }} size={15} />
                        <Title pl="xs" order={6} className={classes.customGray}>
                          Note Added
                        </Title>
                      </Flex>
                      <Text className={classes.customGray} fz="sm" c="dimmed" mt={4}>
                        {`By ${activityDetails.created_by} • ${new Date(
                          data?.timestamp
                        ).toDateString()}`}
                      </Text>
                      {activityDetails?.user_email && (
                        <Flex gap="sm" mt="xs">
                          <Link
                            className={classes.relatedPartyLink}
                            href=""
                            style={{ textDecoration: 'none' }}
                          >
                            <Title order={6}>{activityDetails?.user_email}</Title>
                          </Link>
                        </Flex>
                      )}

                      <div style={{ maxHeight: '120px', overflowY: 'auto' }}>
                        <div
                          className={classes.customGray}
                          size="sm"
                          style={{ cursor: 'pointer' }}
                          mt="xs"
                          onClick={() => {
                            setNoteID(activityDetails?.note_id);
                            open();
                          }}
                          dangerouslySetInnerHTML={{ __html: activityDetails?.note_content }}
                        />
                      </div>
                    </Paper>
                    <Divider size={0.1} />
                  </Box>
                );
              }
              if (data?.activity_type == 'Loan-Even') {
                const activityDetails = JSON.parse(data?.activity_details);
                return (
                  <Box key={data?.activity_id}>
                    <Divider size={0.1} />
                    <Paper p="xs">
                      <Flex justify="flex-start" align="center">
                        <IconBell style={{ color: 'teal' }} size={15} />
                        <Title pl="xs" order={6} className={classes.customGray}>
                          Loan Event
                        </Title>
                      </Flex>
                      <Text className={classes.customGray} fz="sm" c="dimmed" mt={4}>
                        {`By ${activityDetails?.moved_by} • ${new Date(
                          data?.timestamp
                        ).toDateString()}`}
                      </Text>
                      {activityDetails?.user_email && (
                        <Flex gap="sm" mt="xs">
                          <Link
                            className={classes.relatedPartyLink}
                            href=""
                            style={{ textDecoration: 'none' }}
                          >
                            <Title order={6}>{activityDetails.user_email}</Title>
                          </Link>
                        </Flex>
                      )}
                      <Flex justify="space-between" mt="xs">
                        <Text className={classes.customGray} size="sm">
                          {activityDetails?.stage_moved_from}
                          <Text c="dimmed" size="xs">
                            {`(${activityDetails?.board_moved_from})`}
                          </Text>
                        </Text>
                        <IconArrowRight style={{ marginRight: '20px' }} color="gray" />
                        <Text className={classes.customGray} size="sm">
                          {activityDetails?.stage_moved_to}
                          <Text c="dimmed" size="xs">
                            {`(${activityDetails?.board_moved_to})`}
                          </Text>
                        </Text>
                      </Flex>
                    </Paper>
                    <Divider size={0.1} />
                  </Box>
                );
              }
            })}
      </ScrollArea>

      <Modal opened={opened} onClose={close} withCloseButton={false} size="50%">
        <NoteDetails note_id={noteID} closeModal={close} mutate={mutate} />
      </Modal>
    </Fragment>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import {
  Button,
  Text,
  Box,
  Flex,
  TextInput,
  Popover,
  Tooltip,
  Modal,
  Collapse,
  rem,
  Textarea,
  Title,
} from '@mantine/core';
import {
  IconCheck,
  IconPencil,
  IconPlus,
  IconTrash,
  IconChevronRight,
  IconX,
} from '@tabler/icons-react';
import { axiosInstance } from '@/utils/axiosInstance';
import useSWR from 'swr';
import fetcher from '@/utils/fetcher';
import classes from '../Task.module.css';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { jwtDecode } from 'jwt-decode';
import formatDateString from '../../../utils/formatDateString';

export default function SubChecklistSections({ section_id, mutateSections }) {
  const [user, setUser] = useState(null);
  const [openedSections, setOpenedSections] = useState({});
  const [opened, { open, close }] = useDisclosure(false);
  const [addSectionOpend, { toggle }] = useDisclosure(false);
  const [newItem, setNewItem] = useState('');
  const [title, setTitle] = useState('');
  const [subSectionId, setSubSectionId] = useState();
  const [hoveredItemId, setHoveredItemId] = useState(null);

  const { data, mutate } = useSWR(`/main-task/checklists/sub-sections/${section_id}`, fetcher);

  const toggleSection = (sectionId) => {
    setOpenedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const updateChecklistItem = () => {
    axiosInstance
      .put(`/main-task/checklists/update/sub-section/${subSectionId}`, { title })
      .then((res) => {
        console.log(res);
        setTitle('');
        close();
        const updatedData = data?.map((item) =>
          item.task_sub_section_id === subSectionId ? { ...item, title } : { ...item }
        );
        mutate(updatedData, false);
      })
      .catch((err) => {
        console.log(err);
        notifications.show({
          title: 'Error',
          color: 'red',
          message: 'Error updating checklist item',
        });
      });
  };

  const completeChecklistItem = (id) => {
    axiosInstance
      .put(`/main-task/checklists/update/sub-section/${id}`, {
        is_complete: true,
        completed_by: `${user?.first_name} ${user?.last_name}`,
        date_completed: new Date().toISOString(),
      })
      .then((res) => {
        const updatedData = data?.map((item) =>
          item.task_sub_section_id === id
            ? {
                ...item,
                is_complete: true,
                completed_by: `${user?.first_name} ${user?.last_name}`,
                date_completed: new Date().toISOString(),
              }
            : { ...item }
        );
        mutate(updatedData, false);
        mutate();
        mutateSections();
      })
      .catch((err) => {
        console.log(err);
        notifications.show({
          title: 'Error',
          color: 'red',
          message: 'Error completing checklist item',
        });
      });
  };

  const markAsIncomplete = (id) => {
    axiosInstance
      .put(`/main-task/checklists/update/sub-section/${id}`, {
        is_complete: false,
        completed_by: null,
        date_completed: null,
      })
      .then((res) => {
        const updatedData = data?.map((item) =>
          item.task_sub_section_id === id
            ? {
                ...item,
                is_complete: false,
                completed_by: null,
                date_completed: null,
              }
            : { ...item }
        );
        mutate(updatedData, false);
        mutate();
        mutateSections();
      })
      .catch((err) => {
        console.log(err);
        notifications.show({
          title: 'Error',
          color: 'red',
          message: 'Error completing checklist item',
        });
      });
  };

  const createChecklistItem = () => {
    const item = {
      task_sub_section_id: Math.random(),
      task_section_id: subSectionId,
      title: newItem,
      is_complete: false,
      completed_by: null,
      date_completed: null,
    };
    axiosInstance
      .post(`/main-task/checklists/create/sub-section/${section_id}`, { title: newItem })
      .then((res) => {
        console.log(res);
        setNewItem('');
        mutate([...data, item], false);
        mutate();
        mutateSections();
      })
      .catch((err) => {
        console.log(err);
        notifications.show({
          title: 'Error',
          color: 'red',
          message: 'Error adding checklist item',
        });
      });
  };

  const deleteChecklistItem = (id) => {
    axiosInstance
      .delete(`/main-task/checklists/delete/sub-section/${id}`)
      .then((res) => {
        console.log(res);
        const updatedData = data?.filter((item) => item.task_sub_section_id !== id);
        mutate(updatedData, false);
        mutateSections();
      })
      .catch((err) => {
        console.log(err);
        notifications.show({
          title: 'Error',
          color: 'red',
          message: 'Error deleting checklist item',
        });
      });
  };

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token !== null) {
      try {
        const decoded = jwtDecode(token);
        setUser(decoded);
      } catch (error) {
        console.error('Error decoding JWT:', error);
      }
    } else {
      console.error('Token is null in localStorage');
    }
  }, []);

  return (
    <Box style={{ backgroundColor: '#228be6' }} p="xs" mt="xs">
      {data &&
        data?.map((section) => (
          <Box key={section?.task_sub_section_id} mt="xs">
            <Flex justify="space-between">
              <Flex style={{ cursor: 'pointer', color: 'white' }} justify="flex-start" gap="xs">
                <Flex
                  justify="flex-start"
                  onMouseEnter={() => setHoveredItemId(section?.task_sub_section_id)}
                  onMouseLeave={() => setHoveredItemId(null)}
                >
                  <Button
                    size="compact-sm"
                    style={{
                      width: '25px',
                      height: '25px',
                      borderRadius: '50%',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      border: '0.5px solid white',
                      backgroundColor: section?.is_complete ? 'teal' : '',
                    }}
                    onClick={() => completeChecklistItem(section?.task_sub_section_id)}
                  >
                    {section?.is_complete ? (
                      <IconCheck size={15} />
                    ) : (
                      hoveredItemId === section?.task_sub_section_id && <IconCheck size={15} />
                    )}
                  </Button>

                  {hoveredItemId === section?.task_sub_section_id &&
                    (section?.is_complete ? (
                      <Tooltip label="Mark as Incomplete">
                        <Button
                          ml="xs"
                          size="compact-sm"
                          style={{
                            width: '25px',
                            height: '25px',
                            borderRadius: '50%',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            border: '1px solid white',
                          }}
                          onClick={() => markAsIncomplete(section?.task_sub_section_id)}
                        >
                          <IconX size={15} color="red" />
                        </Button>
                      </Tooltip>
                    ) : null)}
                </Flex>

                <Text
                  style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}
                  fz="sm"
                  pr="xs"
                  fw="bold"
                  styles={{ color: 'white' }}
                >
                  {section?.title}
                </Text>
              </Flex>

              <Flex justify="flex-end" gap="xs" align="center" wrap="nowrap">
                <Popover width={200} position="bottom" withArrow shadow="md">
                  <Popover.Target>
                    <Tooltip label="Actions">
                      <Button
                        size="compact-sm"
                        style={{
                          width: '25px',
                          height: '25px',
                          borderRadius: '50%',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          border: '0.5px solid white',
                          color: 'black',
                          justifySelf: 'center',
                          alignItems: 'center',
                        }}
                      >
                        <Text c="white">...</Text>
                      </Button>
                    </Tooltip>
                  </Popover.Target>
                  <Popover.Dropdown>
                    <Flex
                      className={classes.flexHoverEffect}
                      justify="flex-start"
                      align="center"
                      gap="xs"
                      p="xs"
                      onClick={() => {
                        open();
                        setTitle(section?.title);
                        setSubSectionId(section?.task_sub_section_id);
                      }}
                    >
                      <IconPencil size={20} />
                      <Text>Edit</Text>
                    </Flex>
                    <Flex
                      className={classes.flexHoverEffect}
                      justify="flex-start"
                      align="center"
                      gap="xs"
                      p="xs"
                      onClick={() => deleteChecklistItem(section?.task_sub_section_id)}
                    >
                      <IconTrash size={20} />
                      <Text>Delete</Text>
                    </Flex>
                  </Popover.Dropdown>
                </Popover>
                {section?.is_complete ? (
                  <IconChevronRight
                    className={classes.chevron}
                    stroke={1.5}
                    style={{
                      width: rem(16),
                      height: rem(16),
                      transform: openedSections[section?.task_sub_section_id]
                        ? 'rotate(-90deg)'
                        : 'none',
                      cursor: 'pointer',
                      color: 'white',
                    }}
                    onClick={() => toggleSection(section?.task_sub_section_id)}
                  />
                ) : null}
              </Flex>
            </Flex>

            <Collapse in={openedSections[section?.task_sub_section_id]} mt={1}>
              <Text size="xs" c="white" p="xs">
                {`Completed by ${section?.completed_by} @ ${formatDateString(
                  new Date(section?.date_completed)
                )}`}
              </Text>
            </Collapse>
          </Box>
        ))}

      <Box mt="xs" style={{ cursor: 'pointer', color: 'white' }}>
        <Flex justify="flex-start" gap="sm" onClick={toggle}>
          <Button
            size="compact-sm"
            style={{
              width: '25px',
              height: '25px',
              borderRadius: '50%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              border: '0.5px solid white',
            }}
          >
            <IconPlus size={15} />
          </Button>
          <Text fz="sm" pr="xs">
            Quick Add Question
          </Text>
        </Flex>

        <Collapse in={addSectionOpend} mt="sm">
          <Textarea
            value={newItem}
            onChange={(event) => setNewItem(event.currentTarget.value)}
            placeholder="Type your checklist question"
          />
          <Flex justify="flex-end" mt="sm">
            <Button onClick={() => createChecklistItem()}>Save</Button>
          </Flex>
        </Collapse>
      </Box>

      <Modal opened={opened} onClose={close} withCloseButton={false}>
        <Title order={5}>{`Edit item: ${title}`}</Title>

        <TextInput
          onChange={(e) => setTitle(e.target.value)}
          value={title}
          placeholder="Name"
          label="Item Name"
        />

        <Flex justify="flex-end" mt="sm">
          <Button onClick={() => updateChecklistItem()}>Save</Button>
        </Flex>
      </Modal>
    </Box>
  );
}

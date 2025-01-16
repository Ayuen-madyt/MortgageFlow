'use client';
import React, { Fragment, useState } from 'react';
import {
  Table,
  ScrollArea,
  useMantineTheme,
  Card,
  Box,
  Button,
  Flex,
  Title,
  Modal,
  Divider,
  Pagination,
  Switch,
  Popover,
  Text,
  TextInput,
  Loader,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import fetcher from '@/utils/fetcher';
import useSWR from 'swr';
import { axiosInstance, setAuthorizationToken } from '@/utils/axiosInstance';
import { notifications } from '@mantine/notifications';
import { NoteTemplatesResponse } from '@/utils/types';
import Link from 'next/link';
import classes from './Checklist.module.css';

export default function ChecklistTable() {
  const [opened, { open, close }] = useDisclosure(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');

  const [activePage, setActivePage] = useState(1);

  const { data: noteTemplates } = useSWR<NoteTemplatesResponse>('/note/get/templates', fetcher);

  const { data, mutate, isLoading } = useSWR('/checklists/get', fetcher);

  const addChecklist = () => {
    setLoading(true);
    axiosInstance
      .post('/checklists/create', { checklist_name: name })
      .then((res) => {
        setLoading(false);
        setName('');
        close();
        mutate();
      })
      .catch((err) => {
        setLoading(false);
        console.log(err);
        notifications.show({
          title: 'Error',
          color: 'red',
          message: 'Error creating checklist',
        });
      });
  };

  const handleToggleDefault = (checklistId: any, currentStatus: any) => {
    axiosInstance
      .put(`/checklists/update/${checklistId}`, {
        is_default: !currentStatus,
      })
      .then((res) => {
        setLoading(false);
        const updatedData = data?.map((checklist: any) =>
          checklist.checklist_id === checklistId
            ? { ...checklist, is_default: !currentStatus }
            : { ...checklist, is_default: false }
        );

        mutate(updatedData, false);
      })
      .catch((err) => {
        setLoading(false);
        console.log(err);
        notifications.show({
          title: 'Error',
          color: 'red',
          message: 'Something went wrong!',
        });
      });
  };

  const deleteChecklist = (checklistId: any) => {
    axiosInstance
      .delete(`/checklists/delete/${checklistId}`)
      .then((res) => {
        setLoading(false);
        const updatedData = data.filter((checklist: any) => checklist.checklist_id !== checklistId);

        mutate(updatedData, false);
      })
      .catch((err) => {
        setLoading(false);
        console.log(err);
        notifications.show({
          title: 'Error',
          color: 'red',
          message: 'Error deleting checklist',
        });
      });
  };

  const rows = data?.map((checklist: any) => {
    return (
      <Table.Tr key={checklist.checklist_id} className={classes.tableRow}>
        <Table.Td>
          <Link
            href={`/settings/checklists/single-checklist/${checklist.checklist_id}`}
            className={classes.customGray}
          >
            <Text> {checklist.checklist_name}</Text>
          </Link>
        </Table.Td>

        <Table.Td>{`${checklist?.first_name.trim()} ${checklist?.last_name?.trim()}`}</Table.Td>

        <Table.Td>
          <Switch
            checked={checklist.is_default == 1 ? true : false}
            label={checklist.is_default == 1 ? 'True' : 'False'}
            onChange={() => handleToggleDefault(checklist.checklist_id, checklist.is_default)}
          />
        </Table.Td>

        <Table.Td>
          <Popover width={200} position="bottom" withArrow shadow="md">
            <Popover.Target>
              <Button color="red" size="compact-sm">
                <IconTrash size={15} />
              </Button>
            </Popover.Target>
            <Popover.Dropdown>
              <Text size="xs">Are you sure you want to delete this Checklist?</Text>
              <Flex justify="flex-start" gap="md" mt="sm">
                <Button color="grey" size="compact-sm">
                  Cancel
                </Button>
                <Button
                  onClick={() => deleteChecklist(checklist?.checklist_id)}
                  size="compact-sm"
                  color="red"
                >
                  Yes
                </Button>
              </Flex>
            </Popover.Dropdown>
          </Popover>
        </Table.Td>
      </Table.Tr>
    );
  });

  return (
    <Box>
      <Card withBorder radius="md" bg="var(--mantine-color-body)" style={{ padding: 0, margin: 0 }}>
        <Flex justify="space-between">
          <Title p="md" className={classes.customGray} order={4}>
            Checklists
          </Title>
          <Flex justify="space-between" gap="xs" p="md">
            <Button onClick={open} size="compact-sm">
              <IconPlus size={15} />
              Add Checklist
            </Button>
          </Flex>
        </Flex>
        <Divider />

        <Box bg="var(--mantine-color-body)">
          <ScrollArea>
            <Table miw={800}>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th> Name</Table.Th>

                  <Table.Th>Created By</Table.Th>
                  <Table.Th>Default</Table.Th>
                  <Table.Th>Action</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>{rows}</Table.Tbody>
            </Table>
          </ScrollArea>
        </Box>

        <Pagination
          total={noteTemplates?.pagination?.totalPages ?? 0}
          value={activePage}
          onChange={setActivePage}
          mt="sm"
          p="md"
        />
      </Card>

      <Modal opened={opened} onClose={close} withCloseButton={false}>
        <Title order={5}>Create New Checklist</Title>
        <TextInput
          onChange={(e) => setName(e.target.value)}
          value={name}
          label="Name"
          placeholder="Name"
        />
        <Flex justify="flex-end" mt="sm">
          <Button disabled={loading} onClick={addChecklist}>
            {loading ? <Loader size="sm" /> : 'Save'}
          </Button>
        </Flex>
      </Modal>
    </Box>
  );
}

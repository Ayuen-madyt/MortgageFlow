'use client';

import {
  Title,
  Card,
  Flex,
  Button,
  Tooltip,
  Divider,
  Modal,
  TextInput,
  Box,
  Select,
  Loader,
} from '@mantine/core';
import { IconPlus, IconPencil } from '@tabler/icons-react';
import ChecklistSection from '@/components/Settings/checklists/Section';
import { useDisclosure } from '@mantine/hooks';
import { useParams } from 'next/navigation';
import useSWR from 'swr';
import fetcher from '@/utils/fetcher';
import { useEffect, useState } from 'react';
import { notifications } from '@mantine/notifications';
import { axiosInstance } from '@/utils/axiosInstance';

export default function page() {
  const [opened, { open, close }] = useDisclosure(false);
  const [loading, setLoading] = useState(false);
  const [sectionName, setSectionName] = useState('');
  const [editableName, setEditableName] = useState('');
  const [edit, setEdit] = useState(false);

  const { id } = useParams();

  const { data, mutate, isLoading } = useSWR(`/checklists/get/single-checklist/${id}`, fetcher);

  const addSection = () => {
    setLoading(true);
    axiosInstance
      .post(`/checklists/create/checklist-section/${id}`, { title: sectionName })
      .then((res) => {
        console.log(res);
        setLoading(false);
        setSectionName('');
        close();
        window.location.reload();
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
        notifications.show({
          title: 'Error',
          color: 'red',
          message: 'Error deleting checklist',
        });
      });
  };

  const handleBlur = () => {
    setLoading(true);
    setEdit(false);
    axiosInstance
      .put(`/checklists/update/${id}`, {
        checklist_name: editableName,
      })
      .then((res) => {
        setLoading(false);

        mutate({ ...data, checklist_name: editableName }, false);
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

  useEffect(() => {
    if (data) {
      setEditableName(data?.checklist_name);
    }
  }, [data]);

  return (
    <Card withBorder radius="md" bg="var(--mantine-color-body)" style={{ padding: 0, margin: 0 }}>
      <Flex justify="space-between" p="xs">
        <Flex justify="flex-start" gap="sm" align="center">
          {!edit && (
            <Title order={4} fw="bold">
              {data?.checklist_name}
            </Title>
          )}
          {edit && (
            <TextInput
              value={editableName}
              placeholder="name"
              onChange={(e) => setEditableName(e.target.value)}
              onBlur={handleBlur}
            />
          )}

          <IconPencil
            onClick={() => setEdit(true)}
            size={20}
            color="#228be6"
            style={{ cursor: 'pointer' }}
          />
        </Flex>
        <Tooltip label="Add New Section">
          <Button
            size="compact-sm"
            style={{
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
            onClick={open}
          >
            <IconPlus />
          </Button>
        </Tooltip>
      </Flex>
      <Divider mb="lg" />

      <ChecklistSection checklist_id={id} />

      {/* modal */}
      <Modal opened={opened} onClose={close} withCloseButton={false}>
        <Title order={5}>Add New Section</Title>
        <Box mt="sm">
          <TextInput
            onChange={(e) => setSectionName(e.target.value)}
            value={sectionName}
            placeholder="Name"
            label="Section Name"
          />

          <Flex justify="flex-end" mt="sm">
            <Button disabled={loading ? true : false} onClick={addSection}>
              {loading ? <Loader size="sm" /> : ' Save'}
            </Button>
          </Flex>
        </Box>
      </Modal>
    </Card>
  );
}

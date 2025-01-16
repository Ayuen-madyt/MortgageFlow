'use client';

import { useState } from 'react';
import { axiosInstance } from '@/utils/axiosInstance';
import {
  Box,
  Flex,
  Button,
  Tooltip,
  Text,
  Popover,
  Modal,
  Title,
  TextInput,
  Loader,
} from '@mantine/core';
import { IconPencil, IconTrash } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import fetcher from '@/utils/fetcher';
import useSWR from 'swr';
import { useDisclosure } from '@mantine/hooks';

export default function SubSection({ section_id }: any) {
  const [opened, { open, close }] = useDisclosure(false);
  const [loading, setLoading] = useState(false);
  const [subSectionName, setSubSectionName] = useState('');
  const [subSectionId, setSubSectionId] = useState();

  const { data, mutate, isLoading } = useSWR(
    `/checklists/get/sub-checklist-sections/${section_id}`,
    fetcher
  );

  const deleteChecklistItem = (sectionId: any) => {
    axiosInstance
      .delete(`/checklists/sub-section-checklist/remove/${sectionId}`)
      .then((res) => {
        const updatedData = data?.filter((section: any) => section.sub_section_id !== sectionId);

        mutate(updatedData, false);
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

  const editSubChecklist = () => {
    setLoading(true);
    axiosInstance
      .put(`/checklists/sub-checklist-section/update/${subSectionId}`, { title: subSectionName })
      .then((res) => {
        console.log(res);
        setLoading(false);
        close();
        const updatedData = data?.map((section: any) =>
          section.sub_section_id === subSectionId
            ? { ...section, title: subSectionName }
            : { ...section }
        );
        mutate(updatedData, false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
        notifications.show({
          title: 'Error',
          color: 'red',
          message: 'Error deleting checklist item',
        });
      });
  };
  return (
    <Box p="xs">
      {data?.map((section: any) => (
        <Flex
          style={{
            cursor: 'pointer',
            borderBottom: '1px solid #dee2e6',
            paddingBottom: '5px',
            paddingTop: '5px',
          }}
          justify="space-between"
          key={section?.sub_section_id}
        >
          <Flex justify="flex-start" gap="xs" align="center">
            <svg
              viewBox="64 64 896 896"
              focusable="false"
              data-icon="check-circle"
              width="1em"
              height="1em"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm193.5 301.7l-210.6 292a31.8 31.8 0 01-51.7 0L318.5 484.9c-3.8-5.3 0-12.7 6.5-12.7h46.9c10.2 0 19.9 4.9 25.9 13.3l71.2 98.8 157.2-218c6-8.3 15.6-13.3 25.9-13.3H699c6.5 0 10.3 7.4 6.5 12.7z"></path>
            </svg>
            <Text
              style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}
              fz="sm"
              fw={700}
              pr="xs"
            >
              {section?.title}
            </Text>
          </Flex>

          <Flex justify="flex-start" gap="xs">
            <Tooltip label="Edit">
              <Button
                size="compact-sm"
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: 'white',
                  border: '1px solid #dee2e6',
                }}
                onClick={() => {
                  open();
                  setSubSectionName(section?.title);
                  setSubSectionId(section?.sub_section_id);
                }}
              >
                <IconPencil color="black" size={20} />
              </Button>
            </Tooltip>

            <Popover width={200} position="bottom" withArrow shadow="md">
              <Popover.Target>
                <Tooltip label="Delete">
                  <Button
                    size="compact-sm"
                    style={{
                      width: '30px',
                      height: '30px',
                      borderRadius: '50%',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      backgroundColor: 'white',
                      border: '0.2px solid red',
                    }}
                  >
                    <IconTrash color="red" size={20} />
                  </Button>
                </Tooltip>
              </Popover.Target>
              <Popover.Dropdown>
                <Text size="sm">Are you sure you want to delete this checklist item?</Text>
                <Flex justify="flex-start" gap="sm" mt="sm">
                  <Button
                    size="compact-sm"
                    color="grey"
                    style={{
                      alignItems: 'center',
                      color: 'white',
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="compact-sm"
                    color="red"
                    style={{
                      color: 'white',
                    }}
                    onClick={() => deleteChecklistItem(section?.sub_section_id)}
                  >
                    Yes
                  </Button>
                </Flex>
              </Popover.Dropdown>
            </Popover>
          </Flex>
        </Flex>
      ))}

      <Modal opened={opened} onClose={close} withCloseButton={false}>
        <Title order={5}>{`Edit ${subSectionName}`}</Title>
        <Box mt="sm">
          <TextInput
            value={subSectionName}
            onChange={(e) => setSubSectionName(e.target.value)}
            placeholder="Name"
            label="Checklist item title"
          />
          <Flex justify="flex-end" mt="sm">
            <Button onClick={() => editSubChecklist()} disabled={loading ? true : false}>
              {loading ? <Loader size="sm" /> : 'Save'}
            </Button>
          </Flex>
        </Box>
      </Modal>
    </Box>
  );
}

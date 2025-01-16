'use client';

import { useState, useEffect } from 'react';
import {
  Title,
  Box,
  Flex,
  Button,
  Tooltip,
  Popover,
  Text,
  Modal,
  Select,
  TextInput,
  Loader,
} from '@mantine/core';
import { IconPlus, IconPencil, IconTrash } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import SubSection from './SubSection';
import { axiosInstance } from '@/utils/axiosInstance';
import { notifications } from '@mantine/notifications';
import fetcher from '@/utils/fetcher';
import useSWR from 'swr';

export default function ChecklistSection({ checklist_id }: any) {
  const [opened, { open, close }] = useDisclosure(false);
  const [openChecklisgSectionModal, setChecklistSectionModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sectionId, setSectionId] = useState('');
  const [sectionName, setSectionName] = useState('');
  const [subSectionName, setSubSectionName] = useState('');

  const { data: sections, mutate } = useSWR(
    `/checklists/get/checklist-sections/${checklist_id}`,
    fetcher
  );

  const addSubChecklistSection = () => {
    axiosInstance
      .post(`/checklists/create/sub-checklist-section/${sectionId}`, { title: subSectionName })
      .then((res) => {
        console.log(res);
        setLoading(false);
        setSubSectionName('');
        window.location.reload();
        close();
        notifications.show({
          title: 'Success',
          color: 'teal',
          message: 'Checklist item added',
        });
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
        close();
        notifications.show({
          title: 'Error',
          color: 'red',
          message: 'Error adding checklist item',
        });
      });
  };

  const editChecklistSection = () => {
    axiosInstance
      .put(`/checklists/checklist-section/update/${sectionId}`, { title: sectionName })
      .then((res) => {
        console.log(res);
        setLoading(false);
        setSectionName('');
        setChecklistSectionModal(false);

        const updatedData = sections?.map((section: any) =>
          section.section_id === sectionId ? { ...section, title: sectionName } : { ...section }
        );
        mutate(updatedData, false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
        setChecklistSectionModal(false);
        notifications.show({
          title: 'Error',
          color: 'red',
          message: 'Error adding checklist item',
        });
      });
  };

  const deleteChecklistSection = (section_id: any) => {
    axiosInstance
      .delete(`/checklists/section-checklist/delete/${section_id}`)
      .then((res) => {
        console.log(res);
        const updatedData = sections?.filter((section: any) => section.section_id !== section_id);
        mutate(updatedData, false);
      })
      .catch((err) => {
        console.log(err);
        notifications.show({
          title: 'Error',
          color: 'red',
          message: 'Error deleting checklist section @',
        });
      });
  };

  return (
    <Box>
      {sections?.map((section: any) => (
        <Box key={section.section_id}>
          <Flex
            justify="space-between"
            p="xs"
            style={{ backgroundColor: '#228be6', color: 'white' }}
          >
            <Title order={4} fw="bold">
              {section?.title}
            </Title>

            <Flex justify="flex-start" gap="xs">
              <Tooltip label="Edit Section">
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
                  }}
                  onClick={() => {
                    setSectionName(section?.title);
                    setSectionId(section?.section_id);
                    setChecklistSectionModal(true);
                  }}
                >
                  <IconPencil color="black" size={20} />
                </Button>
              </Tooltip>

              <Tooltip label="Add New Checklist Item">
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
                  }}
                  onClick={() => {
                    open();
                    setSectionId(section?.section_id);
                  }}
                >
                  <IconPlus color="black" size={20} />
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
                  <Text size="sm">Delete Section?</Text>
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
                      onClick={() => deleteChecklistSection(section.section_id)}
                    >
                      Yes
                    </Button>
                  </Flex>
                </Popover.Dropdown>
              </Popover>
            </Flex>
          </Flex>

          {/* subsection */}
          <SubSection section_id={section?.section_id} />
        </Box>
      ))}

      {/* add new checklist item modal */}
      <Modal opened={opened} onClose={close} withCloseButton={false}>
        <Title order={5}>Add New Item</Title>
        <Box mt="sm">
          <TextInput
            value={subSectionName}
            onChange={(e) => setSubSectionName(e.target.value)}
            placeholder="Name"
            label="Checklist item title"
          />
          <Flex justify="flex-end" mt="sm">
            <Button onClick={addSubChecklistSection} disabled={loading ? true : false}>
              {' '}
              {loading ? <Loader size="sm" /> : 'Save'}
            </Button>
          </Flex>
        </Box>
      </Modal>

      {/* edit new checklist section modal */}

      <Modal
        opened={openChecklisgSectionModal}
        onClose={() => setChecklistSectionModal(false)}
        withCloseButton={false}
      >
        <Title order={5}>{`Edit ${sectionName}`}</Title>
        <Box mt="sm">
          <TextInput
            onChange={(e) => setSectionName(e.target.value)}
            value={sectionName}
            placeholder="Name"
            label="Section Name"
          />

          <Flex justify="flex-end" mt="sm">
            <Button disabled={loading ? true : false} onClick={editChecklistSection}>
              {loading ? <Loader size="sm" /> : ' Save'}
            </Button>
          </Flex>
        </Box>
      </Modal>
    </Box>
  );
}

'use client';
import React, { Fragment, useState, useEffect, useRef } from 'react';
import SideBarLayout from '@/components/SidebarLayout/SideBarLayout';
import cx from 'clsx';
import {
  Table,
  Checkbox,
  ScrollArea,
  Group,
  Popover,
  Text,
  useMantineTheme,
  rem,
  Card,
  TextInput,
  Box,
  Select,
  Button,
  Flex,
  Badge,
  Anchor,
  Title,
  Modal,
  Drawer,
  Center,
  Loader,
  Divider,
  Tooltip,
  Textarea,
  Paper,
  Pagination,
} from '@mantine/core';
import { Dropzone, MIME_TYPES } from '@mantine/dropzone';
import { RichTextEditor, Link } from '@mantine/tiptap';
import '@mantine/tiptap/styles.css';
import { useEditor } from '@tiptap/react';
import Highlight from '@tiptap/extension-highlight';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Superscript from '@tiptap/extension-superscript';
import SubScript from '@tiptap/extension-subscript';
import { useDisclosure } from '@mantine/hooks';
import classes from '../../components/mainTask/Task.module.css';
import { IconCloudUpload, IconDownload, IconPlus, IconTrash, IconX } from '@tabler/icons-react';
import fetcher from '@/utils/fetcher';
import useSWR, { Key } from 'swr';
import { axiosInstance, setAuthorizationToken } from '@/utils/axiosInstance';
import { Task, Users, TaskTemplate, NoteTemplatesResponse, NoteTemplate } from '@/utils/types';
import { notifications } from '@mantine/notifications';

export default function NoteTemplateList() {
  const theme = useMantineTheme();
  const [opened, { open, close }] = useDisclosure(false);
  const [selectedID, setSelectedID] = useState<string[]>([]);
  const [noteId, setNoteId] = useState<number | null>(null); // Use null for initial state
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [templateName, setTemplateName] = useState<string>('');
  const [filteredData, setFilteredData] = useState<NoteTemplate[]>();
  const [disableButton, setDisableButton] = useState(true);
  const [loading, setLoading] = useState(false);
  const [refetch, setRefetch] = useState(false);

  const [activePage, setActivePage] = useState(1);

  const openRef = useRef<() => void>(null);
  const isEditing = noteId !== null;

  const {
    data: noteTemplates,
    mutate,
    isLoading,
  } = useSWR<NoteTemplatesResponse>('/note/get/templates', fetcher);

  const toggleRow = (id: string) => {
    setDisableButton(!disableButton);
    setSelectedID((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  };

  const toggleAll = () => {
    setDisableButton(!disableButton);
    setSelectedID((current) => {
      return current?.length === noteTemplates?.data?.length
        ? []
        : noteTemplates?.data?.map(
            (template: NoteTemplate) => template?.note_template_id.toString()
          ) || [];
    });
  };

  const handleTaskId = (taskId: number) => {
    open();
    setNoteId(taskId);
  };

  const handleDrop = (files: File[]) => {
    setUploadedFiles([...uploadedFiles, ...files]);
  };

  const handleRemoveFile = (indexToRemove: number) => {
    const updatedFiles = uploadedFiles.filter((_, index) => index !== indexToRemove);
    setUploadedFiles(updatedFiles);
  };

  const deleteTask = () => {
    const selectedTaskIds = selectedID.map((id) => parseInt(id, 10));

    const updatedTasks = noteTemplates?.data?.filter(
      (template: NoteTemplate) => !selectedTaskIds.includes(template.note_template_id)
    );

    axiosInstance
      .delete(`/note/delete/template`, { data: { template_ids: selectedTaskIds } })
      .then((res) => {
        setFilteredData(updatedTasks);
        notifications.show({
          title: 'Deletion',
          color: 'red',
          message: 'Task deleted!',
        });
      })
      .catch((err) => {
        console.error('Error deleting templates:', err);
        notifications.show({
          title: 'Error',
          color: 'red',
          message: 'Error deleting task',
        });
      });
  };

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link,
      Superscript,
      SubScript,
      Highlight,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
  });

  const content = editor?.getHTML() || '';

  const addTemplate = async () => {
    setLoading(true);
    const formData = new FormData();

    uploadedFiles?.forEach((file, index) => {
      formData.append('files', file);
    });

    // Include noteId only if editing an existing template
    noteId && formData.append('template_id', noteId.toString());

    formData.append('template_name', templateName);
    formData.append('note', content);

    if (templateName) {
      axiosInstance
        .post('/note/add/template', formData, {
          withCredentials: true,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 20000,
        })
        .then((res) => {
          console.log(res);
          close();
          setRefetch(true);
          if (res) {
            setLoading(false);
          }
          notifications.show({
            title: 'Successful',
            color: 'teal',
            message: 'Task added successfully!',
          });
        })
        .catch((err) => {
          console.log(err);
          setLoading(false);
          notifications.show({
            title: 'Error',
            color: 'red',
            message: 'Error adding task',
          });
        });
    }
  };

  useEffect(() => {
    // Fetch data only if editing an existing template
    if (noteId !== null) {
      axiosInstance
        .get(`/note/get/template/${noteId}`)
        .then((res) => {
          setTemplateName(res.data[0].template_name);
          editor?.commands.setContent(res.data[0].note || '');
        })
        .catch((err) => {
          console.log(err);
        });
    }
    const pageSize = 10;
    if (activePage) {
      axiosInstance
        .get(`/note/get/templates?page=${activePage}&pageSize=${pageSize}`)
        .then((res) => {
          setFilteredData(res.data.data);
        })
        .catch((err: any) => {
          console.log(err);
        });
    }

    if (refetch) {
      axiosInstance
        .get(`/note/get/templates`)
        .then((res) => {
          setFilteredData(res.data.data);
        })
        .catch((err: any) => {
          console.log(err);
        });
    }
  }, [noteId, activePage, refetch]);

  const rows = (filteredData || noteTemplates?.data)?.map((template: NoteTemplate) => {
    const selected = selectedID.includes(template?.note_template_id?.toString());
    return (
      <Table.Tr
        key={template?.note_template_id}
        className={cx({ [classes.rowSelected]: selected })}
      >
        <Table.Td>
          <Checkbox
            checked={selectedID.includes(template?.note_template_id?.toString())}
            onChange={() => toggleRow(template?.note_template_id.toString())}
          />
        </Table.Td>
        <Table.Td>
          <Anchor
            onClick={() => handleTaskId(template?.note_template_id)}
            component="button"
            fz="sm"
          >
            {template.template_name}
          </Anchor>
        </Table.Td>

        <Table.Td dangerouslySetInnerHTML={{ __html: template?.note }} />
      </Table.Tr>
    );
  });

  return (
    <Box>
      <Card withBorder radius="md" bg="var(--mantine-color-body)" style={{ padding: 0, margin: 0 }}>
        <Flex justify="space-between">
          <Title p="md" className={classes.customGray} order={4}>
            Note Templates
          </Title>
          <Flex justify="space-between" gap="xs" p="md">
            <Fragment>
              <Button disabled={disableButton} onClick={deleteTask} color="red" size="compact-sm">
                <IconTrash size={15} />
              </Button>
              <Tooltip label="Add Template">
                <Button onClick={open} size="compact-sm">
                  <IconPlus size={15} />
                </Button>
              </Tooltip>
            </Fragment>
          </Flex>
        </Flex>
        <Divider />

        <Box p="sm">
          {isLoading ? (
            <Center>
              <Loader size="lg" mt={100} />
            </Center>
          ) : (
            <Fragment>
              {' '}
              {noteTemplates?.data?.length === 0 || noteTemplates === undefined ? (
                <Center mb={100} mt={100}>
                  <Title order={3} c="dimmed">
                    No Templates
                  </Title>
                </Center>
              ) : (
                <Box bg="var(--mantine-color-body)">
                  <ScrollArea>
                    <Table miw={800} verticalSpacing="sm">
                      <Table.Thead>
                        <Table.Tr>
                          <Table.Th style={{ width: rem(40) }}>
                            <Checkbox
                              onChange={toggleAll}
                              checked={selectedID?.length === noteTemplates?.data?.length}
                              indeterminate={
                                selectedID?.length > 0 &&
                                selectedID?.length !== noteTemplates?.data?.length
                              }
                            />
                          </Table.Th>
                          <Table.Th>Template Name</Table.Th>

                          <Table.Th>Note</Table.Th>
                        </Table.Tr>
                      </Table.Thead>
                      <Table.Tbody>{rows}</Table.Tbody>
                    </Table>
                  </ScrollArea>
                </Box>
              )}
            </Fragment>
          )}
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
        <Title order={5}>{isEditing ? 'Edit Template' : 'New Template'}</Title>
        <TextInput
          value={templateName}
          onChange={(event) => setTemplateName(event.currentTarget.value)}
          label="Name"
          placeholder="Template name"
        />

        <Text mt="md">Note</Text>
        <RichTextEditor editor={editor}>
          <RichTextEditor.Toolbar sticky stickyOffset={60}>
            <RichTextEditor.ControlsGroup>
              <RichTextEditor.Bold />
              <RichTextEditor.Italic />
              <RichTextEditor.Underline />
              <RichTextEditor.Strikethrough />
              <RichTextEditor.ClearFormatting />
              <RichTextEditor.Highlight />
              <RichTextEditor.Code />
            </RichTextEditor.ControlsGroup>

            <RichTextEditor.ControlsGroup>
              <RichTextEditor.H1 />
              <RichTextEditor.H2 />
              <RichTextEditor.H3 />
              <RichTextEditor.H4 />
            </RichTextEditor.ControlsGroup>

            <RichTextEditor.ControlsGroup>
              <RichTextEditor.Blockquote />
              <RichTextEditor.Hr />
              <RichTextEditor.BulletList />
              <RichTextEditor.OrderedList />
              <RichTextEditor.Subscript />
              <RichTextEditor.Superscript />
            </RichTextEditor.ControlsGroup>

            <RichTextEditor.ControlsGroup>
              <RichTextEditor.Link />
              <RichTextEditor.Unlink />
            </RichTextEditor.ControlsGroup>

            <RichTextEditor.ControlsGroup>
              <RichTextEditor.AlignLeft />
              <RichTextEditor.AlignCenter />
              <RichTextEditor.AlignJustify />
              <RichTextEditor.AlignRight />
            </RichTextEditor.ControlsGroup>

            <RichTextEditor.ControlsGroup>
              <RichTextEditor.Undo />
              <RichTextEditor.Redo />
            </RichTextEditor.ControlsGroup>
          </RichTextEditor.Toolbar>

          <RichTextEditor.Content />
        </RichTextEditor>

        {uploadedFiles.length > 0 && (
          <Box>
            <ul>
              {uploadedFiles.map((file, index) => (
                <Flex justify="space-between">
                  <li className={classes.customGray} key={index}>
                    {file.name}{' '}
                  </li>

                  <IconTrash
                    onClick={() => handleRemoveFile(index)}
                    color="red"
                    size={15}
                    style={{ marginLeft: 10, cursor: 'pointer' }}
                  />
                </Flex>
              ))}
            </ul>
          </Box>
        )}
        {/* dropzone */}
        <Paper className={classes.wrapper} mt="md" p="xs">
          <Dropzone
            openRef={openRef}
            onDrop={handleDrop}
            className={classes.dropzone}
            radius="md"
            accept={[MIME_TYPES.pdf]}
            maxSize={30 * 1024 ** 2}
          >
            <div style={{ pointerEvents: 'none' }}>
              <Group justify="center">
                <Dropzone.Accept>
                  <IconDownload
                    style={{ width: rem(50), height: rem(50) }}
                    color={theme.colors.blue[6]}
                    stroke={1.5}
                  />
                </Dropzone.Accept>
                <Dropzone.Reject>
                  <IconX
                    style={{ width: rem(50), height: rem(50) }}
                    color={theme.colors.red[6]}
                    stroke={1.5}
                  />
                </Dropzone.Reject>
              </Group>

              <Group justify="center" fw={500} className={classes.customGray} fz="lg" mt="sm">
                <Dropzone.Accept>Drop files here</Dropzone.Accept>
                <Dropzone.Reject>Pdf file less than 30mb</Dropzone.Reject>
                <Flex justify="flex-start" align="center">
                  <Dropzone.Idle>Drag and Drop Files</Dropzone.Idle>
                  <Dropzone.Idle>
                    <IconCloudUpload
                      className={classes.customGray}
                      style={{ width: rem(50), height: rem(30) }}
                      stroke={1.5}
                    />
                  </Dropzone.Idle>
                </Flex>
              </Group>
              <Text ta="center" fz="sm" mt="xs" c="dimmed">
                Drag&apos;n&apos;drop files here to upload. We can accept only <i>.pdf</i> files
                that are less than 10mb in size.
              </Text>
            </div>
          </Dropzone>
        </Paper>

        <Flex justify="flex-end" mt="md">
          <Button onClick={addTemplate} disabled={loading}>
            {loading ? <Loader size="lg" color="white" /> : 'Save'}
          </Button>
        </Flex>
      </Modal>
    </Box>
  );
}

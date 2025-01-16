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
import useSWR from 'swr';
import { axiosInstance, setAuthorizationToken } from '@/utils/axiosInstance';
import { Task, Users, TaskTemplate, GetTaskTemplatesResponse } from '@/utils/types';
import { notifications } from '@mantine/notifications';

export default function TaskTemplateList() {
  const theme = useMantineTheme();
  const [opened, { open, close }] = useDisclosure(false);
  const [selectedID, setSelectedID] = useState<string[]>([]);
  const [templateId, setTemplateId] = useState<number | null>(null); // Use null for initial state
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [templateName, setTemplateName] = useState<string>('');
  const [assignee, setAssignee] = useState<string | null>('');
  const [priority, setPriority] = useState<string | null>('');
  const [filteredData, setFilteredData] = useState<TaskTemplate[]>();
  const [disableButton, setDisableButton] = useState(true);
  const [loading, setLoading] = useState(false);
  const [refetch, setRefetch] = useState(false);

  const [activePage, setActivePage] = useState(1);

  const openRef = useRef<() => void>(null);
  const isEditing = templateId !== null;

  const {
    data: templates,
    mutate,
    isLoading,
  } = useSWR<GetTaskTemplatesResponse>('/task/get/templates', fetcher);
  const { data: users } = useSWR<Users[]>('/user/users/', fetcher);

  const toggleRow = (id: string) => {
    setDisableButton(!disableButton);
    setSelectedID((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  };

  const toggleAll = () => {
    setDisableButton(!disableButton);
    setSelectedID((current) => {
      return current?.length === templates?.data?.length
        ? []
        : templates?.data?.map((template: TaskTemplate) => template?.task_template_id.toString()) ||
            [];
    });
  };

  const handleTaskId = (taskId: number) => {
    open();
    setTemplateId(taskId);
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

    const updatedTasks = templates?.data?.filter(
      (template: TaskTemplate) => !selectedTaskIds.includes(template.task_template_id)
    );

    axiosInstance
      .delete(`/task/delete/template`, { data: { template_ids: selectedTaskIds } })
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
    console.log('assignee:', assignee);
    console.log('template name:', templateName);
    console.log('priority:', priority);
    setLoading(true);
    const formData = new FormData();

    uploadedFiles?.forEach((file, index) => {
      formData.append('files', file);
    });

    // Include templateId only if editing an existing template
    templateId && formData.append('template_id', templateId.toString());

    formData.append('template_name', templateName);
    formData.append('assignee', assignee ?? '');
    formData.append('template_task_priority', priority ?? '');
    formData.append('template_description', content);

    if (templateName) {
      axiosInstance
        .post('/task/add/template', formData, {
          withCredentials: true,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 20000,
        })
        .then((res) => {
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
          setRefetch(false);
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
    if (templateId !== null) {
      axiosInstance
        .get(`/task/get/template/${templateId}`)
        .then((res) => {
          setAssignee(res.data[0].assignee);
          setTemplateName(res.data[0].template_name);
          setPriority(res.data[0].template_task_priority);
          editor?.commands.setContent(res.data[0].template_description || '');
        })
        .catch((err) => {
          console.log(err);
        });
    }
    const pageSize = 10;
    if (activePage) {
      axiosInstance
        .get(`/task/get/templates?page=${activePage}&pageSize=${pageSize}`)
        .then((res) => {
          setFilteredData(res.data.data);
        })
        .catch((err: any) => {
          console.log(err);
        });
    }
    if (refetch) {
      axiosInstance
        .get(`/task/get/templates`)
        .then((res) => {
          setFilteredData(res.data.data);
        })
        .catch((err: any) => {
          console.log(err);
        });
    }
  }, [templateId, activePage, refetch]);

  const rows = (filteredData || templates?.data)?.map((template: TaskTemplate) => {
    const selected = selectedID.includes(template?.task_template_id.toString());
    return (
      <Table.Tr
        key={template?.task_template_id}
        className={cx({ [classes.rowSelected]: selected })}
      >
        <Table.Td>
          <Checkbox
            checked={selectedID.includes(template?.task_template_id.toString())}
            onChange={() => toggleRow(template?.task_template_id.toString())}
          />
        </Table.Td>
        <Table.Td>
          <Anchor
            onClick={() => handleTaskId(template?.task_template_id)}
            component="button"
            fz="sm"
          >
            {template.template_name}
          </Anchor>
        </Table.Td>
        <Table.Td>
          <Text
            color={
              template.template_task_priority === 'high'
                ? 'orange'
                : template.template_task_priority === 'critical'
                  ? 'red'
                  : template.template_task_priority === 'medium'
                    ? 'teal'
                    : 'grey'
            }
          >
            {template.template_task_priority}
          </Text>
        </Table.Td>
        <Table.Td dangerouslySetInnerHTML={{ __html: template?.template_description }} />
        <Table.Td>{`${template?.assignee?.first_name} ${template?.assignee?.last_name}`}</Table.Td>
      </Table.Tr>
    );
  });

  return (
    <Box>
      <Card withBorder radius="md" bg="var(--mantine-color-body)" style={{ padding: 0, margin: 0 }}>
        <Flex justify="space-between">
          <Title p="md" className={classes.customGray} order={4}>
            Task Templates
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
            <Center mb={100} mt={100}>
              <Loader size="lg" />
            </Center>
          ) : (
            <Fragment>
              {' '}
              {templates?.data?.length === 0 || templates === undefined ? (
                <Center>
                  <Title order={3} mt={50} mb={50} c="dimmed">
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
                              checked={selectedID?.length === templates?.data?.length}
                              indeterminate={
                                selectedID?.length > 0 &&
                                selectedID?.length !== templates?.data?.length
                              }
                            />
                          </Table.Th>
                          <Table.Th>Template Name</Table.Th>
                          <Table.Th>Priority</Table.Th>
                          <Table.Th>Description</Table.Th>
                          <Table.Th>Assignee</Table.Th>
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
          total={templates?.pagination?.totalPages ?? 0}
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
        <Select
          value={assignee?.toString()}
          onChange={setAssignee}
          label="Assignee"
          placeholder="Assign broker to task"
          data={users?.map((user) => ({
            value: String(user.user_id),
            label: `${user?.first_name} ${user.last_name} (${user.email})`,
          }))}
        />

        <Select
          value={priority}
          onChange={setPriority}
          label="Priority"
          placeholder="Pick value"
          data={[
            { value: 'low', label: 'Low' },
            { value: 'medium', label: 'Medium' },
            { value: 'high', label: 'High' },
            { value: 'critical', label: 'Critical' },
          ]}
        />
        <RichTextEditor editor={editor} mt="md">
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

import React, { useRef, useState, useEffect, Fragment } from 'react';
import {
  Text,
  Paper,
  Box,
  TextInput,
  Group,
  Button,
  rem,
  Flex,
  MultiSelect,
  Select,
  useMantineTheme,
} from '@mantine/core';
import { IconCloudUpload, IconX, IconDownload, IconTrash } from '@tabler/icons-react';
import { Dropzone, MIME_TYPES } from '@mantine/dropzone';
import classes from './Task.module.css';
import '@mantine/tiptap/styles.css';
import { RichTextEditor, Link } from '@mantine/tiptap';
import { useEditor } from '@tiptap/react';
import Highlight from '@tiptap/extension-highlight';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Superscript from '@tiptap/extension-superscript';
import SubScript from '@tiptap/extension-subscript';
import useSWR from 'swr';
import { axiosInstance } from '@/utils/axiosInstance';
import fetcher from '@/utils/fetcher';
import 'react-datepicker/dist/react-datepicker.css';
import { notifications } from '@mantine/notifications';
import moment from 'moment';
import { useParams } from 'next/navigation';
import { useAppContext } from '@/ContextAPI/ContextAPI';

export default function SingleTask({ task, close }) {
  const theme = useMantineTheme();
  const [token, setToken] = useState('');

  const { task_id } = useParams();

  const { dispatch } = useAppContext();

  useEffect(() => {
    const access_token =
      typeof localStorage !== 'undefined' ? localStorage.getItem('broker_access_token') : null;

    setToken(access_token);
  }, []);

  const {
    data: tasks,
    mutate,
    isLoading,
  } = useSWR([`/task/get/${task_id}`, token], ([url, token]) => fetcher(url, token));

  const { data: users } = useSWR(['/user/users/', token], ([url, token]) => fetcher(url, token));

  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [taskName, setTaskName] = useState(task?.task_name || '');
  const [assignee, setAssignee] = useState({
    assignee_id: task?.assignee?.assignee_id || '',
    assignee_first_name: task?.assignee?.assignee_first_name || '',
    assignee_last_name: task?.assignee?.assignee_last_name || '',
    assignee_email: task?.assignee?.assignee_email || '',
  });
  const [priority, setPriority] = useState(task?.task_priority || '');
  const [dueDate, setDueDate] = useState(new Date(task?.due_date) || '');
  const [notifyUsers, setNotifyUsers] = useState([]);

  const openRef = useRef(null);

  const content = task?.task_description;

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
    content,
  });

  const handleDrop = (files) => {
    setUploadedFiles([...uploadedFiles, ...files]);
  };

  const handleRemoveFile = (indexToRemove) => {
    const updatedFiles = uploadedFiles.filter((_, index) => index !== indexToRemove);
    setUploadedFiles(updatedFiles);
  };

  const formatDueDate = (date) => {
    if (!(date instanceof Date) || isNaN(date)) {
      return '';
    }

    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');

    return `${year}-${month}-${day}`;
  };

  const dateString = dueDate ? moment(dueDate).format('YYYY-MM-DD') : null;

  const newAssignee = users?.find((user) => user.user_id === assignee?.assignee_id);

  const editedData = {
    task_name: taskName,
    assignee: assignee.assignee_id,
    task_priority: priority,
    due_date: dateString,
    task_description: content,
    user_to_notify: notifyUsers,
  };

  const prevData = {
    task_id: task.task_id,
    task_id: task.task_id,
    task_name: taskName,
    task_description: content,
    due_date: dateString,
    is_complete: task.is_complete,
    completed_by: task.completed_by,
    date_completed: task.date_completed,
    assignee: {
      assignee_id: newAssignee?.assignee_id,
      assignee_first_name: newAssignee?.assignee_first_name,
      assignee_last_name: newAssignee?.assignee_last_name,
      assignee_email: newAssignee?.assignee_email,
    },
    timestamp: task.timestamp,
  };

  const editTask = () => {
    mutate((data) => {
      const updatedTasks = data.map((t) => (t.task_id === task.task_id ? prevData : t));
      return updatedTasks;
    }, false);
    axiosInstance
      .put(`/task/update/${task.task_id}`, editedData, {
        headers: {
          Authorization: `Bearer ${
            typeof localStorage !== 'undefined'
              ? localStorage.getItem('broker_access_token') || localStorage.getItem('access_token')
              : null
          }`,
        },
      })
      .then((res) => {
        close();
        dispatch({ type: 'SET_REFETCH_TASKS', payload: true });
        notifications.show({
          title: 'Task edited',
          color: 'teal',
          message: 'Task edited successfully!',
        });
      })
      .catch((err) => {
        console.error('Error completing task:', err);
        notifications.show({
          title: 'Error',
          color: 'red',
          message: 'Error updating task!',
        });
      });
  };
  return (
    <Fragment>
      {task && (
        <Box>
          <TextInput
            value={taskName}
            onChange={(event) => setTaskName(event.currentTarget.value)}
            label="Name"
            placeholder="Task name"
          />
          <Select
            value={assignee?.assignee_id.toString()}
            onChange={(value) => setAssignee({ ...assignee, assignee_id: parseInt(value) })}
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
          <TextInput
            value={dueDate ? formatDueDate(dueDate) : ''}
            onChange={(event) => setDueDate(event.currentTarget.valueAsDate)}
            label="Date Due"
            className={classes.customGray}
            type="date"
            style={{ width: '100%', marginTop: 10 }}
          />

          {/* editot */}
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
          <Box>
            <MultiSelect
              mt="md"
              placeholder="Recipient"
              value={notifyUsers}
              onChange={setNotifyUsers}
              label="Notify User"
              data={[{ value: '1', label: 'Ayuen madyt' }]}
              description="select recipient to notify"
              clearable
              hidePickedOptions
            />
          </Box>
          <Flex justify="flex-end">
            <Button onClick={editTask} mt="md">
              Save
            </Button>
          </Flex>
        </Box>
      )}
    </Fragment>
  );
}

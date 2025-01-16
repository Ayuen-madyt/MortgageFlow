import React, { useRef, useState, useEffect } from 'react';
import {
  Text,
  Input,
  Paper,
  Box,
  NativeSelect,
  TextInput,
  Group,
  Button,
  rem,
  Flex,
  MultiSelect,
  Select,
  useMantineTheme,
  Collapse,
  Loader,
} from '@mantine/core';
import {
  IconChevronRight,
  IconPlus,
  IconCloudUpload,
  IconX,
  IconDownload,
  IconTrash,
} from '@tabler/icons-react';
import { Dropzone, MIME_TYPES } from '@mantine/dropzone';
import classes from '../../components/mainTask/Task.module.css';
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
import { axiosInstance, setAuthorizationToken } from '@/utils/axiosInstance';
import fetcher from '@/utils/fetcher';
import 'react-datepicker/dist/react-datepicker.css';
import { useDisclosure } from '@mantine/hooks';
import { jwtDecode } from 'jwt-decode';
import { notifications } from '@mantine/notifications';
import { Users, GetTaskTemplatesResponse } from '@/utils/types';

export default function AddTask({ mutate, closeModalTask }: any) {
  const theme = useMantineTheme();
  const [loading, setLoading] = useState<Boolean | null>(null);
  const [user, setUser] = useState<Record<string, any> | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [taskName, setTaskName] = useState<string>('');
  const [assignee, setAssignee] = useState<string | null>('');
  const [priority, setPriority] = useState<string | null>('');
  const [dueDate, setDueDate] = useState<Date | null>();
  const [notifyUsers, setNotifyUsers] = useState<string[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<String | null>('');
  const [token, setToken] = useState<string | null>('');

  const openRef = useRef<() => void>(null);

  useEffect(() => {
    const access_token: string | null =
      typeof localStorage !== 'undefined' ? localStorage.getItem('broker_access_token') : null;

    setToken(access_token);
    setAuthorizationToken(access_token);
  }, []);

  const { data: users } = useSWR<Users[]>(['/user/users/', token], ([url, token]) =>
    fetcher(url, token as string)
  );
  const { data: templates } = useSWR<GetTaskTemplatesResponse>(
    ['/task/get/templates', token],
    ([url, token]) => fetcher(url, token as string)
  );

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

  const handleDrop = (files: File[]) => {
    setUploadedFiles([...uploadedFiles, ...files]);
  };

  const handleRemoveFile = (indexToRemove: number) => {
    const updatedFiles = uploadedFiles.filter((_, index) => index !== indexToRemove);
    setUploadedFiles(updatedFiles);
  };

  const content = editor?.getHTML() || '';

  const addTask = async () => {
    setAuthorizationToken(token);
    setLoading(true);
    const formData = new FormData();

    uploadedFiles?.forEach((file, index) => {
      formData.append('files', file);
    });
    formData.append('task_name', taskName);
    formData.append('assignee', assignee ?? '');
    formData.append('task_priority', priority ?? '');
    formData.append('task_description', content);
    formData.append('due_date', dueDate?.toISOString() ?? '');
    formData.append('user_to_notify', notifyUsers.join(','));
    formData.append('main_task_id', '');
    formData.append('is_complete', '');
    formData.append('completed_by', '');
    formData.append('date_completed', '');
    formData.append('applicant_id', '');
    formData.append('lender_id', '');

    axiosInstance
      .post('/task/add', formData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 20000,
      })
      .then((res) => {
        console.log(res);
        mutate();
        closeModalTask();
        if (res) {
          setLoading(false);
        }

        notifications.show({
          title: 'Successfull',
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
  };

  useEffect(() => {
    const token =
      typeof localStorage !== 'undefined'
        ? localStorage.getItem('broker_access_token') || localStorage.getItem('access_token')
        : null;
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
    if (selectedTemplate) {
      axiosInstance
        .get(`/task/get/template/${selectedTemplate}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((res) => {
          console.log('template:', res.data);
          setTaskName(res.data[0].template_name);
          setAssignee(res.data[0].assignee.toString());
          setPriority(res.data[0].template_task_priority);
          editor?.commands.setContent(res.data[0].template_description);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, [selectedTemplate]);

  return (
    <Box>
      <Flex style={{ cursor: 'pointer' }} mt="lg" justify="space-between">
        <Box className={classes.titles}>
          <Text
            style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}
            className={classes.customGray}
            fz="sm"
            tt="uppercase"
            fw={700}
            pr="xs"
          >
            Create a Task
            <IconPlus
              style={{
                width: rem(20),
                height: rem(20),
                marginLeft: '5px',
              }}
              stroke={1.5}
            />
          </Text>
        </Box>
      </Flex>
      <Box>
        <Select
          mt="md"
          placeholder="Choose a template"
          label="Use template"
          description="Choose a task template to populate the fields"
          data={templates?.data?.map((template) => ({
            value: String(template?.task_template_id),
            label: template.template_name,
          }))}
          onChange={setSelectedTemplate}
          clearable
        />

        <TextInput
          value={taskName}
          onChange={(event) => setTaskName(event.currentTarget.value)}
          label="Name"
          placeholder="Task name"
        />
        <Select
          value={assignee}
          onChange={setAssignee}
          label="Assignee"
          placeholder="Assign broker to task"
          searchable
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
          value={dueDate ? dueDate.toISOString().split('T')[0] : ''}
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
            data={users?.map((user) => ({
              value: String(user.user_id),
              label: user.email,
            }))}
            description="select recipient to notify"
            clearable
            hidePickedOptions
          />
        </Box>
        <Flex justify="flex-end">
          <Button onClick={addTask} mt="md">
            {loading ? <Loader size="sm" color="white" /> : 'Create Task'}
          </Button>
        </Flex>
      </Box>
    </Box>
  );
}

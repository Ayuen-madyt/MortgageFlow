import React, { useState, useEffect } from 'react';
import { Input, Paper, Box, TextInput, Button, Flex, Loader, Select } from '@mantine/core';
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

export default function TaskDetail({ task_id, mutate }) {
  const [token, setToken] = useState('');
  const [users, setUsers] = useState([]);
  const [taskName, setTaskName] = useState('');
  const [assignee, setAssignee] = useState('');
  const [priority, setPriority] = useState('');
  const [dueDate, setDueDate] = useState('');

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const access_token =
      typeof localStorage !== 'undefined' ? localStorage.getItem('broker_access_token') : null;

    setToken(access_token);
  }, []);

  const { data: task } = useSWR([`/task/get/single-task/${task_id}`, token], ([url, token]) =>
    fetcher(url, token)
  );

  const { data: allUsers } = useSWR(['/user/users/', token], ([url, token]) => fetcher(url, token));

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

  const formatDueDate = (date) => {
    if (!(date instanceof Date) || isNaN(date)) {
      return '';
    }

    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');

    return `${year}-${month}-${day}`;
  };

  const saveTask = () => {
    setLoading(true);
    const dateString = dueDate ? moment(dueDate).format('YYYY-MM-DD') : null;
    const editedData = {
      task_name: taskName,
      assignee: assignee,
      task_priority: priority,
      task_description: editor.getHTML(),
      due_date: dateString,
    };

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
        setLoading(false);
        mutate();
        notifications.show({
          title: 'Task updated',
          color: 'teal',
          message: 'Task updated successfully!',
        });
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
        notifications.show({
          title: 'Error',
          color: 'red',
          message: 'Error updating task!',
        });
      });
  };

  useEffect(() => {
    if (task) {
      setTaskName(task.task_name || '');
      setAssignee(task?.assignee?.assignee_id);
      setPriority(task?.task_priority || '');
      setDueDate(new Date(task?.due_date));
      editor?.commands.setContent(task?.task_description);
    }
    if (allUsers) {
      setUsers(allUsers);
    }
  }, [task, allUsers]);

  return (
    <Paper>
      <Box>
        <TextInput
          label="Name"
          value={taskName}
          onChange={(event) => setTaskName(event.target.value)}
          placeholder="Task name"
        />

        <TextInput label="Broker" value={task?.broker} placeholder="Broker name" />

        <Select
          value={assignee?.toString()}
          onChange={setAssignee}
          label="Assignee"
          placeholder="Assign broker to task"
          data={users?.map((user) => ({
            value: user.user_id.toString(),
            label: `${user?.first_name} ${user.last_name} (${user.email})`,
          }))}
        />

        <TextInput label="Client" value={task?.applicant} placeholder="Client name" />
        <TextInput label="Lender" value={task?.lender} placeholder="lender name" />
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
          styles={{
            input: {
              color: `${
                task?.task_priority === 'high'
                  ? 'orange'
                  : task?.task_priority === 'critical'
                    ? 'red'
                    : task?.task_priority === 'medium'
                      ? 'blue'
                      : 'grey'
              }`,
            },
          }}
        />

        <TextInput
          id="due_date"
          type="date"
          label="Due Date"
          value={dueDate ? formatDueDate(dueDate) : ''}
          onChange={(event) => setDueDate(event.currentTarget.valueAsDate)}
          styles={{
            input: {
              color: `${new Date(task?.due_date) < new Date() ? 'red' : 'teal'}`,
            },
          }}
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
      </Box>

      <Flex justify="flex-end" mt="md">
        <Button onClick={saveTask}>{loading ? <Loader size="sm" color="white" /> : 'Save'}</Button>
      </Flex>
    </Paper>
  );
}

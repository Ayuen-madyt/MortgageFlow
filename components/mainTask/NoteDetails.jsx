import React, { useState, useEffect, Fragment } from 'react';
import { Text, Box, Paper, Flex, Button, Title, Table, Divider } from '@mantine/core';

import '@mantine/tiptap/styles.css';
import { RichTextEditor } from '@mantine/tiptap';
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
import { useAppContext } from '@/ContextAPI/ContextAPI';

export default function TaskDetail({ note_id, closeModal }) {
  const [token, setToken] = useState('');
  const [showEditors, setShowEditors] = useState(false);

  const { dispatch } = useAppContext();

  useEffect(() => {
    const access_token =
      typeof window !== 'undefined' ? localStorage.getItem('broker_access_token') : null;
    setToken(access_token);
  }, []);

  const { data } = useSWR([`/note/get/${note_id}`, token], ([url, token]) => fetcher(url, token));
  const { data: noteEditors } = useSWR([`/note/get/editors/${note_id}`, token], ([url, token]) =>
    fetcher(url, token)
  );

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Highlight,
      Superscript,
      SubScript,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
  });
  const content = editor?.getHTML() || '';

  // save note
  const saveNote = () => {
    axiosInstance
      .put(`/note/edit/${note_id}`, { note: content })
      .then((res) => {
        closeModal();
        dispatch({ type: 'SET_REFETCH_ACTIVITY_FEED', payload: true });
        notifications.show({
          title: 'Successfull',
          color: 'teal',
          message: 'Note updated',
        });
      })
      .catch((err) => {
        console.log(err);
        notifications.show({
          title: 'Error',
          color: 'red',
          message: 'Error updating note',
        });
      });
  };

  useEffect(() => {
    if (data && editor) {
      editor
        .chain()
        .setContent(data?.note || '')
        .focus()
        .run();
    }
  }, [data, editor]);

  const rows = noteEditors?.map((note_editor) => (
    <Table.Tr key={note_editor.note_editor_id}>
      <Table.Td>{note_editor.user_name}</Table.Td>
      <Table.Td>{new Date(note_editor.timestamp).toDateString()}</Table.Td>
      <Table.Td>{note_editor.symbol}</Table.Td>
      <Table.Td>{note_editor.mass}</Table.Td>
    </Table.Tr>
  ));

  return (
    <Box>
      <Paper>
        {data && (
          <Box>
            <Flex justify="flex-start" align="center" gap="md">
              <Title order={6}>{`Note by ${
                data?.first_name ? `${data.first_name} ${data.last_name}` : data?.email
              } `}</Title>
              <Text>{`Created on ${new Date(data?.timestamp).toDateString()}`}</Text>
            </Flex>

            {data?.editor_user_name && (
              <Flex mt="sm" justify="flex-start" align="center" gap="md">
                <Text c="dimmed" size="sm">{`Last edited by ${data?.editor_user_name} on ${new Date(
                  data?.editor_timestamp
                ).toLocaleString()}  `}</Text>

                <Button size="compact-xs" color="grey" onClick={() => setShowEditors(!showEditors)}>
                  {showEditors ? '< Back' : 'View editors'}
                </Button>
              </Flex>
            )}
          </Box>
        )}
        {/* editot */}
        {!showEditors && (
          <Fragment>
            <RichTextEditor editor={editor} mt="md">
              <RichTextEditor.Toolbar sticky stickyOffset={0}>
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
            <Flex justify="flex-end" mt="md">
              <Button onClick={saveNote}>Save</Button>
            </Flex>
          </Fragment>
        )}
      </Paper>

      {showEditors && (
        <Paper>
          <Title mt="lg" order={5}>
            Note Editors
          </Title>
          <Divider my="sm" />
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Full Name</Table.Th>
                <Table.Th>Time Edited</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>{rows}</Table.Tbody>
          </Table>
        </Paper>
      )}
    </Box>
  );
}

import React, { useRef, useState, useEffect } from 'react';
import {
  Text,
  Paper,
  Box,
  Collapse,
  Group,
  Button,
  rem,
  Flex,
  MultiSelect,
  Select,
  useMantineTheme,
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
import { axiosInstance, setAuthorizationToken } from '@/utils/axiosInstance';
import fetcher from '@/utils/fetcher';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { Users, NoteTemplatesResponse } from '@/utils/types';
import { useAppContext } from '@/ContextAPI/ContextAPI';
import { useParams } from 'next/navigation';

export default function Note() {
  const theme = useMantineTheme();
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [opened, { toggle }] = useDisclosure(false);
  const openRef = useRef<() => void>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<String | null>('');
  const [token, setToken] = useState<string | null>('');

  const { task_id } = useParams();

  const { dispatch } = useAppContext();

  useEffect(() => {
    const access_token: string | null =
      typeof localStorage !== 'undefined'
        ? localStorage.getItem('broker_access_token') || localStorage.getItem('access_token')
        : null;

    setToken(access_token);
    setAuthorizationToken(access_token);
  }, []);

  const { data: users } = useSWR<Users[]>(['/user/users/', token], ([url, token]) =>
    fetcher(url, token as string)
  );
  const { data: noteTemplates } = useSWR<NoteTemplatesResponse>(
    ['/note/get/templates', token],
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

  const addNote = async () => {
    const formData = new FormData();

    uploadedFiles?.forEach((file, index) => {
      formData.append('files', file);
    });
    formData.append('note', content);
    formData.append('note_text', editor?.getText() || '');
    formData.append('main_task_id', task_id.toString());

    axiosInstance
      .post('/note/add', formData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      .then((res) => {
        console.log(res);
        dispatch({ type: 'SET_REFETCH_ACTIVITY_FEED', payload: true });
        toggle();
        notifications.show({
          title: 'Successfull',
          color: 'teal',
          message: 'Note added successfully!',
        });
      })
      .catch((err) => {
        console.log(err);
        notifications.show({
          title: 'Error',
          color: 'red',
          message: 'Error adding note',
        });
      });
  };

  useEffect(() => {
    if (selectedTemplate) {
      axiosInstance
        .get(`/note/get/template/${selectedTemplate}`)
        .then((res) => {
          editor?.commands.setContent(res.data[0].note);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, [selectedTemplate]);

  return (
    <Box>
      <Flex style={{ cursor: 'pointer' }} mt="lg" justify="space-between" onClick={toggle}>
        <Box className={classes.titles}>
          <Text
            style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}
            className={classes.customGray}
            fz="sm"
            tt="uppercase"
            fw={700}
            pr="xs"
          >
            Add Note
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
        <IconChevronRight
          stroke={1.5}
          style={{
            width: rem(16),
            height: rem(16),
            transform: opened ? 'rotate(-90deg)' : 'none',
          }}
        />
      </Flex>
      <Collapse in={opened}>
        <Select
          mt="md"
          placeholder="Choose a template"
          label="Note template"
          description="Choose a note template to populate the fields"
          data={noteTemplates?.data?.map((template) => ({
            value: String(template?.note_template_id),
            label: template.template_name,
          }))}
          onChange={setSelectedTemplate}
          clearable
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
                Drag&apos;n&apos;drop files here to upload. Only files that are less than 10mb in
                size.
              </Text>
            </div>
          </Dropzone>
        </Paper>
        <Box>
          <MultiSelect
            mt="md"
            placeholder="Recipient"
            label="Notify"
            data={users?.map((user) => ({
              value: user.email,
              label: user.email,
            }))}
            description="select recipient to notify"
            clearable
            hidePickedOptions
          />
        </Box>
        <Flex justify="flex-end">
          <Button size="compact-sm" onClick={addNote} mt="md">
            Add Note
          </Button>
        </Flex>
      </Collapse>
    </Box>
  );
}

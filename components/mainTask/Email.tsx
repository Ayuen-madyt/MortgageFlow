import React, { useRef, useState } from 'react';
import {
  Text,
  Paper,
  Box,
  TextInput,
  Group,
  Button,
  rem,
  Flex,
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
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { isNotEmpty, useForm } from '@mantine/form';
import { Users } from '@/utils/types';
import CreatableSelect from 'react-select/creatable';
import { useAppContext } from '@/ContextAPI/ContextAPI';
import { useParams } from 'next/navigation';

export default function Email() {
  const theme = useMantineTheme();
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [opened, { toggle }] = useDisclosure(false);
  const [emailTo, setEmailTo] = useState('');
  const [emailCC, setEmailCC] = useState('');
  const [emailBCC, setEmailBCC] = useState('');
  const [emailToError, setEmailToError] = useState('');

  const [loading, setLoading] = useState(false);
  const openRef = useRef<() => void>(null);
  const { task_id } = useParams();

  const { dispatch } = useAppContext();

  const { data: users } = useSWR<Users[]>('/user/users/', fetcher);

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

  const form = useForm({
    initialValues: { email_subject: '' },

    validate: {
      email_subject: isNotEmpty(),
    },
  });
  const formValues = form.getTransformedValues();

  const addEmail = async () => {
    setLoading(true);
    form.validate();
    const formData = new FormData();

    formData.append('email_to', emailTo);
    formData.append('email_cc', emailCC);
    formData.append('email_bcc', emailBCC);
    formData.append('email_body', content);
    formData.append('main_task_id', task_id.toString());
    Object.entries(formValues).forEach(([key, value]) => {
      formData.append(key, value);
    });

    uploadedFiles?.forEach((file, index) => {
      formData.append('files', file);
    });

    if (emailTo === '') {
      setEmailToError('Email to must be empty');
      setLoading(false);
    }
    if (form.isValid() && emailTo != '') {
      axiosInstance
        .post('/email/add/email', formData, {
          withCredentials: true,

          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${
              typeof localStorage !== 'undefined'
                ? localStorage.getItem('broker_access_token') ||
                  localStorage.getItem('access_token')
                : null
            }`,
          },

          timeout: 20000,
        })
        .then((res) => {
          toggle();
          setLoading(false);
          dispatch({ type: 'SET_REFETCH_ACTIVITY_FEED', payload: true });
          notifications.show({
            title: 'Successfull',
            color: 'teal',
            message: 'Email sent successfully!',
          });
        })
        .catch((err) => {
          setLoading(false);
          console.log(err);
          notifications.show({
            title: 'Error',
            color: 'red',
            message: err.message || 'error sending email',
          });
        });
    }
  };

  const options = users?.map((user) => ({
    value: user.email,
    label: user.email,
  }));
  const handleEmailTo = (selectedOption: any) => {
    setEmailTo(selectedOption?.value);
  };
  const handleEmailCC = (selectedOption: any) => {
    setEmailCC(selectedOption?.value);
  };
  const handleEmailBCC = (selectedOption: any) => {
    setEmailBCC(selectedOption?.value);
  };

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
            Send An Email
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
          label="Use template"
          data={['React', 'Angular', 'Vue', 'Svelte']}
          description="Choose a email template to populate the fields"
          disabled={true}
          clearable
        />

        <Box mt="md">
          <Text fw={500} size="sm">
            TO:
          </Text>
          <CreatableSelect
            onChange={handleEmailTo}
            placeholder="select or type email"
            isClearable
            options={options}
          />
          {emailToError && (
            <Text size="sm" c="red">
              {emailToError}
            </Text>
          )}
        </Box>
        <Box mt="md">
          <Text fw={500} size="sm">
            CC:
          </Text>
          <CreatableSelect
            onChange={handleEmailCC}
            placeholder="select or type email"
            isClearable
            options={options}
          />
        </Box>
        <Box mt="md">
          <Text fw={500} size="sm">
            BCC:
          </Text>
          <CreatableSelect
            onChange={handleEmailBCC}
            placeholder="select or type email"
            isClearable
            options={options}
          />
        </Box>
        <TextInput label="Subject" placeholder="subject" {...form.getInputProps('email_subject')} />
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
            accept={[
              MIME_TYPES.png,
              MIME_TYPES.jpeg,
              MIME_TYPES.svg,
              MIME_TYPES.gif,
              MIME_TYPES.pdf,
              MIME_TYPES.webp,
              MIME_TYPES.csv,
              MIME_TYPES.doc,
              MIME_TYPES.docx,
              MIME_TYPES.ppt,
              MIME_TYPES.pptx,
              MIME_TYPES.xls,
              MIME_TYPES.xlsx,
              MIME_TYPES.mp4,
            ]}
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
        <Flex justify="flex-end">
          <Button onClick={addEmail} size="compact-sm">
            {loading ? <Loader size="sm" color="white" /> : 'Sent Email'}
          </Button>
        </Flex>
      </Collapse>
    </Box>
  );
}

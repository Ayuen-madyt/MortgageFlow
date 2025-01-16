'use client';

import React, { useState, useEffect } from 'react';
import SideBarLayout from '@/components/SidebarLayout/SideBarLayout';
import useSWR from 'swr';
import {
  Box,
  Flex,
  Modal,
  TextInput,
  Select,
  Title,
  Paper,
  MultiSelect,
  Button,
  Text,
  Textarea,
  Loader,
  Center,
  Tooltip,
  rem,
} from '@mantine/core';
import fetcher from '@/utils/fetcher';
import { useParams } from 'next/navigation';
import { axiosInstance, setAuthorizationToken } from '@/utils/axiosInstance';
import { DragDropContext, Droppable, DropResult } from 'react-beautiful-dnd';
import Column from '@/components/Board/Column';
import { Board, Stage, Users, Contact, Pagination, Lender } from '@/utils/types';
import Fab from '@mui/material/Fab';
import { useForm, isNotEmpty } from '@mantine/form';
import { IconPlus, IconTrash, IconAt } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { jwtDecode, JwtPayload } from 'jwt-decode';
import { notifications } from '@mantine/notifications';
import classes from '../../../../components/mainTask/Task.module.css';
import PhoneInput from 'react-phone-number-input';
import { BrokerCard } from '@/components/mainTask/BrokerCard';

interface CustomJwtPayload extends JwtPayload {
  id: number;
}

interface ContactsResponse {
  contacts: Contact[];
  pagination: Pagination;
}
interface LendersResponse {
  lenders: Lender[];
  pagination: Pagination;
}

interface Applicant {
  contact_id: number;
  role: string;
}

export default function page() {
  const [opened, { open, close }] = useDisclosure(false);
  const [board, setBoard] = useState<Board | null>(null);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [broker, setBroker] = useState<string | null>('');
  const [loading, setLoading] = useState<Boolean>(false);
  const [newLoan, setNewLoan] = useState<Boolean>(true);
  const [addApplicant, setAddApplicant] = useState<Boolean>(false);
  const params = useParams<{ board_id: string }>();
  const [token, setToken] = useState<string | null>('');

  useEffect(() => {
    const access_token: string | null =
      typeof localStorage !== 'undefined'
        ? localStorage.getItem('broker_access_token') || localStorage.getItem('access_token')
        : null;

    setToken(access_token);
  }, []);

  const { data, mutate, error, isLoading } = useSWR<Stage[]>(
    [`/board/stages/${params.board_id}`, token],
    ([url, token]) => fetcher(url, token as string)
  );

  const { data: contacts, mutate: mutateContacts } = useSWR<ContactsResponse>(
    ['/contact', token],
    ([url, token]) => fetcher(url, token as string)
  );
  const { data: users } = useSWR<Users[]>(['/user/users/', token], ([url, token]) =>
    fetcher(url, token as string)
  );
  const { data: lenders, mutate: mutateLenders } = useSWR<LendersResponse>(
    ['/lender/all', token],
    ([url, token]) => fetcher(url, token as string)
  );

  let currentUser: CustomJwtPayload | null = null;
  if (token) {
    const decodedToken = jwtDecode(token);
    if (decodedToken) {
      currentUser = decodedToken as CustomJwtPayload;
    }
  }

  const handleOnDragEnd = (result: DropResult) => {
    const { destination, source, type } = result;
    if (!destination) return;

    const startColData = data?.find((data) => data.stage_id === parseInt(source.droppableId));
    const finishColData = data?.find((data) => data.stage_id === parseInt(destination.droppableId));
    console.log('start col data:', startColData);
    console.log('finish col data:', finishColData);

    if (!startColData || !finishColData) return;
    if (source.index === destination.index && startColData === finishColData) return;

    const newTasks = startColData?.main_tasks;
    const [taskMoved] = newTasks.splice(source.index, 1);

    if (startColData.stage_id === finishColData.stage_id) {
      // same column task drag
      newTasks.splice(destination.index, 0, taskMoved);
      console.log('new Tasks:', newTasks);
    } else {
      // dragging to a different column
      const nextStageId = finishColData.stage_id;
      const nextColTasks = finishColData?.main_tasks;
      nextColTasks.splice(destination.index, 0, taskMoved);
      console.log('next stage id:', nextStageId);

      // updating stage in main_task
      axiosInstance
        .put(
          `/main/task/move/${taskMoved.main_task_id}`,
          {
            board_id: taskMoved.board_id,
            stage_id: nextStageId,
            stage_moved_from: startColData.stage_title,
            stage_moved_to: finishColData.stage_title,
            board_moved_from: startColData.board_title,
            board_moved_to: finishColData.board_title,
          },
          { withCredentials: true }
        )
        .then((res) => {
          console.log(res.data);
        })
        .catch((error) => {
          console.error(error);
        });

      mutate((cachedData) => {
        if (!cachedData) return cachedData;

        const updatedData = [...cachedData];
        const stageToUpdate = updatedData[taskMoved.stage_id];

        if (stageToUpdate && stageToUpdate.main_tasks) {
          const updatedMainTasks = [...stageToUpdate.main_tasks];
          const mainTaskToUpdate = updatedMainTasks[taskMoved.main_task_id];

          if (mainTaskToUpdate) {
            // Update the stage_id in the main_task
            mainTaskToUpdate.stage_id = nextStageId;
          }

          stageToUpdate.main_tasks = updatedMainTasks;
        }
        console.log('updated data:', updatedData);
        return updatedData;
      }, false);
    }
  };

  const handleRoleSelection = (selectedValues: string[]) => {
    const existingContactIds = new Set(applicants.map((applicant) => applicant.contact_id));

    const uniqueSelectedValues = selectedValues.filter(
      (value) => !existingContactIds.has(parseInt(value))
    );

    const newApplicants = uniqueSelectedValues.map((value, index) => ({
      contact_id: parseInt(value),
      role: index === 0 ? 'primary' : 'co-applicant',
    }));

    setApplicants((prevApplicants) => [...newApplicants, ...prevApplicants]);
  };

  const changeApplicantRole = (value: string | null, id: string) => {
    if (value !== null) {
      setApplicants((prevApplicants) =>
        prevApplicants.map((applicant) =>
          applicant.contact_id === parseInt(id) ? { ...applicant, role: value } : applicant
        )
      );
    }
  };
  const removeApplicant = (id: number) => {
    setApplicants((prevApplicants) =>
      prevApplicants.filter((applicant) => applicant.contact_id !== id)
    );
  };

  const icon = <IconAt style={{ width: rem(16), height: rem(16) }} />;

  const applicantForm = useForm({
    initialValues: {
      title: '',
      first_name: '',
      middle_name: '',
      last_name: '',
      preferred_name: '',
      email: '',
      secondary_email: '',
      review_frequency: '',
      next_review: '',
      birth_date: '',
      gender: '',
      mobile_number: '',
      home_number: '',
      office_number: '',
      fax_number: '',
      home_address1: '',
      home_address2: '',
      home_city: '',
      home_postcode: '',
      home_state: '',
      home_country: '',
      postal_address1: '',
      postal_address2: '',
      postal_city: '',
      postal_postcode: '',
      postal_state: '',
      postal_country: '',
      office_address1: '',
      office_address2: '',
      office_city: '',
      office_postcode: '',
      office_state: '',
      office_country: '',
      photo: '',
      citizenship: '',
      marital_status: '',
      lead_source: '',
      date_referred: '',
      notes: '',
    },

    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
      first_name: isNotEmpty(),
      last_name: isNotEmpty(),
      title: isNotEmpty(),
      mobile_number: isNotEmpty(),
    },
  });

  const form = useForm({
    initialValues: {
      task_name: '',
      stage_id: null,
      board_id: parseInt(params.board_id),
      broker_id: broker || (currentUser && currentUser.id) || null,
      applicants: applicants,
      team_id: null,
      team_role_id: null,
      lender_id: null,
      stage_due_date: '',
      finance_date: '',
      settlement_date: '',
      broker_handover_date: '',
      exp_lodged_date: '',
      pre_approved_date: '',
      formal_approved_date: '',
      exp_settlement_date: '',
      is_urgent: false,
      archive: false,
    },

    validate: {
      task_name: isNotEmpty('Name should not be empty'),
      broker_id: isNotEmpty('Broker should not be empty'),
      stage_id: isNotEmpty('stage should not be empty'),
      lender_id: isNotEmpty('lender should not be empty'),
      applicants: (value) => {
        if (!Array.isArray(value) || value.length === 0) {
          return 'Applicant must not be empty';
        }
        return undefined; // Validation passed
      },
    },
    transformValues: (values) => ({
      task_name: values.task_name,
      stage_id: Number(values.stage_id),
      board_id: Number(values.board_id),
      broker_id: Number(values.broker_id),
      applicants: values.applicants,
      team_id: values.team_id,
      team_role_id: values.team_role_id,
      lender_id: Number(values.lender_id),
      stage_due_date: '',
      finance_date: '',
      settlement_date: '',
      broker_handover_date: '',
      exp_lodged_date: '',
      pre_approved_date: '',
      formal_approved_date: '',
      exp_settlement_date: '',
      is_urgent: false,
      archive: false,
    }),
  });

  const saveLoan = () => {
    const data = form.getTransformedValues();
    form.validate();
    if (form.isValid()) {
      setLoading(true);
      axiosInstance
        .post('/main/task/add', data, {
          headers: {
            Authorization: `Bearer ${
              typeof localStorage !== 'undefined'
                ? localStorage.getItem('broker_access_token') ||
                  localStorage.getItem('access_token')
                : null
            }`,
          },
        })
        .then((res) => {
          setApplicants([]);
          form.reset();
          mutate();
          setLoading(false);
          notifications.show({
            title: 'Success',
            message: `${board?.title} added`,
            color: 'teal',
          });
        })
        .catch((err) => {
          console.log(err);
          setLoading(false);
          notifications.show({
            title: 'Error',
            message: `Error adding ${board?.title}`,
            color: 'red',
          });
        });
    }
  };

  const saveApplicant = () => {
    const values = applicantForm.getTransformedValues();
    applicantForm.validate();
    if (!applicantForm.isValid()) {
      notifications.show({
        title: 'Error',
        message: 'Some required fields are missing',
        color: 'red',
      });
      return;
    }
    if (applicantForm.isValid()) {
      setLoading(true);
      axiosInstance
        .post('/contact/new-contact', values, {
          headers: {
            Authorization: `Bearer ${
              typeof localStorage !== 'undefined'
                ? localStorage.getItem('broker_access_token') ||
                  localStorage.getItem('access_token')
                : null
            }`,
          },
        })
        .then((res) => {
          console.log('response:', res);
          applicantForm.reset();
          setLoading(false);
          mutateContacts();
          setAddApplicant(false);
          setNewLoan(true);
          const newApplicant = {
            contact_id: res.data,
            role: 'primary',
          };
          setApplicants((prevApplicants) => [...prevApplicants, newApplicant]);
          notifications.show({
            title: 'Success',
            message: 'Contact Added',
            color: 'teal',
          });
        })
        .catch((err) => {
          console.log(err);
          setLoading(false);
          notifications.show({
            title: 'Error',
            message: 'Error adding contact',
            color: 'red',
          });
        });
    }
  };

  useEffect(() => {
    setAuthorizationToken(token);
    form.setFieldValue('broker_id', broker || (currentUser && currentUser?.id));
    form.setFieldValue('applicants', applicants);
    axiosInstance
      .get(`/board/get/board/${params.board_id}`, {
        headers: {
          Authorization: `Bearer ${
            typeof localStorage !== 'undefined'
              ? localStorage.getItem('broker_access_token') || localStorage.getItem('access_token')
              : null
          }`,
        },
      })
      .then((res) => {
        setBoard(res.data[0]);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [params.board_id, broker, applicants]);

  return (
    <SideBarLayout
      title={` ${board?.title}` || 'Loading...'}
      showButton={true}
      showBgWhite={true}
      count={board?.main_task_count}
      broker=""
    >
      {isLoading ? (
        <Center>
          <Loader size="lg" mt={100} />
        </Center>
      ) : (
        <DragDropContext onDragEnd={handleOnDragEnd}>
          <Droppable droppableId="board" direction="horizontal" type="column">
            {(provided) => (
              <Flex
                mih={50}
                mt={4}
                gap="sm"
                justify="flex-start"
                align="center"
                direction="row"
                wrap="nowrap"
                {...provided.droppableProps}
                ref={provided.innerRef}
                style={{ overflowX: 'auto' }}
              >
                {data &&
                  data.map((data) => (
                    <Column
                      key={data.stage_id}
                      id={data?.stage_name}
                      tasks={data}
                      index={data.stage_id}
                      stageId={data.stage_id}
                    />
                  ))}
              </Flex>
            )}
          </Droppable>
        </DragDropContext>
      )}
      {/* modal */}
      <Modal opened={opened} onClose={close} withCloseButton={false}>
        {newLoan && (
          <Box>
            <Title order={5}>{`New ${board?.title}`}</Title>

            <Paper mt="md">
              <TextInput
                leftSectionPointerEvents="none"
                label={`${board?.title} Name`}
                placeholder="name"
                {...form.getInputProps('task_name')}
              />
              <Select
                placeholder="broker"
                label="Broker"
                data={users?.map((user) => ({
                  value: `${user.user_id}`,
                  label: `${user.first_name} ${user.last_name} (${user.email})`,
                }))}
                value={broker || (currentUser && currentUser?.id?.toString())}
                onChange={setBroker}
                clearable
              />
              <Box>
                <Flex justify="space-between" gap="sm" align="center">
                  <MultiSelect
                    placeholder="select applicant"
                    label="Applicants"
                    data={contacts?.contacts?.map((contact) => ({
                      value: `${contact.contact_id}`,
                      label: `${contact.first_name} ${contact.last_name}`,
                    }))}
                    onChange={handleRoleSelection}
                    w={{ xs: '100%', md: 400 }}
                  />
                  <Tooltip label="Add applicant">
                    <Button
                      size="xs"
                      mt={26}
                      onClick={() => {
                        setAddApplicant(true);
                        setNewLoan(false);
                      }}
                    >
                      <IconPlus size={15} />
                    </Button>
                  </Tooltip>
                </Flex>

                {form.errors.applicants && (
                  <Text size="xs" style={{ color: 'red', marginTop: '8px' }}>
                    {form.errors.applicants}
                  </Text>
                )}
                {applicants.length > 0 &&
                  applicants
                    .filter(
                      (applicant) =>
                        contacts?.contacts?.some(
                          (contact) => contact.contact_id === applicant.contact_id
                        )
                    )
                    .map((applicant) => (
                      <Flex
                        justify="space-between"
                        align="center"
                        mt="sm"
                        key={applicant.contact_id}
                      >
                        {contacts?.contacts?.map((contact) => {
                          if (contact.contact_id === applicant.contact_id) {
                            return (
                              <Text c="dimmed">{`${contact.first_name} ${contact.last_name}`}</Text>
                            );
                          }
                        })}
                        <Flex justify="space-between" gap="sm">
                          <Select
                            size="xs"
                            value={applicant.role}
                            data={['primary', 'co-applicant', 'guarantor']}
                            onChange={(value) =>
                              changeApplicantRole(value, applicant.contact_id.toString())
                            }
                          />
                          <Button
                            onClick={() => removeApplicant(applicant.contact_id)}
                            size="compact-sm"
                            color="red"
                          >
                            <IconTrash size={15} />
                          </Button>
                        </Flex>
                      </Flex>
                    ))}
              </Box>
              <Select
                placeholder="stage"
                label="Stage"
                data={data?.map((stage, index) => ({
                  value: `${stage.stage_id}`,
                  label: `${index + 1} ${stage.stage_name}`,
                }))}
                {...form.getInputProps('stage_id')}
                clearable
              />
              <Select
                placeholder="lender"
                label="Lender"
                data={lenders?.lenders?.map((lender) => ({
                  value: `${lender.lender_id}`,
                  label: ` ${lender.lender_name} `,
                }))}
                {...form.getInputProps('lender_id')}
                clearable
              />
            </Paper>
            <Flex justify="flex-end" mt="md">
              <Button onClick={saveLoan} disabled={loading && true}>
                {loading ? <Loader size="sm" color="white" /> : 'Save'}
              </Button>
            </Flex>
          </Box>
        )}

        {addApplicant && (
          <Box w="100%">
            <Title order={5}>Add Applicant</Title>
            <Paper>
              <Select
                placeholder="title"
                label="Title"
                data={['Mr', 'Mrs', 'Miss', 'Hon', 'Dr']}
                {...applicantForm.getInputProps('title')}
                clearable
              />
              <TextInput
                leftSectionPointerEvents="none"
                label="First Name"
                placeholder="first name"
                {...applicantForm.getInputProps('first_name')}
              />

              <TextInput
                leftSectionPointerEvents="none"
                label="Middle Name"
                placeholder="first name"
                {...applicantForm.getInputProps('middle_name')}
              />
              <TextInput
                leftSectionPointerEvents="none"
                label="Last Name"
                placeholder="last name"
                {...applicantForm.getInputProps('last_name')}
              />
              <TextInput
                leftSectionPointerEvents="none"
                label="Preferred Name"
                placeholder="preferred name"
                {...applicantForm.getInputProps('preferred_name')}
              />

              <TextInput
                leftSectionPointerEvents="none"
                label="Company"
                placeholder="company"
                {...applicantForm.getInputProps('company')}
              />

              <TextInput
                leftSectionPointerEvents="none"
                leftSection={icon}
                label="Email"
                placeholder="email"
                {...applicantForm.getInputProps('email')}
              />
              <TextInput
                leftSectionPointerEvents="none"
                leftSection={icon}
                label="Secondary Email"
                placeholder="secondary email"
                {...applicantForm.getInputProps('secondary_email')}
              />

              <TextInput
                label="Date of Birth"
                className={classes.customGray}
                type="date"
                style={{ width: '100%' }}
                {...applicantForm.getInputProps('birth_date')}
              />
              <Select
                placeholder="gender"
                label="Gender"
                data={['Male', 'Female']}
                {...applicantForm.getInputProps('gender')}
              />
            </Paper>

            {/* phone numbers */}
            <Box mt="md">
              <Title order={6} className={classes.brandSection} p="xs">
                Phone numbers
              </Title>
              <Paper mt="sm">
                <label htmlFor="phoneInput">Mobile</label>
                <PhoneInput
                  id="phoneInput"
                  international
                  defaultCountry="AU"
                  initialValueFormat="national"
                  {...applicantForm.getInputProps('mobile_number')}
                />
                {form.errors.mobile_number && (
                  <Text size="xs" style={{ color: 'red' }}>
                    Mobile phone should not be empty
                  </Text>
                )}
              </Paper>
              <Paper mt="sm">
                <label htmlFor="phoneInput">Home</label>
                <PhoneInput
                  id="phoneInput"
                  international
                  defaultCountry="AU"
                  initialValueFormat="national"
                  {...applicantForm.getInputProps('home_number')}
                />
              </Paper>
              <Paper mt="sm">
                <label htmlFor="phoneInput">Office</label>
                <PhoneInput
                  id="phoneInput"
                  international
                  defaultCountry="AU"
                  initialValueFormat="national"
                  {...applicantForm.getInputProps('office_number')}
                />
              </Paper>
              <Paper mt="sm">
                <label htmlFor="phoneInput">Fax</label>
                <PhoneInput
                  id="phoneInput"
                  international
                  defaultCountry="AU"
                  initialValueFormat="national"
                  {...applicantForm.getInputProps('fax_number')}
                />
              </Paper>
            </Box>

            {/* addresses */}
            <Box mt="md">
              <Title order={6} className={classes.brandSection} p="xs">
                Home Address
              </Title>
              <TextInput
                mt="sm"
                leftSectionPointerEvents="none"
                label="Street Address 1"
                placeholder="address"
                {...applicantForm.getInputProps('home_address1')}
              />
              <TextInput
                leftSectionPointerEvents="none"
                label="Street Address 2"
                placeholder="address"
                {...applicantForm.getInputProps('home_address2')}
              />
              <TextInput
                leftSectionPointerEvents="none"
                label="City/Town/Suburb"
                placeholder="city"
                {...applicantForm.getInputProps('home_city')}
              />
              <TextInput
                leftSectionPointerEvents="none"
                label="Postcode"
                placeholder="postcode"
                {...applicantForm.getInputProps('home_postcode')}
              />

              <TextInput
                leftSectionPointerEvents="none"
                label="State/Region"
                placeholder="state"
                {...applicantForm.getInputProps('home_state')}
              />
              <TextInput
                leftSectionPointerEvents="none"
                label="Country"
                placeholder="country"
                {...applicantForm.getInputProps('home_country')}
              />
            </Box>

            {/* postal address */}
            <Box mt="md">
              <Flex justify="flex-start" gap="md">
                <Title order={6} className={classes.brandSection} p="xs">
                  Postal Address
                </Title>
                <Button
                  onClick={() => {
                    applicantForm.setValues((currentValues) => ({
                      ...currentValues,
                      postal_address1: currentValues.home_address1,
                      postal_address2: currentValues.home_address2,
                      postal_city: currentValues.home_city,
                      postal_postcode: currentValues.home_postcode,
                      postal_state: currentValues.home_state,
                      postal_country: currentValues.home_country,
                    }));
                  }}
                >
                  Same as above
                </Button>
              </Flex>
              <TextInput
                mt="sm"
                leftSectionPointerEvents="none"
                label="Street Address 1"
                placeholder="address"
                {...applicantForm.getInputProps('postal_address1')}
              />
              <TextInput
                leftSectionPointerEvents="none"
                label="Street Address 2"
                placeholder="address"
                {...applicantForm.getInputProps('postal_address2')}
              />
              <TextInput
                leftSectionPointerEvents="none"
                label="City/Town/Suburb"
                placeholder="city"
                {...applicantForm.getInputProps('postal_city')}
              />
              <TextInput
                leftSectionPointerEvents="none"
                label="Postcode"
                placeholder="postcode"
                {...applicantForm.getInputProps('postal_postcode')}
              />

              <TextInput
                leftSectionPointerEvents="none"
                label="State/Region"
                placeholder="state"
                {...applicantForm.getInputProps('postal_state')}
              />
              <TextInput
                leftSectionPointerEvents="none"
                label="Country"
                placeholder="country"
                {...applicantForm.getInputProps('postal_country')}
              />
            </Box>

            {/* office address */}
            <Box mt="md">
              <Title order={6} className={classes.brandSection} p="xs">
                Office Address
              </Title>
              <TextInput
                mt="sm"
                leftSectionPointerEvents="none"
                label="Street Address 1"
                placeholder="address"
                {...applicantForm.getInputProps('office_address1')}
              />
              <TextInput
                leftSectionPointerEvents="none"
                label="Street Address 2"
                placeholder="address"
                {...applicantForm.getInputProps('office_address2')}
              />
              <TextInput
                leftSectionPointerEvents="none"
                label="City/Town/Suburb"
                placeholder="city"
                {...applicantForm.getInputProps('office_city')}
              />
              <TextInput
                leftSectionPointerEvents="none"
                label="Postcode"
                placeholder="postcode"
                {...applicantForm.getInputProps('office_postcode')}
              />

              <TextInput
                leftSectionPointerEvents="none"
                label="State/Region"
                placeholder="state"
                {...applicantForm.getInputProps('office_state')}
              />
              <TextInput
                leftSectionPointerEvents="none"
                label="Country"
                placeholder="country"
                {...applicantForm.getInputProps('office_country')}
              />
            </Box>

            {/* other fields */}
            <Box mt="md">
              <Title order={6} className={classes.brandSection} p="xs">
                Additional Details
              </Title>
              <TextInput
                mt="sm"
                leftSectionPointerEvents="none"
                label="Citizenship"
                placeholder="citizenship"
                {...applicantForm.getInputProps('citizenship')}
              />
              <Select
                placeholder="status"
                label="Marital Status"
                data={['Single', 'Married']}
                {...applicantForm.getInputProps('marital_status')}
                clearable
              />

              <TextInput
                leftSectionPointerEvents="none"
                label="Lead Source"
                placeholder="lead source"
                {...applicantForm.getInputProps('lead_source')}
              />
              <TextInput
                label="Date Referred"
                className={classes.customGray}
                type="date"
                style={{ width: '100%', marginTop: 10 }}
                {...applicantForm.getInputProps('date_referred')}
              />
              <Textarea
                label="Notes"
                placeholder="notes"
                {...applicantForm.getInputProps('notes')}
              />
            </Box>

            <Flex justify="flex-end" gap="sm" mt="sm">
              <Button
                onClick={() => {
                  setAddApplicant(false);
                  setNewLoan(true);
                }}
              >
                Back
              </Button>
              <Button disabled={loading && true} onClick={saveApplicant}>
                {loading ? <Loader size="sm" color="white" /> : 'Save'}
              </Button>
            </Flex>
          </Box>
        )}
      </Modal>

      {/* fab add button */}
      <Fab
        size="medium"
        color="primary"
        aria-label="add"
        style={{ position: 'absolute', top: 80, right: 20 }}
        onClick={open}
      >
        <IconPlus />
      </Fab>
    </SideBarLayout>
  );
}

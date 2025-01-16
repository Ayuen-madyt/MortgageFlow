import React, { useState, useEffect } from 'react';
import {
  Box,
  Title,
  Card,
  Text,
  Flex,
  rem,
  Divider,
  TextInput,
  Select,
  Paper,
  Collapse,
  Tooltip,
  Table,
  Modal,
  Anchor,
  Button,
} from '@mantine/core';
import {
  IconArrowNarrowLeft,
  IconAt,
  IconChevronRight,
  IconTrash,
  IconPlus,
  IconLink,
} from '@tabler/icons-react';
import { useAppContext } from '@/ContextAPI/ContextAPI';
import classes from './Task.module.css';
import fetcher from '@/utils/fetcher';
import useSWR from 'swr';
import { useDisclosure } from '@mantine/hooks';
import PhoneInput from 'react-phone-number-input';
import { axiosInstance, setAuthorizationToken } from '@/utils/axiosInstance';
import { isNotEmpty, useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useParams } from 'next/navigation';

export default function ApplicantDetails() {
  const [opened, { toggle }] = useDisclosure(true);
  const [openContacts, { toggle: toggleContacts }] = useDisclosure(false);
  const [openAdress, { toggle: toggleAddress }] = useDisclosure(false);
  const [isNewFormOpened, { open: openNewForm, close: closeNewForm }] = useDisclosure(false);
  const [linkExistingContact, { open: openExistingContactForm, close: closeExistingContactForm }] =
    useDisclosure(false);
  const [role, setRole] = useState('');

  const [applicant, setApplicant] = useState();
  const { dispatch } = useAppContext();
  const [token, setToken] = useState('');

  const { task_id } = useParams();

  useEffect(() => {
    const access_token =
      typeof localStorage !== 'undefined' ? localStorage.getItem('broker_access_token') : null;

    setToken(access_token);
    setAuthorizationToken(access_token);
  }, []);

  const { data, mutate, isLoading } = useSWR(
    [`/main/task/get/applicants/${task_id}`, token],
    ([url, token]) => fetcher(url, token)
  );

  const { data: contacts } = useSWR([`contact`, token], ([url, token]) => fetcher(url, token));

  const form = useForm({
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
      secondary_email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
      mobile_number: isNotEmpty(),
    },
  });

  const linkExistingContactForm = useForm({
    initialValues: {
      contact: '',
      applicantRole: '',
      contactType: 'applicant',
    },
    validate: {
      contact: isNotEmpty(),
      applicantRole: isNotEmpty(),
    },
  });

  const existingApplicant = linkExistingContactForm.getTransformedValues();
  const contactData = form.getTransformedValues();

  const addNewApplicant = () => {
    const applicantData = {
      contactData,
      main_task_id: task_id,
      role,
      contactType: 'applicant',
    };

    if (form.validate()) {
      axiosInstance
        .post('/contact/add-contact/link-task', applicantData)
        .then((res) => {
          closeNewForm();
          dispatch({ type: 'SET_REFETCH_APPLICANTS', payload: true });
          mutate();
          notifications.show({
            title: 'Success',
            message: 'Applicant Added',
            color: 'teal',
          });
        })
        .catch((err) => {
          console.log(err);
          closeNewForm();
        });
    }
  };

  const linkExistingApplicant = () => {
    axiosInstance
      .post(`/contact/link-existing/contact/${task_id}`, existingApplicant)
      .then((res) => {
        console.log(res);
        closeExistingContactForm();
        dispatch({ type: 'SET_REFETCH_APPLICANTS', payload: true });
        mutate();
        notifications.show({
          title: 'Success',
          message: 'Applicant Linked to task',
          color: 'teal',
        });
      })
      .catch((err) => {
        console.log(err);
        notifications.show({
          title: 'Fail',
          message: 'Error linking applicant to task',
          color: 'red',
        });
      });
  };

  const unLinkApplicant = (contactId) => {
    axiosInstance
      .delete(`/contact/unlink/contact/${contactId}`)
      .then((res) => {
        dispatch({ type: 'SET_REFETCH_APPLICANTS', payload: true });
        const updatedData = data?.filter((applicant) => applicant.contact_id !== contactId);
        console.log('mutated data:', updatedData);
        mutate(updatedData, false);
        notifications.show({
          title: 'Success',
          message: 'Applicant unlinked',
          color: 'teal',
        });
      })
      .catch((err) => {
        console.log(err);
        notifications.show({
          title: 'Fail',
          message: 'Error unlinking applicant',
          color: 'red',
        });
      });
  };

  const handleShowTabsClick = () => {
    dispatch({ type: 'SET_SHOW_TABS', payload: true });
  };

  const getApplicant = (applicantId) => {
    axiosInstance
      .get(`/contact/get/${applicantId}`)
      .then((res) => {
        setApplicant(res.data);
      })
      .catch((err) => {
        console.log('error:', err);
      });
  };

  const icon = <IconAt style={{ width: rem(16), height: rem(16) }} />;

  const rows = data?.map((applicant) => {
    return (
      <Table.Tr key={applicant.contact_id}>
        <Table.Td>
          <Anchor component="button" fz="sm" onClick={() => getApplicant(applicant.contact_id)}>
            {`${applicant.first_name} ${applicant.last_name}`}
          </Anchor>
        </Table.Td>
        <Table.Td>{applicant.email}</Table.Td>
        <Table.Td>
          <Anchor component="button" fz="sm">
            {applicant.role}
          </Anchor>
        </Table.Td>
        {applicant.role != 'primary' && (
          <Table.Td>
            <Tooltip label="Unlink Applicant">
              <IconTrash
                size={15}
                color="red"
                style={{ cursor: 'pointer' }}
                onClick={() => unLinkApplicant(applicant.contact_id)}
              />
            </Tooltip>
          </Table.Td>
        )}
      </Table.Tr>
    );
  });

  useEffect(() => {
    if (data) {
      data?.map((applicant) => {
        if (applicant.role === 'primary') {
          getApplicant(applicant.contact_id);
        }
      });
    }
  }, [data]);

  return (
    <Box>
      <Flex
        onClick={handleShowTabsClick}
        justify="flex-start"
        align="center"
        style={{ color: '#0275d8', cursor: 'pointer', width: '100px' }}
      >
        <IconArrowNarrowLeft
          stroke={1.5}
          style={{
            width: rem(16),
            height: rem(16),
          }}
        />
        <Text size="sm">Go back</Text>
      </Flex>
      <Card
        withBorder
        mt="sm"
        radius="md"
        bg="var(--mantine-color-body)"
        style={{ padding: 0, margin: 0 }}
      >
        <Flex justify="space-between" p="xs">
          <Title p="xs" order={4} className={classes.customGray}>
            Applicants
          </Title>
          <Flex justify="space-between">
            <Tooltip label="Link Existing Applicant">
              <Button size="compact-md" mr="sm" onClick={openExistingContactForm}>
                <IconLink />
              </Button>
            </Tooltip>
            <Tooltip label="Add New Applicant">
              <Button size="compact-md" onClick={openNewForm}>
                <IconPlus />
              </Button>
            </Tooltip>
          </Flex>
        </Flex>
        <Divider />
        {/* table */}
        <Table.ScrollContainer>
          <Table verticalSpacing="xs">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Name</Table.Th>
                <Table.Th>Email</Table.Th>
                <Table.Th>Role</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>{rows}</Table.Tbody>
          </Table>
        </Table.ScrollContainer>

        {/* details */}
        {applicant ? (
          <Box p="sm">
            <Flex justify="space-between" onClick={toggle}>
              <Paper>
                <Text
                  style={{
                    display: 'flex',
                    justifyContent: 'flex-start',
                    alignItems: 'center',
                    cursor: 'pointer',
                  }}
                  className={classes.customGray}
                  fz="sm"
                  tt="uppercase"
                  fw={700}
                  pr="xs"
                >
                  {`Applicant Detail (${applicant?.first_name} ${applicant?.last_name})`}
                </Text>
              </Paper>
              <IconChevronRight
                stroke={1.5}
                style={{
                  width: rem(16),
                  height: rem(16),
                  cursor: 'pointer',
                  transform: opened ? 'rotate(-90deg)' : 'none',
                }}
              />
            </Flex>
            <Collapse in={opened} mt="md">
              <Paper>
                <TextInput
                  leftSectionPointerEvents="none"
                  label="Title"
                  placeholder="title"
                  value={applicant?.title}
                />
                <TextInput
                  leftSectionPointerEvents="none"
                  label="First Name"
                  placeholder="last name"
                  value={applicant?.first_name}
                />
                <TextInput
                  leftSectionPointerEvents="none"
                  label="Last Name"
                  placeholder="last name"
                  value={applicant?.last_name}
                />
                <TextInput
                  leftSectionPointerEvents="none"
                  label="Preferred Name"
                  placeholder="preferred name"
                  value={applicant?.preferred_name}
                />

                <TextInput
                  leftSectionPointerEvents="none"
                  label="Company"
                  placeholder="company"
                  value={applicant?.company}
                />

                <TextInput
                  leftSectionPointerEvents="none"
                  leftSection={icon}
                  label="Email"
                  placeholder="email"
                  value={applicant?.email}
                />
                <TextInput
                  leftSectionPointerEvents="none"
                  leftSection={icon}
                  label="Secondary Email"
                  placeholder="email"
                  value={applicant?.secondary_email}
                />
                <TextInput
                  leftSectionPointerEvents="none"
                  label="Gender"
                  placeholder="Gender"
                  value={applicant?.gender}
                />
                <TextInput
                  leftSectionPointerEvents="none"
                  label="Date of Birth"
                  placeholder="company"
                  value={new Date(applicant?.birth_date).toLocaleDateString()}
                />
              </Paper>
            </Collapse>

            <Box mt="sm">
              <Flex justify="space-between" onClick={toggleContacts}>
                <Paper>
                  <Text
                    style={{
                      display: 'flex',
                      justifyContent: 'flex-start',
                      alignItems: 'center',
                      cursor: 'pointer',
                    }}
                    className={classes.customGray}
                    fz="sm"
                    tt="uppercase"
                    fw={700}
                    pr="xs"
                  >
                    Phone Numbers
                  </Text>
                </Paper>
                <IconChevronRight
                  stroke={1.5}
                  style={{
                    width: rem(16),
                    height: rem(16),
                    cursor: 'pointer',
                    transform: openContacts ? 'rotate(-90deg)' : 'none',
                  }}
                />
              </Flex>
              <Collapse in={openContacts}>
                <Paper mt="sm">
                  <label htmlFor="phoneInput">Mobile</label>
                  <PhoneInput
                    id="phoneInput"
                    international
                    defaultCountry="AU"
                    initialValueFormat="national"
                    value={applicant?.mobile_number}
                    onChange={(value) => null}
                  />
                </Paper>
                <Paper mt="sm">
                  <label htmlFor="officeInput">Office</label>
                  <PhoneInput
                    id="officeInput"
                    international
                    defaultCountry="AU"
                    initialValueFormat="national"
                    value={applicant?.office_number}
                    onChange={(value) => null}
                  />
                </Paper>
                <Paper mt="sm">
                  <label htmlFor="faxInput">fax</label>
                  <PhoneInput
                    id="faxInput"
                    international
                    defaultCountry="AU"
                    initialValueFormat="national"
                    value={applicant?.fax_number}
                    onChange={(value) => null}
                  />
                </Paper>
              </Collapse>
            </Box>

            {/* address */}
            <Box mt="sm">
              <Flex justify="space-between" onClick={toggleAddress}>
                <Paper>
                  <Text
                    style={{
                      display: 'flex',
                      justifyContent: 'flex-start',
                      alignItems: 'center',
                      cursor: 'pointer',
                    }}
                    className={classes.customGray}
                    fz="sm"
                    tt="uppercase"
                    fw={700}
                    pr="xs"
                  >
                    Address
                  </Text>
                </Paper>
                <IconChevronRight
                  stroke={1.5}
                  style={{
                    width: rem(16),
                    height: rem(16),
                    cursor: 'pointer',
                    transform: openAdress ? 'rotate(-90deg)' : 'none',
                  }}
                />
              </Flex>
              <Collapse in={openAdress}>
                {/* home address */}
                <Box mt="md">
                  <Title order={6} className={classes.brandSection} p="xs">
                    Home Address
                  </Title>
                  <TextInput
                    mt="sm"
                    leftSectionPointerEvents="none"
                    label="Street Address 1"
                    placeholder="address"
                    value={applicant?.home_address1}
                  />
                  <TextInput
                    leftSectionPointerEvents="none"
                    label="Street Address 2"
                    placeholder="address"
                    value={applicant?.home_address2}
                  />
                  <TextInput
                    leftSectionPointerEvents="none"
                    label="City/Town/Suburb"
                    placeholder="city"
                    value={applicant?.home_city}
                  />
                  <TextInput
                    leftSectionPointerEvents="none"
                    label="Postcode"
                    placeholder="postcode"
                    value={applicant?.home_postcode}
                  />

                  <TextInput
                    leftSectionPointerEvents="none"
                    label="State/Region"
                    placeholder="state"
                    value={applicant?.home_state}
                  />
                  <TextInput
                    leftSectionPointerEvents="none"
                    label="Country"
                    placeholder="country"
                    value={applicant?.home_country}
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
                    value={applicant?.office_address1}
                  />
                  <TextInput
                    leftSectionPointerEvents="none"
                    label="Street Address 2"
                    placeholder="address"
                    value={applicant?.office_address2}
                  />
                  <TextInput
                    leftSectionPointerEvents="none"
                    label="City/Town/Suburb"
                    placeholder="city"
                    value={applicant?.office_city}
                  />
                  <TextInput
                    leftSectionPointerEvents="none"
                    label="Postcode"
                    placeholder="postcode"
                    value={applicant?.office_postcode}
                  />

                  <TextInput
                    leftSectionPointerEvents="none"
                    label="State/Region"
                    placeholder="state"
                    value={applicant?.office_state}
                  />
                  <TextInput
                    leftSectionPointerEvents="none"
                    label="Country"
                    placeholder="country"
                    value={applicant?.office_country}
                  />
                </Box>

                <Box mt="lg">
                  <Title order={6} className={classes.brandSection} p="xs">
                    Postal Address
                  </Title>
                  <TextInput
                    leftSectionPointerEvents="none"
                    label="Street Address 1"
                    placeholder="address"
                    value={applicant?.postal_address1}
                  />
                  <TextInput
                    leftSectionPointerEvents="none"
                    label="Street Address 2"
                    placeholder="address"
                    value={applicant?.postal_address2}
                  />
                  <TextInput
                    leftSectionPointerEvents="none"
                    label="City/Town/Suburb"
                    placeholder="city"
                    value={applicant?.postal_city}
                  />
                  <TextInput
                    leftSectionPointerEvents="none"
                    label="Postcode"
                    placeholder="postcode"
                    value={applicant?.postal_postcode}
                  />

                  <TextInput
                    leftSectionPointerEvents="none"
                    label="State/Region"
                    placeholder="state"
                    value={applicant?.postal_state}
                  />
                  <TextInput
                    leftSectionPointerEvents="none"
                    label="Country"
                    placeholder="country"
                    value={applicant?.postal_country}
                  />
                </Box>
              </Collapse>
            </Box>
          </Box>
        ) : (
          <Title p="sm" order={5} className={classes.customGray}>
            No Applicants Linked
          </Title>
        )}
      </Card>

      {/* add new applicant */}
      <Modal opened={isNewFormOpened} onClose={closeNewForm} withCloseButton={false}>
        <Title p="xs" order={4} className={classes.customGray}>
          New Applicant
        </Title>
        <Divider />
        <Box p="xs">
          <Paper>
            <Select
              placeholder="Role"
              label="Applicant Role"
              data={['co-applicant', 'guarantor']}
              value={role}
              onChange={setRole}
              clearable
            />
            <Select
              placeholder="title"
              label="Title"
              data={['Mr', 'Mrs', 'Miss']}
              {...form.getInputProps('title')}
              clearable
            />
            <TextInput
              leftSectionPointerEvents="none"
              label="First Name"
              placeholder="last name"
              {...form.getInputProps('first_name')}
            />
            <TextInput
              leftSectionPointerEvents="none"
              label="Last Name"
              placeholder="last name"
              {...form.getInputProps('last_name')}
            />
            <TextInput
              leftSectionPointerEvents="none"
              label="Preferred Name"
              placeholder="preferred name"
              {...form.getInputProps('preferred_name')}
            />

            <TextInput
              leftSectionPointerEvents="none"
              label="Company"
              placeholder="company"
              {...form.getInputProps('company')}
            />

            <TextInput
              leftSectionPointerEvents="none"
              leftSection={icon}
              label="Email"
              placeholder="email"
              {...form.getInputProps('email')}
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
                {...form.getInputProps('mobile_number')}
              />
            </Paper>
            <Paper mt="sm">
              <label htmlFor="phoneInput">Home</label>
              <PhoneInput
                id="phoneInput"
                international
                defaultCountry="AU"
                initialValueFormat="national"
                {...form.getInputProps('home_number')}
              />
            </Paper>
            <Paper mt="sm">
              <label htmlFor="phoneInput">Office</label>
              <PhoneInput
                id="phoneInput"
                international
                defaultCountry="AU"
                initialValueFormat="national"
                {...form.getInputProps('office_number')}
              />
            </Paper>
            <Paper mt="sm">
              <label htmlFor="phoneInput">Fax</label>
              <PhoneInput
                id="phoneInput"
                international
                defaultCountry="AU"
                initialValueFormat="national"
                {...form.getInputProps('fax_number')}
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
              {...form.getInputProps('home_address1')}
            />
            <TextInput
              leftSectionPointerEvents="none"
              label="Street Address 2"
              placeholder="address"
              {...form.getInputProps('home_address2')}
            />
            <TextInput
              leftSectionPointerEvents="none"
              label="City/Town/Suburb"
              placeholder="city"
              {...form.getInputProps('home_city')}
            />
            <TextInput
              leftSectionPointerEvents="none"
              label="Postcode"
              placeholder="postcode"
              {...form.getInputProps('home_postcode')}
            />

            <TextInput
              leftSectionPointerEvents="none"
              label="State/Region"
              placeholder="state"
              {...form.getInputProps('home_state')}
            />
            <TextInput
              leftSectionPointerEvents="none"
              label="Country"
              placeholder="country"
              {...form.getInputProps('home_country')}
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
                  form.setValues((currentValues) => ({
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
              {...form.getInputProps('postal_address1')}
            />
            <TextInput
              leftSectionPointerEvents="none"
              label="Street Address 2"
              placeholder="address"
              {...form.getInputProps('postal_address2')}
            />
            <TextInput
              leftSectionPointerEvents="none"
              label="City/Town/Suburb"
              placeholder="city"
              {...form.getInputProps('postal_city')}
            />
            <TextInput
              leftSectionPointerEvents="none"
              label="Postcode"
              placeholder="postcode"
              {...form.getInputProps('postal_postcode')}
            />

            <TextInput
              leftSectionPointerEvents="none"
              label="State/Region"
              placeholder="state"
              {...form.getInputProps('postal_state')}
            />
            <TextInput
              leftSectionPointerEvents="none"
              label="Country"
              placeholder="country"
              {...form.getInputProps('postal_country')}
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
              {...form.getInputProps('office_address1')}
            />
            <TextInput
              leftSectionPointerEvents="none"
              label="Street Address 2"
              placeholder="address"
              {...form.getInputProps('office_address2')}
            />
            <TextInput
              leftSectionPointerEvents="none"
              label="City/Town/Suburb"
              placeholder="city"
              {...form.getInputProps('office_city')}
            />
            <TextInput
              leftSectionPointerEvents="none"
              label="Postcode"
              placeholder="postcode"
              {...form.getInputProps('office_postcode')}
            />

            <TextInput
              leftSectionPointerEvents="none"
              label="State/Region"
              placeholder="state"
              {...form.getInputProps('office_state')}
            />
            <TextInput
              leftSectionPointerEvents="none"
              label="Country"
              placeholder="country"
              {...form.getInputProps('office_country')}
            />
          </Box>

          <Flex justify="flex-end" mt="sm">
            <Button onClick={addNewApplicant}>Link to this loan </Button>
          </Flex>
        </Box>
      </Modal>

      {/* link existing contact */}
      <Modal
        opened={linkExistingContact}
        onClose={closeExistingContactForm}
        withCloseButton={false}
      >
        <Title p="xs" order={4} className={classes.customGray}>
          Link Existing Contact
        </Title>
        <Divider />

        <Select
          placeholder="applicant"
          label="Choose an Applicant"
          data={contacts?.contacts?.map((contact) => ({
            value: `${contact.contact_id}`,
            label: `${contact.first_name} ${contact.last_name}`,
          }))}
          {...linkExistingContactForm.getInputProps('contact')}
          searchable
          clearable
        />

        <Select
          placeholder="role"
          label="Applicant Role"
          data={['co-applicant', 'guarantor']}
          {...linkExistingContactForm.getInputProps('applicantRole')}
          clearable
        />

        <Flex justify="flex-end" mt="sm">
          <Button onClick={linkExistingApplicant}>Save</Button>
        </Flex>
      </Modal>
    </Box>
  );
}

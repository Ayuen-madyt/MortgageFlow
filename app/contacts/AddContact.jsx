import React, { useState, Fragment } from 'react';
import {
  Box,
  Title,
  Text,
  Flex,
  rem,
  TextInput,
  Select,
  Paper,
  Textarea,
  Button,
  Loader,
} from '@mantine/core';
import { IconAt } from '@tabler/icons-react';
import PhoneInput from 'react-phone-number-input';
import classes from '../../components/mainTask/Task.module.css';
import { useForm, isNotEmpty } from '@mantine/form';
import { axiosInstance, setAuthorizationToken } from '@/utils/axiosInstance';
import { notifications } from '@mantine/notifications';

export default function AddContact({ closeModal, contactAdded }) {
  const [loading, setLoading] = useState(false);
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
      first_name: isNotEmpty(),
      last_name: isNotEmpty(),
      title: isNotEmpty(),
      mobile_number: isNotEmpty(),
    },
  });

  const icon = <IconAt style={{ width: rem(16), height: rem(16) }} />;

  const values = form.getTransformedValues();

  console.log('values', values);

  const addContact = () => {
    form.validate();
    if (!form.isValid()) {
      notifications.show({
        title: 'Error',
        message: 'Some required fields are missing',
        color: 'red',
      });
      return;
    }
    if (form.isValid()) {
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
          setLoading(false);
          closeModal();
          contactAdded(true);
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
  return (
    <Fragment>
      <Title order={5}>New Contact</Title>
      <Box p="xs">
        <Paper>
          <Select
            placeholder="title"
            label="Title"
            data={['Mr', 'Mrs', 'Miss', 'Hon', 'Dr']}
            {...form.getInputProps('title')}
            clearable
          />
          <TextInput
            leftSectionPointerEvents="none"
            label="First Name"
            placeholder="first name"
            {...form.getInputProps('first_name')}
          />

          <TextInput
            leftSectionPointerEvents="none"
            label="Middle Name"
            placeholder="first name"
            {...form.getInputProps('middle_name')}
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
          <TextInput
            leftSectionPointerEvents="none"
            leftSection={icon}
            label="Secondary Email"
            placeholder="secondary email"
            {...form.getInputProps('secondary_email')}
          />

          <TextInput
            label="Date of Birth"
            className={classes.customGray}
            type="date"
            style={{ width: '100%' }}
            {...form.getInputProps('birth_date')}
          />
          <Select
            placeholder="gender"
            label="Gender"
            data={['Male', 'Female']}
            {...form.getInputProps('gender')}
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
            {...form.getInputProps('citizenship')}
          />
          <Select
            placeholder="status"
            label="Marital Status"
            data={['Single', 'Married']}
            {...form.getInputProps('marital_status')}
            clearable
          />

          <TextInput
            leftSectionPointerEvents="none"
            label="Lead Source"
            placeholder="lead source"
            {...form.getInputProps('lead_source')}
          />
          <TextInput
            label="Date Referred"
            className={classes.customGray}
            type="date"
            style={{ width: '100%', marginTop: 10 }}
            {...form.getInputProps('date_referred')}
          />
          <Textarea label="Notes" placeholder="notes" {...form.getInputProps('notes')} />
        </Box>

        <Flex justify="flex-end" mt="sm">
          <Button onClick={addContact}>
            {loading ? <Loader size="sm" color="white" /> : 'Save'}
          </Button>
        </Flex>
      </Box>
    </Fragment>
  );
}

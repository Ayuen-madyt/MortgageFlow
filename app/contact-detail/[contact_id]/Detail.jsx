'use client';

import React, { useState, useEffect, Fragment } from 'react';
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
  Input,
  FileInput,
  Textarea,
  Button,
} from '@mantine/core';
import { IconArrowNarrowLeft, IconAt, IconChevronRight, IconTrash } from '@tabler/icons-react';
import PhoneInput, { formatPhoneNumber, formatPhoneNumberIntl } from 'react-phone-number-input';
import { useAppContext } from '@/ContextAPI/ContextAPI';
import fetcher from '@/utils/fetcher';
import useSWR from 'swr';
import classes from '../../../components/mainTask/Task.module.css';
import { axiosInstance, setAuthorizationToken } from '@/utils/axiosInstance';
import { notifications } from '@mantine/notifications';

export default function Detail({ contact_id }) {
  const { data: contact } = useSWR(`/contact/get/${contact_id}`, fetcher);

  console.log('contact', contact);

  const [contactData, setContactData] = useState({
    contact_id: null,
    user_id: null,
    company_id: null,
    contact_type: '',
    title: '',
    first_name: '',
    middle_name: '',
    last_name: '',
    preferred_name: '',
    email: '',
    secondary_email: '',
    review_frequency: '',
    next_review: null,
    birth_date: null,
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
    citizenship: '',
    marital_status: '',
    lead_source: '',
    date_referred: null,
    notes: '',
    photo: '',
  });

  const icon = <IconAt style={{ width: rem(16), height: rem(16) }} />;

  useEffect(() => {
    axiosInstance
      .get(`/contact/get/${contact_id}`)
      .then((res) => {
        setContactData({
          contact_id: res.data.contact_id || '',
          user_id: res.data.user_id || '',
          company: res.data.company,
          contact_type: res.data.contact_type,
          title: res.data.title || '',
          first_name: res.data.first_name || '',
          middle_name: res.data.middle_name || '',
          last_name: res.data.last_name || '',
          preferred_name: res.data.preferred_name || '',
          email: res.data.email || '',
          secondary_email: res.data.secondary_email || '',
          review_frequency: res.data.review_frequency || '',
          next_review: res.data.next_review || '',
          birth_date: res.data.birth_date || '',
          gender: res.data.gender || '',
          mobile_number: res.data.mobile_number || '',
          home_number: res.data.home_number || '',
          office_number: res.data.office_number || '',
          fax_number: res.data.fax_number || '',
          home_address1: res.data.home_address1 || '',
          home_address2: res.data.home_address2 || '',
          home_city: res.data.home_city || '',
          home_postcode: res.data.home_postcode || '',
          home_state: res.data.home_state || '',
          home_country: res.data.home_country || '',
          postal_address1: res.data.postal_address1 || '',
          postal_address2: res.data.postal_address2 || '',
          postal_city: res.data.postal_city || '',
          postal_postcode: res.data.postal_postcode || '',
          postal_state: res.data.postal_state || '',
          postal_country: res.data.postal_country || '',
          office_address1: res.data.office_address1 || '',
          office_address2: res.data.office_address2 || '',
          office_city: res.data.office_city || '',
          office_postcode: res.data.office_postcode || '',
          office_state: res.data.office_state || '',
          office_country: res.data.office_country || '',
          citizenship: res.data.citizenship || '',
          marital_status: res.data.marital_status || '',
          lead_source: res.data.lead_source || '',
          date_referred: res.data.date_referred || '',
          notes: res.data.notes || '',
          photo: '',
        });
      })
      .catch((err) => {
        console.log(err);
      });
  }, [contact]);

  const saveContact = () => {
    const combinedData = {
      contactData: contactData,
    };

    axiosInstance
      .post(`/contact/add`, combinedData)
      .then((response) => {
        console.log('Contact updated successfully', response.data);
        // mutateTask(`/main/task/get/${main_task_id}`);
        notifications.show({
          title: 'Success',
          color: 'teal',
          message: 'Contact updated',
        });
      })
      .catch((error) => {
        console.error('Error updating contact', error);
        notifications.show({
          title: 'Error',
          color: 'red',
          message: 'Error updating contact',
        });
      });
  };

  return (
    <Card withBorder radius="md" bg="var(--mantine-color-body)" style={{ padding: 0, margin: 0 }}>
      <Title p="xs" order={4} className={classes.customGray}>
        {`${contactData?.first_name} ${contactData?.last_name}`}
      </Title>
      <Divider />
      <Box p="xs">
        <Paper>
          <Select
            placeholder="title"
            label="Title"
            value={contactData?.title || ''}
            data={['Mr', 'Mrs', 'Hon', 'Dr']}
            onChange={(value) => setContactData({ ...contactData, title: value })}
            clearable
            required
          />
          <TextInput
            leftSectionPointerEvents="none"
            label="First Name"
            placeholder="last name"
            value={contactData.first_name}
            onChange={(event) => setContactData({ ...contactData, first_name: event.target.value })}
          />
          <TextInput
            leftSectionPointerEvents="none"
            label="Last Name"
            placeholder="last name"
            value={contactData.last_name}
            onChange={(event) => setContactData({ ...contactData, last_name: event.target.value })}
          />
          <TextInput
            leftSectionPointerEvents="none"
            label="Preferred Name"
            placeholder="preferred name"
            value={contactData.preferred_name}
            onChange={(event) =>
              setContactData({ ...contactData, preferred_name: event.target.value })
            }
          />

          <TextInput
            leftSectionPointerEvents="none"
            label="Company"
            placeholder="company"
            value={contactData.company}
            onChange={(event) => setContactData({ ...contactData, company: event.target.value })}
          />

          <TextInput
            leftSectionPointerEvents="none"
            leftSection={icon}
            label="Email"
            placeholder="email"
            value={contactData.email}
            onChange={(event) => setContactData({ ...contactData, email: event.target.value })}
            required
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
              value={contactData.mobile_number}
              onChange={(value) => setContactData({ ...contactData, mobile_number: value })}
              required
            />
          </Paper>
          <Paper mt="sm">
            <label htmlFor="phoneInput">Home</label>
            <PhoneInput
              id="phoneInput"
              international
              defaultCountry="AU"
              initialValueFormat="national"
              value={contactData.home_number}
              onChange={(value) => setContactData({ ...contactData, home_number: value })}
              required
            />
          </Paper>
          <Paper mt="sm">
            <label htmlFor="phoneInput">Office</label>
            <PhoneInput
              id="phoneInput"
              international
              defaultCountry="AU"
              initialValueFormat="national"
              value={contactData.office_number}
              onChange={(value) => setContactData({ ...contactData, office_number: value })}
              required
            />
          </Paper>
          <Paper mt="sm">
            <label htmlFor="phoneInput">Fax</label>
            <PhoneInput
              id="phoneInput"
              international
              defaultCountry="AU"
              initialValueFormat="national"
              value={contactData.fax_number}
              onChange={(value) => setContactData({ ...contactData, fax_number: value })}
              required
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
            value={contactData.home_address1}
            onChange={(event) =>
              setContactData({ ...contactData, home_address1: event.target.value })
            }
          />
          <TextInput
            leftSectionPointerEvents="none"
            label="Street Address 2"
            placeholder="address"
            value={contactData.home_address2}
            onChange={(event) =>
              setContactData({ ...contactData, home_address2: event.target.value })
            }
          />
          <TextInput
            leftSectionPointerEvents="none"
            label="City/Town/Suburb"
            placeholder="city"
            value={contactData.home_city}
            onChange={(event) => setContactData({ ...contactData, home_city: event.target.value })}
          />
          <TextInput
            leftSectionPointerEvents="none"
            label="Postcode"
            placeholder="postcode"
            value={contactData.home_postcode}
            onChange={(event) =>
              setContactData({ ...contactData, home_postcode: event.target.value })
            }
          />

          <TextInput
            leftSectionPointerEvents="none"
            label="State/Region"
            placeholder="state"
            value={contactData.home_state}
            onChange={(event) => setContactData({ ...contactData, home_state: event.target.value })}
          />
          <TextInput
            leftSectionPointerEvents="none"
            label="Country"
            placeholder="country"
            value={contactData.home_country}
            onChange={(event) =>
              setContactData({ ...contactData, home_country: event.target.value })
            }
          />
        </Box>

        {/* postal address */}
        <Box mt="md">
          <Title order={6} className={classes.brandSection} p="xs">
            Postal Address
          </Title>
          <TextInput
            mt="sm"
            leftSectionPointerEvents="none"
            label="Street Address 1"
            placeholder="address"
            value={contactData.postal_address1}
            onChange={(event) =>
              setContactData({ ...contactData, postal_address1: event.target.value })
            }
          />
          <TextInput
            leftSectionPointerEvents="none"
            label="Street Address 2"
            placeholder="address"
            value={contactData.postal_address2}
            onChange={(event) =>
              setContactData({ ...contactData, postal_address2: event.target.value })
            }
          />
          <TextInput
            leftSectionPointerEvents="none"
            label="City/Town/Suburb"
            placeholder="city"
            value={contactData.postal_city}
            onChange={(event) =>
              setContactData({ ...contactData, postal_city: event.target.value })
            }
          />
          <TextInput
            leftSectionPointerEvents="none"
            label="Postcode"
            placeholder="postcode"
            value={contactData.postal_postcode}
            onChange={(event) =>
              setContactData({ ...contactData, postal_postcode: event.target.value })
            }
          />

          <TextInput
            leftSectionPointerEvents="none"
            label="State/Region"
            placeholder="state"
            value={contactData.postal_state}
            onChange={(event) =>
              setContactData({ ...contactData, postal_state: event.target.value })
            }
          />
          <TextInput
            leftSectionPointerEvents="none"
            label="Country"
            placeholder="country"
            value={contactData.postal_country}
            onChange={(event) =>
              setContactData({ ...contactData, postal_country: event.target.value })
            }
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
            value={contactData.office_address1}
            onChange={(event) =>
              setContactData({ ...contactData, office_address1: event.target.value })
            }
          />
          <TextInput
            leftSectionPointerEvents="none"
            label="Street Address 2"
            placeholder="address"
            value={contactData.office_address2}
            onChange={(event) =>
              setContactData({ ...contactData, office_address2: event.target.value })
            }
          />
          <TextInput
            leftSectionPointerEvents="none"
            label="City/Town/Suburb"
            placeholder="city"
            value={contactData.office_city}
            onChange={(event) =>
              setContactData({ ...contactData, office_city: event.target.value })
            }
          />
          <TextInput
            leftSectionPointerEvents="none"
            label="Postcode"
            placeholder="postcode"
            value={contactData.office_postcode}
            onChange={(event) =>
              setContactData({ ...contactData, office_postcode: event.target.value })
            }
          />

          <TextInput
            leftSectionPointerEvents="none"
            label="State/Region"
            placeholder="state"
            value={contactData.office_state}
            onChange={(event) =>
              setContactData({ ...contactData, office_state: event.target.value })
            }
          />
          <TextInput
            leftSectionPointerEvents="none"
            label="Country"
            placeholder="country"
            value={contactData.office_country}
            onChange={(event) =>
              setContactData({ ...contactData, office_country: event.target.value })
            }
          />
        </Box>

        <Flex justify="flex-end" mt="sm">
          <Button onClick={saveContact}>Save</Button>
        </Flex>
      </Box>
    </Card>
  );
}

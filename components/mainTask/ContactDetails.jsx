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
  Loader,
} from '@mantine/core';
import { IconArrowNarrowLeft, IconAt, IconChevronRight, IconTrash } from '@tabler/icons-react';
import PhoneInput, { formatPhoneNumber, formatPhoneNumberIntl } from 'react-phone-number-input';
import { useAppContext } from '@/ContextAPI/ContextAPI';
import fetcher from '@/utils/fetcher';
import useSWR from 'swr';
import classes from './Task.module.css';
import { axiosInstance, setAuthorizationToken } from '@/utils/axiosInstance';
import { notifications } from '@mantine/notifications';

export default function ContactDetails({ contactType, main_task_id }) {
  const { state, dispatch } = useAppContext();
  const { contactId, lenderId, showTabs } = state;
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState('');

  useEffect(() => {
    const access_token =
      typeof localStorage !== 'undefined'
        ? localStorage.getItem('broker_access_token') || localStorage.getItem('access_token')
        : null;

    setToken(access_token);
    setAuthorizationToken(access_token);
  }, []);

  // const brokerToken =
  //   typeof localStorage !== 'undefined' ? localStorage.getItem('broker_access_token') || '' : '';
  // brokerToken && setAuthorizationToken(brokerToken);

  const { data: contact, mutate } = useSWR([`/contact/get/${contactId}`, token], ([url, token]) =>
    fetcher(url, token)
  );

  // const { data: contact } = useSWR(`/contact/get/${contactId}`, fetcher);
  const { data, mutate: mutateTask } = useSWR(
    [`/main/task/get/${main_task_id}`, token],
    ([url, token]) => fetcher(url, token)
  );
  // const { data, mutate: mutateTask, isLoading } = useSWR(`/main/task/get/${main_task_id}`, fetcher);

  const [contactData, setContactData] = useState({
    contact_id: null,
    user_id: null,
    company: '',
    contact_type: contactType || '',
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

  console.log('contact here:', contact);

  const icon = <IconAt style={{ width: rem(16), height: rem(16) }} />;

  const handleShowTabsClick = () => {
    dispatch({ type: 'SET_SHOW_TABS', payload: !showTabs });
  };

  const contactTypes = () => {
    switch (contactType) {
      case 'referrer':
        return 'Referrer';
      case 'agent':
        return 'Agent';
      case 'solicitor':
        return 'Solicitor';
      case 'accountant':
        return 'Accountant';
      case 'third_party':
        return 'Third Party';
      case 'financial_planner':
        return 'Financial Planner';
      case 'buyers_agent':
        return "Buyer's Agent";
      case 'property_manager':
        return 'Property Manager';
      case 'building_pest_provider':
        return 'Building & Pest Provider';
      default:
        return 'Unknown Contact Type';
    }
  };

  useEffect(() => {
    axiosInstance
      .get(`/contact/get/${contactId}`)
      .then((res) => {
        console.log('data:', res.data);
        setContactData({
          contact_id: res.data.contact_id || '',
          user_id: res.data.user_id || '',
          company: res.data.company || '',
          contact_type: res.data.contact_type || contactType,
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

  const mainTaskData = () => {
    switch (contactType) {
      case 'referrer':
        return { referrer_id: contactData?.contact_id };
      case 'agent':
        return { agent_id: contactData?.contact_id };
      case 'solicitor':
        return { solicitor_id: contactData?.contact_id };
      case 'accountant':
        return { accountant_id: contactData?.contact_id };
      case 'third_party':
        return { third_party_id: contactData?.contact_id };
      case 'financial_planner':
        return { financial_planner_id: contactData?.contact_id };
      case 'buyers_agent':
        return { buyers_agent_id: contactData?.contact_id };
      case 'property_manager':
        return { property_manager_id: contactData?.contact_id };
      case 'building_pest_provider':
        return { building_pest_provider_id: contactData?.contact_id };
      default:
        return 'Unknown Contact Type';
    }
  };

  const saveContact = () => {
    setLoading(true);
    const combinedData = {
      contactData: contactData,
      mainTaskData: mainTaskData(),
      main_task_id,
      contactType: contactType,
    };

    axiosInstance
      .post(`/contact/add`, combinedData)
      .then((response) => {
        console.log('Contact updated successfully', response.data);
        mutateTask(`/main/task/get/${main_task_id}`);
        setLoading(false);
        notifications.show({
          title: 'Success',
          color: 'teal',
          message: 'Contact saved',
        });
      })
      .catch((error) => {
        console.error('Error updating contact', error);
        setLoading(false);
        notifications.show({
          title: 'Error',
          color: 'red',
          message: 'Error saving contact',
        });
      });
  };

  return (
    <div>
      <Flex
        onClick={handleShowTabsClick}
        justify="flex-start"
        align="center"
        style={{ color: '#0275d8', cursor: 'pointer' }}
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
      <Card withBorder radius="md" bg="var(--mantine-color-body)" style={{ padding: 0, margin: 0 }}>
        <Title p="xs" order={4} className={classes.customGray}>
          {`${contactTypes()} Details`}
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
              onChange={(event) =>
                setContactData({ ...contactData, first_name: event.target.value })
              }
            />
            <TextInput
              leftSectionPointerEvents="none"
              label="Last Name"
              placeholder="last name"
              value={contactData.last_name}
              onChange={(event) =>
                setContactData({ ...contactData, last_name: event.target.value })
              }
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
              onChange={(event) =>
                setContactData({ ...contactData, home_city: event.target.value })
              }
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
              onChange={(event) =>
                setContactData({ ...contactData, home_state: event.target.value })
              }
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
            <Button disabled={loading} onClick={saveContact}>
              {loading ? <Loader size="sm" color="white" /> : 'Save'}
            </Button>
          </Flex>
        </Box>
      </Card>
    </div>
  );
}

import React, { Fragment, useState, useEffect } from 'react';
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
import { useAppContext } from '@/ContextAPI/ContextAPI';
import classes from './Task.module.css';
import fetcher from '@/utils/fetcher';
import useSWR from 'swr';
import { useDisclosure } from '@mantine/hooks';
import PhoneInput from 'react-phone-number-input';
import { axiosInstance, setAuthorizationToken } from '@/utils/axiosInstance';
import { notifications } from '@mantine/notifications';
import { useParams } from 'next/navigation';

export default function BrokerDetails() {
  const { state, dispatch } = useAppContext();
  const { contactId, lenderId, showTabs } = state;
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState('');
  const { task_id } = useParams();

  const [selectedLender, setSelectedLender] = useState();
  const [selectedBroker, setSelectedBroker] = useState();

  useEffect(() => {
    const access_token =
      typeof localStorage !== 'undefined' ? localStorage.getItem('broker_access_token') : null;

    setToken(access_token);
    setAuthorizationToken(access_token);
  }, []);

  const { data: users } = useSWR([`/user/users`, token], ([url, token]) => fetcher(url, token));

  const { data: broker, mutate: mutateBroker } = useSWR(
    [`/user/broker/${contactId}`, token],
    ([url, token]) => fetcher(url, token)
  );

  const { data: lenders } = useSWR(['/lender/all', token], ([url, token]) => fetcher(url, token));
  const { mutate: mutateTask } = useSWR([`/main/task/get/${task_id}`, token], ([url, token]) =>
    fetcher(url, token)
  );
  console.log('broker:', broker);

  const [opened, { toggle }] = useDisclosure(true);
  const [openBrand, { toggle: toggleBrand }] = useDisclosure(false);
  const [openAdress, { toggle: toggleAddress }] = useDisclosure(false);
  const [openCerts, { toggle: toggleCerts }] = useDisclosure(false);
  const [phone, setPhone] = useState('');
  const [certsData, setCertsData] = useState([{ label: '', doc: null }]);
  const [sectionsData, setSectionsData] = useState([
    {
      brand_id: broker?.brands ? broker?.brands[0]?.brand_id : '',
      name: '',
      email: '',
      phone: phone,
      website: '',
      street_address1: '',
      street_address2: '',
      city: '',
      postcode: '',
      state: '',
      country: '',
      calendar_url: '',
      logo: null,
      profile_brochure: null,
      profile: '',
      email_signature: '',
    },
  ]);
  const [addresses, setAddresses] = useState({
    address_id: '',
    user_id: '',
    office_street_address1: '',
    office_street_address2: '',
    office_city: '',
    office_postcode: '',
    office_state: '',
    office_country: '',
    postal_street_address1: '',
    postal_street_address2: '',
    postal_city: '',
    postal_postcode: '',
    postal_state: '',
    postal_country: '',
  });

  const [brokerDetails, setBrokerDetails] = useState({
    user_id: broker?.user?.user_id || '',
    email: broker?.user?.email || '',
    title: broker?.user?.title || '',
    first_name: broker?.user?.first_name || '',
    last_name: broker?.user?.last_name || '',
    preferred_name: broker?.user?.preferred_name || '',
    company: broker?.user?.company || '',
    mobile: broker?.user?.mobile || '',
    office_contact: broker?.user?.office_contact || '',
    fax_contact: broker?.user?.fax_contact || '',
  });

  const icon = <IconAt style={{ width: rem(16), height: rem(16) }} />;

  const handleShowTabsClick = () => {
    dispatch({ type: 'SET_SHOW_TABS', payload: !showTabs });
  };

  // certificates start
  const handleRemoveCert = (index) => {
    setCertsData((prevFieldData) => {
      const newFieldData = [...prevFieldData];
      newFieldData.splice(index, 1);
      return newFieldData;
    });
  };

  const handleAddNewCert = () => {
    setCertsData((prevFieldData) => [...prevFieldData, { label: '', image: null }]);
  };

  const handleCertFieldChange = (index, field, value) => {
    setCertsData((prevFieldData) => {
      const newFieldData = [...prevFieldData];
      newFieldData[index][field] = value;
      return newFieldData;
    });
  };

  const handleCertDocChange = (index, doc) => {
    setCertsData((prevFieldData) => {
      const newFieldData = [...prevFieldData];
      newFieldData[index].doc = doc;
      return newFieldData;
    });
  };
  // certs end

  const handleFieldChange = (sectionIndex, fieldName, event) => {
    const value = event?.target?.value;

    if (value !== undefined) {
      setSectionsData((prevData) => {
        const newData = [...prevData];
        newData[sectionIndex][fieldName] = value;
        return newData;
      });
    }
  };

  const handleFileChange = (sectionIndex, fieldName, file) => {
    setSectionsData((prevData) => {
      const newData = [...prevData];
      newData[sectionIndex][fieldName] = file;
      return newData;
    });
  };

  const renderCertFields = () => {
    return certsData.map((fields, index) => (
      <Paper key={index}>
        <Flex mt="sm" justify="space-between" align="center" p={5} className={classes.brandSection}>
          <Title order={6} className={classes.customGray}>{`Document ${index + 1}`}</Title>
          <IconTrash
            style={{
              width: rem(16),
              height: rem(16),
              marginLeft: '5px',
              cursor: 'pointer',
            }}
            stroke={1.5}
            onClick={() => handleRemoveCert(index)}
          />
        </Flex>
        <TextInput
          leftSectionPointerEvents="none"
          label="Label"
          placeholder="Document label"
          value={fields.label}
          onChange={(value) => handleCertFieldChange(index, 'label', value)}
        />
        <FileInput
          label="Document"
          placeholder="Click to upload"
          onChange={(doc) => handleCertDocChange(index, doc)}
          required
        />
      </Paper>
    ));
  };

  const renderBrands = () => {
    return sectionsData.map((section, sectionIndex) => (
      <Paper mt="md" key={sectionIndex}>
        <TextInput
          label="Name"
          placeholder="Name"
          value={section.name || broker?.brands?.name}
          onChange={(value) => handleFieldChange(sectionIndex, 'name', value)}
          required
        />
        <TextInput
          leftSectionPointerEvents="none"
          leftSection={icon}
          label="Email"
          placeholder="email"
          value={section.email || broker?.brands?.email}
          onChange={(value) => handleFieldChange(sectionIndex, 'email', value)}
          required
        />
        <Paper mt="sm">
          <label htmlFor="phoneInput">Mobile</label>
          <PhoneInput
            id="phoneInput"
            international
            defaultCountry="AU"
            initialValueFormat="national"
            value={phone || broker?.brands?.phone}
            onChange={setPhone}
            required
          />
        </Paper>
        <TextInput
          leftSectionPointerEvents="none"
          label="Website"
          placeholder="website url"
          value={section.website || broker?.brands?.website}
          onChange={(value) => handleFieldChange(sectionIndex, 'website', value)}
        />
        <TextInput
          leftSectionPointerEvents="none"
          label="Street Address 1"
          placeholder="address"
          value={section.street_address1 || broker?.brands?.street_address1}
          onChange={(value) => handleFieldChange(sectionIndex, 'street_address1', value)}
        />
        <TextInput
          leftSectionPointerEvents="none"
          label="Street Address 2"
          placeholder="address"
          value={section.street_address2 || broker?.brands?.street_address2}
          onChange={(value) => handleFieldChange(sectionIndex, 'street_address2', value)}
        />
        <TextInput
          leftSectionPointerEvents="none"
          label="City/Town/Suburb"
          placeholder="city/town/suburb"
          value={section.city || broker?.brands?.city}
          onChange={(value) => handleFieldChange(sectionIndex, 'city', value)}
        />
        <TextInput
          leftSectionPointerEvents="none"
          label="Postcode"
          placeholder="postcode"
          value={section.postcode || broker?.brands?.postcode}
          onChange={(value) => handleFieldChange(sectionIndex, 'postcode', value)}
        />
        <TextInput
          leftSectionPointerEvents="none"
          label="State/Region"
          placeholder="state/region"
          value={section.state || broker?.brands?.state}
          onChange={(value) => handleFieldChange(sectionIndex, 'state', value)}
        />

        <TextInput
          leftSectionPointerEvents="none"
          label="Country"
          placeholder="country"
          value={section.country || broker?.brands?.country}
          onChange={(value) => handleFieldChange(sectionIndex, 'country', value)}
        />
        <TextInput
          leftSectionPointerEvents="none"
          label="Online Calender"
          placeholder="calendar url"
          value={section.calendar_url || broker?.brands?.calendar_url}
          onChange={(value) => handleFieldChange(sectionIndex, 'calendar_url', value)}
        />
        <FileInput
          label="Logo"
          description="Brand logo"
          placeholder="Upload brand logo"
          onChange={(file) => handleFileChange(sectionIndex, 'logo', file)}
        />
        <FileInput
          label="Profile Bronchure"
          description="profile bronchure"
          placeholder="Upload bronchure"
          onChange={(file) => handleFileChange(sectionIndex, 'profile_brochure', file)}
        />
        <Textarea
          label="Profile"
          placeholder="Write something.."
          value={section.profile || broker?.brands?.profile}
          onChange={(value) => handleFieldChange(sectionIndex, 'profile', value)}
        />
        <TextInput
          leftSectionPointerEvents="none"
          label="Email Signature"
          placeholder="email signature"
          value={section.email_signature || broker?.brands?.email_signature}
          onChange={(value) => handleFieldChange(sectionIndex, 'email_signature', value)}
        />
      </Paper>
    ));
  };

  const saveBrands = () => {
    const allData = sectionsData.map((section, sectionIndex) => ({ ...section }));

    const formData = new FormData();
    allData.forEach((file, index) => {
      formData.append('brand_id', file.brand_id || broker?.brands?.brand_id);
      formData.append(
        'profile_brochure',
        file.profile_brochure || broker?.brands?.profile_brochure
      );
      formData.append('logo', file.logo || broker?.brands?.logo);
      formData.append('calendar_url', file.calendar_url || broker?.brands?.calendar_url);
      formData.append('city', file.city || broker?.brands?.city);
      formData.append('country', file.country || broker?.brands?.country);
      formData.append('email', file.email || broker?.brands?.email);
      formData.append('email_signature', file.email_signature || broker?.brands?.email_signature);
      formData.append('name', file.name || broker?.brands?.name);
      formData.append('phone', phone || broker?.brands?.phone);
      formData.append('postcode', file.postcode || broker?.brands?.postcode);
      formData.append('profile', file.profile || broker?.brands?.profile);
      formData.append('state', file.state || broker?.brands?.state);
      formData.append('street_address1', file.street_address1 || broker?.brands?.street_address1);
      formData.append('street_address2', file.street_address2 || broker?.brands?.street_address2);
      formData.append('website', file.website || broker?.brands?.website);
    });

    // Assuming `axios` for sending the data to the server
    setLoading(true);
    axiosInstance
      .post(`/user/broker-brand/${contactId}`, formData)
      .then((response) => {
        console.log('Upload successful', response.data);
        setLoading(false);
        notifications.show({
          title: 'Success',
          color: 'teal',
          message: 'Brand details updated',
        });
      })
      .catch((error) => {
        console.error('Error uploading files', error);
        setLoading(false);
        notifications.show({
          title: 'Error',
          color: 'red',
          message: 'Error updating brand',
        });
      });
  };

  const saveBroker = () => {
    setLoading(true);
    axiosInstance
      .put(`/user/update/broker/${contactId}`, brokerDetails)
      .then((response) => {
        setLoading(false);
        mutateBroker(`/user/update/broker/${contactId}`, false);
        notifications.show({
          title: 'Success',
          color: 'teal',
          message: 'Broker details updated',
        });
      })
      .catch((error) => {
        setLoading(false);
        notifications.show({
          title: 'Error',
          color: 'red',
          message: 'Error updating broker',
        });
      });
  };

  const saveAddresses = () => {
    setLoading(true);
    axiosInstance
      .post(`/user/addresses/${contactId}`, addresses)
      .then((response) => {
        console.log('Addresse updated successfully', response.data);
        setLoading(false);
        mutateBroker(`/user/update/broker/${contactId}`, false);
        notifications.show({
          title: 'Success',
          color: 'teal',
          message: 'Address updated',
        });
      })
      .catch((error) => {
        console.error('Error updating address', error);
        setLoading(false);
        notifications.show({
          title: 'Error',
          color: 'red',
          message: 'Error saving address',
        });
      });
  };

  useEffect(() => {
    if (broker) {
      setAddresses({
        address_id: broker?.addresses?.address_id,
        user_id: broker?.addresses?.user_id,
        office_street_address1: broker?.addresses?.office_street_address1,
        office_street_address2: broker?.addresses?.office_street_address2,
        office_city: broker?.addresses?.office_city,
        office_postcode: broker?.addresses?.office_postcode,
        office_state: broker?.addresses?.office_state,
        office_country: broker?.addresses?.office_country,
        postal_street_address1: broker?.addresses?.postal_street_address1,
        postal_street_address2: broker?.addresses?.postal_street_address2,
        postal_city: broker?.addresses?.postal_city,
        postal_postcode: broker?.addresses?.postal_postcode,
        postal_state: broker?.addresses?.postal_state,
        postal_country: broker?.addresses?.postal_country,
      });

      setBrokerDetails({
        user_id: broker?.user?.user_id,
        email: broker?.user?.email,
        title: broker?.user?.title,
        first_name: broker?.user?.first_name,
        last_name: broker?.user?.last_name,
        preferred_name: broker?.user?.preferred_name,
        company: broker?.user?.company,
        mobile: broker?.user?.mobile,
        office_contact: broker?.user?.office_contact,
        fax_contact: broker?.user?.fax_contact,
      });
    }
  }, [broker]);

  const updateMainTaskLender = (lender_id) => {
    setSelectedLender(lender_id);
    axiosInstance
      .put(`/main/task/update/${task_id}`, { lender_id: parseInt(lender_id) })
      .then((res) => {
        mutateTask(`/main/task/get/${task_id}`);
        notifications.show({
          title: 'Success',
          color: 'teal',
          message: 'Lender updated successfully!',
        });
      })
      .catch((err) => {
        console.log('error:', err);
        notifications.show({
          title: 'Error',
          color: 'red',
          message: 'Error changing broker',
        });
      });
  };

  const updateMainTaskBroker = (broker_id) => {
    setSelectedBroker(broker_id);
    axiosInstance
      .put(`/main/task/update/${task_id}`, { broker_id: parseInt(broker_id) })
      .then((res) => {
        mutateTask(`/main/task/get/${task_id}`);
        notifications.show({
          title: 'Success',
          color: 'teal',
          message: 'Broker changed successfully!',
        });
      })
      .catch((err) => {
        console.log('error:', err);
        notifications.show({
          title: 'Error',
          color: 'red',
          message: 'Error changing broker',
        });
      });
  };

  return (
    <Box>
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
      <Card
        withBorder
        radius="md"
        mt="sm"
        bg="var(--mantine-color-body)"
        style={{ padding: 0, margin: 0 }}
      >
        <Title p="md" className={classes.customGray} order={5}>
          Broker Details
        </Title>
        <Divider />

        <Box mt="sm" p="sm">
          <Select
            placeholder="Choose broker"
            label="Broker"
            value={selectedBroker ? selectedBroker.toString() : contactId.toString()}
            data={users?.map((user) => ({
              value: user.user_id.toString(),
              label: `${user.first_name} ${user.last_name}`,
            }))}
            clearable
            required
            onChange={(_value, option) => updateMainTaskBroker(_value)}
          />

          <Select
            placeholder="choose lender"
            label="Lender"
            value={selectedLender ? selectedLender?.toString() : lenderId?.toString()}
            data={lenders?.lenders?.map((lender) => ({
              value: lender.lender_id.toString(),
              label: lender.lender_name,
            }))}
            clearable
            required
            onChange={(_value, option) => updateMainTaskLender(_value)}
          />

          {/* <Select
            placeholder="broker brand"
            label="Default Broker Brand"
            data={['React', 'Angular', 'Vue', 'Svelte']}
            clearable
            required
          /> */}

          {/* contacts details */}
          <Paper>
            <Flex justify="space-between" onClick={toggle} mt="md">
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
                  Contact Details
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
            <Collapse in={opened} mt="xs">
              <Select
                placeholder="title"
                label="Title"
                value={brokerDetails.title || broker?.user?.title}
                onChange={(value) => setBrokerDetails({ ...brokerDetails, title: value })}
                data={['Mr', 'Mrs', 'Hon', 'Dr']}
                clearable
                required
              />
              <TextInput
                leftSectionPointerEvents="none"
                label="First Name"
                value={brokerDetails.first_name || broker?.user?.first_name}
                onChange={(event) =>
                  setBrokerDetails({ ...brokerDetails, first_name: event.target.value })
                }
                placeholder="first name"
                required
              />
              <TextInput
                leftSectionPointerEvents="none"
                label="Last Name"
                value={brokerDetails.last_name || broker?.user?.last_name}
                onChange={(event) =>
                  setBrokerDetails({ ...brokerDetails, last_name: event.target.value })
                }
                placeholder="last name"
                required
              />
              <TextInput
                leftSectionPointerEvents="none"
                label="Preferred Name"
                value={brokerDetails.preferred_name || broker?.user?.preferred_name}
                onChange={(event) =>
                  setBrokerDetails({ ...brokerDetails, preferred_name: event.target.value })
                }
                placeholder="preferred name"
              />
              <TextInput
                leftSectionPointerEvents="none"
                label="Company"
                value={brokerDetails.company || broker?.user?.company}
                onChange={(event) =>
                  setBrokerDetails({ ...brokerDetails, company: event.target.value })
                }
                placeholder="Company"
              />

              <TextInput
                leftSectionPointerEvents="none"
                leftSection={icon}
                value={brokerDetails.email || broker?.user?.email}
                onChange={(event) =>
                  setBrokerDetails({ ...brokerDetails, email: event.target.value })
                }
                label="Email"
                placeholder="email"
                required
              />

              <Paper mt="sm">
                <label htmlFor="phoneInput">Mobile</label>
                <PhoneInput
                  id="phoneInput"
                  international
                  defaultCountry="AU"
                  initialValueFormat="national"
                  value={brokerDetails.mobile || broker?.user?.mobile}
                  onChange={(value) => setBrokerDetails({ ...brokerDetails, mobile: value })}
                  required
                />
              </Paper>
              <Paper mt="sm">
                <label htmlFor="officeInput">Office</label>
                <PhoneInput
                  id="officeInput"
                  international
                  defaultCountry="AU"
                  initialValueFormat="national"
                  value={brokerDetails.office_contact || broker?.user?.office_contact}
                  onChange={(value) =>
                    setBrokerDetails({ ...brokerDetails, office_contact: value })
                  }
                  required
                />
              </Paper>
              <Paper mt="sm">
                <label htmlFor="faxInput">fax</label>
                <PhoneInput
                  id="faxInput"
                  international
                  defaultCountry="AU"
                  initialValueFormat="national"
                  value={brokerDetails.fax_contact || broker?.user?.fax_contact}
                  onChange={(value) => setBrokerDetails({ ...brokerDetails, fax_contact: value })}
                  required
                />
              </Paper>

              <Flex justify="flex-end" mt="sm" gap="xs">
                <Button onClick={saveBroker} disabled={loading}>
                  {loading ? <Loader color="white" size="sm" /> : 'Save'}
                </Button>
              </Flex>
            </Collapse>
          </Paper>

          {/* brands */}
          <Paper>
            <Flex justify="space-between" onClick={toggleBrand} mt="md">
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
                  Brands
                </Text>
              </Paper>
              <IconChevronRight
                stroke={1.5}
                style={{
                  width: rem(16),
                  height: rem(16),
                  cursor: 'pointer',
                  transform: openBrand ? 'rotate(-90deg)' : 'none',
                }}
              />
            </Flex>
            <Collapse in={openBrand} mt="xs">
              {renderBrands()}

              <Flex justify="flex-end" mt="sm" gap="xs">
                {/* <Button onClick={handleAddSection}>Add New</Button> */}
                <Button onClick={saveBrands} disabled={loading}>
                  {loading ? <Loader color="white" size="sm" /> : 'Save'}
                </Button>
              </Flex>
            </Collapse>
          </Paper>

          {/* brand certificates */}
          <Paper>
            <Flex justify="space-between" onClick={toggleCerts} mt="md">
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
                  Brand Certificates
                </Text>
              </Paper>
              <IconChevronRight
                stroke={1.5}
                style={{
                  width: rem(16),
                  height: rem(16),
                  cursor: 'pointer',
                  transform: openBrand ? 'rotate(-90deg)' : 'none',
                }}
              />
            </Flex>
            <Collapse in={openCerts} mt="xs">
              {renderCertFields()}
              <Flex justify="flex-end" mt="md">
                <Button onClick={handleAddNewCert}>Add New</Button>
              </Flex>
            </Collapse>
          </Paper>

          {/* addresses */}
          <Paper>
            <Flex justify="space-between" onClick={toggleAddress} mt="md">
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
                  Addresses
                </Text>
              </Paper>
              <IconChevronRight
                stroke={1.5}
                style={{
                  width: rem(16),
                  height: rem(16),
                  cursor: 'pointer',
                  transform: openBrand ? 'rotate(-90deg)' : 'none',
                }}
              />
            </Flex>
            <Collapse in={openAdress} mt="xs">
              <Box mt="md">
                <Title order={6} className={classes.brandSection} p="xs">
                  Office Address
                </Title>
                <TextInput
                  mt="sm"
                  leftSectionPointerEvents="none"
                  label="Street Address 1"
                  placeholder="address"
                  value={
                    addresses.office_street_address1 || broker?.addresses?.office_street_address1
                  }
                  onChange={(event) =>
                    setAddresses({ ...addresses, office_street_address1: event.target.value })
                  }
                />
                <TextInput
                  leftSectionPointerEvents="none"
                  label="Street Address 2"
                  placeholder="address"
                  value={
                    addresses.office_street_address2 || broker?.addresses?.office_street_address2
                  }
                  onChange={(event) =>
                    setAddresses({ ...addresses, office_street_address2: event.target.value })
                  }
                />
                <TextInput
                  leftSectionPointerEvents="none"
                  label="City/Town/Suburb"
                  placeholder="city"
                  value={addresses.office_city || broker?.addresses?.office_city}
                  onChange={(event) =>
                    setAddresses({ ...addresses, office_city: event.target.value })
                  }
                />
                <TextInput
                  leftSectionPointerEvents="none"
                  label="Postcode"
                  placeholder="postcode"
                  value={addresses.office_postcode || broker?.addresses?.office_postcode}
                  onChange={(event) =>
                    setAddresses({ ...addresses, office_postcode: event.target.value })
                  }
                />

                <TextInput
                  leftSectionPointerEvents="none"
                  label="State/Region"
                  placeholder="state"
                  value={addresses.office_state || broker?.addresses?.office_state}
                  onChange={(event) =>
                    setAddresses({ ...addresses, office_state: event.target.value })
                  }
                />
                <TextInput
                  leftSectionPointerEvents="none"
                  label="Country"
                  placeholder="country"
                  value={addresses.office_country || broker?.addresses?.office_country}
                  onChange={(event) =>
                    setAddresses({ ...addresses, office_country: event.target.value })
                  }
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
                  value={
                    addresses.postal_street_address1 || broker?.addresses?.postal_street_address1
                  }
                  onChange={(event) =>
                    setAddresses({ ...addresses, postal_street_address1: event.target.value })
                  }
                />
                <TextInput
                  leftSectionPointerEvents="none"
                  label="Street Address 2"
                  placeholder="address"
                  value={
                    addresses.postal_street_address2 || broker?.addresses?.postal_street_address2
                  }
                  onChange={(event) =>
                    setAddresses({ ...addresses, postal_street_address2: event.target.value })
                  }
                />
                <TextInput
                  leftSectionPointerEvents="none"
                  label="City/Town/Suburb"
                  placeholder="city"
                  value={addresses.postal_city || broker?.addresses?.postal_city}
                  onChange={(event) =>
                    setAddresses({ ...addresses, postal_city: event.target.value })
                  }
                />
                <TextInput
                  leftSectionPointerEvents="none"
                  label="Postcode"
                  placeholder="postcode"
                  value={addresses.postal_postcode || broker?.addresses?.postal_postcode}
                  onChange={(event) =>
                    setAddresses({ ...addresses, postal_postcode: event.target.value })
                  }
                />

                <TextInput
                  leftSectionPointerEvents="none"
                  label="State/Region"
                  placeholder="state"
                  value={addresses.postal_state || broker?.addresses?.postal_state}
                  onChange={(event) =>
                    setAddresses({ ...addresses, postal_state: event.target.value })
                  }
                />
                <TextInput
                  leftSectionPointerEvents="none"
                  label="Country"
                  placeholder="country"
                  value={addresses.postal_country || broker?.addresses?.postal_country}
                  onChange={(event) =>
                    setAddresses({ ...addresses, postal_country: event.target.value })
                  }
                />
              </Box>
              <Flex justify="flex-end" mt="sm" gap="xs">
                <Button onClick={saveAddresses} disabled={loading}>
                  {' '}
                  {loading ? <Loader color="white" size="sm" /> : 'Save'}
                </Button>
              </Flex>
            </Collapse>
          </Paper>
        </Box>
      </Card>
    </Box>
  );
}

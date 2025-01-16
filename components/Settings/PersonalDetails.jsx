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
import classes from '../../components/mainTask/Task.module.css';
import fetcher from '@/utils/fetcher';
import useSWR from 'swr';
import { useDisclosure } from '@mantine/hooks';
import PhoneInput, { formatPhoneNumber, formatPhoneNumberIntl } from 'react-phone-number-input';
import { axiosInstance, setAuthorizationToken } from '@/utils/axiosInstance';
import { notifications } from '@mantine/notifications';

export default function PersonalDetails() {
  const { data: user, mutate: mutateUser } = useSWR('/user', fetcher);
  const [loading, setLoading] = useState(false);

  const [opened, { toggle }] = useDisclosure(true);
  const [openBrand, { toggle: toggleBrand }] = useDisclosure(false);
  const [openAdress, { toggle: toggleAddress }] = useDisclosure(false);
  const [openCerts, { toggle: toggleCerts }] = useDisclosure(false);
  const [phone, setPhone] = useState('');
  const [certsData, setCertsData] = useState([{ label: '', doc: null }]);
  const [brands, setBrands] = useState({
    brand_id: '',
    calendar_url: '',
    city: '',
    country: '',
    email: '',
    email_signature: '',
    logo: '',
    name: '',
    phone: '',
    postcode: '',
    profile: '',
    profile_brochure: '',
    state: '',
    street_address1: '',
    street_address2: '',
    user_id: '',
    website: '',
  });
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

  const [userDetails, setUserDetails] = useState({
    user_id: null,
    email: '',
    title: '',
    first_name: '',
    last_name: '',
    preferred_name: '',
    company: '',
    mobile: '',
    office_contact: '',
    fax_contact: '',
    is_admin: null,
    is_broker: null,
    report_signature: '',
    email_signature: '',
    advice_signature: '',
    profile_photo: '',
  });

  const icon = <IconAt style={{ width: rem(16), height: rem(16) }} />;

  // certificates start
  const handleRemoveCert = (index) => {
    setCertsData((prevFieldData) => {
      const newFieldData = [...prevFieldData];
      newFieldData.splice(index, 1); // Remove the set at the specified index
      return newFieldData;
    });
  };

  const handleAddNewCert = () => {
    setCertsData((prevFieldData) => [
      ...prevFieldData,
      { label: '', image: null }, // Add a new set of fields
    ]);
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

  const handleFileChange = (sectionIndex, fieldName, file) => {
    setBrands((prevData) => {
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
    return (
      <Paper mt="md">
        <TextInput
          label="Name"
          placeholder="Name"
          value={brands?.name}
          onChange={(event) => setBrands({ ...brands, name: event.target.value })}
          required
        />
        <TextInput
          leftSectionPointerEvents="none"
          leftSection={icon}
          label="Email"
          placeholder="email"
          value={brands?.email}
          onChange={(event) => setBrands({ ...brands, email: event.target.value })}
          required
        />
        <Paper mt="sm">
          <label htmlFor="phoneInput">Mobile</label>
          <PhoneInput
            id="phoneInput"
            international
            defaultCountry="AU"
            initialValueFormat="national"
            value={brands?.phone}
            onChange={setPhone}
            required
          />
        </Paper>
        <TextInput
          leftSectionPointerEvents="none"
          label="Website"
          placeholder="website url"
          value={brands?.website}
          onChange={(event) => setBrands({ ...brands, website: event.target.value })}
        />
        <TextInput
          leftSectionPointerEvents="none"
          label="Street Address 1"
          placeholder="address"
          value={brands?.street_address1}
          onChange={(event) => setBrands({ ...brands, street_address1: event.target.value })}
        />
        <TextInput
          leftSectionPointerEvents="none"
          label="Street Address 2"
          placeholder="address"
          value={brands?.street_address2}
          onChange={(event) => setBrands({ ...brands, street_address2: event.target.value })}
        />
        <TextInput
          leftSectionPointerEvents="none"
          label="City/Town/Suburb"
          placeholder="city/town/suburb"
          value={brands?.city}
          onChange={(event) => setBrands({ ...brands, city: event.target.value })}
        />
        <TextInput
          leftSectionPointerEvents="none"
          label="Postcode"
          placeholder="postcode"
          value={brands?.postcode}
          onChange={(event) => setBrands({ ...brands, postcode: event.target.value })}
        />
        <TextInput
          leftSectionPointerEvents="none"
          label="State/Region"
          placeholder="state/region"
          value={brands?.state}
          onChange={(event) => setBrands({ ...brands, state: event.target.value })}
        />

        <TextInput
          leftSectionPointerEvents="none"
          label="Country"
          placeholder="country"
          value={brands?.country}
          onChange={(event) => setBrands({ ...brands, country: event.target.value })}
        />
        <TextInput
          leftSectionPointerEvents="none"
          label="Online Calender"
          placeholder="calendar url"
          value={brands?.calendar_url}
          onChange={(event) => setBrands({ ...brands, calendar_url: event.target.value })}
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
          value={brands?.profile}
          onChange={(event) => setBrands({ ...brands, profile: event.target.value })}
        />
        <TextInput
          leftSectionPointerEvents="none"
          label="Email Signature"
          placeholder="email signature"
          value={brands?.email_signature}
          onChange={(event) => setBrands({ ...brands, email_signature: event.target.value })}
        />
      </Paper>
    );
  };

  const saveBrands = () => {
    setLoading(true);
    // Collect all data from sections
    const formData = new FormData();

    formData.append('brand_id', brands?.brand_id);
    formData.append('profile_brochure', brands?.profile_brochure);
    formData.append('logo', brands?.logo);
    formData.append('calendar_url', brands?.calendar_url);
    formData.append('city', brands?.city);
    formData.append('country', brands?.country);
    formData.append('email', brands?.email);
    formData.append('email_signature', brands?.email_signature);
    formData.append('name', brands?.name);
    formData.append('phone', phone || brands?.phone);
    formData.append('postcode', brands?.postcode);
    formData.append('profile', brands?.profile);
    formData.append('state', brands?.state);
    formData.append('street_address1', brands?.street_address1);
    formData.append('street_address2', brands?.street_address2);
    formData.append('website', brands?.website);

    // Assuming `axios` for sending the data to the server
    axiosInstance
      .post(`/user/broker-brand/${user?.user?.user_id}`, formData)
      .then((response) => {
        setLoading(false);
        notifications.show({
          title: 'Success',
          color: 'teal',
          message: 'brands updated',
        });
      })
      .catch((error) => {
        setLoading(false);
        notifications.show({
          title: 'Error',
          color: 'red',
          message: 'Error updating brands',
        });
      });
  };

  const saveBroker = () => {
    setLoading(true);
    axiosInstance
      .put(`/user/update/broker/${user?.user?.user_id}`, userDetails)
      .then((response) => {
        setLoading(false);
        notifications.show({
          title: 'Success',
          color: 'teal',
          message: 'Details Updated!',
        });
      })
      .catch((error) => {
        setLoading(false);
        notifications.show({
          title: 'Error',
          color: 'red',
          message: 'Error updating details',
        });
      });
  };

  const saveAddresses = () => {
    setLoading(true);
    axiosInstance
      .post(`/user/addresses/${user?.user?.user_id}`, addresses)
      .then((response) => {
        setLoading(false);
        notifications.show({
          title: 'Success',
          color: 'teal',
          message: 'Address updated',
        });
      })
      .catch((error) => {
        setLoading(false);
        notifications.show({
          title: 'Error',
          color: 'red',
          message: 'Error updating address',
        });
      });
  };

  useEffect(() => {
    if (user) {
      setAddresses({
        address_id: user?.addresses?.[0]?.address_id,
        user_id: user?.addresses?.[0]?.user_id,
        office_street_address1: user?.addresses?.[0]?.office_street_address1,
        office_street_address2: user?.addresses?.[0]?.office_street_address2,
        office_city: user?.addresses?.[0]?.office_city,
        office_postcode: user?.addresses?.[0]?.office_postcode,
        office_state: user?.addresses?.[0]?.office_state,
        office_country: user?.addresses?.[0]?.office_country,
        postal_street_address1: user?.addresses?.[0]?.postal_street_address1,
        postal_street_address2: user?.addresses?.[0]?.postal_street_address2,
        postal_city: user?.addresses?.[0]?.postal_city,
        postal_postcode: user?.addresses?.[0]?.postal_postcode,
        postal_state: user?.addresses?.[0]?.postal_state,
        postal_country: user?.addresses?.[0]?.postal_country,
      });

      setUserDetails({
        user_id: user?.user?.user_id || null,
        email: user?.user?.email || '',
        title: user?.user?.title || '',
        first_name: user?.user?.first_name || '',
        last_name: user?.user?.last_name || '',
        preferred_name: user?.user?.preferred_name || '',
        company: user?.user?.company || '',
        mobile: user?.user?.mobile || '',
        office_contact: user?.user?.office_contact || '',
        fax_contact: user?.user?.fax_contact || '',
        is_admin: user?.user?.is_admin,
        is_broker: user?.user?.is_broker,
        report_signature: user?.user?.report_signature || '',
        email_signature: user?.user?.email_signature || '',
        advice_signature: user?.user?.advice_signature || '',
        profile_photo: user?.user?.profile_photo || '',
      });

      setBrands({
        brand_id: user.brands?.[0].brand_id || '',
        calendar_url: user.brands?.[0].calendar_url || '',
        city: user.brands?.[0].city || '',
        country: user.brands?.[0].country || '',
        email: user.brands?.[0].email || '',
        email_signature: user.brands?.[0].email_signature || '',
        logo: user.brands?.[0].logo || '',
        name: user.brands?.[0].name || '',
        phone: user.brands?.[0].phone || '',
        postcode: user.brands?.[0].postcode || '',
        profile: user.brands?.[0].profile || '',
        profile_brochure: user.brands?.[0].profile_brochure || '',
        state: user.brands?.[0].state || '',
        street_address1: user.brands?.[0].street_address1 || '',
        street_address2: user.brands?.[0].street_address2 || '',
        user_id: user.brands?.[0].user_id || '',
        website: user.brands?.[0].website || '',
      });
    }
  }, [user]);

  return (
    <Box>
      <Card withBorder radius="md" bg="var(--mantine-color-body)" style={{ padding: 0, margin: 0 }}>
        <Title p="md" className={classes.customGray} order={4}>
          Personal Details
        </Title>
        <Divider />

        <Box p="sm">
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
                value={userDetails.title}
                onChange={(value) => setUserDetails({ ...userDetails, title: value })}
                data={['Mr', 'Mrs', 'Hon', 'Dr']}
                clearable
                required
              />
              <TextInput
                leftSectionPointerEvents="none"
                label="First Name"
                value={userDetails.first_name}
                onChange={(event) =>
                  setUserDetails({ ...userDetails, first_name: event.target.value })
                }
                placeholder="first name"
                required
              />
              <TextInput
                leftSectionPointerEvents="none"
                label="Last Name"
                value={userDetails.last_name}
                onChange={(event) =>
                  setUserDetails({ ...userDetails, last_name: event.target.value })
                }
                placeholder="last name"
                required
              />
              <TextInput
                leftSectionPointerEvents="none"
                label="Preferred Name"
                value={userDetails.preferred_name}
                onChange={(event) =>
                  setUserDetails({ ...userDetails, preferred_name: event.target.value })
                }
                placeholder="preferred name"
              />
              <TextInput
                leftSectionPointerEvents="none"
                label="Company"
                value={userDetails.company}
                onChange={(event) =>
                  setUserDetails({ ...userDetails, company: event.target.value })
                }
                placeholder="Company"
              />

              <TextInput
                leftSectionPointerEvents="none"
                leftSection={icon}
                value={userDetails.email}
                onChange={(event) => setUserDetails({ ...userDetails, email: event.target.value })}
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
                  value={userDetails.mobile}
                  onChange={(value) => setUserDetails({ ...userDetails, mobile: value })}
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
                  value={userDetails.office_contact}
                  onChange={(value) => setUserDetails({ ...userDetails, office_contact: value })}
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
                  value={userDetails.fax_contact}
                  onChange={(value) => setUserDetails({ ...userDetails, fax_contact: value })}
                  required
                />
              </Paper>

              <Flex justify="flex-end" mt="sm" gap="xs">
                <Button onClick={saveBroker}>
                  {' '}
                  {loading ? <Loader size="sm" color="white" /> : 'Save'}
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
                <Button onClick={saveBrands}>
                  {loading ? <Loader size="sm" color="white" /> : 'Save'}
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
                  value={addresses.office_street_address1}
                  onChange={(event) =>
                    setAddresses({ ...addresses, office_street_address1: event.target.value })
                  }
                />
                <TextInput
                  leftSectionPointerEvents="none"
                  label="Street Address 2"
                  placeholder="address"
                  value={addresses.office_street_address2}
                  onChange={(event) =>
                    setAddresses({ ...addresses, office_street_address2: event.target.value })
                  }
                />
                <TextInput
                  leftSectionPointerEvents="none"
                  label="City/Town/Suburb"
                  placeholder="city"
                  value={addresses.office_city}
                  onChange={(event) =>
                    setAddresses({ ...addresses, office_city: event.target.value })
                  }
                />
                <TextInput
                  leftSectionPointerEvents="none"
                  label="Postcode"
                  placeholder="postcode"
                  value={addresses.office_postcode}
                  onChange={(event) =>
                    setAddresses({ ...addresses, office_postcode: event.target.value })
                  }
                />

                <TextInput
                  leftSectionPointerEvents="none"
                  label="State/Region"
                  placeholder="state"
                  value={addresses.office_state}
                  onChange={(event) =>
                    setAddresses({ ...addresses, office_state: event.target.value })
                  }
                />
                <TextInput
                  leftSectionPointerEvents="none"
                  label="Country"
                  placeholder="country"
                  value={addresses.office_country}
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
                  value={addresses.postal_street_address1}
                  onChange={(event) =>
                    setAddresses({ ...addresses, postal_street_address1: event.target.value })
                  }
                />
                <TextInput
                  leftSectionPointerEvents="none"
                  label="Street Address 2"
                  placeholder="address"
                  value={addresses.postal_street_address2}
                  onChange={(event) =>
                    setAddresses({ ...addresses, postal_street_address2: event.target.value })
                  }
                />
                <TextInput
                  leftSectionPointerEvents="none"
                  label="City/Town/Suburb"
                  placeholder="city"
                  value={addresses.postal_city}
                  onChange={(event) =>
                    setAddresses({ ...addresses, postal_city: event.target.value })
                  }
                />
                <TextInput
                  leftSectionPointerEvents="none"
                  label="Postcode"
                  placeholder="postcode"
                  value={addresses.postal_postcode}
                  onChange={(event) =>
                    setAddresses({ ...addresses, postal_postcode: event.target.value })
                  }
                />

                <TextInput
                  leftSectionPointerEvents="none"
                  label="State/Region"
                  placeholder="state"
                  value={addresses.postal_state}
                  onChange={(event) =>
                    setAddresses({ ...addresses, postal_state: event.target.value })
                  }
                />
                <TextInput
                  leftSectionPointerEvents="none"
                  label="Country"
                  placeholder="country"
                  value={addresses.postal_country}
                  onChange={(event) =>
                    setAddresses({ ...addresses, postal_country: event.target.value })
                  }
                />
              </Box>
              <Flex justify="flex-end" mt="sm" gap="xs">
                <Button onClick={saveAddresses}>
                  {loading ? <Loader size="sm" color="white" /> : 'Save'}
                </Button>
              </Flex>
            </Collapse>
          </Paper>
        </Box>
      </Card>
    </Box>
  );
}

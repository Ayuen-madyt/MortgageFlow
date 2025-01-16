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
  Textarea,
  Button,
  Loader,
} from '@mantine/core';
import { IconArrowNarrowLeft, IconAt, IconChevronRight, IconTrash } from '@tabler/icons-react';
import PhoneInput, { formatPhoneNumber, formatPhoneNumberIntl } from 'react-phone-number-input';
import classes from '../../components/mainTask/Task.module.css';
import { useForm, isNotEmpty, isPhoneNumber } from '@mantine/form';
import { axiosInstance, setAuthorizationToken } from '@/utils/axiosInstance';
import fetcher from '@/utils/fetcher';
import useSWR from 'swr';
import { notifications } from '@mantine/notifications';

export default function AddLender({ closeModal, lenderAdded }) {
  const [loading, setLoading] = useState(false);
  const form = useForm({
    initialValues: {
      user_id: '',
      broker_id: '',
      lender_name: '',
      lender_notes: '',
      phone: '',
      email: '',
      internet_banking_website: '',
      clawback_period: '',
      assessor_name: '',
      assessor_phone: '',
      assessor_email: '',
      assessor_url: '',
      lender_bdm_name: '',
      lender_bdm_phone: '',
      lender_bdm_email: '',
      lender_legal_company: '',
      lender_legal_phone: '',
      lender_legal_email: '',
      lender_linked_branch_name: '',
      lender_linked_branch_phone: '',
      lender_linked_branch_email: '',
      post_settlement_phone: '',
      business_banker_name: '',
      business_banker_phone: '',
      business_banker_email: '',
      web_tracking_url: '',
      web_tracking_name: '',
      policy_details_url: '',
      construction_phone: '',
      construction_email: '',
      valuations_url: '',
      valuation_usrname: '',
      variations_phone: '',
      variations_email: '',
      pricing_url: '',
      insurance_party: '',
      mortgage_docs_return_address1: '',
      mortgage_docs_return_address2: '',
      mortgage_docs_return_town: '',
      mortgage_docs_return_state: '',
      mortgage_docs_return_postcode: '',
      first_home_owner_grant_email: '',
      first_home_owner_grant_address1: '',
      first_home_owner_grant_address2: '',
      first_home_owner_grant_town: '',
      first_home_owner_grant_state: '',
      first_home_owner_grant_postcode: '',
      discharges_phone: '',
      discharges_email: '',
      discharges_fax: '',
      discharges_authority_url: '',
      discharges_authority: '',
      reports_internet_banking: '',
      reports_offset: '',
      reports_refinance_rebate: '',
      reports_construction: '',
      reports_reminders: '',
    },

    validate: {
      lender_name: isNotEmpty(),
    },
  });

  const icon = <IconAt style={{ width: rem(16), height: rem(16) }} />;

  const values = form.getTransformedValues();

  const addLender = () => {
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
        .post('/lender/add', values, {
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
          closeModal();
          lenderAdded(true);
          setLoading(false);
          notifications.show({
            title: 'Success',
            message: 'Lender Added',
            color: 'teal',
          });
        })
        .catch((err) => {
          console.log(err);
          setLoading(false);
          notifications.show({
            title: 'Error',
            message: 'Error adding lender',
            color: 'red',
          });
        });
    }
  };
  return (
    <Fragment>
      <Title order={5}>New Lender</Title>
      <Box p="xs">
        <Paper>
          <Title order={6} className={classes.brandSection} p="xs">
            Lender Detail
          </Title>
          <TextInput
            leftSectionPointerEvents="none"
            label="Lender Name"
            placeholder="lender name"
            {...form.getInputProps('lender_name')}
          />
        </Paper>
        {/* Lender notes */}
        <Box mt="md">
          <Title order={6} className={classes.brandSection} p="xs">
            Lender Notes
          </Title>
          <Textarea
            label="Lender Notes"
            placeholder="notes"
            {...form.getInputProps('lender_notes')}
          />
        </Box>

        {/* lender contact details */}
        <Box mt="md">
          <Title order={6} className={classes.brandSection} p="xs">
            Lender Contact Details
          </Title>
          <Paper mt="sm">
            <label htmlFor="phoneInput">Phone NUmber</label>
            <PhoneInput
              id="phoneInput"
              international
              defaultCountry="AU"
              initialValueFormat="national"
              {...form.getInputProps('phone')}
            />
            {form.errors.mobile_number && (
              <Text size="xs" style={{ color: 'red' }}>
                Mobile phone should not be empty
              </Text>
            )}
          </Paper>
          <TextInput
            leftSectionPointerEvents="none"
            leftSection={icon}
            label="Email"
            placeholder="email"
            {...form.getInputProps('email')}
          />
          <TextInput
            mt="sm"
            leftSectionPointerEvents="none"
            label="Internet Banking Website"
            placeholder="banking website"
            {...form.getInputProps('internet_banking_website')}
          />
          <Select
            placeholder="clawback period"
            label="Clowback Period"
            data={[
              { value: '0', label: '0 Months' },
              { value: '6', label: '6 Months' },
              { value: '12', label: '12 Months' },
              { value: '18', label: '18 Months' },
              { value: '24', label: '24 Months' },
            ]}
            {...form.getInputProps('clawback_period')}
          />
        </Box>

        {/* assessor */}
        <Box mt="md">
          <Title order={6} className={classes.brandSection} p="xs">
            Assessor Details
          </Title>
          <TextInput
            mt="sm"
            leftSectionPointerEvents="none"
            label="Name"
            placeholder="name"
            {...form.getInputProps('assessor_name')}
          />
          <Paper mt="sm">
            <label htmlFor="phoneInput">Phone</label>
            <PhoneInput
              id="phoneInput"
              international
              defaultCountry="AU"
              initialValueFormat="national"
              {...form.getInputProps('assessor_phone')}
            />
            {form.errors.mobile_number && (
              <Text size="xs" style={{ color: 'red' }}>
                Mobile phone should not be empty
              </Text>
            )}
          </Paper>
          <TextInput
            leftSectionPointerEvents="none"
            leftSection={icon}
            label="Email"
            placeholder="email"
            {...form.getInputProps('assessor_email')}
          />
          <TextInput
            leftSectionPointerEvents="none"
            label="URL"
            placeholder="url"
            {...form.getInputProps('assessor_url')}
          />
        </Box>

        {/* lender bdm*/}
        <Box mt="md">
          <Title order={6} className={classes.brandSection} p="xs">
            Lender BDM
          </Title>
          <TextInput
            mt="sm"
            leftSectionPointerEvents="none"
            label="Name"
            placeholder="name"
            {...form.getInputProps('lender_bdm_name')}
          />
          <Paper mt="sm">
            <label htmlFor="phoneInput">Phone</label>
            <PhoneInput
              id="phoneInput"
              international
              defaultCountry="AU"
              initialValueFormat="national"
              {...form.getInputProps('lender_bdm_phone')}
            />
            {form.errors.mobile_number && (
              <Text size="xs" style={{ color: 'red' }}>
                Mobile phone should not be empty
              </Text>
            )}
          </Paper>
          <TextInput
            leftSectionPointerEvents="none"
            leftSection={icon}
            label="Email"
            placeholder="email"
            {...form.getInputProps('lender_bdm_email')}
          />
        </Box>

        {/* lender legal */}
        <Box mt="md">
          <Title order={6} className={classes.brandSection} p="xs">
            Lender Legal
          </Title>
          <Text mt="xs" size="xs" c="dimmed">
            If lender uses external solicitors to manage settlements, please note details here:
          </Text>
          <TextInput
            mt="sm"
            leftSectionPointerEvents="none"
            label="Company"
            placeholder="company"
            {...form.getInputProps('lender_legal_company')}
          />
          <Paper mt="sm">
            <label htmlFor="phoneInput">Phone</label>
            <PhoneInput
              id="phoneInput"
              international
              defaultCountry="AU"
              initialValueFormat="national"
              {...form.getInputProps('lender_legal_phone')}
            />
          </Paper>
          <TextInput
            leftSectionPointerEvents="none"
            leftSection={icon}
            label="Email"
            placeholder="email"
            {...form.getInputProps('lender_legal_email')}
          />
        </Box>

        {/* Lender linked branch */}
        <Box mt="md">
          <Title order={6} className={classes.brandSection} p="xs">
            Linked Branch Details
          </Title>
          <Text mt="xs" size="xs" c="dimmed">
            If you have a relationship with a branch that you refer clients to, enter details here
          </Text>
          <TextInput
            mt="sm"
            leftSectionPointerEvents="none"
            label="Name"
            placeholder="name"
            {...form.getInputProps('lender_linked_branch_name')}
          />
          <Paper mt="sm">
            <label htmlFor="phoneInput">Phone</label>
            <PhoneInput
              id="phoneInput"
              international
              defaultCountry="AU"
              initialValueFormat="national"
              {...form.getInputProps('lender_linked_branch_phone')}
            />
            {form.errors.mobile_number && (
              <Text size="xs" style={{ color: 'red' }}>
                Mobile phone should not be empty
              </Text>
            )}
          </Paper>
          <TextInput
            leftSectionPointerEvents="none"
            leftSection={icon}
            label="Email"
            placeholder="email"
            {...form.getInputProps('lender_linked_branch_email')}
          />
        </Box>

        {/* post settlement details */}
        <Box mt="md">
          <Title order={6} className={classes.brandSection} p="xs">
            Post Settlement Details
          </Title>

          <Paper mt="sm">
            <label htmlFor="phoneInput">Phone</label>
            <PhoneInput
              id="phoneInput"
              international
              defaultCountry="AU"
              initialValueFormat="national"
              {...form.getInputProps('post_settlement_phone')}
            />
            {form.errors.mobile_number && (
              <Text size="xs" style={{ color: 'red' }}>
                Mobile phone should not be empty
              </Text>
            )}
          </Paper>
        </Box>

        {/* business banker details */}
        <Box mt="md">
          <Title order={6} className={classes.brandSection} p="xs">
            Business Banker Details
          </Title>
          <TextInput
            mt="sm"
            leftSectionPointerEvents="none"
            label="Name"
            placeholder="name"
            {...form.getInputProps('business_banker_name')}
          />
          <Paper mt="sm">
            <label htmlFor="phoneInput">Phone</label>
            <PhoneInput
              id="phoneInput"
              international
              defaultCountry="AU"
              initialValueFormat="national"
              {...form.getInputProps('business_banker_phone')}
            />
            {form.errors.mobile_number && (
              <Text size="xs" style={{ color: 'red' }}>
                Mobile phone should not be empty
              </Text>
            )}
          </Paper>
          <TextInput
            leftSectionPointerEvents="none"
            leftSection={icon}
            label="Email"
            placeholder="email"
            {...form.getInputProps('business_banker_email')}
          />
        </Box>

        {/* web tracking */}
        <Box mt="md">
          <Title order={6} className={classes.brandSection} p="xs">
            Web Tracking
          </Title>
          <Text mt="xs" size="xs" c="dimmed">
            For status updates
          </Text>
          <TextInput
            mt="sm"
            leftSectionPointerEvents="none"
            label="URL"
            placeholder="url"
            {...form.getInputProps('web_tracking_url')}
          />

          <TextInput
            leftSectionPointerEvents="none"
            leftSection={icon}
            label="Username"
            placeholder="user name"
            {...form.getInputProps('web_tracking_name')}
          />
        </Box>

        {/* polciy details */}
        <Box mt="md">
          <Title order={6} className={classes.brandSection} p="xs">
            Policy Details
          </Title>

          <TextInput
            mt="sm"
            leftSectionPointerEvents="none"
            label="Portal URL"
            placeholder="url"
            {...form.getInputProps('policy_details_url')}
          />
        </Box>

        {/* construction */}
        <Box mt="md">
          <Title order={6} className={classes.brandSection} p="xs">
            Construction
          </Title>
          <Text mt="xs" size="xs" c="dimmed">
            For managing progress payments
          </Text>

          <Paper mt="sm">
            <label htmlFor="phoneInput">Phone</label>
            <PhoneInput
              id="phoneInput"
              international
              defaultCountry="AU"
              initialValueFormat="national"
              {...form.getInputProps('construction_phone')}
            />
          </Paper>
          <TextInput
            leftSectionPointerEvents="none"
            leftSection={icon}
            label="Email"
            placeholder="email"
            {...form.getInputProps('construction_email')}
          />
        </Box>

        {/* valuations */}
        <Box mt="md">
          <Title order={6} className={classes.brandSection} p="xs">
            Valuations
          </Title>
          <Text mt="xs" size="xs" c="dimmed">
            For ordering valuations
          </Text>

          <TextInput
            leftSectionPointerEvents="none"
            label="URL"
            placeholder="url"
            {...form.getInputProps('valuations_url')}
          />
          <TextInput
            leftSectionPointerEvents="none"
            label="Username"
            placeholder="name"
            {...form.getInputProps('valuation_usrname')}
          />
        </Box>

        {/* variations */}
        <Box mt="md">
          <Title order={6} className={classes.brandSection} p="xs">
            Variations
          </Title>
          <Paper mt="sm">
            <label htmlFor="phoneInput">Phone</label>
            <PhoneInput
              id="phoneInput"
              international
              defaultCountry="AU"
              initialValueFormat="national"
              {...form.getInputProps('variations_phone')}
            />
          </Paper>
          <TextInput
            leftSectionPointerEvents="none"
            leftSection={icon}
            label="Email"
            placeholder="email"
            {...form.getInputProps('variations_email')}
          />
        </Box>

        {/* pricing */}
        <Box mt="md">
          <Title order={6} className={classes.brandSection} p="xs">
            Pricing
          </Title>
          <TextInput
            leftSectionPointerEvents="none"
            label="Portal URL"
            placeholder="url"
            {...form.getInputProps('pricing_url')}
          />
        </Box>

        {/* insurance */}
        <Box mt="md">
          <Title order={6} className={classes.brandSection} p="xs">
            Insurance
          </Title>
          <Text mt="xs" size="xs" c="dimmed">
            Interested party name to go on the certificate of currency
          </Text>
          <TextInput
            leftSectionPointerEvents="none"
            label="Interested Party"
            placeholder="party"
            {...form.getInputProps('insurance_party')}
          />
        </Box>

        {/* mortgage */}
        <Box mt="md">
          <Title order={6} className={classes.brandSection} p="xs">
            Mortgage Documents Return Address
          </Title>
          <TextInput
            leftSectionPointerEvents="none"
            label="Street Address 1"
            placeholder="address"
            {...form.getInputProps('mortgage_docs_return_address1')}
          />
          <TextInput
            leftSectionPointerEvents="none"
            label="Street Address 2"
            placeholder="address"
            {...form.getInputProps('mortgage_docs_return_address2')}
          />
          <TextInput
            leftSectionPointerEvents="none"
            label="Suburb/Town"
            placeholder="suburb"
            {...form.getInputProps('mortgage_docs_return_town')}
          />
          <TextInput
            leftSectionPointerEvents="none"
            label="State"
            placeholder="state"
            {...form.getInputProps('mortgage_docs_return_state')}
          />
          <TextInput
            leftSectionPointerEvents="none"
            label="Postcode"
            placeholder="code"
            {...form.getInputProps('mortgage_docs_return_postcode')}
          />
        </Box>

        {/* first home owner grant */}
        <Box mt="md">
          <Title order={6} className={classes.brandSection} p="xs">
            First Home Owners Grant
          </Title>

          <TextInput
            leftSectionPointerEvents="none"
            leftSection={icon}
            label="FHOG Email"
            placeholder="email"
            {...form.getInputProps('first_home_owner_grant_email')}
          />
          <TextInput
            leftSectionPointerEvents="none"
            label="Street Address 1"
            placeholder="address"
            {...form.getInputProps('first_home_owner_grant_address1')}
          />
          <TextInput
            leftSectionPointerEvents="none"
            label="Street Address 2"
            placeholder="address"
            {...form.getInputProps('first_home_owner_grant_address2')}
          />
          <TextInput
            leftSectionPointerEvents="none"
            label="Suburb/Town"
            placeholder="suburb"
            {...form.getInputProps('first_home_owner_grant_town')}
          />
          <TextInput
            leftSectionPointerEvents="none"
            label="State"
            placeholder="state"
            {...form.getInputProps('first_home_owner_grant_state')}
          />
          <TextInput
            leftSectionPointerEvents="none"
            label="Postcode"
            placeholder="code"
            {...form.getInputProps('first_home_owner_grant_postcode')}
          />
        </Box>

        {/* discharges */}
        <Box mt="md">
          <Title order={6} className={classes.brandSection} p="xs">
            Discharges
          </Title>

          <Paper mt="sm">
            <label htmlFor="phoneInput">Phone</label>
            <PhoneInput
              id="phoneInput"
              international
              defaultCountry="AU"
              initialValueFormat="national"
              {...form.getInputProps('discharges_phone')}
            />
          </Paper>

          <TextInput
            leftSectionPointerEvents="none"
            leftSection={icon}
            label="Email"
            placeholder="email"
            {...form.getInputProps('discharges_email')}
          />
          <Paper mt="sm">
            <label htmlFor="phoneInput">Fax</label>
            <PhoneInput
              id="phoneInput"
              international
              defaultCountry="AU"
              initialValueFormat="national"
              {...form.getInputProps('discharges_fax')}
            />
          </Paper>

          <TextInput
            leftSectionPointerEvents="none"
            label="Discharge Authority URL"
            placeholder="url"
            {...form.getInputProps('discharges_authority_url')}
          />
          <TextInput
            leftSectionPointerEvents="none"
            label="Discharge Authority"
            placeholder="name"
            {...form.getInputProps('discharges_authority')}
          />
        </Box>

        {/* reports */}
        <Box mt="md">
          <Title order={6} className={classes.brandSection} p="xs">
            Reports
          </Title>
          <Textarea label="Internet Banking" {...form.getInputProps('reports_internet_banking')} />
          <Textarea label="Offsets" {...form.getInputProps('reports_offset')} />
          <Textarea label="Refinance Rebate" {...form.getInputProps('reports_refinance_rebate')} />
          <Textarea label="Construction" {...form.getInputProps('reports_construction')} />
          <Textarea label="Reminders" {...form.getInputProps('reports_reminders')} />
        </Box>

        <Flex justify="flex-end" mt="sm">
          <Button onClick={addLender}>
            {loading ? <Loader size="sm" color="white" /> : 'Save'}
          </Button>
        </Flex>
      </Box>
    </Fragment>
  );
}

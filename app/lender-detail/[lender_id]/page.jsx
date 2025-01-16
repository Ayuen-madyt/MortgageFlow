'use client';
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
  Textarea,
  Button,
  Loader,
} from '@mantine/core';
import { IconArrowNarrowLeft, IconAt, IconChevronRight } from '@tabler/icons-react';
import SideBarLayout from '@/components/SidebarLayout/SideBarLayout';
import classes from '../../../components/mainTask/Task.module.css';
import fetcher from '@/utils/fetcher';
import useSWR from 'swr';
import { useDisclosure } from '@mantine/hooks';
import PhoneInput, { formatPhoneNumber, formatPhoneNumberIntl } from 'react-phone-number-input';
import { notifications } from '@mantine/notifications';
import { axiosInstance } from '@/utils/axiosInstance';
import { useParams, useRouter } from 'next/navigation';

export default function Page() {
  const router = useRouter();
  const { lender_id } = useParams();
  const [openLender, { toggle: toggleLender }] = useDisclosure(true);
  const [openNote, { toggle: toggleNote }] = useDisclosure(false);
  const [openContact, { toggle: toggleContact }] = useDisclosure(false);
  const [openAssessor, { toggle: toggleAssessor }] = useDisclosure(false);
  const [openBDM, { toggle: toggleBDM }] = useDisclosure(false);
  const [openLegal, { toggle: toggleLegal }] = useDisclosure(false);
  const [openLinkedBranch, { toggle: toggleLinkedBranch }] = useDisclosure(false);
  const [openPost, { toggle: togglePost }] = useDisclosure(false);
  const [openBanker, { toggle: toggleBanker }] = useDisclosure(false);
  const [openWebTracking, { toggle: toggleWebTracking }] = useDisclosure(false);
  const [openPolicy, { toggle: togglePolicy }] = useDisclosure(false);
  const [openConstruction, { toggle: toggleConstruction }] = useDisclosure(false);
  const [openValuations, { toggle: toggleValuations }] = useDisclosure(false);
  const [openVariations, { toggle: toggleVariations }] = useDisclosure(false);
  const [openPricing, { toggle: togglePricing }] = useDisclosure(false);
  const [openInsurance, { toggle: toggleInsurance }] = useDisclosure(false);
  const [openMortgage, { toggle: toggleMortgage }] = useDisclosure(false);
  const [openFirstHome, { toggle: toggleFirstHome }] = useDisclosure(false);
  const [openDischarges, { toggle: toggleDischarges }] = useDisclosure(false);
  const [openReports, { toggle: toggleReports }] = useDisclosure(false);
  const [token, setToken] = useState('');

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const access_token =
      typeof localStorage !== 'undefined' ? localStorage.getItem('broker_access_token') : null;

    setToken(access_token);
  }, []);

  const { data: lender, mutate } = useSWR([`/lender/get/${lender_id}`, token], ([url, token]) =>
    fetcher(url, token)
  );

  const [lenderDetails, setLenderDetails] = useState({
    lender_id: '',
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
  });

  const icon = <IconAt style={{ width: rem(16), height: rem(16) }} />;

  const goBack = () => {
    router.back();
  };

  const saveLender = () => {
    setLoading(!loading);
    axiosInstance
      .put(`/lender/update/${lender_id}`, lenderDetails)
      .then((response) => {
        setLoading(false);
        notifications.show({
          title: 'Success',
          color: 'teal',
          message: 'Lender updated successfully!',
        });
      })
      .catch((error) => {
        setLoading(false);
        notifications.show({
          title: 'Error',
          color: 'red',
          message: 'Error updating lender',
        });
      });
  };

  useEffect(() => {
    if (lender) {
      setLenderDetails({
        lender_id: lender.lender_id || lenderId,
        user_id: lender.user_id || '',
        broker_id: lender.broker_id || '',
        lender_name: lender.lender_name || '',
        lender_notes: lender.lender_notes || '',
        phone: lender.phone || '',
        email: lender.email || '',
        internet_banking_website: lender.internet_banking_website || '',
        clawback_period: lender.clawback_period || '',
        assessor_name: lender.assessor_name || '',
        assessor_phone: lender.assessor_phone || '',
        assessor_email: lender.assessor_email || '',
        assessor_url: lender.assessor_url || '',
        lender_bdm_name: lender.lender_bdm_name || '',
        lender_bdm_phone: lender.lender_bdm_phone || '',
        lender_bdm_email: lender.lender_bdm_email || '',
        lender_legal_company: lender.lender_legal_company || '',
        lender_legal_phone: lender.lender_legal_phone || '',
        lender_legal_email: lender.lender_legal_email || '',
        lender_linked_branch_name: lender.lender_linked_branch_name || '',
        lender_linked_branch_phone: lender.lender_linked_branch_phone || '',
        lender_linked_branch_email: lender.lender_linked_branch_email || '',
        post_settlement_phone: lender.post_settlement_phone || '',
        business_banker_name: lender.business_banker_name || '',
        business_banker_phone: lender.business_banker_phone || '',
        business_banker_email: lender.business_banker_email || '',
        web_tracking_url: lender.web_tracking_url || '',
        web_tracking_name: lender.web_tracking_name || '',
        policy_details_url: lender.policy_details_url || '',
        construction_phone: lender.construction_phone || '',
        construction_email: lender.construction_email || '',
        valuations_url: lender.valuations_url || '',
        valuation_usrname: lender.valuation_usrname || '',
        variations_phone: lender.variations_phone || '',
        variations_email: lender.variations_email || '',
        pricing_url: lender.pricing_url || '',
        insurance_party: lender.insurance_party || '',
        mortgage_docs_return_address1: lender.mortgage_docs_return_address1 || '',
        mortgage_docs_return_address2: lender.mortgage_docs_return_address2 || '',
        mortgage_docs_return_town: lender.mortgage_docs_return_town || '',
        mortgage_docs_return_state: lender.mortgage_docs_return_state || '',
        mortgage_docs_return_postcode: lender.mortgage_docs_return_postcode || '',
        first_home_owner_grant_email: lender.first_home_owner_grant_email || '',
        first_home_owner_grant_address1: lender.first_home_owner_grant_address1 || '',
        first_home_owner_grant_address2: lender.first_home_owner_grant_address2 || '',
        first_home_owner_grant_town: lender.first_home_owner_grant_town || '',
        first_home_owner_grant_state: lender.first_home_owner_grant_state || '',
        first_home_owner_grant_postcode: lender.first_home_owner_grant_postcode || '',
        discharges_phone: lender.discharges_phone || '',
        discharges_email: lender.discharges_email || '',
        discharges_fax: lender.discharges_fax || '',
        discharges_authority_url: lender.discharges_authority_url || '',
        discharges_authority: lender.discharges_authority || '',
        reports_internet_banking: lender.reports_internet_banking || '',
        reports_offset: lender.reports_offset || '',
        reports_refinance_rebate: lender.reports_refinance_rebate || '',
        reports_construction: lender.reports_construction || '',
        reports_reminders: lender.reports_reminders || '',
      });
    }
  }, [lender]);

  return (
    <SideBarLayout title="Lenders" showButton={false} showBgWhite={false} broker="">
      <Box>
        <Flex justify="flex-start" align="center" style={{ color: '#0275d8' }}>
          <IconArrowNarrowLeft
            onClick={goBack}
            stroke={1.5}
            style={{
              width: rem(16),
              height: rem(16),
              cursor: 'pointer',
            }}
          />
          <Text onClick={goBack} style={{ cursor: 'pointer' }} size="sm">
            Go back
          </Text>
        </Flex>
        <Card
          withBorder
          radius="md"
          mt="sm"
          bg="var(--mantine-color-body)"
          style={{ padding: 0, margin: 0 }}
        >
          <Title p="md" className={classes.customGray} order={4}>
            Lender Details
          </Title>
          <Divider />
          <Box mt="md" p="xs">
            {/* lender name */}
            <Box>
              <Flex onClick={toggleLender} justify="space-between">
                <Box className={classes.titles} style={{ cursor: 'pointer' }}>
                  <Text
                    style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}
                    className={classes.customGray}
                    fz="sm"
                    tt="uppercase"
                    fw={700}
                    pr="xs"
                  >
                    Lender
                  </Text>
                </Box>
                <IconChevronRight
                  className={classes.chevron}
                  stroke={1.5}
                  style={{
                    width: rem(16),
                    height: rem(16),
                    transform: openLender ? 'rotate(-90deg)' : 'none',
                    cursor: 'pointer',
                  }}
                />
              </Flex>
              <Collapse in={openLender} mt="xs">
                <TextInput
                  leftSectionPointerEvents="none"
                  label="Lender Name"
                  placeholder="lender name"
                  value={lenderDetails?.lender_name}
                  onChange={(event) =>
                    setLenderDetails({ ...lenderDetails, lender_name: event.target.value })
                  }
                />
                {/* <TextInput
                  leftSectionPointerEvents="none"
                  label="Broker Code"
                  placeholder="broker code"
                  value={lenderDetails?.broker_id}
                  onChange={(event) =>
                    setLenderDetails({ ...lenderDetails, broker_id: event.target.value })
                  }
                /> */}
              </Collapse>
            </Box>
            {/* lender notes */}
            <Box mt="md">
              <Flex onClick={toggleNote} justify="space-between">
                <Box className={classes.titles} style={{ cursor: 'pointer' }}>
                  <Text
                    style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}
                    className={classes.customGray}
                    fz="sm"
                    tt="uppercase"
                    fw={700}
                    pr="xs"
                  >
                    Lender Notes
                  </Text>
                </Box>
                <IconChevronRight
                  className={classes.chevron}
                  stroke={1.5}
                  style={{
                    width: rem(16),
                    height: rem(16),
                    transform: openNote ? 'rotate(-90deg)' : 'none',
                    cursor: 'pointer',
                  }}
                />
              </Flex>
              <Collapse in={openNote} mt="xs">
                <Textarea
                  leftSectionPointerEvents="none"
                  label="Notes"
                  placeholder="write something..."
                  value={lenderDetails?.lender_notes}
                  onChange={(event) =>
                    setLenderDetails({ ...lenderDetails, lender_notes: event.target.value })
                  }
                />
              </Collapse>
            </Box>

            {/* lender contact details */}
            <Box mt="md">
              <Flex onClick={toggleContact} justify="space-between">
                <Box className={classes.titles} style={{ cursor: 'pointer' }}>
                  <Text
                    style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}
                    className={classes.customGray}
                    fz="sm"
                    tt="uppercase"
                    fw={700}
                    pr="xs"
                  >
                    Lender Contact Details
                  </Text>
                </Box>
                <IconChevronRight
                  className={classes.chevron}
                  stroke={1.5}
                  style={{
                    width: rem(16),
                    height: rem(16),
                    transform: openContact ? 'rotate(-90deg)' : 'none',
                    cursor: 'pointer',
                  }}
                />
              </Flex>
              <Collapse in={openContact} mt="xs">
                <Paper mt="sm">
                  <label htmlFor="phoneInput">Phone</label>
                  <PhoneInput
                    id="phoneInput"
                    international
                    defaultCountry="AU"
                    initialValueFormat="national"
                    value={lenderDetails?.phone}
                    onChange={(value) => setLenderDetails({ ...lenderDetails, phone: value })}
                  />
                  <TextInput
                    leftSectionPointerEvents="none"
                    leftSection={icon}
                    label="Email"
                    placeholder="email"
                    value={lenderDetails?.email}
                    onChange={(event) =>
                      setLenderDetails({ ...lenderDetails, email: event.target.value })
                    }
                  />
                  <TextInput
                    leftSectionPointerEvents="none"
                    label="Internet Banking Website"
                    placeholder="website url"
                    value={lenderDetails?.internet_banking_website}
                    onChange={(event) =>
                      setLenderDetails({
                        ...lenderDetails,
                        internet_banking_website: event.target.value,
                      })
                    }
                  />
                  <TextInput
                    leftSectionPointerEvents="none"
                    label="Claw Back Period"
                    placeholder="claw back period"
                    value={lenderDetails?.clawback_period}
                    onChange={(event) =>
                      setLenderDetails({ ...lenderDetails, clawback_period: event.target.value })
                    }
                  />
                </Paper>
              </Collapse>
            </Box>

            {/* assessor details */}
            <Box mt="md">
              <Flex onClick={toggleAssessor} justify="space-between">
                <Box className={classes.titles} style={{ cursor: 'pointer' }}>
                  <Text
                    style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}
                    className={classes.customGray}
                    fz="sm"
                    tt="uppercase"
                    fw={700}
                    pr="xs"
                  >
                    Assessor Details
                  </Text>
                </Box>
                <IconChevronRight
                  className={classes.chevron}
                  stroke={1.5}
                  style={{
                    width: rem(16),
                    height: rem(16),
                    transform: openAssessor ? 'rotate(-90deg)' : 'none',
                    cursor: 'pointer',
                  }}
                />
              </Flex>
              <Collapse in={openAssessor} mt="xs">
                <TextInput
                  leftSectionPointerEvents="none"
                  label="Name"
                  placeholder="name"
                  value={lenderDetails?.assessor_name}
                  onChange={(event) =>
                    setLenderDetails({ ...lenderDetails, assessor_name: event.target.value })
                  }
                />
                <Paper mt="sm">
                  <label htmlFor="phoneInput">Phone</label>
                  <PhoneInput
                    id="phoneInput"
                    international
                    defaultCountry="AU"
                    initialValueFormat="national"
                    value={lenderDetails?.assessor_phone}
                    onChange={(value) =>
                      setLenderDetails({ ...lenderDetails, assessor_phone: value })
                    }
                  />
                  <TextInput
                    leftSectionPointerEvents="none"
                    leftSection={icon}
                    label="Email"
                    placeholder="email"
                    value={lenderDetails?.assessor_email}
                    onChange={(event) =>
                      setLenderDetails({ ...lenderDetails, assessor_email: event.target.value })
                    }
                  />
                  <TextInput
                    leftSectionPointerEvents="none"
                    label="URL"
                    placeholder="website url"
                    value={lenderDetails?.assessor_url}
                    onChange={(event) =>
                      setLenderDetails({ ...lenderDetails, assessor_url: event.target.value })
                    }
                  />
                </Paper>
              </Collapse>
            </Box>

            {/* lender bdm */}
            <Box mt="md">
              <Flex onClick={toggleBDM} justify="space-between">
                <Box className={classes.titles} style={{ cursor: 'pointer' }}>
                  <Text
                    style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}
                    className={classes.customGray}
                    fz="sm"
                    tt="uppercase"
                    fw={700}
                    pr="xs"
                  >
                    Lender BDM
                  </Text>
                </Box>
                <IconChevronRight
                  className={classes.chevron}
                  stroke={1.5}
                  style={{
                    width: rem(16),
                    height: rem(16),
                    transform: openBDM ? 'rotate(-90deg)' : 'none',
                    cursor: 'pointer',
                  }}
                />
              </Flex>
              <Collapse in={openBDM} mt="xs">
                <TextInput
                  leftSectionPointerEvents="none"
                  label="Name"
                  placeholder="name"
                  value={lenderDetails?.lender_bdm_name}
                  onChange={(event) =>
                    setLenderDetails({ ...lenderDetails, lender_bdm_name: event.target.value })
                  }
                />
                <Paper mt="sm">
                  <label htmlFor="phoneInput">Phone</label>
                  <PhoneInput
                    id="phoneInput"
                    international
                    defaultCountry="AU"
                    initialValueFormat="national"
                    value={lenderDetails?.lender_bdm_phone}
                    onChange={(value) =>
                      setLenderDetails({ ...lenderDetails, lender_bdm_phone: value })
                    }
                  />
                  <TextInput
                    leftSectionPointerEvents="none"
                    leftSection={icon}
                    label="Email"
                    placeholder="email"
                    value={lenderDetails?.lender_bdm_email}
                    onChange={(event) =>
                      setLenderDetails({ ...lenderDetails, lender_bdm_email: event.target.value })
                    }
                  />
                </Paper>
              </Collapse>
            </Box>

            {/* lender legal */}
            <Box mt="md">
              <Flex onClick={toggleLegal} justify="space-between">
                <Box className={classes.titles} style={{ cursor: 'pointer' }}>
                  <Text
                    style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}
                    className={classes.customGray}
                    fz="sm"
                    tt="uppercase"
                    fw={700}
                    pr="xs"
                  >
                    Lender Legal
                  </Text>
                  <Text size="xs" c="dimmed">
                    If Lender uses external solicitors to manage settlements, please note details
                    here
                  </Text>
                </Box>
                <IconChevronRight
                  className={classes.chevron}
                  stroke={1.5}
                  style={{
                    width: rem(16),
                    height: rem(16),
                    transform: openLegal ? 'rotate(-90deg)' : 'none',
                    cursor: 'pointer',
                  }}
                />
              </Flex>
              <Collapse in={openLegal} mt="xs">
                <TextInput
                  leftSectionPointerEvents="none"
                  label="Company"
                  placeholder="company"
                  value={lenderDetails?.lender_legal_company}
                  onChange={(event) =>
                    setLenderDetails({ ...lenderDetails, lender_legal_company: event.target.value })
                  }
                />
                <Paper mt="sm">
                  <label htmlFor="phoneInput">Phone</label>
                  <PhoneInput
                    id="phoneInput"
                    international
                    defaultCountry="AU"
                    initialValueFormat="national"
                    value={lenderDetails?.lender_legal_phone}
                    onChange={(value) =>
                      setLenderDetails({ ...lenderDetails, lender_legal_phone: value })
                    }
                  />
                  <TextInput
                    leftSectionPointerEvents="none"
                    leftSection={icon}
                    label="Email"
                    placeholder="email"
                    value={lenderDetails?.lender_legal_email}
                    onChange={(event) =>
                      setLenderDetails({ ...lenderDetails, email: event.target.value })
                    }
                  />
                </Paper>
              </Collapse>
            </Box>

            {/* linked branch details */}
            <Box mt="md">
              <Flex onClick={toggleLinkedBranch} justify="space-between">
                <Box className={classes.titles} style={{ cursor: 'pointer' }}>
                  <Text
                    style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}
                    className={classes.customGray}
                    fz="sm"
                    tt="uppercase"
                    fw={700}
                    pr="xs"
                  >
                    Linked Branch Details
                  </Text>
                  <Text size="xs" c="dimmed">
                    If you have a relationship with a branch that you refer clients to, enter
                    details here
                  </Text>
                </Box>
                <IconChevronRight
                  className={classes.chevron}
                  stroke={1.5}
                  style={{
                    width: rem(16),
                    height: rem(16),
                    transform: openLinkedBranch ? 'rotate(-90deg)' : 'none',
                    cursor: 'pointer',
                  }}
                />
              </Flex>
              <Collapse in={openLinkedBranch} mt="xs">
                <TextInput
                  leftSectionPointerEvents="none"
                  label="Name"
                  placeholder="name"
                  value={lenderDetails?.lender_linked_branch_name}
                  onChange={(event) =>
                    setLenderDetails({
                      ...lenderDetails,
                      lender_linked_branch_name: event.target.value,
                    })
                  }
                />
                <Paper mt="sm">
                  <label htmlFor="phoneInput">Phone</label>
                  <PhoneInput
                    id="phoneInput"
                    international
                    defaultCountry="AU"
                    initialValueFormat="national"
                    value={lenderDetails?.lender_linked_branch_phone}
                    onChange={(value) =>
                      setLenderDetails({ ...lenderDetails, lender_linked_branch_phone: value })
                    }
                  />
                  <TextInput
                    leftSectionPointerEvents="none"
                    leftSection={icon}
                    label="Email"
                    placeholder="email"
                    value={lenderDetails?.lender_linked_branch_email}
                    onChange={(event) =>
                      setLenderDetails({
                        ...lenderDetails,
                        lender_linked_branch_email: event.target.value,
                      })
                    }
                  />
                </Paper>
              </Collapse>
            </Box>

            {/* post settlement details */}
            <Box mt="md">
              <Flex onClick={togglePost} justify="space-between">
                <Box className={classes.titles} style={{ cursor: 'pointer' }}>
                  <Text
                    style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}
                    className={classes.customGray}
                    fz="sm"
                    tt="uppercase"
                    fw={700}
                    pr="xs"
                  >
                    Post Settlement Details
                  </Text>
                </Box>
                <IconChevronRight
                  className={classes.chevron}
                  stroke={1.5}
                  style={{
                    width: rem(16),
                    height: rem(16),
                    transform: openPost ? 'rotate(-90deg)' : 'none',
                    cursor: 'pointer',
                  }}
                />
              </Flex>
              <Collapse in={openPost} mt="xs">
                <Paper mt="sm">
                  <label htmlFor="phoneInput">Post Settlement Phone</label>
                  <PhoneInput
                    id="phoneInput"
                    international
                    defaultCountry="AU"
                    initialValueFormat="national"
                    value={lenderDetails?.post_settlement_phone}
                    onChange={(value) =>
                      setLenderDetails({ ...lenderDetails, post_settlement_phone: value })
                    }
                  />
                </Paper>
              </Collapse>
            </Box>

            {/* business banker details */}
            <Box mt="md">
              <Flex onClick={toggleBanker} justify="space-between">
                <Box className={classes.titles} style={{ cursor: 'pointer' }}>
                  <Text
                    style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}
                    className={classes.customGray}
                    fz="sm"
                    tt="uppercase"
                    fw={700}
                    pr="xs"
                  >
                    Business Banker Details
                  </Text>
                </Box>
                <IconChevronRight
                  className={classes.chevron}
                  stroke={1.5}
                  style={{
                    width: rem(16),
                    height: rem(16),
                    transform: openBanker ? 'rotate(-90deg)' : 'none',
                    cursor: 'pointer',
                  }}
                />
              </Flex>
              <Collapse in={openBanker} mt="xs">
                <TextInput
                  leftSectionPointerEvents="none"
                  label="Name"
                  placeholder="name"
                  value={lenderDetails?.business_banker_name}
                  onChange={(event) =>
                    setLenderDetails({ ...lenderDetails, business_banker_name: event.target.value })
                  }
                />
                <Paper mt="sm">
                  <label htmlFor="phoneInput">Phone</label>
                  <PhoneInput
                    id="phoneInput"
                    international
                    defaultCountry="AU"
                    initialValueFormat="national"
                    value={lenderDetails?.business_banker_phone}
                    onChange={(value) =>
                      setLenderDetails({ ...lenderDetails, business_banker_phone: value })
                    }
                  />
                  <TextInput
                    leftSectionPointerEvents="none"
                    leftSection={icon}
                    label="Email"
                    placeholder="email"
                    value={lenderDetails?.business_banker_email}
                    onChange={(event) =>
                      setLenderDetails({
                        ...lenderDetails,
                        business_banker_email: event.target.value,
                      })
                    }
                  />
                </Paper>
              </Collapse>
            </Box>

            {/* web tracking */}
            <Box mt="md">
              <Flex onClick={toggleWebTracking} justify="space-between">
                <Box className={classes.titles} style={{ cursor: 'pointer' }}>
                  <Text
                    style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}
                    className={classes.customGray}
                    fz="sm"
                    tt="uppercase"
                    fw={700}
                    pr="xs"
                  >
                    Web Tracking
                  </Text>
                  <Text size="xs" c="dimmed">
                    For status updates
                  </Text>
                </Box>
                <IconChevronRight
                  className={classes.chevron}
                  stroke={1.5}
                  style={{
                    width: rem(16),
                    height: rem(16),
                    transform: openWebTracking ? 'rotate(-90deg)' : 'none',
                    cursor: 'pointer',
                  }}
                />
              </Flex>
              <Collapse in={openWebTracking} mt="xs">
                <TextInput
                  leftSectionPointerEvents="none"
                  label="URL"
                  placeholder="website url"
                  value={lenderDetails?.web_tracking_url}
                  onChange={(event) =>
                    setLenderDetails({ ...lenderDetails, web_tracking_url: event.target.value })
                  }
                />
                <TextInput
                  leftSectionPointerEvents="none"
                  label="User Name"
                  placeholder="name"
                  value={lenderDetails?.web_tracking_name}
                  onChange={(event) =>
                    setLenderDetails({ ...lenderDetails, web_tracking_name: event.target.value })
                  }
                />
              </Collapse>
            </Box>

            {/* policy detalils */}
            <Box mt="md">
              <Flex onClick={togglePolicy} justify="space-between">
                <Box className={classes.titles} style={{ cursor: 'pointer' }}>
                  <Text
                    style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}
                    className={classes.customGray}
                    fz="sm"
                    tt="uppercase"
                    fw={700}
                    pr="xs"
                  >
                    Policy Details
                  </Text>
                </Box>
                <IconChevronRight
                  className={classes.chevron}
                  stroke={1.5}
                  style={{
                    width: rem(16),
                    height: rem(16),
                    transform: openPolicy ? 'rotate(-90deg)' : 'none',
                    cursor: 'pointer',
                  }}
                />
              </Flex>
              <Collapse in={openPolicy} mt="xs">
                <TextInput
                  leftSectionPointerEvents="none"
                  label="Portal URL"
                  placeholder="url"
                  value={lenderDetails?.policy_details_url}
                  onChange={(event) =>
                    setLenderDetails({ ...lenderDetails, policy_details_url: event.target.value })
                  }
                />
              </Collapse>
            </Box>

            {/* construction */}
            <Box mt="md">
              <Flex onClick={toggleConstruction} justify="space-between">
                <Box className={classes.titles} style={{ cursor: 'pointer' }}>
                  <Text
                    style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}
                    className={classes.customGray}
                    fz="sm"
                    tt="uppercase"
                    fw={700}
                    pr="xs"
                  >
                    Construction
                  </Text>
                  <Text size="xs" c="dimmed">
                    For managing progress payments
                  </Text>
                </Box>
                <IconChevronRight
                  className={classes.chevron}
                  stroke={1.5}
                  style={{
                    width: rem(16),
                    height: rem(16),
                    transform: openConstruction ? 'rotate(-90deg)' : 'none',
                    cursor: 'pointer',
                  }}
                />
              </Flex>
              <Collapse in={openConstruction} mt="xs">
                <Paper mt="sm">
                  <label htmlFor="phoneInput">Phone</label>
                  <PhoneInput
                    id="phoneInput"
                    international
                    defaultCountry="AU"
                    initialValueFormat="national"
                    value={lenderDetails?.construction_phone}
                    onChange={(value) =>
                      setLenderDetails({ ...lenderDetails, construction_phone: value })
                    }
                  />
                  <TextInput
                    leftSectionPointerEvents="none"
                    leftSection={icon}
                    label="Email"
                    placeholder="email"
                    value={lenderDetails?.construction_email}
                    onChange={(event) =>
                      setLenderDetails({ ...lenderDetails, construction_email: event.target.value })
                    }
                  />
                </Paper>
              </Collapse>
            </Box>

            {/* valuation */}
            <Box mt="md">
              <Flex onClick={toggleValuations} justify="space-between">
                <Box className={classes.titles} style={{ cursor: 'pointer' }}>
                  <Text
                    style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}
                    className={classes.customGray}
                    fz="sm"
                    tt="uppercase"
                    fw={700}
                    pr="xs"
                  >
                    Valuations
                  </Text>
                  <Text size="xs" c="dimmed">
                    For ordering valuations
                  </Text>
                </Box>
                <IconChevronRight
                  className={classes.chevron}
                  stroke={1.5}
                  style={{
                    width: rem(16),
                    height: rem(16),
                    transform: openValuations ? 'rotate(-90deg)' : 'none',
                    cursor: 'pointer',
                  }}
                />
              </Flex>
              <Collapse in={openValuations} mt="xs">
                <TextInput
                  leftSectionPointerEvents="none"
                  label="URL"
                  placeholder="url"
                  value={lenderDetails?.valuations_url}
                  onChange={(event) =>
                    setLenderDetails({ ...lenderDetails, valuations_url: event.target.value })
                  }
                />
                <TextInput
                  leftSectionPointerEvents="none"
                  label="User Name"
                  placeholder="name"
                  value={lenderDetails?.valuation_usrname}
                  onChange={(event) =>
                    setLenderDetails({ ...lenderDetails, valuation_usrname: event.target.value })
                  }
                />
              </Collapse>
            </Box>

            {/* variations */}
            <Box mt="md">
              <Flex onClick={toggleVariations} justify="space-between">
                <Box className={classes.titles} style={{ cursor: 'pointer' }}>
                  <Text
                    style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}
                    className={classes.customGray}
                    fz="sm"
                    tt="uppercase"
                    fw={700}
                    pr="xs"
                  >
                    Variations
                  </Text>
                </Box>
                <IconChevronRight
                  className={classes.chevron}
                  stroke={1.5}
                  style={{
                    width: rem(16),
                    height: rem(16),
                    transform: openVariations ? 'rotate(-90deg)' : 'none',
                    cursor: 'pointer',
                  }}
                />
              </Flex>
              <Collapse in={openVariations} mt="xs">
                <Paper mt="sm">
                  <label htmlFor="phoneInput">Phone</label>
                  <PhoneInput
                    id="phoneInput"
                    international
                    defaultCountry="AU"
                    initialValueFormat="national"
                    value={lenderDetails?.variations_phone}
                    onChange={(value) =>
                      setLenderDetails({ ...lenderDetails, variations_phone: value })
                    }
                  />
                  <TextInput
                    leftSectionPointerEvents="none"
                    leftSection={icon}
                    label="Email"
                    placeholder="email"
                    value={lenderDetails?.variations_email}
                    onChange={(event) =>
                      setLenderDetails({ ...lenderDetails, variations_email: event.target.value })
                    }
                  />
                </Paper>
              </Collapse>
            </Box>
            {/* pricing */}
            <Box mt="md">
              <Flex onClick={togglePricing} justify="space-between">
                <Box className={classes.titles} style={{ cursor: 'pointer' }}>
                  <Text
                    style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}
                    className={classes.customGray}
                    fz="sm"
                    tt="uppercase"
                    fw={700}
                    pr="xs"
                  >
                    Pricing
                  </Text>
                </Box>
                <IconChevronRight
                  className={classes.chevron}
                  stroke={1.5}
                  style={{
                    width: rem(16),
                    height: rem(16),
                    transform: openPricing ? 'rotate(-90deg)' : 'none',
                    cursor: 'pointer',
                  }}
                />
              </Flex>
              <Collapse in={openPricing} mt="xs">
                <TextInput
                  leftSectionPointerEvents="none"
                  label="Portal URL"
                  placeholder="url"
                  value={lenderDetails?.pricing_url}
                  onChange={(event) =>
                    setLenderDetails({ ...lenderDetails, pricing_url: event.target.value })
                  }
                />
              </Collapse>
            </Box>

            {/* insurance */}
            <Box mt="md">
              <Flex onClick={toggleInsurance} justify="space-between">
                <Box className={classes.titles} style={{ cursor: 'pointer' }}>
                  <Text
                    style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}
                    className={classes.customGray}
                    fz="sm"
                    tt="uppercase"
                    fw={700}
                    pr="xs"
                  >
                    Insurance
                  </Text>
                  <Text size="xs" c="dimmed">
                    Interested party name to go on the certificate of currency
                  </Text>
                </Box>
                <IconChevronRight
                  className={classes.chevron}
                  stroke={1.5}
                  style={{
                    width: rem(16),
                    height: rem(16),
                    transform: openInsurance ? 'rotate(-90deg)' : 'none',
                    cursor: 'pointer',
                  }}
                />
              </Flex>
              <Collapse in={openInsurance} mt="xs">
                <TextInput
                  leftSectionPointerEvents="none"
                  label="Intesrested Party"
                  placeholder="party"
                  value={lenderDetails?.insurance_party}
                  onChange={(event) =>
                    setLenderDetails({ ...lenderDetails, insurance_party: event.target.value })
                  }
                />
              </Collapse>
            </Box>

            {/* mortgage documents return address */}
            <Box mt="md">
              <Flex onClick={toggleMortgage} justify="space-between">
                <Box className={classes.titles} style={{ cursor: 'pointer' }}>
                  <Text
                    style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}
                    className={classes.customGray}
                    fz="sm"
                    tt="uppercase"
                    fw={700}
                    pr="xs"
                  >
                    Mortgage Documents Return Addresss
                  </Text>
                </Box>
                <IconChevronRight
                  className={classes.chevron}
                  stroke={1.5}
                  style={{
                    width: rem(16),
                    height: rem(16),
                    transform: openMortgage ? 'rotate(-90deg)' : 'none',
                    cursor: 'pointer',
                  }}
                />
              </Flex>
              <Collapse in={openMortgage} mt="xs">
                <TextInput
                  leftSectionPointerEvents="none"
                  label="Street Address 1"
                  placeholder="street address 1"
                  value={lenderDetails?.mortgage_docs_return_address1}
                  onChange={(event) =>
                    setLenderDetails({
                      ...lenderDetails,
                      mortgage_docs_return_address1: event.target.value,
                    })
                  }
                />
                <TextInput
                  leftSectionPointerEvents="none"
                  label="Street Address 2"
                  placeholder="street address 2"
                  value={lenderDetails?.mortgage_docs_return_address2}
                  onChange={(event) =>
                    setLenderDetails({
                      ...lenderDetails,
                      mortgage_docs_return_address2: event.target.value,
                    })
                  }
                />
                <TextInput
                  leftSectionPointerEvents="none"
                  label="Suburb/Town"
                  placeholder="suburb/town"
                  value={lenderDetails?.mortgage_docs_return_town}
                  onChange={(event) =>
                    setLenderDetails({
                      ...lenderDetails,
                      mortgage_docs_return_town: event.target.value,
                    })
                  }
                />
                <TextInput
                  leftSectionPointerEvents="none"
                  label="State"
                  placeholder="state"
                  value={lenderDetails?.mortgage_docs_return_state}
                  onChange={(event) =>
                    setLenderDetails({
                      ...lenderDetails,
                      mortgage_docs_return_state: event.target.value,
                    })
                  }
                />
                <TextInput
                  leftSectionPointerEvents="none"
                  label="Postcode"
                  placeholder="postcode"
                  value={lenderDetails?.mortgage_docs_return_postcode}
                  onChange={(event) =>
                    setLenderDetails({
                      ...lenderDetails,
                      mortgage_docs_return_postcode: event.target.value,
                    })
                  }
                />
              </Collapse>
            </Box>

            {/* first home owners grant */}
            <Box mt="md">
              <Flex onClick={toggleFirstHome} justify="space-between">
                <Box className={classes.titles} style={{ cursor: 'pointer' }}>
                  <Text
                    style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}
                    className={classes.customGray}
                    fz="sm"
                    tt="uppercase"
                    fw={700}
                    pr="xs"
                  >
                    First Home Owners Grant
                  </Text>
                </Box>
                <IconChevronRight
                  className={classes.chevron}
                  stroke={1.5}
                  style={{
                    width: rem(16),
                    height: rem(16),
                    transform: openFirstHome ? 'rotate(-90deg)' : 'none',
                    cursor: 'pointer',
                  }}
                />
              </Flex>
              <Collapse in={openFirstHome} mt="xs">
                <TextInput
                  leftSectionPointerEvents="none"
                  leftSection={icon}
                  label="FHOG Email"
                  placeholder="email"
                  value={lenderDetails?.first_home_owner_grant_email}
                  onChange={(event) =>
                    setLenderDetails({
                      ...lenderDetails,
                      first_home_owner_grant_email: event.target.value,
                    })
                  }
                />
                <TextInput
                  leftSectionPointerEvents="none"
                  label="Street Address 1"
                  placeholder="street address 1"
                  value={lenderDetails?.first_home_owner_grant_address1}
                  onChange={(event) =>
                    setLenderDetails({
                      ...lenderDetails,
                      first_home_owner_grant_address1: event.target.value,
                    })
                  }
                />
                <TextInput
                  leftSectionPointerEvents="none"
                  label="Street Address 2"
                  placeholder="street address 2"
                  value={lenderDetails?.first_home_owner_grant_address2}
                  onChange={(event) =>
                    setLenderDetails({
                      ...lenderDetails,
                      first_home_owner_grant_address2: event.target.value,
                    })
                  }
                />
                <TextInput
                  leftSectionPointerEvents="none"
                  label="Suburb/Town"
                  placeholder="suburb/town"
                  value={lenderDetails?.first_home_owner_grant_town}
                  onChange={(event) =>
                    setLenderDetails({
                      ...lenderDetails,
                      first_home_owner_grant_town: event.target.value,
                    })
                  }
                />
                <TextInput
                  leftSectionPointerEvents="none"
                  label="State"
                  placeholder="state"
                  value={lenderDetails?.first_home_owner_grant_state}
                  onChange={(event) =>
                    setLenderDetails({
                      ...lenderDetails,
                      first_home_owner_grant_state: event.target.value,
                    })
                  }
                />
                <TextInput
                  leftSectionPointerEvents="none"
                  label="Postcode"
                  placeholder="postcode"
                  value={lenderDetails?.first_home_owner_grant_postcode}
                  onChange={(event) =>
                    setLenderDetails({
                      ...lenderDetails,
                      first_home_owner_grant_postcode: event.target.value,
                    })
                  }
                />
              </Collapse>
            </Box>

            {/* discharges */}
            <Box mt="md">
              <Flex onClick={toggleDischarges} justify="space-between">
                <Box className={classes.titles} style={{ cursor: 'pointer' }}>
                  <Text
                    style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}
                    className={classes.customGray}
                    fz="sm"
                    tt="uppercase"
                    fw={700}
                    pr="xs"
                  >
                    Discharges
                  </Text>
                </Box>
                <IconChevronRight
                  className={classes.chevron}
                  stroke={1.5}
                  style={{
                    width: rem(16),
                    height: rem(16),
                    transform: openDischarges ? 'rotate(-90deg)' : 'none',
                    cursor: 'pointer',
                  }}
                />
              </Flex>
              <Collapse in={openDischarges} mt="xs">
                <label htmlFor="phoneInput">Phone</label>
                <PhoneInput
                  id="phoneInput"
                  international
                  defaultCountry="AU"
                  initialValueFormat="national"
                  value={lenderDetails?.discharges_phone}
                  onChange={(value) =>
                    setLenderDetails({ ...lenderDetails, discharges_phone: value })
                  }
                />
                <TextInput
                  leftSectionPointerEvents="none"
                  leftSection={icon}
                  label=" Email"
                  placeholder="email"
                  value={lenderDetails?.discharges_email}
                  onChange={(event) =>
                    setLenderDetails({ ...lenderDetails, discharges_email: event.target.value })
                  }
                />
                <label htmlFor="phoneInput">Fax</label>
                <PhoneInput
                  id="phoneInput"
                  international
                  defaultCountry="AU"
                  initialValueFormat="national"
                  value={lenderDetails?.discharges_fax}
                  onChange={(event) =>
                    setLenderDetails({ ...lenderDetails, discharges_fax: value })
                  }
                />
                <TextInput
                  leftSectionPointerEvents="none"
                  label="Discharge Authority URL"
                  placeholder="url"
                  value={lenderDetails?.discharges_authority_url}
                  onChange={(event) =>
                    setLenderDetails({
                      ...lenderDetails,
                      discharges_authority_url: event.target.value,
                    })
                  }
                />
                <Select
                  label="Discharge Authority"
                  placeholder="Pick value"
                  data={[
                    'Complete this Form online ',
                    'Complete Manual Form',
                    'Client to Request From Lender',
                  ]}
                  value={lenderDetails?.discharges_authority}
                  onChange={(value) =>
                    setLenderDetails({ ...lenderDetails, discharges_authority: value })
                  }
                />
              </Collapse>
            </Box>

            {/* reports*/}
            <Box mt="md">
              <Flex onClick={toggleReports} justify="space-between">
                <Box className={classes.titles} style={{ cursor: 'pointer' }}>
                  <Text
                    style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}
                    className={classes.customGray}
                    fz="sm"
                    tt="uppercase"
                    fw={700}
                    pr="xs"
                  >
                    Reports
                  </Text>
                </Box>
                <IconChevronRight
                  className={classes.chevron}
                  stroke={1.5}
                  style={{
                    width: rem(16),
                    height: rem(16),
                    transform: openReports ? 'rotate(-90deg)' : 'none',
                    cursor: 'pointer',
                  }}
                />
              </Flex>
              <Collapse in={openReports} mt="xs">
                <Textarea
                  leftSectionPointerEvents="none"
                  label="Internet Banking"
                  placeholder="write something..."
                  value={lenderDetails?.reports_internet_banking}
                  onChange={(event) =>
                    setLenderDetails({
                      ...lenderDetails,
                      reports_internet_banking: event.target.value,
                    })
                  }
                />
                <Textarea
                  leftSectionPointerEvents="none"
                  label="Offsets"
                  placeholder="write something..."
                  value={lenderDetails?.reports_offset}
                  onChange={(event) =>
                    setLenderDetails({ ...lenderDetails, reports_offset: event.target.value })
                  }
                />
                <Textarea
                  leftSectionPointerEvents="none"
                  label="Refinance Rebate"
                  placeholder="write something..."
                  value={lenderDetails?.reports_refinance_rebate}
                  onChange={(event) =>
                    setLenderDetails({
                      ...lenderDetails,
                      reports_refinance_rebate: event.target.value,
                    })
                  }
                />
                <Textarea
                  leftSectionPointerEvents="none"
                  label="Construction"
                  placeholder="write something..."
                  value={lenderDetails?.reports_construction}
                  onChange={(event) =>
                    setLenderDetails({ ...lenderDetails, reports_construction: event.target.value })
                  }
                />

                <Textarea
                  leftSectionPointerEvents="none"
                  label="Reminders"
                  placeholder="write something..."
                  value={lenderDetails?.reports_reminders}
                  onChange={(event) =>
                    setLenderDetails({ ...lenderDetails, reports_reminders: event.target.value })
                  }
                />
              </Collapse>
            </Box>
          </Box>
          <Flex justify="flex-end" p="sm">
            <Button onClick={saveLender}>{loading ? <Loader color="blue" /> : 'save'}</Button>
          </Flex>
        </Card>
      </Box>
    </SideBarLayout>
  );
}

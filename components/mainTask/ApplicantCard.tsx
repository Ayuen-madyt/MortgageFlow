'use client';

import { useEffect, useState } from 'react';
import { Text, Flex, Card, Collapse, rem, Box, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconChevronRight, IconEdit } from '@tabler/icons-react';
import classes from './Task.module.css';
import { Contact } from '@/utils/types';
import Link from 'next/link';
import { setAuthorizationToken } from '@/utils/axiosInstance';
import fetcher from '@/utils/fetcher';
import useSWR from 'swr';
import { useParams } from 'next/navigation';
import { useAppContext } from '@/ContextAPI/ContextAPI';

export function ApplicantCard() {
  const [opened, { toggle }] = useDisclosure(true);
  const [token, setToken] = useState('');

  const { task_id } = useParams();

  const { dispatch, state } = useAppContext();

  const { refetch_applicants } = state;

  const { data, mutate, isLoading } = useSWR(
    [`/main/task/get/applicants/${task_id}`, token],
    ([url, token]) => fetcher(url, token)
  );

  const handleApplicant = () => {
    dispatch({ type: 'SET_SHOW_APPLICANTS', payload: true });
  };

  console.log('applicants from its own api:', data);

  useEffect(() => {
    const access_token =
      typeof localStorage !== 'undefined' ? localStorage.getItem('broker_access_token') : null;

    setToken(access_token || '');
    setAuthorizationToken(access_token);
  }, []);

  useEffect(() => {
    if (refetch_applicants) {
      mutate([`/main/task/get/applicants/${task_id}`, token]);
      dispatch({ type: 'SET_REFETCH_APPLICANTS', payload: false });
    }
  }, [refetch_applicants, task_id, token]);

  return (
    <Card withBorder radius="md" padding="sm" bg="var(--mantine-color-body)" mt="sm">
      <Flex justify="space-between">
        <Box onClick={handleApplicant} className={classes.titles} style={{ cursor: 'pointer' }}>
          <Text
            style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}
            className={classes.customGray}
            fz="sm"
            tt="uppercase"
            fw={700}
            pr="xs"
          >
            Applicant Details
            <IconEdit
              style={{
                width: rem(16),
                height: rem(16),
                marginLeft: '5px',
              }}
              stroke={1.5}
            />
          </Text>
        </Box>
        <IconChevronRight
          onClick={toggle}
          stroke={1.5}
          style={{
            width: rem(16),
            height: rem(16),
            transform: opened ? 'rotate(-90deg)' : 'none',
            cursor: 'pointer',
          }}
        />
      </Flex>
      <Collapse in={opened} mt="md">
        {(data || []).map((applicant: Contact, index: any) => (
          <Box mb="md" key={index}>
            <Link className={classes.relatedPartyLink} href="" style={{ textDecoration: 'none' }}>
              <Title order={6}>
                {`${applicant.first_name} ${applicant.last_name} (${applicant.role})`}
              </Title>
            </Link>
            <Flex gap="xs">
              <Text className={classes.customGray} fw={500} size="sm">
                Phone:
              </Text>
              <Text className={classes.customGray} size="sm">
                {applicant.mobile_number}
              </Text>
            </Flex>
            <Flex gap="sm">
              <Text className={classes.customGray} fw={500} size="sm">
                Email:
              </Text>
              <Text className={classes.customGray} size="sm">
                {applicant.email}
              </Text>
            </Flex>
          </Box>
        ))}
      </Collapse>
    </Card>
  );
}

'use client';

import { Text, Flex, Progress, Card, Collapse, rem, Group, Box, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconChevronRight, IconEdit } from '@tabler/icons-react';
import classes from './Task.module.css';
import Link from 'next/link';
import { useAppContext } from '@/ContextAPI/ContextAPI';

interface ContactData {
  contact_id: number;
  email: string;
  first_name: string;
  last_name: string;
  mobile_number: string;
  preferred_name: string;
  type: string;
}

export function BuildingAndPestProviderCard({ contact }: { contact: ContactData }) {
  const [opened, { toggle }] = useDisclosure(true);

  const { dispatch } = useAppContext();

  const handleContactType = () => {
    dispatch({ type: 'SET_CONTACT_TYPE', payload: 'building_pest_provider' });
    dispatch({ type: 'SET_SHOW_CONTACT', payload: true });
    dispatch({ type: 'SET_CONTACT_ID', payload: contact?.contact_id });
  };

  return (
    <Card withBorder mt="sm" radius="md" padding="sm" bg="var(--mantine-color-body)">
      <Flex justify="space-between">
        <Box onClick={handleContactType} className={classes.titles} style={{ cursor: 'pointer' }}>
          <Text
            style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}
            className={classes.customGray}
            fz="sm"
            tt="uppercase"
            fw={700}
            pr="xs"
          >
            Building And Pest Provider
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
      <Collapse in={opened} mt="xs">
        {contact ? (
          <Box mb="md" key={contact?.contact_id}>
            <Title order={6} className={classes.customGray}>
              {`${contact?.first_name} ${contact?.last_name}`}
            </Title>
            <Flex gap="sm">
              <Text className={classes.customGray} size="sm">
                Phone:
              </Text>
              <Text className={classes.customGray} size="sm">
                {contact?.mobile_number}
              </Text>
            </Flex>
            <Flex gap="sm">
              <Text className={classes.customGray} size="sm">
                Email:
              </Text>
              <Text className={classes.customGray} size="sm">
                {contact?.email}
              </Text>
            </Flex>
          </Box>
        ) : (
          <Text>-</Text>
        )}
      </Collapse>
    </Card>
  );
}

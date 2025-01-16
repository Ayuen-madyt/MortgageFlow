'use client';

import { Text, Flex, Card, Collapse, rem, Box, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconChevronRight, IconEdit } from '@tabler/icons-react';
import classes from './Task.module.css';
import Link from 'next/link';
import { useAppContext } from '@/ContextAPI/ContextAPI';

export interface Broker {
  broker_id: number | null;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
}

export interface Lender {
  lender_id: number | null;
  lender_name: string | null;
  phone: string | null;
  email: string | null;
  broker: number;
  lender_legal: string | null;
}

export function BrokerCard({ broker, lender }: { broker: Broker; lender: Lender }) {
  const [opened, { toggle }] = useDisclosure(true);

  const { state, dispatch } = useAppContext();
  const { showBroker } = state;

  const handleShowBrokerClick = () => {
    dispatch({ type: 'SET_SHOW_BROKER', payload: true });
    dispatch({ type: 'SET_CONTACT_ID', payload: broker.broker_id });
    dispatch({ type: 'SET_LENDER_ID', payload: lender.lender_id });
  };

  return (
    <Card withBorder mt="sm" radius="md" padding="sm" bg="var(--mantine-color-body)">
      <Flex justify="space-between">
        <Box
          onClick={handleShowBrokerClick}
          className={classes.titles}
          style={{ cursor: 'pointer' }}
        >
          <Text
            style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}
            className={classes.customGray}
            fz="sm"
            tt="uppercase"
            fw={700}
            pr="xs"
          >
            Broker Details
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
          }}
        />
      </Flex>
      <Collapse in={opened} mt="xs">
        <Box mb="md" key={broker?.broker_id}>
          <Link className={classes.relatedPartyLink} href="" style={{ textDecoration: 'none' }}>
            <Title order={6}>{`${broker?.first_name} ${broker?.last_name}`}</Title>
          </Link>
          <Flex gap="sm">
            <Text className={classes.customGray} size="sm">
              Phone:
            </Text>
            <Text className={classes.customGray} size="sm">
              {broker?.phone}
            </Text>
          </Flex>
          <Flex gap="sm">
            <Text className={classes.customGray} size="sm">
              Email:
            </Text>
            <Text className={classes.customGray} size="sm">
              {broker?.email}
            </Text>
          </Flex>
        </Box>
      </Collapse>
    </Card>
  );
}

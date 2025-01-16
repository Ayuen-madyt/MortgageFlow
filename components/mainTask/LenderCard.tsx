'use client';

import { Text, Flex, Progress, Card, Collapse, rem, Group, Box, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconChevronRight, IconEdit } from '@tabler/icons-react';
import classes from './Task.module.css';
import Link from 'next/link';
import { useAppContext } from '@/ContextAPI/ContextAPI';

export interface LenderShortened {
  lender_id: number | null;
  lender_name: string | null;
  phone: string | null;
  email: string | null;
  broker: number;
  lender_legal: string | null;
}

export function LenderCard({ lender }: { lender: LenderShortened }) {
  const [opened, { toggle }] = useDisclosure(true);

  const { dispatch } = useAppContext();

  const handleContactType = () => {
    dispatch({ type: 'SET_LENDER_ID', payload: lender?.lender_id });
    dispatch({ type: 'SET_SHOW_LENDER', payload: true });
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
            Lender Details
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
          className={classes.chevron}
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
        {lender ? (
          <Box mb="md" key={lender?.lender_id}>
            <Link className={classes.relatedPartyLink} href="" style={{ textDecoration: 'none' }}>
              <Title order={6}>{lender.lender_name}</Title>
            </Link>
            <Flex gap="xs">
              <Text className={classes.customGray} fw={500} size="sm">
                Phone:
              </Text>
              <Text className={classes.customGray} size="sm">
                {lender?.phone}
              </Text>
            </Flex>
            <Flex gap="sm">
              <Text className={classes.customGray} fw={500} size="sm">
                Email:
              </Text>
              <Text className={classes.customGray} size="sm">
                {lender?.email}
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

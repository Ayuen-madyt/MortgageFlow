'use client';

import { Text, Flex, Progress, Card, Collapse, rem, Group, Box, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconChevronRight, IconEdit } from '@tabler/icons-react';
import classes from './Task.module.css';
import Link from 'next/link';

export function SecurityCard() {
  const [opened, { toggle }] = useDisclosure(true);

  return (
    <Card withBorder mt="sm" radius="md" padding="sm" bg="var(--mantine-color-body)">
      <Flex justify="space-between" onClick={toggle}>
        <Link href="" className={classes.titles}>
          <Text
            style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}
            className={classes.customGray}
            fz="sm"
            tt="uppercase"
            fw={700}
            pr="xs"
          >
            Security
            <IconEdit
              style={{
                width: rem(16),
                height: rem(16),
                marginLeft: '5px',
              }}
              stroke={1.5}
            />
          </Text>
        </Link>
        <IconChevronRight
          stroke={1.5}
          style={{
            width: rem(16),
            height: rem(16),
            transform: opened ? 'rotate(-90deg)' : 'none',
          }}
        />
      </Flex>
      <Collapse in={opened} mt="xs">
        <Text>-</Text>
      </Collapse>
    </Card>
  );
}

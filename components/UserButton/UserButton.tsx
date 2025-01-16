'use client';

import React, { useState, useEffect } from 'react';
import { UnstyledButton, Group, Avatar, Text, rem, Popover, Button, Flex } from '@mantine/core';
import { IconChevronRight, IconLogout } from '@tabler/icons-react';
import { jwtDecode } from 'jwt-decode';
import classes from './UserButton.module.css';
import { axiosInstance, setAuthorizationToken } from '@/utils/axiosInstance';
import fetcher from '@/utils/fetcher';
import useSWR from 'swr';

export function UserButton() {
  const [user, setUser] = useState<Record<string, any> | null>(null);

  const { data: userData, mutate, isLoading } = useSWR('/user', fetcher);

  const signOut = () => {
    axiosInstance
      .post('/auth/logout')
      .then((res) => {
        localStorage.removeItem('access_token');
        window.location.reload();
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token !== null) {
      try {
        const decoded = jwtDecode(token);
        setUser(decoded);
      } catch (error) {
        console.error('Error decoding JWT:', error);
      }
    } else {
      console.error('Token is null in localStorage');
    }
  }, []);

  return (
    <Popover width={200} position="bottom" withArrow shadow="md">
      <Popover.Target>
        <UnstyledButton className={classes.user}>
          <Group>
            <div style={{ flex: 1 }}>
              <Text size="sm" fw={500}>
                {`${userData?.user?.first_name} ${userData?.user?.last_name}`}
              </Text>

              <Text c="dimmed" size="xs">
                {userData?.user?.email && userData?.user?.email}
              </Text>
            </div>

            <IconChevronRight style={{ width: rem(14), height: rem(14) }} stroke={1.5} />
          </Group>
        </UnstyledButton>
      </Popover.Target>
      <Popover.Dropdown>
        <Flex justify="flex-start" gap="sm" style={{ cursor: 'pointer' }} onClick={signOut}>
          <Button size="compact-sm">
            <IconLogout />
          </Button>
          <Text>Sign Out</Text>
        </Flex>
      </Popover.Dropdown>
    </Popover>
  );
}

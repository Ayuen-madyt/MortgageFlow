'use client';

import { useState, useEffect } from 'react';
import { Grid, Skeleton, Card, Title, Flex } from '@mantine/core';
import SideBarLayout from '@/components/SidebarLayout/SideBarLayout';
import Detail from '../contact-detail/[contact_id]/Detail';
import Deals from '../contact-detail/[contact_id]/Deals';
import { usePathname } from 'next/navigation';
import {
  IconUser,
  IconListDetails,
  IconListCheck,
  IconTemplate,
  IconUsersGroup,
} from '@tabler/icons-react';
import classes from '../../components/mainTask/Task.module.css';
import { jwtDecode } from 'jwt-decode';
import Link from 'next/link';
import { checkActiveLink } from '@/utils/checkActiveLink';

export default function SettingsLayout({ children }: { children: any }) {
  const [user, setUser] = useState<Record<string, any> | null>(null);
  const pathname = usePathname();

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
    <SideBarLayout broker="" title="Setting" showButton={false} showBgWhite={false}>
      <Grid style={{ height: '100%' }}>
        <Grid.Col span={{ base: 12, xs: 3 }}>
          <Card withBorder radius="md" padding="sm" bg="var(--mantine-color-body)">
            <Link
              href="/settings"
              className={
                checkActiveLink('/settings', pathname)
                  ? classes.settingsHighlighted
                  : classes.settingsNotHighlighted
              }
            >
              <Flex justify="flex-start" gap="sm">
                <IconUser size={22} />

                <Title order={5}>Personal Details</Title>
              </Flex>
            </Link>
          </Card>
          <Card withBorder mt="xs" radius="md" padding="sm" bg="var(--mantine-color-body)">
            <Link
              href="/settings/boards-and-stages"
              className={
                checkActiveLink('/settings/boards-and-stages', pathname)
                  ? classes.settingsHighlighted
                  : classes.settingsNotHighlighted
              }
            >
              <Flex justify="flex-start" style={{ cursor: 'pointer' }} gap="sm">
                <IconListDetails size={22} />

                <Title order={5}>Boards & Stages</Title>
              </Flex>
            </Link>
          </Card>
          <Card withBorder mt="xs" radius="md" padding="sm" bg="var(--mantine-color-body)">
            <Link
              href="/settings/task-templates"
              className={
                checkActiveLink('/settings/task-templates', pathname)
                  ? classes.settingsHighlighted
                  : classes.settingsNotHighlighted
              }
            >
              <Flex justify="flex-start" style={{ cursor: 'pointer' }} gap="sm">
                <IconTemplate size={22} />

                <Title order={5}>Task Templates</Title>
              </Flex>
            </Link>
          </Card>
          <Card withBorder mt="xs" radius="md" padding="sm" bg="var(--mantine-color-body)">
            <Link
              href="/settings/note-templates"
              className={
                checkActiveLink('/settings/note-templates', pathname)
                  ? classes.settingsHighlighted
                  : classes.settingsNotHighlighted
              }
            >
              <Flex justify="flex-start" style={{ cursor: 'pointer' }} gap="sm">
                <IconTemplate size={22} />

                <Title order={5}>Note Templates</Title>
              </Flex>
            </Link>
          </Card>
          {user?.isAdmin === 1 && (
            <Card withBorder mt="xs" radius="md" padding="sm" bg="var(--mantine-color-body)">
              <Link
                href="/settings/brokers"
                className={
                  checkActiveLink('/settings/brokers', pathname)
                    ? classes.settingsHighlighted
                    : classes.settingsNotHighlighted
                }
              >
                <Flex justify="flex-start" style={{ cursor: 'pointer' }} gap="sm">
                  <IconUsersGroup size={22} />

                  <Title order={5}>Brokers</Title>
                </Flex>
              </Link>
            </Card>
          )}

          {/* <Card withBorder mt="xs" radius="md" padding="sm" bg="var(--mantine-color-body)">
            <Flex justify="flex-start" style={{ cursor: 'pointer' }} gap="sm">
              <IconCirclesFilled size={22} />
              <Title order={5}>Team Roles</Title>
            </Flex>
          </Card>
          <Card withBorder mt="xs" radius="md" padding="sm" bg="var(--mantine-color-body)">
            <Flex justify="flex-start" style={{ cursor: 'pointer' }} gap="sm">
              <IconUsersGroup size={22} />
              <Title order={5}>Teams</Title>
            </Flex>
          </Card> */}
          <Card withBorder mt="xs" radius="md" padding="sm" bg="var(--mantine-color-body)">
            <Link
              href="/settings/checklists"
              className={
                checkActiveLink('/settings/checklists', pathname)
                  ? classes.settingsHighlighted
                  : classes.settingsNotHighlighted
              }
            >
              <Flex justify="flex-start" style={{ cursor: 'pointer' }} gap="sm">
                <IconListCheck size={22} />

                <Title order={5}>Checklists</Title>
              </Flex>
            </Link>
          </Card>
        </Grid.Col>
        <Grid.Col span={{ base: 12, xs: 9 }}>{children}</Grid.Col>
      </Grid>
    </SideBarLayout>
  );
}

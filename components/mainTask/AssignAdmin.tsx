'use client';

import { Text, Flex, Select, Card, Box } from '@mantine/core';
import useSWR from 'swr';
import fetcher from '@/utils/fetcher';
import { axiosInstance, setAuthorizationToken } from '@/utils/axiosInstance';
import { notifications } from '@mantine/notifications';
import { UserData, AssignedAdmin } from '@/utils/types';

export function AssignAdminCard({
  main_task_id,
  assignedAdmin,
}: {
  main_task_id: string;
  assignedAdmin: AssignedAdmin;
}) {
  const { data, mutate } = useSWR<UserData[]>('/user/users', fetcher);

  const handleAssignAdmin = (value: string) => {
    if (value) {
      axiosInstance
        .put(
          `/main/task/assign/admin/to-task/${main_task_id}`,
          {
            assigned_admin: parseInt(value),
          },
          {
            headers: {
              Authorization: `Bearer ${
                typeof localStorage !== 'undefined'
                  ? localStorage.getItem('broker_access_token') ||
                    localStorage.getItem('access_token')
                  : null
              }`,
            },
          }
        )
        .then((res) => {
          notifications.show({
            title: 'Success',
            message: 'Admin assigned',
            color: 'teal',
          });
        })
        .catch((err) => {
          notifications.show({
            title: 'Error',
            message: 'Error assigning admin',
            color: 'red',
          });
        });
    } else if (value === null) {
      axiosInstance
        .put(
          `/main/task/assign/admin/to-task/${main_task_id}`,
          {
            assigned_admin: parseInt(value),
          },
          {
            headers: {
              Authorization: `Bearer ${
                typeof localStorage !== 'undefined'
                  ? localStorage.getItem('broker_access_token') ||
                    localStorage.getItem('access_token')
                  : null
              }`,
            },
          }
        )
        .then((res) => {
          console.log(res);
          notifications.show({
            title: 'Success',
            message: 'Broker unassigned',
            color: 'teal',
          });
        })
        .catch((err) => {
          console.log(err);
          notifications.show({
            title: 'Error',
            message: 'Error unassigning broker',
            color: 'red',
          });
        });
    }
  };
  return (
    <Box>
      <Text size="xs" c="dimmed" tt="lowercase">
        Move this deal for admin to follow up on it
      </Text>

      <Box mb="md" mt="xs">
        {data && (
          <Flex justify="flex-start" gap="xs" align="center">
            <Select
              placeholder="Choose admin"
              defaultValue={assignedAdmin?.assigned_admin_id?.toString()}
              data={data?.map((user) => ({
                label: `${user.first_name} ${user.last_name}`,
                value: `${user.user_id}`,
              }))}
              onChange={(value) => handleAssignAdmin(value!)}
            />
          </Flex>
        )}
      </Box>
    </Box>
  );
}

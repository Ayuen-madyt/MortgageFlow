'use client';
import React, { useState, useEffect, Fragment } from 'react';
import SideBarLayout from '@/components/SidebarLayout/SideBarLayout';
import { Center, Flex, Loader, Pagination, Title } from '@mantine/core';

import fetcher from '@/utils/fetcher';
import useSWR from 'swr';

import TaskCard from '@/components/Board/TaskCard';

export default function page() {
  const [token, setToken] = useState('');
  const [activePage, setActivePage] = useState(1);
  const pageSize = 20;

  useEffect(() => {
    const access_token =
      typeof localStorage !== 'undefined' ? localStorage.getItem('broker_access_token') : null;

    setToken(access_token);
  }, []);

  const { data, mutate, isLoading } = useSWR(
    [`/main/task/get/assigned-boards?page=${activePage}&pageSize=${pageSize}`, token],
    ([url, token]) => fetcher(url, token)
  );

  return (
    <SideBarLayout title="Assigned Deal" showButton={false} showBgWhite={false} broker="">
      {data?.length == 0 ? (
        <Title order={5}>No assigned deals</Title>
      ) : (
        <Fragment>
          {isLoading ? (
            <Center mt="xl">
              <Loader size="md" />
            </Center>
          ) : (
            <Fragment>
              <Flex justify="flex-start" align="center" wrap="wrap" rowGap="sm" gap="sm">
                {data?.mainTasks?.map((task, index) => (
                  <TaskCard task={task} task_id={task.main_task_id} index={index} />
                ))}
              </Flex>

              <Pagination
                total={data?.pagination?.totalPages}
                value={data?.pagination?.page}
                onChange={setActivePage}
                mt="sm"
              />
            </Fragment>
          )}
        </Fragment>
      )}
    </SideBarLayout>
  );
}

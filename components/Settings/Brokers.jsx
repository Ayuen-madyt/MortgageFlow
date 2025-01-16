'use client';

import React, { Fragment, useState, useEffect } from 'react';
import SideBarLayout from '@/components/SidebarLayout/SideBarLayout';
import cx from 'clsx';
import {
  Table,
  Checkbox,
  ScrollArea,
  Group,
  Popover,
  Text,
  rem,
  Card,
  TextInput,
  Box,
  ActionIcon,
  useMantineTheme,
  Button,
  Flex,
  Badge,
  Anchor,
  Tooltip,
  Pagination,
  Title,
  Modal,
  Drawer,
  Loader,
  Center,
  Divider,
  PasswordInput,
  Select,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useForm, isNotEmpty } from '@mantine/form';
import classes from '../../components/mainTask/Task.module.css';
import { IconSearch, IconPlus, IconTrash, IconArrowRight, IconAt } from '@tabler/icons-react';
import fetcher from '@/utils/fetcher';
import useSWR from 'swr';
import { axiosInstance, setAuthorizationToken } from '@/utils/axiosInstance';
import { notifications } from '@mantine/notifications';
import Link from 'next/link';

export default function Brokers() {
  const theme = useMantineTheme();
  const [opened, { open, close }] = useDisclosure(false);

  const [selectedID, setSelectedID] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [disableButton, setDisableButton] = useState(true);
  const [activePage, setActivePage] = useState(1);
  const [brokerAdded, setBrokerAdded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [loading, setLoading] = useState(false);

  const { data: brokers, mutate, isLoading } = useSWR('/user/brokers', fetcher);

  const icon = <IconAt style={{ width: rem(16), height: rem(16) }} />;

  const toggleRow = (id) => {
    setDisableButton(!disableButton);
    setSelectedID((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  };

  const toggleAll = () => {
    setDisableButton(!disableButton);
    setSelectedID((current) =>
      current.length === (filteredData || brokers?.brokers)?.length
        ? []
        : (filteredData || brokers?.brokers)?.map((broker) => broker.user_id.toString())
    );
  };

  const form = useForm({
    initialValues: {
      email: '',
      password: '',
      is_admin: false,
    },

    validate: {
      email: isNotEmpty(),
      password: (val) => (val.length <= 6 ? 'Password should include at least 6 characters' : null),
    },

    transformValues: (values) => ({
      email: values.email.trim(),
      password: values.password.trim(),
      is_admin: values.is_admin,
    }),
  });

  const addBroker = () => {
    const { email, password, is_admin } = form.values;
    form.validate();
    if (form.isValid()) {
      setLoading(true);
      axiosInstance
        .post('/auth/register', { email, password, is_admin }, { withCredentials: true })
        .then((res) => {
          setLoading(false);
          setFilteredData([res.data, ...filteredData]);
          close();
          notifications.show({
            color: 'teal',
            title: 'Success',
            message: 'Broker added',
          });
        })
        .catch((error) => {
          setLoading(false);
          console.error(
            'Error creating user:',
            error.response ? error.response.data : error.message
          );
          notifications.show({
            color: 'red',
            title: 'Error',
            message: error.response ? error.response.data : error.message,
          });
        });
    }
  };

  const deleteBroker = () => {
    const selectedTaskIds = selectedID.map((id) => parseInt(id, 10));

    const updateBrokers = (filteredData || brokers?.brokers)?.filter(
      (broker) => !selectedTaskIds.includes(broker.user_id)
    );

    axiosInstance
      .delete(`/user/delete`, { data: { broker_ids: selectedTaskIds } })
      .then((res) => {
        setFilteredData(updateBrokers);
        notifications.show({
          title: 'Deletion',
          color: 'red',
          message: 'Broker(s) deleted!',
        });
      })
      .catch((err) => {
        console.error('Error deleting broker:', err);
        notifications.show({
          title: 'Error',
          color: 'red',
          message: 'Error deleting broker(s)',
        });
      });
  };

  const removeMakeAdmin = (brokerId, value) => {
    console.log('broker id:', brokerId);
    if (value === 0) {
      // remove from admin
      axiosInstance
        .put(`/user/update/broker/${brokerId}`, { is_admin: value })
        .then((res) => {
          setFilteredData((prevData) =>
            prevData.map((user) =>
              user.user_id === brokerId ? { ...user, is_admin: value } : user
            )
          );
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      // make admin
      axiosInstance
        .put(`/user/update/broker/${brokerId}`, { is_admin: value })
        .then((res) => {
          setFilteredData((prevData) =>
            prevData.map((user) =>
              user.user_id === brokerId ? { ...user, is_admin: value } : user
            )
          );
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };

  const handleSearch = () => {
    setLoadingSearch(true);
    axiosInstance
      .get(`/user/search/brokers?q=${searchTerm}`)
      .then((response) => {
        setLoadingSearch(false);
        setFilteredData(response.data);
      })
      .catch((error) => {
        console.error('Search error:', error);
        setLoadingSearch(false);
      });
  };

  const handleChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const getBrokerJwt = (id) => {
    axiosInstance
      .post(`/auth/get/jwt`, { user_id: id })
      .then((res) => {
        console.log('access token', res);
        localStorage.setItem('broker_access_token', res.data.token);
        window.open('/tasks', '_blank');
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    const pageSize = 10;
    if (activePage) {
      axiosInstance
        .get(`/user/brokers?page=${activePage}&pageSize=${pageSize}`)
        .then((res) => {
          setFilteredData(res.data.brokers);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, [activePage]);

  const rows = (filteredData || brokers?.brokers)?.map((user) => {
    const selected = selectedID.includes(user?.user_id.toString());
    return (
      <Table.Tr key={user.user_id} className={cx({ [classes.rowSelected]: selected })}>
        <Table.Td>
          <Checkbox
            checked={selectedID.includes(user.user_id.toString())}
            onChange={() => toggleRow(user.user_id.toString())}
          />
        </Table.Td>
        <Table.Td>
          <Text>{user?.first_name ? `${user.first_name} ${user.last_name}` : '-'}</Text>
        </Table.Td>
        <Table.Td>{user.email || '-'}</Table.Td>
        <Table.Td>
          {user.is_admin === 1 ? (
            <Badge color="teal">True</Badge>
          ) : (
            <Badge color="grey">False</Badge>
          )}
        </Table.Td>

        <Table.Td>
          {user.is_admin === 1 ? (
            <Button color="grey" onClick={() => removeMakeAdmin(user.user_id, 0)} size="compact-xs">
              Remove Admin
            </Button>
          ) : (
            <Button onClick={() => removeMakeAdmin(user.user_id, 1)} size="compact-xs">
              Make Admin
            </Button>
          )}
        </Table.Td>
        <Table.Td>
          <Button onClick={() => getBrokerJwt(user.user_id)} size="compact-xs">
            <Anchor fz="sm" style={{ textDecoration: 'none', color: 'white' }}>
              View board
            </Anchor>
          </Button>
        </Table.Td>
      </Table.Tr>
    );
  });

  return (
    <Box>
      <Card withBorder radius="md" padding="sm" bg="var(--mantine-color-body)">
        <Title className={classes.customGray} order={4}>
          Brokers
        </Title>
        <Divider mt="sm" />
        <Flex justify="space-between" mt="md">
          <TextInput
            radius="md"
            size="md"
            placeholder="Search"
            rightSectionWidth={42}
            leftSection={<IconSearch style={{ width: rem(18), height: rem(18) }} stroke={1.5} />}
            onChange={handleChange}
            value={searchTerm}
            rightSection={
              <ActionIcon
                onClick={handleSearch}
                size={32}
                radius="xl"
                color={theme.primaryColor}
                variant="filled"
              >
                {loadingSearch ? (
                  <Loader color="white" size="xs" />
                ) : (
                  <IconArrowRight style={{ width: rem(18), height: rem(18) }} stroke={1.5} />
                )}
              </ActionIcon>
            }
          />
          <Flex justify="space-between" gap="xs">
            <Fragment>
              <Button disabled={disableButton} onClick={deleteBroker} color="red" size="compact-sm">
                <IconTrash size={15} />
              </Button>
              <Tooltip label="New Broker">
                <Button onClick={open} size="compact-sm">
                  <IconPlus size={15} />
                </Button>
              </Tooltip>
            </Fragment>
          </Flex>
        </Flex>
        {isLoading ? (
          <Center mt={100} mb={100}>
            <Loader size="lg" />
          </Center>
        ) : (
          <Fragment>
            <Fragment>
              <ScrollArea>
                <Table miw={800} verticalSpacing="sm">
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th style={{ width: rem(40) }}>
                        <Checkbox
                          onChange={toggleAll}
                          checked={selectedID.length === (filteredData || brokers?.brokers)?.length}
                          indeterminate={
                            selectedID.length > 0 &&
                            selectedID.length !== (filteredData || brokers?.brokers)?.length
                          }
                        />
                      </Table.Th>
                      <Table.Th>Name</Table.Th>
                      <Table.Th>Email</Table.Th>
                      <Table.Th>Is Admin</Table.Th>
                      <Table.Th>Actions</Table.Th>
                      <Table.Th>View</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>{rows}</Table.Tbody>
                </Table>
              </ScrollArea>
              <Pagination
                total={brokers?.pagination?.totalPages || 0}
                value={activePage}
                onChange={setActivePage}
                mt="sm"
              />
            </Fragment>
          </Fragment>
        )}
      </Card>

      {/* modal begins */}
      <Modal opened={opened} onClose={close} withCloseButton={false}>
        <Title order={4}>Add Broker</Title>
        <TextInput
          leftSectionPointerEvents="none"
          leftSection={icon}
          label="Email"
          placeholder="email"
          value={form.values.email}
          onChange={(event) => form.setFieldValue('email', event.currentTarget.value)}
          error={form.errors.email && 'Invalid email'}
        />
        <PasswordInput
          label="Password"
          description="Input description"
          placeholder="Input placeholder"
          value={form.values.password}
          onChange={(event) => form.setFieldValue('password', event.currentTarget.value)}
          error={form.errors.password && 'Password should include at least 6 characters'}
        />

        <Checkbox
          mt="md"
          checked={form.values.is_admin}
          label="Make broker admin"
          onChange={(event) => form.setFieldValue('is_admin', event.currentTarget.checked)}
        />

        <Flex justify="flex-end" mt="md">
          <Button onClick={addBroker} disabled={loading}>
            {loading ? <Loader size="sm" color="white" /> : 'Save'}
          </Button>
        </Flex>
      </Modal>
    </Box>
  );
}

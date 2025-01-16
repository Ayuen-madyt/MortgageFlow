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
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import classes from '../../components/mainTask/Task.module.css';
import {
  IconSearch,
  IconCircleCheck,
  IconPlus,
  IconTrash,
  IconX,
  IconFileExport,
  IconArrowRight,
} from '@tabler/icons-react';
import fetcher from '@/utils/fetcher';
import useSWR from 'swr';
import { axiosInstance, setAuthorizationToken } from '@/utils/axiosInstance';
import { Lender, Contact } from '@/utils/types';
import { notifications } from '@mantine/notifications';
import { CSVLink, CSVDownload } from 'react-csv';
import { useAppContext } from '@/ContextAPI/ContextAPI';
import AddLender from './AddLender';
import Link from 'next/link';

export default function page() {
  const theme = useMantineTheme();
  const [opened, { open, close }] = useDisclosure(false);

  const [selectedID, setSelectedID] = useState<string[]>([]);
  const [filteredData, setFilteredData] = useState([]);
  const [disableButton, setDisableButton] = useState(true);
  const [activePage, setActivePage] = useState(1);
  const [lenderAdded, setlenderAdded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [token, setToken] = useState<string | null>('');
  const pageSize = 10;

  useEffect(() => {
    const access_token: string | null =
      typeof localStorage !== 'undefined' ? localStorage.getItem('broker_access_token') : null;

    setToken(access_token);
  }, []);

  const {
    data: lenders,
    mutate: mutateLenders,
    isLoading,
  } = useSWR([`/lender/all?page=${activePage}&pageSize=${pageSize}`, token], ([url, token]) =>
    fetcher(url, token as string)
  );

  const toggleRow = (id: string) => {
    setDisableButton(false);
    setSelectedID((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  };

  const toggleAll = () => {
    setDisableButton(!disableButton);
    setSelectedID((current) =>
      current.length === (filteredData?.length ? filteredData : lenders?.lenders)?.length
        ? []
        : (filteredData?.length ? filteredData : lenders?.lenders)?.map((lender: Lender) =>
            lender.lender_id.toString()
          )
    );
  };

  const deleteLender = () => {
    const selectedTaskIds = selectedID.map((id) => parseInt(id, 10));

    const updatedLenders = (filteredData?.length ? filteredData : lenders?.lenders)?.filter(
      (lender: Lender) => !selectedTaskIds.includes(lender.lender_id)
    );

    axiosInstance
      .delete(`/lender/delete`, { data: { lender_ids: selectedTaskIds } })
      .then((res) => {
        setFilteredData(updatedLenders);
        notifications.show({
          title: 'Deletion',
          color: 'red',
          message: 'Lender(s) deleted!',
        });
      })
      .catch((err) => {
        console.error('Error deleting lender:', err);
        notifications.show({
          title: 'Error',
          color: 'red',
          message:
            err.response.data.details.sqlMessage ==
            'Cannot delete or update a parent row: a foreign key constraint fails (`brokerpa`.`main_task`, CONSTRAINT `main_task_ibfk_10` FOREIGN KEY (`lender_id`) REFERENCES `lender` (`lender_id`))'
              ? 'Cannot delete. Lender linked to a deal'
              : 'Error deleting lender(s)',
        });
      });
  };

  const handleSearch = () => {
    setLoadingSearch(true);
    axiosInstance
      .get(`/lender/search?q=${searchTerm}`, {
        headers: {
          Authorization: `Bearer ${
            typeof localStorage !== 'undefined'
              ? localStorage.getItem('broker_access_token') || localStorage.getItem('access_token')
              : null
          }`,
        },
      })
      .then((response) => {
        console.log('results:', response);
        setLoadingSearch(false);
        setFilteredData(response.data);
      })
      .catch((error) => {
        console.error('Search error:', error);
        setLoadingSearch(false);
      });
  };

  const handleChange = (event: any) => {
    setSearchTerm(event.target.value);
  };

  useEffect(() => {
    if (lenderAdded) {
      mutateLenders();
    }
  }, [lenderAdded]);

  const rows = (filteredData?.length ? filteredData : lenders?.lenders)?.map((lender: Lender) => {
    const selected = selectedID.includes(lender?.lender_id.toString());
    return (
      <Table.Tr key={lender.lender_id} className={cx({ [classes.rowSelected]: selected })}>
        <Table.Td>
          <Checkbox
            checked={selectedID.includes(lender.lender_id.toString())}
            onChange={() => toggleRow(lender.lender_id.toString())}
          />
        </Table.Td>
        <Table.Td>
          <Link
            href={`/lender-detail/${lender.lender_id}`}
            style={{ textDecoration: 'none', color: '#3B71CA' }}
          >
            {lender.lender_name}
          </Link>
        </Table.Td>
        <Table.Td>
          <Link
            href={`/contact-detail/${lender.lender_id}`}
            style={{ textDecoration: 'none', color: '#3B71CA' }}
          >
            {lender.email}
          </Link>
        </Table.Td>
        <Table.Td>{lender.phone || '-'}</Table.Td>
      </Table.Tr>
    );
  });

  return (
    <SideBarLayout title="Lenders" showButton={false} showBgWhite={false} broker="">
      {isLoading ? (
        <Center>
          <Loader size="lg" mt={100} />
        </Center>
      ) : (
        <Card withBorder mt="sm" radius="md" padding="sm" bg="var(--mantine-color-body)">
          <Flex justify="space-between">
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
                <Button
                  disabled={disableButton}
                  onClick={deleteLender}
                  color="red"
                  size="compact-sm"
                >
                  <IconTrash size={15} />
                </Button>
                <Tooltip label="New Contact">
                  <Button onClick={open} size="compact-sm">
                    <IconPlus size={15} />
                  </Button>
                </Tooltip>
                <CSVLink
                  filename={'lenders.csv'}
                  className="btn btn-primary"
                  data={filteredData?.length ? filteredData : lenders?.lenders}
                >
                  <Tooltip label="Export View">
                    <Button size="compact-sm" mt={-1}>
                      <IconFileExport size={15} />
                    </Button>
                  </Tooltip>
                </CSVLink>
              </Fragment>
            </Flex>
          </Flex>
          <ScrollArea>
            <Table miw={800} verticalSpacing="sm">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th style={{ width: rem(40) }}>
                    <Checkbox
                      onChange={toggleAll}
                      checked={
                        selectedID.length ===
                        (filteredData?.length ? filteredData : lenders?.lenders)?.length
                      }
                      indeterminate={
                        selectedID.length > 0 &&
                        selectedID.length !==
                          (filteredData?.length ? filteredData : lenders?.lenders)?.length
                      }
                    />
                  </Table.Th>
                  <Table.Th>Lender</Table.Th>
                  <Table.Th>Lender Email</Table.Th>
                  <Table.Th>Lender Phone</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>{rows}</Table.Tbody>
            </Table>
          </ScrollArea>
          <Pagination
            total={lenders?.pagination?.totalPages}
            value={lenders?.pagination?.page}
            onChange={setActivePage}
            mt="sm"
          />
        </Card>
      )}

      {/* modal begins */}
      <Modal opened={opened} onClose={close} withCloseButton={false} size="55%">
        <AddLender closeModal={close} lenderAdded={setlenderAdded} />
      </Modal>
    </SideBarLayout>
  );
}

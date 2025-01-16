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
  IconPlus,
  IconTrash,
  IconFileExport,
  IconArrowRight,
} from '@tabler/icons-react';
import fetcher from '@/utils/fetcher';
import useSWR from 'swr';
import { axiosInstance, setAuthorizationToken } from '@/utils/axiosInstance';
import { Task, Contact } from '@/utils/types';
import { notifications } from '@mantine/notifications';
import AddContact from './AddContact';
import { CSVLink, CSVDownload } from 'react-csv';
import Link from 'next/link';

export default function page() {
  const theme = useMantineTheme();
  const [opened, { open, close }] = useDisclosure(false);

  const [selectedID, setSelectedID] = useState<string[]>([]);
  const [filteredData, setFilteredData] = useState([]);
  const [disableButton, setDisableButton] = useState(true);
  const [activePage, setActivePage] = useState(1);
  const [contactAdded, setContactAdded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [token, setToken] = useState<string | null>('');
  const pageSize = 10;

  useEffect(() => {
    const access_token: string | null =
      typeof localStorage !== 'undefined'
        ? localStorage.getItem('broker_access_token') || localStorage.getItem('access_token')
        : null;

    setToken(access_token);
  }, []);

  const {
    data: contacts,
    mutate,
    isLoading,
  } = useSWR([`contact?page=${activePage}&pageSize=${pageSize}`, token], ([url, token]) =>
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
      current.length === (filteredData?.length ? filteredData : contacts?.contacts)?.length
        ? []
        : (filteredData?.length ? filteredData : contacts?.contacts)?.map((contact: Contact) =>
            contact.contact_id.toString()
          )
    );
  };

  const deleteContact = () => {
    const selectedTaskIds = selectedID.map((id) => parseInt(id, 10));

    const updatedTasks = (filteredData || contacts)?.filter(
      (contact: Contact) => !selectedTaskIds.includes(contact.contact_id)
    );

    axiosInstance
      .delete(`/contact/delete`, { data: { contact_ids: selectedTaskIds } })
      .then((res) => {
        // setFilteredData(updatedTasks);
        mutate();
        notifications.show({
          title: 'Deletion',
          color: 'red',
          message: 'Contact(s) deleted!',
        });
      })
      .catch((err) => {
        console.error('Error deleting tasks:', err);
        notifications.show({
          title: 'Error',
          color: 'red',
          message:
            err.response.data.details.sqlMessage ==
            'Cannot delete or update a parent row: a foreign key constraint fails (`brokerpa`.`main_task`, CONSTRAINT `main_task_ibfk_2` FOREIGN KEY (`agent_id`) REFERENCES `contact` (`contact_id`))'
              ? 'Cannot Delete. Contact linked to a deal'
              : 'Error deleting contact(s)',
        });
      });
  };

  const handleSearch = () => {
    setAuthorizationToken(token);
    setLoadingSearch(true);
    axiosInstance
      .get(`/contact/search?q=${searchTerm}`, {
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
    const token: string | null =
      typeof localStorage !== 'undefined'
        ? localStorage.getItem('broker_access_token') || null
        : '';

    setAuthorizationToken(token);
    if (contactAdded) {
      mutate();
    }
  }, [contactAdded]);

  const rows = (filteredData?.length ? filteredData : contacts?.contacts)?.map(
    (contact: Contact) => {
      const selected = selectedID.includes(contact.contact_id.toString());
      return (
        <Table.Tr key={contact.contact_id} className={cx({ [classes.rowSelected]: selected })}>
          <Table.Td>
            <Checkbox
              checked={selectedID.includes(contact.contact_id.toString())}
              onChange={() => toggleRow(contact.contact_id.toString())}
            />
          </Table.Td>
          <Table.Td>
            <Link
              href={`/contact-detail/${contact.contact_id}`}
              style={{ textDecoration: 'none', color: '#3B71CA' }}
            >
              {contact.first_name}
            </Link>
          </Table.Td>
          <Table.Td>
            <Link
              href={`/contact-detail/${contact.contact_id}`}
              style={{ textDecoration: 'none', color: '#3B71CA' }}
            >
              {contact.last_name}
            </Link>
          </Table.Td>
          <Table.Td>{contact.preferred_name || '-'}</Table.Td>
          <Table.Td>{contact.mobile_number || '-'}</Table.Td>
          <Table.Td>{contact.office_number || '-'}</Table.Td>
          <Table.Td>{contact.home_number || '-'}</Table.Td>
          <Table.Td>{contact.email || '-'}</Table.Td>
          <Table.Td>{contact.home_address1 || '-'}</Table.Td>
          <Table.Td>{contact.office_address1}</Table.Td>
          <Table.Td>{new Date(contact?.birth_date || '').toLocaleDateString()}</Table.Td>
          <Table.Td>{contact.next_review}</Table.Td>
          <Table.Td>{new Date(contact?.date_referred || '').toLocaleDateString()}</Table.Td>
          <Table.Td>{contact.company || '-'}</Table.Td>
          <Table.Td>{contact.lead_source || '-'}</Table.Td>
          <Table.Td>{contact.marital_status || '-'}</Table.Td>
          <Table.Td>{contact.citizenship || '-'}</Table.Td>
        </Table.Tr>
      );
    }
  );

  return (
    <SideBarLayout title="Contacts" showButton={false} showBgWhite={false} broker="">
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
                  onClick={deleteContact}
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
                  filename={'my-file.csv'}
                  className="btn btn-primary"
                  data={filteredData?.length ? filteredData : contacts?.contacts}
                >
                  <Tooltip label="Export View">
                    <Button size="compact-sm">
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
                        (filteredData?.length ? filteredData : contacts?.contacts)?.length
                      }
                      indeterminate={
                        selectedID.length > 0 &&
                        selectedID.length !==
                          (filteredData?.length ? filteredData : contacts?.contacts)?.length
                      }
                    />
                  </Table.Th>
                  <Table.Th>Full Name</Table.Th>
                  <Table.Th>Last Name</Table.Th>
                  <Table.Th>Preferred Name</Table.Th>
                  <Table.Th>Mobile Phone</Table.Th>
                  <Table.Th>Office Phone</Table.Th>
                  <Table.Th>Home Phone</Table.Th>
                  <Table.Th>Email</Table.Th>
                  <Table.Th>Home Address</Table.Th>
                  <Table.Th>Office Address</Table.Th>
                  <Table.Th>Birth Date</Table.Th>
                  <Table.Th>Next Review</Table.Th>
                  <Table.Th>Date Referred</Table.Th>
                  <Table.Th>Company</Table.Th>
                  <Table.Th>Lead Source</Table.Th>
                  <Table.Th>Marital Status</Table.Th>
                  <Table.Th>citizenship</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>{rows}</Table.Tbody>
            </Table>
          </ScrollArea>
          <Pagination
            total={contacts?.pagination?.totalPages}
            value={contacts?.pagination?.page}
            onChange={setActivePage}
            mt="sm"
          />
        </Card>
      )}

      {/* modal begins */}
      <Modal opened={opened} onClose={close} withCloseButton={false} size="55%">
        <AddContact closeModal={close} contactAdded={setContactAdded} />
      </Modal>
    </SideBarLayout>
  );
}

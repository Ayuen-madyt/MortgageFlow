'use client';

import React, { useState, forwardRef, useEffect } from 'react';
import { Button, Text, Group, Box, Flex, Divider, Paper } from '@mantine/core';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import transformDateFormat from '@/utils/transformDateFormat';
import { axiosInstance, setAuthorizationToken } from '@/utils/axiosInstance';
import moment from 'moment';
import useSWR from 'swr';
import fetcher from '@/utils/fetcher';
import classes from './Task.module.css';
import { ActivityFeedsCard } from './ActivityFeedsCard';
import Checklists from './checklists/Checklists';
import { useParams } from 'next/navigation';

export function Feeds() {
  const [token, setToken] = useState('');
  const [activityFeed, setActivityFeed] = useState(true);
  const [checklists, setCheckLists] = useState(false);
  const [active, setActive] = useState('activityFeed');

  const { task_id } = useParams();

  const handleClick = (item) => {
    setActive(item);
  };

  useEffect(() => {
    const access_token =
      typeof localStorage !== 'undefined' ? localStorage.getItem('broker_access_token') : null;

    setToken(access_token);
    setAuthorizationToken(access_token);
  }, []);

  const { data, mutate, isLoading } = useSWR([`/main/task/get/${task_id}`, token], ([url, token]) =>
    fetcher(url, token)
  );

  const [financeDate, setfinanceDate] = useState(
    data?.finance_date ? new Date(data?.finance_date) : null
  );
  const [settlementDate, setSettlementDate] = useState(
    data?.settlement_date ? new Date(data?.settlement_date) : null
  );
  const [stageDueDate, setStageDuetDate] = useState(
    data?.stage_due_date ? new Date(data?.stage_due_date) : null
  );

  const getButtonColor = (type) => {
    const currentDate = new Date();
    const turnAmberDate = new Date(data?.turn_amber_date || '');
    const turnRedDate = new Date(data?.turn_red_date || '');
    const stageDueDate = new Date(data?.stage_due_date || '');
    const financeDate = new Date(data?.finance_date || '');
    const financeTurnAmberDate = new Date(data?.finance_turn_amber_date || '');
    const financeTurnRedDate = new Date(data?.finance_turn_red_date || '');
    const settlementDate = new Date(data?.settlement_date || '');
    const settlementTurnAmberDate = new Date(data?.settlement_turn_amber_date || '');
    const settlementTurnRedDate = new Date(data?.settlement_turn_red_date || '');

    if (type === 'stageDueDate') {
      if (stageDueDate > currentDate) {
        return 'teal';
      } else if (turnAmberDate.getDate() === currentDate.getDate()) {
        return 'orange';
      } else if (stageDueDate <= currentDate || turnRedDate <= currentDate) {
        return 'red';
      } else if (isNaN(stageDueDate.getTime())) {
        return 'gray';
      }
    }
    if (type === 'financeDate') {
      if (financeTurnAmberDate > currentDate) {
        return 'teal';
      } else if (financeTurnAmberDate.getDate() === currentDate.getDate()) {
        return 'orange';
      } else if (financeDate <= currentDate || financeTurnRedDate <= currentDate) {
        return 'red';
      } else if (isNaN(financeDate.getTime())) {
        return 'gray';
      }
    }

    if (type === 'settlementDate') {
      if (settlementTurnAmberDate > currentDate) {
        return 'teal';
      } else if (settlementTurnAmberDate.getDate() === currentDate.getDate()) {
        return 'orange';
      } else if (settlementDate <= currentDate || settlementTurnRedDate <= currentDate) {
        return 'red';
      } else if (isNaN(settlementDate.getTime())) {
        return 'gray';
      }
    }

    return 'gray';
  };

  const FinanceDatePicker = forwardRef(({ value, onClick }, ref) => (
    <Button ref={ref} color={getButtonColor('financeDate')} size="compact-xs" onClick={onClick}>
      {value ? value : data?.finance_date ? transformDateFormat(data?.finance_date) : 'Pick Date'}
    </Button>
  ));

  const SettlementDatePicker = forwardRef(({ value, onClick }, ref) => (
    <Button ref={ref} color={getButtonColor('settlementDate')} size="compact-xs" onClick={onClick}>
      {value
        ? value
        : data?.settlement_date
          ? transformDateFormat(data?.settlement_date)
          : 'Pick Date'}
    </Button>
  ));

  const StageDuePicker = forwardRef(({ value, onClick }, ref) => (
    <Button ref={ref} color={getButtonColor('stageDueDate')} size="compact-xs" onClick={onClick}>
      {value
        ? value
        : data?.stage_due_date
          ? transformDateFormat(data?.stage_due_date)
          : 'Pick Date'}
    </Button>
  ));

  const updateFinanceDate = (date) => {
    const dateString = date ? moment(date).format('YYYY-MM-DD') : null;
    const updatedData = { ...data, finance_date: dateString };

    setfinanceDate(date);

    mutate(updatedData, false);

    axiosInstance
      .put(
        `/main/task/update/finance-date/${task_id}`,
        { finance_date: dateString === 'Invalid date' ? null : dateString },
        { withCredentials: true }
      )
      .then((res) => {
        console.log('task updated successfully');
        mutate();
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const updateSettlementDate = (date) => {
    const dateString = date ? moment(date).format('YYYY-MM-DD') : null;
    const updatedData = { ...data, settlement_date: dateString };

    setSettlementDate(date);

    mutate(updatedData, false);

    axiosInstance
      .put(
        `/main/task/update/settlement-date/${task_id}`,
        { settlement_date: dateString === 'Invalid date' ? null : dateString },
        { withCredentials: true }
      )
      .then((res) => {
        console.log('task updated successfully');
        mutate();
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const updateStageDueDate = (date) => {
    const dateString = date ? moment(date).format('YYYY-MM-DD') : null;
    const updatedData = { ...data, stage_due_date: dateString };

    setStageDuetDate(date);

    mutate(updatedData, false);

    axiosInstance
      .put(
        `/main/task/update/stage-due-date/${task_id}`,
        { stage_due_date: dateString === 'Invalid date' ? null : dateString },
        { withCredentials: true }
      )
      .then((res) => {
        console.log('task updated successfully');
        mutate();
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <Paper withBorder radius="md" bg="var(--mantine-color-body)" style={{ height: '100vh' }}>
      <Group justify="flex-start" p="xs">
        <Box>
          <DatePicker
            selected={financeDate}
            dateFormat="dd/MM/yyyy"
            onChange={updateFinanceDate}
            customInput={<FinanceDatePicker value={financeDate} onClick={() => {}} />}
          />
          <Text fz="sm" c="dimmed">
            Finance
          </Text>
        </Box>

        <Box>
          <DatePicker
            selected={settlementDate}
            dateFormat="dd/MM/yyyy"
            onChange={updateSettlementDate}
            customInput={<SettlementDatePicker value={settlementDate} onClick={() => {}} />}
          />
          <Text fz="sm" c="dimmed">
            Settlement
          </Text>
        </Box>
        <Box>
          <DatePicker
            selected={stageDueDate}
            dateFormat="dd/MM/yyyy"
            onChange={updateStageDueDate}
            customInput={<StageDuePicker value={stageDueDate} onClick={() => {}} />}
          />
          <Text fz="sm" c="dimmed">
            Stage Due
          </Text>
        </Box>
      </Group>

      <Flex justify="space-evenly" gap="lg" p="xs">
        <Text
          style={{
            display: 'flex',
            justifyContent: 'flex-start',
            alignItems: 'center',
            borderBottom: active === 'activityFeed' ? '2px solid' : 'none',
            cursor: 'pointer',
          }}
          className={classes.customGray}
          fz="sm"
          tt="uppercase"
          fw={700}
          pr="xs"
          onClick={() => {
            handleClick('activityFeed');
            setActivityFeed(true);
            setCheckLists(false);
          }}
        >
          Activity Feed
        </Text>
        <Text
          style={{
            display: 'flex',
            justifyContent: 'flex-start',
            alignItems: 'center',
            borderBottom: active === 'checkLists' ? '2px solid' : 'none',
            cursor: 'pointer',
          }}
          className={classes.customGray}
          fz="sm"
          tt="uppercase"
          fw={700}
          pr="xs"
          onClick={() => {
            handleClick('checkLists');
            setCheckLists(true);
            setActivityFeed(false);
          }}
        >
          Checklists
        </Text>
      </Flex>
      <Divider size="xs" />

      {activityFeed && <ActivityFeedsCard />}
      {checklists && <Checklists />}
    </Paper>
  );
}

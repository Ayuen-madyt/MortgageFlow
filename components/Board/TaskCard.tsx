'use client';

import React, { useState, forwardRef, Ref, useEffect } from 'react';
import {
  DraggableProvidedDragHandleProps,
  DraggableProvidedDraggableProps,
} from 'react-beautiful-dnd';
import { Button, Paper, Text, Group, Avatar, Box, Title, Flex } from '@mantine/core';
import { MainTask } from '@/utils/types';
import Link from 'next/link';
import classses from './Column.module.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import transformDateFormat from '@/utils/transformDateFormat';
import { axiosInstance } from '@/utils/axiosInstance';
import moment from 'moment';
import MainTaskIndicators from './Indicator';
import getFirstLetters from '@/utils/common';
import useSWR from 'swr';
import fetcher from '@/utils/fetcher';

type Props = {
  task: MainTask;
  task_id: number;
  index: number;
  innerRef: (element: HTMLElement | null) => void;
  draggableProps: DraggableProvidedDraggableProps;
  dragHandleProps: DraggableProvidedDragHandleProps | null | undefined;
};

export default function TaskCard({
  task,
  task_id,
  index,
  innerRef,
  draggableProps,
  dragHandleProps,
}: Props) {
  const [token, setToken] = useState<string | null>('');

  useEffect(() => {
    const access_token: string | null =
      typeof localStorage !== 'undefined' ? localStorage.getItem('broker_access_token') : null;

    setToken(access_token);
  }, []);

  const { data, mutate, isLoading } = useSWR([`/main/task/get/${task_id}`, token], ([url, token]) =>
    fetcher(url, token as string)
  );

  const [financeDate, setfinanceDate] = useState<Date | null>(
    data?.finance_date ? new Date(data?.finance_date) : null
  );
  const [settlementDate, setSettlementDate] = useState<Date | null>(
    data?.settlement_date ? new Date(data?.settlement_date) : null
  );
  const [stageDueDate, setStageDuetDate] = useState<Date | null>(
    data?.stage_due_date ? new Date(data?.stage_due_date) : null
  );

  const getButtonColor = (type: string): string => {
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

  const FinanceDatePicker = forwardRef(
    ({ value, onClick }: { value: any; onClick: () => void }, ref: Ref<HTMLButtonElement>) => (
      <Button color={getButtonColor('financeDate')} size="compact-xs" ref={ref} onClick={onClick}>
        {value ? value : data?.finance_date ? transformDateFormat(data?.finance_date) : 'Pick Date'}
      </Button>
    )
  );

  const SettlementDatePicker = forwardRef(
    ({ value, onClick }: { value: any; onClick: () => void }, ref: Ref<HTMLButtonElement>) => (
      <Button
        color={getButtonColor('settlementDate')}
        size="compact-xs"
        ref={ref}
        onClick={onClick}
      >
        {value
          ? value
          : data?.settlement_date
            ? transformDateFormat(data?.settlement_date)
            : 'Pick Date'}
      </Button>
    )
  );

  const StageDuePicker = forwardRef(
    ({ value, onClick }: { value: any; onClick: () => void }, ref: Ref<HTMLButtonElement>) => (
      <Button color={getButtonColor('stageDueDate')} size="compact-xs" ref={ref} onClick={onClick}>
        {value
          ? value
          : data?.stage_due_date
            ? transformDateFormat(data?.stage_due_date)
            : 'Pick Date'}
      </Button>
    )
  );

  const updateFinanceDate = (date: Date | null) => {
    const dateString = date ? moment(date).format('YYYY-MM-DD') : null;
    const updatedData = { ...data, finance_date: dateString };

    setfinanceDate(date);

    mutate(updatedData, false);

    axiosInstance
      .put(
        `/main/task/update/finance-date/${task?.main_task_id}`,
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

  const updateSettlementDate = (date: Date | null) => {
    const dateString = date ? moment(date).format('YYYY-MM-DD') : null;
    const updatedData = { ...data, settlement_date: dateString };

    setSettlementDate(date);

    mutate(updatedData, false);

    axiosInstance
      .put(
        `/main/task/update/settlement-date/${task?.main_task_id}`,
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

  const updateStageDueDate = (date: Date | null) => {
    const dateString = date ? moment(date).format('YYYY-MM-DD') : null;
    const updatedData = { ...data, stage_due_date: dateString };

    setStageDuetDate(date);

    mutate(updatedData, false);

    axiosInstance
      .put(
        `/main/task/update/stage-due-date/${task?.main_task_id}`,
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
    <Paper {...draggableProps} {...dragHandleProps} ref={innerRef} p="lg" radius="md" mt="md">
      <Group justify="flex-start" mb="xs">
        <Avatar src={null} alt={task.task_name} radius="xl" color="red">
          {getFirstLetters(task.task_name)}
        </Avatar>
        <Link href={`/board/main-task/${task.main_task_id}`} className={classses.task_title}>
          <Title fz="md" order={6}>
            {task.task_name}
          </Title>
        </Link>
      </Group>
      <Group justify="flex-start" mb="xs">
        <Title order={6}>Owner:</Title>
        <Text c="dimmed" fz="xs" fw={500}>
          {`${task.broker_first_name} ${task.broker_last_name}`}
        </Text>
      </Group>

      <MainTaskIndicators created_at={task.created_at} />

      <Flex justify="flex-start" gap="sm" mt="md">
        <Box>
          <Text fz="sm" c="dimmed">
            Finance
          </Text>
          <DatePicker
            selected={financeDate}
            dateFormat="dd/MM/yyyy"
            onChange={updateFinanceDate}
            customInput={<FinanceDatePicker value={financeDate} onClick={() => {}} />}
          />
        </Box>

        <Box>
          <Text fz="sm" c="dimmed">
            Settlement
          </Text>
          <DatePicker
            selected={settlementDate}
            dateFormat="dd/MM/yyyy"
            onChange={updateSettlementDate}
            customInput={<SettlementDatePicker value={settlementDate} onClick={() => {}} />}
          />
        </Box>
        <Box>
          <Text fz="sm" c="dimmed">
            Stage Due
          </Text>
          <DatePicker
            selected={stageDueDate}
            dateFormat="dd/MM/yyyy"
            onChange={updateStageDueDate}
            customInput={<StageDuePicker value={stageDueDate} onClick={() => {}} />}
          />
        </Box>
      </Flex>
    </Paper>
  );
}

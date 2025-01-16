'use client';

import React, { useState, useEffect, Fragment } from 'react';
import {
  Box,
  Title,
  Card,
  Text,
  Flex,
  rem,
  Divider,
  TextInput,
  Select,
  Paper,
  Collapse,
  Input,
  FileInput,
  Textarea,
  Button,
} from '@mantine/core';
import { IconArrowNarrowLeft, IconAt, IconChevronRight, IconTrash } from '@tabler/icons-react';
import PhoneInput, { formatPhoneNumber, formatPhoneNumberIntl } from 'react-phone-number-input';
import { useAppContext } from '@/ContextAPI/ContextAPI';
import fetcher from '@/utils/fetcher';
import useSWR from 'swr';
import classes from '../../../components/mainTask/Task.module.css';
import axiosInstance from '@/utils/axiosInstance';
import { notifications } from '@mantine/notifications';

export default function Deals({ contact_id }) {
  // const { data: tasks } = useSWR(`/contact/get/deals/${contact_id}`, fetcher);

  return (
    <Card withBorder radius="md" bg="var(--mantine-color-body)" style={{ padding: 0, margin: 0 }}>
      <Title p="xs" order={4} className={classes.customGray}>
        Deals
      </Title>
      <Divider />
    </Card>
  );
}

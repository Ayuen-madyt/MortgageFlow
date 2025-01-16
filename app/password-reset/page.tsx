'use client';

import {
  Paper,
  Button,
  Container,
  Group,
  Anchor,
  Center,
  Box,
  PasswordInput,
  rem,
  Image,
  Text,
  Loader,
  Title,
} from '@mantine/core';
import { isNotEmpty, useForm } from '@mantine/form';
import { IconArrowLeft } from '@tabler/icons-react';
import classes from './ForgotPassword.module.css';
import { Fragment, useEffect, useState } from 'react';
import { axiosInstance } from '@/utils/axiosInstance';
import { notifications } from '@mantine/notifications';

export default function PasswordReset() {
  const [isLinkValid, setIsLinkValid] = useState(true);
  const [email, setEmail] = useState<string | null>('');
  const [passwordChanged, setPasswordChanged] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm({
    initialValues: {
      password: '',
      confirmPassword: '',
    },

    validate: {
      password: (val) => (val.length < 6 ? 'Password should include at least 6 characters' : null),
      confirmPassword: (val, values) =>
        val !== values.password ? 'Password and confirm password do not match' : null,
    },
  });

  useEffect(() => {
    const currentURL = window.location.href;

    const urlParams = new URLSearchParams(currentURL);

    const expirationTimestamp = urlParams.get('expiration');
    const emailParsed = urlParams.get('email');

    const timestampString = expirationTimestamp || '';

    const expirationDate = new Date(parseInt(timestampString));

    const currentDate = new Date();

    setEmail(emailParsed);
    setIsLinkValid(expirationDate > currentDate);
  }, []);

  const tansformedData = form.getTransformedValues();

  const resetPassword = () => {
    form.validate();
    if (form.isValid()) {
      setLoading(true);
      axiosInstance
        .post('/auth/password-reset/done', { password: tansformedData.password, email })
        .then((res) => {
          setLoading(false);
          setPasswordChanged(true);
          form.reset();
          notifications.show({
            title: 'Success',
            color: 'teal',
            message: 'Password changed',
          });
        })
        .catch((err) => {
          setLoading(false);
          console.log(err);
          notifications.show({
            title: 'Error',
            color: 'red',
            message: 'Error updating password',
          });
        });
    }
  };

  if (!isLinkValid) {
    return (
      <Container size={460} my={30}>
        <Paper withBorder shadow="md" p={30} radius="md" mt={130}>
          <Center>
            <Group grow mb="md" mt="md">
              <Image width={130} height={80} src="/logo5.png" />
            </Group>
          </Center>
          <Center>
            <Text>The password reset link has expired.</Text>
          </Center>
          <Group justify="center" mt="lg">
            <Anchor href="/login" c="blue" size="sm">
              <Center>Request a new password reset link</Center>
            </Anchor>
          </Group>
        </Paper>
      </Container>
    );
  }

  return (
    <Container size={460} my={30}>
      <Paper withBorder shadow="md" p={30} radius="md" mt={130}>
        <Center>
          <Group grow mb="md" mt="md">
            <Image width={130} height={80} src="/logo5.png" />
          </Group>
        </Center>
        {passwordChanged ? (
          <Box>
            <Title order={5}>Password changed successfully</Title>
            <Anchor href="/login" c="dimmed" size="sm" className={classes.control}>
              <Button mt="md">Login here</Button>
            </Anchor>
          </Box>
        ) : (
          <Fragment>
            <Title mb="md" order={4}>
              Password Reset
            </Title>
            <PasswordInput
              required
              label="New Password"
              onChange={(event) => form.setFieldValue('password', event.currentTarget.value)}
              error={form.errors.password && 'Password should include at least 6 characters'}
              placeholder="New password"
              radius="md"
            />
            <PasswordInput
              required
              label="Confirm Password"
              onChange={(event) => form.setFieldValue('confirmPassword', event.currentTarget.value)}
              error={form.errors.confirmPassword}
              placeholder="Confirm password"
              radius="md"
              mt="md"
            />
            <Group justify="space-between" mt="lg" className={classes.controls}>
              <Anchor href="/login" c="dimmed" size="sm" className={classes.control}>
                <Center inline>
                  <IconArrowLeft style={{ width: rem(12), height: rem(12) }} stroke={1.5} />
                  <Box ml={5}>Back to the login page</Box>
                </Center>
              </Anchor>
              <Button onClick={resetPassword} className={classes.control}>
                {loading ? <Loader size="sm" color="white" /> : ' Reset password'}
              </Button>
            </Group>
          </Fragment>
        )}
      </Paper>
    </Container>
  );
}

'use client';
import React, { useState, useContext } from 'react';
import { useForm } from '@mantine/form';
import {
  TextInput,
  PasswordInput,
  Text,
  Paper,
  Group,
  Button,
  Divider,
  Anchor,
  Stack,
  Center,
  Image,
  Loader,
  Title,
} from '@mantine/core';
import { axiosInstance } from '@/utils/axiosInstance';
import { notifications } from '@mantine/notifications';

const AuthenticationForm = () => {
  const [type, setType] = useState('login');
  const [loading, setLoading] = useState(false);

  const form = useForm({
    initialValues: {
      email: '',
      password: '',
    },

    validate: {
      email: (val) => (/^\S+@\S+$/.test(val) ? null : 'Invalid email'),
      password: (val) => (val.length <= 6 ? 'Password should include at least 6 characters' : null),
    },

    transformValues: (values) => ({
      email: values.email.trim(),
      password: values.password.trim(),
    }),
  });

  const toggleType = () => {
    setType((prevType) => (prevType === 'login' ? 'reset' : 'login'));
  };

  const authenticate = async () => {
    form.validate();
    if (form.isValid()) {
      if (type === 'login') {
        setLoading(true);
        const { email, password } = form.values;
        axiosInstance
          .post('/auth/login', { email, password }, { withCredentials: true })
          .then((res) => {
            console.log(res);
            setLoading(false);
            localStorage.setItem('access_token', res.data.token);
            window.location.replace('/tasks');
          })
          .catch((error) => {
            setLoading(false);
            console.error('Authentication failed:', error);
            notifications.show({
              title: 'Error',
              color: 'red',
              message: error?.response?.data?.error || error?.message,
            });
          });
      }
    } else {
      const { email } = form.values;
      if (email) {
        setLoading(true);
        axiosInstance
          .post('/auth/password/reset', { email }, { withCredentials: true })
          .then((res) => {
            console.log(res);
            setLoading(false);
            notifications.show({
              color: 'teal',
              title: 'Email sent',
              message: 'Check your inbox for password reset link',
            });
          })
          .catch((error) => {
            setLoading(false);
            console.error('Error resetting:', error);
            notifications.show({
              color: 'red',
              title: 'Error',
              message: 'Error resetting password',
            });
          });
      }
    }
  };

  return (
    <Center mt={80}>
      <Paper radius="lg" p="xl" withBorder>
        <Group grow mb="md" mt="md">
          <Image width={200} height={150} src="/logo5.png" />
        </Group>

        <Text size="lg" fw={500}>
          {type == 'reset' ? `Password Reset` : ` Welcome to Brokerpa, ${type}`}
        </Text>

        <Divider label="continue with email" labelPosition="center" my="lg" />

        <form onSubmit={form.onSubmit(() => {})}>
          <Stack>
            {type == 'reset' && <Title order={6}>Enter your email to reset the password </Title>}
            <TextInput
              required
              label="Email"
              placeholder="example@something.com"
              value={form.values.email}
              onChange={(event) => form.setFieldValue('email', event.currentTarget.value)}
              error={form.errors.email && 'Invalid email'}
              radius="md"
            />

            {type != 'reset' && (
              <PasswordInput
                required
                label="Password"
                placeholder="Your password"
                value={form.values.password}
                onChange={(event) => form.setFieldValue('password', event.currentTarget.value)}
                error={form.errors.password && 'Password should include at least 6 characters'}
                radius="md"
              />
            )}
          </Stack>

          <Group justify="flex-end" mt="xl">
            <Anchor component="button" type="button" c="dimmed" onClick={toggleType} size="xs">
              {type === 'reset' ? 'Already have an account? Login' : 'Forgot password? Reset'}
            </Anchor>
            <Button onClick={authenticate} type="submit" radius="xl">
              {loading ? <Loader color="white" size="sm" /> : type === 'login' ? 'Login' : 'Reset'}
            </Button>
          </Group>
        </form>
      </Paper>
    </Center>
  );
};

export default AuthenticationForm;

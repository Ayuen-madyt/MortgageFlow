import { Title, Text, Anchor } from '@mantine/core';
import classes from './Welcome.module.css';
import Link from 'next/link';

export function Welcome() {
  return (
    <>
      <Title className={classes.title} ta="center" mt={100}>
        Welcome to{' '}
        <Text inherit variant="gradient" component="span" gradient={{ from: 'pink', to: 'yellow' }}>
          MortgageFlow
        </Text>
      </Title>
    </>
  );
}

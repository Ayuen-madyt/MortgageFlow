import { Title, Text, Button, Container, Image, Flex, Box, Center } from '@mantine/core';
import { Dots } from '@/components/landingPage/Dots';
import classes from '../components/landingPage/HeroText.module.css';
import { Fragment } from 'react';
import Link from 'next/link';

export default function HeroText() {
  return (
    <Fragment>
      <Container className={classes.wrapper} size={1400}>
        <Dots className={classes.dots} style={{ left: 0, top: 0 }} />
        <Dots className={classes.dots} style={{ left: 60, top: 0 }} />
        <Dots className={classes.dots} style={{ left: 0, top: 140 }} />
        <Dots className={classes.dots} style={{ right: 0, top: 60 }} />

        <div className={classes.inner}>
          <Center mb="md">
            <Box w="auto">
              <Image width={120} height={120} src="/logo5.png" />
            </Box>
          </Center>
          <Title className={classes.title}>
            Empower your{' '}
            <Text component="span" className={classes.highlight} inherit>
              Mortgage Brokerage
            </Text>{' '}
            with MortgageFlow
          </Title>

          <Container p={0} size={600}>
            <Text size="lg" c="dimmed" className={classes.description}>
              MortgageFlow is mortgage broker specific workflow software, guaranteed to grow your
              revenue while working fewer hours.
            </Text>
          </Container>

          <div className={classes.controls}>
            <Link href="/login">
              <Button className={classes.control} size="lg" variant="default" color="gray">
                Login
              </Button>
            </Link>
          </div>
        </div>
      </Container>
    </Fragment>
  );
}

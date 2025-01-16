'use client';

import { useState } from 'react';
import { Grid, Skeleton, Card, Title, Flex } from '@mantine/core';
import SideBarLayout from '@/components/SidebarLayout/SideBarLayout';
import Detail from './Detail';
import Deals from './Deals';
import { useParams } from 'next/navigation';
import { IconUser, IconListDetails } from '@tabler/icons-react';

export default function ContactDetail() {
  const { contact_id } = useParams();
  const [showDetails, setShowDetails] = useState(true);
  const [showDeals, setShowDeals] = useState(false);

  const handleDetails = () => {
    setShowDetails(true);
    setShowDeals(false);
  };

  const handleDeals = () => {
    setShowDetails(false);
    setShowDeals(true);
  };

  return (
    <SideBarLayout title="Contact Detail" showButton={false} showBgWhite={false}>
      <Grid style={{ height: '100%' }}>
        <Grid.Col span={{ base: 12, xs: 3 }}>
          <Card withBorder radius="md" padding="sm" bg="var(--mantine-color-body)">
            <Flex
              justify="flex-start"
              onClick={handleDetails}
              c={showDetails ? 'blue' : ''}
              style={{ cursor: 'pointer' }}
              gap="sm"
            >
              <IconUser size={22} />
              <Title order={5}>Details</Title>
            </Flex>
          </Card>
          <Card withBorder mt="xs" radius="md" padding="sm" bg="var(--mantine-color-body)">
            <Flex
              justify="flex-start"
              //onClick={handleDeals}
              c={showDeals ? 'blue' : ''}
              style={{ cursor: 'pointer' }}
              gap="sm"
            >
              <IconListDetails size={22} />
              <Title order={5}>Deals</Title>
            </Flex>
          </Card>
        </Grid.Col>
        <Grid.Col span={{ base: 12, xs: 9 }}>
          {showDeals && <Deals contact_id={contact_id} />}
          {showDetails && <Detail contact_id={contact_id} />}
        </Grid.Col>
      </Grid>
    </SideBarLayout>
  );
}

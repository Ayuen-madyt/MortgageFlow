'use client';

import React, { useState, useEffect } from 'react';
import { Skeleton, Grid, Box } from '@mantine/core';
import { useParams } from 'next/navigation';
import SideBarLayout from '@/components/SidebarLayout/SideBarLayout';
import useSWR from 'swr';
import fetcher from '@/utils/fetcher';
import { ApplicantCard } from '@/components/mainTask/ApplicantCard';
import { LenderCard } from '@/components/mainTask/LenderCard';
import { BrokerCard } from '@/components/mainTask/BrokerCard';
import { SecurityCard } from '@/components/mainTask/Security';
import { SolicitorCard } from '@/components/mainTask/Solicitor';
import { ReferrerCard } from '@/components/mainTask/Referrer';
import { AgentCard } from '@/components/mainTask/AgentCard';
import { BuildingAndPestProviderCard } from '@/components/mainTask/BuildingAndPestProviderCard';
import { BuyersAgentCard } from '@/components/mainTask/BuyersAgent';
import { AccountantCard } from '@/components/mainTask/Accountant';
import { ThirdPartyCard } from '@/components/mainTask/ThirdParty';
import { FinancialPlannerCard } from '@/components/mainTask/FinancialPlanner';
import { PropertyManagerCard } from '@/components/mainTask/PropertyManager';
import { ClientPortalCard } from '@/components/mainTask/ClientPortalCard';
import { CenterTabs } from '@/components/mainTask/CenterTabs';
import Tasks from '@/components/mainTask/Tasks';
import { useAppContext } from '@/ContextAPI/ContextAPI';
import ContactDetails from '@/components/mainTask/ContactDetails';
import BrokerDetails from '@/components/mainTask/BrokerDetails';
import LenderDetails from '@/components/mainTask/LenderDetails';
import ApplicantDetails from '@/components/mainTask/ApplicantDetails';
import { Feeds } from '@/components/mainTask/Feeds';

const child = <Skeleton height={140} radius="md" animate={false} />;

export default function Page() {
  const params = useParams<{ task_id: string }>();
  const [token, setToken] = useState<string | null>('');

  useEffect(() => {
    const access_token: string | null =
      typeof localStorage !== 'undefined' ? localStorage.getItem('broker_access_token') : null;

    setToken(access_token);
  }, []);

  const { data, mutate, isLoading } = useSWR(
    [`/main/task/get/${params.task_id}`, token],
    ([url, token]) => fetcher(url, token as string)
  );

  const { state } = useAppContext();

  const { showLender, showContact, showBroker, contactType, showTabs, showApplicants } = state;

  return (
    <SideBarLayout
      title={data?.task_name || 'Loading...'}
      showButton={false}
      showBgWhite={false}
      broker={`${data?.broker?.first_name} ${data?.broker?.last_name}`}
    >
      <Grid style={{ height: '100%' }}>
        <Grid.Col span={{ base: 12, xs: 3 }}>
          {/* client portal is not for client but it displays title of the deal and some actions to perform on the deal */}
          <ClientPortalCard main_task={data} mutate={mutate} />
          <ApplicantCard />
          <LenderCard lender={data?.lender} />
          <BrokerCard broker={data?.broker} lender={data?.lender} />
          <SecurityCard />
          <AgentCard contact={data?.contacts?.agent?.[0]} />
          <ReferrerCard contact={data?.contacts?.referrer?.[0]} />
          <SolicitorCard contact={data?.contacts?.solicitor?.[0]} />
          <AccountantCard contact={data?.contacts?.accountant?.[0]} />
          <FinancialPlannerCard contact={data?.contacts?.financial_planner?.[0]} />
          <BuyersAgentCard contact={data?.contacts?.buyers_agent?.[0]} />
          <ThirdPartyCard contact={data?.contacts?.buyers_agent?.[0]} />
          <PropertyManagerCard contact={data?.contacts?.property_manager?.[0]} />
          <BuildingAndPestProviderCard contact={data?.contacts?.building_pest_provider?.[0]} />
        </Grid.Col>
        <Grid.Col span={{ base: 12, xs: 5.6 }}>
          {showTabs && <CenterTabs />}
          {showTabs && <Tasks task_id={data?.main_task_id} />}
          {showContact && (
            <ContactDetails contactType={contactType} main_task_id={data?.main_task_id} />
          )}
          {showBroker && <BrokerDetails />}
          {showLender && <LenderDetails main_task_id={data?.main_task_id} />}
          {showApplicants && <ApplicantDetails />}
        </Grid.Col>
        <Grid.Col span={{ base: 12, xs: 3.4 }}>
          <Box style={{ position: 'sticky', top: 70 }}>
            <Feeds />
          </Box>
        </Grid.Col>
      </Grid>
    </SideBarLayout>
  );
}

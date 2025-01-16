import { useEffect, useState } from 'react';
import { Group, Code, ScrollArea, rem } from '@mantine/core';
import {
  IconNotes,
  IconCalendarStats,
  IconGauge,
  IconPresentationAnalytics,
  IconFileAnalytics,
  IconAdjustments,
  IconLock,
} from '@tabler/icons-react';
import useSWR from 'swr';
import { UserButton } from '../UserButton/UserButton';
import { LinksGroup } from '../NavbarLinksGroup/NavbarLinksGroup';
import classes from './NavbarNested.module.css';
import fetcher from '../../utils/fetcher';
import { jwtDecode } from 'jwt-decode';

interface Board {
  board_id: number;
  user_id: number;
  title: string;
  board_type_id: number;
}

export function NavbarNested() {
  const [user, setUser] = useState<Record<string, any> | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const tokenFromStorage =
      typeof window !== 'undefined' ? localStorage.getItem('broker_access_token') : null;
    setToken(tokenFromStorage);
  }, []);

  const { data, error, isLoading } = useSWR<Board[]>(['/board/fetch', token], ([url, token]) =>
    fetcher(url, token as string)
  );

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token !== null) {
      try {
        const decoded = jwtDecode(token);
        setUser(decoded);
      } catch (error) {
        console.error('Error decoding JWT:', error);
      }
    } else {
      console.error('Token is null in localStorage');
    }
  }, []);

  const mockdata = [
    { label: 'Tasks', icon: IconGauge, link: '/tasks' },
    {
      label: 'Boards',
      icon: IconNotes,
      initiallyOpened: true,
      links: data?.map((board) => ({
        label: board.title,
        link: `/board/single-board/${board.board_id}`,
      })),
    },
    { label: 'Assigned Deals', icon: IconPresentationAnalytics, link: '/assigned-deals' },
    { label: 'Lenders', icon: IconPresentationAnalytics, link: '/lenders' },
    { label: 'Contacts', icon: IconFileAnalytics, link: '/contacts' },
    token ? null : { label: 'Settings', icon: IconAdjustments, link: '/settings' },
  ].filter(Boolean);

  const links = mockdata.map((item) => {
    if (item) {
      return <LinksGroup {...item} key={item.label} />;
    }
    return null;
  });

  return (
    <>
      <ScrollArea className={classes.links}>
        <div className={classes.linksInner}>{links}</div>
      </ScrollArea>

      <div className={classes.footer}>
        <UserButton />
      </div>
    </>
  );
}

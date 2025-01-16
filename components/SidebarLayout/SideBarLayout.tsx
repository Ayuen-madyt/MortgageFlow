'use client';
import { useState, ReactNode, Fragment, useEffect } from 'react';
import { AppShell, Burger, Group, Flex, Button, Title, Text, Image, Alert } from '@mantine/core';
import { NavbarNested } from '@/components/SidebarLayout/NavbarNested';
import { ColorSchemeToggle } from '../ColorSchemeToggle/ColorSchemeToggle';
import { SettingsIcon } from '../SettingsIcon/settingsIcon';
import { useRouter, usePathname } from 'next/navigation';
import { jwtDecode, JwtPayload } from 'jwt-decode';
import classes from './SideBarLayout.module.css';
import { useMediaQuery } from '@mantine/hooks';

interface SidebarLayoutProps {
  children: ReactNode;
  title: string;
  showButton: boolean;
  showBgWhite: boolean;
  broker: string;
  count?: number;
}

const SideBarLayout: React.FC<SidebarLayoutProps> = ({
  children,
  title,
  showButton,
  showBgWhite,
  broker,
  count,
}) => {
  const [mobileOpened, setMobileOpened] = useState(false);
  const [desktopOpened, setDesktopOpened] = useState(true);
  const [user, setUser] = useState<Record<string, any> | null>(null);
  const [token, setToken] = useState<string | null>('');

  const router = useRouter();
  const pathname = usePathname();

  const toggleMobile = () => setMobileOpened((prev) => !prev);
  const toggleDesktop = () => setDesktopOpened((prev) => !prev);

  const isMobile = useMediaQuery('(max-width: 768px)');

  useEffect(() => {
    const access_token: string | null =
      typeof localStorage !== 'undefined' ? localStorage.getItem('broker_access_token') : null;

    setToken(access_token);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('access_token') || '';
    const broker_access_token = localStorage.getItem('broker_access_token');
    if (broker_access_token !== null) {
      const decoded = jwtDecode(broker_access_token);
      setUser(decoded);
    }
    const isAuthenticationPage = pathname === '/';

    if (!token && !isAuthenticationPage) {
      router.push('/');
    } else {
      try {
        const decoded = jwtDecode(token) as JwtPayload;

        if (decoded.exp !== undefined && decoded.exp * 1000 < Date.now()) {
          localStorage.removeItem('access_token');
          router.push('/');
        }
      } catch (error) {
        console.error('Error decoding JWT:', error);
      }
    }
  }, [router]);

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 220,
        breakpoint: 'sm',
        collapsed: { mobile: !mobileOpened, desktop: !desktopOpened },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Flex
          mih={50}
          mt={4}
          gap="xl"
          justify="space-between"
          align="center"
          direction="row"
          wrap="nowrap"
        >
          <Group>
            <Group h="100%" px="md">
              <Burger opened={mobileOpened} onClick={toggleMobile} hiddenFrom="sm" size="sm" />
              <Burger opened={desktopOpened} onClick={toggleDesktop} visibleFrom="sm" size="sm" />
              <Image width={50} height={50} src="/logo5.png" />
            </Group>
            <Group h="100%" px={50}>
              {!isMobile && <Text>||</Text>}
              {!isMobile && <Title order={5}>{`${count ? count : ''} ${title}(s)`}</Title>}
              {broker && (
                <Text fz="sm" c="dimmed">
                  {`| ${broker}`}
                </Text>
              )}
            </Group>
          </Group>

          {token && (
            <Alert variant="light" color="yellow">
              <Flex gap="sm">
                <Text size="sm">
                  {` You are viewing ${
                    user?.first_name && user?.last_name
                      ? `${user.first_name.toUpperCase()}`
                      : user?.email
                  }'s board.`}
                </Text>
                <Button
                  color="orange"
                  size="compact-xs"
                  onClick={() => {
                    localStorage.removeItem('broker_access_token');
                    window.location.replace('/tasks');
                  }}
                >
                  Exit
                </Button>
              </Flex>
            </Alert>
          )}

          <Group h="100%" px="md">
            <ColorSchemeToggle />
            {!isMobile && <SettingsIcon />}
          </Group>
        </Flex>
      </AppShell.Header>
      <AppShell.Navbar px="md">
        <NavbarNested />
      </AppShell.Navbar>
      <AppShell.Main className={showBgWhite ? classes.showBgWhite : classes.main}>
        {children}
      </AppShell.Main>
    </AppShell>
  );
};

export default SideBarLayout;

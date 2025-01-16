import cx from 'clsx';
import { ActionIcon, Group } from '@mantine/core';
import { IconSettings } from '@tabler/icons-react';
import classes from '../ColorSchemeToggle/ActionToggle.module.css';
import Link from 'next/link';

export function SettingsIcon() {
  return (
    <Group justify="center">
      <Link href="/settings">
        <ActionIcon variant="default" size="xl" aria-label="Toggle color scheme">
          <IconSettings className={cx(classes.icon, classes.light)} stroke={1.5} />
          <IconSettings className={cx(classes.icon, classes.dark)} stroke={1.5} />
        </ActionIcon>
      </Link>
    </Group>
  );
}

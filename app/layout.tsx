import '@mantine/core/styles.css';
import React from 'react';
import { MantineProvider, ColorSchemeScript } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { theme } from '../theme';
import { AppProvider } from '@/ContextAPI/ContextAPI';
import 'react-phone-number-input/style.css';
import '@mantine/notifications/styles.css';

export const metadata = {
  title: 'MortgageFlow',
  description: 'Empower your mortgage brokerage with MortgageFlow',
};

export default function RootLayout({ children }: { children: any }) {
  return (
    <html lang="en">
      <head>
        <ColorSchemeScript />
        <link rel="shortcut icon" href="/favicon.svg" />
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no"
        />
      </head>
      <body>
        <AppProvider>
          <MantineProvider theme={theme}>
            <Notifications position="top-right" />
            {children}
          </MantineProvider>
        </AppProvider>
      </body>
    </html>
  );
}

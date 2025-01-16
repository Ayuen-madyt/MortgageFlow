import React, { useState } from 'react';
import { Box, Tabs, Card } from '@mantine/core';
import Note from './Note';
import Email from './Email';
import classes from './Task.module.css';
import AddTask from './AddTask';

const tabs = ['Note', 'Task', 'Email'];

export function CenterTabs() {
  const [activeTab, setActiveTab] = useState('Note');

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const items = tabs.map((tab) => (
    <Tabs.Tab value={tab} key={tab} onClick={() => handleTabChange(tab)}>
      {tab}
    </Tabs.Tab>
  ));

  const renderContent = () => {
    switch (activeTab) {
      case 'Note':
        return <Note />;
      case 'Task':
        return <AddTask />;
      case 'Email':
        return <Email />;
      default:
        return null;
    }
  };

  return (
    <Card withBorder className={classes.header} radius="md">
      <Tabs
        value={activeTab}
        variant="outline"
        classNames={{
          root: classes.tabs,
          list: classes.tabsList,
          tab: classes.tab,
        }}
      >
        <Tabs.List>{items}</Tabs.List>
      </Tabs>
      <Box>{renderContent()}</Box>
    </Card>
  );
}

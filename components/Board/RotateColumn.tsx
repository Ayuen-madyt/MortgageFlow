import React from 'react';
import { Text } from '@mantine/core';
import classes from './Column.module.css';

function RotateColumn({ text, number }: { text: string; number: number }) {
  return (
    <div
      className={classes.empty_stage_rotate}
      style={{
        display: 'flex',
        justifyContent: 'flex-start',
        alignItems: 'center',
      }}
    >
      <Text
        style={{
          transform: 'rotate(-90deg)',
          transformOrigin: 'center',
        }}
      >
        {text}
      </Text>
    </div>
  );
}

export default RotateColumn;

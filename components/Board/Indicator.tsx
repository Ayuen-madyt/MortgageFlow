import React from 'react';
import { Flex, Indicator, Tooltip } from '@mantine/core'; // Import your UI components

interface MainTaskIndicatorsProps {
  created_at: string; // Assuming created_at is a string in a recognized date format
}

const getColor = (days: number): string[] => {
  if (days >= 20) {
    return ['red', 'red', 'red', 'red'];
  } else if (days >= 15) {
    return ['red', 'red', 'red', 'orange'];
  } else if (days >= 10) {
    return ['red', 'red', 'orange', 'orange'];
  } else if (days == 9) {
    return ['red', 'orange', 'orange', 'orange'];
  } else if (days >= 6) {
    return ['orange', 'orange', 'orange', 'orange'];
  } else if (days == 5) {
    return ['orange', 'orange', 'orange', 'gray'];
  } else if (days == 5) {
    return ['orange', 'orange', 'gray', 'gray'];
  } else if (days == 4) {
    return ['gray', 'gray', 'gray', 'gray'];
  } else if (days == 3) {
    return ['gray', 'gray', 'gray'];
  } else if (days === 2) {
    return ['gray', 'gray'];
  } else if (days === 1) {
    return ['gray'];
  } else {
    return [];
  }
};

const MainTaskIndicators: React.FC<MainTaskIndicatorsProps> = ({ created_at }) => {
  const currentDate = new Date();
  const timeDifference = currentDate.getTime() - new Date(created_at).getTime();
  const daysSinceCreation = Math.floor(timeDifference / (1000 * 60 * 60 * 24));

  const colors = getColor(daysSinceCreation);

  return (
    <Tooltip label={`${daysSinceCreation} business days in this stage`}>
      <Flex
        gap="xs"
        justify="flex-start"
        align="flex-start"
        direction="row"
        wrap="wrap"
        pl="md"
        mt="md"
      >
        {colors.map((color, index) => (
          <Indicator style={{ zIndex: 1 }} key={index} size={6} color={color} />
        ))}
      </Flex>
    </Tooltip>
  );
};

export default MainTaskIndicators;

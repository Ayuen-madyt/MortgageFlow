'use client';

import { Text, Box, Flex, Collapse, rem } from '@mantine/core';
import { IconChevronRight } from '@tabler/icons-react';
import useSWR from 'swr';
import fetcher from '@/utils/fetcher';
import classes from '../Task.module.css';
import { useParams } from 'next/navigation';
import SubChecklistSections from './SubChecklistSections';
import { useState } from 'react';

export default function Checklists() {
  const [openedSections, setOpenedSections] = useState({});

  const { task_id } = useParams();

  const { data, mutate } = useSWR(`/main-task/checklists/get/${task_id}`, fetcher);

  const toggle = (sectionId) => {
    setOpenedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  return (
    <Box p="xs">
      {data &&
        data[0]?.sections?.map((section) => (
          <Box className={classes.checklistSection} p="xs" key={section?.task_section_id} mb={5}>
            <Flex onClick={() => toggle(section?.task_section_id)} justify="space-between">
              <Flex
                className={classes.titles}
                style={{ cursor: 'pointer' }}
                justify="flex-start"
                gap="xs"
                align="center"
              >
                <svg
                  viewBox="64 64 896 896"
                  focusable="false"
                  data-icon="check-circle"
                  width="1.3em"
                  height="1.3em"
                  fill={
                    parseInt(section.completed_sub_sections) > 0 &&
                    parseInt(section.completed_sub_sections) < parseInt(section.total_sub_sections)
                      ? 'orange'
                      : parseInt(section.completed_sub_sections) ===
                            parseInt(section.total_sub_sections) &&
                          parseInt(section.total_sub_sections) > 0
                        ? 'teal'
                        : 'currentColor'
                  }
                  aria-hidden="true"
                >
                  <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm193.5 301.7l-210.6 292a31.8 31.8 0 01-51.7 0L318.5 484.9c-3.8-5.3 0-12.7 6.5-12.7h46.9c10.2 0 19.9 4.9 25.9 13.3l71.2 98.8 157.2-218c6-8.3 15.6-13.3 25.9-13.3H699c6.5 0 10.3 7.4 6.5 12.7z"></path>
                </svg>

                <Text
                  style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}
                  className={classes.customGray}
                  fz="sm"
                  fw={700}
                  pr="xs"
                >
                  {section?.section_title}
                </Text>
              </Flex>
              <IconChevronRight
                className={classes.chevron}
                stroke={1.5}
                style={{
                  width: rem(16),
                  height: rem(16),
                  transform: openedSections[section?.task_section_id] ? 'rotate(-90deg)' : 'none',
                  cursor: 'pointer',
                }}
              />
            </Flex>
            <Collapse in={openedSections[section?.task_section_id]} mt={1}>
              <SubChecklistSections section_id={section?.task_section_id} mutateSections={mutate} />
            </Collapse>
          </Box>
        ))}
    </Box>
  );
}

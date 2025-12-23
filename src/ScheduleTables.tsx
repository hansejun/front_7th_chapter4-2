import { Button, ButtonGroup, Flex, Heading, Stack } from '@chakra-ui/react';
import ScheduleTable from './ScheduleTable.tsx';
import { useSchedulesMap, useSetSchedulesMap } from './ScheduleContext.tsx';
import SearchDialog from './SearchDialog.tsx';
import { memo, useState } from 'react';
import ScheduleDndProvider from './ScheduleDndProvider.tsx';
import { useAutoCallback } from './useAutoCallback.ts';
import type { Schedule } from './types.ts';

interface ScheduleTableItemProps {
  tableId: string;
  schedules: Schedule[];
  index: number;
  disabledRemoveButton: boolean;
  onDuplicate: (tableId: string) => void;
  onRemove: (tableId: string) => void;
  onSearchOpen: (info: {
    tableId: string;
    day?: string;
    time?: number;
  }) => void;
}

const ScheduleTableItem = memo(
  ({
    tableId,
    schedules,
    index,
    disabledRemoveButton,
    onDuplicate,
    onRemove,
    onSearchOpen,
  }: ScheduleTableItemProps) => {
    const setSchedulesMap = useSetSchedulesMap();
    // console.log('render@@@@');

    return (
      <Stack width="600px">
        <Flex justifyContent="space-between" alignItems="center">
          <Heading as="h3" fontSize="lg">
            시간표 {index + 1}
          </Heading>
          <ButtonGroup size="sm" isAttached>
            <Button
              colorScheme="green"
              onClick={() => onSearchOpen({ tableId })}
            >
              시간표 추가
            </Button>
            <Button
              colorScheme="green"
              mx="1px"
              onClick={() => onDuplicate(tableId)}
            >
              복제
            </Button>
            <Button
              colorScheme="green"
              isDisabled={disabledRemoveButton}
              onClick={() => onRemove(tableId)}
            >
              삭제
            </Button>
          </ButtonGroup>
        </Flex>
        <ScheduleDndProvider>
          <ScheduleTable
            schedules={schedules}
            tableId={tableId}
            onScheduleTimeClick={timeInfo =>
              onSearchOpen({ tableId, ...timeInfo })
            }
            onDeleteButtonClick={({ day, time }) =>
              setSchedulesMap(prev => ({
                ...prev,
                [tableId]: prev[tableId].filter(
                  schedule =>
                    schedule.day !== day || !schedule.range.includes(time)
                ),
              }))
            }
          />
        </ScheduleDndProvider>
      </Stack>
    );
  }
);

export const ScheduleTables = () => {
  const schedulesMap = useSchedulesMap();
  const setSchedulesMap = useSetSchedulesMap();
  const [searchInfo, setSearchInfo] = useState<{
    tableId: string;
    day?: string;
    time?: number;
  } | null>(null);

  const disabledRemoveButton = Object.keys(schedulesMap).length === 1;

  const duplicate = useAutoCallback((targetId: string) => {
    setSchedulesMap(prev => ({
      ...prev,
      [`schedule-${Date.now()}`]: [...prev[targetId]],
    }));
  });

  const remove = useAutoCallback((targetId: string) => {
    setSchedulesMap(prev => {
      delete prev[targetId];
      return { ...prev };
    });
  });

  const handleSearchOpen = useAutoCallback(
    (info: { tableId: string; day?: string; time?: number }) => {
      setSearchInfo(info);
    }
  );

  return (
    <>
      <Flex w="full" gap={6} p={6} flexWrap="wrap">
        {Object.entries(schedulesMap).map(([tableId, schedules], index) => (
          <ScheduleTableItem
            key={tableId}
            tableId={tableId}
            schedules={schedules}
            index={index}
            disabledRemoveButton={disabledRemoveButton}
            onDuplicate={duplicate}
            onRemove={remove}
            onSearchOpen={handleSearchOpen}
          />
        ))}
      </Flex>
      <SearchDialog
        searchInfo={searchInfo}
        onClose={() => setSearchInfo(null)}
      />
    </>
  );
};

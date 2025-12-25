import { Button, ButtonGroup, Flex, Heading, Stack } from '@chakra-ui/react';
import ScheduleTable from './ScheduleTable.tsx';
import { useSchedulesMap, useSetSchedulesMap } from './ScheduleContext.tsx';
import { useSearchInfo, useSetSearchInfo } from './SearchInfoContext.tsx';
import SearchDialog from './SearchDialog.tsx';
import { memo } from 'react';
import ScheduleDndProvider from './ScheduleDndProvider.tsx';
import { useAutoCallback } from './useAutoCallback.ts';
import type { Schedule } from './types.ts';

interface ScheduleTableItemProps {
  tableId: string;
  schedules: Schedule[];
  index: number;
  disabledRemoveButton: boolean;
}

const ScheduleTableItem = memo(
  ({
    tableId,
    schedules,
    index,
    disabledRemoveButton,
  }: ScheduleTableItemProps) => {
    const setSchedulesMap = useSetSchedulesMap();
    const setSearchInfo = useSetSearchInfo();

    const onDuplicate = useAutoCallback((targetId: string) => {
      setSchedulesMap(prev => ({
        ...prev,
        [`schedule-${Date.now()}`]: [...prev[targetId]],
      }));
    });

    const onRemove = useAutoCallback((targetId: string) => {
      setSchedulesMap(prev => {
        delete prev[targetId];
        return { ...prev };
      });
    });

    const onScheduleTimeClick = useAutoCallback(
      (timeInfo: { day: string; time: number }) => {
        setSearchInfo({ tableId, ...timeInfo });
      }
    );

    const onDeleteButtonClick = useAutoCallback(
      ({ day, time }: { day: string; time: number }) => {
        setSchedulesMap(prev => ({
          ...prev,
          [tableId]: prev[tableId].filter(
            schedule =>
              schedule.day !== day || !schedule.range.includes(time)
          ),
        }));
      }
    );

    const onAddClick = useAutoCallback(() => setSearchInfo({ tableId }));
    const onDuplicateClick = useAutoCallback(() => onDuplicate(tableId));
    const onRemoveClick = useAutoCallback(() => onRemove(tableId));

    return (
      <Stack width="600px">
        <Flex justifyContent="space-between" alignItems="center">
          <Heading as="h3" fontSize="lg">
            시간표 {index + 1}
          </Heading>
          <ButtonGroup size="sm" isAttached>
            <Button colorScheme="green" onClick={onAddClick}>
              시간표 추가
            </Button>
            <Button colorScheme="green" mx="1px" onClick={onDuplicateClick}>
              복제
            </Button>
            <Button
              colorScheme="green"
              isDisabled={disabledRemoveButton}
              onClick={onRemoveClick}
            >
              삭제
            </Button>
          </ButtonGroup>
        </Flex>
        <ScheduleDndProvider>
          <ScheduleTable
            schedules={schedules}
            tableId={tableId}
            onScheduleTimeClick={onScheduleTimeClick}
            onDeleteButtonClick={onDeleteButtonClick}
          />
        </ScheduleDndProvider>
      </Stack>
    );
  }
);

export const ScheduleTables = () => {
  const schedulesMap = useSchedulesMap();
  const searchInfo = useSearchInfo();
  const disabledRemoveButton = Object.keys(schedulesMap).length === 1;

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
          />
        ))}
      </Flex>
      {searchInfo && <SearchDialog />}
    </>
  );
};

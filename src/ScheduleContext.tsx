import React, {
  createContext,
  PropsWithChildren,
  useContext,
  useState,
} from 'react';
import { Schedule } from './types.ts';
import dummyScheduleMap from './dummyScheduleMap.ts';

type SchedulesMap = Record<string, Schedule[]>;
type SetSchedulesMap = React.Dispatch<React.SetStateAction<SchedulesMap>>;

// Context 분리
const SchedulesMapContext = createContext<SchedulesMap | undefined>(undefined); // Query
const SetSchedulesMapContext = createContext<SetSchedulesMap | undefined>(
  undefined
); // Command

// 읽기
export const useSchedulesMap = () => {
  const context = useContext(SchedulesMapContext);
  if (context === undefined) {
    throw new Error('useSchedulesMap must be used within a ScheduleProvider');
  }
  return context;
};

// 쓰기
export const useSetSchedulesMap = () => {
  const context = useContext(SetSchedulesMapContext);
  if (context === undefined) {
    throw new Error(
      'useSetSchedulesMap must be used within a ScheduleProvider'
    );
  }
  return context;
};

// 기존 훅 (호환성 유지)
export const useScheduleContext = () => {
  return {
    schedulesMap: useSchedulesMap(),
    setSchedulesMap: useSetSchedulesMap(),
  };
};

export const ScheduleProvider = ({ children }: PropsWithChildren) => {
  const [schedulesMap, setSchedulesMap] =
    useState<SchedulesMap>(dummyScheduleMap);

  return (
    <SetSchedulesMapContext.Provider value={setSchedulesMap}>
      <SchedulesMapContext.Provider value={schedulesMap}>
        {children}
      </SchedulesMapContext.Provider>
    </SetSchedulesMapContext.Provider>
  );
};

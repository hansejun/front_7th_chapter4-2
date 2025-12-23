import { createContext, PropsWithChildren, useContext, useState } from 'react';

export interface SearchInfo {
  tableId: string;
  day?: string;
  time?: number;
}

type SetSearchInfo = (info: SearchInfo | null) => void;

// Context 분리 (CQRS 패턴)
const SearchInfoContext = createContext<SearchInfo | null | undefined>(undefined);
const SetSearchInfoContext = createContext<SetSearchInfo | undefined>(undefined);

// Query 훅
export const useSearchInfo = () => {
  const context = useContext(SearchInfoContext);
  if (context === undefined) {
    throw new Error('useSearchInfo must be used within a SearchInfoProvider');
  }
  return context;
};

// Command 훅
export const useSetSearchInfo = () => {
  const context = useContext(SetSearchInfoContext);
  if (context === undefined) {
    throw new Error('useSetSearchInfo must be used within a SearchInfoProvider');
  }
  return context;
};

export const SearchInfoProvider = ({ children }: PropsWithChildren) => {
  const [searchInfo, setSearchInfo] = useState<SearchInfo | null>(null);

  return (
    <SetSearchInfoContext.Provider value={setSearchInfo}>
      <SearchInfoContext.Provider value={searchInfo}>
        {children}
      </SearchInfoContext.Provider>
    </SetSearchInfoContext.Provider>
  );
};

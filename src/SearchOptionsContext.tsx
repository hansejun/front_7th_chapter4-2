import {
  createContext,
  PropsWithChildren,
  useContext,
  useState,
  useMemo,
} from 'react';

export interface SearchOptions {
  query: string;
  grades: number[];
  days: string[];
  times: number[];
  majors: string[];
  credits?: number;
}

// ============ Query Context ============
const QueryContext = createContext<string | undefined>(undefined);
const SetQueryContext = createContext<
  React.Dispatch<React.SetStateAction<string>> | undefined
>(undefined);

export const useSearchQuery = () => {
  const context = useContext(QueryContext);
  if (context === undefined) {
    throw new Error('useSearchQuery must be used within SearchOptionsProvider');
  }
  return context;
};

export const useSetSearchQuery = () => {
  const context = useContext(SetQueryContext);
  if (context === undefined) {
    throw new Error(
      'useSetSearchQuery must be used within SearchOptionsProvider'
    );
  }
  return context;
};

// ============ Credits Context ============
const CreditsContext = createContext<number | undefined>(undefined);
const SetCreditsContext = createContext<
  React.Dispatch<React.SetStateAction<number | undefined>> | undefined
>(undefined);

export const useSearchCredits = () => {
  return useContext(CreditsContext);
};

export const useSetSearchCredits = () => {
  const context = useContext(SetCreditsContext);
  if (context === undefined) {
    throw new Error(
      'useSetSearchCredits must be used within SearchOptionsProvider'
    );
  }
  return context;
};

// ============ Grades Context ============
const GradesContext = createContext<number[] | undefined>(undefined);
const SetGradesContext = createContext<
  React.Dispatch<React.SetStateAction<number[]>> | undefined
>(undefined);

export const useSearchGrades = () => {
  const context = useContext(GradesContext);
  if (context === undefined) {
    throw new Error(
      'useSearchGrades must be used within SearchOptionsProvider'
    );
  }
  return context;
};

export const useSetSearchGrades = () => {
  const context = useContext(SetGradesContext);
  if (context === undefined) {
    throw new Error(
      'useSetSearchGrades must be used within SearchOptionsProvider'
    );
  }
  return context;
};

// ============ Days Context ============
const DaysContext = createContext<string[] | undefined>(undefined);
const SetDaysContext = createContext<
  React.Dispatch<React.SetStateAction<string[]>> | undefined
>(undefined);

export const useSearchDays = () => {
  const context = useContext(DaysContext);
  if (context === undefined) {
    throw new Error('useSearchDays must be used within SearchOptionsProvider');
  }
  return context;
};

export const useSetSearchDays = () => {
  const context = useContext(SetDaysContext);
  if (context === undefined) {
    throw new Error(
      'useSetSearchDays must be used within SearchOptionsProvider'
    );
  }
  return context;
};

// ============ Times Context ============
const TimesContext = createContext<number[] | undefined>(undefined);
const SetTimesContext = createContext<
  React.Dispatch<React.SetStateAction<number[]>> | undefined
>(undefined);

export const useSearchTimes = () => {
  const context = useContext(TimesContext);
  if (context === undefined) {
    throw new Error('useSearchTimes must be used within SearchOptionsProvider');
  }
  return context;
};

export const useSetSearchTimes = () => {
  const context = useContext(SetTimesContext);
  if (context === undefined) {
    throw new Error(
      'useSetSearchTimes must be used within SearchOptionsProvider'
    );
  }
  return context;
};

// ============ Majors Context ============
const MajorsContext = createContext<string[] | undefined>(undefined);
const SetMajorsContext = createContext<
  React.Dispatch<React.SetStateAction<string[]>> | undefined
>(undefined);

export const useSearchMajors = () => {
  const context = useContext(MajorsContext);
  if (context === undefined) {
    throw new Error(
      'useSearchMajors must be used within SearchOptionsProvider'
    );
  }
  return context;
};

export const useSetSearchMajors = () => {
  const context = useContext(SetMajorsContext);
  if (context === undefined) {
    throw new Error(
      'useSetSearchMajors must be used within SearchOptionsProvider'
    );
  }
  return context;
};

// ============ Combined SearchOptions (SearchResults 전용) ============
export const useSearchOptions = (): SearchOptions => {
  const query = useSearchQuery();
  const credits = useSearchCredits();
  const grades = useSearchGrades();
  const days = useSearchDays();
  const times = useSearchTimes();
  const majors = useSearchMajors();

  return useMemo(
    () => ({
      query,
      credits,
      grades,
      days,
      times,
      majors,
    }),
    [query, credits, grades, days, times, majors]
  );
};

// ============ Provider ============ 이거 진짜 오반듯
export const SearchOptionsProvider = ({ children }: PropsWithChildren) => {
  const [query, setQuery] = useState('');
  const [credits, setCredits] = useState<number | undefined>(undefined);
  const [grades, setGrades] = useState<number[]>([]);
  const [days, setDays] = useState<string[]>([]);
  const [times, setTimes] = useState<number[]>([]);
  const [majors, setMajors] = useState<string[]>([]);

  return (
    <SetQueryContext.Provider value={setQuery}>
      <QueryContext.Provider value={query}>
        <SetCreditsContext.Provider value={setCredits}>
          <CreditsContext.Provider value={credits}>
            <SetGradesContext.Provider value={setGrades}>
              <GradesContext.Provider value={grades}>
                <SetDaysContext.Provider value={setDays}>
                  <DaysContext.Provider value={days}>
                    <SetTimesContext.Provider value={setTimes}>
                      <TimesContext.Provider value={times}>
                        <SetMajorsContext.Provider value={setMajors}>
                          <MajorsContext.Provider value={majors}>
                            {children}
                          </MajorsContext.Provider>
                        </SetMajorsContext.Provider>
                      </TimesContext.Provider>
                    </SetTimesContext.Provider>
                  </DaysContext.Provider>
                </SetDaysContext.Provider>
              </GradesContext.Provider>
            </SetGradesContext.Provider>
          </CreditsContext.Provider>
        </SetCreditsContext.Provider>
      </QueryContext.Provider>
    </SetQueryContext.Provider>
  );
};

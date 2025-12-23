import { ChakraProvider } from '@chakra-ui/react';
import { ScheduleProvider } from './ScheduleContext.tsx';
import { SearchInfoProvider } from './SearchInfoContext.tsx';
import { ScheduleTables } from './ScheduleTables.tsx';

function App() {
  return (
    <ChakraProvider>
      <ScheduleProvider>
        <SearchInfoProvider>
          <ScheduleTables />
        </SearchInfoProvider>
      </ScheduleProvider>
    </ChakraProvider>
  );
}

export default App;

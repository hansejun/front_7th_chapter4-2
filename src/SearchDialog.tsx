import { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  VStack,
} from '@chakra-ui/react';
import axios from 'axios';
import {
  SearchOptionsProvider,
  useSetSearchDays,
  useSetSearchTimes,
} from './SearchOptionsContext';
import { useSearchInfo, useSetSearchInfo } from './SearchInfoContext';
import { SearchFilters } from './searchDialog/SearchFilters';
import { SearchResults } from './searchDialog/SearchResults';
import { Lecture } from './types';
import { createCachedFunction } from './utils/apiCache';

const BASE_URL = import.meta.env.BASE_URL;

const fetchMajors = () =>
  axios.get<Lecture[]>(`${BASE_URL}/schedules-majors.json`);
const fetchLiberalArts = () =>
  axios.get<Lecture[]>(`${BASE_URL}/schedules-liberal-arts.json`);

const cachedFetchMajors = createCachedFunction(fetchMajors);
const cachedFetchLiberalArts = createCachedFunction(fetchLiberalArts);

const fetchAllLectures = () =>
  Promise.all([
    cachedFetchMajors(),
    cachedFetchLiberalArts(),
    cachedFetchMajors(),
    cachedFetchLiberalArts(),
    cachedFetchMajors(),
    cachedFetchLiberalArts(),
  ]);

const SearchContent = () => {
  const searchInfo = useSearchInfo();
  const setDays = useSetSearchDays();
  const setTimes = useSetSearchTimes();

  const [lectures, setLectures] = useState<Lecture[]>([]);

  const allMajors = useMemo(
    () => [...new Set(lectures.map(lecture => lecture.major))],
    [lectures]
  );

  // 데이터 패칭
  useEffect(() => {
    const start = performance.now();
    console.log('API 호출 시작: ', start);
    fetchAllLectures().then(results => {
      const end = performance.now();
      console.log('모든 API 호출 완료 ', end);
      console.log('API 호출에 걸린 시간(ms): ', end - start);
      setLectures(results.flatMap(result => result.data));
    });
  }, []);

  // searchInfo 초기값 설정 (day, time)
  useEffect(() => {
    setDays(searchInfo?.day ? [searchInfo.day] : []);
    setTimes(searchInfo?.time ? [searchInfo.time] : []);
  }, [searchInfo, setDays, setTimes]);

  return (
    <VStack spacing={4} align="stretch">
      <SearchFilters allMajors={allMajors} />
      <SearchResults lectures={lectures} />
    </VStack>
  );
};

const SearchDialog = () => {
  const searchInfo = useSearchInfo();
  const setSearchInfo = useSetSearchInfo();

  return (
    <Modal
      isOpen={Boolean(searchInfo)}
      onClose={() => setSearchInfo(null)}
      size="6xl"
    >
      <ModalOverlay />
      <ModalContent maxW="90vw" w="1000px">
        <ModalHeader>수업 검색</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <SearchOptionsProvider>
            <SearchContent />
          </SearchOptionsProvider>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default SearchDialog;

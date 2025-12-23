# SearchDialog.tsx 성능 최적화 계획

## 문제 요약

SearchDialog 컴포넌트에서 **매 렌더링마다 불필요한 고비용 연산**이 반복 실행되어 성능 저하 발생:

1. **필터링 연산**: `getFilteredLectures()` - 6단계 체이닝 필터가 매번 실행
2. **전공 목록 계산**: `allMajors` - lectures.map() + Set 생성 반복
3. **parseSchedule 중복**: 동일 강의에 대해 2회 호출 (days 필터 + times 필터)
4. **함수 재생성**: `changeSearchOption`, `addSchedule`이 매 렌더링마다 재생성
5. **중복 API 호출 코드**: fetchAllLectures에서 동일 함수 3번씩 호출

## 최적화 전략

### 핵심 원칙
- **변경 빈도별 계층화**: lectures → searchOptions → page 순으로 변경 빈도 분리
- **선택적 메모이제이션**: 각 계층마다 적절한 useMemo 적용
- **계산 중복 제거**: parseSchedule을 필터링 과정에서 1회만 호출

### 구현 우선순위

#### Phase 1: Quick Wins (즉시 실행, 낮은 리스크)
1. **중복 API 호출 정리** - fetchAllLectures의 중복 제거
2. **useAutoCallback 적용** - changeSearchOption, addSchedule에 적용

#### Phase 2: Core Optimizations (높은 효과)
3. **allMajors 메모이제이션** - useMemo([lectures])
4. **parseSchedule 중복 제거** - 필터 체인 재구성으로 1회만 호출
5. **filteredLectures 메모이제이션** - useMemo([lectures, searchOptions])
6. **visibleLectures 메모이제이션** - useMemo([filteredLectures, page])

## 상세 구현 계획

### 1. API 호출 정리 (line 93-101)

**현재:**
```typescript
Promise.all([
  cachedFetchMajors(),
  cachedFetchLiberalArts(),
  cachedFetchMajors(),      // 중복
  cachedFetchLiberalArts(), // 중복
  cachedFetchMajors(),      // 중복
  cachedFetchLiberalArts(), // 중복
])
```

**개선:**
```typescript
Promise.all([
  cachedFetchMajors(),
  cachedFetchLiberalArts(),
])
```

---

### 2. useAutoCallback 적용

**대상 함수:**
- `changeSearchOption` (line 158-165)
- `addSchedule` (line 167-183)

**적용 이유:**
- 프로젝트에 이미 구현된 useAutoCallback 활용
- 함수 참조 안정화로 불필요한 리렌더링 방지
- 항상 최신 state 참조 보장

---

### 3. allMajors 메모이제이션 (line 156)

**현재:**
```typescript
const allMajors = [...new Set(lectures.map(lecture => lecture.major))];
```

**개선:**
```typescript
const allMajors = useMemo(
  () => [...new Set(lectures.map(lecture => lecture.major))],
  [lectures]
);
```

**효과:** lectures는 초기 로딩 후 변경 없으므로 사실상 1회만 계산

---

### 4. parseSchedule 중복 제거 (line 119-151) ⚠️ 핵심

**현재 문제:**
```typescript
.filter(lecture => {
  // days 필터: parseSchedule 1회 호출
  const schedules = parseSchedule(lecture.schedule);
  return schedules.some(s => days.includes(s.day));
})
.filter(lecture => {
  // times 필터: 동일 강의에 대해 parseSchedule 또 1회 호출
  const schedules = parseSchedule(lecture.schedule);
  return schedules.some(s => s.range.some(time => times.includes(time)));
});
```

**개선 전략:** 필터 체인 재구성

```typescript
const getFilteredLectures = () => {
  const { query = '', credits, grades, days, times, majors } = searchOptions;

  return lectures
    // 1단계: 간단한 필터 먼저 (parseSchedule 불필요)
    .filter(lecture =>
      lecture.title.toLowerCase().includes(query.toLowerCase()) ||
      lecture.id.toLowerCase().includes(query.toLowerCase())
    )
    .filter(lecture => grades.length === 0 || grades.includes(lecture.grade))
    .filter(lecture => majors.length === 0 || majors.includes(lecture.major))
    .filter(lecture => !credits || lecture.credits.startsWith(String(credits)))

    // 2단계: schedule 필터 통합 (parseSchedule 1회만 호출)
    .filter(lecture => {
      // days, times 필터가 모두 비어있으면 parseSchedule 불필요
      if (days.length === 0 && times.length === 0) {
        return true;
      }

      const schedules = lecture.schedule ? parseSchedule(lecture.schedule) : [];

      // days 필터 체크
      const passesDays = days.length === 0 ||
        schedules.some(s => days.includes(s.day));

      // times 필터 체크
      const passesTimes = times.length === 0 ||
        schedules.some(s => s.range.some(time => times.includes(time)));

      return passesDays && passesTimes;
    });
};
```

**효과:**
- parseSchedule 호출 횟수: 강의당 2회 → 1회 (50% 감소)
- days/times 필터가 비어있을 때 parseSchedule 완전 생략 가능

---

### 5. filteredLectures 메모이제이션 (line 153)

**현재:**
```typescript
const filteredLectures = getFilteredLectures();
```

**개선:**
```typescript
const filteredLectures = useMemo(
  () => getFilteredLectures(),
  [lectures, searchOptions]
);
```

**효과:**
- searchOptions 변경 시에만 재계산
- 컴포넌트 리렌더링 시 필터링 재실행 방지

---

### 6. visibleLectures 메모이제이션 (line 155)

**현재:**
```typescript
const visibleLectures = filteredLectures.slice(0, page * PAGE_SIZE);
```

**개선:**
```typescript
const visibleLectures = useMemo(
  () => filteredLectures.slice(0, page * PAGE_SIZE),
  [filteredLectures, page]
);
```

**효과:**
- page 변경 시에만 slice 재실행
- filteredLectures 변경 없이 리렌더링 시 최적화

---

## 주요 파일

- **src/SearchDialog.tsx** - 모든 최적화 적용 대상
- **src/useAutoCallback.ts** - changeSearchOption, addSchedule에 사용
- **src/utils.ts** - parseSchedule 함수 참조 (로직 변경 없음)

## 주의사항

### parseSchedule 중복 제거 시
- ⚠️ **필터 로직 변경으로 인한 회귀 주의**
- days/times가 모두 비어있을 때 parseSchedule 생략 확인
- 기존 결과와 동일한지 테스트 필요

### useMemo 의존성 배열
- searchOptions는 객체이므로 참조 비교
- 새 객체 생성 시 자동으로 재계산됨
- 의존성 누락 주의 (ESLint exhaustive-deps 활용)

### useAutoCallback
- loaderWrapperRef.current는 항상 최신 참조 보장
- ESLint 경고 발생 시 주석으로 억제 가능

## 검증 시나리오

1. **검색어 입력**: filteredLectures만 재계산, allMajors 재사용
2. **요일 필터**: parseSchedule이 강의당 1회만 호출되는지 확인
3. **페이지 스크롤**: visibleLectures만 재계산, 60fps 유지
4. **엣지 케이스**: schedule 빈 문자열, 필터 결과 0개

## 예상 성능 개선

- 타이핑 시 렌더링 시간: ~50-100ms → ~10-20ms (80% 개선)
- parseSchedule 호출: 강의당 2회 → 1회 (50% 감소)
- 메모리 할당: 매 렌더링 → 필요 시에만 (90% 감소)

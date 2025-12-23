# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React-based university course schedule management application (10주차-성능최적화-2-심화과제). Users can create, duplicate, and manage multiple timetables with drag-and-drop functionality. The project focuses on performance optimization techniques for React applications.

## Development Commands

```bash
# Development
pnpm dev                # Start development server with Vite

# Testing
pnpm test              # Run tests with Vitest in watch mode
pnpm test:ui           # Run tests with Vitest UI
pnpm test:coverage     # Generate test coverage report (outputs to ./.coverage)

# Build & Quality
pnpm build             # TypeScript compilation + Vite build
pnpm lint              # Run ESLint on TypeScript/TSX files
pnpm format            # Format code with Prettier
pnpm format:check      # Check formatting without modifying files
```

## Architecture

### State Management Architecture

The application uses React Context for global state management centered around a **schedulesMap** structure:

```typescript
Record<string, Schedule[]>
```

- **Key**: A unique table ID (e.g., `"schedule-1234567890"`)
- **Value**: Array of Schedule objects for that specific timetable

This architecture allows multiple independent timetables to coexist, each managed by its own key. The `ScheduleContext` (src/ScheduleContext.tsx) provides centralized access to this map and its setter throughout the component tree.

### Component Hierarchy

```
App (ChakraProvider + ScheduleProvider)
└── ScheduleTables
    ├── Multiple ScheduleTable instances (one per timetable)
    │   └── ScheduleDndProvider (wraps each table for isolated drag-and-drop)
    │       └── DraggableSchedule components
    └── SearchDialog (modal for adding lectures)
```

### Drag-and-Drop System

Each `ScheduleTable` is wrapped in its own `ScheduleDndProvider` from `@dnd-kit/core`. This creates isolated drag-and-drop contexts per table:

- **ScheduleDndProvider.tsx**: Implements snap-to-grid behavior using custom modifiers
- **ScheduleTable.tsx**: Contains `DraggableSchedule` components with position calculated from Schedule data
- Dragging updates the schedule's `day` and `range` (time slots) in the schedulesMap

The drag system uses a composite ID pattern `"${tableId}:${index}"` to identify which schedule in which table is being dragged.

### Data Model

**Lecture** (src/types.ts): Represents a course with metadata (id, title, credits, major, schedule string, grade)

**Schedule**: Associates a Lecture with specific time slots:
- `lecture`: Reference to the Lecture object
- `day`: Day of week (월, 화, 수, 목, 금, 토)
- `range`: Array of time slot numbers (e.g., [1, 2, 3] for 1st through 3rd periods)
- `room`: Optional room location

### Performance Optimization Utilities

**src/utils/apiCache.ts**: `createCachedFunction` wraps API calls to cache Promise results, preventing redundant network requests. Used in SearchDialog for fetching lecture data.

**src/useAutoCallback.ts**: `useAutoCallback` hook maintains a stable callback reference while always calling the latest version of the function. Prevents unnecessary re-renders when passing callbacks to child components.

### Schedule Parsing

The `parseSchedule` utility (src/utils.ts) converts schedule strings from the API (format: `"월1~3(101호)<p>수2~4(102호)"`) into structured Schedule objects. The `<p>` delimiter separates multiple schedule entries for a single lecture.

### SearchDialog Filtering

SearchDialog implements complex multi-criteria filtering (query, grades, days, times, majors, credits) with infinite scroll pagination (100 items per page). It uses IntersectionObserver to detect when the user scrolls near the bottom and loads more results.

## Key Technical Details

- **Build tool**: Vite (using `rolldown-vite` variant)
- **Testing**: Vitest with jsdom environment, setup in src/setupTests.ts
- **Styling**: Chakra UI components throughout
- **Grid Layout**: Schedule tables use CSS Grid with precise positioning (120px row header, 80px column width, 30px cell height for regular periods)
- **Time slots**: 24 periods total - 18 regular 30-minute slots (09:00-18:00), then 6 evening 50-minute slots (18:00-23:25)

## Working with Schedules

When modifying schedule-related logic:

1. Always consider the `schedulesMap` structure - operations typically update the entire map immutably
2. Schedule positioning is calculated from `day` (determines column) and `range[0]` (determines starting row)
3. The `day` values must match `DAY_LABELS` from constants.ts
4. Time range arrays represent consecutive periods (e.g., [5, 6, 7] means periods 5-7)
5. When dragging, the delta is converted from pixels to grid units (80px per column, 30px per row)

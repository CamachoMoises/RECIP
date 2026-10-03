# RECIP Frontend — Agent Guide

Aviation training management system (Registro de Evaluación, Capacitación e Instrucción del Piloto).

## Quick Start

```bash
npm run dev      # Vite dev server
npm run build    # TypeScript check + Vite build
npm run lint     # ESLint
```

## Tech Stack

React 18 + TypeScript + Vite | React Router v6 | Redux Toolkit | Material Tailwind v2 + Tailwind v4 | Lucide icons | react-hook-form | Axios | react-helmet-async

## Project Structure

```
src/
  components/       # Shared: NavBar, PageTitle, LoadingPage, ErrorPage, etc.
  features/         # Redux slices (auth, course, subject, test, assessment, user, theme)
  hooks/            # Custom hooks (useTheme)
  lib/              # utils.ts (cn helper)
  pages/            # Route pages
    dashboard.tsx   # Main dashboard layout with all nested routes
    dashboard/
      icons.tsx     # Home icon grid (permission-filtered)
      register/     # User registration
      users/        # Admin user management
      courses/      # Course scheduling
      students/     # Pilot management
      instructors/  # Instructor management
      instructorCourses/ # Instructor dashboard (my courses, schedule, groups, attendance, assessments, tests)
        tabs/       # Tab components for instructor course detail
      config/       # Course/subject/lesson/test config
      assessment/   # FSTD/ATD evaluations
      test/         # Exams/tests
      reports/      # Reports & suggestions
      suggestions/  # SuggestionDialog, SuggestionListDialog
  services/
    axios.ts        # Axios instance with Bearer token interceptor
    permissionsValidate.ts
  types/
    utilities.d.ts  # All TypeScript interfaces
  store.tsx         # Redux store + persist config
```

## Dashboard Routes

| Path | Component | Permission |
|------|-----------|------------|
| `/` | Icons | all |
| `users` | UsersTable | staff |
| `register` | Register | any |
| `courses` | GeneralCourses | staff |
| `my-courses` | StudentCourses | student |
| `students` | TableStudents | staff |
| `instructors` | TableInstructors | staff |
| `config` | GeneralConfig | staff |
| `config/course/:id` | CourseDetail | staff |
| `config/test/:id` | TestList | staff |
| `assessment` | GeneralAssessment | instructor |
| `course_assessment/:id/:course_id` | DetailAssessment | instructor |
| `test` | GeneralTest | student, instructor |
| `new_test/:id/:course_id/:test_id` | NewTest | student, instructor |
| `review_test/:CST_id/:test_id/:course_id/:CS_id/:user_id` | ReviewTest | student, instructor |
| `new_course/:id/:course_id` | NewCourse | staff |
| `view_course/:id/:course_id` | ViewCourseStudentSchedule | staff, instructor, student |
| `my-instructor-courses` | MyInstructorCourses | instructor |
| `reports` | Reports | super_user |

## Key Patterns

- **All MT components** (including `Button`) need `placeholder={undefined}` and `onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}` — with @types/react 18.3 these props are **required** by the MT Button type; `undefined` value causes no React DOM warnings
- **API**: Use `axiosGetSlice`, `axiosPostSlice`, `axiosPutSlice` from `services/axios.ts`
- **Auth**: Token auto-injected; 403 triggers logout via Redux dispatch
- **Permissions**: `PermissionsValidate(['staff', 'instructor'])` returns boolean
- **Breadcrumbs**: `<PageTitle title="..." breadCrumbs={[{name, href}]} />` component
- **Theme**: `useTheme()` hook returns `{ theme, toggle }` with CSS variables
- **SEO**: `<SEO title="..." description="..." url="..." />` component in `src/components/SEO.tsx` — use on every public page for meta tags, Open Graph, Twitter Cards, JSON-LD structured data, and canonical URLs
- **HelmetProvider**: Wraps the app in `src/main.tsx` (required for `<SEO>` to work)
- **Sitemap**: `public/sitemap.xml` (update when adding public routes)
- **robots.txt**: `public/robots.txt`

## Adding a New Dashboard Page

1. Create component in `src/pages/dashboard/<section>/`
2. Add route in `src/pages/dashboard.tsx`
3. Add icon entry in `src/pages/dashboard/icons.tsx`
4. Add manual route in `src/components/NavBar.tsx` (`manualRoutes`)
5. Update this file and `CLAUDE.md`

## Important

- All suggestions functionality was moved from `generalCourses.tsx` to `reports/Reports.tsx` (expandable card, admin only)
- Redux slices use `createAsyncThunk` with automatic 403 handling
- Database IDs are numbers, route params are strings

## Course Group Signatures

- Signatures are per-day (one signature per `course.days`) stored in `course_group_signatures` table
- Type: `courseGroupSignature` with `id`, `course_group_id`, `day_number`, `signature_url`
- State: `courseGroupSignatures: courseGroupSignature[]` in `courseGroupSlice`
- API: `POST /api/course_groups/signature` (`{ course_group_id, day_number, signature }`), `GET /api/course_groups/:id/signatures`
- UI: Collapsible day dropdowns in accordion body; `savedDays` local Set tracks saved state independently of backend

## Schedule Deletion

- Individual: `deleteSchedule(scheduleId)` → `DELETE /api/courses/schedule/:id` (`schedule.id`, not `course_student_id`)
- Bulk: `deleteAllCourseStudentSchedules(courseStudentId)` → `DELETE /api/courses/schedule/course-student/:course_student_id`
- Both cascade to `attendance` + `attendance_signature` of each `(date, day)` pair that had a schedule; the response carries `deleted_count`, `deleted_attendance_count`, `deleted_signature_count`
- UI: per-session `Trash2` in `newCourseStudentScheduleSubject.tsx`; bulk "Eliminar horarios" in `newCourseStudentSchedule.tsx` (next to Imprimir), both behind a confirm dialog

## Instructor Dashboard (`my-instructor-courses`)

Single general page for the instructor. There is **no** per-course detail route anymore: the tabs live inside `myInstructorCourses.tsx` and every request is oriented to the logged-in instructor, not to a `course_id`:

- `tabs/instructorShared.ts` — shared types/helpers (`courseIdOfSchedule`, `hasRealSession`, `buildSessions`, `buildRoster`, `buildCourseCatalog`, `draftKeyOf`, `sessionKey`, `isTheoreticalCourse`, `GROUPS_PAGE_SIZE`)
- Every tab takes `{ instructor_id, courses?, courseId? }`. `instructor_id` is the only thing sent to the API; `courseId` is a **client-side screen filter** coming from the course selector at the top. `courses` is the full catalog (`GET /api/courses/` from `fetchCourses()`) used to resolve each row's program (`days`/`sessions`) and `course_type`
- `InstructorScheduleTab` → `GET /api/instructor/schedule/:instructor_id`, grouped by course and then by `subject_day.day`
- `InstructorGroupsTab` / `InstructorSignaturesTab` → `GET /api/course_groups?instructor_id` (`pageSize: 500`). Never send `course_id` together with `instructor_id`: the repository replaces the filter with the instructor's course list
- `InstructorAttendanceTab` → builds one `InstructorAttendanceCourseSection` per course (see below)
- `InstructorAssessmentTab` → `GET /api/instructor/assessments?instructor_id`
- `InstructorTestsTab` → `GET /api/instructor/tests?instructor_id`
- The table row action (`Eye`) does not navigate: it selects that course in the filter and switches to the "Cronograma" tab

## Instructor Attendance Marking

- `tabs/InstructorAttendanceTab.tsx` (tab "Asistencia") loads everything by `instructor_id` and renders one `InstructorAttendanceCourseSection` per course, since the ordinal (día/sesión), the program size and the roster are per course; mixing them in one grid would mark the wrong session
- Roster: derived from `GET api/instructor/schedule/:instructor_id` and split by course. The course of a row comes from `course_student.course_id`, with `subject_day.course_id` / `subject.course_id` as fallback. Do **not** use `api/course_groups?instructor_id&course_id`: the repository overwrites the `course_id` filter with the instructor's course list, which leaks other courses' students
- Subjects: `fetchSubjects` is dispatched once per **distinct** course in the schedule (`GET /api/subjects/course/:id` is per course) so the `subject_days_id` fallback can resolve the ordinal
- Sessions: grouped by `courseId#YYYY-MM-DD#day`; the ordinal comes from `subject_day.day` with a fallback lookup on `subject_days_id`. Only rows with a **real session** reach the accordion, the roster or the history: `subject_day.status && subject.status` must be true and the ordinal must fall inside the program (`isWithinProgram` → `1..days`, or `1..sessions`). This mirrors `viewCourseStudentSchedule.tsx` and hides two kinds of phantom days that exist in the data: `subject_days` rows deactivated (`status = 0`) and `subject_days.day` greater than the course size (e.g. day 7 on a 6-day course)
- Existing records: `GET api/attendance?instructor_id` returns the attendance of **all** the instructor's courses, so every page is fetched (`pageSize: 500`, max 20 pages) and both the marking grid and the read-only "Registro de Asistencia" accordion are filtered client-side by the roster's `course_student_id`, with the accordion paginating client-side. The list response has no nested `student`/`course`, so name/code are resolved from the local roster map
- Draft key is `course_student_id#YYYY-MM-DD#day` (date alone collides when several sessions share a date); session keys carry the `courseId` prefix because the same day/session repeats across courses
- `attendances` is state in the tab but **not** an effect dependency: the sections read it from props and refresh through `onSaved={loadAttendances}`, otherwise the effect would re-trigger itself on every save
- Writes reuse `createAttendance`/`updateAttendance` with `usesSessions(course) ? { day, session_number: day } : { day }`: the backend validates `day` as required and resolves `session_number ?? day`, so both keys must be sent for session-based courses
- Courses with `course_type.id === 2` (theoretical) are dropped entirely, same rule as `viewCourseStudentSchedule.tsx`

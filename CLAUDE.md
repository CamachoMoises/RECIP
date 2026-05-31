# RECIP Frontend

Aviation training management system (Registro de Evaluación, Capacitación e Instrucción del Piloto).

## Tech Stack

- **Framework**: React 18 + TypeScript + Vite
- **Routing**: React Router DOM v6 (nested routes in `src/App.tsx` and `src/pages/dashboard.tsx`)
- **State**: Redux Toolkit + Redux Persist
- **UI**: Material Tailwind v2 + Tailwind CSS v4 + Lucide icons
- **Forms**: react-hook-form
- **API**: Axios (services in `src/services/axios.ts`)
- **PDF**: @react-pdf/renderer + react-to-print
- **Other**: react-hot-toast, react-signature-canvas, xlsx, Cloudinary, pako

## Project Structure

```
src/
  components/       # Shared: NavBar, PageTitle, LoadingPage, ErrorPage, scrollTop, ThemeInitializer, countDown
  features/         # Redux slices: authSlice, courseSlice, subjectSlice, testSlice, assessmentSlice, userSlice, themeSlice, counterSlice
  hooks/            # Custom hooks: useTheme
  lib/              # Utilities: utils.ts (cn helper)
  pages/            # Route pages
    login.tsx
    dashboard.tsx   # Main dashboard layout with nested routes
    HomePage.tsx, AboutUs.tsx, ContactPage.tsx, notFound.tsx
    dashboard/
      icons.tsx     # Dashboard home icon grid with permission-based visibility
      register/     # User registration
      users/        # Admin user management (usersTable, modalFormUser)
      courses/      # Course scheduling (generalCourses, newCourseStudentSchedule, viewCourseStudentSchedule, PDF generation)
      students/     # Pilot/participant management (tableStudents)
      instructors/  # Instructor management (tableInstructors)
      config/       # Course config, subjects, lessons, test questions management (generalConfig, courseDetail, questionType*, testList, etc.)
      assessment/   # FSTD/ATD flight evaluations (generalAssessment, scoreDetail, CSAD_form, CSA_PDF, lessonDetails)
      test/         # Exams/tests (generalTest, newTest, reviewTest, questionType*, resultsTestPdf)
      reports/      # Reports & suggestions list
      suggestions/  # SuggestionDialog, SuggestionListDialog
  services/
    axios.ts        # Axios instance with auth interceptor
    permissionsValidate.ts  # Role-based permission check
    utilities.ts    # formatUserName, etc.
  types/
    utilities.d.ts  # All TypeScript types/interfaces
  store.tsx         # Redux store config
  styles/
    global.css      # Global styles + custom CSS classes
```

## Dashboard Routes (under /dashboard)

| Path | Component | Description |
|------|-----------|-------------|
| `/` | Icons | Dashboard home with role-based navigation grid |
| `users` | UsersTable | Admin user management (staff only) |
| `register` | Register | User registration |
| `courses` | GeneralCourses | Course scheduling & student course list |
| `students` | TableStudents | Pilot/participant management (staff only) |
| `instructors` | TableInstructors | Instructor management |
| `config` | GeneralConfig | Course/subject/lesson/test config (staff only) |
| `config/course/:id` | CourseDetail | Single course detail |
| `config/test/:id` | TestList | Test params list for a course |
| `config/testQuestion/:course_id/:test_id/:question_type_id/:test_question_type_id` | QuestionTestList | Questions for a test type |
| `assessment` | GeneralAssessment | FSTD/ATD evaluations (instructor only) |
| `course_assessment/:id/:course_id` | DetailAssessment | Single assessment detail |
| `test` | GeneralTest | Exams for students/instructors |
| `new_test/:id/:course_id/:test_id` | NewTest | Take an exam |
| `review_test/:CST_id/:test_id/:course_id/:CS_id/:user_id` | ReviewTest | Review exam results |
| `new_course/:id/:course_id` | NewCourse | Create/edit course schedule |
| `view_course/:id/:course_id` | ViewCourseStudentSchedule | View course schedule |
| `reports` | Reports | System reports & suggestions |

## Key Patterns

- **Permissions**: `PermissionsValidate(['staff', 'instructor', 'student', 'super_user'])` checks user roles before rendering UI
- **Auth**: JWT token in Redux persist; redirect to `/login` if no token
- **API calls**: Via `axiosGetSlice`, `axiosPostSlice`, `axiosPutSlice` in `services/axios.ts` — auto-inject Bearer token, handle 403 by dispatching logout
- **Theme**: Dark/light mode via `useTheme` hook, CSS variables in `global.css`
- **Breadcrumbs**: `<PageTitle>` component with breadcrumb array, used in most dashboard pages
- **PDF**: Some pages use `@react-pdf/renderer` (`PDFCourseScheduleDocument.tsx`), others use `react-to-print`

## Role System

- `super_user`: Full access (Admin label shown)
- `staff`: Admin panel, user management, config (Staff label shown)
- `instructor`: Course scheduling, assessments, exams
- `student`: View courses, take exams

## Scripts

- `npm run dev` — Vite dev server
- `npm run build` — TypeScript check + Vite build
- `npm run lint` — ESLint
- `npm run preview` — Vite preview

## Important Notes for AI Agents

- Update this file whenever project structure, routes, or key patterns change significantly.
- When adding new dashboard pages: create route in `src/pages/dashboard.tsx`, add icon in `src/pages/dashboard/icons.tsx`, register manual route in NavBar if applicable.
- All component files use the `placeholder`, `onPointerEnterCapture`, `onPointerLeaveCapture` props set to `undefined` (Material Tailwind v2 requirement).
- Follow existing patterns for imports, styling (Tailwind + glass-panel classes), and state management.

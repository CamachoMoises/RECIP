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
| `courses` | GeneralCourses | staff, instructor |
| `my-courses` | StudentCourses | student |
| `students` | TableStudents | staff |
| `instructors` | TableInstructors | instructor, staff |
| `config` | GeneralConfig | staff |
| `config/course/:id` | CourseDetail | staff |
| `config/test/:id` | TestList | staff |
| `assessment` | GeneralAssessment | instructor |
| `course_assessment/:id/:course_id` | DetailAssessment | instructor |
| `test` | GeneralTest | student, instructor |
| `new_test/:id/:course_id/:test_id` | NewTest | student, instructor |
| `review_test/:CST_id/:test_id/:course_id/:CS_id/:user_id` | ReviewTest | student, instructor |
| `new_course/:id/:course_id` | NewCourse | staff, instructor |
| `view_course/:id/:course_id` | ViewCourseStudentSchedule | staff, instructor, student |
| `reports` | Reports | super_user |

## Key Patterns

- **All MT components** need `placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}`
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

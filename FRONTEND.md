# Frontend Changes

## New fields in `course_student_assessment_day`

Added flight data fields to the assessment day records:

| Field | Type | Meaning |
|-------|------|---------|
| `takeoff_day` | number | Despegues diurnos |
| `takeoff_night` | number | Despegues nocturnos |
| `landing_day` | number | Aterrizajes diurnos |
| `landing_night` | number | Aterrizajes nocturnos |
| `training_time` | number (float) | Tiempo de entrenamiento en horas con decimales (ej. `1.5`) |
| `check_time` | number (float) | Tiempo de chequeo en horas con decimales (ej. `0.75`) |
| `type` | string | Select con 5 valores: `entrenamiento`, `reentrenamiento`, `chequeo`, `re-chequeo`, `experiencia_reciente` |

All fields are optional.

## Endpoints

### `PUT /api/assessment/updateCourseStudentAssessmentDay`
Send the 7 fields (snake_case) in the request payload (form-data). Counts (`takeoff_*`, `landing_*`) as numbers; times (`training_time`, `check_time`) as float numbers in decimal hours (ej. `1.5`); `type` as one of the 5 allowed string values.

### `GET /api/assessment/courseStudentAssessmentDay`
When creating a new assessment day (no existing day for the CSA), the 7 optional query params are accepted and stored on creation.

### `GET /api/assessment/fetchSubjectAssessment`
### `GET /api/assessment/fetchAssessmentData`
The assessment day rows returned now include these fields automatically.

## Backend files changed

- `migrations/20260802000000-add-flight-data-to-course-student-assessment-day.cjs` (new — **not executed yet**; the owner must run `npm run migrate`)
- `src/database/models/assessment.js`
- `src/database/repositories/assessment.js` (create/update assessment day)
- `src/controller/assessment.js`
- `routes.md`

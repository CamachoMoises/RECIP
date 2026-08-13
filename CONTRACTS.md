# API Endpoint Contracts

Contrato de endpoints del backend RECIP 360 ATC. Es la fuente de verdad para la forma exacta
de las peticiones y respuestas de la API. **Cualquier cambio en rutas, controladores o
repositorios que afecte una petición/respuesta DEBE actualizar este archivo en el mismo commit.**

## Convenciones globales

- **Auth**: las rutas marcadas como *Auth: sí* requieren header `Authorization: Bearer <JWT>`.
  - Sin header → `401` texto plano `Unauthorized`.
  - Token inválido/expirado → `403` con el error JWT serializado.
- **Body**: los métodos de escritura (`POST`/`PUT`) usan `multipart/form-data` (`upload.none()`)
  salvo que se indique lo contrario.
- **convertTypes**: los strings `"true"`/`"false"`/numéricos del body se convierten a boolean/number.
- **Keys de respuesta**: son **exactas**. Las claves de modelos anidados corresponden al alias de la
  asociación Sequelize. Si la asociación NO define `as:`, la clave es el alias por defecto
  (plural snake_case del nombre del modelo, p. ej. `course_student_assessment_days`). **Preferir
  siempre `as:` explícito y documentarlo aquí** (ver lección del bug de `CourseStudentAssessmentDays`).
- **Errores**: salvo que el contrato indique otro formato, los errores son texto plano
  `Internal Server Error` con status `500`. El patrón `res.status(code).json({ message, error })`
  solo se usa donde el contrato lo indica.
- **Timestamps**: todos los modelos incluyen `createdAt` / `updatedAt` (no repetidos en cada contrato).

## Modelos de referencia

| Modelo | Claves |
|---|---|
| User | `id, uuid, name, doc_number, user_doc_type_id, flag, country_name, phone, last_name, password, email, is_superuser, is_staff, is_active` |
| Student | `id, user_id, status` |
| Instructor | `id, user_id, status` |
| UserDocType | `id, name, symbol` |
| Course | `id, name, description, code, hours, plane_model, days, status, course_type_id, course_level_id` |
| CourseType | `id, name` |
| CourseLevel | `id, name` |
| CourseStudent | `id, course_id, date, score, approve, student_id, code, type_trip, license, regulation, status, max_attempts, instructor_code` |
| CourseGroup | `id, title, code, user_code, date, course_id, status` |
| CourseGroupSignature | `id, course_group_id, day_number, signature_number, signature_url` |
| CourseStudentTest | `id, course_id, score, approve, test_id, attempts, course_student_id, date, student_id, code, status, finished` |
| Schedule | `id, instructor_id, student_id, subject_days_id, subject_id, course_student_id, date, hour, classTime` |
| Subject | `id, order, name, hours, is_schedulable, status, course_id` |
| SubjectDays | `id, subject_id, course_id, day, classTime, status` |
| SubjectLesson | `id, subject_id, course_id, name, order, status` |
| SubjectLessonDays | `id, course_id, subject_id, subject_lesson_id, subject_days_id, day, classTime, status` |
| CourseStudentAssessment | `id, course_id, student_id, course_student_id, score, approve, date, code, status, finished, comments` |
| CourseStudentAssessmentDay | `id, course_id, student_id, course_student_id, course_student_assessment_id, day, airport, airstrip, elevation, meteorology, temperature, qnh, wind, weight, flaps, power, seat, takeoff, landing, comments, takeoff_day, takeoff_night, landing_day, landing_night, training_time, check_time, type` — `training_time`/`check_time` son `FLOAT` (horas decimales, ej. `1.5` = 1h30m) |
| CourseStudentAssessmentLessonDetail | `id, course_id, student_id, course_student_id, course_student_assessment_id, course_student_assessment_day_id, subject_id, subject_lesson_id, subject_days_id, subject_lesson_days_id, item, score, score_2, score_3` |
| Test | `id, course_id, min_score, duration, code, status` |
| QuestionType | `id, value, max_answer, name` |
| TestQuestionType | `id, amount, value, course_id, question_type_id, test_id, status` |
| Question | `id, header, course_id, question_type_id, test_question_type_id, test_id, status` |
| Answer | `id, value, course_id, question_id, test_id, is_correct, status` |
| CourseStudentTestQuestion | `id, course_id, test_id, course_student_id, course_student_test_id, question_id, Answered, status` |
| CourseStudentTestAnswer | `id, course_id, test_id, course_student_id, resp, course_student_test_id, course_student_test_question_id, question_id, score, status` |
| Attendance | `id, course_student_id, day, date, attendance_status_id, comments` |
| AttendanceStatus | `id, name, description` |
| AttendanceSignature | `id, attendance_id, signature_url` |
| Module | `id, name` |
| Permission | `id, name, module_id, status` |
| Group | `id, name, is_active` |
| Rating | `id, instructor_id, student_id, subject_days_id, subject_id, course_student_id, value` |
| UserSuggestion | `id, user_id, title, description` |
| EmailHistory | `id, email, user_id, nombre_archivo, fecha, tipo, descripcion, modulo` |

---

## Auth — `/auth`

### POST /auth
- Auth: no
- Body: `email` (string), `password` (string)
- `200` → `{ email, user, token }` (JWT, payload `{ id }`, expira en 1h). `user` trae los alias
  `student` e `instructor` (NO trae `user_doc_type`). Ojo: incluye `password` (hash bcrypt).
- `401` texto plano: `Invalid User` | `Invalid Password` | `User is inactive`
- `500` `Internal Server Error`

---

## Users — `/api/users`

> Nota: las respuestas de User incluyen el campo `password` (hash bcrypt) en todos los endpoints.

### GET /api/users/
- Auth: sí
- `200` → array de User con alias `student`, `instructor`, `user_doc_type`

### GET /api/users/me
- Auth: sí (usa el `id` del token)
- `200` → User con `student`, `instructor`, `user_doc_type`
- `401` JSON `{ message: 'No autenticado' }`; `404` JSON `{ message: 'Usuario no encontrado' }`

### GET /api/users/user/:user_id
- Params: `user_id`
- `200` → User con `student`, `instructor`, `user_doc_type`

### GET /api/users/userEmailValidate/:email
- Params: `email`
- `200` → `{ exist: boolean }`

### GET /api/users/userDocType
- `200` → array de UserDocType

### GET /api/users/student
- Query: `status` (`"true"`/`"false"`, opcional)
- `200` → array de User que tienen Student, con `student`, `user_doc_type`

### GET /api/users/instructor
- Query: `status` (`"true"`/`"false"`, opcional)
- `200` → array de User que tienen Instructor, con `instructor`, `user_doc_type`

### GET /api/users/student/search
- Query: `search` (string, requerido)
- `200` → `{ data: [{ student_id, name, email }] }`
- `400` JSON `{ message: 'Search query is required' }`

### POST /api/users/
- Body (Joi): `doc_number` (requerido), `email` (requerido, TLD .com/.net), `name`, `last_name`,
  `country_name`, `flag`, `phone`, `password`, `user_doc_type_id`, `is_superuser`, `is_staff`, `is_active`
- `201` → User (sin includes)
- `400` texto plano `Input Validation Error <msg>`

### POST /api/users/student
- Body: `user_id` (requerido)
- `201` → User con `student`, `instructor`, `user_doc_type`

### POST /api/users/instructor
- Body: `user_id` (requerido)
- `201` → User con `student`, `instructor`, `user_doc_type`

### PUT /api/users/
- Body (Joi): `id` (requerido), `doc_number` (requerido), `email` (requerido), `uuid` (requerido de
  facto, busca al usuario por uuid), `name`, `last_name`, `country_name`, `flag`, `phone`,
  `password`, `user_doc_type_id`, `is_superuser`, `is_staff`, `is_active`, `createdAt`, `updatedAt`
- `201` → User con `student`, `instructor`, `user_doc_type`
- `404` texto plano `User not found`; `400` `Input Validation Error <msg>`

### PUT /api/users/disable-role
- Body: `user_id` (requerido), `role` (`"student"` | `"instructor"`)
- `200` → User con `student`, `instructor`, `user_doc_type`
- `400` texto plano `Invalid role`

---

## Courses — `/api/courses`

### GET /
- Query: `name`, `description`, `course_type_id`, `course_level_id` (todos opcionales)
- `200` → array de Course con alias `course_type`, `course_level`

### POST /
- Body (Joi; `type`→`course_type_id`, `level`→`course_level_id`): `name`, `description`, `code`,
  `days` (requeridos); `type`, `level` (requeridos); `plane_model`, `status` (opcionales)
- `201` → Course con `course_type`, `course_level`

### PUT /
- Body (Joi, mismo que POST + `id` requerido; se ignora `hours`)
- `200` → Course con `course_type`, `course_level`

### GET /courseTypes
- `200` → array de CourseType

### GET /courseLevel
- `200` → array de CourseLevel

### GET /course/:id
- Params: `id`
- `200` → Course con `course_type`, `course_level`

### GET /coursesStudents
- Query: `course_type_id`, `status`, `course_group_id`, `course_id`, `student_id` (opcionales),
  `pageSize` (default 10), `currentPage` (default 1)
- `200` → `{ data: CourseStudent[], totalItems, currentPage, pageSize, totalPages }`
  Cada fila: claves de CourseStudent + `highest_score` (calculado) + alias
  `student` (con `user`), `course_group`, `course` (con `course_type`, `course_level`),
  `course_student_tests`, `course_student_assessment`, `schedules` (cada uno con `subject`
  e `instructor` con `user`)

### GET /courseStudent/:id
- Params: `id`
- `200` → CourseStudent con `student`, `course_group`, `course` (con `course_type`, `course_level`,
  `tests`), `course_student_tests`, `schedules` (solo subjects con nombre LIKE '%examen%', cada uno con `subject`)

### POST /courseStudent/:course_id
- Params: `course_id`; Body: ninguno (genera `code` `CP-########`)
- `200` → CourseStudent (sin includes)
- `404` texto plano `Curso no encontrado`; `400` `Input Validation Error <msg>`

### PUT /courseStudent/:course_id
- Params: `course_id` (ignorado); Body: `course_student_id` (requerido), `date`, `student_id`,
  `typeTrip`, `license`, `regulation`, `instructorCode`, `courseGroupId`
- `200` → CourseStudent (sin includes)
- `400` texto plano `course_student_id is required`

### PUT /courseStudent/:course_student_id/status
- Params: `course_student_id`; Body: `status` (boolean, default false)
- `200` → CourseStudent (sin includes)

### PUT /courseStudentMaxAttempts
- Body: `course_student_id` (requerido), `max_attempts` (requerido)
- `200` → CourseStudent (sin includes)
- `400` JSON `{ error: 'Parámetro course_student_id inválido' | 'Parámetro max_attempts inválido' | <msg> }`

### PUT /status
- Body: `user_id` (requerido), `status` (requerido)
- `200` → Instructor (sin includes)
- `400` texto plano `user_id and status are required`; `404` `Instructor not found for this user`

### GET /schedule/:id
- Params: `id` (course_student_id)
- `200` → array de Schedule (order date/hora) con `student` (con `user`), `instructor` (con `user`),
  `course_student`, `subject_day`, `subject`

### POST /schedule
- Body: `instructor_id`, `course_id`, `subject_days_id`, `student_id`, `subject_id`,
  `course_student_id`, `date`, `hour`, `classTime`
- `200` → Schedule (mismo shape que GET /schedule/:id)

### PUT /schedule
- Auth: **no**
- Body: `id` (requerido), `instructor_id`, `date`, `hour`, `classTime`
- `200` → Schedule (mismo shape que GET /schedule/:id)

---

## Course Groups — `/api/course_groups`

### GET /
- Query: `title`, `course_id`, `user_code`, `status` (opcionales), `pageSize` (default 10),
  `currentPage` (default 1)
- `200` → `{ data: CourseGroup[], totalItems, currentPage, pageSize, totalPages }`
  Cada fila con `course` (con `course_type`, `course_level`)

### GET /:id
- Params: `id`
- `200` → CourseGroup con `course` (con `course_students`) y `course_group_signatures`
- `404` texto plano `CourseGroup not found`

### POST /
- Body (Joi): `title` (requerido), `course_id` (requerido), `user_code`, `date`, `status`
- `201` → CourseGroup (shape de GET /:id)
- `400` `Input Validation Error <msg>`

### PUT /
- Body (Joi): `id` (requerido), `title`, `user_code`, `date`, `status`
- `200` → CourseGroup (sin includes)
- `404` texto plano `CourseGroup not found`; `400` `Input Validation Error <msg>`

### DELETE /:id
- Params: `id`
- `204` vacío; `404` texto plano `CourseGroup not found`

### GET /:id/students
- Params: `id`; Query: `pageSize`, `currentPage`
- `200` → `{ data: CourseStudent[], totalItems, currentPage, pageSize, totalPages }`
  Cada fila con `student` (con `user`) y `course`

### DELETE /:id/students
- Params: `id`; Query: `course_student_ids` (CSV, requerido)
- `200` → `{ message: '<n> student(s) removed from group', removed_count }`
- `400`/`404` JSON `{ error: <msg> }`

### GET /:id/signatures
- Params: `id`
- `200` → array de CourseGroupSignature (order day/signature)

### DELETE /:id/signatures/:signatureId
- Params: `signatureId`
- `200` → `{ success: true, message: 'Firma eliminada correctamente.' }`
- `404` JSON `{ success: false, error: 'Firma no encontrada.' }`

### POST /signature
- Body (Joi): `course_group_id` (requerido), `day_number` (int ≥1, requerido), `signature`
  (base64, requerido)
- `200` → `{ success: true, message: 'Firma guardada correctamente.', data: { signatureUrl, signature_number, record } }`
- `404`/`400` JSON `{ success: false, error: <msg> }`

### GET /report/attendance
- Query: `course_group_id`, `course_id` (opcionales), `pageSize`, `currentPage`
- `200` → `{ data: CourseGroup[], totalItems, currentPage, pageSize, totalPages }`
  Cada grupo con `course`, `course_group_signatures` y `course_students[]` (cada uno con `student`
  (con `user`), `course`, `schedules[]` (con `instructor`+`user`, `subject`, `subject_day`) y
  `attendances[]` (con `attendance_status`, `attendance_signature`))
- `500` JSON `{ error: 'Internal Server Error' }`

---

## Subjects — `/api/subjects`

### GET /
- `200` → array de Subject (sin includes)

### POST /
- Body (Joi): `name`, `hours` (requerido), `course_id` (requerido), `order`, `status`, `is_schedulable`
- `201` → Subject (sin includes)
- `400` `Input Validation Error <msg>`

### PUT /
- Body (Joi): `id` (requerido), `name`, `hours` (requerido), `course_id` (requerido), `order`,
  `status`, `is_schedulable`. Recalcula horas totales del curso.
- `201` → Subject (sin includes)
- `400` `Input Validation Error <msg>`

### GET /course/:id
- Params: `id`; Query: `status`, `is_schedulable` (opcionales, `"true"`/`"false"`)
- `200` → array de Subject (order ASC) con `subject_days`

### GET /lesson/course/:id
- Params: `id`
- `200` → array de Subject (order ASC) con `subject_days`, `subject_lessons` (cada uno con `subject_lesson_days`)

### GET /subject/:id
- Params: `id`
- `200` → Subject con `course`, `subject_lessons` (con `subject_lesson_days`), `subject_days`;
  `null` si no existe

### POST /lesson
- Body: `course_id`, `subject_id`, `name`, `order`, `status` (sin Joi; repo fija `hours: 1`)
- `201` → Subject (shape de GET /subject/:id)
- `400` `Input Validation Error <msg>`

### PUT /lesson
- Body: `id`, `subject_id`, `name`, `order`, `status`
- `201` → Subject (shape de GET /subject/:id)
- `400` `Input Validation Error <msg>`

### POST /subjects_days
- Body: `subject_id`, `course_id`, `day`, `status` (upsert de SubjectDays + recalcula horas)
- `201` → texto plano `OK`
- `400` `Input Validation Error <msg>`

### POST /subjects_lesson_days
- Body: `subject_id`, `subject_lesson_id`, `subject_lesson_days_id`, `course_id`, `day`,
  `status_lesson` (opcional; upsert de SubjectDays + SubjectLessonDays)
- `201` → texto plano `OK`
- `400` `Input Validation Error <msg>`

---

## Assessment — `/api/assessment`

> **Lección importante**: la asociación
> `CourseStudentAssessment.hasMany(CourseStudentAssessmentDay)` DEBE usar
> `as: 'CourseStudentAssessmentDays'`. Sin alias explícito, Sequelize devuelve la key
> `course_student_assessment_days` (snake_case) y el frontend/controlador que lee
> `CourseStudentAssessmentDays` recibe `[]`/`undefined`. Cualquier include de este dominio debe
> documentarse aquí con su alias exacto.

### GET /fetchAssessmentData
- Query: `CSA_id` (requerido)
- `200` → `{ CSA, CASD }`
  - `CSA` = CourseStudentAssessment (con `course`+`course_level`+`course_type`,
    `student`+`user`+`user_doc_type`, `course_student`) más:
    - `CourseStudentAssessmentDays`: array de CourseStudentAssessmentDay, cada uno con
      `score_average` (número redondeado a 1 decimal o `null`)
    - `course_score_average`: promedio global del CSA (o `null`)
  - `CASD` = array de Subject (status=true, is_schedulable=false) con `subject_days` y
    `subject_lessons` → `subject_lesson_days` → `course_student_assessment_lesson_days`
    (los lesson details filtrados por `course_student_assessment_id = CSA_id`)

### GET /courseStudentAssessment/:id
- Params: `id` (CSA id)
- `200` → CourseStudentAssessment (mismo shape de `CSA` en fetchAssessmentData, sin
  `score_average`/`course_score_average`)

### GET /courseStudentAssessmentDay
- Query: `CSA_id`, `day`, `course_id`, `student_id`, `course_student_id`, `takeoff_day`,
  `takeoff_night`, `landing_day`, `landing_night`, `training_time`, `check_time`, `type`
  (`training_time`/`check_time`: números decimales en horas)
- `200` → CourseStudentAssessmentDay (si no existe el día, lo crea y lo devuelve)

### POST /createCourseStudentAssessment
- Body: `course_id` (requerido), `student_id` (requerido), `course_student_id` (requerido)
  (genera `code` `CSA-########`, `date` = hoy)
- `201` → CourseStudentAssessment (shape de GET /courseStudentAssessment/:id)

### POST /courseStudentAssessmentApprove
- Body: `course_student_assessment_id` (requerido), `approve` (requerido)
- `200` → CourseStudentAssessment (sin includes)

### PUT /updateCourseStudentAssessmentDay
- Body: `id` (requerido), `airport`, `airstrip`, `elevation`, `meteorology`, `temperature`, `qnh`,
  `wind`, `weight`, `flaps`, `power`, `seat`, `takeoff`, `landing`, `comments`, `takeoff_day`,
  `takeoff_night`, `landing_day`, `landing_night`, `training_time`, `check_time`, `type`
  (`training_time`/`check_time`: números decimales en horas)
- `200` → CourseStudentAssessmentDay

### GET /fetchSubjectAssessment
- Query: `day`, `course_id`, `course_student_assessment_day_id`
- `200` → array de Subject (status=true, is_schedulable=false) con `subject_days` (filter por `day`)
  y `subject_lessons` → `subject_lesson_days` (filter por `day`) →
  `course_student_assessment_lesson_days` (filter por `course_student_assessment_day_id`)

### PUT /changeCourseStudentAssessmentLessonDay
- Body: `id` (opcional; si llega actualiza, si no crea), `course_id`, `student_id`,
  `course_student_id`, `course_student_assessment_id`, `course_student_assessment_day_id`,
  `subject_id`, `subject_lesson_id`, `subject_days_id`, `subject_lesson_days_id`, `item`, `score`,
  `score_2`, `score_3`, `day`
- `200` → Subject (shape de `fetchSubjectAssessment` para ese subject/día)

### POST /saveSignatures
- Body: `CSAD_id` (requerido), `signature1`, `signature2`, `signature3` (base64, al menos una)
- `200` → `{ success: true, message: 'Firmas procesadas correctamente.', data: { studentSignatureUrl?, instructorSignatureUrl?, fcaaSignatureUrl? } }`
- `400` JSON `{ success: false, error: 'No se proporcionaron firmas para guardar.' }`

### DELETE /signature
- Query: `CSAD_id` (requerido), `type` (1|2|3, requerido)
- `200` → `{ success: true, message: 'Firma eliminada correctamente.' }`
- `400` JSON `{ success: false, error: 'CSAD_id y type son requeridos.' | 'type debe ser 1, 2 o 3.' }`

---

## Test — `/api/test`

### GET /
- `200` → array de Test (sin includes)

### GET /tests/:course_id
- Params: `course_id`
- `200` → array de Test con `test_question_types` (cada uno con `question_type`)

### GET /test/:test_id
- Params: `test_id`
- `200` → Test con `test_question_types` (cada uno con `question_type`)

### POST /test
- Body: `course_id` (debe existir), `duration`, `min_score` (genera `code` `E-XXXX`, `status: false`)
- `201` → Test con `test_question_types` (cada uno con `question_type`)

### PUT /test
- Body: `id`, `duration`, `min_score`, `status`
- `201` → Test con `test_question_types`

### GET /questions/by-test/:test_id
- Params: `test_id`; Query: `question_type_id`, `test_question_type_id`, `course_id`, `status`
- `200` → array de Question con `answers` y `question_type`
- `400` JSON `{ error: 'Parámetro test_id inválido' }`

### GET /questionTypes
- `200` → array de QuestionType

### PUT /questionTypes
- Body: `id`, `value`
- `201` → QuestionType (sin includes)

### GET /answers/:id
- Params: `id` (question id)
- `200` → array de Answer (filter por `question_id`)

### POST /questionTest
- Body: `course_id`, `test_id`, `question_type_id`, `test_question_type_id`, `header`
- `201` → Question con `answers` y `question_type`

### PUT /questionTest
- Body: `id`, `header`, `status`
- `201` → Question con `answers` y `question_type`

### POST /answerQuestionTest
- Body: `course_id`, `test_id`, `question_type_id`, `question_id`, `value`
- `201` → Question (getQuestionById del `question_id`)

### PUT /answerQuestionTest/:question_id
- Params: `question_id`; Body: `id`, `value`, `is_correct`, `status`
- `201` → Question (getQuestionById del `question_id`)

### PUT /testQuestionTypes
- Body: `id` (si > 0 actualiza, si no crea), `course_id`, `amount`, `value`, `question_type_id`,
  `status`, `test_id`
- `201` → Test (getTestById) con `test_question_types`

### GET /student/:student_id
- Params: `student_id`; Query: `course_student_id` (opcional)
- `200` → array de CourseStudentTest (order created DESC) con `test` y `course_student` (con `course`)
- `400` JSON `{ error: 'Parámetro student_id inválido' }`

### GET /courseStudentTest/:id
- Auth: **no**
- Params: `id` (course_student_test id)
- `200` → CourseStudentTest con `course_student_test_questions` (cada uno con `question` (con
  `question_type`, `answers`) y `course_student_test_answer`)
- `400` texto plano `Error <msg>`

### POST /courseStudentTest/:course_student_id
- Params: `course_student_id`; Body: `date`
- `200` → CourseStudentTest (shape de GET /courseStudentTest/:id; genera `code` `CST-XXXXXXXX` y
  las preguntas aleatorias)
- `400` texto plano `Error <msg>`

### POST /courseStudentTestAnswer
- Body: `courseStudentTestAnswer` (objeto) con `course_student_test_id`,
  `course_student_test_question_id`, `course_student_id`, `question_id`, `student_id`, `resp`,
  `test_id`, `course_id`
- `200` → CourseStudentTestAnswer (creado o actualizado)
- `400` texto plano `Error <msg>`

### POST /courseStudentTestEnd
- Body: `course_student_test_id`
- `200` → `{ answers: [...], score }` (cada answer con `question` —con `answers` restringidas a
  `is_correct=true`, `question_type`, `test_question_type`—)
- `400` texto plano `Error <msg>`

### PUT /updateCourseStudentTestScore
- Body: `course_student_test_id`, `course_student_test_answer_id`, `score`
- `200` → CourseStudentTest (shape de GET /courseStudentTest/:id)
- `400` texto plano `Error <msg>`

### POST /import-excel/:test_id
- Params: `test_id`; File: `excel_file` (xlsx/xls, máx 10MB)
- Columnas esperadas: `course_id, question_type_id, test_question_type_id, header,
  answer_1..answer_5, answer_1_correct..answer_5_correct`
- `201` → `{ message: 'Excel import completed', questionsImported, answersImported }`
- `400` texto plano `No file uploaded`

### POST /import-csv
- Auth: **no**
- Query: `test_id` (requerido); File: `csv_file`
- `201` → `{ message: 'CSV import completed', questionsImported, answersImported }`
- `400` texto plano `No file uploaded`

---

## Attendance — `/api/attendance`

### GET /
- Query: `course_student_id`, `day`, `attendance_status_id`, `date_from`, `date_to` (opcionales),
  `pageSize` (default 10), `currentPage` (default 1)
- `200` → `{ data: Attendance[], totalItems, currentPage, pageSize, totalPages }`
  Cada fila con `course_student`, `attendance_status`, `attendance_signature`

### GET /:id
- Params: `id`
- `200` → Attendance con `course_student`, `attendance_status`, `attendance_signature`
- `404` texto plano `Attendance not found`

### GET /by-course-student
- Query: `course_student_id` (requerido)
- `200` → array de Attendance con `attendance_status`, `attendance_signature`
- `400` texto plano `course_student_id is required`

### GET /by-date-range
- Query: `start_date` (requerido), `end_date` (requerido)
- `200` → array de Attendance con `course_student`, `attendance_status`, `attendance_signature`
- `400` texto plano `start_date and end_date are required`

### POST /
- Body (Joi): `course_student_id` (req), `day` (int ≥1, req), `date` (req), `attendance_status_id`
  (req), `comments`
- `201` → Attendance con includes
- `400` texto plano `Input Validation Error <msg>` | `day (X) excede los días del curso (Y).`

### PUT /
- Body: `id` (req), `course_student_id`, `day`, `date`, `attendance_status_id`, `comments`
- `200` → Attendance con includes
- `404` texto plano `Attendance not found`

### DELETE /:id
- Params: `id`
- `204` vacío; `404` texto plano `Attendance not found`

### GET /statuses  |  GET /statuses/:id
- `200` → array de AttendanceStatus (order name ASC; el param `:id` se ignora)

### POST /statuses
- Body (Joi): `name` (req), `description`
- `201` → AttendanceStatus (sin includes)

### PUT /statuses/:id
- Params: `id`; Body: `name`, `description`
- `200` → AttendanceStatus (sin includes)
- `404` texto plano `Attendance Status not found`

### DELETE /statuses/:id
- Params: `id`
- `204` vacío; `404` texto plano `Attendance Status not found`

### POST /signature
- Body: `attendance_id` (req), `signature` (base64, req)
- `200` → `{ success: true, message: 'Firma guardada correctamente.', data: { signatureUrl, record } }`
- `400` JSON `{ success: false, error: 'No se proporcionó la firma para guardar.' | 'El attendance_id es requerido.' }`

### DELETE /:id/signature
- Params: `id` (attendance_id)
- `200` → `{ success: true, message: 'Firma eliminada correctamente.' }`
- `404` JSON `{ success: false, error: 'Firma no encontrada.' }`

---

## Suggestions — `/api/suggestions`

### GET /
- `200` → array de UserSuggestion (order created DESC) con alias `user` (`{ id, name, last_name, email }`)

### GET /:id
- `200` → UserSuggestion con `user`
- `404` texto plano `Suggestion not found`

### GET /user/:user_id
- Params: `user_id`
- `200` → array de UserSuggestion con `user`

### POST /
- Body (Joi): `user_id` (req), `title` (req, máx 500), `description` (req)
- `201` → UserSuggestion (sin `user`)

### PUT /
- Body: `id` (req), `user_id` (req), `title` (req), `description` (req)
- `200` → UserSuggestion (sin `user`)
- `404` texto plano `Suggestion not found`

### DELETE /:id
- Params: `id`
- `204` vacío; `404` texto plano `Suggestion not found`

---

## Email History — `/api/email_history`

### GET /
- Query: `user_id` (opcional)
- `200` → array de EmailHistory (order fecha DESC) con alias `user` (`{ id, name, last_name, email }`)

### POST /
- Body (Joi): `email` (req, máx 255), `user_id` (req), `nombre_archivo` (req, máx 500), `fecha`
  (req), `tipo` (default 'correo'), `descripcion`, `modulo`
- `201` → EmailHistory (sin `user`)

### DELETE /:id
- Params: `id`
- `204` vacío; `404` texto plano `Email history not found`

---

## Mail — `/api/mail`

### POST /send
- Auth: no
- Form: `to`, `subject`, `body`; File opcional: `adjunto`
- `200` → `{ ok: true, messageId }`
- `500` → `{ ok: false, error }`

---

## Lookups públicos — `/api/module` · `/api/group` · `/api/permission` · `/api/rating` · `/api/config` · `/status`

### GET /api/module
- Auth: no → `200` array de Module

### GET /api/group
- Auth: no → `200` array de Group

### GET /api/permission
- Auth: no → `200` array de Permission

### GET /api/rating
- Auth: no → `200` array de Rating

### GET /api/config
- Auth: no → `200` `{ message: string[] }` (ejecuta seeds + triggers; con efectos secundarios en DB)

### GET /status
- Auth: no → `200` `{ status: 'Server is running', timestamp, dbConnected }`

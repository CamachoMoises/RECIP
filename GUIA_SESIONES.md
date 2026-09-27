# Guía de integración: courses por días → courses por sesiones

Documento de handoff para el equipo de `recip_frontend`. El contrato exacto de cada endpoint
está en `C:\RECIP\recip_backend\CONTRACTS.md` (sección **"Días vs. Sesiones"**); este archivo
**no repite el contrato**, solo describe qué tiene que cambiar el frontend para soportarlo.

- Estado del backend: código listo, **migraciones aún no ejecutadas** (el owner las corre).
- Estado del frontend: **cero soporte** a la fecha. `uses_sessions` y `sessions` no aparecen
  en ningún archivo de `src/`.
- Riesgo si se despliega el backend sin tocar el frontend: **ninguno para los cursos
  existentes** (todos nacen con `uses_sessions = false`). El riesgo arranca recién cuando
  alguien cree un curso con `uses_sessions = true`.

---

## 1. Qué llega nuevo por la API

Solo dos campos en el modelo `course`, en **todos** los endpoints que devuelven un curso
(`GET /api/courses`, `GET /api/courses/course/:id`, `GET /api/courses/coursesStudents` → alias
`course`, `GET /api/course_groups` → alias `course`, `GET /api/courses/courseStudent/:id` → `course`):

| Campo | Tipo JS | Significado |
|---|---|---|
| `uses_sessions` | `boolean` (`true`/`false`, **no** `0`/`1`) | `false` = legacy (1 día por sesión de calendario). `true` = N sesiones pueden compartir fecha. |
| `sessions` | `number` | Tamaño del programa **cuando `uses_sessions = true`**. Viene backfilled con `days` en los 22 cursos existentes, y se autoguarda como `days` si el POST no lo manda. |

Verificado contra la DB de dev: `uses_sessions` se serializa como booleano real
(`typeof === 'boolean'`), no como número.

En `POST /api/courses` y `PUT /api/courses` ambos son opcionales. Si mandás `sessions` sin
`uses_sessions`, el curso queda en modo legacy y `sessions` se ignora como techo.

> **Trampa de tipos**: en TypeScript declaralos como `boolean` y `number`, no `0|1` ni `string`.
> El `convertTypes` del backend convierte `"true"`/`"false"` en el body de los PUT, así que
> mandá booleanos reales desde el form.

---

## 2. El helper central (esto es lo de mayor leverage)

Hay **12 lugares** que leen `course.days` como si fuera el tamaño del programa. Todos tienen que
pasar por un helper, o el modo sesiones se rompe en 12 puntos distintos.

Crear `src/utils/programSize.ts`:

```ts
type ProgramCourse = {
	uses_sessions?: boolean;
	days?: number;
	sessions?: number;
};

export const usesSessions = (course?: ProgramCourse | null): boolean =>
	Boolean(course?.uses_sessions);

/** Tope del programa: sesiones si el curso está en modo sesiones, días si no. */
export const programSize = (course?: ProgramCourse | null): number => {
	if (!course) return 0;
	return usesSessions(course) ? (course.sessions ?? course.days ?? 0) : (course.days ?? 0);
};

/** Etiqueta del ordinal: "Sesión 3" o "Día 3". */
export const ordinalLabel = (course: ProgramCourse | null, n: number): string =>
	`${usesSessions(course) ? 'Sesión' : 'Día'} ${n}`;

/** Nombre del campo que hay que mandar al backend para el ordinal. */
export const ordinalField = (course: ProgramCourse | null): 'session_number' | 'day' =>
	usesSessions(course) ? 'session_number' : 'day';

/**
 * Opciones del ordinal para los tabs/checkboxes.
 * `id` en 0-based a propósito, para no romper los `day: day.id + 1` ya escritos.
 */
export const programOrdinals = (course: ProgramCourse | null) =>
	Array.from({ length: programSize(course) }, (_, i) => ({
		id: i,
		name: ordinalLabel(course, i + 1),
	}));
```

Sobre el `id` 0-based: el frontend actual construye las opciones como
`Array.from({length: course.days}, (_, i) => ({ id: i, name: \`Día ${i+1}\` }))` y después
envía `day: day.id + 1` en 4 sitios. **Dejalo 0-based** y no tocás esos `+ 1`. Si preferís
1-based, tenés que borrar los `+ 1` de `courseDetail.tsx:130`, `modalFormSubject.tsx:81`,
`newAssessment.tsx:298` y `detailAssessment.tsx:632` — es donde se cuelan los off-by-one.

---

## 3. Cambios por área

### 3.1 Tipos — `src/types/utilities.d.ts`

| Línea | Tipo | Cambio |
|---|---|---|
| 194-210 | `course` | agregar `uses_sessions?: boolean;` y `sessions?: number;` |
| 212-229 | `schedule` | sin cambios de tipo, pero ver 3.4: el ordinal se lee de `subject_day.day` |
| 658-672 | `attendance` | `day` es el ordinal (día **o** sesión). No existe `session_number` en la respuesta |
| 674-685 | `courseGroupReportCourse` | agregar `uses_sessions?` y `sessions?` (lo usa el reporte de asistencia de grupos) |
| 709-716 | `courseGroupReportAttendance` | `day` es el ordinal |

**No agregues `session_number` a ningún tipo de respuesta.** El backend no lo devuelve nunca:
es alias de **entrada** solamente. En las respuestas el ordinal siempre se llama `day` /
`day_number`.

### 3.2 Formulario de curso — `src/pages/dashboard/config/modalFormCourse.tsx`

- **49-65**: `course_days` es una lista hardcodeada de 1 a 15. Es el techo real del programa del
  lado cliente, y no existe equivalente para sesiones. Reemplazar por un `<Input type="number">`
  con validación, o por un input numérico libre para `days` y otro para `sessions`.
- Agregar un toggle **"Programa por sesiones"** que setee `uses_sessions`. Default `false`.
- Cuando `uses_sessions` esté activo, mostrar el input `sessions` y **ocultar** el de `days`
  (o dejarlo readonly), porque en ese modo el campo que importa es `sessions`.
- **109**: el payload `req: course` solo manda `days: parseInt(data.days)`. Agregar
  `uses_sessions` y `sessions` acá. Sin esto, el toggle no llega al backend.
- **282 / 306**: el `<Input label="Días">` y su mensaje de validación.

`createCourse` (`src/features/courseSlice.ts:174`) y `updateCourse` (`:240`) pasan el objeto
entero, así que no hay que tocar los thunks.

### 3.3 Asignación de materias — `courseDetail.tsx` y `modalFormSubject.tsx`

- `courseDetail.tsx:159-162` → `Array.from({ length: selectedCourse.days }, ...)`:
  reemplazar por `programOrdinals(selectedCourse)`.
- `courseDetail.tsx:127-141` → `POST api/subjects/subjects_days` con `day: day.id + 1`: no
  cambia, **el endpoint sigue llamándose `day`**. El backend valida contra `course.sessions`
  cuando `uses_sessions = true`.
- `modalFormSubject.tsx:40, 48-51, 78-93`: el prop `days` viene de `courseDetail.tsx:527`.
  Renombrarlo a `ordinals` propagando el cambio; el body `day: day.id + 1` no cambia.

> El bound check del backend (`day <= course.sessions`) es **nuevo** en estos dos endpoints.
> Con `uses_sessions = false` no hay validación de techo, como antes. Si el frontend dejaba
> pasar días mayores a `days` en modo legacy, eso sigue igual; en modo sesiones el backend
> ahora lo rechaza con `400 day (X) excede las sesiones del curso (Y).` y la UI tiene que
> manejar ese toast.

### 3.4 Creación de schedule — `newCourseStudentScheduleSubject.tsx` ⚠️

Este es el **segundo punto más delicado**, junto con asistencia.

```ts
// 54-60
let initialDate = schedule?.date || course_student?.date;
if (initialDate && !schedule?.day && SD?.day) {
	initialDate = moment(initialDate, 'YYYY-MM-DD').add(SD.day - 1, 'days').format('YYYY-MM-DD');
}
```

Esta línea **traduce ordinal → fecha calendario asumiendo 1 día por sesión**. Con
`uses_sessions = true` es incorrecta: la sesión 3 y la 4 caen en la misma fecha, y un curso de
12 sesiones en 5 días quedan con todas las fechas amontonadas.

- En `uses_sessions = false`: **dejar exactamente como está**.
- En `uses_sessions = true`: la fecha debe ser un input del usuario (o un contador de
  sesiones por fecha ya agendadas), no un offset desde `course_student.date`.

`FormInputs` (24-29) no tiene campo de sesión. El body de `POST /api/courses/schedule`
**tampoco lo necesita**: el ordinal del schedule se deduce en el backend de
`subject_days_id → subject_day.day` (documentado en `CONTRACTS.md`). O sea que para el schedule
no hay que mandar nada nuevo — lo que hay que arreglar es **cómo se calcula la fecha**.

Ojo con `src/features/courseSlice.ts:282-284` (`setDay`) y `state.day` inicial `1` (`:8`):
el wizard lleva el día seleccionado en Redux, y en modo sesiones ese valor pasa a ser número de
sesión. Funciona, pero el label del tab (`newCourseStudentSchedule.tsx:734`,
`value={\`Día ${course.day}\`}`) tiene que pasar por `ordinalLabel`.

### 3.5 Asistencia — `viewCourseStudentSchedule.tsx` 🔴

**Acá hay corrupción de datos, no solo una limitación de UI.** Con `uses_sessions = true`, si
dejás el código como está, cada guardado pisa el anterior.

Los tres sitios que hay que cambiar, en este orden:

**a) `283-289` — la búsqueda es solo por fecha, `first match wins`:**
```ts
const getAttendanceForDate = (date: string) => {
	const dateStr = moment(date).format('YYYY-MM-DD');
	return attendance.attendanceList?.find(
		(a) => moment(a.date).format('YYYY-MM-DD') === dateStr,
	);
};
```
Con 3 sesiones el mismo día, esto devuelve siempre la sesión 1. Y como `handleSaveAttendance`
la usa para decidir entre `updateAttendance` y `createAttendance` (327, 330-352), **guardar la
sesión 3 actualiza la fila de la sesión 1**. Pisarás datos reales.

Arreglo: agregar el ordinal al predicado.
```ts
const getAttendanceForSession = (date: string, session?: number) => {
	const dateStr = moment(date).format('YYYY-MM-DD');
	return attendance.attendanceList?.find(
		(a) => moment(a.date).format('YYYY-MM-DD') === dateStr && a.day === session,
	);
};
```

**b) `316-369` — `handleSaveAttendance(scheduleDate, day)`**: ya recibe el ordinal como
parámetro, así que solo hay que cambiar el nombre del campo que se manda. El backend acepta
ambos y le da prioridad a `session_number`:
```ts
const field = ordinalField(course.courseSelected);   // 'session_number' | 'day'
createAttendance({ course_student_id, [field]: day, date: scheduleDate, ... });
```
Tipar el payload en `src/features/attendanceSlice.ts:84-106` para que acepte las dos formas.

**c) `439-447` y `997-1012` — el agrupamiento colapsa sesiones:**

```ts
// 439-447: agrupa solo por fecha
const dateKey = moment(schedule.date).format('YYYY-MM-DD');
```
Con N sesiones en una fecha quedan en el mismo `acc[dateKey]`, y el render (998-1000) toma
`schedules[0]`. Peor: el `key` de React de la `<Card>` (1012) es `dateKey` — **con dos sesiones
en la misma fecha React renderiza una card y la segunda se pierde**, más el warning de keys
duplicadas.

Arreglo: agrupar y keyear por `(fecha, ordinal)`.
```ts
const sessionKey = (s: typeof course.scheduleList[number]) =>
	`${moment(s.date).format('YYYY-MM-DD')}#${getDayForSchedule(s) ?? 0}`;
```
y usar `sessionKey(schedule)` en vez de `dateKey` tanto en el `reduce` como en el `<Card key=`.
Después, reemplazar `firstSchedule` por el schedule de cada iteración (1000, 1043-1058,
1092-1098) y `getAttendanceForDate(firstSchedule.date)` por
`getAttendanceForSession(schedule.date, getDayForSchedule(schedule))`.

`getDayForSchedule` (272-281) ya devuelve el ordinal correcto en ambos modos (lee
`subject_day.day`), así que **no hay que tocarlo**.

**d) `1192-1198`** — el botón de guardar está dentro del `.map` por fecha pero llama con
`firstSchedule`. Al cambiar el agrupado queda naturalmente por sesión; solo hay que pasarle
el schedule de la iteración.

> El backend ahora ordena `GET /api/attendance` y `by-course-student` por `date DESC, day ASC`
> justamente para que el listado venga en orden de sesión. Aprovechalo y **no re-ordenes por
> fecha en el cliente**.

**e) Filtro por sesión**: `src/features/attendanceSlice.ts:19-45` (`fetchAttendances`) no tiene
`session_number`. `GET /api/attendance` ya lo acepta como query param. Agregalo si necesitás
filtrar la lista por sesión; no es obligatorio para el flujo de guardado.

### 3.6 Firmas de grupo — `courseGroupsSection.tsx` + `courseGroupSlice.ts`

- `courseGroupSlice.ts:124-137`: `saveCourseGroupSignature` manda `day_number` fijo. El backend
  acepta `day_number` **o** `session_number` (mapeado a `day_number`), así que tenés dos
  opciones: mandar siempre `day_number` y no tocar nada, o mandar `session_number` en modo
  sesiones para que sea explícito. **Recomendación: usar `ordinalField()` y mandar el campo
  que corresponda** — es más legible y evita depender de la precedencia del backend.
- `courseGroupsSection.tsx:231-243`: `day_number: selectedDay` (el tab activo). Correcto en
  ambos modos siempre que el tab represente la sesión.
- `courseGroupsSection.tsx:735-758` y `AttendanceListPDF.tsx:271-276`: filtran
  `s.day_number === day` y `s.day_number === dayNumber`. Funciona igual en ambos modos, pero
  el texto tiene que cambiar.
- Labels: `courseGroupsSection.tsx:212, 745` y `AttendanceListPDF.tsx:359` (`Firmas del
  instructor por día`, `Día {day}`) → `ordinalLabel(...)`.

### 3.7 Assessment — `src/pages/dashboard/assessment/`

El assessment **no tiene modelo sessions propio**: reutiliza el ordinal `day` de
`CourseStudentAssessmentDay`. Lo que hay que cambiar es el **techo** y los **labels**.

- `newAssessment.tsx:63-64` y `detailAssessment.tsx:145-150`:
  `Array.from({ length: course.courseSelected.days }, ...)` → `programOrdinals(...)`.
- `detailAssessment.tsx:188, 197`: `day: activeStep + 1` — funciona con `sessions > days`
  una vez que los tabs llegan hasta `sessions`. Sin el cambio anterior, el wizard no alcanza
  las sesiones extra.
- `detailAssessment.tsx:112-117` y `CSAssessmentPDFDocument.tsx:171-185`:
  `getEvaluationDate` **salta fines de semana** para calcular la fecha calendario de un ordinal.
  Es una suposición de 1 día por sesión. En modo sesiones hay que mostrar la fecha **real del
  schedule** en vez de estimarla, o la evaluación queda desalineada.
- `CSAssessmentPDFDocument.tsx:250-271` es el punto más roto:
  ```ts
  const dayNum = s.subject_day?.day ?? subjectDaysById[Number(s.subject_days_id)];
  if (!dayNum || scheduleDayDate[dayNum]) return;   // ← descarta las sesiones extra
  scheduleDayDate[dayNum] = s.date;
  ```
  `scheduleDayDate` es un `Record<ordinal, date>` con **una sola fecha por ordinal** y descarta
  el resto con ese `return`. Con N sesiones por fecha, el PDF imprime una sola de ellas.
  Hay que pasar a `Record<ordinal, date[]>` y decidir cómo se muestran las múltiples fechas.
- `CSAssessmentPDFDocument.tsx:279-287` (`getInstructorInitials`) tiene el mismo patrón
  "uno por ordinal".
- `lessonDetails.tsx:88-89`: `SL.subject_days[0].id` — siempre el primer subject day de la
  lección. A revisar si una lección cubre varias sesiones.
- Labels: `lessonDetails.tsx:83` (`Día {day}`), `detailAssessment.tsx:695`,
  `modalFormSubject.tsx:401` (`Días impartidos`).

### 3.8 Instructor — `src/pages/dashboard/instructorCourses/`

- `tabs/InstructorScheduleTab.tsx:77-88` agrupa por `item.subject_day.day` (el ordinal), **no
  por fecha** — o sea que ya es session-safe. Solo falta el label (`135`: `Día {day}`) y mostrar
  la fecha junto al número de sesión, porque ahora el ordinal no identifica una fecha.
- `tabs/InstructorAttendanceTab.tsx:19-43` y `:228`: el `AttendanceItem` local ya trae `day` y
  `date`, y el render muestra `Día {a.day}` al lado de la fecha. Agregar el número de sesión
  explícito y no filtrar por fecha en ningún lado (no hay filtrado por fecha, así que está bien).
- `myInstructorCourseDetail.tsx:192, 201`: `Horas / Días` → `{courseSelected.days}d`. Pasar a
  `programSize()` y cambiar el sufijo a `s` cuando sean sesiones.

### 3.9 Test — ventana de 2 horas

`newTest.tsx:485-501` y `components/TestListItem.tsx:66-93` calculan la ventana de examen desde
`course.courseStudent.schedules[0]` / `schedules[0]` con un `horas > 2` hardcodeado. Con varias
sesiones por fecha, la ventana se ancla a la **primera** sesión del día y no a la sesión que
el alumno está por tomar. Hay que resolver el schedule por el ordinal/fecha que se está
evaluando, no `schedules[0]`.

---

## 4. Orden de ejecución sugerido

1. **Helper + tipos** (`3.1`, `3.2`) — desbloquea todo lo demás y no cambia comportamiento.
2. **`ordinalLabel` en los labels** — bajo riesgo, se ve al toque.
3. **Asistencia (3.5)** — es el que corrompe datos. Prioridad máxima una vez que el modo
   sesiones esté activo.
4. **Firmas de grupo (3.6)** — mecánico, el backend ya acepta ambos nombres.
5. **Asignación de materias (3.3)** — requerido para poder asignar subjects a las sesiones
   `days+1 … sessions`. Sin esto, un curso de 12 sesiones solo puede tener subjects en las
   primeras `days`.
6. **Schedule / fecha (3.4)** — el más delicado de razonar, porque cambia una regla de cálculo
   de fechas. Hacerlo con casos de prueba: 2 sesiones mismo día, 3 sesiones mismo día, y un
   curso donde `sessions > días de calendario`.
7. **Assessment (3.7)**, **instructor (3.8)**, **test (3.9)**.

Antes de arrancar el paso 3, crear un curso de prueba con `uses_sessions = true` y verificar
que el backend acepta 2 asistencias el mismo `date` con `day` distinto. Si eso no funciona,
el problema es de migración, no del frontend.

---

## 5. Lo que NO hay que cambiar

- **No hay columna `session_number` en la base.** El ordinal vive en `day` / `day_number`.
  `session_number` es solo alias de entrada.
- **Las respuestas no cambiaron.** Ninguna clave nueva, ningún campo renombrado. `day` sigue
  siendo `day`. Los cursos con `uses_sessions = false` se comportan byte a byte igual.
- **Los bodies de `POST /api/courses/schedule`, `subjects_days` y `subjects_lesson_days`
  no cambiaron.** Sigue mandándose `day` (o `subject_days_id` en el schedule). El backend
  traduce solo.
- **No mandes `sessions_number` en respuestas ni lo busques en ellas.**
- `course.sessions` viene siempre poblado (backfill + default en create/update). No hace falta
  defensivo por `null`, pero el helper igual lo contempla.

---

## 6. Verificación

- `npm run lint`
- `npm run build` — es el único typecheck del proyecto (`tsc -b && vite build`). No hay script
  `typecheck` standalone.
- Casos manuales, en un curso con `uses_sessions = true`:
  1. 2 sesiones la misma fecha → 2 cards separadas, 2 asistencias, guardar una **no** pisa la otra.
  2. `sessions` > cantidad de fechas usadas → las sesiones extra son alcanzables y asignables.
  3. Cambiar un curso de `uses_sessions: true` a `false` y verificar que la UI vuelve a la
     agrupación por fecha sin romper los datos ya cargados.

---

## 7. Nota aparte

`C:\RECIP\recip_frontend\CONTRACTS.md` está desactualizado respecto de estos 6 endpoints
(`POST /api/courses`, `PUT /api/courses`, `POST /api/courses/schedule`, `POST /api/attendance`,
`PUT /api/attendance`, `POST /api/subjects/subjects_days`,
`POST /api/subjects/subjects_lesson_days`, `POST /api/course_groups/signature`). La fuente de
verdad es el `CONTRACTS.md` del backend; conviene sincronizar el del frontend o decidir
conscientemente que el de atrás es el único que se mantiene.

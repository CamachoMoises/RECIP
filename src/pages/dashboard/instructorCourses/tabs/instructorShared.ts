import { course, subject } from '../../../../types/utilities';
import {
	isWithinProgram,
	type ProgramCourse,
} from '../../../../utils/programSize';

/**
 * Fila de `GET /api/instructor/schedule/:instructor_id`. El endpoint devuelve el
 * cronograma completo del instructor (todos sus cursos), así que el curso de
 * cada fila hay que deducirlo: `course_student.course_id` es la fuente directa y
 * `subject_day.course_id` / `subject.course_id` el respaldo cuando la fila no
 * trae el `course_student` anidado.
 */
export type InstructorScheduleItem = {
	id: number;
	date: string;
	hour?: string;
	classTime?: number;
	course_student_id?: number;
	subject_id?: number;
	subject_days_id?: number;
	subject?: {
		id?: number;
		name: string;
		status?: boolean;
		course_id?: number;
	};
	subject_day?: {
		id?: number;
		day: number;
		status?: boolean;
		course_id?: number;
	};
	course_student?: {
		id: number;
		course_id?: number;
		code?: string;
		student?: {
			id: number;
			user?: {
				name: string;
				last_name: string;
			};
		};
	};
	student?: {
		id: number;
		user?: {
			name: string;
			last_name: string;
		};
	};
};

export type InstructorRosterStudent = {
	id: number;
	code: string;
	name: string;
};

export type InstructorSession = {
	key: string;
	courseId: number;
	date: string;
	day: number;
	hours: string[];
	subjectNames: string[];
};

/**
 * `api/attendance` incluye `course_student` sin `student` ni `course` anidados,
 * así que el nombre del alumno y su código se resuelven contra el roster local.
 */
export type InstructorAttendanceItem = {
	id: number;
	course_student_id?: number;
	day?: number;
	date: string;
	comments?: string;
	attendance_status_id?: number;
	attendance_status?: {
		id: number;
		name: string;
	};
	course_student?: {
		id: number;
		code: string;
		course_id?: number;
	};
};

/** Algunas respuestas traen el `course_student_id` plano y otras solo anidado. */
export const courseStudentIdOfAttendance = (
	item: InstructorAttendanceItem,
): number | undefined => item.course_student_id ?? item.course_student?.id;

/**
 * El endpoint de grupos ignora `course_id` cuando viene `instructor_id` (el
 * repository pisa el filtro con la lista de cursos del instructor), así que el
 * recorte por curso se hace siempre en cliente.
 */
export const GROUPS_PAGE_SIZE = 500;

/** El ordinal del horario vive en `subject_day.day`. */
export const courseIdOfSchedule = (
	item: InstructorScheduleItem,
): number | null =>
	item.course_student?.course_id ??
	item.subject_day?.course_id ??
	item.subject?.course_id ??
	null;

export const courseIdOfStudent = (
	item: InstructorScheduleItem,
): number | null =>
	courseIdOfSchedule(item) ?? item.course_student_id ?? null;

/**
 * `subject_days_id` es la llave que devuelve el cronograma; si el endpoint no
 * trae el `subject_day` se resuelve contra las materias del curso. Sin ordinal
 * no se puede marcar, y asumir el día 1 grabaría la sesión equivocada.
 */
export const getDayForSchedule = (
	item: InstructorScheduleItem,
	subjectList: subject[],
): number | undefined => {
	if (item.subject_day?.day) return item.subject_day.day;
	return subjectList
		.flatMap((s) => s.subject_days ?? [])
		.find((d) => d.id === item.subject_days_id)?.day;
};

/**
 * Un horario solo cuenta como sesión real si la materia y su día siguen
 * activos; `viewCourseStudentSchedule.tsx` exige `sd.status && subject.status`
 * y por eso esconde las Materias desactivadas.
 */
export const isActiveSchedule = (item: InstructorScheduleItem) =>
	item.subject_day?.status !== false && item.subject?.status !== false;

/**
 * Además del status hay que validar que el ordinal quepa en el programa del
 * curso (`days`, o `sessions` si es por sesiones): en la base hay filas con
 * `subject_days` desactivados y con días mayores que el tamaño del curso.
 */
export const hasRealSession = (
	item: InstructorScheduleItem,
	subjectList: subject[],
	program: ProgramCourse | null | undefined,
) => {
	if (!isActiveSchedule(item)) return false;
	const day = getDayForSchedule(item, subjectList);
	return day !== undefined && isWithinProgram(program, day);
};

/**
 * El roster sale del cronograma y no de los grupos: cada fila es un alumno de
 * ESE curso con su `course_student_id` real. Con los grupos se colaban alumnos
 * de otros cursos, porque el filtro por curso del endpoint de grupos se pisa
 * con el del instructor.
 */
export const buildRoster = (
	list: InstructorScheduleItem[],
): InstructorRosterStudent[] => {
	const byId = new Map<number, InstructorRosterStudent>();
	list.forEach((item) => {
		const id = item.course_student?.id ?? item.course_student_id;
		if (!id || byId.has(id)) return;
		const user = item.student?.user ?? item.course_student?.student?.user;
		byId.set(id, {
			id,
			code: item.course_student?.code ?? '',
			name: user ? `${user.name} ${user.last_name}` : 'Sin nombre',
		});
	});
	return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name));
};

/**
 * Varias sesiones pueden compartir fecha (y el mismo día/sesión se repite en
 * distintos cursos), así que la clave incluye el curso.
 */
export const sessionKey = (
	courseId: number,
	date: string,
	day: number,
) => `${courseId}#${date}#${day}`;

/**
 * El ordinal de la asistencia vive en `attendance.day` y varias asistencias
 * pueden compartir fecha, así que la clave del borrador es (alumno, fecha,
 * ordinal). El `course_student_id` ya es único por curso.
 */
export const draftKeyOf = (
	courseStudentId: number,
	date: string,
	day: number,
) => `${courseStudentId}#${date}#${day}`;

export const buildSessions = (
	list: InstructorScheduleItem[],
	subjectList: subject[],
): InstructorSession[] => {
	const byKey = new Map<string, InstructorSession>();
	list.forEach((item) => {
		const day = getDayForSchedule(item, subjectList);
		const courseId = courseIdOfStudent(item);
		if (!item.date || day === undefined || courseId === null) return;
		const key = sessionKey(courseId, item.date, day);
		const existing = byKey.get(key);
		if (existing) {
			if (item.hour && !existing.hours.includes(item.hour))
				existing.hours.push(item.hour);
			if (
				item.subject?.name &&
				!existing.subjectNames.includes(item.subject.name)
			)
				existing.subjectNames.push(item.subject.name);
		} else {
			byKey.set(key, {
				key,
				courseId,
				date: item.date,
				day,
				hours: item.hour ? [item.hour] : [],
				subjectNames: item.subject?.name ? [item.subject.name] : [],
			});
		}
	});
	return [...byKey.values()].sort(
		(a, b) =>
			a.courseId - b.courseId ||
			a.date.localeCompare(b.date) ||
			a.day - b.day,
	);
};

/** Índice `course_id → course` para resolver el programa y el tipo de curso. */
export const buildCourseCatalog = (
	courses?: course[] | null,
): Map<number, course> => {
	const map = new Map<number, course>();
	(courses ?? []).forEach((c) => {
		if (c?.id != null) map.set(c.id, c);
	});
	return map;
};

export const courseTitle = (
	courseId: number,
	catalog: Map<number, course>,
	fallback?: course | null,
): string => {
	const found = fallback ?? catalog.get(courseId);
	if (!found) return `Curso #${courseId}`;
	return [found.name, found.code].filter(Boolean).join(' - ');
};

/**
 * Los cursos teóricos (`course_type.id === 2`) no registran asistencia ni
 * firmas de grupo: es la misma regla de `viewCourseStudentSchedule.tsx`.
 */
export const isTheoreticalCourse = (
	candidate?: course | null,
): boolean => candidate?.course_type?.id === 2;

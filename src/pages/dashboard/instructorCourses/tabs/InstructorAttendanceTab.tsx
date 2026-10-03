import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../../../store';
import { axiosGetDefault } from '../../../../services/axios';
import { Typography } from '@material-tailwind/react';
import LoadingPage from '../../../../components/LoadingPage';
import ErrorPage from '../../../../components/ErrorPage';
import { course, subject } from '../../../../types/utilities';
import { fetchAttendanceStatuses } from '../../../../features/attendanceSlice';
import { fetchSubjects } from '../../../../features/subjectSlice';
import InstructorAttendanceCourseSection from './InstructorAttendanceCourseSection';
import {
	buildCourseCatalog,
	buildRoster,
	buildSessions,
	courseIdOfSchedule,
	hasRealSession,
	isTheoreticalCourse,
	type InstructorAttendanceItem,
	type InstructorRosterStudent,
	type InstructorScheduleItem,
	type InstructorSession,
} from './instructorShared';

const ATTENDANCE_PAGE_SIZE = 500;
const MAX_ATTENDANCE_PAGES = 20;

/**
 * Toda la vista se alimenta de `GET /api/instructor/schedule/:instructor_id`
 * (el cronograma completo del instructor) y de
 * `GET /api/attendance?instructor_id`. Ninguno de los dos acepta `course_id`,
 * así que el corte por curso se hace en cliente contra el roster de cada curso.
 */
type Props = {
	instructor_id: number;
	courses?: course[] | null;
	courseId?: number | null;
};

type CourseAttendanceBase = {
	courseId: number;
	course?: course | null;
	sessions: InstructorSession[];
	roster: InstructorRosterStudent[];
};

const InstructorAttendanceTab = ({
	instructor_id,
	courses,
	courseId,
}: Props) => {
	const dispatch = useDispatch<AppDispatch>();

	const [base, setBase] = useState<CourseAttendanceBase[]>([]);
	const [attendances, setAttendances] = useState<InstructorAttendanceItem[]>(
		[],
	);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const catalog = useMemo(() => buildCourseCatalog(courses), [courses]);

	const loadSchedule = useCallback(async (): Promise<InstructorScheduleItem[]> => {
		if (instructor_id <= 0) return [];
		const { resp, status } = await axiosGetDefault(
			`api/instructor/schedule/${instructor_id}`,
		);
		if (status < 200 || status >= 400) return [];
		const list = resp?.data ?? resp;
		return Array.isArray(list) ? (list as InstructorScheduleItem[]) : [];
	}, [instructor_id]);

	/**
	 * `api/attendance` solo acepta `instructor_id`, así que devuelve la asistencia
	 * de todos los cursos del instructor. Se traen todas las páginas y el corte por
	 * curso se hace en cliente contra el roster del curso; con la paginación del
	 * servidor el historial mostraba alumnos de otros cursos.
	 */
	const loadAttendances = useCallback(async () => {
		if (instructor_id <= 0) {
			setAttendances([]);
			return;
		}
		const all: InstructorAttendanceItem[] = [];
		let page = 1;
		let totalPages = 1;
		do {
			const { resp, status } = await axiosGetDefault('api/attendance', {
				instructor_id,
				currentPage: page,
				pageSize: ATTENDANCE_PAGE_SIZE,
			});
			if (status < 200 || status >= 400) {
				if (page === 1) throw new Error('Error al cargar la asistencia');
				break;
			}
			all.push(...((resp.data || []) as InstructorAttendanceItem[]));
			totalPages = resp.totalPages || 1;
			page += 1;
		} while (page <= totalPages && page <= MAX_ATTENDANCE_PAGES);
		setAttendances(all);
	}, [instructor_id]);

	/**
	 * `GET /api/subjects/course/:id` es por curso, así que se piden las materias de
	 * cada curso distinto que aparece en el cronograma (deduplicados) para resolver
	 * el ordinal `subject_days_id` y validar contra el programa del curso.
	 */
	const loadSubjectsByCourse = useCallback(
		async (courseIds: number[]): Promise<Map<number, subject[]>> => {
			const map = new Map<number, subject[]>();
			await Promise.all(
				courseIds.map(async (id) => {
					const list = await dispatch(
						fetchSubjects({
							course_id: id,
							status: true,
							is_schedulable: true,
						}),
					)
						.unwrap()
						.catch(() => [] as subject[]);
					map.set(id, list ?? []);
				}),
			);
			return map;
		},
		[dispatch],
	);

	useEffect(() => {
		if (instructor_id <= 0) {
			setLoading(false);
			return;
		}

		let cancelled = false;

		const load = async () => {
			setLoading(true);
			setError(null);
			try {
				const scheduleList = await loadSchedule();
				const courseIds = [
					...new Set(
						scheduleList
							.map((item) => courseIdOfSchedule(item))
							.filter((id): id is number => id !== null && id > 0),
					),
				];

				const [subjectsByCourse] = await Promise.all([
					loadSubjectsByCourse(courseIds),
					loadAttendances(),
					dispatch(fetchAttendanceStatuses()),
				]);

				if (cancelled) return;

				// Cada fila se descarta si la materia o su día están desactivados, o
				// si el ordinal no cabe en el programa del curso. La misma lista
				// alimenta sesiones y roster para que no entren alumnos sin sesión.
				const next: CourseAttendanceBase[] = [];
				courseIds.forEach((id) => {
					const program = catalog.get(id) ?? null;
					if (isTheoreticalCourse(program)) return;
					const subjectList = subjectsByCourse.get(id) ?? [];
					const real = scheduleList.filter(
						(item) =>
							courseIdOfSchedule(item) === id &&
							hasRealSession(item, subjectList, program),
					);
					if (real.length === 0) return;
					next.push({
						courseId: id,
						course: program,
						sessions: buildSessions(real, subjectList),
						roster: buildRoster(real),
					});
				});
				setBase(next);
			} catch {
				if (!cancelled) setError('Error al conectar con el servidor');
			} finally {
				if (!cancelled) setLoading(false);
			}
		};

		load();
		return () => {
			cancelled = true;
		};
	}, [catalog, dispatch, instructor_id, loadAttendances, loadSchedule, loadSubjectsByCourse]);

	const visible = courseId
		? base.filter((v) => v.courseId === courseId)
		: base;

	if (loading) return <LoadingPage />;
	if (error) return <ErrorPage error={error} />;

	if (visible.length === 0) {
		return (
			<Typography
				color="gray"
				placeholder={undefined}
				onPointerEnterCapture={undefined}
				onPointerLeaveCapture={undefined}
			>
				No hay cursos con asistencia disponible
			</Typography>
		);
	}

	return (
		<div className="flex flex-col gap-4">
			{visible.map((view) => (
				<InstructorAttendanceCourseSection
					key={view.courseId}
					courseId={view.courseId}
					course={view.course}
					sessions={view.sessions}
					roster={view.roster}
					attendances={attendances}
					onSaved={loadAttendances}
				/>
			))}
		</div>
	);
};

export default InstructorAttendanceTab;

import { useMemo } from 'react';
import { Card, CardBody, Typography } from '@material-tailwind/react';
import {
	courseIdOfGrouped,
	courseLabelOfGrouped,
	ScheduleGroupedItem,
	ScheduleItem,
} from '../../../../features/instructorSlice';
import { course } from '../../../../types/utilities';
import {
	ordinalLabel,
	ordinalNoun,
	ProgramCourse,
} from '../../../../utils/programSize';
import { buildCourseCatalog, pilotName } from './instructorShared';

/**
 * El ordinal (día o sesión) vive en `schedule.subject_day.day` para los dos tipos
 * de curso: la tabla `schedule` solo tiene `subject_days_id` / `subject_day`, no
 * una columna por lesson. Ramificar por `usesSessions` hacía que los cursos por
 * sesiones buscaran el ordinal en `subject_lesson_days`, que el endpoint no
 * devuelve, y quedaban sin número.
 */
const ordinalOf = (schedule: ScheduleItem): number | undefined =>
	schedule.subject_day?.day ?? schedule.subject_lesson_days?.day;

/**
 * Orden: `subject_lesson.order` cuando viene → ordinal (`subject_day.day`) →
 * `schedule.date`. El `order` del lesson es opcional, así que una sesión sin
 * lesson se ordena por su ordinal en vez de romper la comparación con `undefined`.
 */
const compareSchedules = (
	a: ScheduleItem,
	b: ScheduleItem,
): number => {
	const lessonA = a.subject_lesson?.order ?? Number.MAX_SAFE_INTEGER;
	const lessonB = b.subject_lesson?.order ?? Number.MAX_SAFE_INTEGER;
	if (lessonA !== lessonB) return lessonA - lessonB;

	const dayA = ordinalOf(a) ?? Number.MAX_SAFE_INTEGER;
	const dayB = ordinalOf(b) ?? Number.MAX_SAFE_INTEGER;
	if (dayA !== dayB) return dayA - dayB;

	return new Date(a.date).getTime() - new Date(b.date).getTime();
};

const InstructorSchedulesGroupedTab = ({
	schedules,
	courses,
}: {
	instructor_id: number;
	schedules: ScheduleGroupedItem[];
	courses: course[];
}) => {
	const catalog = useMemo(
		() => buildCourseCatalog(courses),
		[courses],
	);

	const filtered = schedules.filter(
		(item) => courseIdOfGrouped(item) != null,
	);

	const totalSessions = useMemo(
		() =>
			filtered.reduce(
				(total, item) => total + (item.schedules?.length ?? 0),
				0,
			),
		[filtered],
	);

	/**
	 * `uses_sessions` decide si el ordinal es día o sesión. El objeto `course`
	 * de la fila es recortado, así que el catálogo manda y el anidado queda como
	 * respaldo.
	 */
	const programOf = (
		item: ScheduleGroupedItem,
	): ProgramCourse | null => {
		const id = courseIdOfGrouped(item);
		const fromCatalog = id != null ? catalog.get(id) : undefined;
		if (fromCatalog) return fromCatalog;
		const nested = item.course;
		return nested
			? {
					uses_sessions: nested.uses_sessions,
					days: nested.days,
					sessions: nested.sessions,
				}
			: null;
	};

	if (!filtered.length) {
		return (
			<Typography
				placeholder={undefined}
				onPointerEnterCapture={undefined}
				onPointerLeaveCapture={undefined}
				className="py-8 text-center text-blue-gray-500"
			>
				No hay horarios
			</Typography>
		);
	}

	return (
		<Card
			placeholder={undefined}
			onPointerEnterCapture={undefined}
			onPointerLeaveCapture={undefined}
		>
			<CardBody
				placeholder={undefined}
				onPointerEnterCapture={undefined}
				onPointerLeaveCapture={undefined}
				className="flex flex-col gap-4"
			>
				<Typography
					placeholder={undefined}
					onPointerEnterCapture={undefined}
					onPointerLeaveCapture={undefined}
					className="text-sm text-blue-gray-500"
				>
					{filtered.length} pilotos · {totalSessions} sesiones
					programadas
				</Typography>

				{filtered.map((item) => {
					const program = programOf(item);
					const label = courseLabelOfGrouped(item);

					return (
						<div
							key={item.course_student_id}
							className="rounded-lg border border-blue-gray-100"
						>
							<div className="flex flex-wrap items-center justify-between gap-2 border-b border-blue-gray-100 bg-blue-gray-50 px-4 py-2">
								<span className="font-semibold text-blue-gray-900">
									{pilotName(item) || 'Piloto'}
									{/* `student` ausente no significa inactivo: sin dato no se
									    afirma nada, o se rotularía como tal a un piloto cuyo
									    nombre simplemente no vino. */}
									{item.student?.status === false ? (
										<span className="ml-2 text-xs font-normal text-red-500">
											(inactivo)
										</span>
									) : null}
								</span>
								<span className="text-sm text-blue-gray-500">
									{label}
								</span>
							</div>

							<ul className="divide-y divide-blue-gray-50">
								{[...(item.schedules ?? [])]
									.sort(compareSchedules)
									.map((schedule, index) => {
										const ordinal = ordinalOf(schedule);
										const classTime =
											schedule.classTime ??
											schedule.subject_day?.classTime ??
											schedule.subject_lesson_days?.classTime;
										const subjectName =
											schedule.subject?.name ?? schedule.subject_name;

										return (
											<li
												key={schedule.id ?? `${index}`}
												className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 text-sm"
											>
												<span className="text-blue-gray-700">
													{ordinal != null
														? ordinalLabel(program, ordinal)
														: ordinalNoun(program)}{' '}
													· {subjectName ?? ''}
													{schedule.subject_lesson?.name
														? ` — ${schedule.subject_lesson.name}`
														: ''}
												</span>
												<span className="flex items-center gap-3 text-blue-gray-500">
													{classTime != null ? (
														<span>{classTime} h</span>
													) : null}
													<span>
														{schedule.date} · {schedule.hour}
													</span>
												</span>
											</li>
										);
									})}
							</ul>
						</div>
					);
				})}
			</CardBody>
		</Card>
	);
};

export default InstructorSchedulesGroupedTab;

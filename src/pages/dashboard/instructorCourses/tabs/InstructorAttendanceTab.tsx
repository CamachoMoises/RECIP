import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../../store';
import { axiosGetDefault } from '../../../../services/axios';
import {
	Accordion,
	AccordionBody,
	AccordionHeader,
	Button,
	Card,
	CardBody,
	Option,
	Select,
	Textarea,
	Typography,
} from '@material-tailwind/react';
import {
	Calendar,
	CheckCheck,
	ChevronLeft,
	ChevronRight,
	Clock,
	Edit2,
	History,
	Save,
	X,
} from 'lucide-react';
import moment from 'moment';
import toast from 'react-hot-toast';
import LoadingPage from '../../../../components/LoadingPage';
import ErrorPage from '../../../../components/ErrorPage';
import { course, subject } from '../../../../types/utilities';
import {
	isWithinProgram,
	ordinalLabel,
	ordinalNoun,
	usesSessions,
	type ProgramCourse,
} from '../../../../utils/programSize';
import {
	createAttendance,
	fetchAttendanceStatuses,
	updateAttendance,
} from '../../../../features/attendanceSlice';
import { fetchSubjects } from '../../../../features/subjectSlice';
import { PermissionsValidate } from '../../../../services/permissionsValidate';

const DEFAULT_ATTENDANCE_STATUS = 1;
const HISTORY_PAGE_SIZE = 15;
const ATTENDANCE_PAGE_SIZE = 500;
const MAX_ATTENDANCE_PAGES = 20;

type Props = {
	instructor_id: number;
	course_id: number;
	course?: course | null;
};

/**
 * Cada fila (alumno + sesión) tiene su propio borrador. Varias sesiones pueden
 * compartir fecha, así que un estado compartido haría que escribir en una
 * escribiera en todas.
 */
type AttendanceDraft = {
	attendance_status_id: number;
	comments: string;
};

type RosterStudent = {
	id: number;
	code: string;
	name: string;
};

type ScheduleItem = {
	id: number;
	date: string;
	hour?: string;
	classTime?: number;
	course_student_id?: number;
	subject_id?: number;
	subject_days_id?: number;
	subject?: {
		name: string;
		status?: boolean;
	};
	subject_day?: {
		day: number;
		status?: boolean;
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

type SessionItem = {
	key: string;
	date: string;
	day: number;
	hours: string[];
	subjectNames: string[];
};

/**
 * `api/attendance` incluye `course_student` sin `student` ni `course` anidados,
 * así que el nombre del alumno y su código se resuelven contra el roster local.
 */
type AttendanceItem = {
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
	};
};

const getStatusColor = (statusName: string | undefined) => {
	switch (statusName?.toLowerCase()) {
		case 'presente':
			return 'bg-green-100 text-green-700';
		case 'ausente':
			return 'bg-red-100 text-red-700';
		case 'tarde':
			return 'bg-orange-100 text-orange-700';
		case 'excusado':
			return 'bg-blue-100 text-blue-700';
		default:
			return 'bg-gray-100 text-gray-700';
	}
};

const statusColorById = (
	statusList: { id: number; name: string }[],
	statusId: number | undefined,
) =>
	getStatusColor(statusList.find((s) => s.id === statusId)?.name);

/**
 * El ordinal del horario vive en `attendance.day` y varias asistencias pueden
 * compartir fecha, así que la clave del borrador es (alumno, fecha, ordinal).
 */
const draftKeyOf = (courseStudentId: number, date: string, day: number) =>
	`${courseStudentId}#${moment(date).format('YYYY-MM-DD')}#${day}`;

/** Algunas respuestas traen el `course_student_id` plano y otras solo anidado. */
const courseStudentIdOf = (item: AttendanceItem): number | undefined =>
	item.course_student_id ?? item.course_student?.id;

/**
 * El roster sale del cronograma del curso y no de los grupos: cada fila del
 * cronograma es un alumno de ESTE curso con su `course_student_id` real, y es la
 * misma fuente que se usa para las sesiones. Con los grupos se colaban alumnos
 * de otros cursos, porque el filtro por curso del endpoint de grupos se pisa
 * con el del instructor.
 */
const buildRoster = (list: ScheduleItem[]): RosterStudent[] => {
	const byId = new Map<number, RosterStudent>();
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
 * El ordinal del horario viene en `subject_day.day`. Si el endpoint no lo
 * devuelve se busca por `subject_days_id` contra las materias del curso; sin
 * ordinal no se puede marcar, y asumir el día 1 grabaría la sesión equivocada.
 */
const getDayForSchedule = (
	scheduleItem: ScheduleItem,
	subjectList: subject[],
): number | undefined => {
	if (scheduleItem.subject_day?.day) return scheduleItem.subject_day.day;
	return subjectList
		.flatMap((s) => s.subject_days ?? [])
		.find((d) => d.id === scheduleItem.subject_days_id)?.day;
};

/**
 * Un horario solo cuenta como sesión real si la materia y su día siguen
 * activos; `viewCourseStudentSchedule.tsx` exige `sd.status && subject.status`
 * y por eso esconde las Materias desactivadas. Sin este filtro aparecían
 * sesiones de Materias dadas de baja.
 */
const isActiveSchedule = (item: ScheduleItem) =>
	item.subject_day?.status !== false && item.subject?.status !== false;

/** Fila de horario con sesión válida: mismo criterio para sesiones y roster. */
const hasRealSession = (
	item: ScheduleItem,
	subjectList: subject[],
	program: ProgramCourse | null | undefined,
) => {
	if (!isActiveSchedule(item)) return false;
	const day = getDayForSchedule(item, subjectList);
	return day !== undefined && isWithinProgram(program, day);
};

const buildSessions = (
	list: ScheduleItem[],
	subjectList: subject[],
): SessionItem[] => {
	const byKey = new Map<string, SessionItem>();
	list.forEach((item) => {
		const day = getDayForSchedule(item, subjectList);
		if (!item.date || day === undefined) return;
		const date = moment(item.date).format('YYYY-MM-DD');
		const key = `${date}#${day}`;
		const existing = byKey.get(key);
		if (existing) {
			if (item.hour && !existing.hours.includes(item.hour))
				existing.hours.push(item.hour);
			if (item.subject?.name && !existing.subjectNames.includes(item.subject.name))
				existing.subjectNames.push(item.subject.name);
		} else {
			byKey.set(key, {
				key,
				date,
				day,
				hours: item.hour ? [item.hour] : [],
				subjectNames: item.subject?.name ? [item.subject.name] : [],
			});
		}
	});
	return [...byKey.values()].sort(
		(a, b) => a.date.localeCompare(b.date) || a.day - b.day,
	);
};

const InstructorAttendanceTab = ({ instructor_id, course_id, course }: Props) => {
	const dispatch = useDispatch<AppDispatch>();
	const canEditAttendance = PermissionsValidate(['instructor']);
	const statusList = useSelector(
		(state: RootState) => state.attendance.attendanceStatusList,
	);

	const isTheoretical = course?.course_type?.id === 2;

	const [sessions, setSessions] = useState<SessionItem[]>([]);
	const [roster, setRoster] = useState<RosterStudent[]>([]);
	const [attendances, setAttendances] = useState<AttendanceItem[]>([]);
	const [drafts, setDrafts] = useState<Record<string, AttendanceDraft>>({});
	const [editingKey, setEditingKey] = useState<string | null>(null);
	const [savingKey, setSavingKey] = useState<string | null>(null);
	const [openSessions, setOpenSessions] = useState<string[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const [historyPage, setHistoryPage] = useState(1);
	const [historyOpen, setHistoryOpen] = useState(false);

	const presenteStatus = statusList.find(
		(s) => s.name.trim().toLowerCase() === 'presente',
	);
	const presenteStatusId = presenteStatus?.id ?? DEFAULT_ATTENDANCE_STATUS;
	const presenteStatusName = presenteStatus?.name ?? 'Presente';

	/**
	 * El cronograma del instructor llega de todos sus cursos (el endpoint no
	 * acepta `course_id`), así que se filtra por `course_student.course_id`, que
	 * el endpoint siempre incluye. El filtro es estricto: si una fila no trae el
	 * curso no se marca, porque asumarlo traería alumnos de otros cursos.
	 * Aquí solo se corta por curso; el descarte de sesiones ficticias
	 * (`hasRealSession`) necesita las materias y se aplica al montar la vista.
	 */
	const loadSchedule = useCallback(async (): Promise<ScheduleItem[]> => {
		const { resp, status } = await axiosGetDefault(
			`api/instructor/schedule/${instructor_id}`,
		);
		if (status < 200 || status >= 400) return [];
		const list: ScheduleItem[] = Array.isArray(resp) ? resp : [];
		if (course_id <= 0) return [];
		return list.filter((s) => s.course_student?.course_id === course_id);
	}, [instructor_id, course_id]);

	/**
	 * `api/attendance` solo acepta `instructor_id`, así que devuelve la asistencia
	 * de todos los cursos del instructor. Se traen todas las páginas y el corte por
	 * curso se hace en cliente contra el roster del curso; con la paginación del
	 * servidor el historial mostraba alumnos de otros cursos.
	 */
	const loadAttendances = useCallback(async () => {
		const all: AttendanceItem[] = [];
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
			all.push(...((resp.data || []) as AttendanceItem[]));
			totalPages = resp.totalPages || 1;
			page += 1;
		} while (page <= totalPages && page <= MAX_ATTENDANCE_PAGES);
		setAttendances(all);
	}, [instructor_id]);

	useEffect(() => {
		if (instructor_id <= 0 || isTheoretical) {
			setLoading(false);
			return;
		}

		const load = async () => {
			setLoading(true);
			setError(null);
			try {
				const [scheduleList, subjectList] = await Promise.all([
					loadSchedule(),
					dispatch(fetchSubjects({ course_id, status: true, is_schedulable: true }))
						.unwrap()
						.catch(() => [] as subject[]),
					loadAttendances(),
					dispatch(fetchAttendanceStatuses()),
				]);

				const subjects = subjectList ?? [];
				// Una sola lista para sesiones y roster: si una fila no tiene
				// sesión real, ni se muestra como sesión ni cuenta como alumno.
				const realScheduleList = scheduleList.filter((item) =>
					hasRealSession(item, subjects, course),
				);

				const built = buildSessions(realScheduleList, subjects);
				setSessions(built);
				setRoster(buildRoster(realScheduleList));
				const today = moment().format('YYYY-MM-DD');
				const preferred = built.find((s) => s.date === today) ?? built[0];
				setOpenSessions(preferred ? [preferred.key] : []);
			} catch {
				setError('Error al conectar con el servidor');
			} finally {
				setLoading(false);
			}
		};

		load();
	}, [
		dispatch,
		instructor_id,
		course_id,
		course,
		isTheoretical,
		loadSchedule,
		loadAttendances,
	]);

	// El endpoint se pide solo por instructor, así que el corte por curso se hace
	// en cliente contra el roster del curso.
	const rosterAttendances = useMemo(() => {
		const ids = new Set(roster.map((r) => r.id));
		return attendances.filter((a) => {
			const id = courseStudentIdOf(a);
			return id !== undefined && ids.has(id);
		});
	}, [attendances, roster]);

	const rosterById = useMemo(
		() => new Map(roster.map((r) => [r.id, r])),
		[roster],
	);

	const historyRows = useMemo(() => {
		const start = (historyPage - 1) * HISTORY_PAGE_SIZE;
		return [...rosterAttendances]
			.sort(
				(a, b) =>
					b.date.localeCompare(a.date) || (b.day ?? 0) - (a.day ?? 0),
			)
			.slice(start, start + HISTORY_PAGE_SIZE);
	}, [rosterAttendances, historyPage]);

	const historyTotal = rosterAttendances.length;
	const historyPages = Math.max(1, Math.ceil(historyTotal / HISTORY_PAGE_SIZE));

	useEffect(() => {
		if (historyPage > historyPages) setHistoryPage(historyPages);
	}, [historyPage, historyPages]);

	const findAttendance = (
		courseStudentId: number,
		date: string,
		day: number,
	): AttendanceItem | undefined => {
		const dateStr = moment(date).format('YYYY-MM-DD');
		return rosterAttendances.find(
			(a) =>
				courseStudentIdOf(a) === courseStudentId &&
				moment(a.date).format('YYYY-MM-DD') === dateStr &&
				a.day === day,
		);
	};

	const getDraft = (key: string): AttendanceDraft =>
		drafts[key] ?? { attendance_status_id: presenteStatusId, comments: '' };

	const setDraft = (key: string, patch: Partial<AttendanceDraft>) =>
		setDrafts((prev) => ({
			...prev,
			[key]: {
				...(prev[key] ?? {
					attendance_status_id: presenteStatusId,
					comments: '',
				}),
				...patch,
			},
		}));

	const clearDraft = (key: string) =>
		setDrafts((prev) => {
			if (!(key in prev)) return prev;
			const next = { ...prev };
			delete next[key];
			return next;
		});

	const hasDraft = (key: string) => key in drafts;

	const toggleSession = (key: string) =>
		setOpenSessions((prev) =>
			prev.includes(key)
				? prev.filter((k) => k !== key)
				: [...prev, key],
		);

	/**
	 * `day` es obligatorio en el alta (el backend lo valida) y con cursos por
	 * sesiones se manda además `session_number`: el repositorio resuelve
	 * `session_number ?? day` y guarda el ordinal en `attendance.day`.
	 */
	const ordinalPayload = (day: number): { day: number; session_number?: number } =>
		usesSessions(course) ? { day, session_number: day } : { day };

	const persistAttendance = async (
		courseStudentId: number,
		date: string,
		day: number,
		draft: AttendanceDraft,
	): Promise<'created' | 'updated'> => {
		const existing = findAttendance(courseStudentId, date, day);
		if (existing) {
			await dispatch(
				updateAttendance({
					id: existing.id,
					course_student_id: courseStudentId,
					date,
					attendance_status_id: draft.attendance_status_id,
					comments: draft.comments,
					...ordinalPayload(day),
				}),
			).unwrap();
			return 'updated';
		}
		await dispatch(
			createAttendance({
				course_student_id: courseStudentId,
				date,
				attendance_status_id: draft.attendance_status_id,
				comments: draft.comments,
				...ordinalPayload(day),
			}),
		).unwrap();
		return 'created';
	};

	const refreshAfterSave = async () => {
		await loadAttendances();
	};

	const handleSaveAttendance = async (
		courseStudentId: number,
		date: string,
		day: number,
		key: string,
	) => {
		setSavingKey(key);
		try {
			const result = await persistAttendance(
				courseStudentId,
				date,
				day,
				getDraft(key),
			);
			toast.success(
				result === 'updated'
					? 'Asistencia actualizada'
					: 'Asistencia guardada',
			);
			await refreshAfterSave();
			clearDraft(key);
			setEditingKey(null);
		} catch (err: any) {
			toast.error(err?.message || 'Error al guardar asistencia');
		} finally {
			setSavingKey(null);
		}
	};

	const handleSaveSession = async (session: SessionItem) => {
		const pending = roster
			.map((student) => ({
				student,
				key: draftKeyOf(student.id, session.date, session.day),
			}))
			.filter(({ key }) => hasDraft(key));

		if (pending.length === 0) {
			toast.error('No hay cambios por guardar en esta sesión');
			return;
		}

		setSavingKey(session.key);
		try {
			for (const { student, key } of pending) {
				await persistAttendance(
					student.id,
					session.date,
					session.day,
					getDraft(key),
				);
			}
			toast.success(
				`Asistencia guardada para ${pending.length} alumno(s)`,
			);
			await refreshAfterSave();
			pending.forEach(({ key }) => clearDraft(key));
			setEditingKey(null);
		} catch (err: any) {
			toast.error(err?.message || 'Error al guardar asistencia');
		} finally {
			setSavingKey(null);
		}
	};

	const handleMarkAllPresent = (session: SessionItem) => {
		setDrafts((prev) => {
			const next = { ...prev };
			roster.forEach((student) => {
				const key = draftKeyOf(student.id, session.date, session.day);
				next[key] = {
					attendance_status_id: presenteStatusId,
					comments: prev[key]?.comments ?? '',
				};
			});
			return next;
		});
	};

	const handleEdit = (key: string, record: AttendanceItem) => {
		setEditingKey(key);
		setDraft(key, {
			attendance_status_id:
				record.attendance_status_id ?? presenteStatusId,
			comments: record.comments ?? '',
		});
	};

	const handleCancel = (key: string) => {
		setEditingKey(null);
		clearDraft(key);
	};

	if (loading) return <LoadingPage />;
	if (error) return <ErrorPage error={error} />;

	if (isTheoretical) {
		return (
			<Card
				placeholder={undefined}
				onPointerEnterCapture={undefined}
				onPointerLeaveCapture={undefined}
			>
				<CardBody
					className="p-4 md:p-6"
					placeholder={undefined}
					onPointerEnterCapture={undefined}
					onPointerLeaveCapture={undefined}
				>
					<Typography
						variant="h5"
						color="blue-gray"
						className="mb-2"
						placeholder={undefined}
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
					>
						Registro de Asistencia
					</Typography>
					<Typography
						color="gray"
						placeholder={undefined}
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
					>
						Este curso no registra asistencia
					</Typography>
				</CardBody>
			</Card>
		);
	}

	return (
		<div className="flex flex-col gap-4">
			<Card
				placeholder={undefined}
				onPointerEnterCapture={undefined}
				onPointerLeaveCapture={undefined}
			>
				<CardBody
					className="p-4 md:p-6"
					placeholder={undefined}
					onPointerEnterCapture={undefined}
					onPointerLeaveCapture={undefined}
				>
					<Typography
						variant="h5"
						color="blue-gray"
						className="mb-4"
						placeholder={undefined}
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
					>
						Marcar Asistencia
					</Typography>

					{sessions.length === 0 ? (
						<Typography
							color="gray"
							placeholder={undefined}
							onPointerEnterCapture={undefined}
							onPointerLeaveCapture={undefined}
						>
							No hay fechas programadas para este curso
						</Typography>
					) : roster.length === 0 ? (
						<Typography
							color="gray"
							placeholder={undefined}
							onPointerEnterCapture={undefined}
							onPointerLeaveCapture={undefined}
						>
							No hay alumnos con horario asignado en este curso
						</Typography>
					) : (
						<div className="flex flex-col gap-4">
							<div className="flex flex-wrap gap-3">
								{statusList.map((status) => (
									<div
										key={status.id}
										className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(status.name)}`}
									>
										{status.name}
									</div>
								))}
							</div>

							<div className="flex flex-col gap-3">
								{sessions.map((session) => {
										const isSessionSaving = savingKey === session.key;
										return (
											<Accordion
												key={session.key}
												open={openSessions.includes(session.key)}
												className="border border-blue-gray-100 rounded-lg"
												placeholder={undefined}
												onPointerEnterCapture={undefined}
												onPointerLeaveCapture={undefined}
											>
												<AccordionHeader
													onClick={() => toggleSession(session.key)}
													className="px-4 py-3"
													placeholder={undefined}
													onPointerEnterCapture={undefined}
													onPointerLeaveCapture={undefined}
												>
													<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 w-full pr-2">
														<div className="flex items-center gap-3 flex-wrap">
															<Calendar className="h-5 w-5 text-blue-500" />
															<Typography
																variant="h6"
																color="blue-gray"
																className="text-sm"
																placeholder={undefined}
																onPointerEnterCapture={undefined}
																onPointerLeaveCapture={undefined}
															>
																{moment(session.date).format('DD/MM/YYYY')}
															</Typography>
															<span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
																{ordinalLabel(course, session.day)}
															</span>
															{session.hours.length > 0 && (
																<div className="flex items-center gap-2 text-sm">
																	<Clock className="h-4 w-4 text-orange-500" />
																	<Typography
																		variant="small"
																		placeholder={undefined}
																		onPointerEnterCapture={undefined}
																		onPointerLeaveCapture={undefined}
																	>
																		{session.hours.join(' - ')}
																	</Typography>
																</div>
															)}
														</div>
														<Typography
															variant="small"
															color="gray"
															placeholder={undefined}
															onPointerEnterCapture={undefined}
															onPointerLeaveCapture={undefined}
														>
															{
																roster.filter(
																	(student) =>
																		findAttendance(
																			student.id,
																			session.date,
																			session.day,
																		) !== undefined,
																).length
															}
															/{roster.length} registradas
														</Typography>
													</div>
												</AccordionHeader>
												<AccordionBody className="px-4 py-3">
													{session.subjectNames.length > 0 && (
														<div className="flex flex-wrap gap-2 mb-3">
															{session.subjectNames.map((name) => (
																<span
																	key={name}
																	className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
																>
																	{name}
																</span>
															))}
														</div>
													)}

													<div className="overflow-x-auto">
														<table className="w-full">
															<thead>
																<tr>
																	<th className="py-2 px-3 text-left text-xs font-semibold text-gray-500 border-b border-blue-gray-50">
																		Alumno
																	</th>
																	<th className="py-2 px-3 text-left text-xs font-semibold text-gray-500 border-b border-blue-gray-50">
																		Código
																	</th>
																	<th className="py-2 px-3 text-left text-xs font-semibold text-gray-500 border-b border-blue-gray-50 w-44">
																		Estado
																	</th>
																	<th className="py-2 px-3 text-left text-xs font-semibold text-gray-500 border-b border-blue-gray-50">
																		Comentarios
																	</th>
																	{canEditAttendance && (
																		<th className="py-2 px-3 text-right text-xs font-semibold text-gray-500 border-b border-blue-gray-50">
																			Acciones
																		</th>
																	)}
																</tr>
															</thead>
															<tbody>
																{roster.map((student) => {
																	const key = draftKeyOf(
																		student.id,
																		session.date,
																		session.day,
																	);
																	const record = findAttendance(
																		student.id,
																		session.date,
																		session.day,
																	);
																	const isEditing = editingKey === key;
																	const isRowSaving = savingKey === key;
																	const showForm =
																		canEditAttendance &&
																		(!record || isEditing || hasDraft(key));
																	const draft = getDraft(key);

																	return (
																		<tr
																			key={student.id}
																			className="align-top hover:bg-blue-gray-50/50 transition-colors"
																		>
																			<td className="py-2 px-3 text-sm border-b border-blue-gray-50">
																				{student.name}
																			</td>
																			<td className="py-2 px-3 text-sm text-gray-500 border-b border-blue-gray-50">
																				{student.code}
																			</td>
																			<td className="py-2 px-3 border-b border-blue-gray-50">
																				{showForm ? (
																					<Select
																						value={draft.attendance_status_id.toString()}
																						onChange={(val) =>
																							val &&
																							setDraft(key, {
																								attendance_status_id: parseInt(val),
																							})
																						}
																						placeholder={undefined}
																						onPointerEnterCapture={undefined}
																						onPointerLeaveCapture={undefined}
																						labelProps={{
																							placeholder: undefined,
																							onPointerEnterCapture: undefined,
																							onPointerLeaveCapture: undefined,
																						}}
																					>
																						{statusList.map((status) => (
																							<Option
																								key={status.id}
																								value={status.id.toString()}
																							>
																								{status.name}
																							</Option>
																						))}
																					</Select>
																				) : (
																					record && (
																						<span
																							className={`px-2 py-1 rounded-full text-xs font-medium ${statusColorById(
																								statusList,
																								record.attendance_status_id,
																							)}`}
																						>
																							{
																								statusList.find(
																									(s) => s.id === record.attendance_status_id,
																								)?.name ?? '-'
																							}
																						</span>
																					)
																				)}
																			</td>
																			<td className="py-2 px-3 border-b border-blue-gray-50">
																				{showForm ? (
																					<Textarea
																						value={draft.comments}
																						onChange={(e) =>
																							setDraft(key, {
																								comments: e.target.value,
																							})
																						}
																						rows={2}
																						placeholder={undefined}
																						onPointerEnterCapture={undefined}
																						onPointerLeaveCapture={undefined}
																						labelProps={{
																							placeholder: undefined,
																							onPointerEnterCapture: undefined,
																							onPointerLeaveCapture: undefined,
																						}}
																					/>
																				) : (
																					<Typography
																						variant="small"
																						className="italic text-gray-600"
																						placeholder={undefined}
																						onPointerEnterCapture={undefined}
																						onPointerLeaveCapture={undefined}
																					>
																						{record?.comments
																							? `"${record.comments}"`
																							: '-'}
																					</Typography>
																				)}
																			</td>
																			{canEditAttendance && (
																				<td className="py-2 px-3 border-b border-blue-gray-50">
																					<div className="flex items-center justify-end gap-2">
																						{showForm ? (
																							<>
																								<Button
																					size="sm"
																					color="green"
																					onClick={() =>
																						handleSaveAttendance(
																							student.id,
																							session.date,
																							session.day,
																							key,
																						)
																					}
																					disabled={isRowSaving}
																					placeholder={undefined}
																					onPointerEnterCapture={undefined}
																					onPointerLeaveCapture={undefined}
																					className="flex items-center gap-2"
																				>
																					<Save className="w-4 h-4" />
																					{isRowSaving
																						? 'Guardando...'
																						: record
																							? 'Actualizar'
																							: 'Guardar'}
																				</Button>
																				{record && (
																					<Button
																						size="sm"
																						color="gray"
																						onClick={() => handleCancel(key)}
																						placeholder={undefined}
																						onPointerEnterCapture={undefined}
																						onPointerLeaveCapture={undefined}
																						className="flex items-center gap-2"
																					>
																						<X className="w-4 h-4" /> Cancelar
																					</Button>
																				)}
																			</>
																		) : (
																			record && (
																				<Button
																					size="sm"
																					color="blue"
																					variant="text"
																					title="Editar asistencia"
																					onClick={() => handleEdit(key, record)}
																					placeholder={undefined}
																					onPointerEnterCapture={undefined}
																					onPointerLeaveCapture={undefined}
																					className="flex items-center gap-2"
																				>
																					<Edit2 className="w-4 h-4" />
																				</Button>
																			)
																		)}
																					</div>
																				</td>
																			)}
																		</tr>
																	);
																})}
															</tbody>
														</table>
													</div>

													{canEditAttendance && (
														<div className="flex flex-wrap gap-2 justify-end mt-3">
															<Button
																size="sm"
																color="blue"
																variant="outlined"
																onClick={() =>
																	handleMarkAllPresent(session)
																}
																disabled={isSessionSaving}
																placeholder={undefined}
																onPointerEnterCapture={undefined}
																onPointerLeaveCapture={undefined}
																className="flex items-center gap-2"
															>
																<CheckCheck className="w-4 h-4" />
																Marcar todos como {presenteStatusName}
															</Button>
															<Button
																size="sm"
																color="green"
																onClick={() => handleSaveSession(session)}
																disabled={isSessionSaving}
																placeholder={undefined}
																onPointerEnterCapture={undefined}
																onPointerLeaveCapture={undefined}
																className="flex items-center gap-2"
															>
																<Save className="w-4 h-4" />
																{isSessionSaving
																	? 'Guardando...'
																	: 'Guardar todo'}
															</Button>
														</div>
													)}
												</AccordionBody>
											</Accordion>
										);
									})}
							</div>
						</div>
					)}
				</CardBody>
			</Card>

			<Card
				placeholder={undefined}
				onPointerEnterCapture={undefined}
				onPointerLeaveCapture={undefined}
			>
				<Accordion
					open={historyOpen}
					placeholder={undefined}
					onPointerEnterCapture={undefined}
					onPointerLeaveCapture={undefined}
				>
					<AccordionHeader
						onClick={() => setHistoryOpen((prev) => !prev)}
						placeholder={undefined}
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
					>
						<div className="flex items-center gap-2">
							<History className="w-5 h-5" />
							Registro de Asistencia ({historyTotal})
						</div>
					</AccordionHeader>
					<AccordionBody>
						{historyRows.length === 0 ? (
							<Typography
								color="gray"
								placeholder={undefined}
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
							>
								No hay registros de asistencia
							</Typography>
						) : (
							<div className="overflow-x-auto">
								<table className="w-full">
									<thead>
										<tr>
											<th className="border-b border-blue-gray-100 bg-blue-gray-50 py-3 px-4 text-left">
												<Typography
													variant="small"
													color="blue-gray"
													className="font-bold"
													placeholder={undefined}
													onPointerEnterCapture={undefined}
													onPointerLeaveCapture={undefined}
												>
													Fecha
												</Typography>
											</th>
											<th className="border-b border-blue-gray-100 bg-blue-gray-50 py-3 px-4 text-left">
												<Typography
													variant="small"
													color="blue-gray"
													className="font-bold"
													placeholder={undefined}
													onPointerEnterCapture={undefined}
													onPointerLeaveCapture={undefined}
												>
													{ordinalNoun(course)}
												</Typography>
											</th>
											<th className="border-b border-blue-gray-100 bg-blue-gray-50 py-3 px-4 text-left">
												<Typography
													variant="small"
													color="blue-gray"
													className="font-bold"
													placeholder={undefined}
													onPointerEnterCapture={undefined}
													onPointerLeaveCapture={undefined}
												>
													Alumno
												</Typography>
											</th>
											<th className="border-b border-blue-gray-100 bg-blue-gray-50 py-3 px-4 text-left">
												<Typography
													variant="small"
													color="blue-gray"
													className="font-bold"
													placeholder={undefined}
													onPointerEnterCapture={undefined}
													onPointerLeaveCapture={undefined}
												>
													Código
												</Typography>
											</th>
											<th className="border-b border-blue-gray-100 bg-blue-gray-50 py-3 px-4 text-center">
												<Typography
													variant="small"
													color="blue-gray"
													className="font-bold"
													placeholder={undefined}
													onPointerEnterCapture={undefined}
													onPointerLeaveCapture={undefined}
												>
													Estado
												</Typography>
											</th>
											<th className="border-b border-blue-gray-100 bg-blue-gray-50 py-3 px-4 text-left">
												<Typography
													variant="small"
													color="blue-gray"
													className="font-bold"
													placeholder={undefined}
													onPointerEnterCapture={undefined}
													onPointerLeaveCapture={undefined}
												>
													Comentarios
												</Typography>
											</th>
										</tr>
									</thead>
									<tbody>
										{historyRows.map((a) => {
											const student = rosterById.get(
												courseStudentIdOf(a) ?? -1,
											);
											return (
												<tr
													key={a.id}
													className="hover:bg-blue-gray-50/50 transition-colors"
												>
													<td className="py-3 px-4 border-b border-blue-gray-50 text-sm">
														{moment(a.date).format('DD/MM/YYYY')}
													</td>
													<td className="py-3 px-4 border-b border-blue-gray-50 text-sm font-medium">
														{ordinalLabel(course, a.day ?? 0)}
													</td>
													<td className="py-3 px-4 border-b border-blue-gray-50 text-sm">
														{student?.name ?? '-'}
													</td>
													<td className="py-3 px-4 border-b border-blue-gray-50 text-sm text-gray-500">
														{student?.code ?? a.course_student?.code ?? '-'}
													</td>
													<td className="py-3 px-4 border-b border-blue-gray-50 text-center">
														<span
															className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
																a.attendance_status?.name,
															)}`}
														>
															{a.attendance_status?.name ?? '-'}
														</span>
													</td>
													<td className="py-3 px-4 border-b border-blue-gray-50 text-sm text-gray-500 max-w-[200px] truncate">
														{a.comments ?? '-'}
													</td>
												</tr>
											);
										})}
									</tbody>
								</table>
							</div>
						)}

						{historyPages > 1 && (
							<div className="flex flex-col items-center gap-2 mt-4">
								<Typography
									variant="small"
									color="gray"
									placeholder={undefined}
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
								>
									Página {historyPage} de {historyPages} ({historyTotal}{' '}
									registros)
								</Typography>
								<div className="flex items-center gap-2">
									<Button
										variant="text"
										className="flex items-center gap-2 rounded-full"
										onClick={() => setHistoryPage(historyPage - 1)}
										disabled={historyPage === 1}
										placeholder={undefined}
										onPointerEnterCapture={undefined}
										onPointerLeaveCapture={undefined}
									>
										<ChevronLeft strokeWidth={2} className="h-4 w-4" />
										Prev
									</Button>
									<Button
										variant="text"
										className="flex items-center gap-2 rounded-full"
										onClick={() => setHistoryPage(historyPage + 1)}
										disabled={historyPage === historyPages}
										placeholder={undefined}
										onPointerEnterCapture={undefined}
										onPointerLeaveCapture={undefined}
									>
										Sig
										<ChevronRight strokeWidth={2} className="h-4 w-4" />
									</Button>
								</div>
							</div>
						)}
					</AccordionBody>
				</Accordion>
			</Card>
		</div>
	);
};

export default InstructorAttendanceTab;
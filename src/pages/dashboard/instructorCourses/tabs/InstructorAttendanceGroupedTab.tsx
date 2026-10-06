import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
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
import { Calendar, CheckCheck, Clock, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { AppDispatch, RootState } from '../../../../store';
import {
	createAttendance,
	fetchAttendanceStatuses,
	updateAttendance,
} from '../../../../features/attendanceSlice';
import {
	AttendanceGroupedItem,
	AttendanceItem,
	courseIdOfGrouped,
	fetchAttendanceGrouped,
	ScheduleGroupedItem,
	ScheduleItem,
} from '../../../../features/instructorSlice';
import { course } from '../../../../types/utilities';
import {
	ordinalLabel,
	ordinalNoun,
	ProgramCourse,
	usesSessions,
} from '../../../../utils/programSize';
import { PermissionsValidate } from '../../../../services/permissionsValidate';
import {
	courseTitle,
	draftKeyOf,
	pilotName,
} from './instructorShared';

const DEFAULT_ATTENDANCE_STATUS = 1;

type AttendanceDraft = {
	attendance_status_id: number;
	comments: string;
};

/**
 * Sesión del piloto con su formulario de marcado. `record` viene presente
 * cuando la asistencia ya está registrada: el formulario se abre igual para
 * poder corregirla, solo cambia que el guardado hace `update` en vez de `create`.
 */
type MarkableSession = {
	key: string;
	date: string;
	day: number;
	hours: string[];
	subjectNames: string[];
	record?: AttendanceItem;
};

/**
 * El ordinal de un horario vive en `subject_day.day` para los dos tipos de
 * curso (`viewCourseStudentSchedule` lo resuelve igual). `subject_lesson_days`
 * queda como tolerancia por si el backend lo agrega.
 */
const ordinalOfSchedule = (
	schedule: ScheduleItem,
): number | undefined =>
	schedule.subject_day?.day ?? schedule.subject_lesson_days?.day;

const InstructorAttendanceGroupedTab = ({
	instructor_id,
	attendance,
	schedules,
	courses,
	courseId,
}: {
	instructor_id: number;
	attendance: AttendanceGroupedItem[];
	schedules: ScheduleGroupedItem[];
	courses: course[];
	courseId?: number;
}) => {
	const dispatch = useDispatch<AppDispatch>();
	const canEditAttendance = PermissionsValidate(['instructor']);
	const statusList = useSelector(
		(state: RootState) =>
			state.attendance.attendanceStatusList as {
				id: number;
				name: string;
				description?: string | null;
			}[],
	);

	/**
	 * `attendance/grouped` no viene con el include de `attendance_status`, así que
	 * el nombre se resuelve contra la lista de estados por `attendance_status_id`.
	 */
	const statusOf = useCallback(
		(record: AttendanceItem | undefined) =>
			record?.attendance_status ??
			statusList.find((s) => s.id === record?.attendance_status_id) ??
			null,
		[statusList],
	);

	const [drafts, setDrafts] = useState<
		Record<string, AttendanceDraft>
	>({});
	const [savingKey, setSavingKey] = useState<string | null>(null);

	/**
	 * `attendanceStatusList` arranca vacío y solo lo llenan las páginas que
	 * despachan `fetchAttendanceStatuses` (la de referencia y la pestaña
	 * anterior). Sin esto el `Select` de estado se abre sin opciones.
	 */
	useEffect(() => {
		if (statusList.length === 0) dispatch(fetchAttendanceStatuses());
	}, [dispatch, statusList.length]);

	const presenteStatus = statusList.find(
		(status) => status.name.trim().toLowerCase() === 'presente',
	);
	const presenteStatusId =
		presenteStatus?.id ?? DEFAULT_ATTENDANCE_STATUS;

	/**
	 * `course_id` a nivel de fila es la fuente primaria. El cruce con
	 * `schedule/grouped` queda como respaldo para cuando el backend todavía no
	 * expone ese campo.
	 */
	const courseIdByStudent = useMemo(() => {
		const map: Record<number, number> = {};
		(schedules ?? []).forEach((item) => {
			const id = courseIdOfGrouped(item);
			if (id != null) map[item.course_student_id] = id;
		});
		return map;
	}, [schedules]);

	const schedulesByStudent = useMemo(() => {
		const map = new Map<number, ScheduleItem[]>();
		(schedules ?? []).forEach((item) => {
			const list = map.get(item.course_student_id);
			if (list) list.push(...(item.schedules ?? []));
			else
				map.set(item.course_student_id, [...(item.schedules ?? [])]);
		});
		return map;
	}, [schedules]);

	const catalog = useMemo(
		() =>
			courses.reduce((acc, item) => {
				if (item?.id != null) acc.set(item.id, item);
				return acc;
			}, new Map<number, course>()),
		[courses],
	);

	/** Curso de un piloto: campo plano de la fila y, si no viene, el mapa de cronogramas. */
	const courseIdOfPilot = useMemo(
		() =>
			(item: AttendanceGroupedItem): number | null =>
				courseIdOfGrouped(item) ??
				courseIdByStudent[item.course_student_id] ??
				null,
		[courseIdByStudent],
	);

	/**
	 * Los cursos teóricos (`course_type.id === 2`) no registran asistencia, es la
	 * misma regla de `viewCourseStudentSchedule.tsx`. El tipo se lee del `course`
	 * que trae la propia fila agrupada: el catálogo de `fetchCourses()` no
	 * siempre incluye `course_type`, así que consultarlo dejaba pasar los
	 * teóricos. Si la fila no trae `course`, no se descarta nada.
	 */
	const isTheoreticalPilot = (item: AttendanceGroupedItem) =>
		item.course?.course_type?.id === 2;

	/**
	 * TEMPORAL: muestra qué devuelve `attendance/grouped` dentro de cada
	 * `attendances[]`, para ver si trae `attendance_status_id` y `comments` o si
	 * el guardado no está llegando al backend.
	 */
	useEffect(() => {
		(attendance ?? []).slice(0, 2).forEach((item) => {
			console.log(
				`[asistencia] course_student_id=${item.course_student_id}`,
				JSON.stringify(item.attendances?.[0] ?? null, null, 2),
			);
		});
	}, [attendance]);

	const filtered = useMemo(() => {
		const withCourse = (attendance ?? []).filter(
			(item) =>
				courseIdOfPilot(item) != null && !isTheoreticalPilot(item),
		);
		if (!courseId) return withCourse;
		return withCourse.filter(
			(item) => courseIdOfPilot(item) === courseId,
		);
	}, [attendance, courseId, courseIdOfPilot]);

	/**
	 * Las sesiones se derivan de `schedule/grouped`, no de `schedulesDates`, porque
	 * `attendance/grouped` solo devuelve fechas sin ordinal y el alta exige `day`
	 * (`viewCourseStudentSchedule` resuelve el ordinal igual, desde `subject_day`).
	 *
	 * Se incluyen **todas** las sesiones, no solo las pendientes: una ya marcada
	 * también necesita formulario para poder corregirla. Los registros huérfanos
	 * (con asistencia pero sin horario que los respalde) se agregan igual para
	 * que no queden fuera de alcance.
	 */
	const sessionsByPilot = useMemo(() => {
		const map = new Map<number, MarkableSession[]>();

		filtered.forEach((item) => {
			const pilotId = item.course_student_id;
			const rows = schedulesByStudent.get(pilotId) ?? [];
			const byKey = new Map<string, MarkableSession>();

			const add = (
				key: string,
				date: string,
				day: number,
				hour?: string,
				subject?: string,
			) => {
				const existing = byKey.get(key);
				if (existing) {
					if (hour && !existing.hours.includes(hour)) {
						existing.hours.push(hour);
					}
					if (subject && !existing.subjectNames.includes(subject)) {
						existing.subjectNames.push(subject);
					}
				} else {
					byKey.set(key, {
						key,
						date,
						day,
						hours: hour ? [hour] : [],
						subjectNames: subject ? [subject] : [],
					});
				}
			};

			rows.forEach((row) => {
				const day = ordinalOfSchedule(row);
				// Sin ordinal no hay forma de enviar el alta, porque `day` es
				// obligatorio: la fila se omite en lugar de mandar un `day` falso.
				if (day === undefined) return;
				add(
					draftKeyOf(pilotId, row.date, day),
					row.date,
					day,
					row.hour,
					row.subject?.name ?? row.subject_name,
				);
			});

			(item.attendances ?? []).forEach((record) => {
				const key = draftKeyOf(pilotId, record.date, record.day);
				const existing = byKey.get(key);
				if (existing) existing.record = record;
				else
					byKey.set(key, {
						key,
						date: record.date,
						day: record.day,
						hours: [],
						subjectNames: [],
						record,
					});
			});

			const list = [...byKey.values()].sort(
				(a, b) => a.day - b.day || a.date.localeCompare(b.date),
			);
			if (list.length > 0) map.set(pilotId, list);
		});

		return map;
	}, [filtered, schedulesByStudent]);

	const totalPending = useMemo(
		() =>
			[...sessionsByPilot.values()].reduce(
				(total, list) =>
					total + list.filter((session) => !session.record).length,
				0,
			),
		[sessionsByPilot],
	);

	/**
	 * Se abre por defecto la primera sesión pendiente de cada piloto; si no hay
	 * ninguna, la primera en general, para que la pestaña nunca arranque vacía.
	 */
	const [openKeys, setOpenKeys] = useState<string[]>(() => {
		const first: string[] = [];
		sessionsByPilot.forEach((list) => {
			const key = (list.find((s) => !s.record) ?? list[0])?.key;
			if (key) first.push(key);
		});
		return first;
	});

	const toggleSession = useCallback((key: string) => {
		setOpenKeys((prev) =>
			prev.includes(key)
				? prev.filter((k) => k !== key)
				: [...prev, key],
		);
	}, []);

	const getDraft = useCallback(
		(session: MarkableSession): AttendanceDraft =>
			drafts[session.key] ?? {
				attendance_status_id:
					session.record?.attendance_status_id ?? presenteStatusId,
				comments: session.record?.comments ?? '',
			},
		[drafts, presenteStatusId],
	);

	const setDraft = useCallback(
		(key: string, patch: Partial<AttendanceDraft>) => {
			setDrafts((prev) => {
				const base = prev[key];
				return {
					...prev,
					[key]: {
						attendance_status_id:
							base?.attendance_status_id ?? presenteStatusId,
						comments: base?.comments ?? '',
						...patch,
					},
				};
			});
		},
		[presenteStatusId],
	);

	const ordinalPayload = (
		program: ProgramCourse | null,
		day: number,
	): { day: number; session_number?: number } =>
		usesSessions(program) ? { day, session_number: day } : { day };

	const handleSave = async (
		item: AttendanceGroupedItem,
		session: MarkableSession,
		program: ProgramCourse | null,
	) => {
		setSavingKey(session.key);
		try {
			const draft = getDraft(session);
			const recordId =
				session.record?.id ?? session.record?.attendance_id;

			const payload = {
				id: recordId,
				course_student_id: item.course_student_id,
				date: session.date,
				attendance_status_id: draft.attendance_status_id,
				comments: draft.comments,
				...ordinalPayload(program, session.day),
			};
			console.log('[guardar] payload', JSON.stringify(payload));

			const respuesta =
				recordId != null
					? await dispatch(
							updateAttendance({
								id: recordId,
								course_student_id: item.course_student_id,
								date: session.date,
								attendance_status_id: draft.attendance_status_id,
								comments: draft.comments,
								...ordinalPayload(program, session.day),
							}),
						).unwrap()
					: await dispatch(
							createAttendance({
								course_student_id: item.course_student_id,
								date: session.date,
								attendance_status_id: draft.attendance_status_id,
								comments: draft.comments,
								...ordinalPayload(program, session.day),
							}),
						).unwrap();

			console.log('[guardar] respuesta', JSON.stringify(respuesta));

			toast.success(
				recordId != null
					? 'Asistencia actualizada'
					: 'Asistencia guardada',
			);
			/**
			 * El borrador NO se limpia al guardar: `attendance/grouped` no
			 * devuelve `attendance_status_id` ni `comments`, así que si se
			 * limpiara el formulario volvería al default ("Presente", sin
			 * comentarios) y parecería que el guardado no aplicó.
			 */
			await dispatch(fetchAttendanceGrouped({ instructor_id }));
		} catch (error: any) {
			toast.error(error?.message || 'Error al guardar asistencia');
		} finally {
			setSavingKey(null);
		}
	};

	const handleMarkPresent = (key: string) => {
		setDrafts((prev) => ({
			...prev,
			[key]: {
				attendance_status_id: presenteStatusId,
				comments: prev[key]?.comments ?? '',
			},
		}));
	};

	if (!filtered.length) {
		return (
			<Typography
				placeholder={undefined}
				onPointerEnterCapture={undefined}
				onPointerLeaveCapture={undefined}
				className="py-8 text-center text-blue-gray-500"
			>
				No hay pilotos con asistencia
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
					{filtered.length} pilotos
					{totalPending > 0 ? ` · ${totalPending} sin marcar` : ''}
				</Typography>

				{filtered.map((item) => {
					const courseOfPilot = catalog.get(
						courseIdOfPilot(item) ?? -1,
					);
					const program = courseOfPilot ?? null;
					const sessions =
						sessionsByPilot.get(item.course_student_id) ?? [];

					return (
						<div
							key={item.course_student_id}
							className="rounded-lg border border-blue-gray-100"
						>
							<div className="flex flex-wrap items-center justify-between gap-2 border-b border-blue-gray-100 bg-blue-gray-50 px-4 py-2">
								<span className="font-semibold text-blue-gray-900">
									{pilotName(item) || 'Piloto'}
									{item.student?.status === false ? (
										<span className="ml-2 text-xs font-normal text-red-500">
											(inactivo)
										</span>
									) : null}
								</span>
								<span className="text-sm text-blue-gray-500">
									{courseOfPilot
										? courseTitle(
												courseOfPilot.id!,
												catalog,
												courseOfPilot,
											)
										: ''}
								</span>
							</div>

							{sessions.map((session) => {
								const draft = getDraft(session);
								console.log(session);
								const isSaving = savingKey === session.key;

								return (
									<Accordion
										key={session.key}
										open={openKeys.includes(session.key)}
										className="rounded-none border-0 border-b border-blue-gray-50"
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
											<div className="flex w-full flex-col items-start justify-between gap-2 pr-2 sm:flex-row sm:items-center">
												<div className="flex flex-wrap items-center gap-3">
													<Calendar className="h-4 w-4 text-blue-500" />
													<Typography
														variant="small"
														color="blue-gray"
														placeholder={undefined}
														onPointerEnterCapture={undefined}
														onPointerLeaveCapture={undefined}
													>
														{session.date}
													</Typography>
													<span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
														{ordinalLabel(program, session.day)}
													</span>
													{session.hours.length > 0 ? (
														<div className="flex items-center gap-1 text-sm text-blue-gray-500">
															<Clock className="h-4 w-4 text-orange-500" />
															{session.hours.join(' - ')}
														</div>
													) : null}
												</div>
												{session.record ? (
													<span className="flex flex-wrap items-center gap-2 text-xs">
														<span className="font-medium text-green-700">
															{statusOf(session.record)?.name ??
																'Marcado'}
														</span>
														{session.record.comments ? (
															<span className="text-blue-gray-500">
																{session.record.comments}
															</span>
														) : null}
														{session.record.attendance_signature
															?.signature_url ? (
															<a
																href={
																	session.record.attendance_signature
																		.signature_url
																}
																target="_blank"
																rel="noreferrer"
																className="text-blue-600 underline"
															>
																Firma
															</a>
														) : null}
													</span>
												) : (
													<span className="text-xs font-medium text-amber-600">
														Sin marcar
													</span>
												)}
											</div>
										</AccordionHeader>

										<AccordionBody className="px-4 py-3">
											{session.subjectNames.length > 0 ? (
												<div className="mb-3 flex flex-wrap gap-2">
													{session.subjectNames.map((name) => (
														<span
															key={name}
															className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-600"
														>
															{name}
														</span>
													))}
												</div>
											) : null}

											<div className="flex flex-col gap-3 sm:flex-row sm:items-start">
												<div className="sm:w-56">
													{/*
													 * El `Select` de MT guarda las opciones en un ref que
													 * se inicializa solo en el primer render (`useRef` sobre
													 * `children`). Si se monta sin opciones, ese ref queda
													 * vacío para siempre, `indexOf(value)` da -1 y el botón
													 * muestra `children[-1]`, o sea nada: por eso había que
													 * elegir dos veces. Se espera a que la lista llegue.
													 */}
													{statusList.length > 0 ? (
														<Select
															label="Estado"
															value={draft.attendance_status_id.toString()}
															onChange={(value) =>
																value &&
																setDraft(session.key, {
																	attendance_status_id:
																		parseInt(value),
																})
															}
															disabled={
																!canEditAttendance || isSaving
															}
															placeholder={undefined}
															onPointerEnterCapture={undefined}
															onPointerLeaveCapture={undefined}
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
														<div className="flex h-10 items-center text-sm text-blue-gray-400">
															Cargando estados...
														</div>
													)}
												</div>

												<div className="flex-1">
													<Textarea
														label="Comentarios"
														value={draft.comments}
														onChange={(e) => {
															console.log(
																'[comentarios]',
																session.key,
																JSON.stringify(e.target.value),
															);
															setDraft(session.key, {
																comments: e.target.value,
															});
														}}
														disabled={!canEditAttendance || isSaving}
														rows={2}
														placeholder={undefined}
														onPointerEnterCapture={undefined}
														onPointerLeaveCapture={undefined}
													/>
												</div>
											</div>

											{canEditAttendance ? (
												<div className="mt-3 flex flex-wrap justify-end gap-2">
													<Button
														size="sm"
														variant="outlined"
														color="blue-gray"
														disabled={isSaving}
														onClick={() =>
															handleMarkPresent(session.key)
														}
														placeholder={undefined}
														onPointerEnterCapture={undefined}
														onPointerLeaveCapture={undefined}
													>
														<CheckCheck className="mr-1 h-4 w-4" />
														Marcar presente
													</Button>
													<Button
														size="sm"
														color="blue"
														disabled={isSaving}
														onClick={() =>
															handleSave(item, session, program)
														}
														placeholder={undefined}
														onPointerEnterCapture={undefined}
														onPointerLeaveCapture={undefined}
													>
														<Save className="mr-1 h-4 w-4" />
														{isSaving ? 'Guardando...' : 'Guardar'}
													</Button>
												</div>
											) : null}
										</AccordionBody>
									</Accordion>
								);
							})}

							{sessions.length === 0 ? (
								<p className="px-4 py-3 text-sm text-blue-gray-500">
									Sin {ordinalNoun(program).toLowerCase()}s ni
									asistencias registradas
								</p>
							) : null}
						</div>
					);
				})}
			</CardBody>
		</Card>
	);
};

export default InstructorAttendanceGroupedTab;

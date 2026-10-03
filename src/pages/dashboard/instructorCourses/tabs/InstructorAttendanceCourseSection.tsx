import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../../store';
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
import { course } from '../../../../types/utilities';
import { ordinalLabel, ordinalNoun, usesSessions } from '../../../../utils/programSize';
import {
	createAttendance,
	updateAttendance,
} from '../../../../features/attendanceSlice';
import { PermissionsValidate } from '../../../../services/permissionsValidate';
import {
	courseStudentIdOfAttendance,
	draftKeyOf,
	type InstructorAttendanceItem,
	type InstructorRosterStudent,
	type InstructorSession,
} from './instructorShared';

const DEFAULT_ATTENDANCE_STATUS = 1;
const HISTORY_PAGE_SIZE = 15;

type Props = {
	courseId: number;
	course?: course | null;
	sessions: InstructorSession[];
	roster: InstructorRosterStudent[];
	attendances: InstructorAttendanceItem[];
	onSaved: () => Promise<void> | void;
};

type AttendanceDraft = {
	attendance_status_id: number;
	comments: string;
};

export type AttendanceStatus = {
	id: number;
	name: string;
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
	statusList: AttendanceStatus[],
	statusId: number | undefined,
) => getStatusColor(statusList.find((s) => s.id === statusId)?.name);

/**
 * Cada curso del instructor se dibuja como una sección independiente: el
 * ordinal (día o sesión), el programa y el roster son por curso, así que una
 * sola tabla mezclando cursos marcaría la sesión equivocada.
 */
const InstructorAttendanceCourseSection = ({
	courseId,
	course,
	sessions,
	roster,
	attendances,
	onSaved,
}: Props) => {
	const dispatch = useDispatch<AppDispatch>();
	const canEditAttendance = PermissionsValidate(['instructor']);
	const statusList = useSelector(
		(state: RootState) => state.attendance.attendanceStatusList as AttendanceStatus[],
	);

	const [drafts, setDrafts] = useState<Record<string, AttendanceDraft>>({});
	const [editingKey, setEditingKey] = useState<string | null>(null);
	const [savingKey, setSavingKey] = useState<string | null>(null);
	const [historyPage, setHistoryPage] = useState(1);

	const presenteStatus = statusList.find(
		(s) => s.name.trim().toLowerCase() === 'presente',
	);
	const presenteStatusId = presenteStatus?.id ?? DEFAULT_ATTENDANCE_STATUS;
	const presenteStatusName = presenteStatus?.name ?? 'Presente';

	const rosterIds = useMemo(
		() => new Set(roster.map((r) => r.id)),
		[roster],
	);

	const rosterAttendances = useMemo(() => {
		if (rosterIds.size === 0) return [];
		return attendances.filter((a) => {
			const id = courseStudentIdOfAttendance(a);
			return id !== undefined && rosterIds.has(id);
		});
	}, [attendances, rosterIds]);

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

	const findAttendance = useCallback(
		(
			courseStudentId: number,
			date: string,
			day: number,
		): InstructorAttendanceItem | undefined => {
			const dateStr = moment(date).format('YYYY-MM-DD');
			return rosterAttendances.find(
				(a) =>
					courseStudentIdOfAttendance(a) === courseStudentId &&
					moment(a.date).format('YYYY-MM-DD') === dateStr &&
					a.day === day,
			);
		},
		[rosterAttendances],
	);

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

	/**
	 * Se abre por defecto la sesión de hoy y, si no hay, la primera pendiente.
	 * La clave de sesión ya incluye el curso, así que el estado es local.
	 */
	const [openSessions, setOpenSessions] = useState<string[]>(() => {
		const today = moment().format('YYYY-MM-DD');
		const preferred =
			sessions.find((s) => moment(s.date).format('YYYY-MM-DD') === today) ??
			sessions[0];
		return preferred ? [preferred.key] : [];
	});

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
	const ordinalPayload = (
		day: number,
	): { day: number; session_number?: number } =>
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
			await onSaved();
			clearDraft(key);
			setEditingKey(null);
		} catch (err: any) {
			toast.error(err?.message || 'Error al guardar asistencia');
		} finally {
			setSavingKey(null);
		}
	};

	const handleSaveSession = async (session: InstructorSession) => {
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
			await onSaved();
			pending.forEach(({ key }) => clearDraft(key));
			setEditingKey(null);
		} catch (err: any) {
			toast.error(err?.message || 'Error al guardar asistencia');
		} finally {
			setSavingKey(null);
		}
	};

	const handleMarkAllPresent = (session: InstructorSession) => {
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

	const handleEdit = (key: string, record: InstructorAttendanceItem) => {
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
					className="mb-1"
					placeholder={undefined}
					onPointerEnterCapture={undefined}
					onPointerLeaveCapture={undefined}
				>
					{course?.name ?? `Curso #${courseId}`}
				</Typography>
				<Typography
					variant="small"
					color="gray"
					className="mb-4"
					placeholder={undefined}
					onPointerEnterCapture={undefined}
					onPointerLeaveCapture={undefined}
				>
					{roster.length} alumnos · {sessions.length}{' '}
					{sessions.length === 1 ? 'sesión programada' : 'sesiones programadas'}
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
														onPointerEnterCapture={
															undefined
														}
														onPointerLeaveCapture={
															undefined
														}
													>
														{moment(session.date).format(
															'DD/MM/YYYY',
														)}
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
																onPointerEnterCapture={
																	undefined
																}
																onPointerLeaveCapture={
																	undefined
																}
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
													onPointerEnterCapture={
														undefined
													}
													onPointerLeaveCapture={
														undefined
													}
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
																						attendance_status_id:
																							parseInt(val),
																					})
																				}
																				placeholder={undefined}
																				onPointerEnterCapture={
																					undefined
																				}
																				onPointerLeaveCapture={
																					undefined
																				}
																				labelProps={{
																					placeholder:
																						undefined,
																					onPointerEnterCapture:
																						undefined,
																					onPointerLeaveCapture:
																						undefined,
																				}}
																			>
																				{statusList.map(
																					(status) => (
																						<Option
																							key={
																								status.id
																							}
																							value={status.id.toString()}
																						>
																							{status.name}
																						</Option>
																					),
																				)}
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
																							(s) =>
																								s.id ===
																								record.attendance_status_id,
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
																						comments:
																							e.target.value,
																					})
																				}
																				rows={2}
																				placeholder={undefined}
																				onPointerEnterCapture={
																					undefined
																				}
																				onPointerLeaveCapture={
																					undefined
																				}
																				labelProps={{
																					placeholder:
																						undefined,
																					onPointerEnterCapture:
																						undefined,
																					onPointerLeaveCapture:
																						undefined,
																				}}
																			/>
																		) : (
																			<Typography
																				variant="small"
																				className="italic text-gray-600"
																				placeholder={undefined}
																				onPointerEnterCapture={
																					undefined
																				}
																				onPointerLeaveCapture={
																					undefined
																				}
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
																							onPointerEnterCapture={
																								undefined
																							}
																							onPointerLeaveCapture={
																								undefined
																							}
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
																								onClick={() =>
																									handleCancel(key)
																								}
																								placeholder={undefined}
																								onPointerEnterCapture={
																									undefined
																								}
																								onPointerLeaveCapture={
																									undefined
																								}
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
																							onClick={() =>
																								handleEdit(key, record)
																							}
																							placeholder={undefined}
																							onPointerEnterCapture={
																								undefined
																							}
																							onPointerLeaveCapture={
																								undefined
																							}
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
														onPointerEnterCapture={
															undefined
														}
														onPointerLeaveCapture={
															undefined
														}
														className="flex items-center gap-2"
													>
														<CheckCheck className="w-4 h-4" />
														Marcar todos como {presenteStatusName}
													</Button>
													<Button
														size="sm"
														color="green"
														onClick={() =>
															handleSaveSession(session)
														}
														disabled={isSessionSaving}
														placeholder={undefined}
														onPointerEnterCapture={
															undefined
														}
														onPointerLeaveCapture={
															undefined
														}
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

			<Accordion
				open
				placeholder={undefined}
				onPointerEnterCapture={undefined}
				onPointerLeaveCapture={undefined}
			>
				<AccordionHeader
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
												onPointerEnterCapture={
													undefined
												}
												onPointerLeaveCapture={
													undefined
												}
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
												onPointerEnterCapture={
													undefined
												}
												onPointerLeaveCapture={
													undefined
												}
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
												onPointerEnterCapture={
													undefined
												}
												onPointerLeaveCapture={
													undefined
												}
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
												onPointerEnterCapture={
													undefined
												}
												onPointerLeaveCapture={
													undefined
												}
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
												onPointerEnterCapture={
													undefined
												}
												onPointerLeaveCapture={
													undefined
												}
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
												onPointerEnterCapture={
													undefined
												}
												onPointerLeaveCapture={
													undefined
												}
											>
												Comentarios
											</Typography>
										</th>
									</tr>
								</thead>
								<tbody>
									{historyRows.map((a) => {
										const student = rosterById.get(
											courseStudentIdOfAttendance(a) ?? -1,
										);
										return (
											<tr
												key={a.id}
												className="hover:bg-blue-gray-50/50 transition-colors"
											>
												<td className="py-3 px-4 border-b border-blue-gray-50 text-sm">
													{moment(a.date).format(
														'DD/MM/YYYY',
													)}
												</td>
												<td className="py-3 px-4 border-b border-blue-gray-50 text-sm font-medium">
													{ordinalLabel(course, a.day ?? 0)}
												</td>
												<td className="py-3 px-4 border-b border-blue-gray-50 text-sm">
													{student?.name ?? '-'}
												</td>
												<td className="py-3 px-4 border-b border-blue-gray-50 text-sm text-gray-500">
													{student?.code ??
														a.course_student?.code ??
														'-'}
												</td>
												<td className="py-3 px-4 border-b border-blue-gray-50 text-center">
													<span
														className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
															a.attendance_status?.name,
														)}`}
													>
														{a.attendance_status
															?.name ?? '-'}
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
								Página {historyPage} de {historyPages} (
								{historyTotal} registros)
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
	);
};

export default InstructorAttendanceCourseSection;

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
import { useEffect, useRef, useState } from 'react';
import {
	breadCrumbsItems,
	attendance,
} from '../../../types/utilities';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import { RootState, AppDispatch } from '../../../store';
import {
	fetchCourse,
	fetchCourseStudent,
	fetchSchedule,
} from '../../../features/courseSlice';
import { fetchSubjects } from '../../../features/subjectSlice';
import {
	fetchInstructors,
	fetchStudents,
} from '../../../features/userSlice';
import {
	fetchAttendanceByCourseStudent,
	fetchAttendanceStatuses,
	createAttendance,
	updateAttendance,
	saveAttendanceSignature,
	deleteAttendanceSignature,
} from '../../../features/attendanceSlice';
import PageTitle from '../../../components/PageTitle';
import LoadingPage from '../../../components/LoadingPage';
import ErrorPage from '../../../components/ErrorPage';
import { PermissionsValidate } from '../../../services/permissionsValidate';
import toast from 'react-hot-toast';
import moment from 'moment';
import {
	Calendar,
	Clock,
	Trash2,
	User,
	Edit2,
	Save,
	X,
} from 'lucide-react';
import { useParams } from 'react-router-dom';
import SignatureCanvas from 'react-signature-canvas';
import {
	ordinalLabel,
	ordinalNoun,
	ordinalNounPlural,
	programOrdinals,
	programSize,
	usesSessions,
} from '../../../utils/programSize';

const DEFAULT_ATTENDANCE_STATUS = 1;

/**
 * Cada card de asistencia tiene su propio borrador. Con N sesiones en la misma fecha
 * hay N cards, y un estado compartido haría que escribir en una escribiera en todas.
 */
type AttendanceDraft = {
	attendance_status_id: number;
	comments: string;
};

const emptyDraft = (): AttendanceDraft => ({
	attendance_status_id: DEFAULT_ATTENDANCE_STATUS,
	comments: '',
});

const breadCrumbs: breadCrumbsItems[] = [
	{
		name: 'Inicio',
		href: '/dashboard',
	},
	{
		name: 'Cursos',
		href: '/dashboard/courses',
	},
];

const AttendanceSignature = ({
	attendanceId,
	onSave,
	isSaving,
	disabled,
}: {
	attendanceId: number;
	onSave: (id: number, canvas: SignatureCanvas) => void;
	isSaving: boolean;
	disabled?: boolean;
}) => {
	const canvasRef = useRef<SignatureCanvas>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const [canvasWidth, setCanvasWidth] = useState(300);

	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;

		const observer = new ResizeObserver((entries) => {
			for (const entry of entries) {
				const width = Math.floor(entry.contentRect.width);
				if (width > 0) setCanvasWidth(width);
			}
		});

		observer.observe(container);
		return () => observer.disconnect();
	}, []);

	return (
		<div className="flex flex-col gap-2">
			<div
				ref={containerRef}
				className={`w-full overflow-hidden border border-gray-300 rounded ${disabled ? 'pointer-events-none opacity-50' : ''}`}
			>
				<SignatureCanvas
					ref={canvasRef}
					penColor="black"
					canvasProps={{
						width: canvasWidth,
						height: 120,
						style: {
							width: '100%',
							height: '120px',
							display: 'block',
						},
					}}
				/>
			</div>
			<Button
				size="sm"
				color="green"
				onClick={() => {
					if (canvasRef.current)
						onSave(attendanceId, canvasRef.current);
				}}
				disabled={isSaving || disabled}
				placeholder={undefined}
				onPointerEnterCapture={undefined}
				onPointerLeaveCapture={undefined}
				className="flex items-center gap-2 self-start"
			>
				<Save className="w-4 h-4" />
				{isSaving ? 'Guardando...' : 'Guardar Firma'}
			</Button>
		</div>
	);
};

const ViewCourseStudentSchedule = () => {
	const dispatch = useDispatch<AppDispatch>();
	const { id, course_id } = useParams<{
		id: string;
		course_id: string;
	}>();
	const canEditAttendance = PermissionsValidate(['staff']);
	const [openAccordions, setOpenAccordions] = useState<number[]>([1]);
	const [dataLoaded, setDataLoaded] = useState(false);
	const [drafts, setDrafts] = useState<Record<string, AttendanceDraft>>({});
	const [editingKey, setEditingKey] = useState<string | null>(null);
	const [isSaving, setIsSaving] = useState(false);
	const [savingSignatureId, setSavingSignatureId] = useState<
		number | null
	>(null);

	useEffect(() => {
		const loadData = async () => {
			const courseId = parseInt(course_id || '-1');
			const courseStudentId = parseInt(id || '-1');

			if (courseId > 0 && courseStudentId > 0) {
				await Promise.all([
					dispatch(
						fetchSubjects({
							course_id: courseId,
							status: true,
							is_schedulable: true,
						}),
					),
					dispatch(fetchCourse(courseId)),
					dispatch(fetchCourseStudent(courseStudentId)),
					dispatch(fetchInstructors({ status: true })),
					dispatch(fetchStudents({ status: true })),
					dispatch(fetchSchedule(courseStudentId)),
					dispatch(fetchAttendanceStatuses()),
					dispatch(fetchAttendanceByCourseStudent(courseStudentId)),
				]);
				setDataLoaded(true);
			}
		};

		loadData();
	}, [dispatch, id, course_id]);

	const { course, subject, user, attendance, auth } = useSelector(
		(state: RootState) => ({
			course: state.courses,
			subject: state.subjects,
			user: state.users,
			attendance: state.attendance,
			auth: state.auth,
		}),
		shallowEqual,
	);
	const canViewAttendance =
		course.courseSelected?.course_type?.id !== 2;

	const handleToggleAccordion = (accordionId: number) => {
		setOpenAccordions((prev) =>
			prev.includes(accordionId)
				? prev.filter((id) => id !== accordionId)
				: [...prev, accordionId],
		);
	};

	const isAccordionOpen = (accordionId: number) =>
		openAccordions.includes(accordionId);

	const studentFromCourse = course.courseStudent?.student;
	const studentFromList = studentFromCourse?.id
		? user.studentList.find(
				(p) => p.student?.id === studentFromCourse?.id,
			)
		: null;

	const getTypeTripLabel = (type: number | undefined) => {
		switch (type) {
			case 1:
				return 'PIC';
			case 2:
				return 'SIC';
			case 3:
				return 'SFI';
			case 4:
				return 'SFE';
			case 5:
				return 'PI';
			default:
				return '-';
		}
	};

	const getLicenseLabel = (license: number | undefined) => {
		switch (license) {
			case 1:
				return 'TLA';
			case 2:
				return 'Commercial';
			case 3:
				return 'Privado';
			case 4:
				return 'FANB';
			default:
				return '-';
		}
	};

	const getRegulationLabel = (regulation: number | undefined) => {
		switch (regulation) {
			case 1:
				return 'INAC';
			case 2:
				return 'No-INAC';
			default:
				return '-';
		}
	};

	const getInstructorName = (
		instructorId: number | null | undefined,
	) => {
		if (!instructorId) return 'No asignado';
		const instructor = user.instructorList.find(
			(i) => i.instructor?.id === instructorId,
		);
		if (!instructor) return 'No asignado';
		return `${instructor.name} ${instructor.last_name}`;
	};

	const getDayForSchedule = (schedule: {
		subject_day?: { day?: number };
		subject_days_id?: number;
	}) => {
		if (schedule?.subject_day?.day) return schedule.subject_day.day;
		const subjectDay = subject.subjectList
			.flatMap((s) => s.subject_days ?? [])
			.find((d) => d.id === schedule?.subject_days_id);
		return subjectDay?.day;
	};

	/**
	 * El ordinal del horario (día o sesión) vive en `attendance.day`, y varias
	 * asistencias pueden compartir fecha. Buscar solo por fecha devolvía siempre la
	 * sesión 1, así que guardar la sesión 3 pisaba la fila de la sesión 1.
	 */
	const getAttendanceForSession = (
		date: string,
		session: number | undefined,
	) => {
		const dateStr = moment(date).format('YYYY-MM-DD');
		const attendanceRecord = attendance.attendanceList?.find(
			(a) =>
				a.course_student_id === course.courseStudent?.id &&
				moment(a.date).format('YYYY-MM-DD') === dateStr &&
				(session === undefined ? true : a.day === session),
		);
		return attendanceRecord;
	};

	const getDraft = (draftKey: string): AttendanceDraft =>
		drafts[draftKey] ?? emptyDraft();

	const setDraft = (draftKey: string, patch: Partial<AttendanceDraft>) =>
		setDrafts((prev) => ({
			...prev,
			[draftKey]: { ...(prev[draftKey] ?? emptyDraft()), ...patch },
		}));

	const clearDraft = (draftKey: string) =>
		setDrafts((prev) => {
			if (!(draftKey in prev)) return prev;
			const next = { ...prev };
			delete next[draftKey];
			return next;
		});

	const getAttendanceStatusLabel = (statusId: number | undefined) => {
		const status = attendance.attendanceStatusList.find(
			(s) => s.id === statusId,
		);
		return status ? status.name : '-';
	};

	const getAttendanceStatusColor = (statusId: number | undefined) => {
		const statusName = attendance.attendanceStatusList
			.find((s) => s.id === statusId)
			?.name.toLowerCase();
		switch (statusName) {
			case 'presente':
				return 'text-green-700 bg-green-100';
			case 'ausente':
				return 'text-red-700 bg-red-100';
			case 'tarde':
				return 'text-orange-700 bg-orange-100';
			case 'excusado':
				return 'text-blue-700 bg-blue-100';
			default:
				return 'text-gray-700 bg-gray-100';
		}
	};

	/**
	 * `day` es obligatorio en el alta (el backend lo valida), y con cursos por
	 * sesiones se manda además `session_number` como alias: el repositorio
	 * resuelve `session_number ?? day` y guarda el ordinal en `attendance.day`.
	 */
	const ordinalPayload = (day: number): { day: number; session_number?: number } =>
		usesSessions(course.courseSelected)
			? { day, session_number: day }
			: { day };

	const handleSaveAttendance = async (
		scheduleDate: string,
		day: number | undefined,
		draftKey: string,
	) => {
		if (!course.courseStudent?.id) return;
		if (day === undefined) {
			toast.error(
				`No se pudo determinar el ${ordinalNoun(
					course.courseSelected,
				).toLowerCase()} del curso`,
			);
			return;
		}

		setIsSaving(true);
		const existingAttendance = getAttendanceForSession(scheduleDate, day);
		const draft = getDraft(draftKey);

		try {
			if (existingAttendance) {
				await dispatch(
					updateAttendance({
						id: existingAttendance.id,
						course_student_id: course.courseStudent.id,
						date: scheduleDate,
						attendance_status_id: draft.attendance_status_id,
						comments: draft.comments,
						...ordinalPayload(day),
					}),
				).unwrap();
				toast.success('Asistencia actualizada');
			} else {
				await dispatch(
					createAttendance({
						course_student_id: course.courseStudent.id,
						date: scheduleDate,
						attendance_status_id: draft.attendance_status_id,
						comments: draft.comments,
						...ordinalPayload(day),
					}),
				).unwrap();
				toast.success('Asistencia guardada');
			}

			if (course.courseStudent?.id) {
				await dispatch(
					fetchAttendanceByCourseStudent(course.courseStudent.id),
				);
			}

			setEditingKey(null);
			clearDraft(draftKey);
		} catch (error: any) {
			toast.error(error?.message || 'Error al guardar asistencia');
		} finally {
			setIsSaving(false);
		}
	};

	const handleEditAttendance = (
		attendanceRecord: attendance,
		draftKey: string,
	) => {
		setEditingKey(draftKey);
		setDraft(draftKey, {
			attendance_status_id: attendanceRecord.attendance_status_id,
			comments: attendanceRecord.comments || '',
		});
	};

	const handleCancelEdit = (draftKey: string) => {
		setEditingKey(null);
		clearDraft(draftKey);
	};

	const handleSaveSignature = async (
		attendanceId: number,
		canvas: SignatureCanvas,
	) => {
		if (canvas.isEmpty()) {
			toast.error('Dibuja una firma primero');
			return;
		}
		setSavingSignatureId(attendanceId);
		try {
			await dispatch(
				saveAttendanceSignature({
					attendance_id: attendanceId,
					signature: canvas.toDataURL(),
				}),
			).unwrap();
			toast.success('Firma guardada correctamente');
			canvas.clear();
			if (course.courseStudent?.id) {
				await dispatch(
					fetchAttendanceByCourseStudent(course.courseStudent.id),
				);
			}
		} catch {
			toast.error('Error al guardar la firma');
		} finally {
			setSavingSignatureId(null);
		}
	};

	const handleDeleteSignature = async (attendanceId: number) => {
		if (!confirm('¿Eliminar esta firma?')) return;
		try {
			await dispatch(
				deleteAttendanceSignature(attendanceId),
			).unwrap();
			toast.success('Firma eliminada');
			if (course.courseStudent?.id) {
				await dispatch(
					fetchAttendanceByCourseStudent(course.courseStudent.id),
				);
			}
		} catch (error: any) {
			toast.error(error?.message || 'Error al eliminar firma');
		}
	};

	const days = programOrdinals(course.courseSelected);

	/**
	 * Varias sesiones pueden compartir fecha, así que la clave es (fecha, ordinal).
	 * Con solo la fecha, las sesiones se colaban en la misma card y solo se
	 * guardaba la primera.
	 */
	const sessionKeyOf = (schedule: (typeof course.scheduleList)[number]) =>
		`${moment(schedule.date).format('YYYY-MM-DD')}#${getDayForSchedule(schedule) ?? 0}`;

	// Agrupar schedules por fecha + ordinal. El backend ya devuelve date/hour ASC,
	// así que no se reordena acá.
	const schedulesBySession = course.scheduleList.reduce<
		Record<string, typeof course.scheduleList>
	>((acc, schedule) => {
		const key = sessionKeyOf(schedule);
		if (!acc[key]) acc[key] = [];
		acc[key].push(schedule);
		return acc;
	}, {});

	if (course.status === 'loading' || !dataLoaded)
		return <LoadingPage />;
	if (course.status === 'failed')
		return <ErrorPage error={course.error || 'Indefinido'} />;

	return (
		<div className="content-center px-2 sm:px-4">
			<PageTitle
				title={`${course.courseSelected?.name} ${course.courseSelected?.course_level.name}`}
				breadCrumbs={breadCrumbs}
			/>

			<Card
				placeholder={undefined}
				onPointerEnterCapture={undefined}
				onPointerLeaveCapture={undefined}
			>
				<CardBody
					className="p-2 sm:p-4"
					placeholder={undefined}
					onPointerEnterCapture={undefined}
					onPointerLeaveCapture={undefined}
				>
					<div className="bg-blue-100 rounded-md p-2 sm:p-4 mb-2 sm:mb-4">
						<Typography
							variant="h6"
							className="text-sm sm:text-base"
							placeholder={undefined}
							onPointerEnterCapture={undefined}
							onPointerLeaveCapture={undefined}
						>
							{course.courseSelected?.name}{' '}
							{course.courseSelected?.course_level.name}
						</Typography>
						<Typography
							variant="small"
							className="text-xs sm:text-sm"
							placeholder={undefined}
							onPointerEnterCapture={undefined}
							onPointerLeaveCapture={undefined}
						>
							{course.courseSelected?.description}
						</Typography>

						<Typography
							variant="small"
							className="text-xs sm:text-sm"
							placeholder={undefined}
							onPointerEnterCapture={undefined}
							onPointerLeaveCapture={undefined}
						>
							PC: {course.courseStudent?.student?.user_id}
						</Typography>
					</div>

					<hr className="my-4" />

					<div className="grid grid-cols-1 lg:grid-cols-7 gap-4 py-2">
						<div className="lg:col-span-3">
							<Typography
								variant="h6"
								className="mb-3 text-blue-gray-800"
								placeholder={undefined}
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
							>
								Información del Piloto
							</Typography>

							{(studentFromCourse || studentFromList) && (
								<div className="space-y-3">
									<div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
										<User className="w-5 h-5 text-blue-500" />
										<div>
											<Typography
												variant="small"
												className="font-bold text-gray-600"
												placeholder={undefined}
												onPointerEnterCapture={undefined}
												onPointerLeaveCapture={undefined}
											>
												Nombre
											</Typography>
											<Typography
												variant="paragraph"
												placeholder={undefined}
												onPointerEnterCapture={undefined}
												onPointerLeaveCapture={undefined}
											>
												{studentFromCourse?.user?.name ||
													studentFromList?.name}{' '}
												{studentFromCourse?.user?.last_name ||
													studentFromList?.last_name}
											</Typography>
										</div>
									</div>

									<div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
										<Typography
											variant="small"
											className="font-bold text-gray-600"
											placeholder={undefined}
											onPointerEnterCapture={undefined}
											onPointerLeaveCapture={undefined}
										>
											Número de Identificación
										</Typography>
										<Typography
											variant="paragraph"
											placeholder={undefined}
											onPointerEnterCapture={undefined}
											onPointerLeaveCapture={undefined}
										>
											{studentFromCourse?.user?.doc_number ||
												studentFromList?.doc_number}
										</Typography>
									</div>

									<div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
										<Typography
											variant="small"
											className="font-bold text-gray-600"
											placeholder={undefined}
											onPointerEnterCapture={undefined}
											onPointerLeaveCapture={undefined}
										>
											Teléfono
										</Typography>
										<Typography
											variant="paragraph"
											placeholder={undefined}
											onPointerEnterCapture={undefined}
											onPointerLeaveCapture={undefined}
										>
											{studentFromCourse?.user?.phone ||
												studentFromList?.phone}
										</Typography>
									</div>
								</div>
							)}

							<div className="mt-4">
								<div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
									<Calendar className="w-5 h-5 text-green-500" />
									<div>
										<Typography
											variant="small"
											className="font-bold text-gray-600"
											placeholder={undefined}
											onPointerEnterCapture={undefined}
											onPointerLeaveCapture={undefined}
										>
											Fecha de inicio
										</Typography>
										<Typography
											variant="paragraph"
											placeholder={undefined}
											onPointerEnterCapture={undefined}
											onPointerLeaveCapture={undefined}
										>
											{course.courseStudent?.date
												? moment(course.courseStudent.date).format(
														'DD/MM/YYYY',
													)
												: 'No asignada'}
										</Typography>
									</div>
								</div>
							</div>
						</div>

						<div className="lg:col-span-4 border border-gray-400 rounded-md p-4">
							<Typography
								variant="h6"
								className="mb-4 text-blue-gray-800"
								placeholder={undefined}
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
							>
								Configuración del Curso
							</Typography>
							<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
								<div>
									<Typography
										variant="h6"
										className="mb-2 text-gray-600"
										placeholder={undefined}
										onPointerEnterCapture={undefined}
										onPointerLeaveCapture={undefined}
									>
										Jerarquia
									</Typography>
									<div className="p-2 rounded bg-gray-100">
										<Typography
											variant="small"
											className="font-bold"
											placeholder={undefined}
											onPointerEnterCapture={undefined}
											onPointerLeaveCapture={undefined}
										>
											{getTypeTripLabel(
												course.courseStudent?.type_trip,
											)}
										</Typography>
									</div>
								</div>
								<div>
									<Typography
										variant="h6"
										className="mb-2 text-gray-600"
										placeholder={undefined}
										onPointerEnterCapture={undefined}
										onPointerLeaveCapture={undefined}
									>
										Licencia
									</Typography>
									<div className="p-2 rounded bg-gray-100">
										<Typography
											variant="small"
											className="font-bold"
											placeholder={undefined}
											onPointerEnterCapture={undefined}
											onPointerLeaveCapture={undefined}
										>
											{getLicenseLabel(course.courseStudent?.license)}
										</Typography>
									</div>
								</div>
								<div>
									<Typography
										variant="h6"
										className="mb-2 text-gray-600"
										placeholder={undefined}
										onPointerEnterCapture={undefined}
										onPointerLeaveCapture={undefined}
									>
										Normativa
									</Typography>
									<div className="p-2 rounded bg-gray-100">
										<Typography
											variant="small"
											className="font-bold"
											placeholder={undefined}
											onPointerEnterCapture={undefined}
											onPointerLeaveCapture={undefined}
										>
											{getRegulationLabel(
												course.courseStudent?.regulation,
											)}
										</Typography>
									</div>
								</div>
								<div>
									<Typography
										variant="h6"
										className="mb-2 text-gray-600"
										placeholder={undefined}
										onPointerEnterCapture={undefined}
										onPointerLeaveCapture={undefined}
									>
										Cliente
									</Typography>
									<div className="p-2 rounded bg-gray-100">
										<Typography
											variant="small"
											className="font-bold"
											placeholder={undefined}
											onPointerEnterCapture={undefined}
											onPointerLeaveCapture={undefined}
										>
											{course.courseStudent?.client || '—'}
										</Typography>
									</div>
								</div>
							</div>
						</div>
					</div>

					<hr className="my-4" />

					{/* Secciones del Curso */}
					<Accordion
						open={isAccordionOpen(1)}
						placeholder={undefined}
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
					>
						<AccordionHeader
							onClick={() => handleToggleAccordion(1)}
							placeholder={undefined}
							onPointerEnterCapture={undefined}
							onPointerLeaveCapture={undefined}
						>
							Secciones del Curso - Horario Asignado
						</AccordionHeader>
						<AccordionBody>
							<div className="grid grid-cols-1 gap-4">
								{days.map((day) => (
									<div
										key={day.id}
										className="border border-gray-300 rounded-lg p-4"
									>
										<Typography
											variant="h6"
											className="mb-4 text-blue-700 bg-blue-50 p-2 rounded"
											placeholder={undefined}
											onPointerEnterCapture={undefined}
											onPointerLeaveCapture={undefined}
										>
											{day.name}
										</Typography>
										<div className="grid grid-cols-1 gap-3">
											{subject.subjectList.map((subjectItem) => {
												const SD = subjectItem.subject_days?.find(
													(sd) =>
														sd.day === day.id + 1 &&
														sd.status &&
														subjectItem.status,
												);
												const schedule = course.scheduleList?.find(
													(s) =>
														s.subject_id === subjectItem.id &&
														s.subject_days_id === SD?.id,
												);

												if (!schedule) return null;

												return (
													<div
														key={subjectItem.id}
														className="p-3 rounded-lg bg-green-50 border-2 border-green-500"
													>
														<div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
															<div className="flex-1">
																<Typography
																	variant="h6"
																	className="text-gray-800"
																	placeholder={undefined}
																	onPointerEnterCapture={undefined}
																	onPointerLeaveCapture={undefined}
																>
																	{subjectItem.name}
																</Typography>
																<Typography
																	variant="small"
																	className="text-gray-600"
																	placeholder={undefined}
																	onPointerEnterCapture={undefined}
																	onPointerLeaveCapture={undefined}
																>
																	Horas: {schedule.classTime} /{' '}
																	{subjectItem.hours}hrs
																</Typography>
															</div>
															<div className="flex flex-col gap-2 min-w-[200px]">
																<div className="flex items-center gap-2 text-sm">
																	<Calendar className="w-4 h-4 text-blue-500" />
																	<Typography
																		variant="small"
																		placeholder={undefined}
																		onPointerEnterCapture={undefined}
																		onPointerLeaveCapture={undefined}
																	>
																		{schedule.date
																			? moment(schedule.date).format(
																					'DD/MM/YYYY',
																				)
																			: '-'}
																	</Typography>
																</div>
																<div className="flex items-center gap-2 text-sm">
																	<Clock className="w-4 h-4 text-orange-500" />
																	<Typography
																		variant="small"
																		placeholder={undefined}
																		onPointerEnterCapture={undefined}
																		onPointerLeaveCapture={undefined}
																	>
																		{schedule.hour || ''}
																	</Typography>
																</div>
																<div className="flex items-center gap-2 text-sm">
																	<User className="w-4 h-4 text-purple-500" />
																	<Typography
																		variant="small"
																		placeholder={undefined}
																		onPointerEnterCapture={undefined}
																		onPointerLeaveCapture={undefined}
																	>
																		{getInstructorName(
																			schedule.instructor_id,
																		)}
																	</Typography>
																</div>
															</div>
														</div>
													</div>
												);
											})}
										</div>
									</div>
								))}
							</div>
						</AccordionBody>
					</Accordion>

					{/* Resultados */}
					{course.courseStudent?.score && (
						<Accordion
							open={isAccordionOpen(2)}
							placeholder={undefined}
							onPointerEnterCapture={undefined}
							onPointerLeaveCapture={undefined}
						>
							<AccordionHeader
								onClick={() => handleToggleAccordion(2)}
								placeholder={undefined}
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
							>
								Resultados del Curso
							</AccordionHeader>
							<AccordionBody>
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
									<div className="bg-blue-50 p-4 rounded-lg">
										<Typography
											variant="small"
											className="font-bold text-gray-600"
											placeholder={undefined}
											onPointerEnterCapture={undefined}
											onPointerLeaveCapture={undefined}
										>
											Puntaje Obtenido
										</Typography>
										<Typography
											variant="h4"
											className={
												course.courseStudent.approve
													? 'text-green-600'
													: 'text-red-600'
											}
											placeholder={undefined}
											onPointerEnterCapture={undefined}
											onPointerLeaveCapture={undefined}
										>
											{course.courseStudent.score} pts
										</Typography>
									</div>
									<div className="bg-blue-50 p-4 rounded-lg">
										<Typography
											variant="small"
											className="font-bold text-gray-600"
											placeholder={undefined}
											onPointerEnterCapture={undefined}
											onPointerLeaveCapture={undefined}
										>
											Estado
										</Typography>
										<Typography
											variant="h5"
											color={
												course.courseStudent.approve ? 'green' : 'red'
											}
											placeholder={undefined}
											onPointerEnterCapture={undefined}
											onPointerLeaveCapture={undefined}
										>
											{course.courseStudent.approve
												? 'Aprobado'
												: 'Reprobado'}
										</Typography>
									</div>
									<div className="bg-blue-50 p-4 rounded-lg">
										<Typography
											variant="small"
											className="font-bold text-gray-600"
											placeholder={undefined}
											onPointerEnterCapture={undefined}
											onPointerLeaveCapture={undefined}
										>
											Horas Totales
										</Typography>
										<Typography
											variant="h5"
											placeholder={undefined}
											onPointerEnterCapture={undefined}
											onPointerLeaveCapture={undefined}
										>
											{course.courseSelected?.hours || 0} hrs
										</Typography>
									</div>
									<div className="bg-blue-50 p-4 rounded-lg">
										<Typography
											variant="small"
											className="font-bold text-gray-600"
											placeholder={undefined}
											onPointerEnterCapture={undefined}
											onPointerLeaveCapture={undefined}
										>
											Total de {ordinalNounPlural(course.courseSelected)}
										</Typography>
										<Typography
											variant="h5"
											placeholder={undefined}
											onPointerEnterCapture={undefined}
											onPointerLeaveCapture={undefined}
										>
											{programSize(course.courseSelected)}{' '}
											{ordinalNounPlural(
												course.courseSelected,
											).toLowerCase()}
										</Typography>
									</div>
								</div>
							</AccordionBody>
						</Accordion>
					)}

					{/* Control de Asistencia */}
					{canViewAttendance && (
						<Accordion
							open={isAccordionOpen(3)}
							placeholder={undefined}
							onPointerEnterCapture={undefined}
							onPointerLeaveCapture={undefined}
						>
							<AccordionHeader
								onClick={() => handleToggleAccordion(3)}
								placeholder={undefined}
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
							>
								<div className="flex items-center gap-2">
									<User className="w-5 h-5" />
									Control de Asistencia
								</div>
							</AccordionHeader>
							<AccordionBody>
								<div className="space-y-4">
									{/* Leyenda de estados */}
									<div className="flex flex-wrap gap-3 mb-4">
										{attendance.attendanceStatusList.map((status) => (
											<div
												key={status.id}
												className={`px-3 py-1 rounded-full text-sm font-medium ${getAttendanceStatusColor(status.id)}`}
											>
												{status.name}
											</div>
										))}
									</div>

								{Object.keys(schedulesBySession).length > 0 ? (
									Object.entries(schedulesBySession).map(
										([draftKey, schedules]) => {
											const cardSchedule = schedules[0];
											const ordinal = getDayForSchedule(
												cardSchedule,
											);
											const existingAttendance =
												getAttendanceForSession(
													cardSchedule.date,
													ordinal,
												);
											const isEditing = editingKey === draftKey;
											return (
												<Card
													key={draftKey}
													placeholder={undefined}
													onPointerEnterCapture={
														undefined
													}
													onPointerLeaveCapture={
														undefined
													}
													className={
														existingAttendance
															? 'border-l-4 border-l-green-500'
															: ''
													}
												>
													<CardBody
														placeholder={undefined}
														onPointerEnterCapture={
															undefined
														}
														onPointerLeaveCapture={
															undefined
														}
													>
														<div className="flex flex-col gap-3">
															{/* Cabecera: fecha + estado */}
															<div className="flex items-center justify-between flex-wrap gap-2">
																<div className="flex items-center gap-3 flex-wrap">
																	<Calendar className="w-5 h-5 text-blue-500" />
																	<Typography
																		variant="h6"
																		className="text-sm"
																		placeholder={undefined}
																		onPointerEnterCapture={
																			undefined
																		}
																		onPointerLeaveCapture={
																			undefined
																		}
																	>
																		{moment(
																			cardSchedule.date,
																		).format('DD/MM/YYYY')}
																	</Typography>
																	{ordinal !== undefined && (
																		<Typography
																			variant="small"
																			className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium"
																			placeholder={undefined}
																			onPointerEnterCapture={
																				undefined
																			}
																			onPointerLeaveCapture={
																				undefined
																			}
																		>
																			{ordinalLabel(
																				course.courseSelected,
																				ordinal,
																			)}
																		</Typography>
																	)}
																	<Clock className="w-4 h-4 text-orange-500" />
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
																			{cardSchedule.hour || ''}
																		</Typography>
																	</div>
																	{existingAttendance &&
																		!isEditing && (
																			<div
																				className={`px-3 py-1 rounded-full text-sm font-medium ${getAttendanceStatusColor(existingAttendance.attendance_status_id)}`}
																			>
																				{getAttendanceStatusLabel(
																					existingAttendance.attendance_status_id,
																				)}
																			</div>
																		)}
																</div>

																{/* Materias del ordinal como chips */}
																<div className="flex flex-wrap gap-2">
																	{schedules.map((s, chipIndex) => {
																		const name =
																			subject.subjectList.find(
																				(sub) =>
																					sub.id === s.subject_id,
																			)?.name;
																		return name ? (
																			<span
																				key={
																					s.id ??
																					`${draftKey}-chip-${chipIndex}`
																				}
																				className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
																			>
																				{name}
																			</span>
																		) : null;
																	})}
																</div>

																{/* ── STAFF: puede crear/editar asistencia ── */}
																{canEditAttendance && (
																	<>
																		{isEditing ||
																		!existingAttendance ? (
																			<div className="space-y-3 mt-2">
																				<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
																					<div>
																						<Typography
																							variant="small"
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
																					<Select
																						value={getDraft(
																							draftKey,
																						).attendance_status_id.toString()}
																						onChange={(val) =>
																							val &&
																							setDraft(draftKey, {
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
																							{attendance.attendanceStatusList.map(
																								(status) => (
																									<Option
																										key={status.id}
																										value={status.id.toString()}
																									>
																										{status.name}
																									</Option>
																								),
																							)}
																						</Select>
																					</div>
																				</div>
																				<div>
																					<Typography
																						variant="small"
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
																					<Textarea
																						value={getDraft(draftKey).comments}
																						onChange={(e) =>
																							setDraft(draftKey, {
																								comments: e.target.value,
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
																							placeholder: undefined,
																							onPointerEnterCapture:
																								undefined,
																							onPointerLeaveCapture:
																								undefined,
																						}}
																					/>
																				</div>
																				<div className="flex gap-2">
																					<Button
																						size="sm"
																						color="green"
																						onClick={() =>
																							handleSaveAttendance(
																								cardSchedule.date,
																								ordinal,
																								draftKey,
																							)
																						}
																						disabled={isSaving}
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
																						{isSaving
																							? 'Guardando...'
																							: existingAttendance
																								? 'Actualizar'
																								: 'Guardar'}
																					</Button>
																					{isEditing && (
																						<Button
																							size="sm"
																							color="gray"
																							onClick={() =>
																								handleCancelEdit(
																									draftKey,
																								)
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
																							<X className="w-4 h-4" />{' '}
																							Cancelar
																						</Button>
																					)}
																				</div>
																			</div>
																		) : (
																			<div className="mt-2 justify-between flex items-center gap-2">
																				{existingAttendance.comments && (
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
																						<span className="font-semibold">
																							Comentarios:
																						</span>{' '}
																						"
																						{
																							existingAttendance.comments
																						}
																						"
																					</Typography>
																				)}
																				<Button
																					size="sm"
																					color="blue"
																					variant="text"
																					title="Editar Comentario"
																					onClick={() =>
																						handleEditAttendance(
																							existingAttendance,
																							draftKey,
																						)
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
																					<Edit2 className="w-4 h-4" />{' '}
																				</Button>
																			</div>
																		)}
																	</>
																)}

																{/* ── FIRMA: visible para todos si hay asistencia registrada ── */}
																{existingAttendance && (
																	<div className="mt-3 border-t pt-3">
																		<Typography
																			variant="small"
																			className="font-semibold mb-2"
																			placeholder={undefined}
																			onPointerEnterCapture={
																				undefined
																			}
																			onPointerLeaveCapture={
																				undefined
																			}
																		>
																			Firma del estudiante
																		</Typography>
																		{(existingAttendance
																			.attendance_signature
																			?.signature_url ??
																		existingAttendance.signature_url) ? (
																			<div className="flex items-start gap-3">
																				<img
																					src={
																						existingAttendance
																							.attendance_signature
																							?.signature_url ??
																						existingAttendance.signature_url
																					}
																					alt="Firma de asistencia"
																					className="max-w-xs h-auto border rounded"
																				/>
																				{canEditAttendance && (
																					<Button
																						size="sm"
																						color="red"
																						title="Eliminar firma"
																						variant="outlined"
																						onClick={() =>
																							handleDeleteSignature(
																								existingAttendance.id,
																							)
																						}
																						placeholder={undefined}
																						onPointerEnterCapture={
																							undefined
																						}
																						onPointerLeaveCapture={
																							undefined
																						}
																						className="flex items-center gap-1"
																					>
																						<Trash2 className="w-4 h-4" />
																					</Button>
																				)}
																			</div>
																		) : (
																			<AttendanceSignature
																				key={`canvas-${existingAttendance.id}`}
																				attendanceId={
																					existingAttendance.id
																				}
																				onSave={handleSaveSignature}
																				isSaving={
																					savingSignatureId ===
																					existingAttendance.id
																				}
																			disabled={
																				// !moment(
																				// 	cardSchedule.date,
																				// ).isSame(moment(), 'day') &&
																				auth.user?.id !==
																				course.courseStudent
																					?.student?.user_id
																			}
																			/>
																		)}
																	</div>
																)}

																{/* Estudiante: sin asistencia aún */}
																{!canEditAttendance &&
																	!existingAttendance && (
																		<Typography
																			variant="small"
																			className="italic text-gray-400 mt-2"
																			placeholder={undefined}
																			onPointerEnterCapture={
																				undefined
																			}
																			onPointerLeaveCapture={
																				undefined
																			}
																		>
																			Pendiente de registro por el
																			instructor
																		</Typography>
																	)}
															</div>
														</CardBody>
													</Card>
												);
											},
										)
									) : (
										<Typography
											variant="paragraph"
											className="text-center text-gray-500 italic py-8"
											placeholder={undefined}
											onPointerEnterCapture={undefined}
											onPointerLeaveCapture={undefined}
										>
											No hay fechas programadas para este curso
										</Typography>
									)}
								</div>
							</AccordionBody>
						</Accordion>
					)}
				</CardBody>
			</Card>
		</div>
	);
};

export default ViewCourseStudentSchedule;

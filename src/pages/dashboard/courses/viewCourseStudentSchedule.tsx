import {
	Accordion,
	AccordionBody,
	AccordionHeader,
	Card,
	CardBody,
	Typography,
} from '@material-tailwind/react';
import { useEffect, useState } from 'react';
import { breadCrumbsItems } from '../../../types/utilities';
import { useSelector, useDispatch } from 'react-redux';
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
import PageTitle from '../../../components/PageTitle';
import LoadingPage from '../../../components/LoadingPage';
import ErrorPage from '../../../components/ErrorPage';
import moment from 'moment';
import { Calendar, Clock, User } from 'lucide-react';
import { useParams } from 'react-router-dom';

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

const ViewCourseStudentSchedule = () => {
	const dispatch = useDispatch<AppDispatch>();
	const { id, course_id } = useParams<{
		id: string;
		course_id: string;
	}>();
	const [open, setOpen] = useState(1);
	const [dataLoaded, setDataLoaded] = useState(false);

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
				]);
				setDataLoaded(true);
			}
		};

		loadData();
	}, [dispatch, id, course_id]);

	const { course, subject, user } = useSelector(
		(state: RootState) => ({
			course: state.courses,
			subject: state.subjects,
			user: state.users,
		}),
	);

	const handleOpen = (value: number) =>
		setOpen(open === value ? 0 : value);

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
			default:
				return '-';
		}
	};

	const getLicenseLabel = (license: number | undefined) => {
		switch (license) {
			case 1:
				return 'ATP';
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

	const days = course.courseSelected
		? Array.from({ length: course.courseSelected.days }, (_, i) => ({
				id: i,
				name: `Dia ${i + 1}`,
			}))
		: [];

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
							{course.courseStudent?.code}
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
										Gerarquia
									</Typography>
									<div className="flex flex-col gap-2">
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
									<div className="flex flex-col gap-2">
										<div className="p-2 rounded bg-gray-100">
											<Typography
												variant="small"
												className="font-bold"
												placeholder={undefined}
												onPointerEnterCapture={undefined}
												onPointerLeaveCapture={undefined}
											>
												{getLicenseLabel(
													course.courseStudent?.license,
												)}
											</Typography>
										</div>
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
									<div className="flex flex-col gap-2">
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
								</div>
							</div>
						</div>
					</div>

					<hr className="my-4" />

					<Accordion
						open={open === 1}
						placeholder={undefined}
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
					>
						<AccordionHeader
							onClick={() => handleOpen(1)}
							placeholder={undefined}
							onPointerEnterCapture={undefined}
							onPointerLeaveCapture={undefined}
						>
							Secciones del Curso - Horario Asignado
						</AccordionHeader>
						<AccordionBody>
							<div className="grid grid-cols-1 gap-4">
								{days.map((day) => {
									return (
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

													const startTime = schedule?.hour
														? schedule.hour
														: '';

													return (
														<div
															key={subjectItem.id}
															className={`p-3 rounded-lg ${
																schedule
																	? 'bg-green-50 border-2 border-green-500'
																	: 'bg-gray-50 border-2 border-gray-300'
															}`}
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
																	{schedule ? (
																		<Typography
																			variant="small"
																			className="text-gray-600"
																			placeholder={undefined}
																			onPointerEnterCapture={
																				undefined
																			}
																			onPointerLeaveCapture={
																				undefined
																			}
																		>
																			Horas: {schedule.classTime} /{' '}
																			{subjectItem.hours}
																			hrs
																		</Typography>
																	) : (
																		<Typography
																			variant="small"
																			className="text-gray-400 italic"
																			placeholder={undefined}
																			onPointerEnterCapture={
																				undefined
																			}
																			onPointerLeaveCapture={
																				undefined
																			}
																		>
																			Sin asignar
																		</Typography>
																	)}
																</div>

																{schedule && (
																	<div className="flex flex-col gap-2 min-w-[200px]">
																		<div className="flex items-center gap-2 text-sm">
																			<Calendar className="w-4 h-4 text-blue-500" />
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
																				{schedule.date
																					? moment(
																							schedule.date,
																						).format('DD/MM/YYYY')
																					: '-'}
																			</Typography>
																		</div>
																		<div className="flex items-center gap-2 text-sm">
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
																				{startTime}
																			</Typography>
																		</div>
																		<div className="flex items-center gap-2 text-sm">
																			<User className="w-4 h-4 text-purple-500" />
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
																				{getInstructorName(
																					schedule.instructor_id,
																				)}
																			</Typography>
																		</div>
																	</div>
																)}
															</div>
														</div>
													);
												})}
											</div>
										</div>
									);
								})}
							</div>
						</AccordionBody>
					</Accordion>

					{course.courseStudent?.score && (
						<Accordion
							open={open === 2}
							placeholder={undefined}
							onPointerEnterCapture={undefined}
							onPointerLeaveCapture={undefined}
						>
							<AccordionHeader
								onClick={() => handleOpen(2)}
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
											Días Totales
										</Typography>
										<Typography
											variant="h5"
											placeholder={undefined}
											onPointerEnterCapture={undefined}
											onPointerLeaveCapture={undefined}
										>
											{course.courseSelected?.days || 0} días
										</Typography>
									</div>
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

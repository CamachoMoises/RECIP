import { AppDispatch, RootState } from '../../../store';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import PageTitle from '../../../components/PageTitle';

import { fetchSubjects } from '../../../features/subjectSlice';
import {
	fetchCourse,
	fetchCourseStudent,
	fetchCoursesStudentsTests,
} from '../../../features/courseSlice';
import {
	breadCrumbsItems,
	courseStudent,
	courseStudentTest,
	instructor,
} from '../../../types/utilities';
import LoadingPage from '../../../components/LoadingPage';
import ErrorPage from '../../../components/ErrorPage';
import {
	Button,
	Card,
	CardBody,
	IconButton,
	List,
	ListItem,
	Typography,
	Switch,
	Menu,
	MenuHandler,
	MenuList,
	MenuItem,
	Dialog,
	DialogHeader,
	DialogBody,
	DialogFooter,
} from '@material-tailwind/react';
import moment from 'moment';
import { useEffect, useRef, useState } from 'react';
import {
	createCourseStudentTest,
	fetchCourseStudentTest,
	fetchTest,
	fetchTestStudent,
} from '../../../features/testSlice';
import {
	ChevronLeft,
	ChevronRight,
	ListTodo,
	NotebookText,
	Pencil,
	MoreVertical,
	FileText,
} from 'lucide-react';
import { fetchUser } from '../../../features/userSlice';
import ResultsTestPdf from './resultsTestPdf';
import { useReactToPrint } from 'react-to-print';
import toast from 'react-hot-toast';
import { axiosPostDefault } from '../../../services/axios';

const breadCrumbs: breadCrumbsItems[] = [
	{
		name: 'Inicio',
		href: '/dashboard',
	},
];

const GeneralTest = () => {
	const dispatch = useDispatch<AppDispatch>();
	const navigate = useNavigate();
	const componentRef = useRef<HTMLDivElement>(null);
	const [isGeneratingTest, setIsGeneratingTest] = useState(false);
	const [openExamsModal, setOpenExamsModal] = useState(false);
	const [byPassMaxTries, setByPassMaxTries] = useState(false);
	const [now, setNow] = useState<Date>(new Date());
	const { course, auth, user, test } = useSelector(
		(state: RootState) => ({
			course: state.courses,
			auth: state.auth,
			user: state.users,
			test: state.tests,
		}),
	);

	const isSuperAdmin = auth.user?.is_superuser;
	const currentPage = course.currentPage;
	const pageSize = course.pageSize;
	const totalPages = course.totalPages;
	const totalItems = course.totalItems;
	const [active, setActive] = useState(currentPage);

	useEffect(() => {
		dispatch(
			fetchCoursesStudentsTests({
				pageSize: course.pageSize,
				currentPage: course.currentPage,
				course_type_id: 1,
			}),
		);
	}, [dispatch, course.currentPage, course.pageSize]);

	useEffect(() => {
		const interval = window.setInterval(() => {
			setNow(new Date());
		}, 5000);

		return () => {
			window.clearInterval(interval);
		};
	}, []);

	const handleEndTest = async (course_student_test_id: number) => {
		toast.loading('Finalizando examen', { id: 'endTest' });
		const resp = await axiosPostDefault(
			`api/test/courseStudentTestEnd`,
			{
				course_student_test_id: course_student_test_id,
			},
		);

		if (resp.score >= 0) {
			toast.dismiss('endTest');
			toast.success(
				'Examen finalizado, pronto podra ver su calificaion',
			);
		}
	};

	const navigateCourseStudentTest = async (
		CS: courseStudent,
		date: string,
	) => {
		setIsGeneratingTest(true);
		const loadingToast = toast.loading('Generando examen');
		try {
			await dispatch(
				fetchSubjects({
					course_id: CS.course_id ? CS.course_id : -1,
					status: true,
					is_schedulable: true,
				}),
			);
			await dispatch(fetchCourse(CS.course_id ? CS.course_id : -1));
			await dispatch(fetchCourseStudent(CS.id ? CS.id : -1));
			const CST = await dispatch(
				createCourseStudentTest({
					course_student_id: CS.id ? CS.id : -1,
					date: date,
				}),
			).unwrap();
			await dispatch(fetchTest(CST.test_id));
			toast.dismiss(loadingToast);
			navigate(`../new_test/${CS.id}/${CS.course_id}/${CST.test_id}`);
		} catch (error) {
			toast.dismiss(loadingToast);
			toast.error('Error al generar el examen');
			setIsGeneratingTest(false);
		}
	};

	const navigateReviewTest = async (
		CST_id: number,
		test_id: number,
		course_id: number,
		CS_id: number,
		user_id: number,
	) => {
		navigate(
			`../review_test/${CST_id}/${test_id}/${course_id}/${CS_id}/${user_id}`,
		);
	};

	const seeReults = async (
		CST_id: number,
		course_id: number,
		user_id: number,
	) => {
		const userdata = await dispatch(fetchUser(user_id)).unwrap();
		const coursedata = await dispatch(
			fetchCourse(course_id),
		).unwrap();
		const testData = await dispatch(
			fetchCourseStudentTest(CST_id),
		).unwrap();
		if (coursedata && userdata && testData) {
			seeResults();
		}
	};

	const getItemProps = (index: number) =>
		({
			variant: active === index ? 'filled' : 'text',
			color: 'gray',
			onClick: async () => {
				await dispatch(
					fetchCoursesStudentsTests({
						pageSize,
						currentPage: index,
						course_type_id: 1,
					}),
				);
				setActive(index);
			},
			className: 'rounded-full',
		}) as any;

	const next = async () => {
		if (active === totalPages) return;
		setActive(active + 1);
		await dispatch(
			fetchCoursesStudentsTests({
				pageSize,
				currentPage: active + 1,
				course_type_id: 1,
			}),
		);
	};

	const prev = async () => {
		if (active === 1) return;
		setActive(active - 1);
		await dispatch(
			fetchCoursesStudentsTests({
				pageSize,
				currentPage: active - 1,
				course_type_id: 1,
			}),
		);
	};

	const seeResults = async () => {
		handlePrint();
	};

	const openExamsList = async (
		studentId: number,
		courseStudentId: number,
	) => {
		await dispatch(
			fetchTestStudent({
				student_id: studentId,
				course_student_id: courseStudentId,
			}),
		);
		setOpenExamsModal(true);
	};

	const handlePrint = useReactToPrint({
		contentRef: componentRef,
		documentTitle: `Examen-${test.testSelected?.code}`,
	});

	if (course.status === 'loading') {
		return <LoadingPage />;
	}

	if (course.status === 'failed') {
		return (
			<ErrorPage error={course.error ? course.error : 'Indefinido'} />
		);
	}

	const pages =
		totalPages > 0
			? Array.from({ length: totalPages }, (_, i) => ({
					id: i,
					name: `Pagina ${i + 1}`,
				}))
			: [];
	console.log('caka', course.courseStudentList);

	return (
		<div className="container mx-auto px-2 sm:px-4">
			<PageTitle title="Examenes" breadCrumbs={breadCrumbs} />

			{isSuperAdmin && (
				<div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
					<div>
						<Switch
							className="h-full w-full checked:bg-[#134475]"
							containerProps={{
								className: 'w-11 h-6',
							}}
							circleProps={{
								className: 'before:hidden left-0.5 border-none',
							}}
							checked={byPassMaxTries}
							onChange={() => setByPassMaxTries((prev) => !prev)}
							crossOrigin={undefined}
							onPointerEnterCapture={undefined}
							onPointerLeaveCapture={undefined}
						/>
					</div>
					<Typography
						variant="small"
						className="font-medium text-gray-700"
						placeholder={undefined}
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
					>
						Bypass intentos maximos
					</Typography>
					<Typography
						variant="small"
						className="text-xs text-gray-500"
						placeholder={undefined}
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
					>
						Visible solo para superadmin
					</Typography>
				</div>
			)}

			<div className="flex flex-col pt-4">
				<Card
					className="w-full"
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
						{course.courseStudentList?.length === 0 ? (
							<>
								<Typography
									variant="h2"
									color="blue-gray"
									placeholder={undefined}
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
								>
									Sin exámenes cargados
								</Typography>
							</>
						) : (
							<List
								placeholder={undefined}
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
							>
								{course.courseStudentList?.map((CL) => {
									const maxTries = 4;
									let instructor: instructor | undefined = undefined;
									let lastTest: courseStudentTest | undefined =
										undefined;
									const user_id = CL.student?.user?.id
										? CL.student.user.id
										: -1;
									let active = true;
									let dateTest = null;
									let horas = null;
									const exams_submitted =
										CL.course_student_tests?.length || 0;
									if (exams_submitted > 0) {
										active = byPassMaxTries
											? true
											: exams_submitted < maxTries;
										lastTest = CL.course_student_tests?.slice(-1)[0];
									}

									if (CL.schedules?.length === 0) {
										active = false;
									} else {
										dateTest = CL.schedules
											? moment(
													`${CL.schedules[0].date} ${CL.schedules[0].hour}`,
												)
											: null;
									}

									const selfUser =
										auth.user?.id === CL.student?.user?.id;
									let selfInstructor = false;

									if (!selfUser) {
										active = false;
									}

									if (CL.schedules && CL.schedules[0]) {
										instructor = CL.schedules[0].instructor;
										selfInstructor =
											instructor?.user?.id === auth.user?.id;
									}

									if (dateTest) {
										const currentDate = moment(now);
										horas = currentDate.diff(dateTest, 'hours', true);
									}

									if (!horas || horas < 0 || horas > 2) {
										active = false;
									}

									return (
										<ListItem
											key={`${CL.id}.courseList`}
											className="flex flex-col sm:flex-row items-start sm:items-center gap-3 py-4 sm:py-3"
											placeholder={undefined}
											onPointerEnterCapture={undefined}
											onPointerLeaveCapture={undefined}
										>
											<div className="flex flex-col sm:flex-row w-full gap-3">
												<div className="flex flex-col w-full">
													<div className="flex items-center justify-between">
														<Typography
															variant="h6"
															className="text-sm sm:text-base font-semibold text-blue-gray-800"
															placeholder={undefined}
															onPointerEnterCapture={undefined}
															onPointerLeaveCapture={undefined}
														>
															{CL.code}
														</Typography>

														{((selfUser && exams_submitted > 0) ||
															auth.user?.is_superuser) && (
															<Typography
																variant="small"
																className="text-xs sm:text-sm text-red-600 bg-red-50 px-2 py-1 rounded"
																placeholder={undefined}
																onPointerEnterCapture={undefined}
																onPointerLeaveCapture={undefined}
															>
																Intentos {exams_submitted} /{' '}
																{maxTries}
															</Typography>
														)}
													</div>

													<div className="mt-2">
														<Typography
															variant="small"
															className="text-xs sm:text-sm font-semibold text-gray-700"
															placeholder={undefined}
															onPointerEnterCapture={undefined}
															onPointerLeaveCapture={undefined}
														>
															Participante:
														</Typography>
														<Typography
															variant="small"
															className="text-xs sm:text-sm text-gray-800"
															placeholder={undefined}
															onPointerEnterCapture={undefined}
															onPointerLeaveCapture={undefined}
														>
															{CL.student?.user?.name
																? `${CL.student.user.name} ${CL.student.user.last_name}`
																: 'Sin Piloto'}
														</Typography>

														<div className="mt-1 flex flex-wrap gap-x-4">
															<Typography
																variant="small"
																className="text-xs sm:text-sm text-gray-700"
																placeholder={undefined}
																onPointerEnterCapture={undefined}
																onPointerLeaveCapture={undefined}
															>
																<span className="font-semibold">
																	Curso:
																</span>{' '}
																{CL.course?.name}
															</Typography>

															{dateTest && (
																<Typography
																	variant="small"
																	className="text-xs sm:text-sm text-gray-700"
																	placeholder={undefined}
																	onPointerEnterCapture={undefined}
																	onPointerLeaveCapture={undefined}
																>
																	<span className="font-semibold">
																		Fecha:
																	</span>{' '}
																	{dateTest.format('DD-MM-YYYY')}
																</Typography>
															)}

															{dateTest && (
																<Typography
																	variant="small"
																	className="text-xs sm:text-sm text-gray-700"
																	placeholder={undefined}
																	onPointerEnterCapture={undefined}
																	onPointerLeaveCapture={undefined}
																>
																	<span className="font-semibold">
																		Hora:
																	</span>{' '}
																	{dateTest.format('HH:mm')}
																</Typography>
															)}
														</div>

														{instructor && (
															<Typography
																variant="small"
																className="text-xs sm:text-sm text-gray-700 mt-1"
																placeholder={undefined}
																onPointerEnterCapture={undefined}
																onPointerLeaveCapture={undefined}
															>
																<span className="font-semibold">
																	Instructor:
																</span>{' '}
																{instructor.user?.name}{' '}
																{instructor.user?.last_name}
															</Typography>
														)}

														{(auth.user?.is_superuser ||
															(CL.highest_score !== undefined &&
																selfUser)) && (
															<Typography
																variant="small"
																className="text-xs sm:text-sm font-semibold text-red-600 mt-1"
																placeholder={undefined}
																onPointerEnterCapture={undefined}
																onPointerLeaveCapture={undefined}
															>
																Calificación: {CL.highest_score}{' '}
																Puntos
															</Typography>
														)}
													</div>
												</div>

												<div className="flex justify-end w-full sm:w-auto mt-2 sm:mt-0">
													<div className="hidden sm:flex">
														<div className="flex flex-row items-center gap-2">
															<Button
																title="Iniciar examen"
																className="flex items-center gap-1 px-2 sm:px-3"
																placeholder={undefined}
																onPointerEnterCapture={undefined}
																onPointerLeaveCapture={undefined}
																disabled={!active || isGeneratingTest}
																onClick={() => {
																	navigateCourseStudentTest(
																		CL,
																		dateTest
																			? dateTest.format('YYYY-MM-DD')
																			: '-1',
																	);
																}}
															>
																<Pencil size={15} />
															</Button>

															{CL.score &&
																lastTest &&
																CL.student?.user?.id && (
																	<Button
																		title="Respuestas"
																		className="flex items-center gap-1 px-2 sm:px-3"
																		disabled={active || !selfUser}
																		onClick={() => {
																			seeReults(
																				lastTest.id,
																				CL.course_id,
																				user_id,
																			);
																		}}
																		placeholder={undefined}
																		onPointerEnterCapture={undefined}
																		onPointerLeaveCapture={undefined}
																	>
																		<ListTodo size={15} />
																	</Button>
																)}

															<Button
																title="Ver examenes"
																className="flex items-center gap-1 px-2 sm:px-3"
																disabled={
																	!CL.student?.user?.id || !CL.id
																}
																placeholder={undefined}
																onPointerEnterCapture={undefined}
																onPointerLeaveCapture={undefined}
																onClick={() => {
																	openExamsList(
																		CL.student?.id || -1,
																		CL.id || -1,
																	);
																}}
															>
																<FileText size={15} />
															</Button>

															{CL.score &&
																lastTest &&
																CL.student?.user?.id && (
																	<Button
																		title="Revisión"
																		className="flex items-center gap-1 px-2 sm:px-3"
																		disabled={
																			!selfInstructor ||
																			exams_submitted === 0
																		}
																		placeholder={undefined}
																		onPointerEnterCapture={undefined}
																		onPointerLeaveCapture={undefined}
																		onClick={() => {
																			navigateReviewTest(
																				lastTest.id,
																				lastTest.test_id,
																				CL.course_id,
																				lastTest?.course_student_id,
																				user_id,
																			);
																		}}
																	>
																		<NotebookText size={15} />
																	</Button>
																)}
														</div>
													</div>

													{/* Menú para móviles */}
													<div className="sm:hidden">
														<Menu>
															<MenuHandler>
																<IconButton
																	variant="text"
																	className="rounded-full"
																	placeholder={undefined}
																	onPointerEnterCapture={undefined}
																	onPointerLeaveCapture={undefined}
																>
																	<MoreVertical size={20} />
																</IconButton>
															</MenuHandler>
															<MenuList
																placeholder={undefined}
																onPointerEnterCapture={undefined}
																onPointerLeaveCapture={undefined}
															>
																<MenuItem
																	className="flex items-center gap-2"
																	disabled={
																		!active || isGeneratingTest
																	}
																	onClick={() => {
																		navigateCourseStudentTest(
																			CL,
																			dateTest
																				? dateTest.format(
																						'YYYY-MM-DD',
																					)
																				: '-1',
																		);
																	}}
																	placeholder={undefined}
																	onPointerEnterCapture={undefined}
																	onPointerLeaveCapture={undefined}
																>
																	<Pencil size={15} />
																	<span>Iniciar examen</span>
																</MenuItem>

																{CL.score &&
																	lastTest &&
																	CL.student?.user?.id && (
																		<MenuItem
																			className="flex items-center gap-2"
																			disabled={active || !selfUser}
																			onClick={() => {
																				seeReults(
																					lastTest.id,
																					CL.course_id,
																					user_id,
																				);
																			}}
																			placeholder={undefined}
																			onPointerEnterCapture={
																				undefined
																			}
																			onPointerLeaveCapture={
																				undefined
																			}
																		>
																			<ListTodo size={15} />
																			<span>Ver respuestas</span>
																		</MenuItem>
																	)}

																{(selfUser ||
																	auth.user?.is_superuser) && (
																	<MenuItem
																		className="flex items-center gap-2"
																		disabled={
																			!CL.student?.user?.id || !CL.id
																		}
																		onClick={() => {
																			openExamsList(
																				CL.student?.user?.id || -1,
																				CL.id || -1,
																			);
																		}}
																		placeholder={undefined}
																		onPointerEnterCapture={undefined}
																		onPointerLeaveCapture={undefined}
																	>
																		<FileText size={15} />
																		<span>Ver examenes</span>
																	</MenuItem>
																)}

																{CL.score &&
																	lastTest &&
																	CL.student?.user?.id && (
																		<MenuItem
																			className="flex items-center gap-2"
																			disabled={
																				!selfInstructor ||
																				exams_submitted === 0
																			}
																			onClick={() => {
																				navigateReviewTest(
																					lastTest.id,
																					lastTest.test_id,
																					CL.course_id,
																					lastTest?.course_student_id,
																					user_id,
																				);
																			}}
																			placeholder={undefined}
																			onPointerEnterCapture={
																				undefined
																			}
																			onPointerLeaveCapture={
																				undefined
																			}
																		>
																			<NotebookText size={15} />
																			<span>Revisión</span>
																		</MenuItem>
																	)}
															</MenuList>
														</Menu>
													</div>
												</div>
											</div>
										</ListItem>
									);
								})}
							</List>
						)}

						{totalPages > 1 && (
							<div className="mt-6">
								<div className="flex flex-col w-full text-center mb-2">
									<small className="text-sm text-gray-600">
										Total: {totalItems} registros
									</small>
								</div>

								<div className="flex w-full justify-center gap-4">
									<Button
										variant="text"
										className="flex items-center gap-1 rounded-full text-xs sm:text-sm"
										onClick={prev}
										disabled={active === 1}
										placeholder={undefined}
										onPointerEnterCapture={undefined}
										onPointerLeaveCapture={undefined}
									>
										<ChevronLeft
											strokeWidth={2}
											className="h-4 w-4"
										/>
										<span className="hidden sm:inline">Anterior</span>
									</Button>

									<div className="hidden sm:flex items-center gap-2">
										{pages.map((page) => (
											<IconButton
												key={page.name}
												{...getItemProps(page.id + 1)}
												className="text-xs sm:text-sm"
											>
												{page.id + 1}
											</IconButton>
										))}
									</div>

									<div className="sm:hidden flex items-center">
										<Typography
											className="text-sm font-medium"
											placeholder={undefined}
											onPointerEnterCapture={undefined}
											onPointerLeaveCapture={undefined}
										>
											Página {active} de {totalPages}
										</Typography>
									</div>

									<Button
										variant="text"
										className="flex items-center gap-1 rounded-full text-xs sm:text-sm"
										onClick={next}
										disabled={active === totalPages}
										placeholder={undefined}
										onPointerEnterCapture={undefined}
										onPointerLeaveCapture={undefined}
									>
										<span className="hidden sm:inline">
											Siguiente
										</span>
										<ChevronRight
											strokeWidth={2}
											className="h-4 w-4"
										/>
									</Button>
								</div>
							</div>
						)}
					</CardBody>
				</Card>
			</div>

			<Dialog
				open={openExamsModal}
				handler={() => setOpenExamsModal(false)}
				placeholder={undefined}
				onPointerEnterCapture={undefined}
				onPointerLeaveCapture={undefined}
				size="lg"
				className="max-w-full sm:max-w-lg"
			>
				<DialogHeader
					placeholder={undefined}
					onPointerEnterCapture={undefined}
					onPointerLeaveCapture={undefined}
					className="text-sm sm:text-base"
				>
					Exámenes del Estudiante para el curso
				</DialogHeader>
				<DialogBody
					placeholder={undefined}
					onPointerEnterCapture={undefined}
					onPointerLeaveCapture={undefined}
					className="max-h-[60vh] sm:max-h-96 overflow-y-auto"
				>
					{test.studentTestList && test.studentTestList.length > 0 ? (
						<List
							placeholder={undefined}
							onPointerEnterCapture={undefined}
							onPointerLeaveCapture={undefined}
						>
							{test.studentTestList.map((cst, index) => (
								<ListItem
									key={`exam-${index}`}
									placeholder={undefined}
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
									className="flex flex-col items-start py-2 sm:py-3"
								>
									<div className="w-full flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
										<div className="flex-1">
											<Typography
												variant="h6"
												className="text-sm sm:text-base"
												placeholder={undefined}
												onPointerEnterCapture={undefined}
												onPointerLeaveCapture={undefined}
											>
												{cst.code || 'Sin código'}
											</Typography>
											<Typography
												variant="small"
												className="text-xs sm:text-sm text-gray-600"
												placeholder={undefined}
												onPointerEnterCapture={undefined}
												onPointerLeaveCapture={undefined}
											>
												Fecha:{' '}
												{cst.date
													? moment(cst.date).format(
															'DD/MM/YYYY HH:mm',
														)
													: 'Sin fecha'}
											</Typography>
											{cst.score !== undefined &&
												cst.score !== null && (
													<Typography
														variant="small"
														className={`font-semibold text-xs sm:text-sm ${cst.score >= (cst.test?.min_score || 0) ? 'text-green-600' : 'text-red-600'}`}
														placeholder={undefined}
														onPointerEnterCapture={undefined}
														onPointerLeaveCapture={undefined}
													>
														Score: {cst.score} /{' '}
														{cst.test?.min_score || 0} (min)
													</Typography>
												)}
											<Typography
												variant="small"
												className="text-xs text-gray-500"
												placeholder={undefined}
												onPointerEnterCapture={undefined}
												onPointerLeaveCapture={undefined}
											>
												Curso:{' '}
												{cst.course_student?.course?.name ||
													'Sin curso'}
											</Typography>
										</div>
										<div className="self-start sm:self-center flex flex-col sm:flex-row gap-2">
											<Button
												size="sm"
												variant="outlined"
												color="blue"
												className="text-xs sm:text-sm flex items-center gap-1"
												placeholder={undefined}
												onPointerEnterCapture={undefined}
												onPointerLeaveCapture={undefined}
												onClick={() => {
													const userId =
														cst.course_student?.student?.user?.id ||
														cst.course_student?.student?.id ||
														-1;
													const courseId =
														cst.course_student?.course?.id || -1;
													navigateReviewTest(
														cst.id,
														cst.test_id,
														courseId,
														cst.course_student_id,
														userId,
													);
												}}
											>
												<NotebookText size={14} />
												Revisión
											</Button>
											<Button
												size="sm"
												variant="outlined"
												color="red"
												className="text-xs sm:text-sm"
												placeholder={undefined}
												onPointerEnterCapture={undefined}
												onPointerLeaveCapture={undefined}
												onClick={() => handleEndTest(cst.id)}
											>
												Finalizar
											</Button>
										</div>
									</div>
								</ListItem>
							))}
						</List>
					) : (
						<Typography
							variant="h6"
							color="gray"
							className="text-center py-4 text-sm sm:text-base"
							placeholder={undefined}
							onPointerEnterCapture={undefined}
							onPointerLeaveCapture={undefined}
						>
							No hay exámenes registrados
						</Typography>
					)}
				</DialogBody>
				<DialogFooter
					placeholder={undefined}
					onPointerEnterCapture={undefined}
					onPointerLeaveCapture={undefined}
				>
					<Button
						variant="text"
						color="red"
						size="sm"
						onClick={() => setOpenExamsModal(false)}
						placeholder={undefined}
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
					>
						Cerrar
					</Button>
				</DialogFooter>
			</Dialog>

			<div style={{ display: 'none' }}>
				<div ref={componentRef} className="flex flex-col w-full">
					<ResultsTestPdf course={course} test={test} user={user} />
				</div>
			</div>
		</div>
	);
};

export default GeneralTest;

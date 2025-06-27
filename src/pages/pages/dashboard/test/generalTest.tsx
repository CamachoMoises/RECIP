import { AppDispatch, RootState } from '../../../../store';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import PageTitle from '../../../../components/PageTitle';

import { fetchSubjects } from '../../../../features/subjectSlice';
import {
	fetchCourse,
	fetchCourseStudent,
	fetchCoursesStudentsTests,
} from '../../../../features/courseSlice';
import {
	breadCrumbsItems,
	courseStudent,
	courseStudentTest,
	instructor,
} from '../../../../types/utilities';
import LoadingPage from '../../../../components/LoadingPage';
import ErrorPage from '../../../../components/ErrorPage';
import {
	Button,
	Card,
	CardBody,
	IconButton,
	List,
	ListItem,
	Typography,
	Menu,
	MenuHandler,
	MenuList,
	MenuItem,
} from '@material-tailwind/react';
import moment from 'moment';
import { useEffect, useRef, useState } from 'react';
import {
	createCourseStudentTest,
	fetchCourseStudentTest,
	fetchTest,
} from '../../../../features/testSlice';
import {
	ChevronLeft,
	ChevronRight,
	ListTodo,
	NotebookText,
	Pencil,
	MoreVertical,
} from 'lucide-react';
import { fetchUser } from '../../../../features/userSlice';
import ResultsTestPdf from './resultsTestPdf';
import { useReactToPrint } from 'react-to-print';

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
	const { course, auth, user, test } = useSelector(
		(state: RootState) => ({
			course: state.courses,
			auth: state.auth,
			user: state.users,
			test: state.tests,
		})
	);

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
			})
		);
	}, [dispatch, course.currentPage, course.pageSize]);

	const navigateCourseStudentTest = async (
		CS: courseStudent,
		date: string
	) => {
		await dispatch(
			fetchSubjects({
				course_id: CS.course_id ? CS.course_id : -1,
				status: true,
				is_schedulable: true,
			})
		);
		await dispatch(fetchCourse(CS.course_id ? CS.course_id : -1));
		await dispatch(fetchCourseStudent(CS.id ? CS.id : -1));
		const CST = await dispatch(
			createCourseStudentTest({
				course_student_id: CS.id ? CS.id : -1,
				date: date,
			})
		).unwrap();
		await dispatch(fetchTest(CST.test_id));
		navigate(`../new_test/${CS.id}/${CS.course_id}/${CST.test_id}`);
	};

	const navigateReviewTest = async (
		CST_id: number,
		test_id: number,
		course_id: number,
		CS_id: number,
		user_id: number
	) => {
		navigate(
			`../review_test/${CST_id}/${test_id}/${course_id}/${CS_id}/${user_id}`
		);
	};

	const seeReults = async (
		CST_id: number,
		course_id: number,
		user_id: number
	) => {
		const userdata = await dispatch(fetchUser(user_id)).unwrap();
		const coursedata = await dispatch(
			fetchCourse(course_id)
		).unwrap();
		const testData = await dispatch(
			fetchCourseStudentTest(CST_id)
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
					})
				);
				setActive(index);
			},
			className: 'rounded-full',
		} as any);

	const next = async () => {
		if (active === totalPages) return;
		setActive(active + 1);
		await dispatch(
			fetchCoursesStudentsTests({
				pageSize,
				currentPage: active + 1,
				course_type_id: 1,
			})
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
			})
		);
	};

	const seeResults = async () => {
		handlePrint();
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

	return (
		<div className="container mx-auto px-2 sm:px-4">
			<PageTitle title="Examenes" breadCrumbs={breadCrumbs} />

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
									active = exams_submitted <= maxTries;
									lastTest = CL.course_student_tests?.slice(-1)[0];
								}

								if (CL.schedules?.length === 0) {
									active = false;
								} else {
									dateTest = CL.schedules
										? moment(
												`${CL.schedules[0].date} ${CL.schedules[0].hour}`
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
									const currentDate = moment();
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

													{selfUser && exams_submitted > 0 && (
														<Typography
															variant="small"
															className="text-xs sm:text-sm text-red-600 bg-red-50 px-2 py-1 rounded"
															placeholder={undefined}
															onPointerEnterCapture={undefined}
															onPointerLeaveCapture={undefined}
														>
															Intentos {exams_submitted} / {maxTries}
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

													{CL.score && selfUser && (
														<Typography
															variant="small"
															className="text-xs sm:text-sm font-semibold text-red-600 mt-1"
															placeholder={undefined}
															onPointerEnterCapture={undefined}
															onPointerLeaveCapture={undefined}
														>
															Calificación: {CL.score} Puntos
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
															disabled={!active}
															onClick={() => {
																navigateCourseStudentTest(
																	CL,
																	dateTest
																		? dateTest.format('YYYY-MM-DD')
																		: '-1'
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
																			user_id
																		);
																	}}
																	placeholder={undefined}
																	onPointerEnterCapture={undefined}
																	onPointerLeaveCapture={undefined}
																>
																	<ListTodo size={15} />
																</Button>
															)}

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
																			user_id
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
																disabled={!active}
																onClick={() => {
																	navigateCourseStudentTest(
																		CL,
																		dateTest
																			? dateTest.format('YYYY-MM-DD')
																			: '-1'
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
																				user_id
																			);
																		}}
																		placeholder={undefined}
																		onPointerEnterCapture={undefined}
																		onPointerLeaveCapture={undefined}
																	>
																		<ListTodo size={15} />
																		<span>Ver respuestas</span>
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
																				user_id
																			);
																		}}
																		placeholder={undefined}
																		onPointerEnterCapture={undefined}
																		onPointerLeaveCapture={undefined}
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

			<div style={{ display: 'none' }}>
				<div ref={componentRef} className="flex flex-col w-full">
					<ResultsTestPdf course={course} test={test} user={user} />
				</div>
			</div>
		</div>
	);
};

export default GeneralTest;

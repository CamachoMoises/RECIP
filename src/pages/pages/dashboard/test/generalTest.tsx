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
	ButtonGroup,
	Card,
	CardBody,
	List,
	ListItem,
	ListItemPrefix,
	ListItemSuffix,
	Typography,
} from '@material-tailwind/react';
import moment from 'moment';
import { useEffect, useRef } from 'react';
import {
	createCourseStudentTest,
	fetchCourseStudentTest,
	fetchTest,
} from '../../../../features/testSlice';
import { ListTodo, NotebookText, Pencil } from 'lucide-react';
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
		(state: RootState) => {
			return {
				course: state.courses,
				auth: state.auth,
				user: state.users,
				test: state.tests,
			};
		}
	);
	useEffect(() => {
		dispatch(fetchCoursesStudentsTests(1));
	}, [dispatch]);
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
		console.log(CST_id, course_id, user_id);
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
	const seeResults = async () => {
		handlePrint();
	};
	const handlePrint = useReactToPrint({
		contentRef: componentRef,
		documentTitle: `Examen-${test.testSelected?.code}`,
	});
	if (course.status === 'loading') {
		return (
			<>
				<LoadingPage />
			</>
		);
	}
	if (course.status === 'failed') {
		return (
			<>
				<ErrorPage
					error={course.error ? course.error : 'Indefinido'}
				/>
			</>
		);
	}

	return (
		<div className=" container">
			<PageTitle title="Examenes" breadCrumbs={breadCrumbs} />
			<div className="flex flex-col pt-4">
				<Card
					placeholder={undefined}
					onPointerEnterCapture={undefined}
					onPointerLeaveCapture={undefined}
				>
					<CardBody
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
								if (CL.course_student_tests?.length) {
									active = CL.course_student_tests.length <= maxTries;
									lastTest = CL.course_student_tests.slice(-1)[0];
								}
								if (CL.schedules?.length === 0) {
									active = false;
								} else {
									dateTest = CL.schedules
										? moment(
												`${CL.schedules[0].date}  ${CL.schedules[0].hour}`
										  )
										: null;
								}
								if (
									CL.student &&
									CL.student.user?.id != auth.user?.id
								) {
									active = false;
								}
								if (CL.schedules && CL.schedules[0]) {
									instructor = CL.schedules[0].instructor;
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
										placeholder={undefined}
										onPointerEnterCapture={undefined}
										onPointerLeaveCapture={undefined}
									>
										<ListItemPrefix
											placeholder={undefined}
											onPointerEnterCapture={undefined}
											onPointerLeaveCapture={undefined}
										>
											{CL.code}
											{CL.course_student_tests &&
												CL.course_student_tests.length > 0 && (
													<Typography
														color="red"
														variant="small"
														placeholder={undefined}
														onPointerEnterCapture={undefined}
														onPointerLeaveCapture={undefined}
													>
														Intentos {CL.course_student_tests.length}{' '}
														/ {maxTries}
													</Typography>
												)}
										</ListItemPrefix>
										<div className="flex flex-row ">
											<div className="flex flex-col">
												<Typography
													variant="h6"
													color="blue-gray"
													placeholder={undefined}
													onPointerEnterCapture={undefined}
													onPointerLeaveCapture={undefined}
												>
													Participante:{' '}
													{CL.student?.user?.name
														? `${CL.student.user.name} ${CL.student.user.last_name}`
														: 'Sin Piloto'}{' '}
												</Typography>
												<Typography
													variant="small"
													color="gray"
													className="font-normal"
													placeholder={undefined}
													onPointerEnterCapture={undefined}
													onPointerLeaveCapture={undefined}
												>
													{CL.course?.name} {CL.course?.description}
													Fecha:({dateTest?.format('DD-MM-YYYY')})
													Hora de inicio:({dateTest?.format('HH:mm')})
												</Typography>
												{instructor && (
													<div className="flex flex-col gap-2">
														<Typography
															variant="small"
															color="gray"
															className="font-normal"
															placeholder={undefined}
															onPointerEnterCapture={undefined}
															onPointerLeaveCapture={undefined}
														>
															Instructor: {instructor.user?.name}{' '}
															{instructor.user?.last_name}
														</Typography>
														{CL.score && (
															<Typography
																variant="small"
																color="red"
																className="font-normal"
																placeholder={undefined}
																onPointerEnterCapture={undefined}
																onPointerLeaveCapture={undefined}
															>
																Calificacion: {CL.score} Puntos
															</Typography>
														)}
													</div>
												)}
											</div>
										</div>
										<ListItemSuffix
											placeholder={undefined}
											onPointerEnterCapture={undefined}
											onPointerLeaveCapture={undefined}
										>
											<ButtonGroup
												size="sm"
												placeholder={undefined}
												onPointerEnterCapture={undefined}
												onPointerLeaveCapture={undefined}
											>
												<Button
													title="Iniciar examen"
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
															disabled={
																active &&
																CL.student?.user?.id != auth.user?.id
															}
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
											</ButtonGroup>
										</ListItemSuffix>
									</ListItem>
								);
							})}
						</List>
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

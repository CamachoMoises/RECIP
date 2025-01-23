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
import { useEffect } from 'react';
import {
	createCourseStudentTest,
	fetchTest,
} from '../../../../features/testSlice';
import { NotebookText, Pencil } from 'lucide-react';
const breadCrumbs: breadCrumbsItems[] = [
	{
		name: 'Inicio',
		href: '/dashboard',
	},
];

const GeneralTest = () => {
	const dispatch = useDispatch<AppDispatch>();
	const navigate = useNavigate();
	const { course, auth } = useSelector((state: RootState) => {
		return { course: state.courses, auth: state.auth };
	});
	useEffect(() => {
		dispatch(fetchCoursesStudentsTests(1));
	}, [dispatch]);
	const navigateCourseStudentTest = async (
		CS: courseStudent,
		date: string
	) => {
		await dispatch(fetchSubjects(CS.course_id ? CS.course_id : -1));
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
								let active = true;
								let dateTest = null;
								let horas = null;
								if (CL.course_student_tests?.length) {
									active = CL.course_student_tests.length <= maxTries;
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
											{CL.course_student_tests && (
												<small className="text-red-800">
													Intentos {CL.course_student_tests.length} /{' '}
													{maxTries}
												</small>
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
													<>
														<Typography
															variant="small"
															color="gray"
															className="font-normal"
															placeholder={undefined}
															onPointerEnterCapture={undefined}
															onPointerLeaveCapture={undefined}
														>
															Instructor:{' '}{instructor.user?.name}{' '}
															{instructor.user?.last_name}
														</Typography>
													</>
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
												<Button
													title="Revisión"
													placeholder={undefined}
													onPointerEnterCapture={undefined}
													onPointerLeaveCapture={undefined}
												>
													<NotebookText size={15} />
												</Button>
											</ButtonGroup>
										</ListItemSuffix>
									</ListItem>
								);
							})}
						</List>
					</CardBody>
				</Card>
			</div>
		</div>
	);
};

export default GeneralTest;

import { AppDispatch, RootState } from '../../../../store';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import PageTitle from '../../../../components/PageTitle';

import { fetchSubjects } from '../../../../features/subjectSlice';
import {
	fetchCourse,
	fetchCourseStudent,
	fetchCourses,
	fetchCoursesStudents,
} from '../../../../features/courseSlice';
import {
	breadCrumbsItems,
	courseStudent,
} from '../../../../types/utilities';
import LoadingPage from '../../../../components/LoadingPage';
import ErrorPage from '../../../../components/ErrorPage';
import {
	Card,
	CardBody,
	List,
	ListItem,
	ListItemPrefix,
	Typography,
} from '@material-tailwind/react';
import moment from 'moment';
import { useEffect } from 'react';
import {
	createCourseStudentTest,
	fetchQuestions,
} from '../../../../features/testSlice';
const breadCrumbs: breadCrumbsItems[] = [
	{
		name: 'Dashboard',
		href: '/dashboard',
	},
];

const GeneralTest = () => {
	const dispatch = useDispatch<AppDispatch>();
	const navigate = useNavigate();
	const { courseStudentList, status, error } = useSelector(
		(state: RootState) => {
			return (
				state.courses || {
					courseList: [],
					status: 'idle2',
					error: null,
				}
			);
		}
	);
	useEffect(() => {
		dispatch(fetchCourses());
		dispatch(fetchCoursesStudents());
	}, [dispatch]);
	const navigateCourseStudentTest = async (
		CL: courseStudent,
		date: string
	) => {
		await dispatch(fetchSubjects(CL.course_id ? CL.course_id : -1));
		await dispatch(fetchCourse(CL.course_id ? CL.course_id : -1));
		await dispatch(fetchCourseStudent(CL.id ? CL.id : -1));
		await dispatch(fetchQuestions(1));
		await dispatch(
			createCourseStudentTest({
				course_student_id: CL.id ? CL.id : -1,
				test_id: 1,
				date: date,
			})
		);
		navigate(`../new_test/${CL.id}/${CL.course_id}`);
	};
	if (status === 'loading') {
		return (
			<>
				<LoadingPage />
			</>
		);
	}
	if (status === 'failed') {
		return (
			<>
				<ErrorPage error={error ? error : 'Indefinido'} />
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
							{courseStudentList?.map((CL) => {
								let active = true;
								let dateTest = null;
								let horas = null;
								if (CL.course_student_tests?.length) {
									active = CL.course_student_tests.length < 5;
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
										// disabled={moment()
										// 	.startOf('day')
										// 	.isAfter(
										// 		moment(`${courseStudent?.date}`).startOf('day')
										// 	)}
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
										<ListItemPrefix
											placeholder={undefined}
											onPointerEnterCapture={undefined}
											onPointerLeaveCapture={undefined}
										>
											{CL.code}
											{CL.course_student_tests && (
												<small className="text-red-800">
													Intentos {CL.course_student_tests.length}
												</small>
											)}
										</ListItemPrefix>
										<div>
											<Typography
												variant="h6"
												color="blue-gray"
												placeholder={undefined}
												onPointerEnterCapture={undefined}
												onPointerLeaveCapture={undefined}
											>
												{CL.student?.user?.name
													? `${CL.student.user.name} ${CL.student.user.last_name}`
													: 'Sin Piloto'}{' '}
												Fecha:
												{dateTest?.format('DD-MM-YYYY')} Hora:{' '}
												{dateTest?.format('HH:mm')}
											</Typography>
											<Typography
												variant="small"
												color="gray"
												className="font-normal"
												placeholder={undefined}
												onPointerEnterCapture={undefined}
												onPointerLeaveCapture={undefined}
											>
												{CL.course?.name} {CL.course?.description} (
												{CL.course?.course_type.name})
											</Typography>
										</div>
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

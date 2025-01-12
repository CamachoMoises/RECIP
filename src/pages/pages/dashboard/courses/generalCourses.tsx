import {
	Button,
	ButtonGroup,
	Card,
	CardBody,
	List,
	ListItem,
	ListItemPrefix,
	Typography,
} from '@material-tailwind/react';
import {
	breadCrumbsItems,
	courseStudent,
} from '../../../../types/utilities';
import PageTitle from '../../../../components/PageTitle';
import { AppDispatch, RootState } from '../../../../store';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import {
	createCourseStudent,
	fetchCourse,
	fetchCourseStudent,
	fetchCourses,
	fetchCoursesStudents,
	fetchSchedule,
} from '../../../../features/courseSlice';
import LoadingPage from '../../../../components/LoadingPage';
import ErrorPage from '../../../../components/ErrorPage';

import { CalendarCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { fetchSubjects } from '../../../../features/subjectSlice';
import {
	fetchInstructors,
	fetchStudents,
} from '../../../../features/userSlice';
const breadCrumbs: breadCrumbsItems[] = [
	{
		name: 'Inicio',
		href: '/dashboard',
	},
];
const GeneralCourses = () => {
	const dispatch = useDispatch<AppDispatch>();

	const navigate = useNavigate();

	const { courseList, courseStudentList, status, error } =
		useSelector((state: RootState) => {
			return state.courses;
		});
	useEffect(() => {
		dispatch(fetchCourses());
		dispatch(fetchCoursesStudents());
	}, [dispatch]);

	const handleNewCourseSchedule = async (course_id: number) => {
		const CS = await dispatch(
			createCourseStudent(course_id)
		).unwrap();
		await dispatch(fetchSubjects(CS.course_id ? CS.course_id : -1));
		await dispatch(fetchCourse(CS.course_id ? CS.course_id : -1));
		await dispatch(fetchInstructors());
		await dispatch(fetchStudents());
		await dispatch(fetchSchedule(CS.id ? CS.id : -1));
		navigate(`../new_course/${CS.id}/${CS.course_id}`);
	};
	const navigateCourseStudent = async (CS: courseStudent) => {
		await dispatch(fetchSubjects(CS.course_id ? CS.course_id : -1));
		await dispatch(fetchCourse(CS.course_id ? CS.course_id : -1));
		await dispatch(fetchCourseStudent(CS.id ? CS.id : -1));
		await dispatch(fetchInstructors());
		await dispatch(fetchStudents());
		await dispatch(fetchSchedule(CS.id ? CS.id : -1));
		navigate(`../new_course/${CS.id}/${CS.course_id}`);
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
		<div className="container">
			<PageTitle title="Cursos" breadCrumbs={breadCrumbs} />
			<div className="flex flex-col">
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
						<div className="grid grid-cols-2 gap-2">
							{/* <code>{JSON.stringify(courseList, null, 4)}</code> */}
							{courseList.map((course) => {
								return (
									<div key={course.id}>
										<Card
											placeholder={undefined}
											onPointerEnterCapture={undefined}
											onPointerLeaveCapture={undefined}
										>
											<CardBody
												placeholder={undefined}
												onPointerEnterCapture={undefined}
												onPointerLeaveCapture={undefined}
												className="flex flex-col justify-center"
											>
												<Typography
													placeholder={undefined}
													onPointerEnterCapture={undefined}
													onPointerLeaveCapture
													variant="lead"
												>
													{course.name}
												</Typography>
												<Typography
													placeholder={undefined}
													onPointerEnterCapture={undefined}
													onPointerLeaveCapture
													variant="small"
												>
													{course.course_level.name}
												</Typography>
												<Typography
													placeholder={undefined}
													onPointerEnterCapture={undefined}
													onPointerLeaveCapture={undefined}
												>
													{course.course_type.name}
												</Typography>
												<div className="flex flex-row justify-center">
													<ButtonGroup
														size="sm"
														placeholder={undefined}
														onPointerEnterCapture={undefined}
														onPointerLeaveCapture={undefined}
													>
														<Button
															title="Agendar nuevo curso"
															className="flex flex-col justify-center text-center align-middle"
															placeholder={undefined}
															onPointerEnterCapture={undefined}
															onPointerLeaveCapture={undefined}
															onClick={() =>
																handleNewCourseSchedule(
																	course.id ? course.id : -1
																)
															}
														>
															Agendar nuevo curso
															<div className="flex flex-row w-full justify-center">
																<CalendarCheck size={20} />
															</div>
														</Button>
													</ButtonGroup>
												</div>
											</CardBody>
										</Card>
									</div>
								);
							})}
						</div>
					</CardBody>
				</Card>
			</div>

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
						<Typography
							variant="h5"
							placeholder={undefined}
							onPointerEnterCapture={undefined}
							onPointerLeaveCapture={undefined}
						>
							Agenda de Cursos a pilotos o participantes
						</Typography>
						<List
							placeholder={undefined}
							onPointerEnterCapture={undefined}
							onPointerLeaveCapture={undefined}
						>
							{courseStudentList?.map((CL) => (
								<ListItem
									key={`${CL.id}.courseList`}
									placeholder={undefined}
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
									onClick={() => {
										navigateCourseStudent(CL);
									}}
								>
									<ListItemPrefix
										placeholder={undefined}
										onPointerEnterCapture={undefined}
										onPointerLeaveCapture={undefined}
									>
										{CL.code}
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
												: 'Sin Piloto'}
										</Typography>
										<Typography
											variant="small"
											color="gray"
											className="font-normal"
											placeholder={undefined}
											onPointerEnterCapture={undefined}
											onPointerLeaveCapture={undefined}
										>
											{CL.course?.name} (
											{CL.course?.course_level.name}-
											{CL.course?.course_type.name})
										</Typography>
									</div>
								</ListItem>
							))}
						</List>
					</CardBody>
				</Card>
			</div>
		</div>
	);
};

export default GeneralCourses;

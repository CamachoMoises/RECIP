import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../../store';
import {
	breadCrumbsItems,
	courseStudent,
} from '../../../../types/utilities';
import { useNavigate } from 'react-router-dom';
import LoadingPage from '../../../../components/LoadingPage';
import ErrorPage from '../../../../components/ErrorPage';
import PageTitle from '../../../../components/PageTitle';
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
// import { fetchSubjectsLesson } from '../../../../features/subjectSlice';
import {
	// fetchCourse,
	fetchCoursesStudentsTests,
	// fetchSchedule,
} from '../../../../features/courseSlice';
// import {
// 	fetchInstructors,
// 	fetchStudents,
// } from '../../../../features/userSlice';
import { useEffect } from 'react';
import { NotebookText } from 'lucide-react';
import {
	createCourseStudentAssessment,
	fetchCourseStudentAssessment,
} from '../../../../features/assessmentSlice';
const breadCrumbs: breadCrumbsItems[] = [
	{
		name: 'Inicio',
		href: '/dashboard',
	},
];
const GeneralAssessment = () => {
	const dispatch = useDispatch<AppDispatch>();
	const navigate = useNavigate();
	const { course, assessment } = useSelector((state: RootState) => {
		return { course: state.courses, assessment: state.assessment };
	});
	console.log(course.courseStudentList);

	useEffect(() => {
		dispatch(fetchCoursesStudentsTests(2));
	}, [dispatch]);
	const navigateCourseStudentAssessment = async (
		CS: courseStudent
	) => {
		if (CS.course_student_assessment?.id) {
			await dispatch(
				fetchCourseStudentAssessment(CS.course_student_assessment.id)
			);
		} else {
			await dispatch(
				createCourseStudentAssessment({
					course_student_id: CS.id ? CS.id : -1,
					course_id: CS.course_id,
					student_id: CS.student_id ? CS.student_id : -1,
				})
			);
		}

		await dispatch(fetchCoursesStudentsTests(2));
		navigate(`../course_assessment/${CS.id}/${CS.course_id}`);
	};
	if (course.status === 'loading') {
		return (
			<>
				<LoadingPage />
			</>
		);
	}
	if (assessment.status === 'failed') {
		return (
			<>
				<ErrorPage
					error={assessment.error ? assessment.error : 'Indefinido'}
				/>
			</>
		);
	}

	return (
		<div className=" container">
			<PageTitle title="Evaluaciones" breadCrumbs={breadCrumbs} />
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
							{course.courseStudentList?.map((CS) => (
								<ListItem
									key={`${CS.id}.courseList`}
									placeholder={undefined}
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
								>
									<ListItemPrefix
										placeholder={undefined}
										onPointerEnterCapture={undefined}
										onPointerLeaveCapture={undefined}
									>
										{CS.code}
										<br />
										{CS.course_student_assessment && (
											<>Evaluacion Iniciada</>
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
											{CS.student?.user?.name
												? `${CS.student.user.name} ${CS.student.user.last_name}`
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
											{CS.course?.name} {CS.course?.description}(
											{CS.course?.course_level.name}) (
											{CS.course?.course_type.name})
										</Typography>
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
												title="Evaluacion del piloto"
												placeholder={undefined}
												onPointerEnterCapture={undefined}
												onPointerLeaveCapture={undefined}
												onClick={() => {
													navigateCourseStudentAssessment(CS);
												}}
											>
												<NotebookText size={15} />
											</Button>
										</ButtonGroup>
									</ListItemSuffix>
								</ListItem>
							))}
						</List>
					</CardBody>
				</Card>
				<code></code>
			</div>
		</div>
	);
};

export default GeneralAssessment;

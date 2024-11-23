import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../../store';
import {
	breadCrumbsItems,
	courseStudent,
} from '../../../../types/utilidades';
import { useNavigate } from 'react-router-dom';
import LoadingPage from '../../../../components/LoadingPage';
import ErrorPage from '../../../../components/ErrorPage';
import PageTitle from '../../../../components/PageTitle';
import {
	Card,
	CardBody,
	List,
	ListItem,
	ListItemPrefix,
	Typography,
} from '@material-tailwind/react';
import { fetchSubjects } from '../../../../features/subjectSlice';
import {
	fetchCourse,
	fetchCourseStudent,
	fetchSchedule,
} from '../../../../features/courseSlice';
import {
	fetchInstructors,
	fetchStudents,
} from '../../../../features/userSlice';
const breadCrumbs: breadCrumbsItems[] = [
	{
		name: 'Dashboard',
		href: '/dashboard',
	},
];
const GenerealAssessment = () => {
	const dispatch = useDispatch<AppDispatch>();
	const navigate = useNavigate();
	const {
		courseList,
		courseStudentList,
		status,
		error,
		courseStudent,
	} = useSelector((state: RootState) => {
		console.log(state);

		return (
			state.courses || {
				courseList: [],
				status: 'idle2',
				error: null,
			}
		);
	});
	const navigateCourseStudentAssessment = async (
		CL: courseStudent
	) => {
		await dispatch(fetchSubjects(CL.course_id ? CL.course_id : -1));
		await dispatch(fetchCourse(CL.course_id ? CL.course_id : -1));
		await dispatch(fetchCourseStudent(CL.id ? CL.id : -1));
		await dispatch(fetchInstructors());
		await dispatch(fetchStudents());
		await dispatch(fetchSchedule(CL.id ? CL.id : -1));
		navigate(`../course_assessment/${CL.id}/${CL.course_id}`);
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
							{courseStudentList?.map((CL) => (
								<ListItem
									key={`${CL.id}.courseList`}
									placeholder={undefined}
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
									onClick={() => {
										navigateCourseStudentAssessment(CL);
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
											{CL.course?.name} {CL.course?.description} (
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

export default GenerealAssessment;

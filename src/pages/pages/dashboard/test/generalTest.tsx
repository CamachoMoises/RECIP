import { AppDispatch, RootState } from '../../../../store';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import PageTitle from '../../../../components/PageTitle';

import { fetchSubjects } from '../../../../features/subjectSlice';
import { fetchCourseStudent } from '../../../../features/courseSlice';
import {
	breadCrumbsItems,
	courseStudent,
} from '../../../../types/utilidades';
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
const breadCrumbs: breadCrumbsItems[] = [
	{
		name: 'Dashboard',
		href: '/dashboard',
	},
];

const GeneralTest = () => {
	const dispatch = useDispatch<AppDispatch>();
	const navigate = useNavigate();
	console.log('GENERAL TEST');
	const { courseStudentList, status, error, courseStudent } =
		useSelector((state: RootState) => {
			return (
				state.courses || {
					courseList: [],
					status: 'idle2',
					error: null,
				}
			);
		});
	const navigateCourseStudentTest = async (CL: courseStudent) => {
		await dispatch(fetchSubjects(CL.course_id ? CL.course_id : -1));
		// await dispatch(fetchCourse(CL.course_id ? CL.course_id : -1));
		await dispatch(fetchCourseStudent(CL.id ? CL.id : -1));
		// await dispatch(fetchSchedule(CL.id ? CL.id : -1));
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
							{courseStudentList?.map((CL) => (
								<ListItem
									key={`${CL.id}.courseList`}
									placeholder={undefined}
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
									disabled={moment()
										.startOf('day')
										.isAfter(
											moment(`${courseStudent?.date}`).startOf('day')
										)}
									onClick={() => {
										navigateCourseStudentTest(CL);
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
												: 'Sin Piloto'}{' '}
											Fecha:
											{moment(`${courseStudent?.date}`).format(
												'DD-MM-YYYY'
											)}{' '}
											Hora: 15:00pm
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

export default GeneralTest;

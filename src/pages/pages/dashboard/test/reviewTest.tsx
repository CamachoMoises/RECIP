// import { useRef } from 'react';
import { useEffect, useState } from 'react';
import { AppDispatch, RootState } from '../../../../store';
import { useDispatch, useSelector } from 'react-redux';

import { useParams } from 'react-router-dom';
import {
	fetchCourseStudentTest,
	fetchTest,
} from '../../../../features/testSlice';
import {
	fetchCourse,
	fetchCourseStudent,
} from '../../../../features/courseSlice';
import { fetchUser } from '../../../../features/userSlice';
import PageTitle from '../../../../components/PageTitle';
import { breadCrumbsItems } from '../../../../types/utilities';
import {
	Card,
	CardBody,
	List,
	Typography,
} from '@material-tailwind/react';
import ReviewItemList from './reviewItemList';
const breadCrumbs: breadCrumbsItems[] = [
	{
		name: 'Inicio',
		href: '/dashboard',
	},
	{
		name: 'Examenes',
		href: '/dashboard/test',
	},
];
const ReviewTest = () => {
	// const componentRef = useRef<HTMLDivElement>(null);
	const dispatch = useDispatch<AppDispatch>();
	const [editing, setEditing] = useState(false);
	const { course, test, user } = useSelector((state: RootState) => {
		return {
			course: state.courses,
			test: state.tests,
			user: state.users,
		};
	});
	const type_trip = ['', 'PIC', 'SIC', 'TRIP'];
	const license = ['', 'ATP', 'Commercial', 'Privado'];
	const regulation = ['', 'INAC', 'No-INAC'];
	const { CST_id, test_id, course_id, CS_id, user_id } = useParams<{
		CST_id: string;
		test_id: string;
		course_id: string;
		CS_id: string;
		user_id: string;
	}>();
	const questions =
		test.courseStudentTestSelected?.course_student_test_questions;
	useEffect(() => {
		dispatch(fetchCourseStudentTest(CST_id ? parseInt(CST_id) : -1));
		dispatch(fetchCourseStudent(CS_id ? parseInt(CS_id) : -1));
		dispatch(fetchTest(test_id ? parseInt(test_id) : -1));
		dispatch(fetchCourse(course_id ? parseInt(course_id) : -1));
		dispatch(fetchUser(user_id ? parseInt(user_id) : -1));
	}, [dispatch, CST_id, test_id, course_id, CS_id, user_id]);

	return (
		<>
			<PageTitle
				title={`Revision del examen ${test.courseStudentTestSelected?.code} (${test.testSelected?.code})`}
				breadCrumbs={breadCrumbs}
			/>
			<div className="flex flex-col gap-3">
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
							<div className="flex flex-col gap-2">
								<Typography
									variant="h5"
									placeholder={undefined}
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
								>
									Curso {course.courseSelected?.course_level.name}{' '}
									{course.courseSelected?.name}
								</Typography>
								<div className="flex flex-row justify-between">
									<Typography
										variant="h6"
										placeholder={undefined}
										onPointerEnterCapture={undefined}
										onPointerLeaveCapture={undefined}
									>
										<strong>Nombre del participante:</strong>
										<br />
										{user.userSelected?.name}{' '}
										{user.userSelected?.last_name}
									</Typography>
									<Typography
										variant="h6"
										placeholder={undefined}
										onPointerEnterCapture={undefined}
										onPointerLeaveCapture={undefined}
									>
										<strong>Correo:</strong>
										<br />
										{user.userSelected?.email}
									</Typography>
									<Typography
										variant="h6"
										placeholder={undefined}
										onPointerEnterCapture={undefined}
										onPointerLeaveCapture={undefined}
									>
										<strong>Tipo:</strong> <br />
										{
											type_trip[
												course.courseStudent?.type_trip
													? course.courseStudent.type_trip
													: 0
											]
										}
									</Typography>
									<Typography
										variant="h6"
										placeholder={undefined}
										onPointerEnterCapture={undefined}
										onPointerLeaveCapture={undefined}
									>
										<strong>Normativa:</strong> <br />
										{
											regulation[
												course.courseStudent?.regulation
													? course.courseStudent.regulation
													: 0
											]
										}
									</Typography>
									<Typography
										variant="h6"
										placeholder={undefined}
										onPointerEnterCapture={undefined}
										onPointerLeaveCapture={undefined}
									>
										<strong>Licencia:</strong> <br />
										{
											license[
												course.courseStudent?.license
													? course.courseStudent.license
													: 0
											]
										}
									</Typography>
								</div>
								<div className="flex flex-row justify-around">
									<Typography
										variant="h6"
										placeholder={undefined}
										onPointerEnterCapture={undefined}
										onPointerLeaveCapture={undefined}
									>
										<strong>Telefono:</strong> <br />
										{user.userSelected?.phone}
									</Typography>
									<Typography
										variant="h6"
										placeholder={undefined}
										onPointerEnterCapture={undefined}
										onPointerLeaveCapture={undefined}
									>
										<strong>Identificacion:</strong>
										<br />
										{user.userSelected?.user_doc_type?.symbol}-
										{user.userSelected?.doc_number}
									</Typography>
								</div>

								<div className="flex flex-col text-center">
									<Typography
										variant="h5"
										placeholder={undefined}
										onPointerEnterCapture={undefined}
										onPointerLeaveCapture={undefined}
									>
										Respuestas
									</Typography>
								</div>
								<List
									placeholder={undefined}
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
								>
									{questions?.map((question, index) => {
										return (
											<ReviewItemList
												key={`TQ-${index}`}
												index={index}
												editing={editing}
												setEditing={setEditing}
												question={question}
											/>
										);
									})}
								</List>
							</div>
						</CardBody>
					</Card>
				</div>
			</div>
		</>
	);
};

export default ReviewTest;

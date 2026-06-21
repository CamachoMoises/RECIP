import {
	Card,
	CardBody,
	Typography,
} from '@material-tailwind/react';
import { breadCrumbsItems, courseStudent } from '../../../types/utilities';
import PageTitle from '../../../components/PageTitle';
import { AppDispatch, RootState } from '../../../store';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { fetchMyCoursesStudents } from '../../../features/courseSlice';
import LoadingPage from '../../../components/LoadingPage';
import ErrorPage from '../../../components/ErrorPage';
import { useNavigate } from 'react-router-dom';
import { fetchSubjects } from '../../../features/subjectSlice';
import { fetchInstructors, fetchStudents } from '../../../features/userSlice';
import { fetchCourse, fetchCourseStudent, fetchSchedule } from '../../../features/courseSlice';
import StudentCourseList from './StudentCourseList';

const breadCrumbs: breadCrumbsItems[] = [
	{
		name: 'Inicio',
		href: '/dashboard',
	},
];

const StudentCourses = () => {
	const dispatch = useDispatch<AppDispatch>();
	const navigate = useNavigate();

	const {
		courseStudentList,
		status,
		error,
		currentPage,
		totalPages,
		totalItems,
	} = useSelector((state: RootState) => {
		return state.courses;
	});

	const { userLogged } = useSelector(
		(state: RootState) => state.users,
	);

	const student_id = userLogged?.student?.id;

	const [active, setActive] = useState(1);
	const fixedPageSize = 5;

	const fetchWithFilter = (page: number = 1) => {
		if (student_id) {
			dispatch(
				fetchMyCoursesStudents({
					currentPage: page,
					pageSize: fixedPageSize,
					student_id,
					status: true,
				}),
			);
		}
	};

	useEffect(() => {
		if (student_id) {
			fetchWithFilter(1);
		}
	}, [dispatch, student_id]);

	useEffect(() => {
		setActive(currentPage);
	}, [currentPage]);

	const getItemProps = (index: number) =>
		({
			variant: active === index ? 'filled' : 'text',
			color: 'gray',
			onClick: async () => {
				fetchWithFilter(index);
				setActive(index);
			},
			className: 'rounded-full',
		}) as any;

	const next = async () => {
		if (active === totalPages) return;
		const nextPage = active + 1;
		setActive(nextPage);
		fetchWithFilter(nextPage);
	};

	const prev = async () => {
		if (active === 1) return;
		const prevPage = active - 1;
		setActive(prevPage);
		fetchWithFilter(prevPage);
	};

	const navigateViewCourseStudent = async (CS: courseStudent) => {
		await dispatch(
			fetchSubjects({
				course_id: CS.course_id ? CS.course_id : -1,
				status: true,
				is_schedulable: true,
			}),
		);
		await dispatch(fetchCourse(CS.course_id ? CS.course_id : -1));
		await dispatch(fetchCourseStudent(CS.id ? CS.id : -1));
		await dispatch(fetchInstructors({ status: true }));
		await dispatch(fetchStudents({ status: true }));
		await dispatch(fetchSchedule(CS.id ? CS.id : -1));
		navigate(`../view_course/${CS.id}/${CS.course_id}`);
	};

	if (status === 'loading' && !courseStudentList) {
		return <LoadingPage />;
	}

	if (status === 'failed') {
		return <ErrorPage error={error ? error : 'Indefinido'} />;
	}

	const pages =
		totalPages > 0
			? Array.from({ length: totalPages }, (_, i) => ({
					id: i,
					name: `Pagina ${i + 1}`,
				}))
			: [];

	return (
		<div className="container">
			<PageTitle
				title="Mis Cursos"
				breadCrumbs={breadCrumbs}
			/>

			<Card
				placeholder={undefined}
				onPointerEnterCapture={undefined}
				onPointerLeaveCapture={undefined}
				className="mt-4"
			>
				<CardBody
					placeholder={undefined}
					onPointerEnterCapture={undefined}
					onPointerLeaveCapture={undefined}
				>
					<Typography
						variant="h5"
						className="text-center lg:text-left text-sm sm:text-base md:text-lg"
						placeholder={undefined}
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
					>
						Mis Cursos Asignados
					</Typography>
				</CardBody>
			</Card>

			{!courseStudentList || courseStudentList.length === 0 ? (
				<Card
					placeholder={undefined}
					onPointerEnterCapture={undefined}
					onPointerLeaveCapture={undefined}
					className="mt-4"
				>
					<CardBody
						placeholder={undefined}
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
						className="text-center py-8"
					>
						<Typography
							variant="h5"
							color="blue-gray"
							placeholder={undefined}
							onPointerEnterCapture={undefined}
							onPointerLeaveCapture={undefined}
						>
							No tienes cursos asignados
						</Typography>
					</CardBody>
				</Card>
			) : (
				<StudentCourseList
					courseStudentList={courseStudentList}
					navigateViewCourseStudent={navigateViewCourseStudent}
					totalPages={totalPages}
					totalItems={totalItems}
					pages={pages}
					active={active}
					prev={prev}
					next={next}
					getItemProps={getItemProps}
				/>
			)}
		</div>
	);
};

export default StudentCourses;

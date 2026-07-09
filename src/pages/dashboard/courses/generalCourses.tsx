import {
	Button,
	ButtonGroup,
	Card,
	CardBody,
	Typography,
	Collapse,
} from '@material-tailwind/react';
import {
	breadCrumbsItems,
	courseStudent,
} from '../../../types/utilities';
import PageTitle from '../../../components/PageTitle';
import { AppDispatch, RootState } from '../../../store';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import {
	createCourseStudent,
	fetchCourse,
	fetchCourseStudent,
	fetchCourses,
	fetchCoursesStudents,
	fetchSchedule,
	updateCourseStudentStatus,
} from '../../../features/courseSlice';
import LoadingPage from '../../../components/LoadingPage';
import ErrorPage from '../../../components/ErrorPage';

import { CalendarCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { fetchSubjects } from '../../../features/subjectSlice';
import {
	fetchInstructors,
	fetchStudents,
} from '../../../features/userSlice';
import { PermissionsValidate } from '../../../services/permissionsValidate';
import toast from 'react-hot-toast';
import CourseGroupsSection from './courseGroupsSection';
import CourseStudentsSection from './CourseStudentsSection';
const breadCrumbs: breadCrumbsItems[] = [
	{
		name: 'Inicio',
		href: '/dashboard',
	},
];
const GeneralCourses = () => {
	const dispatch = useDispatch<AppDispatch>();

	const navigate = useNavigate();
	const {
		courseList,
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
	const isAdmin = userLogged?.is_superuser === true;
	const [open, setOpen] = useState(false);
	const [togglingId, setTogglingId] = useState<number | null>(null);
	const [statusFilter, setStatusFilter] = useState<
		boolean | undefined
	>(true);
	const [courseFilter, setCourseFilter] = useState<
		string | undefined
	>(undefined);

	const clearFilters = () => {
		setStatusFilter(true);
		setCourseFilter(undefined);
	};

	const toggleOpen = () => {
		setOpen((cur) => {
			return !cur;
		});
	};
	const canViewContent = PermissionsValidate(['staff', 'instructor']);

	const fetchWithFilter = (page: number = 1) => {
		dispatch(
			fetchCoursesStudents({
				currentPage: page,
				pageSize: fixedPageSize,
				status: statusFilter,
				course_id: courseFilter ? parseInt(courseFilter) : undefined,
			}),
		);
	};

	useEffect(() => {
		dispatch(fetchCourses());
		fetchWithFilter(1);
	}, [dispatch, statusFilter, courseFilter]);
	const [active, setActive] = useState(1);

	useEffect(() => {
		setActive(currentPage);
	}, [currentPage]);

	const fixedPageSize = 5;
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
	const handleNewCourseSchedule = async (course_id: number) => {
		const CS = await dispatch(
			createCourseStudent(course_id),
		).unwrap();
		await dispatch(
			fetchSubjects({
				course_id: CS.course_id ? CS.course_id : -1,
				status: true,
				is_schedulable: true,
			}),
		);
		await dispatch(fetchCourse(CS.course_id ? CS.course_id : -1));
		await dispatch(fetchInstructors({ status: true }));
		await dispatch(fetchStudents({ status: true }));
		await dispatch(fetchSchedule(CS.id ? CS.id : -1));
		navigate(`../new_course/${CS.id}/${CS.course_id}`);
	};
	const navigateCourseStudent = async (CS: courseStudent) => {
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
		navigate(`../new_course/${CS.id}/${CS.course_id}`);
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

	const handleToggleStatus = async (
		courseStudentId: number,
		currentStatus: boolean,
	) => {
		setTogglingId(courseStudentId);
		try {
			await dispatch(
				updateCourseStudentStatus({
					courseStudentId,
					status: !currentStatus,
				}),
			).unwrap();
			toast.success(
				!currentStatus
					? 'Registro habilitado'
					: 'Registro deshabilitado',
			);
			fetchWithFilter(active);
		} catch (error) {
			toast.error('Error al actualizar el estado');
		} finally {
			setTogglingId(null);
		}
	};

	if (status === 'loading' && !courseStudentList) {
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

	const pages =
		totalPages > 0
			? Array.from({ length: totalPages }, (_, i) => ({
					id: i,
					name: `Pagina ${i + 1}`,
				}))
			: [];
	return (
		<>
			<div className="container">
				<PageTitle
					title="Cursos Iniciales y Periodicos "
					breadCrumbs={breadCrumbs}
				/>

				{canViewContent && (
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
							<Button
								fullWidth
								color="blue"
								onClick={toggleOpen}
								placeholder={undefined}
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
							>
								Agendar piloto a un curso
							</Button>
						</CardBody>
					</Card>
				)}
				{canViewContent && (
					<Collapse open={open}>
						<Card
							className="mt-4"
							placeholder={undefined}
							onPointerEnterCapture={undefined}
							onPointerLeaveCapture={undefined}
						>
							<CardBody
								placeholder={undefined}
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
							>
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-2">
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
															{course.code}
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
																			course.id ? course.id : -1,
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
					</Collapse>
				)}

				<CourseStudentsSection
					courseStudentList={courseStudentList}
					canViewContent={canViewContent}
					navigateViewCourseStudent={navigateViewCourseStudent}
					navigateCourseStudent={navigateCourseStudent}
					handleToggleStatus={handleToggleStatus}
					togglingId={togglingId}
					isAdmin={isAdmin}
					totalPages={totalPages}
					totalItems={totalItems}
					pages={pages}
					active={active}
					prev={prev}
					next={next}
					statusFilter={statusFilter}
					setStatusFilter={setStatusFilter}
					courseFilter={courseFilter}
					setCourseFilter={setCourseFilter}
					courseList={courseList}
					onClearFilters={clearFilters}
					getItemProps={getItemProps}
				/>
				<CourseGroupsSection
					navigateViewCourseStudent={navigateViewCourseStudent}
				/>
			</div>
		</>
	);
};

export default GeneralCourses;

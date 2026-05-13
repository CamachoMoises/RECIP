import {
	Button,
	ButtonGroup,
	Card,
	CardBody,
	List,
	IconButton,
	ListItem,
	ListItemPrefix,
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

import {
	CalendarCheck,
	ChevronLeft,
	ChevronRight,
	Trash2,
	Check,
	Eye,
	Pencil,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { fetchSubjects } from '../../../features/subjectSlice';
import {
	fetchInstructors,
	fetchStudents,
} from '../../../features/userSlice';
import { PermissionsValidate } from '../../../services/permissionsValidate';
import toast from 'react-hot-toast';
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
			}),
		);
	};

	useEffect(() => {
		dispatch(fetchCourses());
		fetchWithFilter(1);
	}, [dispatch, statusFilter]);
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
								Agendar Nuevo Curso
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
								className="text-center lg:text-left text-sm sm:text-base md:text-lg"
								placeholder={undefined}
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
							>
								Agenda de Programas de Inversión para Pilotos
								<br className="hidden lg:inline" />
								Participantes en Curso
							</Typography>
							{canViewContent && (
								<div className="flex flex-wrap justify-center gap-2 mb-4">
									<Button
										size="sm"
										variant={
											statusFilter === undefined
												? 'filled'
												: 'outlined'
										}
										color="blue"
										onClick={() => setStatusFilter(undefined)}
										placeholder={undefined}
										onPointerEnterCapture={undefined}
										onPointerLeaveCapture={undefined}
									>
										Todos
									</Button>
									<Button
										size="sm"
										variant={
											statusFilter === true ? 'filled' : 'outlined'
										}
										color="green"
										onClick={() => setStatusFilter(true)}
										placeholder={undefined}
										onPointerEnterCapture={undefined}
										onPointerLeaveCapture={undefined}
									>
										Activos
									</Button>
									<Button
										size="sm"
										variant={
											statusFilter === false ? 'filled' : 'outlined'
										}
										color="red"
										onClick={() => setStatusFilter(false)}
										placeholder={undefined}
										onPointerEnterCapture={undefined}
										onPointerLeaveCapture={undefined}
									>
										Inactivos
									</Button>
								</div>
							)}

							{courseStudentList?.length === 0 ? (
								<>
									<Typography
										variant="h2"
										color="blue-gray"
										placeholder={undefined}
										onPointerEnterCapture={undefined}
										onPointerLeaveCapture={undefined}
									>
										Sin cursos agendados
									</Typography>
								</>
							) : (
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
											onClick={() => navigateViewCourseStudent(CL)}
											className={`flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-4 ${CL.status === false ? 'opacity-50' : ''}`}
										>
											<div className="min-w-0">
												<Typography
													variant="h6"
													color="blue-gray"
													className="truncate max-w-[150px] sm:max-w-none"
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
													className="font-normal truncate max-w-[200px] sm:max-w-none"
													placeholder={undefined}
													onPointerEnterCapture={undefined}
													onPointerLeaveCapture={undefined}
												>
													{CL.course?.name}{' '}
													<span className="text-xs">
														({CL.course?.course_level.name}
														-
														{CL.course?.course_type.name})
													</span>
												</Typography>
												<Typography
													variant="small"
													color="gray"
													className="font-normal"
													placeholder={undefined}
													onPointerEnterCapture={undefined}
													onPointerLeaveCapture={undefined}
												>
													{CL.code}
												</Typography>
											</div>
											<div
												onClick={(e) => e.stopPropagation()}
												className="flex items-center gap-1 sm:gap-2 shrink-0"
											>
												<IconButton
													variant="text"
													color="blue"
													onClick={() =>
														navigateViewCourseStudent(CL)
													}
													placeholder={undefined}
													onPointerEnterCapture={undefined}
													onPointerLeaveCapture={undefined}
												>
													<Eye className="h-4 w-4" />
												</IconButton>
												{isAdmin && (
													<IconButton
														variant="text"
														color="green"
														onClick={() => {
															if (CL.status !== false) {
																navigateCourseStudent(CL);
															}
														}}
														placeholder={undefined}
														onPointerEnterCapture={undefined}
														onPointerLeaveCapture={undefined}
													>
														<Pencil className="h-4 w-4" />
													</IconButton>
												)}
												{isAdmin && (
													<IconButton
														variant={
															CL.status === false ? 'filled' : 'text'
														}
														color={
															CL.status === false ? 'green' : 'red'
														}
														onClick={() =>
															handleToggleStatus(
																CL.id,
																CL.status !== false,
															)
														}
														disabled={togglingId === CL.id}
														placeholder={undefined}
														onPointerEnterCapture={undefined}
														onPointerLeaveCapture={undefined}
													>
														{CL.status === false ? (
															<Check className="h-4 w-4" />
														) : (
															<Trash2 className="h-4 w-4" />
														)}
													</IconButton>
												)}
											</div>
										</ListItem>
									))}
								</List>
							)}

							{totalPages > 1 && (
								<>
									<div className="flex flex-col w-full text-center">
										<small> Total:{totalItems}</small>
									</div>
									<div className="flex w-full justify-center items-center gap-2 sm:gap-4 flex-wrap">
										<Button
											variant="text"
											size="sm"
											className="flex items-center gap-1 sm:gap-2 rounded-full"
											onClick={() => {
												prev();
											}}
											disabled={active === 1}
											placeholder={undefined}
											onPointerEnterCapture={undefined}
											onPointerLeaveCapture={undefined}
										>
											<ChevronLeft
												strokeWidth={2}
												className="h-3 w-3 sm:h-4 sm:w-4"
											/>
											<span className="hidden sm:inline">Prev</span>
										</Button>
										<div className="flex items-center gap-1 sm:gap-2">
											{pages.map((page) => {
												return (
													<IconButton
														key={page.name}
														size="sm"
														{...getItemProps(page.id + 1)}
													>
														{page.id + 1}
													</IconButton>
												);
											})}
										</div>
										<Button
											variant="text"
											size="sm"
											className="flex items-center gap-1 sm:gap-2 rounded-full"
											onClick={() => {
												next();
											}}
											disabled={active === totalPages}
											placeholder={undefined}
											onPointerEnterCapture={undefined}
											onPointerLeaveCapture={undefined}
										>
											<span className="hidden sm:inline">Sig</span>
											<ChevronRight
												strokeWidth={2}
												className="h-3 w-3 sm:h-4 sm:w-4"
											/>
										</Button>
									</div>
								</>
							)}
						</CardBody>
					</Card>
				</div>
			</div>
		</>
	);
};

export default GeneralCourses;
